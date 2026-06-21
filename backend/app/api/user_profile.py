from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/profile", tags=["User Profile"])


class PurchaseResponse(BaseModel):
    id: int
    policy_name: str
    amount: float
    tenure: int
    status: str
    created_at: str

    class Config:
        from_attributes = True


@router.get("/purchases")
async def get_purchases(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from app.models.purchase import Purchase, PurchaseStatus
    from app.models.policy import Policy

    result = await db.execute(
        select(Purchase, Policy.name).join(Policy, Purchase.policy_id == Policy.id)
        .where(Purchase.user_id == current_user.id)
        .order_by(Purchase.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": p.id,
            "policy_name": name,
            "amount": p.amount,
            "tenure": p.tenure,
            "status": p.status.value if hasattr(p.status, "value") else p.status,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p, name in rows
    ]
