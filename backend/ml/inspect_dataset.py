"""Inspect a local SIH26186 research workbook before ML training.

Usage:
    python -m ml.inspect_dataset path/to/workbook.xls

The script intentionally performs inspection only. It does not infer or create
SIH26186 risk labels; that target must be defined after reviewing the source
codebook and study variables.
"""

from __future__ import annotations

import argparse
from pathlib import Path

import pandas as pd


def inspect_workbook(path: Path) -> None:
    if not path.exists():
        raise FileNotFoundError(f"Dataset not found: {path}")

    workbook = pd.ExcelFile(path)
    print(f"File: {path}")
    print(f"Sheets: {workbook.sheet_names}")

    for sheet in workbook.sheet_names:
        print("\n" + "=" * 80)
        print(f"SHEET: {sheet}")
        df = pd.read_excel(path, sheet_name=sheet)
        print(f"Shape: {df.shape[0]} rows x {df.shape[1]} columns")
        print("\nColumns:")
        for column in df.columns:
            non_null = int(df[column].notna().sum())
            dtype = str(df[column].dtype)
            print(f"  - {column!r}: dtype={dtype}, non-null={non_null}/{len(df)}")

        print("\nFirst 5 rows:")
        print(df.head(5).to_string(index=False))

        missing = df.isna().sum().sort_values(ascending=False)
        missing = missing[missing > 0]
        if not missing.empty:
            print("\nMissing values:")
            print(missing.to_string())

        categorical = [
            str(c)
            for c in df.columns
            if pd.api.types.is_object_dtype(df[c])
            or pd.api.types.is_categorical_dtype(df[c])
            or pd.api.types.is_bool_dtype(df[c])
        ]
        numeric = [str(c) for c in df.columns if pd.api.types.is_numeric_dtype(df[c])]

        print("\nLikely categorical/boolean fields:")
        print("  " + ", ".join(categorical) if categorical else "  (none detected)")
        print("Likely numeric fields:")
        print("  " + ", ".join(numeric) if numeric else "  (none detected)")

        print("\nNote: inspect these fields against the source study/codebook before selecting ML features or a target.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Inspect the Sri Lanka Navy SIH26186 research workbook")
    parser.add_argument("path", type=Path)
    args = parser.parse_args()
    inspect_workbook(args.path)


if __name__ == "__main__":
    main()
