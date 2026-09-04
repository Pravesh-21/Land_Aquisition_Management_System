from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session
from api.core.database import get_db
from api.core.dependencies import get_current_user
from api.models.user import User
from api.services.verification_service import VerificationService
from api.schemas.verification import (
    SendOtpRequest,
    SendOtpResponse,
    VerifyOtpRequest,
    VerifyOtpResponse,
    ResendOtpRequest,
    VerificationStatusResponse,
)

router = APIRouter(prefix="/api/v1/auth/verification", tags=["Citizen Account Verification"])


@router.post("/send", response_model=SendOtpResponse, status_code=status.HTTP_200_OK)
def send_verification_otp(
    req: SendOtpRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Generate and dispatch a 6-digit statutory OTP to the authenticated citizen's registered email or WhatsApp.
    Destination is determined strictly from the citizen's account (prevents arbitrary destination injection).
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return VerificationService.send_otp(
        db=db,
        user=current_user,
        channel=req.channel,
        client_ip=client_ip,
        user_agent=user_agent,
    )


@router.post("/verify", response_model=VerifyOtpResponse, status_code=status.HTTP_200_OK)
def verify_otp(
    req: VerifyOtpRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Validate the submitted 6-digit OTP against the hashed record.
    Marks citizen account as verified (is_verified = True) and invalidates all active OTPs.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return VerificationService.verify_otp(
        db=db,
        user=current_user,
        channel=req.channel,
        otp=req.otp,
        client_ip=client_ip,
        user_agent=user_agent,
    )


@router.post("/resend", response_model=SendOtpResponse, status_code=status.HTTP_200_OK)
def resend_otp(
    req: ResendOtpRequest,
    request: Request,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Resend statutory OTP after verifying that the resend cooldown (60s) has elapsed.
    Invalidates previous OTP and issues a fresh 6-digit code.
    """
    client_ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    return VerificationService.send_otp(
        db=db,
        user=current_user,
        channel=req.channel,
        client_ip=client_ip,
        user_agent=user_agent,
        is_resend=True,
    )


@router.get("/status", response_model=VerificationStatusResponse, status_code=status.HTTP_200_OK)
def get_verification_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Check current verification status, masked contact information, and active cooldown.
    """
    return VerificationService.get_status(db=db, user=current_user)
