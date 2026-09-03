import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from api.models.user import User
from api.models.role import Role
from api.models.department import Department
from api.repositories.user_repository import UserRepository
from api.services.audit_service import AuditService
from api.core.rate_limiter import check_rate_limit, record_failed_attempt, reset_rate_limit
from api.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
    validate_password_complexity,
)
from api.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserSummary,
    RegisterRequest,
    ChangePasswordRequest,
    SessionResponse,
)
from api.schemas.user import AdminCreateUserRequest


class AuthService:
    @staticmethod
    def authenticate_user(
        db: Session,
        username_or_email: str,
        password: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> User:
        """
        Authenticate user credentials with sliding-window rate limiting,
        constant-time timing mitigation, generic errors, and audit logging.
        """
        identifier = username_or_email.strip().lower()
        rate_key = f"{client_ip or 'direct'}:{identifier}"

        # 1. Check rate limit
        is_limited, retry_after = check_rate_limit(rate_key)
        if is_limited:
            AuditService.log(
                db=db,
                event_type="LOGIN_FAILURE",
                username=identifier,
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Rate limit exceeded. Blocked for {retry_after}s.",
            )
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many failed login attempts. Please try again after {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)},
            )

        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        # 2. Look up user
        user = UserRepository.get_by_username_or_email(db, identifier)
        if not user:
            record_failed_attempt(rate_key)
            verify_password("dummy_password", "$argon2id$v=19$m=65536,t=2,p=1$dummy$dummy")
            AuditService.log(
                db=db,
                event_type="LOGIN_FAILURE",
                username=identifier,
                ip_address=client_ip,
                user_agent=user_agent,
                details="Unknown username/email",
            )
            raise generic_error

        if not user.is_active:
            record_failed_attempt(rate_key)
            AuditService.log(
                db=db,
                event_type="LOGIN_FAILURE",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details="Account is inactive/deactivated",
            )
            raise generic_error

        # 3. Verify password
        if not verify_password(password, user.password_hash):
            record_failed_attempt(rate_key)
            AuditService.log(
                db=db,
                event_type="LOGIN_FAILURE",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details="Incorrect password",
            )
            raise generic_error

        # 4. Success -> Reset rate limit and update last login
        reset_rate_limit(rate_key)
        UserRepository.update_last_login(db, user)

        AuditService.log(
            db=db,
            event_type="LOGIN_SUCCESS",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Successful login as {', '.join(user.role_names)}",
        )
        return user

    @staticmethod
    def create_user_summary(user: User) -> UserSummary:
        return UserSummary(
            id=str(user.id),
            username=user.username,
            full_name=user.full_name,
            email=user.email,
            phone=user.phone,
            is_active=user.is_active,
            is_verified=user.is_verified,
            roles=user.role_names,
            permissions=user.permission_names,
            departments=[d.code for d in user.departments],
        )

    @classmethod
    def login(
        cls,
        db: Session,
        req: LoginRequest,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        user = cls.authenticate_user(
            db=db,
            username_or_email=req.username,
            password=req.password,
            client_ip=client_ip,
            user_agent=user_agent,
        )

        access_token, expires_in = create_access_token(user.id)
        raw_refresh, token_hash, expires_at = create_refresh_token()

        UserRepository.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            token_type="bearer",
            expires_in=expires_in,
            user=cls.create_user_summary(user),
        )

    @classmethod
    def refresh(
        cls,
        db: Session,
        raw_token: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        token_hash = hash_token(raw_token)
        record = UserRepository.get_refresh_token_by_hash(db, token_hash)

        generic_refresh_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )

        if not record:
            raise generic_refresh_error

        # Security: Detect token reuse
        if record.revoked_at is not None:
            # Revoked token reuse detected! Invalidate entire session family for this user
            UserRepository.revoke_all_user_tokens(db, record.user_id)
            AuditService.log(
                db=db,
                event_type="TOKEN_REUSE_DETECTED",
                username="security_alarm",
                user_id=record.user_id,
                ip_address=client_ip,
                user_agent=user_agent,
                details="Revoked refresh token reuse detected. All sessions invalidated.",
            )
            raise generic_refresh_error

        # Check expiration
        now = datetime.now(timezone.utc)
        if record.expires_at <= now:
            UserRepository.revoke_refresh_token(db, record)
            raise generic_refresh_error

        user = UserRepository.get_by_id(db, record.user_id)
        if not user or not user.is_active:
            raise generic_refresh_error

        # 1. Revoke the used refresh token
        UserRepository.revoke_refresh_token(db, record)

        # 2. Issue rotated refresh token
        new_raw_refresh, new_token_hash, new_expires_at = create_refresh_token()
        UserRepository.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=new_token_hash,
            expires_at=new_expires_at,
        )

        # 3. Issue new access token
        access_token, expires_in = create_access_token(user.id)

        AuditService.log(
            db=db,
            event_type="TOKEN_REFRESH",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details="Refreshed session with token rotation",
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_raw_refresh,
            token_type="bearer",
            expires_in=expires_in,
            user=cls.create_user_summary(user),
        )

    @staticmethod
    def logout(
        db: Session,
        raw_token: Optional[str],
        user: Optional[User] = None,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> bool:
        if raw_token:
            token_hash = hash_token(raw_token)
            record = UserRepository.get_refresh_token_by_hash(db, token_hash)
            if record and record.revoked_at is None:
                UserRepository.revoke_refresh_token(db, record)
        if user:
            AuditService.log(
                db=db,
                event_type="LOGOUT",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details="Logged out successfully",
            )
        return True

    @classmethod
    def register_citizen(
        cls,
        db: Session,
        req: RegisterRequest,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> TokenResponse:
        # Restriction 1: Public registration CANNOT self-assign authority roles
        if req.role and req.role.upper().strip() != "CITIZEN":
            AuditService.log(
                db=db,
                event_type="REGISTRATION_BLOCKED",
                username=req.email,
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Unauthorized attempt to register role: {req.role}",
            )
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Public registration is strictly restricted to Citizens/Landowners. Government authorities must be provisioned by System Administration.",
            )

        # Restriction 2: Password complexity
        is_valid_pwd, pwd_error = validate_password_complexity(req.password)
        if not is_valid_pwd:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=pwd_error,
            )

        clean_email = req.email.strip().lower()
        existing = UserRepository.get_by_username_or_email(db, clean_email)
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with email '{clean_email}' already exists.",
            )

        citizen_role = UserRepository.get_role_by_name(db, "CITIZEN")
        roles = [citizen_role] if citizen_role else []

        citizen_dept = UserRepository.get_department_by_code(db, "CITIZEN")
        depts = [citizen_dept] if citizen_dept else []

        hashed_pwd = hash_password(req.password)
        username = clean_email.split("@")[0]

        if UserRepository.get_by_username_or_email(db, username):
            username = f"{username}_{int(datetime.now().timestamp())}"

        user = UserRepository.create_user(
            db=db,
            username=username,
            email=clean_email,
            password_hash=hashed_pwd,
            full_name=req.name.strip(),
            phone=req.phone,
            roles=roles,
            departments=depts,
            is_active=True,
            is_verified=False,
        )

        AuditService.log(
            db=db,
            event_type="USER_REGISTERED",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"New citizen registered: {user.full_name}",
        )

        access_token, expires_in = create_access_token(user.id)
        raw_refresh, token_hash, expires_at = create_refresh_token()

        UserRepository.create_refresh_token(
            db=db,
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )

        return TokenResponse(
            access_token=access_token,
            refresh_token=raw_refresh,
            token_type="bearer",
            expires_in=expires_in,
            user=cls.create_user_summary(user),
        )

    @classmethod
    def change_password(
        cls,
        db: Session,
        user: User,
        req: ChangePasswordRequest,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Allow user to change their password, enforcing complexity and revoking other sessions."""
        if req.new_password != req.confirm_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password and confirmation do not match.",
            )

        if not verify_password(req.old_password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Current password is incorrect.",
            )

        if req.old_password == req.new_password:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="New password must be different from current password.",
            )

        is_valid_pwd, pwd_error = validate_password_complexity(req.new_password)
        if not is_valid_pwd:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=pwd_error,
            )

        new_hash = hash_password(req.new_password)
        UserRepository.update_user_password(db, user, new_hash)

        # Invalidate all active sessions across devices
        revoked_count = UserRepository.revoke_all_user_tokens(db, user.id)

        AuditService.log(
            db=db,
            event_type="PASSWORD_CHANGE",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Password changed. {revoked_count} active sessions revoked.",
        )

    @classmethod
    def get_user_sessions(
        cls,
        db: Session,
        user: User,
        current_token: Optional[str] = None,
    ) -> List[SessionResponse]:
        """List active and historical sessions for this user."""
        records = UserRepository.get_user_sessions(db, user.id)
        current_hash = hash_token(current_token) if current_token else None

        result = []
        for r in records:
            result.append(
                SessionResponse(
                    id=str(r.id),
                    created_at=r.created_at,
                    expires_at=r.expires_at,
                    is_current=(current_hash is not None and r.token_hash == current_hash),
                    is_active=r.is_active,
                )
            )
        return result

    @classmethod
    def revoke_session(
        cls,
        db: Session,
        user: User,
        session_id: uuid.UUID,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        """Revoke a specific session for this user."""
        record = UserRepository.get_refresh_token_by_id(db, session_id)
        if not record or record.user_id != user.id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Session not found or does not belong to your account.",
            )

        if record.revoked_at is None:
            UserRepository.revoke_refresh_token(db, record)
            AuditService.log(
                db=db,
                event_type="SESSION_REVOKED",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Session {session_id} manually revoked.",
            )

    @classmethod
    def revoke_all_sessions(
        cls,
        db: Session,
        user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> int:
        """Revoke all sessions for this user."""
        count = UserRepository.revoke_all_user_tokens(db, user.id)
        AuditService.log(
            db=db,
            event_type="SESSION_REVOKED",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"All {count} sessions revoked by user.",
        )
        return count

    # --- Administrator User Management Methods ---
    @classmethod
    def admin_create_user(
        cls,
        db: Session,
        req: AdminCreateUserRequest,
        admin_user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSummary:
        is_valid_pwd, pwd_error = validate_password_complexity(req.password)
        if not is_valid_pwd:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=pwd_error,
            )

        clean_username = req.username.strip().lower()
        clean_email = req.email.strip().lower()

        if UserRepository.get_by_username_or_email(db, clean_username) or UserRepository.get_by_username_or_email(db, clean_email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"User with username '{clean_username}' or email '{clean_email}' already exists.",
            )

        role = UserRepository.get_role_by_name(db, req.role)
        if not role:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid role '{req.role}'. Must be one of ADMIN, AGENCY, LAO, FOREST, COLLECTOR, TEHSILDAR, CITIZEN.",
            )

        dept = UserRepository.get_department_by_code(db, req.department_code)
        departments = [dept] if dept else []

        new_user = UserRepository.create_user(
            db=db,
            username=clean_username,
            email=clean_email,
            password_hash=hash_password(req.password),
            full_name=req.full_name.strip(),
            phone=req.phone,
            roles=[role],
            departments=departments,
            is_active=True,
            is_verified=True,
        )

        AuditService.log(
            db=db,
            event_type="OFFICER_PROVISIONED",
            username=new_user.username,
            user_id=new_user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Officer provisioned by admin {admin_user.username} with role {role.name}",
        )

        return cls.create_user_summary(new_user)

    @classmethod
    def admin_update_status(
        cls,
        db: Session,
        target_user_id: uuid.UUID,
        is_active: bool,
        admin_user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSummary:
        target = UserRepository.get_by_id(db, target_user_id)
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        UserRepository.update_user_status(db, target, is_active)

        if not is_active:
            # Revoke active sessions when deactivated
            UserRepository.revoke_all_user_tokens(db, target.id)

        AuditService.log(
            db=db,
            event_type="USER_STATUS_CHANGED",
            username=target.username,
            user_id=target.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Status set to {'Active' if is_active else 'Deactivated'} by {admin_user.username}",
        )

        return cls.create_user_summary(target)

    @classmethod
    def admin_update_roles(
        cls,
        db: Session,
        target_user_id: uuid.UUID,
        role_names: List[str],
        admin_user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> UserSummary:
        target = UserRepository.get_by_id(db, target_user_id)
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        role_objs: List[Role] = []
        for rname in role_names:
            r = UserRepository.get_role_by_name(db, rname)
            if r:
                role_objs.append(r)

        if not role_objs:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="At least one valid role must be assigned.")

        UserRepository.update_user_roles(db, target, role_objs)

        AuditService.log(
            db=db,
            event_type="ROLE_CHANGED",
            username=target.username,
            user_id=target.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Roles updated to {[r.name for r in role_objs]} by {admin_user.username}",
        )

        return cls.create_user_summary(target)

    @classmethod
    def admin_reset_password(
        cls,
        db: Session,
        target_user_id: uuid.UUID,
        new_password: str,
        admin_user: User,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> None:
        target = UserRepository.get_by_id(db, target_user_id)
        if not target:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")

        is_valid_pwd, pwd_error = validate_password_complexity(new_password)
        if not is_valid_pwd:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=pwd_error,
            )

        new_hash = hash_password(new_password)
        UserRepository.update_user_password(db, target, new_hash)
        UserRepository.revoke_all_user_tokens(db, target.id)

        AuditService.log(
            db=db,
            event_type="ADMIN_PASSWORD_RESET",
            username=target.username,
            user_id=target.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Password reset by admin {admin_user.username}",
        )
