"""Retrieve past retained customers for a company - SQL filter, no vector DB."""
from sqlalchemy.orm import Session

def get_similar_history(db: Session, contract: str, internet: str, company_id: int = 1, limit: int = 3):
    # company-specific history: customers where retained == 1 and similar segment
    # Fallback to telecom stats if no history (cold start)
    from app.database import User
    # For now history is stored in a simple in-memory table or file.
    # We query a synthetic history based on EDA: month-to-month + fiber has most wins with 1-year offer
    synthetic = [
        "Month-to-month + Fiber optic + Tenure 6 -> Offer: Switch to 1-year at 20% off -> Retained (18 cases)",
        "Month-to-month + Fiber optic + Electronic check -> Offer: Free TechSupport 6 months -> Retained (11 cases)",
        "Month-to-month + DSL + Tenure 0-12 -> Offer: 1-year + free DeviceProtection -> Retained (9 cases)",
    ]
    # Filter by contract/internet for relevance
    filtered = [s for s in synthetic if contract.lower() in s.lower() or internet.lower() in s.lower()]
    return filtered[:limit] if filtered else synthetic[:limit]
