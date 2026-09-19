import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import or_, select
from api.models.user import User
from api.models.role import Role
from api.models.permission import Permission
from api.models.department import Department
from api.models.refresh_token import RefreshToken


class UserRepository:
    @staticmethod
    def get_by_id(db: Session, user_id: uuid.UUID) -> Optional[User]:
        return db.query(User).filter(User.id == user_id).first()

    @staticmethod
    def get_by_username_or_email(db: Session, identifier: str) -> Optional[User]:
        clean_id = identifier.strip().lower()
        return db.query(User).filter(
            or_(
                User.username.ilike(clean_id),
                User.email.ilike(clean_id),
            )
        ).first()

    @staticmethod
    def update_last_login(db: Session, user: User) -> None:
        user.last_login_at = datetime.now(timezone.utc)
        db.add(user)
        db.commit()
        db.refresh(user)

    @staticmethod
    def create_user(
        db: Session,
        username: str,
        email: str,
        password_hash: str,
        full_name: str,
        phone: Optional[str] = None,
        roles: Optional[List[Role]] = None,
        departments: Optional[List[Department]] = None,
        is_active: bool = True,
        is_verified: bool = False,
    ) -> User:
        user = User(
            id=uuid.uuid4(),
            username=username.strip().lower(),
            email=email.strip().lower(),
            password_hash=password_hash,
            full_name=full_name.strip(),
            phone=phone.strip() if phone else None,
            is_active=is_active,
            is_verified=is_verified,
            roles=roles or [],
            departments=departments or [],
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def get_role_by_name(db: Session, name: str) -> Optional[Role]:
        return db.query(Role).filter(Role.name == name.upper().strip()).first()

    @staticmethod
    def get_permission_by_name(db: Session, name: str) -> Optional[Permission]:
        return db.query(Permission).filter(Permission.name == name.upper().strip()).first()

    @staticmethod
    def get_department_by_code(db: Session, code: str) -> Optional[Department]:
        return db.query(Department).filter(Department.code == code.upper().strip()).first()

    # --- Refresh Token Queries ---
    @staticmethod
    def create_refresh_token(
        db: Session,
        user_id: uuid.UUID,
        token_hash: str,
        expires_at: datetime,
    ) -> RefreshToken:
        refresh_token = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token_hash=token_hash,
            expires_at=expires_at,
            created_at=datetime.now(timezone.utc),
            revoked_at=None,
        )
        db.add(refresh_token)
        db.commit()
        db.refresh(refresh_token)
        return refresh_token

    @staticmethod
    def get_refresh_token_by_hash(db: Session, token_hash: str) -> Optional[RefreshToken]:
        return db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    @staticmethod
    def revoke_refresh_token(db: Session, refresh_token: RefreshToken) -> None:
        refresh_token.revoked_at = datetime.now(timezone.utc)
        db.add(refresh_token)
        db.commit()

    @staticmethod
    def revoke_all_user_tokens(db: Session, user_id: uuid.UUID) -> int:
        tokens = db.query(RefreshToken).filter(
            RefreshToken.user_id == user_id,
            RefreshToken.revoked_at.is_(None),
        ).all()
        now = datetime.now(timezone.utc)
        for t in tokens:
            t.revoked_at = now
            db.add(t)
        db.commit()
        return len(tokens)

    @staticmethod
    def get_refresh_token_by_id(db: Session, session_id: uuid.UUID) -> Optional[RefreshToken]:
        return db.query(RefreshToken).filter(RefreshToken.id == session_id).first()

    @staticmethod
    def get_user_sessions(db: Session, user_id: uuid.UUID) -> List[RefreshToken]:
        return (
            db.query(RefreshToken)
            .filter(RefreshToken.user_id == user_id)
            .order_by(RefreshToken.created_at.desc())
            .all()
        )

    @staticmethod
    def update_user_status(db: Session, user: User, is_active: bool) -> User:
        user.is_active = is_active
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user_roles(db: Session, user: User, roles: List[Role]) -> User:
        user.roles = roles
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def update_user_password(db: Session, user: User, password_hash: str) -> User:
        user.password_hash = password_hash
        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    def list_users_filtered(
        db: Session,
        search: Optional[str] = None,
        role: Optional[str] = None,
        is_active: Optional[bool] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[User]:
        query = db.query(User).order_by(User.created_at.desc())
        if search:
            s = f"%{search.strip().lower()}%"
            query = query.filter(or_(User.username.ilike(s), User.email.ilike(s), User.full_name.ilike(s)))
        if is_active is not None:
            query = query.filter(User.is_active == is_active)
        if role:
            query = query.join(User.roles).filter(Role.name == role.upper().strip())
        return query.offset(offset).limit(limit).all()
