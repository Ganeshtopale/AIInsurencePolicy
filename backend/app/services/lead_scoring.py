import logging
from datetime import datetime, timezone
from typing import Optional

logger = logging.getLogger(__name__)

LEAD_SCORE_THRESHOLD_AUTO_ASSIGN = 80


def calculate_lead_score(
    engagement_time_seconds: int = 0,
    budget: float = 0,
    premium: float = 0,
    coverage_requirement: float = 0,
    coverage_amount: float = 0,
    intent_signals: int = 0,
    pages_visited: int = 1,
    previous_interactions: int = 0,
) -> float:
    if engagement_time_seconds < 0:
        engagement_time_seconds = 0
    if pages_visited < 1:
        pages_visited = 1

    engagement_score = min(engagement_time_seconds / 600.0, 1.0) * 25

    budget_match = 0.0
    if premium > 0 and budget > 0:
        ratio = budget / premium
        if ratio >= 1.0:
            budget_match = 20.0
        elif ratio >= 0.75:
            budget_match = 15.0
        elif ratio >= 0.5:
            budget_match = 10.0
        else:
            budget_match = 5.0

    coverage_match = 0.0
    if coverage_amount > 0 and coverage_requirement > 0:
        ratio = coverage_amount / coverage_requirement
        if ratio >= 1.0:
            coverage_match = 25.0
        elif ratio >= 0.75:
            coverage_match = 20.0
        elif ratio >= 0.5:
            coverage_match = 12.0
        else:
            coverage_match = 5.0

    intent_score = min(intent_signals * 5, 15.0)

    pages_score = min(pages_visited * 3, 10.0)

    interaction_bonus = min(previous_interactions * 2, 5.0)

    total = (
        engagement_score
        + budget_match
        + coverage_match
        + intent_score
        + pages_score
        + interaction_bonus
    )

    return round(min(total, 100.0), 2)


def get_lead_status(score: float) -> str:
    if score >= 80:
        return "hot"
    elif score >= 60:
        return "warm"
    elif score >= 30:
        return "cool"
    else:
        return "cold"


def should_auto_assign_agent(score: float) -> bool:
    return score >= LEAD_SCORE_THRESHOLD_AUTO_ASSIGN


def update_lead(
    current_score: float,
    status: str,
    engagement_time_seconds: int = 0,
    budget: float = 0,
    premium: float = 0,
    coverage_requirement: float = 0,
    coverage_amount: float = 0,
    intent_signals: int = 0,
    pages_visited: int = 1,
    previous_interactions: int = 0,
    lead_id: Optional[int] = None,
) -> dict:
    new_score = calculate_lead_score(
        engagement_time_seconds=engagement_time_seconds,
        budget=budget,
        premium=premium,
        coverage_requirement=coverage_requirement,
        coverage_amount=coverage_amount,
        intent_signals=intent_signals,
        pages_visited=pages_visited,
        previous_interactions=previous_interactions,
    )

    new_status = get_lead_status(new_score)
    auto_assign = should_auto_assign_agent(new_score)

    logger.info(
        "Lead %s: score %s -> %s, status %s -> %s, auto_assign=%s",
        lead_id or "unknown",
        current_score, new_score,
        status, new_status,
        auto_assign,
    )

    return {
        "lead_id": lead_id,
        "previous_score": current_score,
        "new_score": new_score,
        "previous_status": status,
        "new_status": new_status,
        "auto_assign_agent": auto_assign,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
