from datetime import datetime, timezone
from typing import Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from api.models.user import User
from api.repositories.user_repository import UserRepository
from api.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    hash_token,
)
from api.schemas.auth import (
    LoginRequest,
    TokenResponse,
    UserSummary,
    RegisterRequest,
)


class AuthService:
    @staticmethod
    def authenticate_user(db: Session, username_or_email: str, password: str) -> User:
        """
        Authenticate user with constant-time/generic error reporting.
        Never reveals whether the username exists or password was wrong.
        """
        generic_error = HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

        user = UserRepository.get_by_username_or_email(db, username_or_email)
        if not user:
            # Run dummy verification to mitigate timing attacks
            verify_password("dummy_password", "$argon2id$v=19$m=65536,t=2,p=1$dummy$dummy")
            raise generic_error

        if not user.is_active:
            raise generic_error

        if not verify_password(password, user.password_hash):
            raise generic_error

        # Update last login timestamp
        UserRepository.update_last_login(db, user)
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
    def login(cls, db: Session, req: LoginRequest) -> TokenResponse:
        user = cls.authenticate_user(db, req.username, req.password)

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
    def refresh(cls, db: Session, raw_token: str) -> TokenResponse:
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

        return TokenResponse(
            access_token=access_token,
            refresh_token=new_raw_refresh,
            token_type="bearer",
            expires_in=expires_in,
            user=cls.create_user_summary(user),
        )

    @staticmethod
    def logout(db: Session, raw_token: Optional[str]) -> bool:
        if raw_token:
            token_hash = hash_token(raw_token)
            record = UserRepository.get_refresh_token_by_hash(db, token_hash)
            if record and record.revoked_at is None:
                UserRepository.revoke_refresh_token(db, record)
        return True

    @classmethod
    def register_citizen(cls, db: Session, req: RegisterRequest) -> TokenResponse:
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

        # Check if username exists, if so append unique suffix
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
