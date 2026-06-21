from datetime import datetime
from pydantic import BaseModel, Field


class PolicyCreate(BaseModel):
    policy_name: str = Field(..., max_length=255)
    provider: str = Field(..., max_length=255)
    type: str
    premium: float = Field(..., gt=0)
    coverage_amount: float = Field(..., gt=0)
    claim_settlement_ratio: float | None = None
    waiting_period: int | None = None
    addons: dict = {}
    description: str | None = None
    features: list = []


class PolicyResponse(BaseModel):
    id: int
    policy_name: str
    provider: str
    type: str
    premium: float
    coverage_amount: float
    claim_settlement_ratio: float | None
    waiting_period: int | None
    addons: dict
    description: str | None
    features: list
    created_at: datetime

    model_config = {"from_attributes": True}
