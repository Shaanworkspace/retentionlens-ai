from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import PredictRequest
from app.auth import get_current_user
from app.ml.predictor import predict_one
from app.retention_offers.generator import generate_offers

router = APIRouter(prefix="/api/retention", tags=["retention"])

@router.post("/offers")
def get_offers(req: PredictRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    data = req.model_dump()
    label, proba = predict_one(data)
    customer = {**data, "churn_prob": proba}
    result = generate_offers(customer, db)
    return {
        "churn": label,
        "churn_label": "Yes" if label == 1 else "No",
        "probability": round(proba, 3),
        "offers": result["offers_text"],
        "history_used": result["history_used"],
    }
