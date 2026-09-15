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

def predict_one(data: dict):
    model = get_model()
    if model is None:
        raise FileNotFoundError("Model not found. Run ml/src/pipeline.py first.")
    df = pd.DataFrame([data])
    proba = float(model.predict_proba(df)[0, 1])
    label = int(proba >= 0.5)
    return label, proba
