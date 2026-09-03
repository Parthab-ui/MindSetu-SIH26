# MindSetu — Multimodal Personnel Welfare Support Platform (SIH26186)

[![Build & Tests](https://img.shields.io/badge/pytest-33%20passed-success)](backend/tests)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-3.5%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Explainability](https://img.shields.io/badge/XAI-TreeSHAP-ff69b4)](docs/ML_MODEL.md)
[![Voice ML](https://img.shields.io/badge/Voice%20ML-Paralinguistic%20Biomarkers-blueviolet)](docs/ML_MODEL.md)
[![Database](https://img.shields.io/badge/PostgreSQL-Neon%20Lakebase-00E599.svg)](https://neon.tech)

**MindSetu** is an AI-assisted **multimodal personnel welfare screening and decision-support platform** engineered for Smart India Hackathon 2026 Problem Statement **SIH26186**.

Designed specifically for **Uniformed Personnel** (Armed Forces, Paramilitary / CAPF, Police, and Emergency Services), MindSetu bridges the gap between operational duty strain and timely human support through a **Tri-Signal Multimodal Architecture**:
1. **Self-Reported Wellbeing Pulse**: Clinically mapped check-in evaluating Depressive Fatigue, Tactical Hypervigilance, Emotional Detachment, Decision Fatigue, Trauma Intrusion, and Service Stigma.
2. **Objective Operational Duty Demands**: 7 parameters capturing shift lengths, night watch rotations, sleep deficits, and leave gaps weighted into an **Operational Workload Index (OSI)**.
3. **Calibrated Voice Check (10–15s Target)**: Supervised speech classifier extracting 24 acoustic/prosodic parameters in-memory with real-time Web Audio waveform visualization and standardized reading protocol (zero raw audio stored).
4. **Supervised TreeSHAP Research Lab**: Real LightGBM classifier trained on published military research data (Sri Lanka Navy Study, Dryad DOI: `10.5061/dryad.j1r30`) computing exact Shapley feature attributions.
5. **Doctor Connect & Tele-Consultation**: Direct appointment scheduling and private in-browser video consultation with Military Medical Officers and Clinical Psychologists.
6. **Empathetic AI Companion & Longitudinal History**: Google Gemini companion with strict safety boundaries, milestone timelines, and verified 24/7 Tele-MANAS (14416) crisis escalation.

> [!IMPORTANT]
> **Welfare Decision-Support Mandate**: MindSetu is an early welfare screening and decision-support aid. It does **not** provide clinical psychiatric diagnoses, prescribe medications, or make autonomous disciplinary or personnel deployment decisions.

---

## 🧭 Complete Multimodal User Journey

```text
Personnel (Anonymous UUID Session)
       │
       ▼
[ 1. Service Branch & Operational Context ] (StartScreen.jsx)
       │
       ▼
[ 2. 6-Item Uniformed Wellbeing Pulse ] (WellnessScreen.jsx)
       │
       ▼
[ 3. Operational Duty Demands & Workload Context ] (WorkloadScreen.jsx)
       │
       ▼
[ 4. Calibrated Voice Check (10–15s Live Waveform ML) ] (VoiceScreen.jsx)
       │
       ▼
[ 5. Multimodal Decision-Support Dashboard (DSI / TSI / Voice / OSI) ] (AnalysisScreen.jsx)
       │
       ├─► [ 6. Explainable TreeSHAP ML Research Lab ] (ResearchLabModal.jsx)
       ├─► [ 7. Contextual Gemini AI Companion (Streaming NDJSON) ] (ChatScreen.jsx)
       ├─► [ 8. Doctor Connect & Video Consultation ] (DoctorDirectoryScreen.jsx / ConsultationScreen.jsx)
       ├─► [ 9. Longitudinal Assessment Milestones Timeline ] (MoodScreen.jsx)
       └─► [ 10. Verified Crisis Intervention ] (Tele-MANAS 14416 / Vandrevala Foundation)
```

---

## 🏛️ Multimodal AI Governance & Responsibility Boundaries

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                       AI RESPONSIBILITY BOUNDARIES                         │
├──────────────────────────┬─────────────────────────────────────────────────┤
│ Layer                    │ Explicit System Responsibility                  │
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Deterministic Engine  │ Authoritative Welfare Triage (55% Wellness + 45% Workload) │
│ 2. Voice ML Classifier   │ Objective Paralinguistic Acoustic Biomarker Signal │
│ 3. LightGBM Classifier   │ Supervised Research Signal & Risk Exploration   │
│ 4. TreeSHAP Engine       │ Exact Local Feature Attribution (<15 ms)        │
│ 5. Google Gemini 3.5     │ Streaming Empathetic & Actionable Coping Chat   │
│ 6. Human Welfare Officer │ Real-World Decision Making & Clinical Support   │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 💻 Quickstart (Local Development)

### 1. Prerequisites
- **Python**: 3.11 or higher
- **Node.js**: v18 or v20+
- **Git**

### 2. Backend Service (FastAPI + LightGBM + Voice ML)
```powershell
# From project root:
python -m venv .venv
# Windows:
.\.venv\Scripts\Activate.ps1
# Mac/Linux:
# source .venv/bin/activate

pip install -r backend/requirements.txt
cp .env.example backend/.env

# Run FastAPI backend with hot reload:
uvicorn sih26186_server:app --reload --port 8000 --app-dir backend
```

### 3. Frontend Application (React 19 + Vite)
```powershell
# In a new terminal from project root:
cd frontend
npm install
npm run dev
```

Open your browser at **`http://localhost:5173`** (Swagger API docs at **`http://127.0.0.1:8000/docs`**).

---

## 🧪 Automated Testing & Verification

MindSetu maintains 100% passing test suites across all backend contracts, logic bounds, and ML pipelines:

```powershell
# Run the full automated pytest suite (33 passing tests):
.venv\Scripts\python -m pytest backend/tests -v

# Run production frontend bundle verification:
npm --prefix frontend run build
```

---

## 📚 Comprehensive Documentation Index

| Document | Description |
| :--- | :--- |
| 📖 **[System Architecture](docs/ARCHITECTURE.md)** | End-to-end component topology, multimodal data flows, database schemas, and failover design |
| 🔌 **[API Reference](docs/API.md)** | Complete REST & streaming NDJSON specifications with request/response payloads |
| 🧠 **[Research ML & Voice](docs/ML_MODEL.md)** | LightGBM pipeline, Voice ML feature extraction (24 acoustic parameters), TreeSHAP equations, and Dryad dataset citation |
| 🛡️ **[Safety & Privacy](docs/SAFETY.md)** | Non-clinical boundaries, privacy-by-design, anonymous sessions, in-memory audio processing, and crisis escalation |
| 🎤 **[SIH Presentation & Defense Guide](docs/SIH_DEMO_GUIDE.md)** | 30s/60s elevator pitches, 3-min & 5-min demo scripts, screen directions, and top judge Q&A |

---

## 🔒 Security & Privacy by Design

- **Zero-PII Storage**: Sessions use anonymous UUIDs without requiring personal names, phone numbers, or defense service IDs.
- **In-Memory Audio Processing**: Raw audio recordings are decoded in-memory, acoustic features extracted, and raw audio immediately discarded (zero audio files stored on disk or DB).
- **Server-Side Credentials**: `GEMINI_API_KEY` and PostgreSQL connection strings exist exclusively in backend `.env` variables and are never transmitted to client browsers.
- **SQL Injection Defense**: Parameterized SQL queries via `psycopg` connection pooling.
- **Emergency Fallbacks**: Pre-configured deterministic coping responses activate seamlessly if external AI provider limits or timeouts occur.
