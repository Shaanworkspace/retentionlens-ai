# Churn Prediction System — End-to-End ML Pipeline

Predicts telecom customer churn from 7043 IBM Telco records. Covers the full pipeline: collection, cleaning, EDA, feature engineering, training, evaluation and deployment with FastAPI and React.

Live: `frontend` on Vercel, `backend` on Render. Local: `docker compose up`.

## Architecture

```
React (Tailwind) -> FastAPI (JWT) -> Scikit-learn Pipeline -> SQLite
       |                    |
     /predict            /api/auth
```

## Tech Stack

| Layer | Tech |
|-------|------|
| ML | Python, Pandas, Scikit-learn, imbalanced-learn (SMOTE) |
| Backend | FastAPI, SQLAlchemy, JWT, SQLite |
| Frontend | React 18, Vite, Tailwind, React Router, Axios |
| Deploy | Docker, Docker Compose, GitHub Actions |

## Project Structure

```
frontend/src/pages  Landing, Login, Signup, Dashboard, Predict
frontend/src/services  api.js (axios with JWT)
backend/app/routers  auth.py (signup/login), predict.py (/predict, /health)
backend/app/ml  predictor.py (loads ml/models/model.pkl)
ml/src  01_data_collection.py ... 09_deployment.py, pipeline.py
```

## ML Pipeline

1. **Collection** `01_data_collection.py` - Downloads IBM Telco CSV from GitHub
2. **Cleaning** `02_data_cleaning.py` - TotalCharges to numeric, median impute, drop customerID and duplicates
3. **Preprocessing** `03_preprocessing.py` - ColumnTransformer (StandardScaler for numeric, OneHotEncoder for categorical)
4. **EDA** `04_eda.py` - Churn rate 26%, month-to-month contract has highest churn
5. **Feature Engineering** `05_feature_engineering.py` - AvgMonthlySpend, ServiceCount, SupportServiceCount, IsMonthToMonth
6. **Train/Test Split** `06_train_test_split.py` - 80/20 stratified
7. **Model** `07_model.py` - Logistic Regression, Random Forest with SMOTE (random_state=42, train-only) and 5-fold CV
8. **Evaluation** `08_evaluation.py` - Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
9. **Deployment** `09_deployment.py` - Saves model.pkl and metrics.json

Best model: **Logistic Regression + SMOTE - F1 0.612, Recall 0.763, ROC-AUC 0.840 (CV F1 0.630±0.019)**

## Run Locally

```bash
# ML
cd ml && pip install -r requirements.txt && python src/pipeline.py

# Backend
cd backend && pip install -r requirements.txt && uvicorn app.main:app --reload --port 8000
# http://localhost:8000/docs

# Frontend
cd frontend && npm install && npm run dev
# http://localhost:5173
```

## API

| Method | Path | Auth | Body | Response |
|--------|------|------|------|----------|
| POST | /api/auth/signup | No | name, company, email, password | access_token |
| POST | /api/auth/login | No | email, password | access_token |
| GET | /api/auth/me | JWT | - | name, company, email |
| POST | /api/predict | JWT | 6 mandatory + 12 optional features | churn, probability, risk tier |
| GET | /api/predict/history | JWT | - | last 10 predictions |
| GET | /api/predict/{id} | JWT | - | single prediction |
| POST | /api/batch/predict | JWT | CSV file + name | batch run summary |
| POST | /api/batch/s3 | JWT | S3 URL + name | batch run summary |
| GET | /api/batch/runs | JWT | - | batch history |
| GET | /api/batch/runs/{id} | JWT | - | run + items |
| GET | /api/batch/runs/{id}/segment/{seg} | JWT | seg=churn/tends/stay | segment + alert tiers |
| GET | /api/health | No | - | status ok |

## Fields: Mandatory vs Optional

Only 6 fields drive the score (top churn drivers from EDA + feature importance):

**Mandatory** (missing any = 422): `tenure`, `MonthlyCharges`, `TotalCharges`, `Contract`, `InternetService`, `PaymentMethod`

**Optional** (blank = safe dataset-mode default): `gender` (Male), `Partner`/`Dependents` (No), `PhoneService` (Yes), `MultipleLines` (No), `OnlineSecurity`/`OnlineBackup`/`DeviceProtection`/`TechSupport`/`StreamingTV`/`StreamingMovies` (No), `PaperlessBilling` (Yes)

## Data Notes (from research + EDA)

* **Top drivers:** Month-to-month contract (42% churn), fiber optic (41%), tenure 0-12m (47%), electronic check (45%), no TechSupport/add-ons. Weak signals kept but low-weight: gender (50/50 split), PhoneService (near-constant).
* **Missing values:** TotalCharges blanks (11 rows, 0.16%) -> median imputation. MICE tested in literature (+1.8pp) but rejected as overkill for 0.16%.
* **Feature engineering kept:** AvgMonthlySpend (TotalCharges/tenure, tenure 0 safe), ServiceCount (Yes among 6 services), SupportServiceCount (Yes among 4 support services), IsMonthToMonth (1 if Month-to-month else 0). **Rejected:** customerID (identifier, zero signal), TenureGroup bins (redundant with numeric tenure + AvgMonthlySpend). Leak-proof: no NaN/inf (checked 0).
* **Leakage guard:** all transforms inside sklearn Pipeline + ColumnTransformer fitted only on train, SMOTE on train only (2646 synthetic, random_state=42), stratified 80/20 split, 5-fold CV. Test untouched.

## Docker

```bash
docker compose up --build
# frontend http://localhost:5173, backend http://localhost:8000
```

## CI

GitHub Actions runs backend compile, ml compile and frontend build on every push.
