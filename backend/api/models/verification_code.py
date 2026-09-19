import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from api.core.database import Base


class VerificationCode(Base):
    __tablename__ = "verification_codes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    channel = Column(String(20), nullable=False, index=True)  # EMAIL or WHATSAPP
    destination = Column(String(255), nullable=False)
    code_hash = Column(String(255), nullable=False)
    expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    attempts = Column(Integer, default=0, nullable=False)
    max_attempts = Column(Integer, default=5, nullable=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationship to user
    user = relationship("User", backref="verification_codes")

    @property
    def is_expired(self) -> bool:
        return datetime.now(timezone.utc) >= self.expires_at

    @property
    def is_verified(self) -> bool:
        return self.verified_at is not None

    @property
    def is_locked(self) -> bool:
        return self.attempts >= self.max_attempts

    def __repr__(self):
        return f"<VerificationCode(user_id='{self.user_id}', channel='{self.channel}', verified={self.is_verified})>"
