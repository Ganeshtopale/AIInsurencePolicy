import os
import logging
import numpy as np
import pandas as pd
from typing import Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, classification_report

logger = logging.getLogger(__name__)

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODELS_DIR = os.path.join(BASE_DIR, "models")
os.makedirs(MODELS_DIR, exist_ok=True)

NUM_POLICIES = 8
RANDOM_SEED = 42
np.random.seed(RANDOM_SEED)


def _generate_synthetic_data(n_samples: int = 10000) -> pd.DataFrame:
    ages = np.random.randint(18, 70, size=n_samples)
    genders = np.random.choice(["male", "female"], size=n_samples)
    occupations = np.random.choice(
        ["office", "construction", "healthcare", "education", "mining", "fishing", "retail", "tech"],
        size=n_samples,
    )
    incomes = np.random.uniform(20000, 200000, size=n_samples)
    smoking_statuses = np.random.choice(["smoker", "non-smoker"], size=n_samples, p=[0.2, 0.8])
    bmis = np.random.uniform(16, 40, size=n_samples)
    dependents = np.random.randint(0, 6, size=n_samples)
    coverage_requirements = np.random.uniform(50000, 1000000, size=n_samples)
    budgets = np.random.uniform(1000, 15000, size=n_samples)

    data = pd.DataFrame({
        "age": ages,
        "gender": genders,
        "occupation": occupations,
        "income": incomes,
        "smoking_status": smoking_statuses,
        "bmi": bmis,
        "dependents": dependents,
        "coverage_requirement": coverage_requirements,
        "budget": budgets,
    })
    return data


def _assign_policy_labels(df: pd.DataFrame) -> pd.Series:
    labels = np.zeros(len(df), dtype=int)

    for i in range(len(df)):
        age = df.loc[i, "age"]
        income = df.loc[i, "income"]
        budget = df.loc[i, "budget"]
        coverage = df.loc[i, "coverage_requirement"]
        smoker = df.loc[i, "smoking_status"]
        bmi = df.loc[i, "bmi"]
        deps = df.loc[i, "dependents"]
        occupation = df.loc[i, "occupation"]

        risky_job = occupation in ("construction", "mining", "fishing")

        if age > 50 or (smoker == "smoker" and bmi > 30):
            labels[i] = 2  # Senior Care Plan (policy_id 3)
        elif deps >= 3 and income > 80000:
            labels[i] = 1  # Family Health Plus (policy_id 2)
        elif budget < 2000 and coverage > 50000:
            labels[i] = 0  # Basic Health Shield (policy_id 1)
        elif deps > 0 and income > 100000:
            labels[i] = 4  # Whole Life Assurance (policy_id 5)
        elif deps > 0 and income <= 100000:
            labels[i] = 3  # Term Life Cover (policy_id 4)
        elif risky_job:
            labels[i] = 5  # Auto Protect (policy_id 6)
        elif coverage > 300000:
            labels[i] = 6  # Home Shield (policy_id 7)
        else:
            labels[i] = np.random.randint(0, NUM_POLICIES)

    return pd.Series(labels, name="policy_id")


def _preprocess_features(df: pd.DataFrame) -> Tuple[pd.DataFrame, LabelEncoder]:
    df = df.copy()

    df["gender_male"] = (df["gender"] == "male").astype(int)
    df["occupation_risk"] = df["occupation"].isin(["construction", "mining", "fishing"]).astype(int)
    df["smoker"] = (df["smoking_status"] == "smoker").astype(int)

    le_occupation = LabelEncoder()
    df["occupation_encoded"] = le_occupation.fit_transform(df["occupation"])

    feature_cols = [
        "age", "gender_male", "occupation_risk", "occupation_encoded",
        "income", "smoker", "bmi", "dependents",
        "coverage_requirement", "budget",
    ]
    return df[feature_cols], le_occupation


def train_model(save: bool = True) -> dict:
    logger.info("Generating synthetic training data...")
    df = _generate_synthetic_data(10000)
    df["policy_id"] = _assign_policy_labels(df)

    logger.info("Preprocessing features...")
    X, label_enc = _preprocess_features(df)
    y = df["policy_id"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=RANDOM_SEED, stratify=y,
    )

    logger.info("Training XGBoost classifier...")
    import xgboost as xgb

    model = xgb.XGBClassifier(
        n_estimators=200,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=RANDOM_SEED,
        use_label_encoder=False,
        eval_metric="mlogloss",
    )
    model.fit(
        X_train, y_train,
        eval_set=[(X_test, y_test)],
        verbose=False,
    )

    logger.info("Evaluating model...")
    y_pred = model.predict(X_test)

    metrics = {
        "accuracy": round(accuracy_score(y_test, y_pred), 4),
        "precision_macro": round(precision_score(y_test, y_pred, average="macro", zero_division=0), 4),
        "recall_macro": round(recall_score(y_test, y_pred, average="macro", zero_division=0), 4),
    }

    logger.info("Classification report:\n%s", classification_report(y_test, y_pred, zero_division=0))

    if save:
        model_path = os.path.join(MODELS_DIR, "policy_model.json")
        model.save_model(model_path)
        logger.info("Model saved to %s", model_path)

    return {"metrics": metrics, "n_train": len(X_train), "n_test": len(X_test)}


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
    result = train_model(save=True)
    print("Training complete:", result)
