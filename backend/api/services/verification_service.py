import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from api.core.config import settings
from api.models.user import User
from api.models.verification_code import VerificationCode
from api.repositories.verification_repository import VerificationRepository
from api.providers import get_verification_provider
from api.services.audit_service import AuditService
from api.services.auth_service import AuthService
from api.schemas.verification import (
    SendOtpResponse,
    VerifyOtpResponse,
    VerificationStatusResponse,
)


class VerificationService:
    @staticmethod
    def generate_secure_otp() -> str:
        """Generate a cryptographically secure 6-digit random numeric code (100000 - 999999)."""
        return f"{secrets.randbelow(900000) + 100000}"

    @staticmethod
    def hash_otp(otp: str) -> str:
        """Securely hash the 6-digit OTP using SHA-256 with a dedicated secret salt."""
        salted = f"{settings.OTP_SECRET_SALT}:{otp.strip()}"
        return hashlib.sha256(salted.encode("utf-8")).hexdigest()

    @staticmethod
    def mask_destination(destination: str, channel: str) -> str:
        """Mask recipient email or phone for generic, privacy-preserving frontend display."""
        dest = destination.strip()
        ch = channel.upper()

        if ch == "EMAIL" or "@" in dest:
            parts = dest.split("@")
            local = parts[0]
            domain = parts[1] if len(parts) > 1 else ""
            if len(local) <= 2:
                masked_local = f"{local[0]}*" if local else "*"
            else:
                masked_local = f"{local[0]}{'*' * (min(len(local) - 2, 6))}{local[-1]}"
            return f"{masked_local}@{domain}"
        else:
            # Phone / WhatsApp
            digits = "".join(c for c in dest if c.isdigit())
            if len(digits) >= 10:
                last_four = digits[-4:]
                prefix = digits[:-4]
                masked_prefix = f"+{digits[:2]} " if len(digits) > 10 else "+91 "
                return f"{masked_prefix}******{last_four}"
            return "******" + dest[-2:] if len(dest) > 2 else "******"

    @classmethod
    def send_otp(
        cls,
        db: Session,
        user: User,
        channel: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
        is_resend: bool = False,
    ) -> SendOtpResponse:
        """
        Generate, hash, store, and dispatch a 6-digit verification code.
        Enforces cooldown, single-use, 5-minute expiry, and provider error reporting.
        """
        ch = channel.upper().strip()
        if ch not in ["EMAIL", "WHATSAPP"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid channel. Must be EMAIL or WHATSAPP.",
            )

        # Ensure only Citizen accounts use public self-verification flow
        if not user.has_role("CITIZEN") and not user.has_role("ADMIN"):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Public verification flow is restricted to Citizen accounts.",
            )

        if user.is_verified:
            return SendOtpResponse(
                status="success",
                channel=ch,
                masked_destination=cls.mask_destination(user.email, "EMAIL"),
                cooldown_seconds=0,
                message="Account is already verified.",
            )

        # Determine destination
        if ch == "EMAIL":
            destination = user.email
            if not destination:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No email associated with account.")
        else:
            destination = user.phone
            if not destination:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No phone/WhatsApp number registered for this citizen. Please provide a phone number or verify via Email.",
                )

        now = datetime.now(timezone.utc)

        # Check resend cooldown
        latest = VerificationRepository.get_latest_code(db, user.id, ch)
        if latest:
            elapsed = (now - latest.created_at).total_seconds()
            if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
                remaining = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Please wait {remaining} seconds before requesting a new verification code.",
                    headers={"Retry-After": str(remaining)},
                )

        # Invalidate previous unverified codes for this user
        VerificationRepository.invalidate_user_codes(db, user.id)

        # Generate secure random OTP and calculate hash
        raw_otp = cls.generate_secure_otp()
        code_hash = cls.hash_otp(raw_otp)
        expires_at = now + timedelta(seconds=settings.OTP_EXPIRY_SECONDS)

        # Persist hashed code
        VerificationRepository.create_code(
            db=db,
            user_id=user.id,
            channel=ch,
            destination=destination,
            code_hash=code_hash,
            expires_at=expires_at,
            max_attempts=settings.OTP_MAX_ATTEMPTS,
        )

        # Dispatch via provider abstraction
        provider = get_verification_provider(ch)
        success, prov_msg = provider.send_otp(destination=destination, otp=raw_otp)

        if not success:
            AuditService.log(
                db=db,
                event_type="OTP_DISPATCH_FAILED",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Failed to dispatch {ch} OTP: {prov_msg}",
            )
            # Report provider configuration error transparently (NO fake delivery)
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=prov_msg,
            )

        # Audit log (WITHOUT logging plaintext OTP)
        AuditService.log(
            db=db,
            event_type="OTP_SENT",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Dispatched {ch} OTP to masked destination: {cls.mask_destination(destination, ch)}",
        )

        return SendOtpResponse(
            status="success",
            channel=ch,
            masked_destination=cls.mask_destination(destination, ch),
            cooldown_seconds=settings.OTP_RESEND_COOLDOWN_SECONDS,
            message=f"Verification code sent via {ch}.",
        )

    @classmethod
    def verify_otp(
        cls,
        db: Session,
        user: User,
        channel: str,
        otp: str,
        client_ip: Optional[str] = None,
        user_agent: Optional[str] = None,
    ) -> VerifyOtpResponse:
        """
        Validate submitted 6-digit OTP against stored hash.
        Checks single-use, expiration, and maximum attempt limits.
        """
        ch = channel.upper().strip()

        if user.is_verified:
            return VerifyOtpResponse(
                status="success",
                message="Account is already verified.",
                user=AuthService.create_user_summary(user),
            )

        latest = VerificationRepository.get_latest_code(db, user.id, ch)
        generic_error = HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code.",
        )

        if not latest:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No verification code requested. Please request a code first.",
            )

        now = datetime.now(timezone.utc)

        if latest.is_verified:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="This verification code has already been used. Please request a new code.",
            )

        if latest.is_expired:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Verification code has expired. Please request a new code.",
            )

        if latest.is_locked:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Maximum verification attempts exceeded for this code. Please request a new code.",
            )

        # Check code hash
        submitted_hash = cls.hash_otp(otp)
        if submitted_hash != latest.code_hash:
            attempts = VerificationRepository.increment_attempts(db, latest)
            remaining_attempts = max(0, latest.max_attempts - attempts)

            AuditService.log(
                db=db,
                event_type="OTP_VERIFICATION_FAILED",
                username=user.username,
                user_id=user.id,
                ip_address=client_ip,
                user_agent=user_agent,
                details=f"Incorrect {ch} OTP submitted. Attempt {attempts}/{latest.max_attempts}",
            )

            if remaining_attempts <= 0:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Maximum verification attempts exceeded. Code locked. Please request a new code.",
                )
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid verification code. {remaining_attempts} attempts remaining.",
            )

        # Mark code verified and update user
        VerificationRepository.mark_verified(db, latest)
        user.is_verified = True
        db.add(user)
        db.commit()
        db.refresh(user)

        # Invalidate any other active codes for this user
        VerificationRepository.invalidate_user_codes(db, user.id)

        AuditService.log(
            db=db,
            event_type="CITIZEN_VERIFIED",
            username=user.username,
            user_id=user.id,
            ip_address=client_ip,
            user_agent=user_agent,
            details=f"Citizen account verified successfully via {ch}.",
        )

        return VerifyOtpResponse(
            status="success",
            message="Citizen account successfully verified. Access granted.",
            user=AuthService.create_user_summary(user),
        )

    @classmethod
    def get_status(cls, db: Session, user: User) -> VerificationStatusResponse:
        """Retrieve current verification status, masked contacts, and active cooldown."""
        masked_email = cls.mask_destination(user.email, "EMAIL") if user.email else None
        masked_phone = cls.mask_destination(user.phone, "WHATSAPP") if user.phone else None

        latest_email = VerificationRepository.get_latest_code(db, user.id, "EMAIL")
        latest_wa = VerificationRepository.get_latest_code(db, user.id, "WHATSAPP")

        now = datetime.now(timezone.utc)
        cooldown = 0
        active_ch = None
        has_active = False

        latest = None
        if latest_email and latest_wa:
            latest = latest_email if latest_email.created_at >= latest_wa.created_at else latest_wa
        else:
            latest = latest_email or latest_wa

        if latest and not latest.is_verified and not latest.is_expired:
            has_active = True
            active_ch = latest.channel
            elapsed = (now - latest.created_at).total_seconds()
            if elapsed < settings.OTP_RESEND_COOLDOWN_SECONDS:
                cooldown = int(settings.OTP_RESEND_COOLDOWN_SECONDS - elapsed)

        return VerificationStatusResponse(
            is_verified=user.is_verified,
            email=user.email,
            masked_email=masked_email,
            phone=user.phone,
            masked_phone=masked_phone,
            active_channel=active_ch,
            has_active_code=has_active,
            cooldown_remaining=cooldown,
        )
