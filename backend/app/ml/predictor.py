import pathlib
import pickle
import json
import pandas as pd
import numpy as np

ROOTS = [
    pathlib.Path(__file__).resolve().parents[3] / "ml" / "models" / "final_model.pkl",
    pathlib.Path(__file__).resolve().parents[3] / "ml" / "models" / "model.pkl",
    pathlib.Path(__file__).resolve().parents[2] / "ml" / "models" / "model.pkl",
    pathlib.Path("/app/ml/models/final_model.pkl"),
    pathlib.Path("/app/ml/models/model.pkl"),
]
THRESHOLD_PATHS = [
    pathlib.Path(__file__).resolve().parents[3] / "ml" / "models" / "final_threshold.json",
    pathlib.Path("/app/ml/models/final_threshold.json"),
]
_model = None
_threshold = None

def get_model():
    global _model
    if _model is None:
        for p in ROOTS:
            if p.exists():
                with open(p, "rb") as f:
                    _model = pickle.load(f)
                return _model
        return None
    return _model

def get_threshold():
    global _threshold
    if _threshold is not None:
        return _threshold
    for p in THRESHOLD_PATHS:
        if p.exists():
            try:
                with open(p) as f:
                    _threshold = float(json.load(f).get("threshold", 0.5))
                    return _threshold
            except Exception:
                continue
    _threshold = 0.5
    return _threshold

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # AvgMonthlySpend = TotalCharges / tenure (tenure 0 safe)
    df["AvgMonthlySpend"] = df["TotalCharges"] / df["tenure"].replace(0, 1)
    df["AvgMonthlySpend"] = df["AvgMonthlySpend"].replace([np.inf, -np.inf], 0).fillna(0)
    # ServiceCount
    service_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies"]
    df["ServiceCount"] = (df[service_cols] == "Yes").sum(axis=1)
    # SupportServiceCount
    support_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport"]
    df["SupportServiceCount"] = (df[support_cols] == "Yes").sum(axis=1)
    # IsMonthToMonth
    df["IsMonthToMonth"] = (df["Contract"] == "Month-to-month").astype(int)
    return df

def get_risk_category(proba: float):
    # 3-tier research-backed: Simon 0-50 Low / 51-75 Medium / 76-100 High + ChurnZero Green 0-33 / Yellow 34-67 / Red 68-100
    # Combined to 3 for telecom: Will Stay / Tends to Churn / Will Churn
    if proba < 0.40:
        return {"id": 1, "label": "Will Stay", "detail": "Not Churn - Positive", "color": "green", "score": "0-40", "action": "Nurture & upsell"}
    if proba < 0.65:
        return {"id": 2, "label": "Tends to Churn", "detail": "At Risk - Needs Attention", "color": "yellow", "score": "40-65", "action": "Proactive outreach"}
    return {"id": 3, "label": "Will Churn", "detail": "Churning - Critical", "color": "red", "score": "65-100", "action": "Immediate intervention"}

def predict_one(data: dict):
    model = get_model()
    if model is None:
        raise FileNotFoundError("Model not found. Run ml/src/pipeline.py first.")
    df = pd.DataFrame([data])
    df = engineer_features(df)
    proba = float(model.predict_proba(df)[0, 1])
    threshold = get_threshold()
    label = int(proba >= threshold)
    risk = get_risk_category(proba)
    return label, proba, risk
