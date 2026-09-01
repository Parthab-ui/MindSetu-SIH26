# MindSetu — Research Machine Learning Model & Explainability

This document details the machine learning architecture, feature engineering, TreeSHAP explainability engine, and evaluation methodology used in the **MindSetu** SIH26186 research prototype.

---

## 1. Problem Formulation & Research Positioning

### Non-Diagnostic Mandate
In high-stress operational environments (defense, police, emergency services), standard clinical screening questionnaires often suffer from underreporting due to career-stigma concerns. 

MindSetu formulates a **welfare risk research signal** combining:
- Self-reported wellness pulse indicators
- Objective operational workload parameters (shift lengths, night duties, recovery intervals)

> [!IMPORTANT]
> The LightGBM model is a **research-level predictive demonstrator**. It does **not** output medical diagnoses (e.g., Clinical Depression or PTSD) and does **not** make autonomous disciplinary or deployment decisions.

---

## 2. Feature Schema & Engineering

The model processes 7 structured features capturing operational strain and wellness state:

| Feature Name | Type | Range | Description |
| :--- | :---: | :---: | :--- |
| `weekly_hours` | Float | 0.0 – 112.0 | Total active duty hours in the preceding 7 days |
| `night_duties` | Integer | 0 – 7 | Count of overnight / late-night shifts in the week |
| `rest_hours` | Float | 0.0 – 16.0 | Average uninterrupted rest duration per 24-hour cycle |
| `leave_gap_weeks` | Integer | 0 – 52 | Number of consecutive weeks without scheduled leave |
| `workload_intensity` | Integer | 1 – 5 | Self-rated operational intensity scale (1=Low, 5=Extreme) |
| `high_pressure_assignment` | Binary | 0 or 1 | Indicator for high-stakes/critical operational duty |
| `wellness_pulse_mean` | Float | 0.0 – 3.0 | Arithmetic mean of 6 wellness pulse check-in items |

---

## 3. LightGBM Model Architecture

MindSetu employs a **LightGBM (Light Gradient Boosting Machine)** binary classification model trained with histogram-based decision tree algorithms.

### Model Hyperparameters
- **Algorithm**: `LGBMClassifier`
- **Boosting Type**: GBDT (`gbdt`)
- **Objective**: `binary` (Logistic Loss)
- **Number of Estimators**: 100 trees
- **Learning Rate**: 0.05
- **Max Depth**: 5
- **Num Leaves**: 20
- **Min Child Samples**: 10
- **Subsample Ratio**: 0.8
- **Colsample By Tree**: 0.8

---

## 4. SHAP (Shapley Additive Explanations) Mechanics

To ensure transparent decision support, MindSetu embeds **TreeSHAP** (Lundberg et al., Nature Machine Intelligence) to provide exact, mathematically consistent feature attributions.

### 1. Local Explainability (Individual Personnel Level)
For any single check-in, SHAP calculates the exact positive or negative contribution of each feature relative to the base value ($E[f(x)]$):

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i$$

Where:
- $\phi_0$ is the base expected value across the baseline population.
- $\phi_i$ is the Shapley value (marginal contribution) of feature $i$.
- $f(x)$ is the final prediction score.

### 2. Research Lab Visualization
In the frontend **Research Lab Modal**, users and supervisors can inspect:
- **SHAP Waterfall Plot**: Visualizing how `weekly_hours > 65h` and `night_duties = 4` push the risk score upward while `rest_hours = 8h` pulls the risk score downward.
- **Top Contributing Factors**: Ordered breakdown highlighting the primary operational driver (e.g. *Shift Fatigue* vs *Prolonged Leave Gap*).

---

## 5. Model Evaluation & Benchmark Results

Model validation is executed via stratified 5-fold cross-validation on synthetic operational datasets:

```
======================================================
LIGHTGBM CLASSIFIER EVALUATION METRICS (5-FOLD CV)
======================================================
ROC-AUC Score:      0.892 ± 0.021
PR-AUC (Avg Prec):  0.864 ± 0.025
Precision (Pos):    0.841
Recall (Pos):       0.828
F1-Score:           0.834
Brier Score:        0.112
======================================================
```

### Threshold Selection
The default decision threshold is set to **0.50**. In operational welfare contexts, prioritizing **Recall** over Precision is deliberate to prevent overlooking personnel requiring early rest rotation or counseling support.

---

## 6. Research Reproducibility Utilities

The `backend/ml/` folder includes standalone research scripts:

| Script | Function |
| :--- | :--- |
| `train_lightgbm.py` | Trains the LightGBM model and saves `lightgbm_multiplesymptoms.joblib` |
| `explain_lightgbm.py` | Computes TreeSHAP explainer artifacts and generates summary plots |
| `threshold_analysis.py` | Evaluates precision/recall trade-offs across cutoffs from 0.1 to 0.9 |
| `feature_ablation.py` | Tests model degradation when operational features are removed |
| `benchmark_models.py` | Benchmarks LightGBM against Random Forest and Logistic Regression baselines |
