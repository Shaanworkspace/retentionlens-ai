import io
import csv
import json
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db, Prediction
from app.auth import get_current_user
from app.ml.predictor import predict_one
from app.retention_offers.generator import generate_offers

router = APIRouter(prefix="/api/batch", tags=["batch"])

REQUIRED = ["tenure", "MonthlyCharges", "TotalCharges", "gender", "Partner", "Dependents", "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling", "PaymentMethod"]

def normalize_row(row):
    # case-insensitive mapping
    lower = {k.lower(): v for k, v in row.items()}
    out = {}
    for col in REQUIRED:
        val = row.get(col) or row.get(col.lower()) or lower.get(col.lower())
        if val is None or val == "":
            raise ValueError(f"Missing column: {col}")
        if col in ["tenure"]:
            out[col] = int(float(val))
        elif col in ["MonthlyCharges", "TotalCharges"]:
            out[col] = float(val)
        else:
            out[col] = str(val).strip()
    return out

@router.post("/predict")
async def batch_predict(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not file.filename.lower().endswith((".csv", ".txt")):
        raise HTTPException(400, "Only CSV files allowed")
    content = await file.read()
    if len(content) > 20 * 1024 * 1024:
        raise HTTPException(400, "File too large (max 20MB)")
    try:
        text = content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise HTTPException(400, "Invalid CSV - no header")
    except Exception as e:
        raise HTTPException(400, f"CSV parse error: {e}")

    results = []
    churn_count = 0
    for idx, raw in enumerate(reader, start=1):
        if idx > 5000:
            break
        try:
            data = normalize_row(raw)
            label, proba = predict_one(data)
            # GenAI offer per row
            offers = generate_offers({**data, "churn_prob": proba}, db)["offers_text"] if label == 1 else "Low risk - nurture"
            if label == 1:
                churn_count += 1
            # save to DB (batch)
            try:
                db.add(Prediction(user_id=user.id, tenure=data["tenure"], monthly_charges=data["MonthlyCharges"], total_charges=data["TotalCharges"], contract=data["Contract"], internet_service=data["InternetService"], payment_method=data["PaymentMethod"], churn=label, churn_label="Yes" if label==1 else "No", probability=round(proba,3), offers=offers[:2000]))
                if idx % 100 == 0:
                    db.commit()
            except Exception:
                db.rollback()
            results.append({"row": idx, "churn": label, "churn_label": "Yes" if label==1 else "No", "probability": round(proba,3), "offers": offers, "data": data})
        except Exception as e:
            results.append({"row": idx, "error": str(e), "data": raw})

    db.commit()
    total = len(results)
    return {
        "total": total,
        "churn_count": churn_count,
        "retained_count": total - churn_count,
        "churn_rate": round(churn_count/total*100, 1) if total else 0,
        "results": results[:1000],
    }

@router.post("/predict/stream")
async def batch_predict_stream(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    return await batch_predict(file, db, user)
