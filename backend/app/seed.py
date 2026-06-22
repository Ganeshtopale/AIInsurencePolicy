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
    {"name": "Admin User", "email": "admin@policybazar.com", "password": "admin123", "role": UserRole.ADMIN},
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

        await session.commit()

    await _seed_vector_store()


async def _seed_vector_store():
    from app.config import settings
    if not settings.OPENAI_API_KEY:
        logger.info("OPENAI_API_KEY not set, skipping RAG vector store ingestion")
        return
    from app.ai.rag.vector_store import VectorStore
    from app.ai.rag.ingestion import run_ingestion
    store = VectorStore()
    store.clear()
    count = await run_ingestion(store)
    logger.info(f"Vector store seeded with {count} chunks")


if __name__ == "__main__":
    asyncio.run(seed_database())
