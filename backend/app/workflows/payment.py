import logging
from datetime import datetime, timezone
from typing import Optional

from app.services.payment_service import process_payment, generate_receipt
from app.services.email_service import send_policy_confirmation_email
from app.services.lead_scoring import update_lead

logger = logging.getLogger(__name__)


def _generate_policy_pdf(
    user_name: str,
    policy_name: str,
    provider: str,
    premium: float,
    start_date: str,
) -> bytes:
    pdf_content = (
        f"INSURANCE POLICY DOCUMENT\n"
        f"========================\n"
        f"Policy Holder: {user_name}\n"
        f"Policy: {policy_name}\n"
        f"Provider: {provider}\n"
        f"Premium: ${premium:,.2f}\n"
        f"Start Date: {start_date}\n"
        f"Issued At: {datetime.now(timezone.utc).isoformat()}\n"
        f"\nThis is a computer-generated document.\n"
    ).encode("utf-8")
    logger.info("PDF generated for %s - %s", user_name, policy_name)
    return pdf_content


def on_payment_success(
    user_id: int,
    user_name: str,
    user_email: str,
    policy_id: int,
    policy_name: str,
    provider: str,
    premium: float,
    payment_intent_id: str,
    lead_id: Optional[int] = None,
) -> dict:
    logger.info("Payment success workflow started for user %s, policy %s", user_id, policy_name)

    payment_data = process_payment(payment_intent_id)
    receipt = generate_receipt(payment_data)

    start_date = datetime.now(timezone.utc).strftime("%Y-%m-%d")
    pdf_bytes = _generate_policy_pdf(user_name, policy_name, provider, premium, start_date)

    email_sent = send_policy_confirmation_email(
        to_email=user_email,
        user_name=user_name,
        policy_name=policy_name,
        provider=provider,
        premium=premium,
        start_date=start_date,
    )

    if lead_id is not None:
        lead_result = update_lead(
            current_score=0,
            status="converted",
            lead_id=lead_id,
            previous_interactions=3,
        )
    else:
        lead_result = None

    result = {
        "status": "success",
        "policy_id": policy_id,
        "user_id": user_id,
        "payment": {
            "id": payment_data["id"],
            "status": payment_data["status"],
            "amount": payment_data["amount"],
        },
        "receipt": receipt,
        "policy_pdf_size": len(pdf_bytes),
        "email_sent": email_sent,
        "lead_update": lead_result,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }

    logger.info("Payment success workflow completed for user %s", user_id)
    return result


def on_payment_failure(
    user_id: int,
    user_email: str,
    user_name: str,
    policy_name: str,
    payment_intent_id: str,
    error_message: str,
    lead_id: Optional[int] = None,
) -> dict:
    logger.warning("Payment failure workflow for user %s: %s", user_id, error_message)

    from app.services.email_service import send_email

    subject = f"Payment Failed - {policy_name}"
    body = f"""
    <html><body>
    <h2>Payment Failed</h2>
    <p>Dear {user_name},</p>
    <p>We were unable to process your payment for <strong>{policy_name}</strong>.</p>
    <p><strong>Reason:</strong> {error_message}</p>
    <p>Please check your payment method and try again. Your policy will not be issued until payment is successful.</p>
    <br/>
    <p>Best regards,<br/>The Insurance Marketplace Team</p>
    </body></html>
    """
    email_sent = send_email(user_email, subject, body)

    if lead_id is not None:
        lead_result = update_lead(
            current_score=0,
            status="payment_failed",
            lead_id=lead_id,
            previous_interactions=1,
        )
    else:
        lead_result = None

    result = {
        "status": "failed",
        "user_id": user_id,
        "policy_name": policy_name,
        "payment_intent_id": payment_intent_id,
        "error": error_message,
        "email_sent": email_sent,
        "lead_update": lead_result,
        "completed_at": datetime.now(timezone.utc).isoformat(),
    }

    logger.info("Payment failure workflow completed for user %s", user_id)
    return result
