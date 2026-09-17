"""07 - Model: compare LogisticRegression, RandomForest with SMOTE."""
import pandas as pd
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import cross_val_score
from config import RANDOM_STATE
from preprocessing import build_preprocessor

MODELS = {
    "logreg": LogisticRegression(max_iter=1000),
    "rf": RandomForestClassifier(n_estimators=120, random_state=RANDOM_STATE),
}

def build_pipeline(model_name: str) -> Pipeline:
    return Pipeline([
        ("prep", build_preprocessor()),
        ("clf", MODELS[model_name]),
    ])

def compare(X, y):
    results = {}
    for name in MODELS:
        pipe = build_pipeline(name)
        scores = cross_val_score(pipe, X, y, cv=5, scoring="f1")
        results[name] = float(scores.mean())
        print(f"{name}: F1={scores.mean():.3f} (+/- {scores.std():.3f})")
    best = max(results, key=results.get)
    print(f"Best: {best}")
    return best, results
