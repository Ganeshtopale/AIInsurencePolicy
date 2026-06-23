import asyncio
import logging
from datetime import datetime, timezone

from app.database import async_session, engine, Base
from app.models.user import User, UserRole
from app.models.lead import Lead, LeadStatus
from app.models.policy import Policy, PolicyType
from app.api.auth import pwd_context

logger = logging.getLogger(__name__)


PROVIDERS = [
    {"name": "HDFC Life", "provider_type": "life", "rating": 4.5},
    {"name": "ICICI Prudential", "provider_type": "life", "rating": 4.4},
    {"name": "Tata AIA", "provider_type": "life", "rating": 4.3},
    {"name": "Bajaj Allianz", "provider_type": "general", "rating": 4.4},
    {"name": "LIC", "provider_type": "life", "rating": 4.6},
    {"name": "SBI Life", "provider_type": "life", "rating": 4.3},
    {"name": "Star Health", "provider_type": "general", "rating": 4.2},
    {"name": "HDFC Ergo", "provider_type": "general", "rating": 4.5},
    {"name": "New India Assurance", "provider_type": "general", "rating": 4.1},
    {"name": "Max Bupa", "provider_type": "general", "rating": 4.3},
    {"name": "ICICI Lombard", "provider_type": "general", "rating": 4.4},
    {"name": "Kotak Mahindra", "provider_type": "life", "rating": 4.2},
    {"name": "United India", "provider_type": "general", "rating": 4.0},
]

USERS = [
    {"name": "Admin User", "email": "admin@policybazar.com", "password": "admin123", "role": UserRole.ADMIN, "username": "admin"},
    {"name": "Agent Sharma", "email": "agent@policybazar.com", "password": "agent123", "role": UserRole.AGENT},
    {"name": "Rahul Kumar", "email": "rahul@example.com", "password": "user123", "role": UserRole.CUSTOMER},
    {"name": "Priya Singh", "email": "priya@example.com", "password": "user123", "role": UserRole.CUSTOMER},
    {"name": "Amit Patel", "email": "amit@example.com", "password": "user123", "role": UserRole.CUSTOMER},
]


LEADS = [
    {"user_email": "rahul@example.com", "lead_score": 85.0, "purchase_probability": 0.75, "conversation_summary": "Interested in term life insurance for family", "status": LeadStatus.QUALIFIED},
    {"user_email": "priya@example.com", "lead_score": 60.0, "purchase_probability": 0.50, "conversation_summary": "Looking for health insurance for parents", "status": LeadStatus.CONTACTED},
    {"user_email": "amit@example.com", "lead_score": 40.0, "purchase_probability": 0.30, "conversation_summary": "Comparing motor insurance options", "status": LeadStatus.NEW},
]


async def seed_database():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        from app.models.provider import Provider
        created_providers = {}
        for p in PROVIDERS:
            provider = Provider(name=p["name"], provider_type=p["provider_type"], rating=p["rating"])
            session.add(provider)
            await session.flush()
            created_providers[p["name"]] = provider

        created_users = {}
        for u in USERS:
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=pwd_context.hash(u["password"]),
                role=u["role"],
                username=u.get("username"),
            )
            session.add(user)
            await session.flush()
            created_users[u["email"]] = user

        for lead_data in LEADS:
            user = created_users.get(lead_data["user_email"])
            if user:
                lead = Lead(
                    user_id=user.id,
                    lead_score=lead_data["lead_score"],
                    status=lead_data["status"],
                    purchase_probability=lead_data["purchase_probability"],
                    conversation_summary=lead_data["conversation_summary"],
                )
                session.add(lead)

        POLICIES = [
            {"name": "HDFC Life Click 2 Protect", "provider_name": "HDFC Life", "policy_type": PolicyType.TERM, "premium": 12500, "coverage": 10000000, "csr": 98.5, "desc": "Comprehensive term insurance plan with life cover and critical illness option"},
            {"name": "LIC Jeevan Anand", "provider_name": "LIC", "policy_type": PolicyType.TERM, "premium": 9800, "coverage": 5000000, "csr": 97.8, "desc": "Traditional term plan with maturity benefit and life coverage"},
            {"name": "ICICI Pru iProtect Smart", "provider_name": "ICICI Prudential", "policy_type": PolicyType.TERM, "premium": 11000, "coverage": 7500000, "csr": 96.2, "desc": "Flexible term insurance with return of premium option"},
            {"name": "Star Health Comprehensive", "provider_name": "Star Health", "policy_type": PolicyType.HEALTH, "premium": 15000, "coverage": 500000, "csr": 94.5, "desc": "Individual health insurance with cashless hospitalization"},
            {"name": "Max Bupa Health Companion", "provider_name": "Max Bupa", "policy_type": PolicyType.HEALTH, "premium": 18000, "coverage": 1000000, "csr": 93.1, "desc": "Family floater health insurance with wellness benefits"},
            {"name": "HDFC Ergo Health Suraksha", "provider_name": "HDFC Ergo", "policy_type": PolicyType.HEALTH, "premium": 13500, "coverage": 750000, "csr": 95.0, "desc": "Affordable health plan with day-care procedure coverage"},
            {"name": "ICICI Lombard Motor Insurance", "provider_name": "ICICI Lombard", "policy_type": PolicyType.MOTOR, "premium": 8500, "coverage": 500000, "csr": 92.3, "desc": "Comprehensive motor insurance with zero depreciation add-on"},
            {"name": "Bajaj Allianz Car Insurance", "provider_name": "Bajaj Allianz", "policy_type": PolicyType.MOTOR, "premium": 7200, "coverage": 400000, "csr": 93.8, "desc": "Private car insurance with roadside assistance and NCB protection"},
            {"name": "New India Motor Policy", "provider_name": "New India Assurance", "policy_type": PolicyType.MOTOR, "premium": 6500, "coverage": 350000, "csr": 91.0, "desc": "Two-wheeler and car insurance with third-party liability"},
            {"name": "Tata AIA Fortune Pro", "provider_name": "Tata AIA", "policy_type": PolicyType.ULIP, "premium": 50000, "coverage": 10000000, "csr": 94.0, "desc": "Unit-linked investment plan with life cover and market returns"},
            {"name": "Kotak Mahindra Classic", "provider_name": "Kotak Mahindra", "policy_type": PolicyType.INVESTMENT, "premium": 25000, "coverage": 5000000, "csr": 95.2, "desc": "Investment-oriented policy with guaranteed returns"},
            {"name": "SBI Life Smart Shield", "provider_name": "SBI Life", "policy_type": PolicyType.TERM, "premium": 10500, "coverage": 6000000, "csr": 97.0, "desc": "Affordable term plan with accidental death benefit"},
        ]

        for pd in POLICIES:
            provider = created_providers.get(pd["provider_name"])
            if provider:
                policy = Policy(
                    name=pd["name"],
                    provider_id=provider.id,
                    policy_type=pd["policy_type"],
                    premium=pd["premium"],
                    coverage_amount=pd["coverage"],
                    claim_settlement_ratio=pd["csr"],
                    description=pd["desc"],
                    features=["Life Cover", "Maturity Benefit"],
                    addons={"critical_illness": True, "accidental_death": True},
                )
                session.add(policy)

        await session.commit()

    await _seed_vector_store()


async def _seed_vector_store():
    from app.config import settings
    if not settings.OPENAI_API_KEY:
        logger.info("OPENAI_API_KEY not set, skipping RAG vector store ingestion")
        return
    try:
        from app.ai.rag.vector_store import VectorStore
        from app.ai.rag.ingestion import run_ingestion
        store = VectorStore()
        store.clear()
        count = await run_ingestion(store)
        logger.info(f"Vector store seeded with {count} chunks")
    except Exception as e:
        logger.warning(f"Vector store seeding skipped: {e}")


if __name__ == "__main__":
    asyncio.run(seed_database())
