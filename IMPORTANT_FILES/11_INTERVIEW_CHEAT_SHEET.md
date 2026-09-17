# Part 27 — Interview Cheat Sheet (simple English, exact facts only)

## 1. 30-second
"I built RetentionLens AI. It scores telecom customers into 3 risk tiers — Will Stay, Tends to Churn, Will Churn — for single and batch CSV uploads. 6 fields are mandatory, 12 fall back to safe defaults."

## 2. 60-second
Add: "Upload goes from React to FastAPI on Render. A ColumnTransformer scales numeric and one-hots categoricals, LogisticRegression predicts probability, thresholds at 0.40 and 0.65 make the 3 tiers. Results save in Aiven MySQL, last 10 single and 50 batch runs kept."

## 3. 2-minute
Add: "Data is IBM Telco 7043, 7021 after cleaning (11 TotalCharges blanks median-filled, duplicates dropped). Split 80/20 stratified, 5-fold CV picks best among LogReg, RF, XGBoost — LogReg won with F1 0.591. Batch takes 20MB/5000 rows direct, 200k via S3 streaming. Auth is JWT 60 min, bcrypt."

## 4. Architecture
"Vercel React calls Render FastAPI. fill_defaults for optional fields, mandatory check, ColumnTransformer, pickle model, risk tier, MySQL save, JSON back."

## 5. ML pipeline
"IBM CSV → median impute + dedup → ColumnTransformer (StandardScaler + OneHotEncoder) → 80/20 stratified → 3-model CV on F1 → pickle + metrics.json."

## 6. Prediction flow
"Customer JSON → fill_defaults → mandatory check 422 if miss → DataFrame → pipeline → proba → tier → save → risk_category + probability back → board shows color."

## 7. Database
"4 tables. users (name, company, email, hash). predictions (per single). batch_runs + batch_items (per batch, up to 2000 shown, truncated flag)."

## 8. Deployment
"Frontend Vercel, backend Docker python:3.11-slim on Render free. Model in image (4KB). Aiven MySQL. Push triggers Render redeploy."

## 9. Top 30 interviewer questions
Project / problem / contribution / tech / flow / model / why this model / data prep / metrics / prediction / backend-model link / frontend-backend link / schema / storage / deploy / challenges / improvements / empty input / long file / tier thresholds / mandatory vs optional / batch limit / S3 / JWT expiry / rate limit / Docker / Render / MySQL / React / accuracy vs F1 / leakage / future.

## 10. Top 20 why
See file 10 Part 23 — one line each.

## 11. Top 20 follow-ups
See file 10 Part 24 — one line each.

## 12. Top 10 difficult
1. Low F1 0.59 — explain + CV picked best. 2. No SMOTE — 26% not extreme. 3. No GenAI — removed by design, prediction-only. 4. No vector DB — tabular, not text. 5. Single worker — true. 6. No load test — true. 7. JWT dev fallback — true. 8. 5000 cap — S3 for more. 9. Optional defaults hidden — true, documented. 10. Reporting dead — batched via runs.

## 13. Top 10 weaknesses
Small F1, single model, no drift monitor, no refresh tokens, single instance, 20MB cap, no tests beyond 2, static shell pages, no load test, dev secret fallback.

## 14. Top 10 future
Weight tuning, threshold tuning, calibrated probs, drift alerts, refresh tokens + rotation, more workers/queue, S3 presigned UI, CSV column mapper UI, pytest, load test.
