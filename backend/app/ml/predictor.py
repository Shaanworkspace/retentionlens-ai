import pathlib
import pickle
import pandas as pd

MODEL_PATH = pathlib.Path(__file__).resolve().parents[3] / "ml" / "models" / "model.pkl"
_model = None

def get_model():
    global _model
    if _model is None:
        if not MODEL_PATH.exists():
            return None
        with open(MODEL_PATH, "rb") as f:
            _model = pickle.load(f)
    return _model

def get_risk_category(proba: float):
    # 5-tier based on Inkeep + Simon + ChurnZero research: 81-100 Thriving, 61-80 Healthy, 41-60 At-Risk, 0-40 Critical
    # Adapted to churn probability (inverse of health)
    if proba < 0.20:
        return {"id": 1, "label": "Loyal", "detail": "Not Tends to Churn", "color": "green", "score": "81-100", "action": "Nurture & upsell"}
    if proba < 0.40:
        return {"id": 2, "label": "Stable", "detail": "Low Tendency to Churn", "color": "green", "score": "61-80", "action": "Standard engagement"}
    if proba < 0.55:
        return {"id": 3, "label": "At Risk", "detail": "Tends to Churn", "color": "yellow", "score": "41-60", "action": "Proactive outreach"}
    if proba < 0.75:
        return {"id": 4, "label": "High Risk", "detail": "Strong Tendency to Churn", "color": "orange", "score": "20-40", "action": "Retention offer"}
    return {"id": 5, "label": "Critical", "detail": "Will Churn", "color": "red", "score": "0-20", "action": "Immediate intervention"}

def predict_one(data: dict):
    model = get_model()
    if model is None:
        raise FileNotFoundError("Model not found. Run ml/src/pipeline.py first.")
    df = pd.DataFrame([data])
    proba = float(model.predict_proba(df)[0, 1])
    label = int(proba >= 0.5)
    risk = get_risk_category(proba)
    return label, proba, risk
