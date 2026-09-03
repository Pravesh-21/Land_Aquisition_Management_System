from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from api.core.database import get_db
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
)

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication & Session"])


@router.post("/login", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user credentials against PostgreSQL, update last login,
    generate JWT access token and store hashed rotating refresh token.
    """
    return AuthService.login(db, req)


@router.post("/refresh", response_model=TokenResponse, status_code=status.HTTP_200_OK)
def refresh_token(req: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Exchange an active refresh token for a new access token and a newly rotated refresh token.
    Detects token reuse and invalidates compromised sessions.
    """
    return AuthService.refresh(db, req.refresh_token)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout(req: LogoutRequest, db: Session = Depends(get_db)):
    """
    Revoke the active refresh token in PostgreSQL to terminate the session.
    """
    AuthService.logout(db, req.refresh_token)
    return {"status": "success", "message": "Logged out and session revoked successfully."}


@router.get("/me", response_model=UserSummary, status_code=status.HTTP_200_OK)
def get_me(current_user: User = Depends(get_current_user)):
    """
    Retrieve authenticated user profile, assigned roles, permissions, and departments.
    Requires Bearer JWT in Authorization header.
    """
    return AuthService.create_user_summary(current_user)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register_citizen(req: RegisterRequest, db: Session = Depends(get_db)):
    """
    Public registration endpoint for citizens and landowners.
    Creates user with Argon2id hash and assigns CITIZEN role.
    """
    return AuthService.register_citizen(db, req)
