from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.auth import get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin Providers"])


async def _require_admin_or_agent(current_user=Depends(get_current_user)):
    from fastapi import HTTPException, status
    if current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin or agent access required")
    return current_user


class ProviderCreate(BaseModel):
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    founded_year: Optional[int] = None
    provider_type: Optional[str] = None
    rating: Optional[float] = 4.0


class ProviderUpdate(BaseModel):
    name: Optional[str] = None
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    founded_year: Optional[int] = None
    provider_type: Optional[str] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None


class ProviderResponse(BaseModel):
    id: int
    name: str
    logo_url: Optional[str] = None
    description: Optional[str] = None
    website: Optional[str] = None
    contact_email: Optional[str] = None
    contact_phone: Optional[str] = None
    founded_year: Optional[int] = None
    provider_type: Optional[str] = None
    rating: float
    is_active: bool

    model_config = {"from_attributes": True}


@router.get("/providers", response_model=List[ProviderResponse])
async def list_providers(db: AsyncSession = Depends(get_db), _=Depends(_require_admin_or_agent)):
    from app.models.provider import Provider
    result = await db.execute(select(Provider).order_by(Provider.name))
    return result.scalars().all()


@router.get("/providers/{provider_id}", response_model=ProviderResponse)
async def get_provider(provider_id: int, db: AsyncSession = Depends(get_db), _=Depends(_require_admin_or_agent)):
    from app.models.provider import Provider
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    return provider


@router.post("/providers", response_model=ProviderResponse)
async def create_provider(body: ProviderCreate, db: AsyncSession = Depends(get_db), _=Depends(_require_admin_or_agent)):
    from app.models.provider import Provider
    existing = await db.execute(select(Provider).where(Provider.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provider with this name already exists")
    provider = Provider(**body.model_dump(exclude_none=True))
    db.add(provider)
    await db.commit()
    await db.refresh(provider)
    return provider


@router.put("/providers/{provider_id}", response_model=ProviderResponse)
async def update_provider(provider_id: int, body: ProviderUpdate, db: AsyncSession = Depends(get_db), _=Depends(_require_admin_or_agent)):
    from app.models.provider import Provider
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    data = body.model_dump(exclude_none=True)
    for key, value in data.items():
        setattr(provider, key, value)
    await db.commit()
    await db.refresh(provider)
    return provider


@router.delete("/providers/{provider_id}")
async def delete_provider(provider_id: int, db: AsyncSession = Depends(get_db), _=Depends(_require_admin_or_agent)):
    from app.models.provider import Provider
    from app.models.policy import Policy
    provider = await db.get(Provider, provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Provider not found")
    policies = await db.execute(select(Policy).where(Policy.provider_id == provider_id).limit(1))
    if policies.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot delete provider with linked policies. Remove or reassign policies first.")
    await db.delete(provider)
    await db.commit()
    return {"message": "Provider deleted"}
