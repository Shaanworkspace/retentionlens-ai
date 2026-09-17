# Claim Audit — RetentionLens AI

For each claim: CLAIM | ACTUAL IMPLEMENTATION | VERIFIED? | ACTUAL METRIC | MISSING IMPLEMENTATION

## 1. XGBoost
- CLAIM: README described XGBoost as active model (F1 0.80, XGBoost in stack)
- ACTUAL: XGBoost removed completely. Final candidates only LogReg and RF.
- VERIFIED? No — claim false
- ACTUAL METRIC: LogReg F1 0.612, RF F1 0.555 (with SMOTE)
- MISSING: XGBoost imports, training, evaluation removed

## 2. F1 = 0.80
- CLAIM: README said "F1 0.80, ROC-AUC 0.84" for XGBoost
- ACTUAL: With SMOTE + 4 engineered features, best F1 is 0.612 (LogReg)
- VERIFIED? No
- ACTUAL METRIC: Final model LogReg: F1 0.612, Precision 0.511, Recall 0.763, ROC-AUC 0.840
- MISSING: No 0.80 achieved; baseline without SMOTE was 0.591

## 3. Feature Engineering
- CLAIM: README mentioned "Feature engineering" but old code had only TenureGroup etc, not the 4 new features
- ACTUAL: 4 new features added: AvgMonthlySpend, ServiceCount, SupportServiceCount, IsMonthToMonth (verified in ml/src/train_final.py)
- VERIFIED? Partially — new features now present, old ones replaced
- ACTUAL METRIC: Feature engineering effect: Before F1 0.613 → After 0.612 (no improvement, verified)
- MISSING: Old TenureGroup etc not in final pipeline

## 4. SMOTE
- CLAIM: README mentioned SMOTE? Not explicitly, but required
- ACTUAL: SMOTE(random_state=42) in ImbPipeline, on TRAIN ONLY, after preprocessing, before training. Synthetic 2646 samples.
- VERIFIED? Yes
- ACTUAL METRIC: Before SMOTE recall 0.532 → After SMOTE recall 0.763
- MISSING: None — implemented correctly

## 5. Class Balancing
- CLAIM: No explicit claim, but required to check class_weight
- ACTUAL: class_weight=None vs balanced tested separately, not combined with SMOTE. Balanced improves recall (LogReg 0.529→0.774) but SMOTE still better.
- VERIFIED? Yes
- ACTUAL METRIC: LogReg balanced F1 0.609 vs SMOTE 0.612

## 6. Threshold Tuning
- CLAIM: No claim
- ACTUAL: Tested 0.30-0.60 on CV predictions (not test). Best F1 thr 0.55 (CV F1 0.634), but test F1 0.612 vs default 0.50 F1 0.612 → no valid improvement, kept 0.50.
- VERIFIED? Yes
- ACTUAL METRIC: Default 0.50 F1 0.612, Best 0.55 F1 0.612 (tie)

## 7. 5-fold CV
- CLAIM: README said 5-fold CV
- ACTUAL: 5-fold CV F1 mean/std calculated for both models, stored in model_comparison.csv
- VERIFIED? Yes
- ACTUAL METRIC: LogReg CV 0.630±0.019, RF CV 0.581±0.028

## 8. Model Selection
- CLAIM: README implied XGBoost best
- ACTUAL: LogReg vs RF compared on F1, LogReg wins (0.612 vs 0.555). No manual bias.
- VERIFIED? Yes
- ACTUAL METRIC: LogReg selected as final_model.pkl

## Summary
- Removed: XGBoost, false F1 0.80
- Verified: SMOTE, 4 features, 5-fold CV, threshold, class weight, F1-based selection
- All claims now match actual implementation with measured metrics
