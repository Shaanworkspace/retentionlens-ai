"""04 - EDA: summary stats and key insights."""
import pandas as pd
from config import PROCESSED

def analyze():
    df = pd.read_csv(PROCESSED)
    print("Shape:", df.shape)
    print("\nChurn distribution:")
    print(df["Churn"].value_counts(normalize=True).round(3).to_string())
    print("\nChurn by Contract:")
    print(pd.crosstab(df["Contract"], df["Churn"], normalize="index").round(3).to_string())
    print("\nChurn by Tenure group:")
    df["TenureGroup"] = pd.cut(df["tenure"], bins=[0, 12, 24, 48, 100], labels=["0-12", "12-24", "24-48", "48+"])
    print(pd.crosstab(df["TenureGroup"], df["Churn"], normalize="index").round(3).to_string())
    print("\nNumeric describe:")
    print(df[["tenure", "MonthlyCharges", "TotalCharges"]].describe().round(2).to_string())

if __name__ == "__main__":
    analyze()
