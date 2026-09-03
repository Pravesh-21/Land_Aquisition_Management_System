import uuid
from typing import Optional, List
from sqlalchemy.orm import Session
from api.models.audit_log import AuthAuditLog


class AuditService:
    @staticmethod
    def log(
        db: Session,
        event_type: str,
        username: str,
        user_id: Optional[uuid.UUID] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        details: Optional[str] = None,
    ) -> Optional[AuthAuditLog]:
        """Record an authentication or security event in the immutable audit ledger."""
        try:
            log_entry = AuthAuditLog(
                id=uuid.uuid4(),
                user_id=user_id,
                username=username[:100] if username else "unknown",
                event_type=event_type[:50],
                ip_address=ip_address[:45] if ip_address else None,
                user_agent=user_agent[:255] if user_agent else None,
                details=details,
            )
            db.add(log_entry)
            db.commit()
            db.refresh(log_entry)
            return log_entry
        except Exception as e:
            # Audit logging failure should not break user operations, but be captured in logs
            print(f"[ERROR] Failed to record auth audit log: {e}")
            db.rollback()
            return None

    @staticmethod
    def list_logs(
        db: Session,
        event_type: Optional[str] = None,
        username: Optional[str] = None,
        limit: int = 50,
        offset: int = 0,
    ) -> List[AuthAuditLog]:
        """Query audit log entries with optional filters."""
        query = db.query(AuthAuditLog).order_by(AuthAuditLog.created_at.desc())
        if event_type:
            query = query.filter(AuthAuditLog.event_type == event_type.upper().strip())
        if username:
            query = query.filter(AuthAuditLog.username.ilike(f"%{username.strip()}%"))
        return query.offset(offset).limit(limit).all()
