# MindSetu — Multimodal Machine Learning & Explainability

This document details the machine learning pipelines, feature schemas, TreeSHAP explainability, and the **Voice ML Paralinguistic Classifier** in **MindSetu** for SIH Problem Statement **SIH26186**.

---

## 1. Multimodal Tri-Signal Architecture

MindSetu formulates a **tri-signal multimodal decision-support framework** specifically designed for uniformed personnel:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                       MINDSETU MULTIMODAL SIGNALS                           │
├──────────────────────────┬──────────────────────────────────────────────────┤
│ Modality                 │ Core Mechanism & Role                            │
├──────────────────────────┼──────────────────────────────────────────────────┤
│ 1. Self-Reported Pulse   │ 6 clinically mapped uniformed mental health items │
│ 2. Operational Workload  │ 7 objective duty parameters (shifts, sleep, tempo) │
│ 3. Voice Paralinguistics │ 24 acoustic/prosodic biomarkers via GBDT pipeline │
└──────────────────────────┴──────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Non-Diagnostic Decision Support**: Neither the LightGBM research model nor the Voice ML model output clinical psychiatric diagnoses. All scores serve as early welfare screening and triage decision aids.

---

## 2. Research Model 1: Supervised LightGBM + TreeSHAP

### Research Dataset Provenance
- **Study Title**: *Mental health status of Sri Lanka Navy personnel three years after end of combat operations: a follow up study*.
- **Repository**: Dryad Digital Repository.
- **Persistent Identifier (DOI)**: [`10.5061/dryad.j1r30`](https://doi.org/10.5061/dryad.j1r30).
- **Study Population**: 495 military personnel (220 Special Boat Squadron, 275 Regular Naval Personnel).

### 7-Feature Schema
1. `Q29_Total`: PCL-M military PTSD checklist score (17–85).
2. `Q12_weapon`: Combat weapon discharge indicator (0/1).
3. `Q13_feltdie`: Perceived danger of death / life-threat indicator (0/1).
4. `Q23a_cutdowntime`: SF-36 Role-Physical cut work time (0/1).
5. `Q23b_Accomplished_less`: SF-36 Role-Physical accomplished less (0/1).
6. `Q23c_limited_work`: SF-36 Role-Physical limited work (0/1).
7. `Q23d_difficulty_performing`: SF-36 Role-Physical difficulty performing (0/1).

- **Artifact**: `backend/ml/lightgbm_multiplesymptoms.joblib` (322 KB).
- **Inference Latency**: `<15 ms`.
- **Explainability**: Exact Shapley values via **TreeSHAP** polynomial-time explainer $O(TLD^2)$.

---

## 3. Research Model 2: Voice ML Paralinguistic Classifier

### Background & Biomarker Justification
In psychiatric and military acoustics (e.g. Mundt et al., Cummins et al., DAIC-WOZ benchmarks), depressive states and psychomotor fatigue manifest in measurable acoustic biomarkers:
- **Pitch Flattening**: Reduced fundamental frequency variability ($\text{std}(F_0)$) and narrow pitch dynamic range.
- **Hesitation & Slowing**: Elevated pause duration ratios and reduced syllabic cadence.
- **Vocal Tract Tension**: Alterations in spectral centroid, spectral flux, and lower-order Mel-Frequency Cepstral Coefficients (MFCCs).

### 24 Acoustic & Prosodic Features
Extracted in pure NumPy and SciPy in under 15 milliseconds without external C++ bloat:

| Category | Features | Description |
| :--- | :--- | :--- |
| **Prosodic / Pitch** | `pitch_f0_mean`, `pitch_f0_std`, `pitch_range` | Fundamental frequency $F_0$ distribution via normalized autocorrelation |
| **Temporal / Rhythm** | `pause_ratio`, `speech_rate_estimate` | Proportion of silence frames and syllable peak cadence per second |
| **Energy & Dynamics** | `rms_energy`, `energy_entropy` | Root-mean-square amplitude and spectral energy entropy |
| **Spectral** | `spectral_centroid`, `spectral_spread`, `spectral_flux`, `zero_crossing_rate` | Center of spectral mass, frequency spread, spectral modulation, and zero-crossing rate |
| **Phonation / Timbre** | `mfcc_1` to `mfcc_13` | 13 Mel-Frequency Cepstral Coefficients capturing vocal tract filter shape |

### Model Architecture & Training Methodology
- **Algorithm**: Calibrated `GradientBoostingClassifier` with `StandardScaler` preprocessor wrapped in an `sklearn.pipeline.Pipeline`.
- **Hyperparameters**: `n_estimators=100`, `learning_rate=0.08`, `max_depth=4`, `subsample=0.85`, `random_state=42`.
- **Training Corpus**: 800 synthetic acoustic feature profiles generated from parametric Gaussian distributions calibrated to published clinical paralinguistic benchmark literature (Mundt et al., Cummins et al., DAIC-WOZ acoustic metrics).
- **Artifact**: `backend/ml/voice_depression_classifier.joblib` (212.1 KB).
- **5-Fold Cross-Validation Metrics**:
  - `ROC-AUC`: $0.9995 \pm 0.0005$
  - `F1-Score`: $0.9875 \pm 0.0096$
  - `Recall`: $0.9875 \pm 0.0079$
  - `Precision`: $0.9876 \pm 0.0135$
  - `Brier Score`: $0.0115$
  *(Note on Metrics: The near-perfect separability evaluates the model's ability to discriminate published clinical paralinguistic distributions. Real-world operational deployment will require validation on field recordings from Indian defense cohorts).*
- **Top Acoustic Contributors (Feature Importance)**:
  1. `pitch_range` (83.05%): Fundamental frequency dynamic span (constriction in depressive states).
  2. `pitch_f0_std` (9.02%): Fundamental frequency standard deviation (prosodic monotony).
  3. `pause_ratio` (4.59%): Unvoiced silence proportion (hesitation and psychomotor slowing).
  4. `speech_rate_estimate` (1.77%): Syllabic cadence and rhythm.
  5. `spectral_flux` (0.69%): Rate of spectral envelope change.
- **Outputs**:
  - `depression_signal`: 0–100 continuous score reflecting paralinguistic depressive psychomotor strain.
  - `trauma_signal`: 0–100 continuous score (strictly labeled as *Experimental proxy* based on pitch variance and spectral flux).
  - `confidence`: 0.0–1.0 confidence score calibrated against audio duration and SNR.
  - `audio_quality`: `"good"` ($\text{SNR} \ge 15\text{dB}$, duration $\ge 4\text{s}$), `"moderate"`, or `"poor"`.


### In-Memory Privacy Architecture
- Raw audio is decoded in-memory (`io.BytesIO`).
- Acoustic features are extracted, and the raw audio waveform is **immediately discarded** from memory.
- Zero audio files or recordings are stored on disk or in the database.

---

## 4. Multimodal Signal Concordance & Disagreement Logic

MindSetu treats cross-modal divergence as a scientifically transparent feature:

| Self-Report | Voice Signal | Multimodal Interpretation |
| :---: | :---: | :--- |
| **High** | **High** | **Cross-Modal Reinforcement**: Self-reported distress is reinforced by measurable acoustic psychomotor slowing. Priority welfare check-in recommended. |
| **High** | **Low** | **Modal Divergence**: Self-reported mental fatigue is elevated while vocal prosody remains steady. Reflects high situational cognitive load without deep vocal psychomotor slowing. |
| **Low** | **High** | **Modal Divergence**: Speech acoustic markers (pitch flattening, long pauses) indicate latent fatigue despite lower self-reported scores. Suggests possible underreporting due to duty stigma. |
| **Low** | **Low** | **Cross-Modal Stability**: Both self-reported and acoustic markers reflect steady operational recovery. |
