from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr


class PermissionRead(BaseModel):
    id: str
    name: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class RoleRead(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    permissions: List[PermissionRead] = []

    class Config:
        from_attributes = True


class DepartmentRead(BaseModel):
    id: str
    name: str
    code: str
    description: Optional[str] = None

    class Config:
        from_attributes = True


class UserRead(BaseModel):
    id: str
    username: str
    email: EmailStr
    full_name: str
    phone: Optional[str] = None
    is_active: bool
    is_verified: bool
    last_login_at: Optional[datetime] = None
    created_at: datetime
    roles: List[RoleRead] = []
    departments: List[DepartmentRead] = []

    class Config:
        from_attributes = True


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role_names: List[str] = ["CITIZEN"]
    department_codes: List[str] = ["CITIZEN"]


class AdminCreateUserRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    full_name: str
    phone: Optional[str] = None
    role: str = "AGENCY"  # AGENCY, LAO, FOREST, COLLECTOR, TEHSILDAR, CITIZEN, ADMIN
    department_code: str = "NHAI"  # SYSTEM_ADMIN, NHAI, LAND_ACQUISITION, etc.


class UpdateUserStatusRequest(BaseModel):
    is_active: bool


class UpdateUserRolesRequest(BaseModel):
    roles: List[str]


class ResetPasswordRequest(BaseModel):
    new_password: str
