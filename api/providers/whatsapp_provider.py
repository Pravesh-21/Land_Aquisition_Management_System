from typing import Tuple
import httpx
from api.core.config import settings
from api.providers.base import BaseVerificationProvider


class WhatsAppVerificationProvider(BaseVerificationProvider):
    """
    Production Meta WhatsApp Cloud API delivery provider for Citizen verification codes.
    Strictly follows requirement: NO fake delivery in development.
    """

    def __init__(self):
        self.api_url = settings.WHATSAPP_API_URL.rstrip("/")
        self.phone_number_id = settings.WHATSAPP_PHONE_NUMBER_ID
        self.access_token = settings.WHATSAPP_ACCESS_TOKEN
        self.template_name = settings.WHATSAPP_TEMPLATE_NAME

    def is_configured(self) -> bool:
        return bool(self.phone_number_id and self.access_token)

    def send_otp(self, destination: str, otp: str) -> Tuple[bool, str]:
        if not self.is_configured():
            # Explicitly report unconfigured state — NEVER pretend WhatsApp was sent
            return False, "WhatsApp Business API is not configured in the environment."

        clean_phone = "".join(c for c in destination if c.isdigit())
        if len(clean_phone) == 10:
            clean_phone = f"91{clean_phone}"

        endpoint = f"{self.api_url}/{self.phone_number_id}/messages"
        headers = {
            "Authorization": f"Bearer {self.access_token}",
            "Content-Type": "application/json",
        }
        payload = {
            "messaging_product": "whatsapp",
            "recipient_type": "individual",
            "to": clean_phone,
            "type": "template",
            "template": {
                "name": self.template_name,
                "language": {"code": "en"},
                "components": [
                    {
                        "type": "body",
                        "parameters": [{"type": "text", "text": otp}],
                    },
                    {
                        "type": "button",
                        "sub_type": "url",
                        "index": "0",
                        "parameters": [{"type": "text", "text": otp}],
                    },
                ],
            },
        }

        try:
            with httpx.Client(timeout=10) as client:
                res = client.post(endpoint, json=payload, headers=headers)
                if res.status_code in [200, 201]:
                    return True, "WhatsApp OTP dispatched successfully."
                else:
                    return False, f"WhatsApp API error ({res.status_code}): {res.text}"
        except Exception as e:
            return False, f"WhatsApp transmission network error: {str(e)}"
