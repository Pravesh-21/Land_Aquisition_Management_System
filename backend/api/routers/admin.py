import uuid
from typing import List, Optional
from fastapi import APIRouter, Depends, Request, Query, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.dependencies import require_role, require_permission
from api.models.user import User
from api.services.auth_service import AuthService
from api.services.audit_service import AuditService
from api.repositories.user_repository import UserRepository
from api.schemas.auth import UserSummary, AuditLogResponse
from api.schemas.user import (
    AdminCreateUserRequest,
    UpdateUserStatusRequest,
    UpdateUserRolesRequest,
    ResetPasswordRequest,
)

router = APIRouter(prefix="/api/v1/admin", tags=["Administrator Management"])


@router.get("/users", response_model=List[UserSummary], status_code=status.HTTP_200_OK)
def list_users(
    search: Optional[str] = Query(None, description="Search by username, email, or name"),
    role: Optional[str] = Query(None, description="Filter by role name"),
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMIN")),
):
    """List all registered users with filtering (ADMIN only)."""
    users = UserRepository.list_users_filtered(
        db=db,
        search=search,
        role=role,
        is_active=is_active,
        limit=limit,
        offset=offset,
    )
    return [AuthService.create_user_summary(u) for u in users]


@router.post("/users", response_model=UserSummary, status_code=status.HTTP_201_CREATED)
def provision_officer(
    req: AdminCreateUserRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMIN")),
):
    """Provision a new official government officer or administrative user (ADMIN only)."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return AuthService.admin_create_user(
        db=db,
        req=req,
        admin_user=admin_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )


@router.patch("/users/{user_id}/status", response_model=UserSummary, status_code=status.HTTP_200_OK)
def update_user_status(
    user_id: uuid.UUID,
    req: UpdateUserStatusRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMIN")),
):
    """Activate or deactivate a user account (ADMIN only)."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return AuthService.admin_update_status(
        db=db,
        target_user_id=user_id,
        is_active=req.is_active,
        admin_user=admin_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )


@router.patch("/users/{user_id}/roles", response_model=UserSummary, status_code=status.HTTP_200_OK)
def update_user_roles(
    user_id: uuid.UUID,
    req: UpdateUserRolesRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMIN")),
):
    """Assign or modify statutory roles for a user (ADMIN only)."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return AuthService.admin_update_roles(
        db=db,
        target_user_id=user_id,
        role_names=req.roles,
        admin_user=admin_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )


@router.post("/users/{user_id}/reset-password", status_code=status.HTTP_200_OK)
def admin_reset_password(
    user_id: uuid.UUID,
    req: ResetPasswordRequest,
    request: Request,
    db: Session = Depends(get_db),
    admin_user: User = Depends(require_role("ADMIN")),
):
    """Admin-initiated statutory password reset (ADMIN only)."""
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    AuthService.admin_reset_password(
        db=db,
        target_user_id=user_id,
        new_password=req.new_password,
        admin_user=admin_user,
        client_ip=client_ip,
        user_agent=user_agent,
    )
    return {"status": "success", "message": "Password reset successfully. Active sessions revoked."}


@router.get("/audit-logs", response_model=List[AuditLogResponse], status_code=status.HTTP_200_OK)
def list_audit_logs(
    event_type: Optional[str] = Query(None, description="Filter by event type"),
    username: Optional[str] = Query(None, description="Filter by username"),
    limit: int = Query(50, ge=1, le=200),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("AUDIT_VIEW")),
):
    """Retrieve security and authentication audit logs (Requires AUDIT_VIEW permission)."""
    logs = AuditService.list_logs(
        db=db,
        event_type=event_type,
        username=username,
        limit=limit,
        offset=offset,
    )
    return [
        AuditLogResponse(
            id=str(l.id),
            user_id=str(l.user_id) if l.user_id else None,
            username=l.username,
            event_type=l.event_type,
            ip_address=l.ip_address,
            user_agent=l.user_agent,
            details=l.details,
            created_at=l.created_at,
        )
        for l in logs
    ]
