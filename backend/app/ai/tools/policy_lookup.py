import logging
from typing import List, Optional, Dict, Any
from sqlalchemy import select, and_
from sqlalchemy.orm import joinedload
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import async_session
from app.models.policy import Policy, PolicyType

logger = logging.getLogger(__name__)


class PolicyLookupTool:

    async def lookup_by_id(self, policy_id: int) -> Optional[Dict[str, Any]]:
        async with async_session() as session:
            result = await session.execute(
                select(Policy).where(Policy.id == policy_id).options(joinedload(Policy.provider))
            )
            policy = result.scalar_one_or_none()
            if policy:
                return self._policy_to_dict(policy)
            return None

    async def lookup_by_type(self, policy_type: str) -> List[Dict[str, Any]]:
        async with async_session() as session:
            try:
                pt = PolicyType(policy_type.lower())
            except ValueError:
                logger.warning(f"Invalid policy type: {policy_type}")
                return []
            result = await session.execute(
                select(Policy).where(Policy.policy_type == pt).options(joinedload(Policy.provider))
            )
            policies = result.scalars().all()
            return [self._policy_to_dict(p) for p in policies]

    async def search_policies(
        self,
        query: str = "",
        policy_type: Optional[str] = None,
        min_coverage: Optional[float] = None,
        max_premium: Optional[float] = None,
        provider: Optional[str] = None,
        limit: int = 20,
    ) -> List[Dict[str, Any]]:
        async with async_session() as session:
            conditions = []
            if policy_type:
                try:
                    conditions.append(Policy.policy_type == PolicyType(policy_type.lower()))
                except ValueError:
                    pass
            if min_coverage is not None:
                conditions.append(Policy.coverage_amount >= min_coverage)
            if max_premium is not None:
                conditions.append(Policy.premium <= max_premium)
            if provider:
                from app.models.provider import Provider
                conditions.append(Provider.name.ilike(f"%{provider}%"))

            stmt = select(Policy).options(joinedload(Policy.provider))
            if provider:
                stmt = stmt.join(Policy.provider)
            if conditions:
                stmt = stmt.where(and_(*conditions))
            if query:
                stmt = stmt.where(Policy.name.ilike(f"%{query}%"))
            stmt = stmt.limit(limit)

            result = await session.execute(stmt)
            policies = result.scalars().all()
            return [self._policy_to_dict(p) for p in policies]

    async def compare_policies(self, policy_ids: List[int]) -> List[Dict[str, Any]]:
        if not policy_ids:
            return []
        async with async_session() as session:
            result = await session.execute(
                select(Policy).where(Policy.id.in_(policy_ids)).options(joinedload(Policy.provider))
            )
            policies = result.scalars().all()
            return [self._policy_to_dict(p) for p in policies]

    def _policy_to_dict(self, policy: Policy) -> Dict[str, Any]:
        return {
            "id": policy.id,
            "policy_name": policy.name,
            "provider": policy.provider.name if policy.provider else None,
            "provider_id": policy.provider_id,
            "provider_logo": policy.provider.logo_url if policy.provider else None,
            "type": policy.policy_type.value if isinstance(policy.policy_type, PolicyType) else policy.policy_type,
            "premium": policy.premium,
            "coverage_amount": policy.coverage_amount,
            "claim_settlement_ratio": policy.claim_settlement_ratio,
            "waiting_period": policy.waiting_period,
            "addons": policy.addons,
            "description": policy.description,
            "features": policy.features,
            "created_at": policy.created_at.isoformat() if policy.created_at else None,
        }
