from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/leads", tags=["Leads"])


class LeadResponse(BaseModel):
    id: int
    user_id: int
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    lead_score: float = 0.0
    status: str = "new"
    purchase_probability: float = 0.0
    conversation_summary: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class LeadUpdate(BaseModel):
    status: Optional[str] = None
    lead_score: Optional[float] = None
    purchase_probability: Optional[float] = None
    conversation_summary: Optional[str] = None
    assigned_agent_id: Optional[int] = None
    notes: Optional[str] = None


class PredictPolicyRequest(BaseModel):
    age: int
    income: float
    health_condition: Optional[str] = None
    vehicle_value: Optional[float] = None
    property_value: Optional[float] = None
    family_size: Optional[int] = None
    preferred_type: Optional[str] = None


class PredictPolicyResponse(BaseModel):
    recommended_policy_id: int
    policy_name: str
    confidence: float
    reasoning: str


@router.get("", response_model=List[LeadResponse])
async def list_leads(
    status_filter: Optional[str] = Query(None, alias="status"),
    min_score: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.lead import Lead
    from app.models.user import User

    query = select(Lead, User).join(User, Lead.user_id == User.id)

    if status_filter:
        query = query.where(Lead.status == status_filter)
    if min_score is not None:
        query = query.where(Lead.lead_score >= min_score)

    query = query.order_by(Lead.lead_score.desc().nullslast()).offset(skip).limit(limit)
    result = await db.execute(query)
    rows = result.all()
    return [
        LeadResponse(
            id=lead.id,
            user_id=lead.user_id,
            name=user.name,
            email=user.email,
            phone=user.phone,
            lead_score=lead.lead_score,
            status=lead.status.value if hasattr(lead.status, "value") else lead.status,
            purchase_probability=lead.purchase_probability,
            conversation_summary=lead.conversation_summary,
            assigned_agent_id=lead.assigned_agent_id,
            created_at=lead.created_at,
            updated_at=lead.updated_at,
        )
        for lead, user in rows
    ]


@router.get("/{lead_id}", response_model=LeadResponse)
async def get_lead(
    lead_id: int,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.lead import Lead
    from app.models.user import User

    result = await db.execute(
        select(Lead, User).join(User, Lead.user_id == User.id).where(Lead.id == lead_id)
    )
    row = result.one_or_none()
    if not row:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    lead, user = row
    return LeadResponse(
        id=lead.id,
        user_id=lead.user_id,
        name=user.name,
        email=user.email,
        phone=user.phone,
        lead_score=lead.lead_score,
        status=lead.status.value if hasattr(lead.status, "value") else lead.status,
        purchase_probability=lead.purchase_probability,
        conversation_summary=lead.conversation_summary,
        assigned_agent_id=lead.assigned_agent_id,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


@router.put("/{lead_id}", response_model=LeadResponse)
async def update_lead(
    lead_id: int,
    update_data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.lead import Lead
    from app.models.user import User

    result = await db.execute(select(Lead).where(Lead.id == lead_id))
    lead = result.scalar_one_or_none()
    if not lead:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")

    for field, value in update_data.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)

    await db.commit()
    await db.refresh(lead)

    user_result = await db.execute(select(User).where(User.id == lead.user_id))
    user = user_result.scalar_one_or_none()
    return LeadResponse(
        id=lead.id,
        user_id=lead.user_id,
        name=user.name if user else None,
        email=user.email if user else None,
        phone=user.phone if user else None,
        lead_score=lead.lead_score,
        status=lead.status.value if hasattr(lead.status, "value") else lead.status,
        purchase_probability=lead.purchase_probability,
        conversation_summary=lead.conversation_summary,
        assigned_agent_id=lead.assigned_agent_id,
        created_at=lead.created_at,
        updated_at=lead.updated_at,
    )


@router.post("/predict-policy", response_model=PredictPolicyResponse)
async def predict_best_policy(
    features: PredictPolicyRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    from app.models.policy import Policy

    try:
        from app.ml.models.policy_predictor import PolicyPredictor
        predictor = PolicyPredictor()
        prediction = await predictor.predict(features.model_dump())
    except Exception:
        prediction = None

    if prediction is None:
        result = await db.execute(select(Policy).where(Policy.is_active == True).limit(5))
        policies = result.scalars().all()
        if not policies:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No policies available")
        best = policies[0]
        return PredictPolicyResponse(
            recommended_policy_id=best.id,
            policy_name=best.name,
            confidence=0.0,
            reasoning="ML model unavailable; default policy returned.",
        )

    return PredictPolicyResponse(
        recommended_policy_id=prediction["policy_id"],
        policy_name=prediction["policy_name"],
        confidence=prediction["confidence"],
        reasoning=prediction.get("reasoning", ""),
    )
