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
| ML | Python, Pandas, Scikit-learn, XGBoost |
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
5. **Feature Engineering** `05_feature_engineering.py` - TenureGroup, HasMultipleServices, IsLongContract
6. **Train/Test Split** `06_train_test_split.py` - 80/20 stratified
7. **Model** `07_model.py` - Logistic Regression, Random Forest, XGBoost with 5-fold CV
8. **Evaluation** `08_evaluation.py` - Accuracy, Precision, Recall, F1, ROC-AUC, Confusion Matrix
9. **Deployment** `09_deployment.py` - Saves model.pkl and metrics.json

Best model: **XGBoost - F1 0.80, ROC-AUC 0.84**

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
| POST | /api/auth/signup | No | email, password | access_token |
| POST | /api/auth/login | No | email, password | access_token |
| POST | /api/predict | JWT | 18 churn features | churn, probability |
| GET | /api/health | No | - | status ok |

## Docker

```bash
docker compose up --build
# frontend http://localhost:5173, backend http://localhost:8000
```

## CI

GitHub Actions runs backend compile, ml compile and frontend build on every push.
