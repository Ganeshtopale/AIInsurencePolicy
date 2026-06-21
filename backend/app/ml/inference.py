import os
import logging
from typing import List, Tuple, Optional
import numpy as np

logger = logging.getLogger(__name__)

MODEL_PATH = os.path.join(os.path.dirname(__file__), "models", "policy_model.json")

_fallback_policies = [
    {"policy_id": 1, "policy_name": "Basic Health Shield", "provider": "SecureLife", "type": "health", "premium": 2500, "coverage": 100000},
    {"policy_id": 2, "policy_name": "Family Health Plus", "provider": "MediCare", "type": "health", "premium": 4500, "coverage": 300000},
    {"policy_id": 3, "policy_name": "Senior Care Plan", "provider": "GoldenYears", "type": "health", "premium": 6000, "coverage": 200000},
    {"policy_id": 4, "policy_name": "Term Life Cover", "provider": "SecureLife", "type": "life", "premium": 1800, "coverage": 500000},
    {"policy_id": 5, "policy_name": "Whole Life Assurance", "provider": "LifeGuard", "type": "life", "premium": 8000, "coverage": 1000000},
    {"policy_id": 6, "policy_name": "Auto Protect", "provider": "DriveSure", "type": "auto", "premium": 3200, "coverage": 150000},
    {"policy_id": 7, "policy_name": "Home Shield", "provider": "PropSafe", "type": "home", "premium": 5000, "coverage": 400000},
    {"policy_id": 8, "policy_name": "Travel Guard", "provider": "GlobeAssure", "type": "travel", "premium": 1200, "coverage": 50000},
]


def _load_model():
    try:
        import xgboost as xgb
        if os.path.exists(MODEL_PATH):
            model = xgb.Booster()
            model.load_model(MODEL_PATH)
            logger.info("XGBoost model loaded from %s", MODEL_PATH)
            return model
        else:
            logger.warning("Model file not found at %s, using fallback", MODEL_PATH)
            return None
    except ImportError:
        logger.warning("xgboost not installed, using fallback prediction")
        return None
    except Exception as e:
        logger.error("Error loading model: %s", e)
        return None


model = _load_model()


def _extract_features(
    age: int,
    gender: str,
    occupation: str,
    income: float,
    smoking_status: str,
    bmi: float,
    dependents: int,
    coverage_requirement: float,
    budget: float,
) -> np.ndarray:
    gender_num = 1 if gender and gender.lower() == "male" else 0
    occupation_risk = 1 if occupation and occupation.lower() in ("construction", "mining", "fishing") else 0
    smoker = 1 if smoking_status and smoking_status.lower() == "smoker" else 0

    features = np.array([
        age / 100.0,
        gender_num,
        occupation_risk,
        income / 200000.0,
        smoker,
        bmi / 50.0,
        dependents / 10.0,
        coverage_requirement / 1000000.0,
        budget / 100000.0,
    ], dtype=np.float32).reshape(1, -1)
    return features


def _fallback_predict(
    age: int,
    budget: float,
    coverage_requirement: float,
    income: float,
    dependents: int,
) -> List[Tuple[int, float, str]]:
    results = []
    for p in _fallback_policies:
        score = 0.5
        if budget >= p["premium"]:
            score += 0.2
        if coverage_requirement <= p["coverage"]:
            score += 0.15
        if income > p["premium"] * 12:
            score += 0.1
        if p["type"] == "health" and age > 40:
            score += 0.1
        if p["type"] == "life" and dependents > 0:
            score += 0.1
        score = min(score, 1.0)
        results.append((p["policy_id"], round(score, 4), p["policy_name"]))
    results.sort(key=lambda x: x[1], reverse=True)
    return results


def predict_best_policy(
    age: int,
    gender: str,
    occupation: str,
    income: float,
    smoking_status: str,
    bmi: float,
    dependents: int,
    coverage_requirement: float,
    budget: float,
    top_k: int = 5,
) -> List[Tuple[int, float, str]]:
    if model is not None:
        try:
            import xgboost as xgb
            features = _extract_features(age, gender, occupation, income, smoking_status, bmi, dependents, coverage_requirement, budget)
            dmat = xgb.DMatrix(features)
            probs = model.predict(dmat)[0]
            num_policies = len(_fallback_policies)
            if len(probs) >= num_policies:
                policy_ids = list(range(1, num_policies + 1))
                scored = list(zip(policy_ids, probs.tolist()[:num_policies]))
                scored.sort(key=lambda x: x[1], reverse=True)
                name_map = {p["policy_id"]: p["policy_name"] for p in _fallback_policies}
                return [(pid, round(prob, 4), name_map.get(pid, f"Policy-{pid}")) for pid, prob in scored[:top_k]]
        except Exception as e:
            logger.error("Model prediction failed: %s, falling back", e)

    return _fallback_predict(age, budget, coverage_requirement, income, dependents)[:top_k]


def get_policy_recommendation(features: dict, top_k: int = 5) -> List[dict]:
    results = predict_best_policy(
        age=features.get("age", 30),
        gender=features.get("gender", "male"),
        occupation=features.get("occupation", "office"),
        income=features.get("income", 50000),
        smoking_status=features.get("smoking_status", "non-smoker"),
        bmi=features.get("bmi", 22.0),
        dependents=features.get("dependents", 0),
        coverage_requirement=features.get("coverage_requirement", 200000),
        budget=features.get("budget", 5000),
        top_k=top_k,
    )
    return [
        {"policy_id": r[0], "probability": r[1], "policy_name": r[2]}
        for r in results
    ]
