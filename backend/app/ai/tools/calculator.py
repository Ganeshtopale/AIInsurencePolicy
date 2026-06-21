import logging
from typing import Optional
from pydantic import BaseModel, Field

logger = logging.getLogger(__name__)


class PremiumInput(BaseModel):
    age: int = Field(..., ge=18, le=100, description="Age of the insured")
    coverage_amount: float = Field(..., gt=0, description="Coverage amount in currency")
    tenure_years: int = Field(..., ge=1, le=50, description="Policy tenure in years")
    health_rating: str = Field("standard", description="Health rating: excellent, good, standard, below_average")
    smoker: bool = Field(False, description="Whether the insured is a smoker")
    occupation_risk: str = Field("low", description="Occupation risk: low, medium, high")
    policy_type: str = Field("term", description="Policy type: term, health, motor, investment, travel")


class PremiumResult(BaseModel):
    base_premium: float
    age_loading: float
    health_loading: float
    smoker_loading: float
    occupation_loading: float
    total_premium: float
    premium_per_year: float
    currency: str = "INR"


class PremiumCalculator:

    HEALTH_MULTIPLIERS = {
        "excellent": 0.9,
        "good": 1.0,
        "standard": 1.15,
        "below_average": 1.35,
    }

    OCCUPATION_MULTIPLIERS = {
        "low": 1.0,
        "medium": 1.2,
        "high": 1.5,
    }

    def calculate(self, inputs: PremiumInput) -> PremiumResult:
        base_rate = self._get_base_rate(inputs.policy_type)
        base_premium = base_rate * (inputs.coverage_amount / 100000)

        age_loading = self._calculate_age_loading(inputs.age, base_premium)
        health_loading = self._calculate_health_loading(inputs.health_rating, base_premium)
        smoker_loading = self._calculate_smoker_loading(inputs.smoker, base_premium)
        occupation_loading = self._calculate_occupation_loading(inputs.occupation_risk, base_premium)

        subtotal = base_premium + age_loading + health_loading + smoker_loading + occupation_loading
        tenure_factor = 1 + (inputs.tenure_years * 0.02)
        total_premium = round(subtotal * tenure_factor, 2)
        premium_per_year = round(total_premium / inputs.tenure_years, 2)

        return PremiumResult(
            base_premium=round(base_premium, 2),
            age_loading=round(age_loading, 2),
            health_loading=round(health_loading, 2),
            smoker_loading=round(smoker_loading, 2),
            occupation_loading=round(occupation_loading, 2),
            total_premium=total_premium,
            premium_per_year=premium_per_year,
        )

    def _get_base_rate(self, policy_type: str) -> float:
        rates = {
            "term": 0.015,
            "health": 0.025,
            "motor": 0.035,
            "investment": 0.01,
            "travel": 0.005,
        }
        return rates.get(policy_type, 0.015)

    def _calculate_age_loading(self, age: int, base: float) -> float:
        if age <= 30:
            return 0
        elif age <= 40:
            return base * 0.15
        elif age <= 50:
            return base * 0.30
        elif age <= 60:
            return base * 0.50
        else:
            return base * 0.75

    def _calculate_health_loading(self, rating: str, base: float) -> float:
        multiplier = self.HEALTH_MULTIPLIERS.get(rating, 1.0)
        return base * (multiplier - 1.0)

    def _calculate_smoker_loading(self, smoker: bool, base: float) -> float:
        return base * 0.5 if smoker else 0.0

    def _calculate_occupation_loading(self, risk: str, base: float) -> float:
        multiplier = self.OCCUPATION_MULTIPLIERS.get(risk, 1.0)
        return base * (multiplier - 1.0)
