# Parts 22-26 — Improvements, Why-Answers, Cross-Questions, Code Refs, Fact Check (Q329+)

## Part 22 — Improvements (Q329-343)
- Dataset: add fresher telco dumps, balance via class weights.
- Model: try calibrated classifiers, threshold tuning 0.5→optimal by F1.
- Vector search / RAG / LLM: REMOVED by design — no plan to add unless use case returns.
- Monitoring: add latency logs, drift detection on tenure/charges.
- Security: refresh tokens, secret rotation.
- Scaling: workers + queue, S3 streaming already for 200k rows.
- CI/CD: `.github/workflows/ci.yml` exists (backend+ml, frontend removed — Vercel handles it).
- Tests: add pytest for predict/batch.

## Part 23 — Why answers (Q344-359)
- Python: sklearn + FastAPI + Pandas all Python.
- Why this model: best CV F1 among 3 on this 7043 set (logreg won).
- Why sklearn: tabular, small data, interpretable; not deep.
- Why FastAPI: validation + docs + async upload.
- Why React: Vite + Recharts + Router already in team.
- Why MySQL Aiven: managed, free tier fits; SQLite fallback local.
- Why Docker: reproducible ML env.
- Why Render: free Docker host, auto-deploy on push.
- Why mandatory 6 only: EDA shows Contract/tenure/charges/fiber/payment drive churn; rest weak (gender 50/50).

## Part 24 — Cross-question tree
- "Why not SMOTE?" → 0.16% blanks only, imbalance handled by stratified split, not worth synthetic.
- "Why 6 mandatory not 18?" → top drivers per EDA/feature importance; rest default-safe.
- "Why 3 tiers not 5?" → research 0-50/51-75/76-100 maps to Stay/Tends/Churn, clean for offers.
- "What if batch header missing?" → normalize_row raises ValueError → 422 per row.

## Part 25 — Code references
- "Model loads once": `backend/app/ml/predictor.py`, `get_model()`, globals `_model`.
- "6 mandatory": `backend/app/schemas.py`, `MANDATORY_FIELDS`.
- "3 tiers": `backend/app/ml/predictor.py`, `get_risk_category()`, thresholds 0.40/0.65.
- "20MB/5000": `backend/app/routers/batch.py`, `MAX_DIRECT_BYTES`, `MAX_ROWS`.
- "S3 200k": same file, `cap=200000`.
- "JWT 60min": `backend/app/auth.py`, `create_token()`, `ACCESS_TOKEN_EXPIRE_MINUTES`.

## Part 26 — Fact check
A. VERIFIED FROM CODE: 6 mandatory + 12 optional, 3 tiers, 20MB/5000, S3 200k, 4 tables, JWT HS256 60min, pickle singleton, batch_counts, no GenAI.
B. VERIFIED FROM CONFIG: metrics.json accuracy 0.805 f1 0.591, model.pkl 4KB, env names.
C. NOT FOUND: executed training logs, confusion matrix per tier, load-test numbers, live infra measurements.
