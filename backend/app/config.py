from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    DEBUG: bool = False

    DATABASE_URL: str = "postgresql+asyncpg://postgres:Welcome%402026@localhost:5432/policybazar"
    REDIS_URL: str = "redis://redis:6379"

    CELERY_BROKER_URL: str = "redis://redis:6379/0"
    CELERY_RESULT_BACKEND: str = "redis://redis:6379/0"

    JWT_SECRET: str = "rFMvew5xAHYzgoc2CYwW_9UEdilSVmpwe865pmWm9IM"
    JWT_ALGORITHM: str = "HS256"
    JWT_EXPIRATION_HOURS: int = 24

    OPENAI_API_KEY: str = "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"
    TAVILY_API_KEY: str = ""

    CLERK_PUBLISHABLE_KEY: str = "pk_test_YWRlcXVhdGUtZ2FubmV0LTkzLmNsZXJrLmFjY291bnRzLmRldiQ"
    CLERK_SECRET_KEY: str = "sk_test_43IH5Jkm12fTLqdIwerBetCTVNCGcOEUq1SLkY1o5X"

    STRIPE_SECRET_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""

    RAZORPAY_KEY_ID: str = "rzp_test_Sg7NyDbQlDo4eI"
    RAZORPAY_KEY_SECRET: str = "P4xyRynLMVCcBoITQ1HJNCbC"

    GOOGLE_CLIENT_ID: str = "575376331062-nk92kuflc24sh9crtfb1kdtp5fg19br6.apps.googleusercontent.com"
    GOOGLE_CLIENT_SECRET: str = "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"

    AWS_ACCESS_KEY_ID: str = "your-aws-key"
    AWS_SECRET_ACCESS_KEY: str = "your-aws-secret"
    AWS_BUCKET_NAME: str = "property-platform-media"
    AWS_REGION: str = "ap-south-1"
    CLOUDFRONT_URL: str = ""

    OSM_USER_AGENT: str = "InsuranceBazaar/1.0"

    TWILIO_ACCOUNT_SID: str = "AC9359ad40279803772ba2d03c1c6bcd69"
    TWILIO_AUTH_TOKEN: str = "42284942916b52132cf640e80b7aac05"
    TWILIO_PHONE_NUMBER: str = "+918669065575"

    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173", "http://127.0.0.1:3000"]

    PLATFORM_COMMISSION_PERCENT: float = 10.0

    ADMIN_USERNAME: str = "admin"
    ADMIN_EMAIL: str = "admin@insurancebazaar.app"
    ADMIN_PASSWORD: str = "Welcome@2026"
    ADMIN_MOBILE: str = "8669065575"


settings = Settings()
