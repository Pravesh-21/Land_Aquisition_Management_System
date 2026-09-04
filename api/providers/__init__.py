from api.core.config import settings
from api.providers.base import BaseVerificationProvider
from api.providers.email_provider import EmailVerificationProvider
from api.providers.whatsapp_provider import WhatsAppVerificationProvider
from api.providers.mock_provider import MockVerificationProvider, mock_provider

_override_mock: bool = False


def set_mock_verification_mode(enable: bool) -> None:
    """Enable or disable mock provider mode (used during automated tests)."""
    global _override_mock
    _override_mock = enable


def get_verification_provider(channel: str) -> BaseVerificationProvider:
    """Factory retrieving the configured provider for a given statutory channel."""
    if _override_mock or settings.USE_MOCK_VERIFICATION_PROVIDER:
        return mock_provider

    ch = channel.upper().strip()
    if ch == "EMAIL":
        return EmailVerificationProvider()
    elif ch == "WHATSAPP":
        return WhatsAppVerificationProvider()
    else:
        raise ValueError(f"Unsupported verification channel '{channel}'. Must be EMAIL or WHATSAPP.")


__all__ = [
    "BaseVerificationProvider",
    "EmailVerificationProvider",
    "WhatsAppVerificationProvider",
    "MockVerificationProvider",
    "mock_provider",
    "get_verification_provider",
    "set_mock_verification_mode",
]
