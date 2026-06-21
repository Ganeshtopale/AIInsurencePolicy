from typing import Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel

from app.config import settings

router = APIRouter(prefix="/api/compare-quotes", tags=["Comparison"])


class CompareRequest(BaseModel):
    policy_type: str
    coverage_amount: float
    age: int
    location: Optional[str] = None
    providers: Optional[List[str]] = None


class QuoteEntry(BaseModel):
    provider: str
    policy_name: str
    monthly_premium: float
    annual_premium: float
    coverage_amount: float
    deductibles: Optional[float] = None
    rating: Optional[float] = None
    highlights: List[str] = []


class CompareResponse(BaseModel):
    policy_type: str
    coverage_amount: float
    quotes: List[QuoteEntry]
    market_insights: Optional[str] = None


def _compute_base_premium(policy_type: str, coverage_amount: float, age: int) -> float:
    base_rates = {
        "health": 0.05,
        "auto": 0.08,
        "life": 0.03,
        "home": 0.04,
        "travel": 0.02,
    }
    rate = base_rates.get(policy_type, 0.05)
    age_factor = 1.0
    if age > 60:
        age_factor = 1.4
    elif age > 40:
        age_factor = 1.2
    return coverage_amount * rate * age_factor / 12


async def _fetch_live_quotes(policy_type: str) -> Optional[str]:
    try:
        from app.services.web_search import web_search

        results = await web_search(f"{policy_type} insurance quotes rates 2026")
        if results:
            return results[:500]
    except Exception:
        pass
    return None


@router.post("", response_model=CompareResponse)
async def compare_quotes(body: CompareRequest):
    providers = body.providers or ["Aetna", "Blue Cross", "UnitedHealth", "Cigna", "Humana"]
    base_premium = _compute_base_premium(body.policy_type, body.coverage_amount, body.age)

    quotes = []
    for i, provider in enumerate(providers):
        variance = 0.85 + (i * 0.05)
        monthly = round(base_premium * variance, 2)
        quotes.append(
            QuoteEntry(
                provider=provider,
                policy_name=f"{provider} {body.policy_type.title()} Plan",
                monthly_premium=monthly,
                annual_premium=round(monthly * 12, 2),
                coverage_amount=body.coverage_amount,
                deductibles=round(body.coverage_amount * 0.02, 2),
                rating=round(4.0 + (i * 0.2), 1),
                highlights=[
                    f"No waiting period for {body.policy_type}",
                    "24/7 customer support",
                    "Free annual check-up included",
                ],
            )
        )

    quotes.sort(key=lambda q: q.monthly_premium)

    market_insights = None
    if settings.TAVILY_API_KEY:
        raw = await _fetch_live_quotes(body.policy_type)
        if raw:
            market_insights = raw[:300]

    return CompareResponse(
        policy_type=body.policy_type,
        coverage_amount=body.coverage_amount,
        quotes=quotes,
        market_insights=market_insights,
    )
