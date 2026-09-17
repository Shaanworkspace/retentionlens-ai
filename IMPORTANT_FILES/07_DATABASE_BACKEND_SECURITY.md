# Parts 13-15 — Database, FastAPI Backend, JWT Security (Q189-241)

## Part 13 — Database (Q189-210)
- 189-190. MySQL (Aiven) when `DATABASE_URL` set, else SQLite. Chosen: managed MySQL, zero ops; SQLite fallback local. VERIFIED FROM CODE (`database.py:6-19`).
- 191-199. Tables (4, `database.py:23-44`):
  - `users`: id PK, name String(120) nullable, company String(160) nullable, email String(255) unique indexed, password_hash String(255).
  - `predictions`: id PK, user_id FK→users indexed, tenure Int, monthly_charges Float, total_charges Float, contract String(50), internet_service String(50), payment_method String(100), churn Int, churn_label String(10), probability Float, offers Text (legacy), customer_name String(120), offered_index Int nullable, outcome String(20) nullable, created_at DateTime.
  - `batch_runs`: id PK, user_id FK, name String(120), filename String(255), source String(20) (upload/paste/s3), total/churn_count/tends_count/stay_count Int, churn_rate Float, created_at DateTime.
  - `batch_items`: id PK, batch_id FK→batch_runs, row_no Int, customer_name String(120), churn Int, churn_label String(10), probability Float, risk_id Int, risk_label String(50), risk_detail String(120), data_json Text, offered_index Int nullable, outcome String(20) nullable.
- 200-205. Predictions stored in `predictions` (single) and `batch_items` (batch). Users in `users`. No vector store. VERIFIED.
- 206-207. Insert: `Prediction(user_id, tenure, ...)` + commit in `predict.py:17-29`; batch via `BatchItem` loop in `batch.py:69-78`. Read: `list_history` limit 10, `get_one`, `list_runs` limit 50, `get_segment` limit 2000. VERIFIED.
- 208-210. ORM = SQLAlchemy 2.0 + ALTER migrations for new columns. No raw SELECT beyond ORM. VERIFIED.

## Part 14 — FastAPI Backend (Q211-225)
- 211. Why FastAPI: auto docs + Pydantic validation + async file upload with tiny code.
- 212-213. Endpoints (all VERIFIED):
  - `GET /` → ok (no auth)
  - `GET /api/health` → ok (no auth)
  - `POST /api/auth/signup` {name,company,email,password} → token
  - `POST /api/auth/login` {email,password} → token
  - `GET /api/auth/me` → profile (auth)
  - `POST /api/predict` {6 mandatory +12 optional} → risk tier (auth, 422 if mandatory missing)
  - `GET /api/predict/history` (10) (auth)
  - `GET /api/predict/{id}` (auth)
  - `POST /api/batch/predict` multipart CSV, 20MB/5000 rows, name optional (auth)
  - `POST /api/batch/s3` {url, name} stream CSV, 200k rows (auth)
  - `GET /api/batch/runs` (50) (auth)
  - `GET /api/batch/runs/{id}` (2000 items) (auth)
  - `GET /api/batch/runs/{id}/segment/{seg}` seg=churn/tends/stay + alert tiers for churn (auth)
  - `GET /api/batch/runs/{id}/items/{row}` (auth)
- 214-218. Validation: Pydantic `fill_defaults` + mandatory check 422, CSV suffix/size/header checks 400/413/422, JWT 401, not-found 404. VERIFIED.
- 219-223. Model loaded ONCE via pickle lazy singleton (`_model` global). Concurrency = Uvicorn single worker + blocking CPU inference (no queue). VERIFIED.
- 224-225. Auth on every `/api/*` except signup/login and health. No roles — user.id filter. VERIFIED.

## Part 15 — JWT/Security (Q226-241)
- 226-228. JWT hand-made with `python-jose` + `passlib` bcrypt (NOT custom PBKDF2 — this project uses passlib). Payload: `sub=email, exp=now+60min`. VERIFIED (`auth.py:5-20`).
- 229-232. Header `{"alg":"HS256","typ":"JWT"}`, HMAC-SHA256 signature, signed not encrypted. VERIFIED.
- 233-235. Validate: Bearer header → decode → exp check → DB user lookup → 401 if any fail. Expired → 401. VERIFIED.
- 236. Auth required: all predict/batch/me/history. VERIFIED.
- 237-241. Secrets via env vars (`.env` not in image, only `.env.example`). Passwords hashed bcrypt. CORS: `CORS_ORIGINS` split. Input validation via Pydantic + fill_defaults. VERIFIED.
