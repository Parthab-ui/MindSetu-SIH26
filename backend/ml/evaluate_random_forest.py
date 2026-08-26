"""Reusable evaluation utilities for the trained Random Forest prototype."""
from pathlib import Path
import argparse
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix, balanced_accuracy_score
from train_random_forest import load_data

BASE = Path(__file__).resolve().parent
DEFAULT_DATA = BASE / "data" / "sri_lanka_navy_follow_up.xlsx"
DEFAULT_MODEL = BASE / "random_forest_ghq.joblib"


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    args = parser.parse_args()
    bundle = joblib.load(args.model)
    pipe = bundle["pipeline"]
    features = bundle["features"]
    target = bundle["target"]
    df = load_data(args.data)
    df[target] = pd.to_numeric(df[target], errors="coerce")
    df = df.dropna(subset=[target])
    X = df[features]
    y = df[target].astype(int)
    pred = pipe.predict(X)
    print(f"Rows evaluated: {len(df)}")
    print(f"Balanced accuracy: {balanced_accuracy_score(y, pred):.3f}")
    print(classification_report(y, pred, zero_division=0))
    print("Confusion matrix:")
    print(confusion_matrix(y, pred))


if __name__ == "__main__":
    main()
