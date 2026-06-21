import logging
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

USE_MOCK = not settings.STRIPE_SECRET_KEY


def _send_email_smtp(to_email: str, subject: str, html_body: str) -> bool:
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = "noreply@insurancemarketplace.com"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP("localhost", 1025) as server:
            server.send_message(msg)
        logger.info("Email sent to %s: %s", to_email, subject)
        return True
    except Exception as e:
        logger.error("Failed to send email to %s: %s", to_email, e)
        return False


def _send_mock(to_email: str, subject: str, html_body: str) -> bool:
    logger.info(
        "MOCK EMAIL --- To: %s | Subject: %s | Body preview: %s...",
        to_email, subject, html_body[:120].replace("\n", " "),
    )
    return True


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    if USE_MOCK:
        return _send_mock(to_email, subject, html_body)
    return _send_email_smtp(to_email, subject, html_body)


def send_welcome_email(to_email: str, user_name: str) -> bool:
    subject = "Welcome to Insurance Marketplace!"
    body = f"""
    <html><body>
    <h2>Welcome, {user_name}!</h2>
    <p>Thank you for joining Insurance Marketplace. We're here to help you find the best insurance policies tailored to your needs.</p>
    <p>Get started by exploring our range of health, life, auto, and home insurance options.</p>
    <br/>
    <p>Best regards,<br/>The Insurance Marketplace Team</p>
    </body></html>
    """
    return send_email(to_email, subject, body)


def send_policy_confirmation_email(
    to_email: str,
    user_name: str,
    policy_name: str,
    provider: str,
    premium: float,
    start_date: str,
) -> bool:
    subject = f"Policy Confirmation - {policy_name}"
    body = f"""
    <html><body>
    <h2>Policy Confirmation</h2>
    <p>Dear {user_name},</p>
    <p>Your policy <strong>{policy_name}</strong> from <strong>{provider}</strong> has been issued successfully.</p>
    <ul>
        <li>Premium: ${premium:,.2f}</li>
        <li>Start Date: {start_date}</li>
    </ul>
    <p>Your policy document is attached or available in your dashboard.</p>
    <br/>
    <p>Best regards,<br/>The Insurance Marketplace Team</p>
    </body></html>
    """
    return send_email(to_email, subject, body)


def send_renewal_reminder(
    to_email: str,
    user_name: str,
    policy_name: str,
    expiry_date: str,
    days_left: int,
) -> bool:
    subject = f"Renewal Reminder - {policy_name} expires in {days_left} days"
    body = f"""
    <html><body>
    <h2>Policy Renewal Reminder</h2>
    <p>Dear {user_name},</p>
    <p>Your <strong>{policy_name}</strong> is expiring on <strong>{expiry_date}</strong> ({days_left} days left).</p>
    <p>Don't let your coverage lapse — renew now to stay protected.</p>
    <p><a href="https://insurancemarketplace.com/renew" style="background:#007bff;color:#fff;padding:10px 20px;text-decoration:none;border-radius:4px;">Renew Now</a></p>
    <br/>
    <p>Best regards,<br/>The Insurance Marketplace Team</p>
    </body></html>
    """
    return send_email(to_email, subject, body)
