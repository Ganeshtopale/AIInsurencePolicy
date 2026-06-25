import asyncio
import json
import logging
import os
import random
from datetime import datetime, timezone
from pathlib import Path

from app.database import async_session, engine, Base
from app.models.user import User, UserRole
from app.models.lead import Lead, LeadStatus
from app.models.policy import Policy, PolicyType
from app.api.auth import _hash_password

logger = logging.getLogger(__name__)

DATA_DIR = Path(__file__).resolve().parent.parent / "data"

FIRST_NAMES = ["Rahul", "Priya", "Amit", "Sneha", "Vikram", "Anjali", "Rohit", "Neha", "Arjun", "Kavita"]
LAST_NAMES = ["Sharma", "Patel", "Singh", "Verma", "Kumar", "Gupta", "Reddy", "Nair", "Joshi", "Das"]

LEAD_CONFIGS = [
    {"score_range": (70, 100), "prob_range": (0.6, 0.9), "status": LeadStatus.QUALIFIED, "summaries": [
        "Interested in term life insurance for family",
        "Looking for comprehensive health coverage",
        "Needs investment-linked insurance plan",
    ]},
    {"score_range": (40, 69), "prob_range": (0.3, 0.59), "status": LeadStatus.CONTACTED, "summaries": [
        "Comparing motor insurance options",
        "Exploring health insurance for parents",
        "Inquired about ULIP plans",
    ]},
    {"score_range": (10, 39), "prob_range": (0.1, 0.29), "status": LeadStatus.NEW, "summaries": [
        "Browsed policy comparison page",
        "Requested premium estimate",
        "Viewed term insurance details",
    ]},
]


def _load_json(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        logger.warning("%s not found, skipping", path)
        return []
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def _generate_users(config: dict):
    """Generate users based on config: {admin: N, agent: N, customer: N}."""
    users = []
    idx = 0
    for role, count in config.items():
        for i in range(count):
            idx += 1
            first = random.choice(FIRST_NAMES)
            last = random.choice(LAST_NAMES)
            suffix = f"{i}" if i > 0 else ""
            username = f"{role}{suffix}" if role != "admin" else role
            users.append({
                "name": f"{first} {last}",
                "email": f"{first.lower()}.{last.lower()}{suffix}@insurancebazaar.app",
                "password": "seed123",
                "role": UserRole[role.upper()],
                "username": username if role in ("admin", "agent") else None,
            })
    return users


def _generate_leads(created_users: dict):
    """Generate leads for a random subset of customer users."""
    customers = [u for u in created_users.values() if u.role == UserRole.CUSTOMER]
    leads = []
    for idx, user in enumerate(customers):
        cfg = LEAD_CONFIGS[idx % len(LEAD_CONFIGS)]
        leads.append({
            "user_email": user.email,
            "lead_score": round(random.uniform(*cfg["score_range"]), 1),
            "purchase_probability": round(random.uniform(*cfg["prob_range"]), 2),
            "conversation_summary": random.choice(cfg["summaries"]),
            "status": cfg["status"],
        })
    return leads


async def seed_database():
    providers_data = _load_json("providers.json")
    policies_data = _load_json("policies.json")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)

    async with async_session() as session:
        from app.models.provider import Provider

        created_providers = {}
        for p in providers_data:
            provider = Provider(name=p["name"], provider_type=p["type"], rating=p["rating"])
            session.add(provider)
            await session.flush()
            created_providers[p["name"]] = provider

        users_config = {"admin": 1, "agent": 2, "customer": 5}
        users_data = _generate_users(users_config)

        created_users = {}
        for u in users_data:
            user = User(
                name=u["name"],
                email=u["email"],
                hashed_password=_hash_password(u["password"]),
                role=u["role"],
                username=u.get("username"),
            )
            session.add(user)
            await session.flush()
            created_users[u["email"]] = user

        leads_data = _generate_leads(created_users)
        for lead_data in leads_data:
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

        for pd in policies_data:
            provider = created_providers.get(pd["provider"])
            if provider:
                policy_type = getattr(PolicyType, pd["type"], PolicyType.TERM)
                policy = Policy(
                    name=pd["name"],
                    provider_id=provider.id,
                    policy_type=policy_type,
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
