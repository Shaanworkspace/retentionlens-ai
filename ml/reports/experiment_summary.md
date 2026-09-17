# Experiment Summary — RetentionLens AI Final Pipeline

## Data
- Raw: 7043 rows × 21 cols (IBM Telco)
- Cleaned: 7021 rows × 20 cols (customerID removed, TotalCharges median, dedup)
- Engineered: +4 features → 7021 × 24 (raw), 23 ML features + target
- Transformed: 7021 × 48 (one-hot)
- Train: 5616 (4131 No, 1485 Yes), Test: 1405 (1033 No, 372 Yes), stratify, random_state=42

## SMOTE
- Applied on TRAIN ONLY after preprocessing, SMOTE(random_state=42)
- Before: 0=4131, 1=1485 → After: 0=4131, 1=4131, synthetic 2646
- Test untouched: 1033/372

## Model Comparison (SMOTE + engineered features)
- LogReg: CV F1 0.630±0.019, Test F1 0.612, Recall 0.763, Precision 0.511, ROC 0.840
- RF: CV F1 0.581±0.028, Test F1 0.555, Recall 0.535, Precision 0.577, ROC 0.817
- Winner: LogReg (F1 0.612)

## Feature Engineering Effect
- LogReg original (19 features): CV 0.628, Test F1 0.613, Recall 0.766
- LogReg engineered (23 features): CV 0.630, Test F1 0.612, Recall 0.763 → No improvement (0.001 diff)
- RF original: CV 0.584, Test F1 0.543 → RF engineered: CV 0.581, Test F1 0.555 → Slight F1 gain but lower than LogReg

## Class Weight Effect (without SMOTE)
- LogReg None: F1 0.587, Recall 0.530 → Balanced: F1 0.609, Recall 0.774
- RF None: F1 0.513, Recall 0.446 → Balanced: F1 0.575, Recall 0.605
- SMOTE still best: LogReg SMOTE F1 0.612 > Balanced 0.609

## Threshold Effect (LogReg SMOTE, CV predictions on train)
- 0.30 F1 0.583 Recall 0.912
- 0.55 best F1 0.634 Recall 0.756 → But on test: 0.50 F1 0.612 vs 0.55 F1 0.612 → No valid gain, keep 0.50

## Recall Analysis
- Baseline Recall: 0.532 (FN 174)
- SMOTE Recall: 0.763 (FN 88) → FN reduced by 86, recall +43%
- FE+SMOTE Recall: 0.763 (same)
- Class Weight best Recall: 0.774 (slightly higher but F1 lower)
- Threshold best Recall: 0.912 at thr 0.30 but F1 drops to 0.583 → not chosen
- FN = Actual churn predicted as non-churn (missed churn). SMOTE halves FNs.

## Feature Importance
- RF top: tenure, TotalCharges, AvgMonthlySpend, MonthlyCharges, IsMonthToMonth (model-learned association, not causation)
- LR top: tenure, TotalCharges, Fiber optic, Two year contract, MonthlyCharges
- Engineered features in top 15: AvgMonthlySpend, IsMonthToMonth, ServiceCount (low), SupportServiceCount (mid) → moderate importance

## Final Model
- LogReg + SMOTE + 4 engineered features + StandardScaler/OneHot + threshold 0.5
- Saved: final_model.pkl, final_preprocessor.pkl, final_threshold.json
- Do not overwrite model.pkl until evaluation done — preserved as model_old.pkl

## Verdict
- No invented improvement: FE no gain, CW similar, threshold no gain. SMOTE is the only clear win for recall.
- XGBoost removed, claims audited, no test leakage, no SMOTE on test, threshold not from test.
