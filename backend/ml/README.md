# SIH26186 ML pipeline (v2)

This directory contains the training/evaluation pipeline for the SIH26186 machine-learning layer.

## Initial external dataset

The initial research dataset is the public Dryad dataset:

**Mental health status of Sri Lanka Navy personnel three years after end of combat operations: a follow up study**

DOI: `10.5061/dryad.j1r30`

Dryad provides the file `Follow up Dryad revised.xls` (117.25 KB). The study reports data from 220 Navy Special Forces personnel and 275 regular forces personnel. See the source record before downloading: https://datadryad.org/dataset/doi%3A10.5061/dryad.j1r30

The dataset is a research source for feature/target discovery and model prototyping. Its mental-health outcomes must **not** be silently relabeled as the SIH26186 LOW/MODERATE/HIGH welfare-risk target. The target mapping must be documented and validated before a production-style model is trained.

## Local layout

Place the downloaded workbook at:

```text
backend/ml/data/sri_lanka_navy_follow_up.xls
```

The `data/` directory is intentionally ignored from source control so the research dataset is not committed to Git.

## First step

Run:

```powershell
python -m ml.inspect_dataset backend/ml/data/sri_lanka_navy_follow_up.xls
```

This prints sheet names, dimensions, columns, sample rows, missingness, and likely categorical/numeric fields. After inspection, we will define the SIH26186 feature mapping and target before training Random Forest.

## Planned model workflow

```text
Sri Lanka Navy workbook
        -> data inspection
        -> feature/target definition
        -> cleaning + encoding
        -> stratified train/test split
        -> Random Forest baseline
        -> precision / recall / F1 / confusion matrix
        -> feature importance
        -> model artifact
        -> FastAPI inference
```

Do not report model accuracy as evidence of clinical or operational validity unless the target and labels have been independently validated for SIH26186.
