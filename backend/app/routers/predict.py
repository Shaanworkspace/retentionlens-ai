from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Prediction
from app.schemas import PredictRequest, PredictResponse, fill_defaults, MANDATORY_FIELDS
from app.auth import get_current_user
from app.ml.predictor import predict_one

router = APIRouter(prefix="/api", tags=["predict"])

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest, db: Session = Depends(get_db), user=Depends(get_current_user)):
    data = fill_defaults(req.model_dump())
    missing = [f for f in MANDATORY_FIELDS if data.get(f) is None or (isinstance(data.get(f), str) and not data[f].strip())]
    if missing:
        raise HTTPException(status_code=422, detail=f"Mandatory fields missing: {', '.join(missing)}")
    model_data = {k: v for k, v in data.items() if k != "customer_name"}
    try:
        label, proba, risk = predict_one(model_data)
    except FileNotFoundError as e:
        raise HTTPException(status_code=500, detail=f"Model unavailable: {e}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {e}")
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
        )
        db.add(pred)
        db.commit()
        db.refresh(pred)
        pred_id = pred.id
    except Exception:
        db.rollback()
    return {"prediction_id": pred_id, "churn": label, "churn_label": "Yes" if label == 1 else "No", "probability": round(proba, 3), "risk_category": risk}

@router.get("/predict/history")
def get_history(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(Prediction).filter(Prediction.user_id == user.id).order_by(Prediction.created_at.desc()).limit(10).all()
    return [
        {
            "id": r.id,
            "customer_name": r.customer_name,
            "tenure": r.tenure,
            "contract": r.contract,
            "internet_service": r.internet_service,
            "churn": r.churn,
            "churn_label": r.churn_label,
            "probability": r.probability,
            "offers": r.offers,
            "offered_index": r.offered_index,
            "outcome": r.outcome,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]

@router.get("/predict/{pred_id}")
def get_one(pred_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    r = db.query(Prediction).filter(Prediction.id == pred_id, Prediction.user_id == user.id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Prediction not found")
    return {
        "id": r.id,
        "customer_name": r.customer_name,
        "tenure": r.tenure,
        "monthly_charges": r.monthly_charges,
        "total_charges": r.total_charges,
        "contract": r.contract,
        "internet_service": r.internet_service,
        "payment_method": r.payment_method,
        "churn": r.churn,
        "churn_label": r.churn_label,
        "probability": r.probability,
        "offers": r.offers,
        "offered_index": r.offered_index,
        "outcome": r.outcome,
        "created_at": r.created_at.isoformat() if r.created_at else None,
    }

@router.get("/health")
def health():
    return {"status": "ok"}
