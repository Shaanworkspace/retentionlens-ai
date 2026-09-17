import io
import csv
import urllib.request
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, Prediction
from app.auth import get_current_user
from app.ml.predictor import predict_one

router = APIRouter(prefix="/api/batch", tags=["batch"])

REQUIRED = ["tenure", "MonthlyCharges", "TotalCharges", "gender", "Partner", "Dependents", "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling", "PaymentMethod"]
MAX_DIRECT_BYTES = 20 * 1024 * 1024
MAX_ROWS = 5000

class S3Request(BaseModel):
    url: str

def normalize_row(row):
    lower = {str(k).lower(): v for k, v in row.items()}
    out = {}
    for col in REQUIRED:
        val = row.get(col) or row.get(col.lower()) or lower.get(col.lower())
        if val is None or str(val).strip() == "":
            raise ValueError(f"Missing column: {col}")
        if col == "tenure":
            out[col] = int(float(val))
        elif col in ["MonthlyCharges", "TotalCharges"]:
            out[col] = float(val)
        else:
            out[col] = str(val).strip()
    name = row.get("customer_name") or lower.get("customer_name") or ""
    out["customer_name"] = str(name).strip()[:120] or None
    return out

def score_rows(rows, db, user, cap=MAX_ROWS):
    results = []
    churn_count = 0
    total = 0
    try:
        model_ok = True
    except Exception:
        model_ok = True
    for idx, raw in enumerate(rows, start=1):
        if idx > cap:
            break
        total = idx
        try:
            data = normalize_row(raw)
            model_data = {k: v for k, v in data.items() if k != "customer_name"}
            try:
                label, proba, risk = predict_one(model_data)
            except FileNotFoundError as e:
                raise HTTPException(status_code=500, detail=f"Model unavailable: {e}")
            if label == 1:
                churn_count += 1
            try:
                db.add(Prediction(user_id=user.id, customer_name=data.get("customer_name"), tenure=data["tenure"], monthly_charges=data["MonthlyCharges"], total_charges=data["TotalCharges"], contract=data["Contract"], internet_service=data["InternetService"], payment_method=data["PaymentMethod"], churn=label, churn_label="Yes" if label == 1 else "No", probability=round(proba, 3)))
                if idx % 100 == 0:
                    db.commit()
            except Exception:
                db.rollback()
            results.append({"row": idx, "customer_name": data.get("customer_name"), "churn": label, "churn_label": "Yes" if label == 1 else "No", "probability": round(proba, 3), "risk_category": risk, "data": data})
        except HTTPException:
            raise
        except Exception as e:
            results.append({"row": idx, "error": str(e), "data": raw})
    try:
        db.commit()
    except Exception:
        db.rollback()
    shown = results[:1000]
    return {"total": total, "churn_count": churn_count, "retained_count": total - churn_count, "churn_rate": round(churn_count / total * 100, 1) if total else 0, "results": shown, "truncated": total > len(shown)}

@router.post("/predict")
async def batch_predict(file: UploadFile = File(...), db: Session = Depends(get_db), user=Depends(get_current_user)):
    if not file.filename or not file.filename.lower().endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files allowed here - for bigger files use the S3 option")
    try:
        content = await file.read()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read upload: {e}")
    if len(content) > MAX_DIRECT_BYTES:
        raise HTTPException(status_code=413, detail="File over 20MB - use the S3 bucket option for large files")
    try:
        text = content.decode("utf-8", errors="ignore")
        reader = csv.DictReader(io.StringIO(text))
        if not reader.fieldnames:
            raise ValueError("no header row found")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"CSV parse error: {e}")
    try:
        return score_rows(reader, db, user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Batch scoring failed: {e}")

@router.post("/s3")
def batch_from_s3(payload: S3Request, db: Session = Depends(get_db), user=Depends(get_current_user)):
    url = (payload.url or "").strip()
    if not (url.startswith("https://") or url.startswith("http://")):
        raise HTTPException(status_code=400, detail="Give a valid https S3 URL (bucket object made public or presigned)")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "RetentionLens/1.0"})
        resp = urllib.request.urlopen(req, timeout=60)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not fetch S3 URL: {e}")
    def line_iter():
        buf = b""
        while True:
            chunk = resp.read(256 * 1024)
            if not chunk:
                break
            buf += chunk
            *lines, buf = buf.split(b"\n")
            for ln in lines:
                yield ln.decode("utf-8", errors="ignore")
        if buf.strip():
            yield buf.decode("utf-8", errors="ignore")
    try:
        reader = csv.DictReader(line_iter())
        if not reader.fieldnames:
            raise ValueError("no header row found")
        return score_rows(reader, db, user, cap=200000)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 batch scoring failed: {e}")
    finally:
        try:
            resp.close()
        except Exception:
            pass
