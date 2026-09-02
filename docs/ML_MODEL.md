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

### Model Architecture & Artifact
- **Algorithm**: Calibrated `GradientBoostingClassifier` with `StandardScaler` preprocessor.
- **Artifact**: `backend/ml/voice_depression_classifier.joblib` (212 KB).
- **Outputs**:
  - `depression_signal`: 0–100 score reflecting paralinguistic depressive strain.
  - `trauma_signal`: 0–100 score (labeled as *Experimental research signal*).
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
