import logging
from twilio.rest import Client
from app.config import settings

logger = logging.getLogger(__name__)

def send_sms(to: str, message: str) -> bool:
    try:
        client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
        client.messages.create(body=message, from_=settings.TWILIO_PHONE_NUMBER, to=to)
        logger.info("SMS sent to %s", to)
        return True
    except Exception as e:
        logger.error("Failed to send SMS to %s: %s", to, e)
        return False

def send_otp(phone: str, otp: str) -> bool:
    return send_sms(phone, f"Your PolicyBazaar AI verification code is: {otp}. Valid for 10 minutes.")

def send_payment_confirmation(phone: str, policy_name: str, amount: float) -> bool:
    return send_sms(phone, f"Payment of Rs.{amount:.0f} for {policy_name} confirmed. Policy document will be emailed. - PolicyBazaar AI")
