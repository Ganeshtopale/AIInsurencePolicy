from datetime import datetime
from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
import razorpay

from app.config import settings
from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/api", tags=["Checkout"])

razorpay_client = razorpay.Client(auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET))


class CheckoutRequest(BaseModel):
    policy_id: int
    success_url: str = "http://localhost:5173/payment/success"
    cancel_url: str = "http://localhost:5173/payment/cancel"


class CheckoutResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    name: str
    description: str
    prefill_email: str = ""
    prefill_contact: str = ""


class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class CheckoutStatusResponse(BaseModel):
    session_id: str
    status: str
    policy_id: Optional[int] = None
    amount_total: Optional[float] = None
    customer_email: Optional[str] = None
    payment_status: Optional[str] = None
    created_at: Optional[datetime] = None


@router.post("/checkout/create-order", response_model=CheckoutResponse, status_code=status.HTTP_201_CREATED)
async def create_razorpay_order(
    body: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.policy import Policy

    result = await db.execute(select(Policy).where(Policy.id == body.policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    amount_paise = int(policy.premium * 100)
    order = razorpay_client.order.create({
        "amount": amount_paise,
        "currency": "INR",
        "receipt": f"receipt_{uuid.uuid4().hex[:12]}",
        "notes": {"policy_id": str(policy.id), "user_id": str(getattr(current_user, "id", ""))},
    })

    return CheckoutResponse(
        order_id=order["id"],
        amount=order["amount"],
        currency=order["currency"],
        key_id=settings.RAZORPAY_KEY_ID,
        name=policy.name,
        description=policy.description or "",
        prefill_email=getattr(current_user, "email", ""),
        prefill_contact=getattr(current_user, "phone", ""),
    )


@router.post("/checkout/verify")
async def verify_razorpay_payment(
    body: VerifyPaymentRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.payment import Payment
    from app.models.purchase import Purchase, PurchaseStatus

    params_dict = {
        "razorpay_order_id": body.razorpay_order_id,
        "razorpay_payment_id": body.razorpay_payment_id,
        "razorpay_signature": body.razorpay_signature,
    }

    try:
        razorpay_client.utility.verify_payment_signature(params_dict)
    except razorpay.errors.SignatureVerificationError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Payment verification failed")

    order = razorpay_client.order.fetch(body.razorpay_order_id)
    policy_id = int(order.get("notes", {}).get("policy_id", 0))

    payment = Payment(
        razorpay_order_id=body.razorpay_order_id,
        razorpay_payment_id=body.razorpay_payment_id,
        policy_id=policy_id or None,
        user_id=current_user.id,
        status="completed",
        payment_status="paid",
        amount_total=order.get("amount", 0) / 100,
    )
    db.add(payment)

    if policy_id:
        purchase = Purchase(
            user_id=current_user.id,
            policy_id=policy_id,
            amount=order.get("amount", 0) / 100,
            tenure=1,
            status=PurchaseStatus.COMPLETED,
            payment_id=body.razorpay_payment_id,
        )
        db.add(purchase)

    await db.commit()

    return {"status": "success", "payment_id": body.razorpay_payment_id}


@router.get("/checkout/status/{order_id}", response_model=CheckoutStatusResponse)
async def get_checkout_status(order_id: str, db: AsyncSession = Depends(get_db)):
    from app.models.payment import Payment

    result = await db.execute(select(Payment).where(Payment.razorpay_order_id == order_id))
    payment = result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found")

    try:
        order = razorpay_client.order.fetch(order_id)
        return CheckoutStatusResponse(
            session_id=order_id,
            status=payment.status,
            policy_id=payment.policy_id,
            amount_total=order.get("amount", 0) / 100,
            payment_status=order.get("status", payment.payment_status),
            created_at=payment.created_at,
        )
    except Exception:
        return CheckoutStatusResponse(
            session_id=order_id,
            status=payment.status,
            payment_status=payment.payment_status,
        )


@router.post("/checkout/mock", response_model=CheckoutResponse)
async def mock_checkout(
    body: CheckoutRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.policy import Policy

    result = await db.execute(select(Policy).where(Policy.id == body.policy_id))
    policy = result.scalar_one_or_none()
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    return CheckoutResponse(
        order_id=f"mock_order_{uuid.uuid4().hex[:12]}",
        amount=int(policy.premium * 100),
        currency="INR",
        key_id=settings.RAZORPAY_KEY_ID,
        name=policy.name,
        description=policy.description or "",
        prefill_email=getattr(current_user, "email", ""),
        prefill_contact=getattr(current_user, "phone", ""),
    )
