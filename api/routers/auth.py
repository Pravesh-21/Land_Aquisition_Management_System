import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.config import settings
from api.core.dependencies import get_current_user
from api.models.user import User
from api.services.auth_service import AuthService
from api.schemas.auth import (
    LoginRequest,
    RefreshTokenRequest,
    LogoutRequest,
    TokenResponse,
    UserSummary,
    RegisterRequest,
    ChangePasswordRequest,
    SessionResponse,
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Session"])


def _set_auth_cookies(response: Response, refresh_token: str) -> None:
    """Set secure, HttpOnly SameSite cookie for the refresh token."""
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
        path="/api/v1/auth",
    )


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(req: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)):
    """
    Authenticate user credentials against PostgreSQL, update last login,
    generate JWT access token and store hashed rotating refresh token.
    Sets secure HttpOnly cookie for refresh token while returning tokens in payload.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    token_data = AuthService.login(
        db=db,
        req=req,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    _set_auth_cookies(response, token_data.refresh_token)
    return token_data


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def refresh_token(
    req: RefreshTokenRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Exchange an active refresh token for a new access token and rotated refresh token.
    Accepts token from JSON payload OR HttpOnly cookie.
    Detects token reuse and invalidates compromised sessions.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    token_str = req.refresh_token or request.cookies.get("refresh_token")
    if not token_str:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token required in request body or cookie",
            headers={"WWW-Authenticate": "Bearer"},
        )

    token_data = AuthService.refresh(
        db=db,
        raw_token=token_str,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    _set_auth_cookies(response, token_data.refresh_token)
    return token_data


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(
    req: LogoutRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(lambda: None),  # Optional user context
):
    """
    Revoke the active refresh token in PostgreSQL and clear the HttpOnly cookie.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    token_str = req.refresh_token or request.cookies.get("refresh_token")
    AuthService.logout(
        db=db,
        raw_token=token_str,
        user=current_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"status": "success", "message": "Logged out and session revoked successfully."}


@router.get("/me", response_model=UserSummary, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user profile, assigned roles, permissions, and departments.
    Requires Bearer JWT in Authorization header.
    """
    return AuthService.create_user_summary(current_user)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(
    req: RegisterRequest,
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
):
    """
    Public registration endpoint strictly restricted to citizens and landowners.
    Attempts to assign authority roles are rejected with 403 Forbidden.
    Enforces password complexity.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    token_data = AuthService.register_citizen(
        db=db,
        req=req,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    _set_auth_cookies(response, token_data.refresh_token)
    return token_data


# --- Password Management ---
@router.post("/change-password", status_code=status.HTTP_200_OK)
def change_password(
    req: ChangePasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Change user password after verifying current password and statutory complexity.
    Automatically invalidates all other active sessions across devices.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuthService.change_password(
        db=db,
        user=current_user,
        req=req,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return {"status": "success", "message": "Password updated successfully. All other sessions have been revoked."}


# --- Session Management ---
@router.get("/sessions", response_model=List[SessionResponse], status_code=status.HTTP_200_OK)
def list_sessions(
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """List all active and recent sessions for the authenticated user."""
    cookie_token = request.cookies.get("refresh_token")
    return AuthService.get_user_sessions(db, current_user, current_token=cookie_token)


@router.delete("/sessions/{session_id}", status_code=status.HTTP_200_OK)
def revoke_session(
    session_id: uuid.UUID,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke a specific active session."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuthService.revoke_session(
        db=db,
        user=current_user,
        session_id=session_id,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return {"status": "success", "message": f"Session {session_id} revoked."}


@router.post("/revoke-all-sessions", status_code=status.HTTP_200_OK)
def revoke_all_sessions(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Revoke all active sessions for the current user."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    count = AuthService.revoke_all_sessions(
        db=db,
        user=current_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    response.delete_cookie(key="refresh_token", path="/api/v1/auth")
    return {"status": "success", "message": f"All {count} active sessions revoked.", "revoked_count": count}
