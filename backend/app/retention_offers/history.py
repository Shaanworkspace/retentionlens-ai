"""Retrieve minimal synthetic retention history without a vector database."""
from sqlalchemy.orm import Session

def get_similar_history(db: Session, contract: str, internet: str, limit: int = 3):
    synthetic = [
        "Month-to-month + Fiber optic + Tenure 6 -> Offer: Switch to 1-year at 20% off -> Retained (18 cases)",
        "Month-to-month + Fiber optic + Electronic check -> Offer: Free TechSupport 6 months -> Retained (11 cases)",
        "Month-to-month + DSL + Tenure 0-12 -> Offer: 1-year + free DeviceProtection -> Retained (9 cases)",
    ]
    terms = (contract.lower(), internet.lower())
    filtered = [item for item in synthetic if any(term in item.lower() for term in terms if term)]
    return filtered[:limit] if filtered else synthetic[:limit]
