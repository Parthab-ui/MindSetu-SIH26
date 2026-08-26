"""Benchmark Random Forest, XGBoost and LightGBM on the same prepared dataset.

Optional packages are detected gracefully. The script uses repeated stratified CV,
reports ROC-AUC, average precision, balanced accuracy and F1, and does not alter
the production SIH26186 API.
"""
from pathlib import Path
import argparse
import warnings
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import (
    average_precision_score, balanced_accuracy_score, f1_score, roc_auc_score,
)
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

try:
    from xgboost import XGBClassifier
except ImportError:
    XGBClassifier = None
try:
    from lightgbm import LGBMClassifier
except ImportError:
    LGBMClassifier = None

BASE = Path(__file__).resolve().parent
DEFAULT_DATA = BASE / "data" / "sri_lanka_navy_follow_up.xlsx"
TARGET = "multiplesymptoms_case"
FEATURES = [
    "Age", "Service", "Usual duty", "Q29_Total", "Q12_weapon", "Q13_feltdie",
    "Q14.1", "Q14.2", "Q14.3", "Q14.4", "Q14.5", "Q14.6", "Q14.7", "Q14.8",
    "Q23a_cutdowntime", "Q23b_Accomplished_less", "Q23c_limited_work",
    "Q23d_difficulty_performing",
]
CATS = {"Service", "Usual duty"}


def prepare(path: Path):
    df = pd.read_excel(path, engine="openpyxl")
    df = df.replace(["#NULL!", "#N/A", "NA", "N/A", ""], np.nan)
    features = [c for c in FEATURES if c in df.columns]
    y = pd.to_numeric(df[TARGET], errors="coerce")
    keep = y.notna()
    X = df.loc[keep, features].copy()
    y = y.loc[keep].astype(int)
    return X, y, features


def preprocessor(features):
    numeric = [c for c in features if c not in CATS]
    categorical = [c for c in features if c in CATS]
    return ColumnTransformer([
        ("num", SimpleImputer(strategy="median"), numeric),
        ("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]), categorical),
    ])


def models(y):
    positive = int(y.sum())
    negative = int(len(y) - positive)
    scale = negative / max(positive, 1)
    out = {
        "Random Forest": RandomForestClassifier(
            n_estimators=500, random_state=42, class_weight="balanced",
            min_samples_leaf=2, n_jobs=-1),
    }
    if XGBClassifier:
        out["XGBoost"] = XGBClassifier(
            n_estimators=300, max_depth=3, learning_rate=0.04,
            subsample=0.85, colsample_bytree=0.85, reg_lambda=2,
            scale_pos_weight=scale, objective="binary:logistic",
            eval_metric="logloss", random_state=42, n_jobs=-1)
    if LGBMClassifier:
        out["LightGBM"] = LGBMClassifier(
            n_estimators=300, learning_rate=0.04, num_leaves=15,
            max_depth=5, class_weight="balanced", random_state=42,
            verbosity=-1, n_jobs=-1)
    return out


def main():
    warnings.filterwarnings("ignore")
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    args = parser.parse_args()
    X, y, features = prepare(args.data)
    if y.value_counts().min() < 10:
        raise SystemExit(f"Target distribution too small: {y.value_counts().to_dict()}")
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scoring = {"roc_auc": "roc_auc", "avg_precision": "average_precision",
               "balanced_accuracy": "balanced_accuracy", "f1": "f1"}
    print(f"Rows: {len(y)} | Target: {TARGET} | Distribution: {y.value_counts().to_dict()}")
    print(f"Features: {features}")
    results = []
    for name, estimator in models(y).items():
        pipe = Pipeline([("preprocess", preprocessor(features)), ("model", estimator)])
        scores = cross_validate(pipe, X, y, cv=cv, scoring=scoring, n_jobs=1)
        row = {"model": name}
        for metric in scoring:
            row[metric] = float(np.mean(scores[f"test_{metric}"]))
        results.append(row)
    result_df = pd.DataFrame(results).sort_values("avg_precision", ascending=False)
    print("\nBenchmark (5-fold stratified CV):")
    print(result_df.to_string(index=False, float_format=lambda x: f"{x:.3f}"))
    print("\nSelection priority: average precision, then F1, then balanced accuracy/ROC-AUC.")


if __name__ == "__main__":
    main()
