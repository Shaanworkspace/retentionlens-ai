# Part 1 — Project Inventory (Q1-20)

## 1. Project name
**RetentionLens AI — Telecom Churn Prediction**. VERIFIED FROM CODE (`README.md:1`, `frontend/package.json` name churn-frontend, `frontend/index.html` title "RetentionLens AI").

## 2. Exact purpose
Score every telecom customer into 3 risk tiers (Will Stay / Tends to Churn / Will Churn) with probability, for both single and batch CSV analysis. VERIFIED FROM CODE (`backend/app/ml/predictor.py:23-31` tiers + `README.md` + `frontend/src/pages/BatchAnalysis.jsx` copy).

## 3. Main problem
Telecom MRR is lost to churn; teams cannot tell who will churn and who tends to churn, nor do it at batch scale (5000 rows). VERIFIED FROM CODE (batch upload flow + dashboard history).

## 4. Main user flow
Signup with name+company+email → login (JWT) → Dashboard shows company welcome + history → Single Customer form OR Batch CSV (drag/paste/upload/S3) → prediction → 3-tier result → Batch History → Segment page → Customer detail. VERIFIED FROM CODE (`frontend/src/App.jsx` routes).

## 5. Major folders
- `backend/app/` — FastAPI, routers, auth, schemas, ml. VERIFIED FROM CODE.
- `backend/app/ml/` — `predictor.py` (pickle load + risk tiers). VERIFIED FROM CODE.
- `backend/app/routers/` — `auth.py`, `predict.py`, `batch.py`. VERIFIED FROM CODE.
- `backend/app/client_companies/`, `customer_records/` — placeholder services (no logic). VERIFIED FROM CODE.
- `ml/` — 9-step pipeline `src/01_...` to `src/pipeline.py`, models, reports. VERIFIED FROM CODE.
- `frontend/` — React 18 + Vite + Tailwind + Recharts + React Router + Axios. VERIFIED FROM CODE.
- `samples/` — 2 sample files. VERIFIED FROM CODE.
- No `tests/` directory. VERIFIED FROM CODE (glob returned nothing).

## 6. Important files
- `backend/app/main.py` — app + CORS + routers. VERIFIED FROM CODE.
- `backend/app/database.py` — 4 tables (users, predictions, batch_runs, batch_items). VERIFIED FROM CODE.
- `backend/app/schemas.py` — 6 mandatory + 12 optional fields. VERIFIED FROM CODE.
- `backend/app/ml/predictor.py` — model load + 3-tier thresholds. VERIFIED FROM CODE.
- `ml/src/pipeline.py`, `config.py`, `01_data_collection.py` … `09_deployment.py`. VERIFIED FROM CODE.
- `ml/models/model.pkl` (4KB) + `ml/reports/metrics.json` (accuracy 0.805 …). VERIFIED FROM CODE.
- `frontend/src/services/api.js`, `App.jsx`, `pages/*`, `components/*`. VERIFIED FROM CODE.
- `backend/Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml`. VERIFIED FROM CODE.

## 7. Frontend technology
React 18.2.0 + Vite 5.0.12 + Tailwind 3.4.1 + Recharts 3.10.1 + React Router 6.22.3 + Axios 1.6.7. VERIFIED FROM CODE (`frontend/package.json`).

## 8. Backend technology
FastAPI + Uvicorn + SQLAlchemy 2.0 + Pydantic + Bcrypt/Passlib + python-jose. VERIFIED FROM CODE.

## 9. ML/NLP technology
Scikit-learn (Pipeline, ColumnTransformer, RandomForest, LogisticRegression) + XGBoost. No transformers, no BERT, no LLM. VERIFIED FROM CODE.

## 10. Database
MySQL (Aiven) via pymysql when `DATABASE_URL` set, else SQLite. 4 tables: users, predictions, batch_runs, batch_items. VERIFIED FROM CODE.

## 11. Deployment platform
Frontend: Vercel. Backend: Render (Docker, Python 3.11-slim). No EC2. VERIFIED FROM CODE (`README.md:5`, `frontend/.env.production`, `backend/Dockerfile`).

## 12. Docker usage
Yes. Backend `Dockerfile` python:3.11-slim; copies requirements + app + ml. Frontend Dockerfile node:18-alpine → nginx. `docker-compose.yml` runs both. VERIFIED FROM CODE.

## 13. Authentication/security
Yes: Bcrypt hash + HS256 JWT (60 min, exp in payload). VERIFIED FROM CODE (`backend/app/auth.py`).

## 14. External APIs/services
None. No LLM, no HuggingFace, no Groq call in current code. VERIFIED FROM CODE (grep for groq/genai = zero hits after removal).

## 15. Model files/artifacts
`ml/models/model.pkl` (LogisticRegression pipeline, 4KB). `ml/reports/metrics.json` with accuracy, f1 etc. `backend/ml/models/model.pkl` duplicate for Docker. VERIFIED FROM CODE.

## 16. Configuration files
`backend/app/config.py` (ENV, SECRET_KEY, DATABASE_URL, CORS), `.env.example` (SECRET_KEY, ALGORITHM, DATABASE_URL, CORS, ENV). VERIFIED FROM CODE.

## 17. Environment variables used by code
`ENV`, `SECRET_KEY`, `ALGORITHM`, `ACCESS_TOKEN_EXPIRE_MINUTES`, `DATABASE_URL`, `CORS_ORIGINS` (backend); `VITE_API_URL`, `VITE_APP_NAME`, `VITE_ENV` (frontend). VERIFIED FROM CODE.

## 18. Build/deployment files
`Dockerfile`, `docker-compose.yml`, `.github/workflows/ci.yml` (backend+ml only, frontend removed), `frontend/.env.production` (Render placeholder). VERIFIED FROM CODE.

## 19. Scripts/notebooks for training
No notebooks. Training is `ml/src/pipeline.py` calling `01_...` to `09_...` scripts. VERIFIED FROM CODE.

## 20. Unused/dead code
- `frontend/src/components/KpiCard.jsx`, `DashboardInsights.jsx`, `EmptyState.jsx`, `Skeleton.jsx` — zero imports. VERIFIED.
- `frontend/src/pages/Predictions.jsx`, `Customers.jsx`, `HealthScores.jsx`, `Data.jsx`, `Settings.jsx` — static shells, no api calls, not in Sidebar (unreachable). VERIFIED.
- `GROQ_API_KEY` lines in old env files — removed. VERIFIED.
