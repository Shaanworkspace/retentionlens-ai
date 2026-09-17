# Parts 2-3 — Architecture + End-to-End Request (Q21-49)

## 21. Overall architecture
Layered monolith: `Vercel React → Render FastAPI → Scikit-learn Pipeline (pickle) → Aiven MySQL`. Single deployable backend. VERIFIED FROM CODE (`README.md` + `backend/` + `ml/` layout).

## 22. Frontend components
`App.jsx` (?view= removed, now React Router), `Dashboard.jsx` (company welcome + history), `Predict.jsx` (single form), `BatchAnalysis.jsx` (drag/paste/upload/S3), `BatchHistory.jsx`, `BatchResult.jsx`, `SegmentPage.jsx`, `BatchCustomer.jsx`, `CustomerDetail.jsx`, `Profile.jsx`, plus static shells. VERIFIED FROM CODE.

## 23. Backend components
`main.py` (app + CORS) → `auth` + `predict` + `batch` routers → `predictor.py` (model) → `database.py` (4 tables) → response. VERIFIED FROM CODE.

## 24. Where is the ML model located?
`ml/models/model.pkl` at project root + duplicate `backend/ml/models/model.pkl` for Docker. Code tries three paths: `parents[3]/ml/models/model.pkl`, `parents[2]/ml/models/model.pkl`, `/app/ml/models/model.pkl`. VERIFIED FROM CODE (`predictor.py:5-9`).

## 25. Where is the database located?
Aiven MySQL `mysql-197d3cc9...:14273/defaultdb` when `DATABASE_URL` set, else `data/app.db` SQLite. VERIFIED FROM CODE (`database.py:6-19`).

## 26. Where is the model artifact stored?
In git (4KB pickle, NOT excluded by .dockerignore). Also mounted via Docker `COPY ml ./ml`. VERIFIED FROM CODE.

## 27. Where does inference happen?
Inside FastAPI process: `predict_one()` loads pickle, makes `pd.DataFrame([data])`, calls `model.predict_proba()`. VERIFIED FROM CODE (`predictor.py:36-44`).

## 28. Where does preprocessing happen?
Inside the sklearn Pipeline: `ColumnTransformer` with `StandardScaler` for numeric (tenure, MonthlyCharges, TotalCharges) and `OneHotEncoder` for categoricals. No separate Python cleaning at inference besides fill_defaults. VERIFIED FROM CODE (`ml/src/03_preprocessing.py`).

## 29. Where does post-processing happen?
`get_risk_category()` maps probability to 3 tiers (0-40 green, 40-65 yellow, 65-100 red). VERIFIED FROM CODE (`predictor.py:23-31`).

## 30. Frontend ↔ backend
Axios with `VITE_API_URL` or `http://localhost:8000`, Bearer token in `Authorization` header, 401 auto-redirects to login. VERIFIED FROM CODE (`services/api.js:3-22`).

## 31. Backend ↔ model
Direct in-process pickle load (lazy singleton `_model`). Not per-request after first load. VERIFIED FROM CODE.

## 32. Backend ↔ database
SQLAlchemy `SessionLocal`, `get_db()` yields session. No raw SQL except ALTER migrations. VERIFIED FROM CODE.

## 33. Exact data flow
User fills form or drops CSV → Axios POST → FastAPI validates mandatory 6 fields → `fill_defaults()` for optional 12 → `predict_one()` (Pipeline → proba → risk tier) → save to `predictions` or `batch_items` → JSON back → React shows risk card + history + segment graphs. VERIFIED FROM CODE.

## Part 3 — One real request: "tenure 5, Fiber, Month-to-month"
Frontend `Predict.jsx` form → `POST /api/predict` with JSON 19 fields (customer_name + 18 features) → `predict()` in `predict.py:11-36` validates mandatory 6, fills 12 defaults, calls `predict_one()` → tokenizer NOT used (no NLP), model outputs 0.752 → `get_risk_category(0.752)` → Will Churn red → saves to `predictions` table with `customer_name` → returns `{prediction_id, churn, churn_label, probability, risk_category}` → frontend `CustomerBoard` shows red dashboard. For single review NOT saved? Actually saved. VERIFIED FROM CODE.

- Validation: missing mandatory → 422 "Mandatory fields missing: ...". VERIFIED.
- Preprocessing at inference: only `fill_defaults` + Pipeline ColumnTransformer. No lowercasing etc.
- Tokenizer/model call: `pickle.load` + `predict_proba` on DataFrame.
- Storage: `predictions` table, columns tenure, monthly_charges, total_charges, contract, internet_service, payment_method, churn_label, probability, customer_name. VERIFIED.
- Frontend display: `CustomerBoard` with tier color, prob bar, tenure vs churn, contract risk bars. VERIFIED.
