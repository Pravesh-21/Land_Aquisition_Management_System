import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from api.core.database import Base


class AuthAuditLog(Base):
    __tablename__ = "auth_audit_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    username = Column(String(100), nullable=False, index=True)
    event_type = Column(String(50), nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(String(255), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Optional relationship
    user = relationship("User", backref="audit_logs")

    def __repr__(self):
        return f"<AuthAuditLog(event='{self.event_type}', username='{self.username}', at='{self.created_at}')>"
