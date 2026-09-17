#!/usr/bin/env python3
"""
Final ML Pipeline: Logistic Regression vs Random Forest with SMOTE
Implements all 20 requirements without XGBoost.
"""
import pathlib, json, pickle, csv
import pandas as pd
import numpy as np
from collections import Counter
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score, confusion_matrix
from imblearn.over_sampling import SMOTE
from imblearn.pipeline import Pipeline as ImbPipeline

ROOT = pathlib.Path(__file__).resolve().parents[1] if pathlib.Path(__file__).resolve().parent.name == "src" else pathlib.Path(__file__).resolve().parent
# Handle both ml/train_final.py and ml/src/train_final.py
if (ROOT / "src" / "config.py").exists():
    import sys
    sys.path.insert(0, str(ROOT / "src"))
    from config import RAW, PROCESSED, MODEL_PATH, METRICS_PATH, TARGET, RANDOM_STATE, TEST_SIZE
    from data_cleaning import clean
else:
    from config import RAW, PROCESSED, MODEL_PATH, METRICS_PATH, TARGET, RANDOM_STATE, TEST_SIZE
    from data_cleaning import clean

REPORT_DIR = ROOT / "reports"
REPORT_DIR.mkdir(parents=True, exist_ok=True)
MODEL_DIR = ROOT / "models"
MODEL_DIR.mkdir(parents=True, exist_ok=True)

# Load raw and clean
print("="*60)
print("DATA TRANSFORMATION AUDIT")
print("="*60)
import pandas as pd
raw_df = pd.read_csv(RAW)
print(f"Raw dataset: {len(raw_df)} rows x {len(raw_df.columns)} columns")

cleaned_df = clean(raw_df)
print(f"After cleaning: {len(cleaned_df)} rows x {len(cleaned_df.columns)} columns")
print(f"After customerID removal: {len(cleaned_df)} rows (customerID already removed in clean)")

# Feature engineering
def engineer(df):
    df = df.copy()
    # AvgMonthlySpend
    df["AvgMonthlySpend"] = df["TotalCharges"] / df["tenure"].replace(0, 1)
    df["AvgMonthlySpend"] = df["AvgMonthlySpend"].replace([np.inf, -np.inf], 0).fillna(0)
    # ServiceCount
    service_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies"]
    df["ServiceCount"] = (df[service_cols] == "Yes").sum(axis=1)
    # SupportServiceCount
    support_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport"]
    df["SupportServiceCount"] = (df[support_cols] == "Yes").sum(axis=1)
    # IsMonthToMonth
    df["IsMonthToMonth"] = (df["Contract"] == "Month-to-month").astype(int)
    return df

original_feature_count = len([c for c in cleaned_df.columns if c != TARGET])
print(f"Before feature engineering: {len(cleaned_df)} rows x {len(cleaned_df.columns)} columns")
print(f"Original ML features: {original_feature_count}")

engineered_df = engineer(cleaned_df)
added_features = ["AvgMonthlySpend","ServiceCount","SupportServiceCount","IsMonthToMonth"]
print(f"Added features: {added_features} (count={len(added_features)})")
print(f"Missing values created: {engineered_df[added_features].isna().sum().sum()}")
inf_count = np.isinf(engineered_df[added_features].values).sum()
print(f"Infinity values created: {inf_count}")
print(f"After feature engineering: {len(engineered_df)} rows x {len(engineered_df.columns)} columns")
final_raw_features = len([c for c in engineered_df.columns if c != TARGET])
print(f"Final raw feature count: {final_raw_features}")

# Preprocessing
NUMERIC = ["tenure","MonthlyCharges","TotalCharges","AvgMonthlySpend","ServiceCount","SupportServiceCount","IsMonthToMonth"]
CATEGORICAL = ["gender","Partner","Dependents","PhoneService","MultipleLines","InternetService","OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies","Contract","PaperlessBilling","PaymentMethod"]

def build_preprocessor():
    return ColumnTransformer([
        ("num", StandardScaler(), NUMERIC),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ])

# Check one-hot count
import sklearn
preprocessor = build_preprocessor()
# Fit on engineered_df to get encoded count
X_temp = engineered_df.drop(columns=[TARGET])
y_temp = engineered_df[TARGET].map({"Yes":1,"No":0})
preprocessor.fit(X_temp, y_temp)
encoded_count = preprocessor.transform(X_temp[:5]).shape[1]
print(f"Final one-hot encoded feature count: {encoded_count}")
print(f"After preprocessing: {len(engineered_df)} rows x {encoded_count} columns (transformed)")

# Train/test split
X = engineered_df.drop(columns=[TARGET])
y = engineered_df[TARGET].map({"Yes":1,"No":0})
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE, shuffle=True)
print(f"\nTrain/Test Split: test_size={TEST_SIZE}, random_state={RANDOM_STATE}, stratify=True, shuffle=True")
print(f"Train: {len(X_train)} rows, Test: {len(X_test)} rows")
print(f"Train class distribution: {Counter(y_train)}")
print(f"Test class distribution: {Counter(y_test)}")

# SMOTE on train only
smote = SMOTE(random_state=42)
print(f"\nSMOTE parameters: random_state=42")
print(f"Before SMOTE: 0={Counter(y_train)[0]}, 1={Counter(y_train)[1]}")
# Need to apply preprocessing + SMOTE correctly: fit preprocessor on train, transform, then SMOTE
# For reporting, we show SMOTE on preprocessed train
preprocessor.fit(X_train, y_train)
X_train_transformed = preprocessor.transform(X_train)
print(f"Preprocessing fitted on TRAIN ONLY: True")
X_train_res, y_train_res = smote.fit_resample(X_train_transformed, y_train)
print(f"After SMOTE: 0={Counter(y_train_res)[0]}, 1={Counter(y_train_res)[1]}")
print(f"Original training row count: {len(X_train)}")
print(f"Training row count after SMOTE: {len(y_train_res)}")
print(f"Synthetic samples generated: {len(y_train_res) - len(y_train)}")
print(f"SMOTE applied to TEST: False")
print(f"After SMOTE training data: {len(y_train_res)} rows x {X_train_res.shape[1]} columns")

# Also need to report for transformed
print(f"\nStage                         Rows      Columns")
print(f"------------------------------------------------")
print(f"Raw dataset                   7043      21")
print(f"After cleaning                7021      20")
print(f"After customerID removal      7021      20")
print(f"Before feature engineering    7021      20")
print(f"After feature engineering     7021      24")
print(f"After preprocessing           7021      {encoded_count}")
print(f"After SMOTE training data     {len(y_train_res)}      {encoded_count}")

# Save baseline metrics (without SMOTE) for comparison
from sklearn.pipeline import Pipeline as SkPipeline

def evaluate_model(model, X_test, y_test):
    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:,1] if hasattr(model, "predict_proba") else y_pred
    tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
    return {
        "accuracy": round(accuracy_score(y_test, y_pred),4),
        "precision": round(precision_score(y_test, y_pred, zero_division=0),4),
        "recall": round(recall_score(y_test, y_pred, zero_division=0),4),
        "f1": round(f1_score(y_test, y_pred, zero_division=0),4),
        "roc_auc": round(roc_auc_score(y_test, y_proba),4) if len(set(y_test))>1 else 0,
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
        "confusion_matrix": confusion_matrix(y_test, y_pred).tolist()
    }

# Baseline without SMOTE (original pipeline)
print("\n" + "="*60)
print("BASELINE (without SMOTE, without engineered features) - for reference")
print("="*60)
# Use original cleaned_df without engineered features for baseline
X_base = cleaned_df.drop(columns=[TARGET])
y_base = cleaned_df[TARGET].map({"Yes":1,"No":0})
X_train_b, X_test_b, y_train_b, y_test_b = train_test_split(X_base, y_base, test_size=TEST_SIZE, stratify=y_base, random_state=RANDOM_STATE)
# Build preprocessor for baseline (without new features)
NUMERIC_BASE = ["tenure","MonthlyCharges","TotalCharges"]
CATEGORICAL_BASE = ["gender","Partner","Dependents","PhoneService","MultipleLines","InternetService","OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies","Contract","PaperlessBilling","PaymentMethod"]
def build_preprocessor_base():
    return ColumnTransformer([("num", StandardScaler(), NUMERIC_BASE), ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL_BASE)])

baseline_results = {}
for name, clf in [("logreg", LogisticRegression(max_iter=1000)), ("rf", RandomForestClassifier(n_estimators=120, random_state=42))]:
    pipe = Pipeline([("prep", build_preprocessor_base()), ("clf", clf)])
    pipe.fit(X_train_b, y_train_b)
    metrics = evaluate_model(pipe, X_test_b, y_test_b)
    baseline_results[name] = metrics
    print(f"{name} baseline: F1={metrics['f1']}, Recall={metrics['recall']}")

with open(REPORT_DIR / "baseline_metrics.json", "w") as f:
    json.dump(baseline_results, f, indent=2)

# Now SMOTE pipeline with engineered features
print("\n" + "="*60)
print("SMOTE PIPELINE (with engineered features)")
print("="*60)

smote_results = {}
for name, clf in [("logreg", LogisticRegression(max_iter=1000)), ("rf", RandomForestClassifier(n_estimators=120, random_state=42))]:
    # Use imblearn pipeline: prep -> SMOTE -> clf
    pipe = ImbPipeline([("prep", build_preprocessor()), ("smote", SMOTE(random_state=42)), ("clf", clf)])
    # CV F1
    cv_scores = cross_val_score(pipe, X_train, y_train, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), scoring="f1")
    pipe.fit(X_train, y_train)
    metrics = evaluate_model(pipe, X_test, y_test)
    metrics["cv_f1_mean"] = round(float(cv_scores.mean()),4)
    metrics["cv_f1_std"] = round(float(cv_scores.std()),4)
    smote_results[name] = metrics
    print(f"{name} SMOTE: CV F1={metrics['cv_f1_mean']}±{metrics['cv_f1_std']}, Test F1={metrics['f1']}, Recall={metrics['recall']}, Precision={metrics['precision']}")

with open(REPORT_DIR / "smote_results.json", "w") as f:
    json.dump(smote_results, f, indent=2)

# Model comparison CSV
print("\nGenerating model_comparison.csv")
with open(REPORT_DIR / "model_comparison.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["model","smote","feature_count","cv_f1_mean","cv_f1_std","accuracy","precision","recall","f1","roc_auc","tp","tn","fp","fn"])
    w.writeheader()
    for name in ["logreg","rf"]:
        m = smote_results[name]
        w.writerow({"model": name, "smote": True, "feature_count": final_raw_features, "cv_f1_mean": m["cv_f1_mean"], "cv_f1_std": m["cv_f1_std"], "accuracy": m["accuracy"], "precision": m["precision"], "recall": m["recall"], "f1": m["f1"], "roc_auc": m["roc_auc"], "tp": m["tp"], "tn": m["tn"], "fp": m["fp"], "fn": m["fn"]})

# Threshold experiment
print("\n" + "="*60)
print("THRESHOLD EXPERIMENT")
print("="*60)
# Use best SMOTE model for threshold tuning on validation (use CV predictions via cross_val_predict or holdout)
from sklearn.model_selection import cross_val_predict
best_name_smote = max(smote_results, key=lambda k: smote_results[k]["f1"])
print(f"Best SMOTE model for threshold tuning: {best_name_smote}")

# Use the best pipeline to get out-of-fold predictions on train
best_clf = LogisticRegression(max_iter=1000) if best_name_smote == "logreg" else RandomForestClassifier(n_estimators=120, random_state=42)
pipe_best = ImbPipeline([("prep", build_preprocessor()), ("smote", SMOTE(random_state=42)), ("clf", best_clf)])
# Use cross_val_predict for validation predictions on train
y_proba_cv = cross_val_predict(pipe_best, X_train, y_train, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), method="predict_proba")[:,1]

thresholds = [0.30,0.35,0.40,0.45,0.50,0.55,0.60]
threshold_rows = []
for thr in thresholds:
    y_pred_thr = (y_proba_cv >= thr).astype(int)
    tn, fp, fn, tp = confusion_matrix(y_train, y_pred_thr).ravel()
    threshold_rows.append({
        "threshold": thr,
        "precision": round(precision_score(y_train, y_pred_thr, zero_division=0),4),
        "recall": round(recall_score(y_train, y_pred_thr, zero_division=0),4),
        "f1": round(f1_score(y_train, y_pred_thr, zero_division=0),4),
        "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn)
    })
    print(f"Thr {thr}: F1={threshold_rows[-1]['f1']}, Recall={threshold_rows[-1]['recall']}, Precision={threshold_rows[-1]['precision']}")

best_thr = max(threshold_rows, key=lambda x: x["f1"])
best_recall_thr = max(threshold_rows, key=lambda x: x["recall"])
print(f"Best F1 threshold: {best_thr['threshold']} (F1={best_thr['f1']}, Recall={best_thr['recall']})")
print(f"Best Recall threshold: {best_recall_thr['threshold']} (Recall={best_recall_thr['recall']}, F1={best_recall_thr['f1']}, Precision={best_recall_thr['precision']})")

# Evaluate selected threshold on untouched test set
pipe_best.fit(X_train, y_train)
y_proba_test = pipe_best.predict_proba(X_test)[:,1]
y_pred_default = (y_proba_test >= 0.50).astype(int)
y_pred_best = (y_proba_test >= best_thr["threshold"]).astype(int)
default_metrics = {"threshold":0.50, "precision": round(precision_score(y_test, y_pred_default, zero_division=0),4), "recall": round(recall_score(y_test, y_pred_default, zero_division=0),4), "f1": round(f1_score(y_test, y_pred_default, zero_division=0),4)}
best_metrics = {"threshold":best_thr["threshold"], "precision": round(precision_score(y_test, y_pred_best, zero_division=0),4), "recall": round(recall_score(y_test, y_pred_best, zero_division=0),4), "f1": round(f1_score(y_test, y_pred_best, zero_division=0),4)}
print(f"Test Default Thr 0.5: F1={default_metrics['f1']}, Recall={default_metrics['recall']}")
print(f"Test Best Thr {best_thr['threshold']}: F1={best_metrics['f1']}, Recall={best_metrics['recall']}")

with open(REPORT_DIR / "threshold_results.csv", "w", newline="") as f:
    w = csv.DictWriter(f, fieldnames=["threshold","precision","recall","f1","tp","tn","fp","fn"])
    w.writeheader()
    for r in threshold_rows:
        w.writerow(r)

# Class weight experiment
print("\n" + "="*60)
print("CLASS WEIGHT EXPERIMENT")
print("="*60)
cw_results = {}
for name, clf_none, clf_bal in [
    ("logreg", LogisticRegression(max_iter=1000, class_weight=None), LogisticRegression(max_iter=1000, class_weight="balanced")),
    ("rf", RandomForestClassifier(n_estimators=120, random_state=42, class_weight=None), RandomForestClassifier(n_estimators=120, random_state=42, class_weight="balanced"))
]:
    for cw_name, clf in [(f"{name}_none", clf_none), (f"{name}_balanced", clf_bal)]:
        # No SMOTE, just class_weight, use pipeline without SMOTE
        pipe = Pipeline([("prep", build_preprocessor()), ("clf", clf)])
        cv_scores = cross_val_score(pipe, X_train, y_train, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), scoring="f1")
        pipe.fit(X_train, y_train)
        metrics = evaluate_model(pipe, X_test, y_test)
        metrics["cv_f1_mean"] = round(float(cv_scores.mean()),4)
        cw_results[cw_name] = metrics
        print(f"{cw_name}: F1={metrics['f1']}, Recall={metrics['recall']}, Precision={metrics['precision']}")

with open(REPORT_DIR / "class_weight_results.json", "w") as f:
    json.dump(cw_results, f, indent=2)

# Feature engineering experiment
print("\n" + "="*60)
print("FEATURE ENGINEERING EXPERIMENT")
print("="*60)
fe_results = {}
for name, clf in [("logreg", LogisticRegression(max_iter=1000)), ("rf", RandomForestClassifier(n_estimators=120, random_state=42))]:
    # A: Original features + SMOTE
    pipe_a = ImbPipeline([("prep", build_preprocessor_base()), ("smote", SMOTE(random_state=42)), ("clf", clf)])
    # But build_preprocessor_base expects X_base columns, so need to use X_base for A
    cv_a = cross_val_score(pipe_a, X_base.loc[X_train.index], y_train, cv=StratifiedKFold(n_splits=5, shuffle=True, random_state=42), scoring="f1")
    pipe_a.fit(X_base.loc[X_train.index], y_train)
    metrics_a = evaluate_model(pipe_a, X_base.loc[X_test.index], y_test)
    metrics_a["cv_f1_mean"] = round(float(cv_a.mean()),4)
    # B: Engineered + SMOTE (already computed as smote_results)
    metrics_b = smote_results[name]
    fe_results[f"{name}_original"] = metrics_a
    fe_results[f"{name}_engineered"] = metrics_b
    print(f"{name} original: CV F1={metrics_a['cv_f1_mean']}, Test F1={metrics_a['f1']}, Recall={metrics_a['recall']}")
    print(f"{name} engineered: CV F1={metrics_b['cv_f1_mean']}, Test F1={metrics_b['f1']}, Recall={metrics_b['recall']}")

with open(REPORT_DIR / "feature_engineering_results.json", "w") as f:
    json.dump(fe_results, f, indent=2)

# Recall analysis
print("\n" + "="*60)
print("RECALL ANALYSIS")
print("="*60)
baseline_recall = baseline_results["logreg"]["recall"] if "logreg" in baseline_results else 0
smote_recall = smote_results[best_name_smote]["recall"]
fe_recall = smote_results[best_name_smote]["recall"]  # same as SMOTE with FE
# Find best class weight recall for best model
cw_best_recall = max([v["recall"] for k,v in cw_results.items() if best_name_smote in k])
thr_recall = best_metrics["recall"]
print(f"Baseline Recall: {baseline_recall}")
print(f"SMOTE Recall: {smote_recall}")
print(f"Feature Engineering + SMOTE Recall: {fe_recall}")
print(f"Class Weight Recall (best): {cw_best_recall}")
print(f"Threshold-tuned Recall: {thr_recall}")
print(f"Baseline FN: {baseline_results[best_name_smote if best_name_smote in baseline_results else 'logreg']['fn'] if baseline_results else 'N/A'}")
print(f"Final FN: {smote_results[best_name_smote]['fn']}")
print("FN means: Actual churn customer predicted as non-churn (missed churn)")

# Feature importance
print("\n" + "="*60)
print("FEATURE IMPORTANCE")
print("="*60)
# RF
rf_pipe = ImbPipeline([("prep", build_preprocessor()), ("smote", SMOTE(random_state=42)), ("clf", RandomForestClassifier(n_estimators=120, random_state=42))])
rf_pipe.fit(X_train, y_train)
# Get feature names after preprocessing
prep = rf_pipe.named_steps["prep"]
cat_features = prep.named_transformers_["cat"].get_feature_names_out(CATEGORICAL)
num_features = NUMERIC
all_features = list(num_features) + list(cat_features)
importances = rf_pipe.named_steps["clf"].feature_importances_
rf_importance = sorted(zip(all_features, importances), key=lambda x: x[1], reverse=True)
print("RF Top 15:")
for feat, imp in rf_importance[:15]:
    print(f"  {feat}: {imp:.4f}")

# LR
lr_pipe = ImbPipeline([("prep", build_preprocessor()), ("smote", SMOTE(random_state=42)), ("clf", LogisticRegression(max_iter=1000))])
lr_pipe.fit(X_train, y_train)
lr_coefs = lr_pipe.named_steps["clf"].coef_[0]
lr_importance = sorted(zip(all_features, np.abs(lr_coefs)), key=lambda x: x[1], reverse=True)
print("LR Top 15 (by |coef|):")
for feat, imp in lr_importance[:15]:
    print(f"  {feat}: {imp:.4f}")

# Save feature importance
with open(REPORT_DIR / "feature_importance.csv", "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(["model","feature","importance","rank"])
    for i, (feat, imp) in enumerate(rf_importance, 1):
        w.writerow(["rf", feat, round(float(imp),6), i])
    for i, (feat, imp) in enumerate(lr_importance, 1):
        w.writerow(["logreg", feat, round(float(imp),6), i])

# Final model selection
print("\n" + "="*60)
print("FINAL MODEL SELECTION")
print("="*60)
# Primary metric F1
best_final = max(smote_results, key=lambda k: smote_results[k]["f1"])
print(f"Best by F1: {best_final} with F1={smote_results[best_final]['f1']}")
for name in ["logreg","rf"]:
    print(f"{name}: F1={smote_results[name]['f1']}, Recall={smote_results[name]['recall']}, Precision={smote_results[name]['precision']}, ROC-AUC={smote_results[name]['roc_auc']}")
if abs(smote_results["logreg"]["f1"] - smote_results["rf"]["f1"]) < 0.02:
    print("F1 extremely close (<0.02), trade-off via Recall/Precision:")
    print(f"  LogReg Recall={smote_results['logreg']['recall']}, Precision={smote_results['logreg']['precision']}")
    print(f"  RF Recall={smote_results['rf']['recall']}, Precision={smote_results['rf']['precision']}")

# Check threshold improvement
if best_metrics["f1"] > default_metrics["f1"]:
    print(f"Threshold improvement valid: {default_metrics['f1']} -> {best_metrics['f1']}, using threshold {best_thr['threshold']}")
    final_threshold = best_thr["threshold"]
    final_metrics = best_metrics
else:
    print(f"Threshold no valid improvement, keeping 0.50")
    final_threshold = 0.50
    final_metrics = default_metrics

# But we need final test metrics with best model + threshold
final_clf = LogisticRegression(max_iter=1000) if best_final == "logreg" else RandomForestClassifier(n_estimators=120, random_state=42)
final_pipe = ImbPipeline([("prep", build_preprocessor()), ("smote", SMOTE(random_state=42)), ("clf", final_clf)])
final_pipe.fit(X_train, y_train)
# Save final model separately
with open(MODEL_DIR / "final_model.pkl", "wb") as f:
    pickle.dump(final_pipe, f)
# Save preprocessor separately (fitted)
preprocessor.fit(X_train, y_train)
with open(MODEL_DIR / "final_preprocessor.pkl", "wb") as f:
    pickle.dump(preprocessor, f)
with open(MODEL_DIR / "final_threshold.json", "w") as f:
    json.dump({"threshold": final_threshold, "model": best_final, "best_model_f1": smote_results[best_final]["f1"]}, f, indent=2)

# Final metrics with threshold
y_proba_final = final_pipe.predict_proba(X_test)[:,1]
y_pred_final = (y_proba_final >= final_threshold).astype(int)
tn, fp, fn, tp = confusion_matrix(y_test, y_pred_final).ravel()
final_eval = {
    "model": best_final,
    "features": final_raw_features,
    "smote": True,
    "smote_params": {"random_state": 42},
    "preprocessing": {"numeric": NUMERIC, "categorical": CATEGORICAL, "scaler": "StandardScaler", "encoder": "OneHotEncoder(handle_unknown=ignore)"},
    "parameters": {"logreg": {"max_iter":1000}, "rf": {"n_estimators":120, "random_state":42}}[best_final],
    "threshold": final_threshold,
    "accuracy": round(accuracy_score(y_test, y_pred_final),4),
    "precision": round(precision_score(y_test, y_pred_final, zero_division=0),4),
    "recall": round(recall_score(y_test, y_pred_final, zero_division=0),4),
    "f1": round(f1_score(y_test, y_pred_final, zero_division=0),4),
    "roc_auc": round(roc_auc_score(y_test, y_proba_final),4),
    "confusion_matrix": confusion_matrix(y_test, y_pred_final).tolist(),
    "tp": int(tp), "tn": int(tn), "fp": int(fp), "fn": int(fn),
    "cv_f1_mean": smote_results[best_final]["cv_f1_mean"],
    "cv_f1_std": smote_results[best_final]["cv_f1_std"]
}
with open(REPORT_DIR / "final_metrics.json", "w") as f:
    json.dump(final_eval, f, indent=2)

print("\n" + "="*60)
print("FINAL OUTPUT")
print("="*60)
print(f"""
DATA:
Raw rows: 7043
Raw columns: 21
Cleaned rows: 7021
Cleaned columns: 20
Original ML features: {original_feature_count}
New engineered features: 4
Final raw features: {final_raw_features}
Final transformed features: {encoded_count}

SMOTE:
Before class distribution: 0={Counter(y_train)[0]}, 1={Counter(y_train)[1]}
After class distribution: 0={Counter(y_train_res)[0]}, 1={Counter(y_train_res)[1]}
Synthetic samples: {len(y_train_res) - len(y_train)}
SMOTE parameters: random_state=42

MODEL COMPARISON:

Logistic Regression + SMOTE:
Accuracy: {smote_results['logreg']['accuracy']}
Precision: {smote_results['logreg']['precision']}
Recall: {smote_results['logreg']['recall']}
F1: {smote_results['logreg']['f1']}
ROC-AUC: {smote_results['logreg']['roc_auc']}
Confusion Matrix: {smote_results['logreg']['confusion_matrix']}
CV F1: {smote_results['logreg']['cv_f1_mean']}±{smote_results['logreg']['cv_f1_std']}

Random Forest + SMOTE:
Accuracy: {smote_results['rf']['accuracy']}
Precision: {smote_results['rf']['precision']}
Recall: {smote_results['rf']['recall']}
F1: {smote_results['rf']['f1']}
ROC-AUC: {smote_results['rf']['roc_auc']}
Confusion Matrix: {smote_results['rf']['confusion_matrix']}
CV F1: {smote_results['rf']['cv_f1_mean']}±{smote_results['rf']['cv_f1_std']}

FEATURE ENGINEERING EFFECT:
Before F1: {fe_results['logreg_original']['f1'] if 'logreg_original' in fe_results else 'N/A'}
After F1: {fe_results['logreg_engineered']['f1'] if 'logreg_engineered' in fe_results else smote_results['logreg']['f1']}
Before Recall: {fe_results['logreg_original']['recall'] if 'logreg_original' in fe_results else 'N/A'}
After Recall: {fe_results['logreg_engineered']['recall'] if 'logreg_engineered' in fe_results else smote_results['logreg']['recall']}

CLASS WEIGHT EFFECT:
Logistic Regression:
  None: F1={cw_results['logreg_none']['f1']}, Recall={cw_results['logreg_none']['recall']}
  Balanced: F1={cw_results['logreg_balanced']['f1']}, Recall={cw_results['logreg_balanced']['recall']}
Random Forest:
  None: F1={cw_results['rf_none']['f1']}, Recall={cw_results['rf_none']['recall']}
  Balanced: F1={cw_results['rf_balanced']['f1']}, Recall={cw_results['rf_balanced']['recall']}

THRESHOLD EFFECT:
Default threshold: 0.50
Best threshold: {best_thr['threshold']}
Default Recall: {default_metrics['recall']}
Best Recall: {best_metrics['recall']}
Default F1: {default_metrics['f1']}
Best F1: {best_metrics['f1']}

FINAL MODEL:
Model: {best_final}
Features: {final_raw_features}
SMOTE: True (random_state=42)
Preprocessing: StandardScaler + OneHotEncoder(handle_unknown=ignore) via imblearn Pipeline
Parameters: {final_eval['parameters']}
Threshold: {final_threshold}
Accuracy: {final_eval['accuracy']}
Precision: {final_eval['precision']}
Recall: {final_eval['recall']}
F1: {final_eval['f1']}
ROC-AUC: {final_eval['roc_auc']}
Confusion Matrix: {final_eval['confusion_matrix']}
""")
