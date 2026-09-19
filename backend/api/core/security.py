import uuid
import secrets
import hashlib
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any, Tuple
import jwt
from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError, VerificationError, InvalidHashError
from api.core.config import settings

# Argon2id password hasher configuration (RFC 9106 recommended parameters)
_hasher = PasswordHasher(
    time_cost=2,
    memory_cost=65536,
    parallelism=1,
    hash_len=32,
    salt_len=16,
)


def hash_password(plain_password: str) -> str:
    """Hash a plaintext password using Argon2id."""
    return _hasher.hash(plain_password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a password against an Argon2id hash. Returns True on match, False otherwise."""
    try:
        return _hasher.verify(hashed_password, plain_password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def validate_password_complexity(password: str) -> Tuple[bool, Optional[str]]:
    """
    Validate password meets statutory security standards:
    - At least 8 characters
    - At least one uppercase letter [A-Z]
    - At least one lowercase letter [a-z]
    - At least one digit [0-9]
    - At least one special symbol [!@#$%^&*()_+-=[]{}|;:,.<>?]
    Returns (is_valid, error_message).
    """
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not any(c.isupper() for c in password):
        return False, "Password must contain at least one uppercase letter (A-Z)."
    if not any(c.islower() for c in password):
        return False, "Password must contain at least one lowercase letter (a-z)."
    if not any(c.isdigit() for c in password):
        return False, "Password must contain at least one digit (0-9)."
    
    special_characters = set("!@#$%^&*()_+-=[]{}|;:,.<>?/~`'\"\\")
    if not any(c in special_characters for c in password):
        return False, "Password must contain at least one special character (e.g. !@#$%^&*)."

    return True, None


def hash_token(raw_token: str) -> str:
    """Compute secure SHA-256 hash of a refresh token for database storage."""
    return hashlib.sha256(raw_token.encode("utf-8")).hexdigest()


def create_access_token(user_id: str, extra_claims: Optional[Dict[str, Any]] = None) -> Tuple[str, int]:
    """
    Create a short-lived JWT access token with standard minimal claims:
    sub, iat, exp, jti, type="access".
    Returns (token_string, expires_in_seconds).
    """
    now = datetime.now(timezone.utc)
    expire_delta = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    expire_at = now + expire_delta

    payload: Dict[str, Any] = {
        "sub": str(user_id),
        "iat": int(now.timestamp()),
        "exp": int(expire_at.timestamp()),
        "jti": str(uuid.uuid4()),
        "type": "access",
    }
    if extra_claims:
        payload.update(extra_claims)

    encoded_jwt = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    expires_in_seconds = int(expire_delta.total_seconds())
    return encoded_jwt, expires_in_seconds


def create_refresh_token() -> Tuple[str, str, datetime]:
    """
    Generate a cryptographically secure random refresh token.
    Returns (raw_token, token_hash, expires_at).
    """
    raw_token = secrets.token_urlsafe(48)
    token_hash = hash_token(raw_token)
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return raw_token, token_hash, expires_at


def decode_access_token(token: str) -> Optional[Dict[str, Any]]:
    """Decode and validate a JWT access token. Returns payload or None if invalid/expired."""
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
            options={"require": ["sub", "exp", "iat", "jti", "type"]},
        )
        if payload.get("type") != "access":
            return None
        return payload
    except (jwt.PyJWTError, Exception):
        return None
