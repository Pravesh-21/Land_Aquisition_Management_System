import uuid
from typing import List, Callable
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.security import decode_access_token
from api.models.user import User
from api.repositories.user_repository import UserRepository

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/v1/auth/login",
    auto_error=False,
)


def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> User:
    """Validate Bearer access token and return the current active User entity."""
    unauthorized_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    if not token:
        raise unauthorized_exception

    payload = decode_access_token(token)
    if not payload:
        raise unauthorized_exception

    user_id_str = payload.get("sub")
    if not user_id_str:
        raise unauthorized_exception

    try:
        user_id = uuid.UUID(user_id_str)
    except ValueError:
        raise unauthorized_exception

    user = UserRepository.get_by_id(db, user_id)
    if not user or not user.is_active:
        raise unauthorized_exception

    return user


def require_role(*allowed_roles: str) -> Callable:
    """
    Reusable FastAPI dependency ensuring the current user possesses at least one of the allowed roles.
    Raises 403 Forbidden if not satisfied.
    """
    roles_upper = [r.upper().strip() for r in allowed_roles]

    def role_checker(current_user: User = Depends(get_current_user)) -> User:
        user_roles = [r.upper() for r in current_user.role_names]
        if not any(r in roles_upper for r in user_roles):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: requires one of roles {roles_upper}",
            )
        return current_user

    return role_checker


def require_permission(*required_permissions: str) -> Callable:
    """
    Reusable FastAPI dependency ensuring the current user possesses ALL required statutory permissions.
    Raises 403 Forbidden if not satisfied.
    """
    perms_upper = [p.upper().strip() for p in required_permissions]

    def permission_checker(current_user: User = Depends(get_current_user)) -> User:
        user_perms = [p.upper() for p in current_user.permission_names]
        missing = [p for p in perms_upper if p not in user_perms]
        if missing:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access forbidden: missing required permission(s) {missing}",
            )
        return current_user

    return permission_checker
