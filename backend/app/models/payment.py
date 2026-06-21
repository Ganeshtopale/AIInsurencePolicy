from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class Payment(Base):
    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    stripe_session_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    razorpay_order_id: Mapped[str] = mapped_column(String(255), unique=True, nullable=True)
    razorpay_payment_id: Mapped[str] = mapped_column(String(255), nullable=True)
    policy_id: Mapped[int] = mapped_column(Integer, ForeignKey("policies.id"), nullable=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    amount_total: Mapped[float] = mapped_column(Float, default=0.0)
    currency: Mapped[str] = mapped_column(String(10), default="INR")
    customer_email: Mapped[str] = mapped_column(String(255), nullable=True)
    payment_status: Mapped[str] = mapped_column(String(50), default="pending")
    status: Mapped[str] = mapped_column(String(50), default="pending")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
