"""Company workspace - each telecom company gets isolated records."""
from sqlalchemy.orm import Session
from app.database import User

def get_company_context(db: Session, company_id: int = 1):
    # Placeholder for multi-tenant: later company_id comes from JWT
    return {"company_id": company_id, "name": "Demo Telecom"}
