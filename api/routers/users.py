from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.dependencies import get_current_user, require_role
from api.models.user import User
from api.schemas.auth import UserSummary
from api.services.auth_service import AuthService

router = APIRouter(prefix="/api/v1/users", tags=["Users Management"])


@router.get("", response_model=List[UserSummary])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_role("ADMIN")),
):
    """List all registered users in the database (ADMIN role only)."""
    users = db.query(User).all()
    return [AuthService.create_user_summary(u) for u in users]
