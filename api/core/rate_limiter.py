import time
from typing import Dict, List, Tuple
from api.core.config import settings

# In-memory storage for sliding-window attempt tracking
# Key: f"{client_ip}:{identifier}" -> List of failure epoch timestamps
_failed_attempts: Dict[str, List[float]] = {}


def _get_cleaned_history(key: str, window_seconds: int) -> List[float]:
    """Prune timestamps older than window_seconds."""
    now = time.time()
    cutoff = now - window_seconds
    history = [t for t in _failed_attempts.get(key, []) if t > cutoff]
    _failed_attempts[key] = history
    return history


def check_rate_limit(key: str) -> Tuple[bool, int]:
    """
    Check if the given key has exceeded the rate limit threshold.
    Returns (is_limited, retry_after_seconds).
    """
    window = settings.RATE_LIMIT_LOGIN_WINDOW_SECONDS
    threshold = settings.RATE_LIMIT_LOGIN_ATTEMPTS

    history = _get_cleaned_history(key, window)
    if len(history) >= threshold:
        oldest_relevant = history[0]
        retry_after = max(1, int(oldest_relevant + window - time.time()))
        return True, retry_after
    return False, 0


def record_failed_attempt(key: str) -> Tuple[bool, int]:
    """
    Record a failed login attempt and return whether the rate limit is now active.
    Returns (is_limited, retry_after_seconds).
    """
    window = settings.RATE_LIMIT_LOGIN_WINDOW_SECONDS
    threshold = settings.RATE_LIMIT_LOGIN_ATTEMPTS

    now = time.time()
    history = _get_cleaned_history(key, window)
    history.append(now)
    _failed_attempts[key] = history

    if len(history) >= threshold:
        oldest_relevant = history[0]
        retry_after = max(1, int(oldest_relevant + window - now))
        return True, retry_after
    return False, 0


def reset_rate_limit(key: str) -> None:
    """Clear failed login history on successful authentication."""
    if key in _failed_attempts:
        del _failed_attempts[key]


def clear_all_rate_limits() -> None:
    """Reset all rate limiter state (useful for tests)."""
    _failed_attempts.clear()
