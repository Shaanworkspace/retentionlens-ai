"""05 - Feature Engineering: domain features."""
import pandas as pd

def engineer(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["TenureGroup"] = pd.cut(df["tenure"], bins=[0, 12, 24, 48, 100], labels=["0-12", "12-24", "24-48", "48+"])
    df["HasMultipleServices"] = ((df["PhoneService"] == "Yes") & (df["InternetService"] != "No")).astype(int)
    df["IsLongContract"] = (df["Contract"] == "Two year").astype(int)
    df["MonthlyToTotalRatio"] = df["MonthlyCharges"] / (df["TotalCharges"] + 1)
    return df

if __name__ == "__main__":
    from config import PROCESSED
    df = pd.read_csv(PROCESSED)
    df = engineer(df)
    print(df[["TenureGroup", "HasMultipleServices", "IsLongContract"]].head().to_string())
