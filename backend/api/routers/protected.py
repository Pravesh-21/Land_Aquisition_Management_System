from fastapi import APIRouter, Depends
from api.core.dependencies import (
    get_current_user,
    require_role,
    require_permission,
    require_verified_citizen,
)
from api.models.user import User

router = APIRouter(prefix="/api/v1/protected", tags=["Protected Verification Endpoints"])


@router.get("/test")
def test_authenticated_access(current_user: User = Depends(get_current_user)):
    """Requires valid JWT authentication."""
    return {
        "status": "success",
        "message": f"Hello {current_user.full_name}, your authentication is verified.",
        "user_id": str(current_user.id),
        "roles": current_user.role_names,
    }


@router.get("/project-view")
def test_project_view(current_user: User = Depends(require_permission("PROJECT_VIEW"))):
    """Requires PROJECT_VIEW permission."""
    return {
        "status": "success",
        "message": "Authorized for PROJECT_VIEW",
        "user": current_user.username,
    }


@router.post("/project-create")
def test_project_create(current_user: User = Depends(require_permission("PROJECT_CREATE"))):
    """Requires PROJECT_CREATE permission."""
    return {
        "status": "success",
        "message": "Authorized for PROJECT_CREATE",
        "user": current_user.username,
    }


@router.get("/project-approve")
def test_project_approve(current_user: User = Depends(require_permission("PROJECT_APPROVE"))):
    """Requires PROJECT_APPROVE permission."""
    return {
        "status": "success",
        "message": "Authorized for PROJECT_APPROVE",
        "user": current_user.username,
    }


@router.get("/audit")
def test_audit_access(current_user: User = Depends(require_permission("AUDIT_VIEW"))):
    """Requires AUDIT_VIEW permission."""
    return {
        "status": "success",
        "message": "Authorized for AUDIT_VIEW",
        "user": current_user.username,
    }


@router.get("/citizen-access")
def test_citizen_access(current_user: User = Depends(require_verified_citizen)):
    """Requires verified citizen account."""
    return {
        "status": "success",
        "message": "Verified citizen access granted.",
        "user": current_user.username,
        "is_verified": current_user.is_verified,
    }
