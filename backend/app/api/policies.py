from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db

router = APIRouter(prefix="/api/policies", tags=["Policies"])


class PolicyResponse(BaseModel):
    id: int
    name: str
    provider_id: int
    provider_name: Optional[str] = None
    provider_logo: Optional[str] = None
    policy_type: str
    premium: float
    coverage_amount: float
    claim_settlement_ratio: Optional[float] = None
    waiting_period: Optional[int] = None
    addons: dict = {}
    description: Optional[str] = None
    features: list = []
    rating: float = 4.0
    is_active: bool = True
    created_at: datetime

    model_config = {"from_attributes": True}


@router.get("", response_model=List[PolicyResponse])
async def list_policies(
    policy_type: Optional[str] = Query(None, alias="type"),
    provider_id: Optional[int] = Query(None),
    provider: Optional[str] = Query(None),
    min_premium: Optional[float] = Query(None),
    max_premium: Optional[float] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    from app.models.policy import Policy

    query = select(Policy).where(Policy.is_active == True).options(joinedload(Policy.provider))

    if policy_type:
        query = query.where(Policy.policy_type == policy_type)
    if provider_id:
        query = query.where(Policy.provider_id == provider_id)
    if provider:
        from app.models.provider import Provider
        query = query.join(Provider).where(Provider.name.ilike(f"%{provider}%"))
    if min_premium is not None:
        query = query.where(Policy.premium >= min_premium)
    if max_premium is not None:
        query = query.where(Policy.premium <= max_premium)

    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    policies = result.scalars().all()
    return [
        PolicyResponse(
            id=p.id,
            name=p.name,
            provider_id=p.provider_id,
            provider_name=p.provider.name if p.provider else None,
            provider_logo=p.provider.logo_url if p.provider else None,
            policy_type=p.policy_type.value if hasattr(p.policy_type, "value") else p.policy_type,
            premium=p.premium,
            coverage_amount=p.coverage_amount,
            claim_settlement_ratio=p.claim_settlement_ratio,
            waiting_period=p.waiting_period,
            addons=p.addons or {},
            description=p.description,
            features=p.features or [],
            rating=p.rating,
            is_active=p.is_active,
            created_at=p.created_at,
        )
        for p in policies
    ]


@router.get("/{policy_id}", response_model=PolicyResponse)
async def get_policy(policy_id: int, db: AsyncSession = Depends(get_db)):
    from app.models.policy import Policy

    result = await db.execute(
        select(Policy).where(Policy.id == policy_id).options(joinedload(Policy.provider))
    )
    p = result.scalar_one_or_none()
    if not p:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    return PolicyResponse(
        id=p.id,
        name=p.name,
        provider_id=p.provider_id,
        provider_name=p.provider.name if p.provider else None,
        provider_logo=p.provider.logo_url if p.provider else None,
        policy_type=p.policy_type.value if hasattr(p.policy_type, "value") else p.policy_type,
        premium=p.premium,
        coverage_amount=p.coverage_amount,
        claim_settlement_ratio=p.claim_settlement_ratio,
        waiting_period=p.waiting_period,
        addons=p.addons or {},
        description=p.description,
        features=p.features or [],
        rating=p.rating,
        is_active=p.is_active,
        created_at=p.created_at,
    )



