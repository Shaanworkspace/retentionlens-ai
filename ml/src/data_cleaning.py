"""02 - Data Cleaning: handle missing and inconsistent values."""
import pandas as pd
from config import RAW, PROCESSED

def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["TotalCharges"] = pd.to_numeric(df["TotalCharges"], errors="coerce")
    df["TotalCharges"] = df["TotalCharges"].fillna(df["TotalCharges"].median())
    df = df.drop(columns=["customerID"])
    df = df.drop_duplicates()
    return df

def run():
    df = pd.read_csv(RAW)
    cleaned = clean(df)
    PROCESSED.parent.mkdir(parents=True, exist_ok=True)
    cleaned.to_csv(PROCESSED, index=False)
    print(f"Cleaned: {len(cleaned)} rows, {cleaned.isna().sum().sum()} NaNs")
    return cleaned

if __name__ == "__main__":
    run()
