from datetime import datetime, timezone
from sqlalchemy import String, Integer, DateTime, Float, ForeignKey, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base
import enum


class PurchaseStatus(str, enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class Purchase(Base):
    __tablename__ = "purchases"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    policy_id: Mapped[int] = mapped_column(Integer, ForeignKey("policies.id"), nullable=False)
    amount: Mapped[float] = mapped_column(Float, default=0.0)
    tenure: Mapped[int] = mapped_column(Integer, default=1)
    status: Mapped[PurchaseStatus] = mapped_column(SAEnum(PurchaseStatus), default=PurchaseStatus.PENDING)
    payment_id: Mapped[str] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
