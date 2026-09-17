"""03 - Preprocessing: encode categoricals and scale numerics via ColumnTransformer."""
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from config import TARGET

NUMERIC = ["tenure", "MonthlyCharges", "TotalCharges", "AvgMonthlySpend", "ServiceCount", "SupportServiceCount", "IsMonthToMonth"]
CATEGORICAL = [
    "gender", "Partner", "Dependents", "PhoneService", "MultipleLines",
    "InternetService", "OnlineSecurity", "OnlineBackup", "DeviceProtection",
    "TechSupport", "StreamingTV", "StreamingMovies", "Contract",
    "PaperlessBilling", "PaymentMethod"
]

def build_preprocessor():
    return ColumnTransformer([
        ("num", StandardScaler(), NUMERIC),
        ("cat", OneHotEncoder(handle_unknown="ignore"), CATEGORICAL),
    ])

def get_feature_lists():
    return NUMERIC, CATEGORICAL
