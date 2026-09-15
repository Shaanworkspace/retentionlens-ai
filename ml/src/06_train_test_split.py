"""06 - Train/Test Split: stratified to handle imbalance."""
import pandas as pd
from sklearn.model_selection import train_test_split
from config import TARGET, TEST_SIZE, RANDOM_STATE

def split(df: pd.DataFrame):
    X = df.drop(columns=[TARGET])
    y = df[TARGET].map({"Yes": 1, "No": 0})
    return train_test_split(X, y, test_size=TEST_SIZE, stratify=y, random_state=RANDOM_STATE)
