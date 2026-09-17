# Parts 6-7 — Churn Type + Encoding (Q73-100) — Adapted for Tabular Churn

## 73. What "prediction" means here
Three-tier churn risk (Will Stay / Tends to Churn / Will Churn) from probability, plus binary label (Yes/No) at 0.5 cutoff. NOT sentiment, but analogous 3-class segmentation.

## 74-77. Classification type
- Binary classification (churn Yes/No) with threshold 0.5, plus rule-based 3-tier mapping. NOT sequence/token classification. VERIFIED FROM CODE (`predictor.py:41-44`).

## 78-80. Exact labels
- Model labels: `0=No churn, 1=Churn` (mapped from "Yes"/"No" strings via `y.map`). Display labels: 3 tiers with ids 1-3. VERIFIED FROM CODE.

## 81-87. How predictions converted + mixed handling
- Probability → tier: <0.40 → Will Stay (green, nurture), <0.65 → Tends to Churn (yellow, outreach), else Will Churn (red, immediate). One customer = one tier (no multi-aspect). Mixed is NOT applicable; batch tier = max alert. VERIFIED FROM CODE.

## 88. Real example
tenure 5, Fiber, Month-to-month, Electronic check → prob 0.75 → Will Churn red. Same but tenure 48, Two year → prob 0.25 → Will Stay green. Verified via live test on Render.

## Part 7 — Tokenization / Encoding (Q89-100) — For Tabular
- No NLP tokenizer. Encoding is `OneHotEncoder(handle_unknown="ignore")` for 15 categoricals + `StandardScaler` for 3 numerics. Max length NOT applicable (tabular width 18). Padding/truncation NOT USED. Unknown categories → all-zero vector (ignore), not error. VERIFIED FROM CODE.

## Interview note
If interviewer asks "tokenization" for this project, say: "This project is tabular churn, so encoding is one-hot, not BERT tokenization. Sentiment project's tokenization is separate."

