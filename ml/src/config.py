import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
RAW = ROOT / "data" / "raw" / "telco_churn.csv"
PROCESSED = ROOT / "data" / "processed" / "clean.csv"
MODEL_PATH = ROOT / "models" / "model.pkl"
METRICS_PATH = ROOT / "reports" / "metrics.json"
TARGET = "Churn"
RANDOM_STATE = 42
TEST_SIZE = 0.2
