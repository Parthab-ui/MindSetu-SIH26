# MindSetu — Personnel Welfare Support Prototype (SIH26186)

[![Build & Tests](https://img.shields.io/badge/tests-15%20passed-success)](backend/tests)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19.0-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Gemini](https://img.shields.io/badge/Google%20Gemini-2.5%20Flash-4285F4.svg?logo=google&logoColor=white)](https://ai.google.dev)
[![Explainability](https://img.shields.io/badge/XAI-TreeSHAP-ff69b4)](docs/ML_MODEL.md)

**MindSetu** is an AI-assisted **personnel welfare support prototype** engineered for Smart India Hackathon 2026 Problem Statement **SIH26186**.

It demonstrates an end-to-end, confidential wellbeing check-in journey combining **operational workload context**, **deterministic welfare triage**, an **explainable LightGBM + TreeSHAP research model**, and a **supportive Google Gemini 2.5 Flash companion**.

> [!IMPORTANT]
> **Welfare Support Mandate**: MindSetu is an SIH engineering prototype for supportive welfare triage. It does **not** provide clinical psychiatric diagnoses, prescribe medications, or make autonomous personnel/disciplinary decisions.

---

## 🌐 Public Cloud Demo vs. Local Setup

### 🚀 Public Demo (One URL — Zero Local Installation)
Teammates and evaluators can access the full working MVP directly in **Microsoft Edge** or any modern browser without installing Python, Node.js, PostgreSQL, or project dependencies:
- **Public Application URL**: `https://<your-deployed-app>.vercel.app`
- **Hosted Stack**: Single Vercel domain hosting React 19 UI with same-origin serverless `/api/*` routing, managed PostgreSQL, LightGBM + SHAP, and Google Gemini streaming.

### 💻 Local Development Setup

#### 1. Backend Service (FastAPI)
```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

#### 2. Frontend Application (React + Vite)
```powershell
cd frontend
npm ci
npm run dev
```

Open your browser at **`http://localhost:5173`** (Swagger API docs at **`http://127.0.0.1:8000/docs`**).

---

## 🧭 Complete User Journey

```
Personnel (Confidential & Anonymous)
       ↓
[ 1. Protected Session & Consent ] (StartScreen.jsx)
       ↓
[ 2. 6-Item Wellness Pulse ] (WellnessScreen.jsx)
       ↓
[ 3. Operational Workload & Duty Context ] (WorkloadScreen.jsx)
       ↓
[ 4. Deterministic Welfare Triage Analysis ] (AnalysisScreen.jsx)
       ↓
[ 5. Explainable Research Model & TreeSHAP ] (ResearchLabModal.jsx)
       ↓
[ 6. MindSetu AI Companion (Gemini NDJSON) ] (ChatScreen.jsx)
       ↓
[ 7. Crisis Intervention & Hotlines ] (Tele-MANAS 14416 / KIRAN 1800-599-0019)
```

---

## 🏛️ AI Architecture & Dual-Layer Governance

```
┌────────────────────────────────────────────────────────────────────────────┐
│                       AI RESPONSIBILITY BOUNDARIES                         │
├──────────────────────────┬─────────────────────────────────────────────────┤
│ Layer                    │ System Responsibility                           │
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Deterministic Engine  │ Authoritative Welfare Triage (55% Wellness + 45% Workload) │
│ 2. LightGBM Classifier   │ Research-Level Predictive Pattern Discovery     │
│ 3. TreeSHAP Engine       │ Local & Global Feature Importance Attribution   │
│ 4. Google Gemini 2.5     │ Streaming Empathetic & Actionable Coping Chat   │
│ 5. Human Welfare Officer │ Real-World Decision Making & Counseling         │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 📚 Comprehensive Documentation Index

| Document | Description |
| :--- | :--- |
| 📖 **[System Architecture](docs/ARCHITECTURE.md)** | End-to-end component topology, data flows, database schemas, and failover design |
| 🔌 **[API Reference](docs/API.md)** | Complete REST & streaming NDJSON specifications with request/response payloads |
| 🧠 **[Research ML & SHAP](docs/ML_MODEL.md)** | Feature schemas, LightGBM training hyperparameters, TreeSHAP equations, and CV metrics |
| 🛡️ **[Safety & Ethics](docs/SAFETY.md)** | Non-clinical boundaries, privacy-by-design, crisis protocols, and AI self-audit |
| 🎤 **[SIH Jury Demo Guide](docs/SIH_DEMO_GUIDE.md)** | 3-minute & 7-minute pitch scripts, stage walkthroughs, and jury defense Q&A |
| 💻 **[Frontend Design Guide](frontend/README.md)** | Component architecture, responsive design tokens, and accessibility features |

---

## 🧪 Quality & Verification Checks

```powershell
# Run backend test suite (15 tests covering AI self-audit & triage contracts)
pytest backend/tests

# Run frontend production build
cd frontend
npm run build
```

---

## 🔒 Security & Privacy by Design

- **Zero-PII Storage**: Sessions use anonymous UUIDs without requiring personal names, phone numbers, or defense service IDs.
- **Server-Side Credentials**: `GEMINI_API_KEY` and PostgreSQL connection strings exist exclusively in backend `.env` variables and are never transmitted to client browsers.
- **Emergency Fallbacks**: Pre-configured deterministic coping responses activate seamlessly if external AI provider limits or timeouts occur.
