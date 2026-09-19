from typing import Tuple, List, Dict, Optional
from datetime import datetime, timezone
from api.providers.base import BaseVerificationProvider


class MockVerificationProvider(BaseVerificationProvider):
    """
    Test and development provider layer.
    Captures sent OTPs in memory for automated test assertions.
    Must never be used to weaken production verification.
    """

    def __init__(self):
        self.sent_messages: List[Dict[str, any]] = []

    def send_otp(self, destination: str, otp: str) -> Tuple[bool, str]:
        self.sent_messages.append({
            "destination": destination,
            "otp": otp,
            "timestamp": datetime.now(timezone.utc),
        })
        return True, "OTP dispatched via Mock Verification Provider."

    def get_last_otp(self, destination: Optional[str] = None) -> Optional[str]:
        if not self.sent_messages:
            return None
        if destination:
            for msg in reversed(self.sent_messages):
                if msg["destination"] == destination:
                    return msg["otp"]
            return None
        return self.sent_messages[-1]["otp"]

    def clear(self) -> None:
        self.sent_messages.clear()


# Global mock singleton instance for unit test inspections
mock_provider = MockVerificationProvider()
