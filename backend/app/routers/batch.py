import io
import csv
import json
import urllib.request
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.database import get_db, BatchRun, BatchItem
from app.auth import get_current_user
from app.ml.predictor import predict_one

router = APIRouter(prefix="/api/batch", tags=["batch"])

REQUIRED = ["tenure", "MonthlyCharges", "TotalCharges", "gender", "Partner", "Dependents", "PhoneService", "MultipleLines", "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection", "TechSupport", "StreamingTV", "StreamingMovies", "Contract", "PaperlessBilling", "PaymentMethod"]
MAX_DIRECT_BYTES = 20 * 1024 * 1024
MAX_ROWS = 5000

class S3Request(BaseModel):
    url: str
    name: str | None = None

def next_batch_letter(db, user_id: int) -> str:
    count = db.query(BatchRun).filter(BatchRun.user_id == user_id).count()
    n = count
    letters = ""
    while True:
        letters = chr(65 + (n % 26)) + letters
        n = n // 26 - 1
        if n < 0:
            break
    return f"Batch {letters}"

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

def score_rows(rows, db, user, run, cap=MAX_ROWS):
    churn_count = tends_count = stay_count = total = 0
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
            if risk["id"] == 3:
                churn_count += 1
            elif risk["id"] == 2:
                tends_count += 1
            else:
                stay_count += 1
            try:
                db.add(BatchItem(batch_id=run.id, row_no=idx, customer_name=data.get("customer_name"), churn=label, churn_label="Yes" if label == 1 else "No", probability=round(proba, 3), risk_id=risk["id"], risk_label=risk["label"], risk_detail=risk["detail"], data_json=json.dumps(data)))
                if idx % 200 == 0:
                    db.commit()
            except Exception:
                db.rollback()
        except HTTPException:
            raise
        except Exception as e:
            try:
                db.add(BatchItem(batch_id=run.id, row_no=idx, customer_name=None, churn=0, churn_label="Error", probability=0.0, risk_id=0, risk_label="Error", risk_detail=str(e)[:100], data_json=json.dumps(raw, default=str)[:2000]))
            except Exception:
                db.rollback()
    try:
        run.total = total
        run.churn_count = churn_count
        run.tends_count = tends_count
        run.stay_count = stay_count
        run.churn_rate = round(churn_count / total * 100, 1) if total else 0.0
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Could not save batch run")
    return {"run_id": run.id, "name": run.name, "filename": run.filename, "source": run.source, "total": total, "churn_count": churn_count, "tends_count": tends_count, "stay_count": stay_count, "churn_rate": run.churn_rate, "created_at": run.created_at.isoformat() if run.created_at else None}

def make_run(db, user, name, filename, source):
    run = BatchRun(user_id=user.id, name=(name or "").strip()[:120] or next_batch_letter(db, user.id), filename=(filename or "")[:255] or None, source=source)
    db.add(run)
    db.commit()
    db.refresh(run)
    return run

@router.post("/predict")
async def batch_predict(file: UploadFile = File(...), name: str = Form(default=""), source: str = Form(default="upload"), db: Session = Depends(get_db), user=Depends(get_current_user)):
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
        run = make_run(db, user, name, file.filename if source != "paste" else None, source if source in ("upload", "paste") else "upload")
        return score_rows(reader, db, user, run)
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
        fname = url.split("?")[0].rstrip("/").split("/")[-1] or "s3-file.csv"
        run = make_run(db, user, payload.name, fname, "s3")
        return score_rows(reader, db, user, run, cap=200000)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"S3 batch scoring failed: {e}")
    finally:
        try:
            resp.close()
        except Exception:
            pass

@router.get("/runs")
def list_runs(db: Session = Depends(get_db), user=Depends(get_current_user)):
    rows = db.query(BatchRun).filter(BatchRun.user_id == user.id).order_by(BatchRun.created_at.desc()).limit(50).all()
    return [{"id": r.id, "name": r.name, "filename": r.filename, "source": r.source, "total": r.total, "churn_count": r.churn_count, "tends_count": r.tends_count, "stay_count": r.stay_count, "churn_rate": r.churn_rate, "created_at": r.created_at.isoformat() if r.created_at else None} for r in rows]

@router.get("/runs/{run_id}")
def get_run(run_id: int, db: Session = Depends(get_db), user=Depends(get_current_user)):
    run = db.query(BatchRun).filter(BatchRun.id == run_id, BatchRun.user_id == user.id).first()
    if not run:
        raise HTTPException(status_code=404, detail="Batch run not found")
    items = db.query(BatchItem).filter(BatchItem.batch_id == run.id).order_by(BatchItem.row_no).limit(2000).all()
    out = []
    for it in items:
        try:
            data = json.loads(it.data_json) if it.data_json else {}
        except Exception:
            data = {}
        color = "red" if it.risk_id == 3 else "yellow" if it.risk_id == 2 else "green" if it.risk_id == 1 else "grey"
        out.append({"row": it.row_no, "customer_name": it.customer_name, "churn": it.churn, "churn_label": it.churn_label, "probability": it.probability, "risk_category": {"id": it.risk_id, "label": it.risk_label, "detail": it.risk_detail, "color": color}, "data": data})
    return {"id": run.id, "name": run.name, "filename": run.filename, "source": run.source, "total": run.total, "churn_count": run.churn_count, "tends_count": run.tends_count, "stay_count": run.stay_count, "churn_rate": run.churn_rate, "created_at": run.created_at.isoformat() if run.created_at else None, "results": out, "truncated_items": len(out) < run.total}
