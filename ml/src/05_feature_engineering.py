"""05 - Feature Engineering: domain features."""
import pandas as pd
import numpy as np

def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # AvgMonthlySpend = TotalCharges / tenure (tenure 0 safe)
    df["AvgMonthlySpend"] = df["TotalCharges"] / df["tenure"].replace(0, 1)
    df["AvgMonthlySpend"] = df["AvgMonthlySpend"].replace([np.inf, -np.inf], 0).fillna(0)
    # ServiceCount: Yes among 6 services
    service_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport","StreamingTV","StreamingMovies"]
    df["ServiceCount"] = (df[service_cols] == "Yes").sum(axis=1)
    # SupportServiceCount: Yes among 4 support services
    support_cols = ["OnlineSecurity","OnlineBackup","DeviceProtection","TechSupport"]
    df["SupportServiceCount"] = (df[support_cols] == "Yes").sum(axis=1)
    # IsMonthToMonth: 1 if Month-to-month else 0
    df["IsMonthToMonth"] = (df["Contract"] == "Month-to-month").astype(int)
    return df

if __name__ == "__main__":
    from config import PROCESSED
    df = pd.read_csv(PROCESSED)
    df = engineer(df)
    print(df[["AvgMonthlySpend","ServiceCount","SupportServiceCount","IsMonthToMonth"]].head().to_string())
