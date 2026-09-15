from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Prediction
from app.schemas import PredictRequest, PredictResponse
from app.auth import get_current_user
from app.ml.predictor import predict_one

router = APIRouter(prefix="/api", tags=["predict"])

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    data = req.model_dump()
    label, proba, risk = predict_one(data)
    # save prediction for history (keep last 3 per user via query limit)
    try:
        pred = Prediction(
            user_id=user.id,
            tenure=data["tenure"],
            monthly_charges=data["MonthlyCharges"],
            total_charges=data["TotalCharges"],
            contract=data["Contract"],
            internet_service=data["InternetService"],
            payment_method=data["PaymentMethod"],
            churn=label,
            churn_label="Yes" if label == 1 else "No",
            probability=round(proba, 3),
        )
        db.add(pred)
        db.commit()
    except Exception:
        db.rollback()
    return {"churn": label, "churn_label": "Yes" if label == 1 else "No", "probability": round(proba, 3), "risk_category": risk}

@router.get("/predict/history")
def get_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Prediction).filter(Prediction.user_id == user.id).order_by(Prediction.created_at.desc()).limit(3).all()
    return [
        {
            "id": r.id,
            "tenure": r.tenure,
            "contract": r.contract,
            "internet_service": r.internet_service,
            "churn": r.churn,
            "churn_label": r.churn_label,
            "probability": r.probability,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]

@router.get("/health")
def health():
    return {"status": "ok"}
