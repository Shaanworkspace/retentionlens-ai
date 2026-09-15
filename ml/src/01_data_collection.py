"""01 - Data Collection: download IBM Telco Churn dataset."""
import pathlib
import pandas as pd
from config import RAW

URL = "https://raw.githubusercontent.com/IBM/telco-customer-churn-on-icp4d/master/data/Telco-Customer-Churn.csv"

def collect():
    RAW.parent.mkdir(parents=True, exist_ok=True)
    if RAW.exists():
        print(f"Exists: {RAW}")
        return pd.read_csv(RAW)
    print(f"Downloading {URL}")
    df = pd.read_csv(URL)
    df.to_csv(RAW, index=False)
    print(f"Saved {len(df)} rows to {RAW}")
    return df

if __name__ == "__main__":
    df = collect()
    print(df.head(2).to_string())
