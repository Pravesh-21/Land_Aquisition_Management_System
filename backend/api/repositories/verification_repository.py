import uuid
from datetime import datetime, timezone
from typing import Optional, List
from sqlalchemy.orm import Session
from api.models.verification_code import VerificationCode


class VerificationRepository:
    @staticmethod
    def create_code(
        db: Session,
        user_id: uuid.UUID,
        channel: str,
        destination: str,
        code_hash: str,
        expires_at: datetime,
        max_attempts: int = 5,
    ) -> VerificationCode:
        record = VerificationCode(
            id=uuid.uuid4(),
            user_id=user_id,
            channel=channel.upper().strip(),
            destination=destination,
            code_hash=code_hash,
            expires_at=expires_at,
            max_attempts=max_attempts,
            attempts=0,
            verified_at=None,
            created_at=datetime.now(timezone.utc),
        )
        db.add(record)
        db.commit()
        db.refresh(record)
        return record

    @staticmethod
    def get_latest_code(
        db: Session,
        user_id: uuid.UUID,
        channel: str,
    ) -> Optional[VerificationCode]:
        return (
            db.query(VerificationCode)
            .filter(
                VerificationCode.user_id == user_id,
                VerificationCode.channel == channel.upper().strip(),
            )
            .order_by(VerificationCode.created_at.desc())
            .first()
        )

    @staticmethod
    def invalidate_user_codes(
        db: Session,
        user_id: uuid.UUID,
        channel: Optional[str] = None,
    ) -> int:
        query = db.query(VerificationCode).filter(
            VerificationCode.user_id == user_id,
            VerificationCode.verified_at.is_(None),
        )
        if channel:
            query = query.filter(VerificationCode.channel == channel.upper().strip())

        now = datetime.now(timezone.utc)
        count = 0
        for code in query.all():
            # Set expires_at to now to invalidate
            if code.expires_at > now:
                code.expires_at = now
                db.add(code)
                count += 1
        db.commit()
        return count

    @staticmethod
    def increment_attempts(db: Session, code: VerificationCode) -> int:
        code.attempts += 1
        db.add(code)
        db.commit()
        return code.attempts

    @staticmethod
    def mark_verified(db: Session, code: VerificationCode) -> None:
        code.verified_at = datetime.now(timezone.utc)
        db.add(code)
        db.commit()
