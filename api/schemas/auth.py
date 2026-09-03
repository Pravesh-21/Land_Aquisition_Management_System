from typing import List, Optional
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    username: str = Field(..., description="Username or email address")
    password: str = Field(..., description="Plaintext password")


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Active raw refresh token")


class LogoutRequest(BaseModel):
    refresh_token: Optional[str] = Field(None, description="Active raw refresh token to revoke")


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
    phone: Optional[str] = None
    aadhaar_or_id: Optional[str] = None
    district: Optional[str] = None
