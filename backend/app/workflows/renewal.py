import logging
from datetime import datetime, timedelta, timezone
from decimal import Decimal
from typing import List, Optional

logger = logging.getLogger(__name__)


class PolicyRecord:
    def __init__(self, policy_id: int, user_id: int, user_email: str, user_name: str,
                 policy_name: str, provider: str, premium: float, expiry_date: datetime):
        self.policy_id = policy_id
        self.user_id = user_id
        self.user_email = user_email
        self.user_name = user_name
        self.policy_name = policy_name
        self.provider = provider
        self.premium = premium
        self.expiry_date = expiry_date


class MarketRate:
    def __init__(self, provider: str, policy_name: str, premium: float, coverage: float):
        self.provider = provider
        self.policy_name = policy_name
        self.premium = premium
        self.coverage = coverage


def _mock_current_market_rates(policy_type: str) -> List[MarketRate]:
    rates_db = {
        "health": [
            MarketRate("SecureLife", "Basic Health Shield", 2400, 100000),
            MarketRate("MediCare", "Family Health Plus", 4300, 300000),
            MarketRate("GoldenYears", "Senior Care Plan", 5800, 200000),
        ],
        "life": [
            MarketRate("SecureLife", "Term Life Cover", 1700, 500000),
            MarketRate("LifeGuard", "Whole Life Assurance", 7800, 1000000),
        ],
        "auto": [MarketRate("DriveSure", "Auto Protect", 3100, 150000)],
        "home": [MarketRate("PropSafe", "Home Shield", 4800, 400000)],
        "travel": [MarketRate("GlobeAssure", "Travel Guard", 1100, 50000)],
    }
    return rates_db.get(policy_type, [])


def check_policies_expiring_soon(
    policies: List[PolicyRecord],
    days_threshold: int = 30,
) -> List[PolicyRecord]:
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(days=days_threshold)
    expiring = [p for p in policies if now <= p.expiry_date <= cutoff]
    logger.info("Found %d policies expiring within %d days", len(expiring), days_threshold)
    return expiring


def search_market_rates(policy_type: str) -> List[MarketRate]:
    rates = _mock_current_market_rates(policy_type)
    logger.info("Found %d rates for %s policies", len(rates), policy_type)
    return rates


def generate_renewal_proposal(
    policy: PolicyRecord,
    market_rates: Optional[List[MarketRate]] = None,
) -> dict:
    if market_rates is None:
        market_rates = []

    current_premium = policy.premium
    best_alternative = None
    potential_savings = 0.0

    for rate in market_rates:
        if rate.premium < current_premium:
            saving = current_premium - rate.premium
            if best_alternative is None or saving > potential_savings:
                best_alternative = rate
                potential_savings = saving

    renewal_premium = current_premium
    if best_alternative:
        renewal_premium = current_premium * Decimal("0.95")

    proposal = {
        "policy_id": policy.policy_id,
        "policy_name": policy.policy_name,
        "current_provider": policy.provider,
        "current_premium": current_premium,
        "expiry_date": policy.expiry_date.isoformat(),
        "renewal_premium": float(round(renewal_premium, 2)),
        "best_alternative": {
            "provider": best_alternative.provider,
            "policy_name": best_alternative.policy_name,
            "premium": best_alternative.premium,
            "potential_savings": round(potential_savings, 2),
        } if best_alternative else None,
        "market_rates": [
            {"provider": r.provider, "policy_name": r.policy_name, "premium": r.premium}
            for r in market_rates
        ],
    }

    logger.info("Renewal proposal generated for policy %s", policy.policy_name)
    return proposal


def queue_renewal_notification(proposal: dict, user_email: str, user_name: str) -> dict:
    notification = {
        "type": "renewal_reminder",
        "user_email": user_email,
        "user_name": user_name,
        "policy_name": proposal["policy_name"],
        "message": (
            f"Dear {user_name}, your {proposal['policy_name']} policy is expiring soon. "
            f"Your current premium is ${proposal['current_premium']:,.2f}. "
            f"Renewal premium: ${proposal['renewal_premium']:,.2f}."
        ),
        "channel": "email",
        "priority": "high",
        "status": "queued",
        "queued_at": datetime.now(timezone.utc).isoformat(),
    }
    logger.info("Notification queued for %s: %s", user_email, notification["type"])
    return notification


def run_renewal_workflow(policies: List[PolicyRecord]) -> List[dict]:
    results = []
    expiring = check_policies_expiring_soon(policies)

    for policy in expiring:
        rates = search_market_rates(policy.policy_name.split()[-1].lower())
        proposal = generate_renewal_proposal(policy, rates)
        notification = queue_renewal_notification(proposal, policy.user_email, policy.user_name)
        results.append({"proposal": proposal, "notification": notification})

    return results
