import logging
import os
from datetime import datetime, timezone
from typing import Optional

from app.config import settings

logger = logging.getLogger(__name__)

USE_MOCK = not settings.STRIPE_SECRET_KEY


def _get_stripe():
    import stripe
    stripe.api_key = settings.STRIPE_SECRET_KEY
    return stripe


def create_payment_intent(
    amount: int,
    currency: str = "usd",
    customer_email: Optional[str] = None,
    metadata: Optional[dict] = None,
) -> dict:
    if USE_MOCK:
        logger.info("MOCK: Creating payment intent for amount=%d %s", amount, currency)
        return {
            "id": f"pi_mock_{datetime.now(timezone.utc).timestamp()}",
            "amount": amount,
            "currency": currency,
            "status": "requires_payment_method",
            "client_secret": f"cs_mock_{datetime.now(timezone.utc).timestamp()}",
            "metadata": metadata or {},
        }

    stripe = _get_stripe()
    try:
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            receipt_email=customer_email,
            metadata=metadata or {},
        )
        return {
            "id": intent.id,
            "amount": intent.amount,
            "currency": intent.currency,
            "status": intent.status,
            "client_secret": intent.client_secret,
            "metadata": intent.metadata,
        }
    except Exception as e:
        logger.error("Stripe payment intent creation failed: %s", e)
        raise


def process_payment(payment_intent_id: str) -> dict:
    if USE_MOCK:
        logger.info("MOCK: Processing payment %s", payment_intent_id)
        return {
            "id": payment_intent_id,
            "status": "succeeded",
            "amount": 0,
            "currency": "usd",
            "payment_method": "mock_card",
            "receipt_url": f"https://mock-receipt.example.com/{payment_intent_id}",
        }

    stripe = _get_stripe()
    try:
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        if intent.status == "requires_confirmation":
            intent.confirm()
        return {
            "id": intent.id,
            "status": intent.status,
            "amount": intent.amount,
            "currency": intent.currency,
            "payment_method": intent.payment_method,
            "receipt_url": intent.charges.data[0].receipt_url if intent.charges.data else None,
        }
    except Exception as e:
        logger.error("Payment processing failed: %s", e)
        raise


def create_refund(
    payment_intent_id: str,
    amount: Optional[int] = None,
    reason: Optional[str] = None,
) -> dict:
    if USE_MOCK:
        logger.info("MOCK: Refunding payment %s (amount=%s)", payment_intent_id, amount or "full")
        return {
            "id": f"re_mock_{datetime.now(timezone.utc).timestamp()}",
            "payment_intent_id": payment_intent_id,
            "amount": amount or 0,
            "status": "succeeded",
            "reason": reason,
        }

    stripe = _get_stripe()
    try:
        refund = stripe.Refund.create(
            payment_intent=payment_intent_id,
            amount=amount,
            reason=reason,
        )
        return {
            "id": refund.id,
            "payment_intent_id": refund.payment_intent,
            "amount": refund.amount,
            "status": refund.status,
            "reason": refund.reason,
        }
    except Exception as e:
        logger.error("Refund failed: %s", e)
        raise


def generate_receipt(payment_data: dict) -> dict:
    receipt = {
        "receipt_id": f"rcpt_{payment_data.get('id', 'unknown')}",
        "payment_id": payment_data.get("id"),
        "amount": payment_data.get("amount", 0),
        "currency": payment_data.get("currency", "usd"),
        "status": payment_data.get("status"),
        "paid_at": datetime.now(timezone.utc).isoformat(),
        "payment_method": payment_data.get("payment_method", "unknown"),
        "receipt_url": payment_data.get("receipt_url"),
    }
    logger.info("Receipt generated: %s", receipt["receipt_id"])
    return receipt
