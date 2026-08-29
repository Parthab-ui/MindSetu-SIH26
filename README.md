# MindSetu — SIH26186

MindSetu is an AI-assisted **personnel welfare support prototype** built for Smart India Hackathon 2026 problem statement **SIH26186**.

It helps demonstrate a structured wellbeing-support journey while keeping important decisions with people. The prototype combines a guided user workflow, deterministic welfare triage, an optional research-model demonstration, explainability, and supportive AI communication.

> **Important:** MindSetu is an SIH MVP and research prototype. It is not a certified clinical, medical, or military production system. It does not diagnose people or make automated disciplinary, employment, or welfare decisions.

---

## 1. What MindSetu does

The core journey is:

```text
Personnel context
      ↓
Wellbeing pulse
      ↓
Duty & recovery context
      ↓
Deterministic welfare triage
      ↓
Optional research-model demonstration
      ↓
SHAP explanation
      ↓
Supportive Gemini communication
      ↓
Human review / intervention
```

### AI responsibility boundaries

| Component | Responsibility |
|---|---|
| Deterministic logic | Structured welfare-support triage |
| LightGBM | Research-model demonstration only |
| SHAP | Explains model contribution signals |
| Gemini | Supportive, contextual communication |
| Human | Welfare intervention and final decisions |

---

## 2. Repository structure

```text
MindSetu-SIH26/
├── frontend/                 # React + Vite application
├── backend/
│   ├── main.py               # Core FastAPI app and API routes
│   ├── sih26186_server.py    # SIH26186 workflow routes
│   ├── sih26186_ml_routes.py # ML-related workflow routes
│   └── ml/                   # LightGBM, SHAP and research utilities
├── docs/                     # Architecture and demo documentation
└── README.md
```

---

## 3. Main capabilities

### Guided wellbeing workflow

The application guides the user through a structured flow instead of presenting raw model outputs without context.

### User-focused analysis

The analysis experience is designed to answer practical questions such as:

- What does my current wellbeing picture suggest?
- What factors appear to be contributing?
- What should I focus on next?
- When might additional human support be useful?

### Research ML demonstration

The repository includes a LightGBM research model and supporting utilities for demonstration and study.

The model is **not** presented as a clinical diagnosis engine or an autonomous decision-maker.

### SHAP explainability

SHAP is used to help explain which input signals contributed to the research-model output.

### MindSetu AI companion

The chatbot uses Google Gemini for supportive communication.

The backend:

- accepts recent conversation history;
- gives Gemini up to a shared response window before fallback;
- retries transient failures within that same total window;
- extracts usable Gemini text defensively;
- uses a deterministic supportive fallback only when Gemini cannot produce a usable response;
- handles identified crisis language through a safety-priority response path.

---

## 4. Architecture

```text
                    ┌─────────────────────┐
                    │   React + Vite UI   │
                    └──────────┬──────────┘
                               │ HTTP
                    ┌──────────▼──────────┐
                    │     FastAPI API     │
                    └──────┬──────┬───────┘
                           │      │
              ┌────────────▼─┐  ┌─▼──────────────┐
              │ PostgreSQL   │  │ SIH26186 Flow  │
              │ sessions/    │  │ triage + ML    │
              │ mood data    │  └──────┬─────────┘
              └──────────────┘         │
                                  ┌─────▼─────┐
                                  │ LightGBM  │
                                  │ + SHAP    │
                                  └───────────┘

                    FastAPI ─────────────► Gemini
                           supportive communication
```

---

## 5. Local setup

### Prerequisites

- Python with a compatible virtual-environment setup
- Node.js and npm
- PostgreSQL
- A Google Gemini API key for live chatbot responses

### Backend environment

Create:

```text
backend/.env
```

using `backend/.env.example` as the starting point.

Configure values similar to:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindsetu_db
DB_USER=postgres
DB_PASSWORD=your_database_password

GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TOTAL_TIMEOUT_SECONDS=15
```

**Never commit real API keys, passwords, personnel data, or database dumps.**

### Start the backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

### Start the frontend

Open a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal, normally:

```text
http://localhost:5173
```

---

## 6. Health checks

Once the backend is running:

| Endpoint | Purpose |
|---|---|
| `/api/health` | Backend availability |
| `/api/database` | PostgreSQL connectivity |
| `/api/chat/health` | Chat runtime configuration |
| `/api/gemini/health` | Gemini configuration status |
| `/api/sih26186/ml/health` | Research ML availability |

### PowerShell examples

```powershell
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/database
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/gemini/health
Invoke-WebRequest -UseBasicParsing http://127.0.0.1:8000/api/sih26186/ml/health
```

---

## 7. Chatbot behavior and fallback policy

MindSetu prioritizes Gemini when it is available.

```text
User message
      ↓
Gemini request begins
      ↓
Up to 15 seconds total response window
      ↓
Valid Gemini response?
   ┌──────────┴──────────┐
  YES                   NO
   │                     │
Return Gemini     Retry within remaining
response          shared time window
                         │
                    Still no usable text
                         ↓
             Deterministic supportive fallback
```

The fallback exists so the interface can still provide a supportive response when the external AI provider is unavailable.

A health endpoint confirming that the API key and SDK are configured does **not by itself guarantee that every live Gemini request will succeed**. Network, provider, quota, and response-generation failures can still occur.

---

## 8. Safety boundaries

MindSetu:

- does not diagnose medical or psychological conditions;
- does not prescribe medication;
- does not replace emergency or professional services;
- does not make automated disciplinary or employment decisions;
- treats model outputs as support signals;
- keeps final welfare intervention and decision-making with appropriate humans.

For demonstrations, use **fictional or approved test data only**.

---

## 9. Pre-demo checklist

Before presenting:

### Infrastructure

- [ ] PostgreSQL is running.
- [ ] `backend/.env` is configured.
- [ ] Backend starts without import errors.
- [ ] Frontend starts successfully.

### Health

- [ ] `/api/health` returns healthy.
- [ ] `/api/database` reports connected.
- [ ] `/api/gemini/health` reports the expected configuration.
- [ ] `/api/sih26186/ml/health` reports the expected research-model state.

### End-to-end flow

- [ ] Start a new session.
- [ ] Complete the wellbeing pulse.
- [ ] Complete the duty and recovery context.
- [ ] Reach the analysis page.
- [ ] Review the explanation and recommended next focus.
- [ ] Test the chatbot with a normal multi-turn conversation.
- [ ] Test a short contextual follow-up such as `Whom?`.
- [ ] Confirm the chatbot does not repeatedly return the same fallback response when Gemini is working.
- [ ] Verify the deterministic fallback path separately.

### Build

```powershell
cd frontend
npm run build
```

---

## 10. Suggested demo narrative

A concise demonstration sequence:

1. Introduce the welfare-support problem.
2. Explain that MindSetu collects structured context through a guided journey.
3. Complete the wellbeing and duty/recovery inputs.
4. Show the user-focused analysis rather than starting with raw technical scores.
5. Explain the optional research-model and SHAP layer.
6. Demonstrate the Gemini companion with a contextual follow-up.
7. Emphasize that the system supports—not replaces—qualified human welfare intervention.

---

## 11. Research utilities

The `backend/ml/` directory contains supporting scripts for training, evaluation, threshold analysis, ablation, and dataset inspection.

These utilities support research reproducibility and experimentation and are **not required for the normal MVP runtime path**.

---

## 12. Production considerations

A real deployment would require additional work, including:

- formal security review;
- privacy and data-governance controls;
- authentication and role-based access control;
- audit logging appropriate to the operating environment;
- secure secret management;
- model validation and monitoring;
- human oversight procedures;
- domain-specific legal and operational approval.

MindSetu should therefore be evaluated as an **SIH prototype demonstrating an architecture and workflow**, not as a ready-to-deploy clinical or operational welfare system.
