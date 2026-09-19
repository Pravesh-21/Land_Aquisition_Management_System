from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Plaintext password")


class RefreshTokenRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="Active raw refresh token (or provided via HttpOnly cookie)")


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="Active raw refresh token to revoke (or provided via HttpOnly cookie)")


class ChangePasswordRequest(BaseModel):
    old_password: str = Field(..., description="Current plaintext password")
    new_password: str = Field(..., description="New password meeting statutory complexity standards")
    confirm_password: str = Field(..., description="Confirmation of new password")


class SessionResponse(BaseModel):
    id: str
    created_at: datetime
    expires_at: datetime
    is_current: bool = False
    is_active: bool = True

    class Config:
        from_attributes = True


class AuditLogResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    username: str
    event_type: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentSummary(BaseModel):
    id: str
    code: str
    name: str

    class Config:
        from_attributes = True


class UserSummary(BaseModel):
    id: str
    username: str
    full_name: str
    email: str
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    roles: List[str]
    permissions: List[str]
    departments: List[str]

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserSummary


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = Field(None, description="Only 'CITIZEN' allowed in public registration; authorities rejected")
    phone: Optional[str] = None
    aadhaar_or_id: Optional[str] = None
    district: Optional[str] = None
