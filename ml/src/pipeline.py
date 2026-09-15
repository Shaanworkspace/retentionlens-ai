"""End-to-end pipeline: collection -> cleaning -> train -> evaluate -> save."""
import pandas as pd
import sys
sys.path.insert(0, ".")
from config import PROCESSED
from data_collection import collect
from data_cleaning import clean
from train_test_split import split
from model import build_pipeline, compare
from evaluation import evaluate
from deployment import save_model, save_metrics

def main():
    df_raw = collect()
    df_clean = clean(df_raw)
    df_clean.to_csv(PROCESSED, index=False)
    X, y = split(df_clean)[0], split(df_clean)[1]
    # split returns 4 values, recompute correctly
    from train_test_split import split as do_split
    X_train, X_test, y_train, y_test = do_split(df_clean)

    best, _ = compare(X_train, y_train)
    pipe = build_pipeline(best)
    pipe.fit(X_train, y_train)

    y_pred = pipe.predict(X_test)
    y_proba = pipe.predict_proba(X_test)[:, 1]
    metrics = evaluate(y_test, y_pred, y_proba)
    metrics["best_model"] = best
    print(metrics)

    save_model(pipe)
    save_metrics(metrics)

if __name__ == "__main__":
    main()
