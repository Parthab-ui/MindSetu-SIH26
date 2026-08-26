"""Train a Random Forest prototype from the Sri Lanka Navy workbook.

This module intentionally does not invent an SIH26186 LOW/MODERATE/HIGH label.
The current target is a documented research outcome from the source dataset.
"""
from pathlib import Path
import argparse
import joblib
import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier
from sklearn.impute import SimpleImputer
from sklearn.metrics import classification_report, confusion_matrix, balanced_accuracy_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder

BASE = Path(__file__).resolve().parent
DEFAULT_DATA = BASE / "data" / "sri_lanka_navy_follow_up.xlsx"
DEFAULT_MODEL = BASE / "random_forest_ghq.joblib"
TARGET = "GHQ_case"

# Candidate source variables selected for their relationship to service context,
# wellbeing/function and demographic/service characteristics. The final set is
# filtered to columns that actually exist in the workbook.
CANDIDATE_FEATURES = [
    "Age", "Service", "Usual duty", "Q29_Total",
    "Q12_weapon", "Q13_feltdie",
    "Q14.1", "Q14.2", "Q14.3", "Q14.4", "Q14.5", "Q14.6", "Q14.7", "Q14.8",
    "Q23a_cutdowntime", "Q23b_Accomplished_less", "Q23c_limited_work",
    "Q23d_difficulty_performing",
]


def load_data(path: Path) -> pd.DataFrame:
    df = pd.read_excel(path, engine="openpyxl")
    df = df.replace(["#NULL!", "#N/A", "NA", "N/A", ""], np.nan)
    return df


def build_pipeline(features: list[str]) -> Pipeline:
    numeric = [c for c in features if c not in {"Service", "Usual duty"}]
    categorical = [c for c in features if c in {"Service", "Usual duty"}]
    transformers = []
    if numeric:
        transformers.append(("num", SimpleImputer(strategy="median"), numeric))
    if categorical:
        transformers.append(("cat", Pipeline([
            ("imputer", SimpleImputer(strategy="most_frequent")),
            ("onehot", OneHotEncoder(handle_unknown="ignore")),
        ]), categorical))
    pre = ColumnTransformer(transformers=transformers)
    model = RandomForestClassifier(
        n_estimators=400,
        random_state=42,
        class_weight="balanced",
        min_samples_leaf=2,
        n_jobs=-1,
    )
    return Pipeline([("preprocess", pre), ("model", model)])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data", type=Path, default=DEFAULT_DATA)
    parser.add_argument("--model", type=Path, default=DEFAULT_MODEL)
    args = parser.parse_args()

    df = load_data(args.data)
    if TARGET not in df.columns:
        raise SystemExit(f"Target {TARGET!r} not found. Available columns: {list(df.columns)}")

    features = [c for c in CANDIDATE_FEATURES if c in df.columns and c != TARGET]
    if not features:
        raise SystemExit("No candidate features were found in the workbook.")

    work = df[features + [TARGET]].copy()
    work[TARGET] = pd.to_numeric(work[TARGET], errors="coerce")
    work = work.dropna(subset=[TARGET])
    work[TARGET] = work[TARGET].astype(int)

    counts = work[TARGET].value_counts()
    if len(counts) < 2:
        raise SystemExit(f"Target has fewer than two classes: {counts.to_dict()}")
    if counts.min() < 10:
        raise SystemExit(
            f"Target class is too small for a meaningful prototype split: {counts.to_dict()}"
        )

    X = work[features]
    y = work[TARGET]
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )

    pipeline = build_pipeline(features)
    pipeline.fit(X_train, y_train)
    pred = pipeline.predict(X_test)

    print(f"Rows used: {len(work)}")
    print(f"Features: {features}")
    print(f"Target distribution: {y.value_counts().to_dict()}")
    print(f"Balanced accuracy: {balanced_accuracy_score(y_test, pred):.3f}")
    print("Classification report:")
    print(classification_report(y_test, pred, zero_division=0))
    print("Confusion matrix:")
    print(confusion_matrix(y_test, pred))

    args.model.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump({"pipeline": pipeline, "features": features, "target": TARGET}, args.model)
    print(f"Saved model: {args.model}")


if __name__ == "__main__":
    main()
