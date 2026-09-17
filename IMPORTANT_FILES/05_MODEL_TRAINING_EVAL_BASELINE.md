# Parts 8-11 — Model, Training, Evaluation, Baseline (Q101-170)

## Part 8 — Model (Q101-119)
- 101-102. Exact model: Scikit-learn Pipeline `ColumnTransformer → LogisticRegression(max_iter=1000)` as best, with challengers RandomForest(120 trees) and XGBoost(120 trees, max_depth 5, lr 0.1). File: `ml/src/07_model.py:5-11` + `ml/models/model.pkl` (LogisticRegression wins). VERIFIED FROM CODE.
- 105. Params: LogisticRegression ~ few KB (sparse coefficients for ~40 one-hot dims). No transformer. VERIFIED.
- 106-110. Why Logistic Regression over others: best F1 in 5-fold CV (docs: F1 0.591 vs RF 0.54 vs XGB 0.57 on this split). Why not BERT here: tabular data, BERT is for text (other project). Why not deep net: 7043 rows too small, interpretability needed.
- 111-113. Input: 18 features DataFrame (3 numeric scaled + 15 categorical one-hot). Output: 2 probas per row. Labels: 2 (churn 0/1) + 3 display tiers.
- 114-115. Head: LogisticRegression coefficients + sigmoid. NOT token head.
- 117-119. Loss: Logistic loss (cross-entropy) + L2 default. Appropriate for binary churn. VERIFIED (sklearn default).

## Part 9 — Training (Q120-137)
Pipeline: collect CSV → clean (median + dedup) → to_csv → split 80/20 stratified seed 42 → compare 3 models via 5-fold CV F1 → fit best on train → predict test → evaluate → pickle + metrics.json. Code: `ml/src/pipeline.py:6-20`. VERIFIED.
- 121-130. Optimizer: LBFGS (LogReg default). lr: NOT set (sklearn default). Batch: NOT applicable (full-batch LBFGS). Epochs: 1000 max_iter. Weight decay: L2 default C=1.0. Dropout: NOT USED. Scheduler: NOT USED.
- 131. Hardware: CPU only (no GPU code). VERIFIED.
- 134-137. Training loss: NOT logged. Validation is 5-fold CV mean F1. Best selected = max CV F1. Saved to `ml/models/model.pkl` (pickle). VERIFIED.

## Part 10 — Evaluation (Q138-156)
- 138-146. Metrics in `ml/src/08_evaluation.py:4-12`: accuracy, precision, recall, f1, roc_auc, confusion_matrix. Computed via sklearn. VERIFIED.
- 147-150. Main metric: **F1** (and ROC-AUC) because churn is 26% imbalanced — accuracy 0.805 misleads (always-No gives 0.735). DOC CLAIM + code logic.
- 151. Final scores VERIFIED FROM CODE (`ml/reports/metrics.json`): accuracy 0.805, precision 0.664, recall 0.532, f1 0.591, roc_auc 0.841, conf matrix [[933,100],[174,198]], best_model logreg.
- 155-156. Overfitting: gap not quoted in code; CV F1 used to pick, no separate holdout overfit report. Say "CV-guarded, no explicit gap published".

## Part 11 — Baseline (Q157-170)
- TF-IDF: NOT APPLICABLE (tabular project). Baseline here was the 3-model bake-off (LogReg vs RF vs XGB); LogReg won. No pure TF-IDF in this repo. State clearly if asked about TF-IDF: "Not in churn project; TF-IDF was in sentiment project baseline."
