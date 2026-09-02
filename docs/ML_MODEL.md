# MindSetu — Supervised Machine Learning & TreeSHAP Explainability

This document details the supervised machine learning pipeline, feature schema, TreeSHAP attribution mechanics, and research dataset provenance used in the **MindSetu** SIH26186 platform.

---

## 1. Problem Formulation & Research Mandate

### Non-Diagnostic Decision Support
In high-pressure defense and emergency operations, conventional civilian mental health questionnaires often fail due to unique operational stressors (weapon discharge, threat of death, tactical hyperarousal) and career-stigma concerns.

MindSetu incorporates a supervised research component to:
1. Model complex non-linear relationships between combat exposure, trauma symptoms (PCL-M), and physical role impairment.
2. Provide transparent, mathematical **TreeSHAP** feature attributions showing why a risk signal was generated.

> [!IMPORTANT]
> The LightGBM model is a **research-oriented decision-support tool**. It does **not** provide clinical psychiatric diagnoses (e.g. diagnosing clinical PTSD or Major Depressive Disorder) and does **not** make automated personnel decisions.

---

## 2. Research Dataset Provenance

- **Study Title**: *Mental health status of Sri Lanka Navy personnel three years after end of combat operations: a follow up study*.
- **Repository**: Dryad Digital Repository.
- **Persistent Identifier (DOI)**: [`10.5061/dryad.j1r30`](https://doi.org/10.5061/dryad.j1r30).
- **Study Population**: 495 military personnel (220 Special Boat Squadron / Naval Special Forces, 275 Regular Naval Personnel).
- **Standardized Scales in Dataset**:
  - **PCL-M**: PTSD Checklist — Military Version (17 items, range 17–85).
  - **CES**: Combat Exposure Scale (weapon discharge, threat to life).
  - **SF-36**: Medical Outcomes Study 36-Item Short Form (Role-Physical functional impairment items).

---

## 3. Supervised Model Feature Schema

The trained LightGBM model processes 7 structured features:

| Feature ID | Variable Name | Domain / Scale | Range | Description |
| :---: | :--- | :---: | :---: | :--- |
| **1** | `Q29_Total` | Military PTSD Score | 17 – 85 | Total score on 17-item military PTSD checklist (PCL-M) |
| **2** | `Q12_weapon` | Combat Exposure | 0 or 1 | Combat weapon discharge indicator |
| **3** | `Q13_feltdie` | Threat Exposure | 0 or 1 | Perceived danger of death / life threat indicator |
| **4** | `Q23a_cutdowntime` | Role-Physical (SF-36) | 0 or 1 | Cut down amount of time spent on work/activities |
| **5** | `Q23b_Accomplished_less` | Role-Physical (SF-36) | 0 or 1 | Accomplished less than desired due to health |
| **6** | `Q23c_limited_work` | Role-Physical (SF-36) | 0 or 1 | Were limited in the kind of work or activities |
| **7** | `Q23d_difficulty_performing`| Role-Physical (SF-36) | 0 or 1 | Had difficulty performing work or duties |

- **Target Variable**: `multiplesymptoms_case` (Binary indicator for multi-symptom strain).
- **Classification Threshold**: `0.45` (Calibrated for high screening sensitivity to avoid false negatives in welfare triage).

---

## 4. Pipeline & Model Architecture

```text
Input Features (7) ──► StandardScaler / Imputer ──► LGBMClassifier (GBDT) ──► Probability + Signal
                                                                │
                                                                └──► TreeSHAP ──► Marginal Attributions
```

- **Pipeline Artifact**: `backend/ml/lightgbm_multiplesymptoms.joblib` (322 KB).
- **Booster Type**: LightGBM GBDT (`gbdt`).
- **Inference Latency**: `<15 ms`.

---

## 5. TreeSHAP (Shapley Additive Explanations) Mechanics

To eliminate black-box opacity, MindSetu leverages **TreeSHAP** (Lundberg et al., *Nature Machine Intelligence*) to compute exact Shapley values directly from the decision trees in polynomial time $O(TLD^2)$:

$$f(x) = \phi_0 + \sum_{i=1}^{M} \phi_i(x)$$

Where:
- $\phi_0$ is the baseline expected value of the model.
- $\phi_i(x)$ is the exact marginal attribution of feature $i$ for input $x$.
- $f(x)$ is the model log-odds output.

### Explainability in the UI
In the **Research Lab Modal**, users and supervisors can inspect:
1. **Interactive Attribution Bars**: Showing how combat exposure (`Q13_feltdie`) and physical impairment (`Q23d`) pushed the risk score upward or pulled it downward.
2. **Impact Direction**: Categorized as `"increases signal"` or `"decreases signal"`.
3. **Gemini Synthesis**: Plain-language synthesis explaining the primary drivers behind the attribution ranking.
