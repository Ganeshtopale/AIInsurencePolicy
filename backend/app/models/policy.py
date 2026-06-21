from datetime import datetime, timezone
from sqlalchemy import String, Float, Integer, DateTime, Boolean, Enum as SAEnum, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base
import enum


class PolicyType(str, enum.Enum):
    TERM = "term"
    HEALTH = "health"
    MOTOR = "motor"
    INVESTMENT = "investment"
    TRAVEL = "travel"
    CAR = "car"
    BIKE = "bike"
    HOME = "home"
    PET = "pet"
    PERSONAL = "personal"
    CHILD = "child"
    RETIREMENT = "retirement"
    PENSION = "pension"
    ULIP = "ulip"
    GROUP_HEALTH = "group-health"
    CORPORATE = "corporate"
    CANCER = "cancer"
    FAMILY_HEALTH = "family-health"
    HOME_LOAN = "home-loan"
    TAXI = "taxi"
    COMMERCIAL_VEHICLE = "commercial-vehicle"


class Policy(Base):
    __tablename__ = "policies"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    provider_id: Mapped[int] = mapped_column(ForeignKey("providers.id"), nullable=False)
    policy_type: Mapped[PolicyType] = mapped_column(SAEnum(PolicyType), nullable=False)
    premium: Mapped[float] = mapped_column(Float, nullable=False)
    coverage_amount: Mapped[float] = mapped_column(Float, nullable=False)
    claim_settlement_ratio: Mapped[float] = mapped_column(Float, nullable=True)
    waiting_period: Mapped[int] = mapped_column(Integer, nullable=True)
    addons: Mapped[dict] = mapped_column(JSON, default=dict)
    description: Mapped[str] = mapped_column(String(2000), nullable=True)
    features: Mapped[list] = mapped_column(JSON, default=list)
    rating: Mapped[float] = mapped_column(Float, default=4.0)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    provider: Mapped["Provider"] = relationship("Provider", lazy="joined")
