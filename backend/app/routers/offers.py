from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db, Prediction
from app.schemas import PredictRequest
from app.auth import get_current_user
from app.ml.predictor import predict_one
from app.retention_offers.generator import generate_offers

router = APIRouter(prefix="/api/retention", tags=["retention"])

@router.post("/offers")
def get_offers(req: PredictRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    data = req.model_dump()
    model_data = {k: v for k, v in data.items() if k != "customer_name"}
    label, proba, risk = predict_one(model_data)
    customer = {**data, "churn_prob": proba, "risk_label": risk["label"], "risk_detail": risk["detail"]}
    result = generate_offers(customer, db)
    pred_id = None
    try:
        pred = Prediction(
            user_id=user.id,
            customer_name=(data.get("customer_name") or "").strip()[:120] or None,
            tenure=data["tenure"],
            monthly_charges=data["MonthlyCharges"],
            total_charges=data["TotalCharges"],
            contract=data["Contract"],
            internet_service=data["InternetService"],
            payment_method=data["PaymentMethod"],
            churn=label,
            churn_label="Yes" if label == 1 else "No",
            probability=round(proba, 3),
            offers=result["offers_text"][:2000],
        )
        db.add(pred)
        db.commit()
        db.refresh(pred)
        pred_id = pred.id
    except Exception:
        db.rollback()
    return {
        "prediction_id": pred_id,
        "churn": label,
        "churn_label": "Yes" if label == 1 else "No",
        "probability": round(proba, 3),
        "risk_category": risk,
        "offers": result["offers"],
        "offers_text": result["offers_text"],
        "history_used": result["history_used"],
    }
