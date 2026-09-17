# Parts 19-21 — Performance, Challenges, Limitations (Q285-328)

## Part 19 — Performance/Scalability (Q285-298)
- 285-287. One prediction: NOT MEASURED (no latency log beyond health). Bottleneck: pickled sklearn predict on CPU (no GPU). VERIFIED (no timing code).
- 288-290. Capacity: NOT load-tested. Single Uvicorn worker + blocking predict → queueing. Say "not load-tested; would queue".
- 291-298. Scale ideas (future): more workers (--workers), queue (Celery/Redis), cache repeated customers, batch predict, no quantization needed (tiny model).

## Part 20 — Challenges/Debugging (Q299-310)
ONLY things with evidence. Else say "Not found in project history/code."
- Data: TotalCharges blanks median-imputed, duplicates dropped — evidence: `02_data_cleaning.py`. VERIFIED.
- Data: Optional defaults design so batch/skipped fields don't 422 — evidence: `schemas.py:OPTIONAL_DEFAULTS`.
- Deploy: Docker model path needed fallback (3 ROOTS) — evidence: `predictor.py`.
- Integration: Frontend Bearer token + 401 redirect added after live errors — evidence: `services/api.js` interceptor + fixes.
- Hardest bug: NOT FOUND as documented history — say so.

## Part 21 — Limitations (Q311-328)
- Dataset: 7043 telecom only, no location/senior etc — narrow domain.
- Class imbalance: 26% churn → recall 0.532 modest; no SMOTE.
- Model: Logistic Regression F1 0.59 (not SOTA); NEU-like rare tier weak.
- Long text: NOT APPLICABLE (tabular).
- Domain: telecom only; other industries need retrain.
- Deploy: single Render instance, no autoscale, HTTP, 20MB/5000 row cap (S3 for bigger).
- Security: 1-hour JWT, no refresh, bcrypt good but SECRET fallback dev.
- Sarcasm/spelling: NOT APPLICABLE (tabular).
- Empty input: 422 for mandatory; extremely long NOT APPLICABLE.
- Mixed sentiment: NOT APPLICABLE; tier = single max risk.
