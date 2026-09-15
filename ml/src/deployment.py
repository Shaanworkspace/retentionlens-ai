"""09 - Deployment: save model and generate deployment artifacts."""
import json
import pickle
from config import MODEL_PATH, METRICS_PATH

def save_model(pipeline):
    MODEL_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(MODEL_PATH, "wb") as f:
        pickle.dump(pipeline, f)
    print(f"Model saved: {MODEL_PATH}")

def save_metrics(metrics: dict):
    METRICS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)
    print(f"Metrics saved: {METRICS_PATH}")
