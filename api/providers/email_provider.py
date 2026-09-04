import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Tuple
from api.core.config import settings
from api.providers.base import BaseVerificationProvider


class EmailVerificationProvider(BaseVerificationProvider):
    """Production SMTP Email delivery provider for Citizen verification codes."""

    def __init__(self):
        self.host = settings.SMTP_HOST
        self.port = settings.SMTP_PORT
        self.username = settings.SMTP_USERNAME
        self.password = settings.SMTP_PASSWORD
        self.from_email = settings.SMTP_FROM_EMAIL
        self.use_tls = settings.SMTP_USE_TLS

    def is_configured(self) -> bool:
        return bool(self.host and self.from_email)

    def send_otp(self, destination: str, otp: str) -> Tuple[bool, str]:
        if not self.is_configured():
            return False, "Email provider (SMTP) is not configured in the environment."

        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = "BHU-NIRIKSHAN Citizen Portal — Verification Code"
            msg["From"] = self.from_email
            msg["To"] = destination

            text_content = (
                f"Your BHU-NIRIKSHAN Citizen Portal verification code is: {otp}\n\n"
                f"This code is valid for 5 minutes. Do not share this code with anyone.\n\n"
                f"Government of India — Land Acquisition Management System"
            )

            html_content = f"""
            <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <div style="background-color: #0d233a; padding: 15px; border-radius: 6px; text-align: center;">
                    <h2 style="color: #ffffff; margin: 0; font-size: 18px; letter-spacing: 0.5px;">BHU-NIRIKSHAN</h2>
                    <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 12px;">Government of India · Land Acquisition Portal</p>
                </div>
                <div style="padding: 24px 10px; text-align: center;">
                    <p style="font-size: 14px; color: #334155; margin-bottom: 20px;">
                        Use the following statutory verification code to verify your citizen account:
                    </p>
                    <div style="display: inline-block; background-color: #f1f5f9; padding: 12px 28px; font-size: 28px; font-weight: bold; letter-spacing: 8px; color: #0d233a; border-radius: 6px; border: 1px dashed #cbd5e1;">
                        {otp}
                    </div>
                    <p style="font-size: 12px; color: #64748b; margin-top: 20px;">
                        This code expires in <strong>5 minutes</strong> and is strictly single-use.
                    </p>
                </div>
                <div style="border-top: 1px solid #e2e8f0; padding-top: 14px; text-align: center; font-size: 11px; color: #94a3b8;">
                    If you did not request this code, please ignore this communication.
                </div>
            </div>
            """

            msg.attach(MIMEText(text_content, "plain"))
            msg.attach(MIMEText(html_content, "html"))

            with smtplib.SMTP(self.host, self.port, timeout=10) as server:
                if self.use_tls:
                    server.starttls()
                if self.username and self.password:
                    server.login(self.username, self.password)
                server.sendmail(self.from_email, [destination], msg.as_string())

            return True, "Verification email dispatched successfully."
        except Exception as e:
            return False, f"Failed to dispatch email: {str(e)}"
