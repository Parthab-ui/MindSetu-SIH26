# MindSetu

AI-powered digital mental-health and psychological-support platform for students in higher education.

## SIH 2026

- **Problem Statement:** SIH25092
- **Theme:** HealthTech
- **Category:** Software
- **Team:** MANOMITRAS

## What the prototype demonstrates

MindSetu is designed around an end-to-end student wellbeing journey:

1. Anonymous session + consent
2. PHQ-9 depression screening
3. GAD-7 anxiety screening
4. Combined wellbeing/risk interpretation
5. Support recommendations
6. AI wellbeing companion using local Ollama/Qwen
7. Mood logging and history
8. Counsellor discovery and appointment flow
9. Student wellbeing dashboard

The screening layer is intended for **support and triage, not diagnosis**. Crisis-language handling is performed before an AI request and the AI prompt explicitly prevents diagnosis or medication advice.

## Architecture

- `frontend/` — React 19 + Vite student-facing interface
- `backend/` — FastAPI REST API
- PostgreSQL — session, assessment, mood, counsellor and appointment data
- Ollama + Qwen — local AI companion

## Local demo setup

### Backend

```bash
cd backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` from `.env.example`, configure PostgreSQL, and make sure Ollama is running with the configured model.

Start the API:

```bash
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The current prototype expects the FastAPI backend at `http://127.0.0.1:8000`.

## Presentation

See [`docs/SIH_DEMO_GUIDE.md`](docs/SIH_DEMO_GUIDE.md) for the recommended mentor demo flow, talking points, and pre-demo checks.

## Development status

**SIH mentor-demo ready prototype.** The project is still under active development; production deployment, authentication, hardened privacy controls, comprehensive automated testing and clinical validation are future work.

## Safety and privacy

Do not commit `.env` files, passwords, API keys or real student data. PHQ-9 and GAD-7 are screening instruments and must not be presented as clinical diagnoses. For a real deployment, the platform should undergo appropriate security, privacy, clinical and regulatory review.
