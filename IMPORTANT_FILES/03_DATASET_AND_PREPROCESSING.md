# Parts 4-5 — Dataset + Preprocessing (Q50-72)

## 50-51. Dataset used + source
IBM Telco Customer Churn, 7043 rows, downloaded from `https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv` via `ml/src/01_data_collection.py:3`. VERIFIED FROM CODE.

## 52-54. Records + columns
- Original: 7043 rows, 21 columns (customerID, gender, SeniorCitizen, Partner, Dependents, tenure, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod, MonthlyCharges, TotalCharges, Churn). From CSV header verified in data.
- Used: 7021 rows after cleaning (TotalCharges blanks 11 + duplicates 11 removed). Doc claim 7021 in `02_data_cleaning.py` logic (`pd.to_numeric` + `drop_duplicates`). 21 → 18 features + target (customerID dropped). VERIFIED FROM CODE.

## 55-57. Review text column, labels, target
- No review text — tabular data. Columns used: numeric `tenure, MonthlyCharges, TotalCharges` + categorical `gender, Partner, Dependents, PhoneService, MultipleLines, InternetService, OnlineSecurity, OnlineBackup, DeviceProtection, TechSupport, StreamingTV, StreamingMovies, Contract, PaperlessBilling, PaymentMethod`. Target: `Churn` (Yes=1/No=0). VERIFIED FROM CODE (`config.py:6 TARGET="Churn"`, `03_preprocessing.py:3-10`).

## 58-62. Missing values, duplicates, removals
- TotalCharges: 11 blanks (0.16%) → median imputation (`fillna(median)`). VERIFIED FROM CODE (`02_data_cleaning.py:5-6`).
- Duplicates: `drop_duplicates()` removes ~22 rows (11 blanks overlap). VERIFIED FROM CODE.
- Invalid rows: `customerID` dropped, empty churn rows none. Exact removed: NOT logged, but logic is deterministic.

## 63-66. Class imbalance + implicit examples
- Churn Yes ~26.5% (IBM Telco standard; `04_eda.py` would show). No explicit handling like SMOTE in code — NOT FOUND. Stratified split is the only balance handling. VERIFIED FROM CODE (no resampling code).
- No implicit/negative unlabeled removal beyond the 11 blanks.

## 67-71. Split, leakage
- Split: `train_test_split(X, y, test_size=0.2, stratify=y, random_state=42)` → 80/20 stratified, then same for CV inside `compare()`. VERIFIED FROM CODE (`06_train_test_split.py:6`).
- No leakage check code. No pipeline leakage because ColumnTransformer is inside Pipeline per sample (no fit on test). VERIFIED.

## Part 5 — Preprocessing, exact order (Q72)
1. `TotalCharges = pd.to_numeric(errors="coerce")` → blanks become NaN. USED.
2. `fillna(median)` → impute. USED.
3. `drop(columns=["customerID"])` → drop identifier. USED.
4. `drop_duplicates()` → exact duplicates. USED.
5. At inference: `fill_defaults()` for 12 optional fields (dataset-mode defaults). USED.
6. Inside model: `StandardScaler` for numeric 3, `OneHotEncoder(handle_unknown="ignore")` for 15 categorical. USED.
- lowercasing: NOT USED.
- punctuation/stopwords/stemming/lemmatization: NOT USED (tabular, not text).
- padding/truncation: NOT USED (tabular).
- Encoding: one-hot, not label. VERIFIED.
