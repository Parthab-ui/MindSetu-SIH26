# MindSetu — SIH 2026 Master Project Context

> Canonical master context and source of truth for MindSetu evaluation, mentor defense, and technical audits.

---

## 1. Project Identity

- **Project:** MindSetu (माइंडसेतु)
- **SIH Edition:** Smart India Hackathon 2026
- **Problem Statement ID:** SIH26186
- **Theme:** HealthTech / Personnel Welfare Technology
- **Category:** Software (Web Application & Multimodal ML Decision Support)
- **Target User Group:** Uniformed Personnel (Armed Forces, Paramilitary / CAPF, Police, Emergency Response)
- **Mandate:** AI-assisted personnel welfare screening, operational duty triage, and explainable decision-support aid.
- **Repository:** `Parthab-ui/MindSetu-SIH26`
- **Default & Active Branch:** `main`

---

## 2. Core Technological Stack

- **Frontend Client:** React 19 + Vite (281 KB production bundle, compiling in ~320ms).
- **Backend API:** FastAPI (Async ASGI, Python 3.11+).
- **Backend Service:** FastAPI application (`backend/sih26186_server.py`).
- **Persistence:** PostgreSQL (Neon Lakebase) via connection pool (`psycopg_pool`).
- **Research ML Engine:** LightGBM classifier with polynomial-time TreeSHAP ($O(TLD^2)$) feature attribution (<15ms latency).
- **Voice ML Engine:** 24-feature acoustic and prosodic biomarker extractor (NumPy/SciPy) + trained GradientBoostingClassifier (<15ms latency).
- **Conversational Support:** Google Gemini 3.5 Flash via official Google GenAI SDK (Server-Sent NDJSON streaming) with strict crisis interception and deterministic fallback.
- **Automated Test Suite:** Pytest (33/33 passing tests across AI self-audit, contracts, scoring math, ML schemas, voice routes, and local e2e lifecycles).

---

## 3. Tri-Signal Multimodal Architecture

MindSetu does not rely on a single self-report or subjective survey. It evaluates three complementary modalities:

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

1. **Self-Reported Wellbeing Pulse:**
   - Evaluates Depression (exhaustion, cognitive fog, duty burden) and PTSD/Trauma (hypervigilance, emotional detachment, disturbed sleep).
   - Generates granular subscales: **Depression Symptom Indicator (DSI)** and **PTSD/Trauma Symptom Indicator (TSI)**.
2. **Operational Duty Context:**
   - Measures daily duty hours, sleep recovery hours, night watches, leave gap, tempo (1–5), high-pressure assignment status, and unscheduled rotations.
   - Computes normalized **Operational Workload Index (OSI)**.
3. **Voice ML Paralinguistic Biomarkers:**
   - In-memory decoding of audio waveforms via HTML5 `MediaRecorder` / WAV bytes.
   - Computes 24 acoustic features (dynamic pitch range, $F_0$ variance, pause/hesitation ratio, speech rate cadence, spectral flux, and 13 MFCCs).
   - Trained `GradientBoostingClassifier` outputs a **Depression-Related Voice Signal** and experimental stress proxy.
   - **Zero Raw Audio Storage:** Waveform bytes are decoded in RAM and immediately released. Zero audio recordings are stored on disk or database.

---

## 4. Dual-Layer AI Governance & Non-Clinical Mandate

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                       AI RESPONSIBILITY BOUNDARIES                         │
├──────────────────────────┬─────────────────────────────────────────────────┤
│ Layer                    │ Explicit System Responsibility                  │
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Deterministic Engine  │ Authoritative Welfare Triage (55% Wellness + 45% Workload) │
│ 2. Voice ML Classifier   │ Objective Paralinguistic Acoustic Biomarker Signal │
│ 3. LightGBM Classifier   │ Supervised Research Signal & Risk Pattern Analysis │
│ 4. TreeSHAP Engine       │ Exact Local Feature Attribution (<15 ms)        │
│ 5. Google Gemini 3.5     │ Streaming Empathetic & Actionable Coping Chat   │
│ 6. Human Welfare Officer │ Real-World Decision Making & Clinical Support   │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

> [!IMPORTANT]
> **Welfare Decision-Support Mandate**: MindSetu is an early welfare screening and decision-support aid. It does **not** provide clinical psychiatric diagnoses, prescribe medications, or make autonomous disciplinary or personnel deployment decisions.

---

## 5. Flagship User Journey (2–3 Minutes Live Demo)

1. **Context Initialization (`StartScreen.jsx`):**
   - Click `✦ Field Deployment` preset.
   - Anonymous session token (UUIDv4) generated without asking for names, service numbers, or phone numbers.
2. **Specialized Wellbeing Pulse (`WellnessScreen.jsx`):**
   - Click `⚡ High Strain` preset (or answer 6 crisp 1-sentence questions).
   - 0–3 scale mapped to normalized score.
3. **Operational Duty Demands (`WorkloadScreen.jsx`):**
   - Click `⚔️ Field Deployment` preset.
   - Configures 14h shift, 4 night duties, 4.5h sleep deficit, weighted into OSI.
4. **Multimodal Voice Check (`VoiceScreen.jsx`):**
   - Click `⚡ Strained Audio Sample` (or record live microphone).
   - In <15ms, extracts 24 acoustic biomarkers (pitch range constriction, pause ratio, speech cadence).
5. **Multimodal Results Dashboard (`AnalysisScreen.jsx`):**
   - Numbers-first display: Depression (78%), Trauma (65%), Workload (81%), Voice (78%).
   - **Multimodal Concordance Card**: Explains signal alignment/divergence.
   - Structured 3-part takeaway: `WHAT WE SEE`, `NEXT STEP`, `FOLLOW-UP`.
6. **Explainable TreeSHAP Lab (`ResearchLabModal.jsx`):**
   - Opens LightGBM research model trained on published Sri Lanka Navy data (Dryad DOI: `10.5061/dryad.j1r30`).
   - Computes exact TreeSHAP feature attributions in <15ms.
7. **Longitudinal History & Trends (`MoodScreen.jsx`):**
   - Logs daily mood rating (1–5).
   - Displays 7-day recovery trend and chronological assessment milestones.
8. **Empathetic AI Companion (`ChatScreen.jsx`):**
   - Real-time streaming coping chat with automatic Tele-MANAS (`14416`) crisis intercept.

---

## 6. Scoring Formulas & Scientific Thresholds

### Deterministic Welfare Triage Score
$$\text{Combined Score} = (0.55 \times \text{Wellness Score}) + (0.45 \times \text{Workload Score})$$

- **High Priority**: $\text{Combined} \ge 70 \lor \text{Wellness} \ge 80 \lor \text{Workload} \ge 85$
- **Moderate Priority**: $\text{Combined} \ge 45 \lor \text{Wellness} \ge 50 \lor \text{Workload} \ge 60$
- **Low Priority**: Otherwise.

### Subscale Formulas
- **Depression Symptom Indicator (DSI)**:
  $$\text{DSI} = \frac{Q1 (\text{Exhaustion}) + Q4 (\text{Cognitive Fog}) + Q6 (\text{Duty Burden})}{9} \times 100$$
- **PTSD / Trauma Symptom Indicator (TSI)**:
  $$\text{TSI} = \frac{Q2 (\text{Hypervigilance}) + Q3 (\text{Detachment}) + Q5 (\text{Disturbed Sleep})}{9} \times 100$$

---

## 7. Automated Testing & Verification Baseline

- **Automated Pytest Suite:** **26 of 26 tests passed** (`.venv\Scripts\python -m pytest backend/tests -v`).
- **Test Categories:**
  - `test_ai_self_audit.py` (5 tests): Self-audit contract, structured context injection, prompt-leakage rejection, crisis routing, deterministic fallback.
  - `test_e2e_local.py` (4 tests): Core health, ML inference + TreeSHAP, deterministic triage math, full session lifecycle (Session → Wellness → Workload → Voice → Analyze → Dashboard → History).
  - `test_health_contracts.py` (3 tests): Route registration for health, AI audit, and SIH endpoints.
  - `test_sih26186_logic.py` (3 tests): Wellness bounds, invalid answer rejection, classification boundary conditions.
  - `test_sih26186_ml_routes.py` (4 tests): Valid ML request, PCL-M bounds (low/high), binary feature validation.
  - `test_voice_routes.py` (7 tests): Voice health, demo sample generation, multipart WAV analysis, base64 payload analysis, short audio rejection (<1s), 24-feature ordering and consistency, corrupt audio handling.
- **Frontend Production Build:** Vite v8.2.2 compiles client bundle in **~320ms** (281 KB JS / 43.9 KB CSS, 0 errors, 0 warnings).

---

## 8. SIH Mentor & Judge Defense Positioning

### Q: Why not just use ChatGPT or a generic mental health app?
> *"Generic chatbots lack operational duty context, have no deterministic safety guarantees, cannot process in-memory voice acoustic biomarkers, and cannot explain tabular clinical features. MindSetu combines structured duty parameters, clinically mapped screening, deterministic triage bounds, and explainable TreeSHAP research models—keeping the conversational AI as a bounded, supportive guidance layer."*

### Q: Does MindSetu diagnose mental health conditions?
> *"No. MindSetu is strictly an early welfare screening and decision-support tool. It identifies symptom patterns and operational risk bands. Formal clinical diagnoses and duty fitness evaluations remain strictly human-driven."*

### Q: Where did your Voice ML dataset come from?
> *"Our voice ML model is a prototype Gradient Boosting classifier trained on 800 synthetic acoustic feature profiles calibrated to empirical clinical paralinguistic benchmark distributions (Mundt et al., Cummins et al., DAIC-WOZ). We chose this approach to build a working, reproducible paralinguistic classifier prototype without violating privacy or licensing restrictions on sensitive clinical voice recordings. Prospective deployment requires local validation on Indian defense cohorts."*

### Q: Is raw voice data stored?
> *"No. Waveforms are processed in-memory and discarded immediately after extracting the 24 acoustic biomarkers. Zero audio files or voice recordings are stored on disk or in the database, and audio is never transmitted to Google or third parties."*
