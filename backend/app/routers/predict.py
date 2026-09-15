from fastapi import APIRouter, Depends
from app.schemas import PredictRequest, PredictResponse
from app.auth import get_current_user
from app.ml.predictor import predict_one

router = APIRouter(prefix="/api", tags=["predict"])

@router.post("/predict", response_model=PredictResponse)
def predict(req: PredictRequest, user=Depends(get_current_user)):
    label, proba = predict_one(req.model_dump())
    return {"churn": label, "churn_label": "Yes" if label == 1 else "No", "probability": round(proba, 3)}

@router.get("/health")
def health():
    return {"status": "ok"}
