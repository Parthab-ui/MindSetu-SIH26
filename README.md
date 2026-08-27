# MindSetu — SIH26186 MVP

MindSetu is an AI-assisted **personnel welfare support prototype** for Smart India Hackathon 2026 problem statement **SIH26186**.

## Core workflow

Personnel context → wellbeing pulse → duty & recovery context → deterministic welfare triage → LightGBM research signal → SHAP explanation → Gemini communication → human intervention.

The prototype does **not** provide clinical diagnoses or automated disciplinary decisions.

## AI responsibilities

- **LightGBM** — research prediction
- **SHAP** — model explanation
- **Gemini** — supportive communication
- **Human** — welfare intervention and decision-making

## Repository layout

- `frontend/` — React + Vite MindSetu application
- `backend/` — FastAPI API and PostgreSQL integration
- `backend/ml/` — LightGBM inference, SHAP explanation, model artefact, and supporting research utilities
- `docs/` — SIH architecture and demo documentation

## Run locally

### Backend

Create `backend/.env` from `backend/.env.example`, then configure:

```text
DB_HOST=localhost
DB_PORT=5432
DB_NAME=mindsetu_db
DB_USER=postgres
DB_PASSWORD=your_database_password
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=20000
```

Run:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn sih26186_server:app --host 127.0.0.1 --port 8000 --reload
```

### Frontend

In a second terminal:

```powershell
cd frontend
npm ci
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

## Health checks

- Backend: `/api/health`
- Gemini configuration: `/api/gemini/health`
- Research ML: `/api/sih26186/ml/health`

## Safety and privacy

Use fictional data for demonstrations. Never commit API keys, passwords, real personnel data, or database dumps. Welfare outputs are support signals and require appropriate human review.

## Production note

This repository is an SIH MVP, not a certified clinical or military production system. Real deployment requires formal security, privacy, governance, validation, and role-based access controls appropriate to the operating environment.

## Research utilities

The `backend/ml/` directory includes supporting training, evaluation, threshold, ablation, and dataset-inspection scripts used to reproduce or study the research model. They are not required for the normal MVP runtime path.
