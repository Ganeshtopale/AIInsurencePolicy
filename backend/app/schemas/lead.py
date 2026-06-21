from datetime import datetime
from pydantic import BaseModel, Field


class LeadCreate(BaseModel):
    user_id: int
    lead_score: float = 0.0
    status: str = "new"
    purchase_probability: float = 0.0
    conversation_summary: str | None = None
    assigned_agent_id: int | None = None


class LeadUpdate(BaseModel):
    lead_score: float | None = None
    status: str | None = None
    purchase_probability: float | None = None
    conversation_summary: str | None = None
    assigned_agent_id: int | None = None


class LeadResponse(BaseModel):
    id: int
    user_id: int
    lead_score: float
    status: str
    purchase_probability: float
    conversation_summary: str | None
    assigned_agent_id: int | None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
