import logging
from celery import Celery
from app.config import settings

logger = logging.getLogger(__name__)

celery_app = Celery(
    "insurance_marketplace",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
)


@celery_app.task
def send_sms_task(phone: str, message: str):
    from app.services.twilio_service import send_sms
    return send_sms(phone, message)


@celery_app.task
def send_policy_email_task(user_email: str, policy_name: str, pdf_url: str):
    logger.info("Sending policy email to %s for %s", user_email, policy_name)


@celery_app.task
def cleanup_expired_sessions():
    logger.info("Cleaning up expired sessions")
