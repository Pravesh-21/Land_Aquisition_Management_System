from abc import ABC, abstractmethod
from typing import Tuple


class BaseVerificationProvider(ABC):
    """Abstract base class for statutory OTP transmission channels."""

    @abstractmethod
    def send_otp(self, destination: str, otp: str) -> Tuple[bool, str]:
        """
        Send a 6-digit OTP to the recipient destination.
        Returns:
            Tuple[bool, str]: (is_success, status_or_error_message)
        """
        pass
