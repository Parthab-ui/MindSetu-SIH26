# MindSetu

AI-powered digital mental-health and psychological-support platform, adapted here for **SIH26186 personnel welfare assessment**.

## SIH 2026

- **Problem Statement:** SIH26186
- **Theme:** HealthTech / Welfare Technology
- **Category:** Software
- **Team:** MANOMITRAS

## SIH26186 workflow

The adaptation focuses on:

1. Personnel information
2. Wellness assessment
3. Workload + duty information
4. AI stress / risk analysis
5. Low / Moderate / High welfare risk
6. Welfare recommendation
7. Welfare dashboard

The SIH26186 prototype is designed for welfare support and triage, not diagnosis or disciplinary decision-making.

## Architecture

- `frontend/` — React 19 + Vite student/product interface
- `backend/` — FastAPI REST API
- PostgreSQL — session and assessment data
- Google Gemini API — conversational AI and supportive communication
- LightGBM + SHAP — research-only welfare signal and explainability for SIH26186
- `frontend/public/sih26186.html` — dedicated SIH26186 demonstration page

## Development workflow

For **active development**, run the application code directly on the host for fast reloads. Use Docker only for PostgreSQL during local development.

### 1. Start development infrastructure

From the repository root:

```bash
docker compose -f docker-compose.dev.yml up -d
```

The development services expose:

- PostgreSQL → `127.0.0.1:5432`

The development PostgreSQL container bootstraps the baseline MindSetu schema from `backend/dev_init.sql` on first creation.

### 2. Configure Gemini

Create `backend/.env` from the example file and set:

```text
GEMINI_API_KEY=your_real_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
GEMINI_TIMEOUT_MS=20000
```

Never commit a real API key.

### 3. Run the FastAPI backend locally

```bash
cd backend
python -m venv .venv
```

Windows:

```powershell
.venv\\Scripts\\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the SIH26186 API with reload:

```bash
uvicorn sih26186_server:app --reload --host 127.0.0.1 --port 8000
```

### 4. Run the frontend locally

In a second terminal:

```bash
cd frontend
npm ci
npm run dev
```

Open the Vite URL, normally `http://localhost:5173`.

The dedicated SIH26186 page is served as:

```text
http://localhost:5173/sih26186.html
```

### 5. Stop development infrastructure

```bash
docker compose -f docker-compose.dev.yml down
```

## Full Docker deployment

For a reproducible all-in-one environment:

```bash
docker compose up -d --build
```

That runs the frontend, backend and PostgreSQL in containers. Gemini is accessed as an external API and therefore does not require a local model container.

## AI architecture

MindSetu uses Gemini for student-facing conversational support. The SIH26186 research layer remains separate:

```text
LightGBM = prediction
SHAP     = explanation
Gemini   = communication
Human    = intervention
```

The ML score is a research welfare signal and must not be represented as a diagnosis or as a probability of having a mental-health condition.

## Safety and privacy

Do not commit `.env` files, passwords, API keys or real personnel data. Welfare scores are support signals and should not be presented as clinical diagnoses, disciplinary scores or automated personnel decisions. Real deployment requires appropriate security, privacy, governance and domain validation.
