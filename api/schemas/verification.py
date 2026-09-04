from typing import Optional, Literal
from pydantic import BaseModel, Field
from api.schemas.auth import UserSummary


class SendOtpRequest(BaseModel):
    channel: Literal["EMAIL", "WHATSAPP"] = Field(..., description="Verification channel: EMAIL or WHATSAPP")


class VerifyOtpRequest(BaseModel):
    channel: Literal["EMAIL", "WHATSAPP"] = Field(..., description="Verification channel: EMAIL or WHATSAPP")
    otp: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")


class ResendOtpRequest(BaseModel):
    channel: Literal["EMAIL", "WHATSAPP"] = Field(..., description="Verification channel: EMAIL or WHATSAPP")


class SendOtpResponse(BaseModel):
    status: str = "success"
    channel: str
    masked_destination: str
    cooldown_seconds: int = 60
    message: str


class VerifyOtpResponse(BaseModel):
    status: str = "success"
    message: str
    user: UserSummary


class VerificationStatusResponse(BaseModel):
    is_verified: bool
    email: Optional[str] = None
    masked_email: Optional[str] = None
    phone: Optional[str] = None
    masked_phone: Optional[str] = None
    active_channel: Optional[str] = None
    has_active_code: bool = False
    cooldown_remaining: int = 0
