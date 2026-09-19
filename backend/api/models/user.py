import uuid
from datetime import datetime, timezone
from typing import List
from sqlalchemy import Column, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from api.core.database import Base
from api.models.associations import user_roles, user_departments


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String(100), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    phone = Column(String(30), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    last_login_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    roles = relationship("Role", secondary=user_roles, back_populates="users", lazy="joined")
    departments = relationship("Department", secondary=user_departments, back_populates="users", lazy="joined")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")

    @property
    def role_names(self) -> List[str]:
        return [r.name for r in self.roles]

    @property
    def permission_names(self) -> List[str]:
        perms = set()
        for r in self.roles:
            for p in r.permissions:
                perms.add(p.name)
        return sorted(list(perms))

    def has_role(self, role_name: str) -> bool:
        return role_name.upper() in [r.name.upper() for r in self.roles]

    def has_permission(self, permission_name: str) -> bool:
        return permission_name.upper() in self.permission_names

    def __repr__(self):
        return f"<User(username='{self.username}', email='{self.email}', is_active={self.is_active})>"
