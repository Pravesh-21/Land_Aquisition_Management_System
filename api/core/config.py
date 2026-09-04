import os
from typing import List, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    APP_NAME: str = "BHU-NIRIKSHAN-API"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "postgresql://bhudrishti:bhudrishti_pass@localhost:5432/bhudrishti_db"

    # JWT Authentication
    JWT_SECRET_KEY: str = "bhu-nirikshan-secure-jwt-secret-key-development-2026"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Cookie Security
    COOKIE_SECURE: bool = False  # Set to True in HTTPS production environments
    COOKIE_SAMESITE: str = "lax"  # lax or strict

    # Rate Limiting
    RATE_LIMIT_LOGIN_ATTEMPTS: int = 5
    RATE_LIMIT_LOGIN_WINDOW_SECONDS: int = 300  # 5 minutes

    # Seed configuration
    SEED_PASSWORD: str = "Pass@123"

    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
    ]

    # --- Verification & OTP Settings ---
    OTP_EXPIRY_SECONDS: int = 300  # 5 minutes
    OTP_RESEND_COOLDOWN_SECONDS: int = 60  # 60 seconds cooldown
    OTP_MAX_ATTEMPTS: int = 5
    OTP_SECRET_SALT: str = "bhu-nirikshan-otp-salt-secret-key-2026"

    # Email Provider (SMTP)
    SMTP_HOST: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    SMTP_FROM_EMAIL: str = "noreply@bhu-nirikshan.gov.in"
    SMTP_USE_TLS: bool = True

    # WhatsApp Provider (Meta Cloud API)
    WHATSAPP_API_URL: str = "https://graph.facebook.com/v21.0"
    WHATSAPP_PHONE_NUMBER_ID: Optional[str] = None
    WHATSAPP_ACCESS_TOKEN: Optional[str] = None
    WHATSAPP_TEMPLATE_NAME: str = "bhu_nirikshan_otp"

    # Testing & Development Mock Provider Flag
    USE_MOCK_VERIFICATION_PROVIDER: bool = False

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


settings = Settings()
