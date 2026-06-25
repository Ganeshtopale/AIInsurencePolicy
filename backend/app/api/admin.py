from typing import Optional
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.api.auth import get_admin_user, get_admin_or_agent, get_current_user

router = APIRouter(prefix="/api/admin", tags=["Admin"])


# --- Policy Schemas ---
class PolicyCreate(BaseModel):
    name: str
    provider_id: int
    policy_type: str
    premium: float
    coverage_amount: float
    claim_settlement_ratio: Optional[float] = None
    waiting_period: Optional[int] = None
    addons: Optional[dict] = None
    description: Optional[str] = None
    features: Optional[list] = None
    rating: Optional[float] = 4.0


class PolicyUpdate(BaseModel):
    name: Optional[str] = None
    provider_id: Optional[int] = None
    policy_type: Optional[str] = None
    premium: Optional[float] = None
    coverage_amount: Optional[float] = None
    claim_settlement_ratio: Optional[float] = None
    waiting_period: Optional[int] = None
    addons: Optional[dict] = None
    description: Optional[str] = None
    features: Optional[list] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None


# --- User Schemas ---
class UserAdminUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


class AdminCreate(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    username: str
    password: str


# --- Dashboard ---
@router.get("/dashboard")
async def dashboard_stats(db: AsyncSession = Depends(get_db), _=Depends(get_admin_or_agent)):
    from app.models.user import User
    from app.models.policy import Policy
    from app.models.purchase import Purchase, PurchaseStatus

    total_users = (await db.execute(select(func.count(User.id)))).scalar()
    total_policies = (await db.execute(select(func.count(Policy.id)))).scalar()
    total_purchases = (await db.execute(select(func.count(Purchase.id)))).scalar()
    total_revenue = (await db.execute(select(func.coalesce(func.sum(Purchase.amount), 0)).where(Purchase.status == PurchaseStatus.COMPLETED))).scalar()

    return {
        "total_users": total_users,
        "total_policies": total_policies,
        "total_purchases": total_purchases,
        "total_revenue": float(total_revenue),
    }


# --- User Management ---
@router.get("/users")
async def list_users(db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.user import User

    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone,
            "username": u.username,
            "role": u.role.value if hasattr(u.role, "value") else u.role,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat() if u.created_at else None,
        }
        for u in users
    ]


@router.put("/users/{user_id}")
async def update_user(user_id: int, body: UserAdminUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.user import User

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if body.name is not None:
        user.name = body.name
    if body.role is not None:
        from app.models.user import UserRole
        try:
            user.role = UserRole(body.role)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid role")
    if body.is_active is not None:
        user.is_active = body.is_active
    await db.commit()
    return {"message": "User updated"}


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.user import User
    from app.models.lead import Lead
    from app.models.conversation import Conversation, ChatMessage
    from app.models.purchase import Purchase
    from app.models.payment import Payment
    from app.models.task import Task
    from app.models.job import JobApplication
    from sqlalchemy import delete as sa_delete

    user = await db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    await db.execute(sa_delete(Lead).where(Lead.user_id == user_id))
    await db.execute(sa_delete(Lead).where(Lead.assigned_agent_id == user_id))
    await db.execute(sa_delete(ChatMessage).where(ChatMessage.user_id == user_id))
    await db.execute(sa_delete(ChatMessage).where(ChatMessage.agent_id == user_id))
    await db.execute(sa_delete(Conversation).where(Conversation.user_id == user_id))
    await db.execute(sa_delete(Conversation).where(Conversation.agent_id == user_id))
    await db.execute(sa_delete(Purchase).where(Purchase.user_id == user_id))
    await db.execute(sa_delete(Payment).where(Payment.user_id == user_id))
    await db.execute(sa_delete(Task).where(Task.assigned_agent_id == user_id))
    await db.execute(sa_delete(JobApplication).where(JobApplication.user_id == user_id))

    await db.delete(user)
    await db.commit()
    return {"message": "User deleted permanently"}


# --- Agent Purchase for Customer ---
class AgentPurchaseRequest(BaseModel):
    customer_id: int
    policy_id: int


@router.get("/customers")
async def list_customers(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    if current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="Admin or agent access required")
    from app.models.user import User, UserRole

    result = await db.execute(
        select(User).where(User.role == UserRole.CUSTOMER).order_by(User.name)
    )
    users = result.scalars().all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "phone": u.phone or "",
        }
        for u in users
    ]


@router.post("/purchase-for-customer")
async def purchase_for_customer(
    body: AgentPurchaseRequest,
    db: AsyncSession = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role not in ("admin", "agent"):
        raise HTTPException(status_code=403, detail="Admin or agent access required")
    from app.models.user import User
    from app.models.policy import Policy
    from app.models.purchase import Purchase, PurchaseStatus
    from app.models.payment import Payment

    customer = await db.get(User, body.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    policy = await db.get(Policy, body.policy_id)
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")

    payment = Payment(
        razorpay_order_id=f"agent_order_{uuid.uuid4().hex[:12]}",
        razorpay_payment_id=f"agent_pay_{uuid.uuid4().hex[:12]}",
        policy_id=policy.id,
        user_id=customer.id,
        status="completed",
        payment_status="paid",
        amount_total=policy.premium,
    )
    db.add(payment)

    purchase = Purchase(
        user_id=customer.id,
        policy_id=policy.id,
        amount=policy.premium,
        tenure=1,
        status=PurchaseStatus.COMPLETED,
        payment_id=payment.razorpay_payment_id,
    )
    db.add(purchase)
    await db.commit()

    return {
        "message": f"Policy '{policy.name}' purchased for {customer.name}",
        "purchase_id": purchase.id,
    }


# --- Job Management ---
@router.get("/jobs")
async def admin_list_jobs(db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import Job, JobApplication

    result = await db.execute(select(Job).order_by(Job.created_at.desc()))
    jobs = result.scalars().all()

    counts = {}
    if jobs:
        job_ids = [j.id for j in jobs]
        count_rows = await db.execute(
            select(JobApplication.job_id, func.count(JobApplication.id)).where(
                JobApplication.job_id.in_(job_ids)
            ).group_by(JobApplication.job_id)
        )
        counts = {row[0]: row[1] for row in count_rows.all()}

    return [
        {
            "id": j.id,
            "title": j.title,
            "department": j.department,
            "location": j.location,
            "type": j.type,
            "description": j.description,
            "requirements": j.requirements,
            "is_active": j.is_active,
            "application_count": counts.get(j.id, 0),
            "created_at": j.created_at.isoformat() if j.created_at else None,
        }
        for j in jobs
    ]


# --- Job Applications ---
@router.get("/job-applications")
async def list_job_applications(db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import JobApplication, Job

    result = await db.execute(
        select(JobApplication, Job.title).join(Job, JobApplication.job_id == Job.id).order_by(JobApplication.created_at.desc())
    )
    rows = result.all()
    return [
        {
            "id": a.id,
            "job_id": a.job_id,
            "job_title": title,
            "user_id": a.user_id,
            "name": a.name,
            "email": a.email,
            "phone": a.phone,
            "resume_url": a.resume_url,
            "cover_letter": a.cover_letter,
            "status": a.status,
            "created_at": a.created_at.isoformat() if a.created_at else None,
        }
        for a, title in rows
    ]


@router.put("/job-applications/{app_id}")
async def update_application_status(app_id: int, body: dict, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.job import JobApplication

    app = await db.get(JobApplication, app_id)
    if not app:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    app.status = body.get("status", app.status)
    await db.commit()
    return {"message": "Application status updated"}


@router.post("/create-admin", status_code=status.HTTP_201_CREATED)
async def create_admin(body: AdminCreate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.user import User, UserRole
    from app.api.auth import _hash_password

    result = await db.execute(select(User).where(
        (User.email == body.email) | (User.username == body.username)
    ))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email or username already exists")

    user = User(
        name=f"{body.first_name} {body.last_name}",
        email=body.email,
        phone=body.phone,
        username=body.username,
        hashed_password=_hash_password(body.password),
        role=UserRole.ADMIN,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return {"id": user.id, "message": f"Admin {body.first_name} {body.last_name} created successfully"}


# --- Policy Management ---
@router.get("/policies")
async def list_policies(db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.policy import Policy

    result = await db.execute(select(Policy).order_by(Policy.created_at.desc()))
    policies = result.scalars().all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "provider_id": p.provider_id,
            "provider_name": p.provider.name if p.provider else None,
            "provider_logo": p.provider.logo_url if p.provider else None,
            "policy_type": p.policy_type.value if hasattr(p.policy_type, "value") else p.policy_type,
            "premium": p.premium,
            "coverage_amount": p.coverage_amount,
            "claim_settlement_ratio": p.claim_settlement_ratio,
            "waiting_period": p.waiting_period,
            "description": p.description,
            "rating": p.rating,
            "features": p.features,
            "is_active": p.is_active,
            "created_at": p.created_at.isoformat() if p.created_at else None,
        }
        for p in policies
    ]


@router.post("/policies", status_code=status.HTTP_201_CREATED)
async def create_policy(body: PolicyCreate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.policy import Policy, PolicyType
    from app.models.provider import Provider

    provider = await db.get(Provider, body.provider_id)
    if not provider:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provider not found")

    try:
        pt = PolicyType(body.policy_type)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid policy type")

    policy = Policy(
        name=body.name,
        provider_id=body.provider_id,
        policy_type=pt,
        premium=body.premium,
        coverage_amount=body.coverage_amount,
        claim_settlement_ratio=body.claim_settlement_ratio,
        waiting_period=body.waiting_period,
        addons=body.addons or {},
        description=body.description,
        features=body.features or [],
        rating=body.rating or 4.0,
    )
    db.add(policy)
    await db.commit()
    await db.refresh(policy)
    return {"id": policy.id, "message": "Policy created"}


@router.put("/policies/{policy_id}")
async def update_policy(policy_id: int, body: PolicyUpdate, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.policy import Policy, PolicyType
    from app.models.provider import Provider

    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")

    if body.name is not None:
        policy.name = body.name
    if body.provider_id is not None:
        provider = await db.get(Provider, body.provider_id)
        if not provider:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Provider not found")
        policy.provider_id = body.provider_id
    if body.policy_type is not None:
        try:
            policy.policy_type = PolicyType(body.policy_type)
        except ValueError:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid policy type")
    if body.premium is not None:
        policy.premium = body.premium
    if body.coverage_amount is not None:
        policy.coverage_amount = body.coverage_amount
    if body.claim_settlement_ratio is not None:
        policy.claim_settlement_ratio = body.claim_settlement_ratio
    if body.waiting_period is not None:
        policy.waiting_period = body.waiting_period
    if body.addons is not None:
        policy.addons = body.addons
    if body.description is not None:
        policy.description = body.description
    if body.features is not None:
        policy.features = body.features
    if body.rating is not None:
        policy.rating = body.rating
    if body.is_active is not None:
        policy.is_active = body.is_active

    await db.commit()
    return {"message": "Policy updated"}


@router.delete("/policies/{policy_id}")
async def delete_policy(policy_id: int, db: AsyncSession = Depends(get_db), _=Depends(get_admin_user)):
    from app.models.policy import Policy

    policy = await db.get(Policy, policy_id)
    if not policy:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Policy not found")
    await db.delete(policy)
    await db.commit()
    return {"message": "Policy deleted"}
