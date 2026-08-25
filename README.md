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
- Ollama + Qwen — local AI recommendations
- `frontend/public/sih26186.html` — dedicated SIH26186 demonstration page

## Development workflow

For **active development**, run the application code directly on the host for fast reloads. Use Docker only for PostgreSQL and Ollama.

### 1. Start development infrastructure

From the repository root:

```bash
docker compose -f docker-compose.dev.yml up -d
```

The development services expose:

- PostgreSQL → `127.0.0.1:5432`
- Ollama → `127.0.0.1:11434`

The development PostgreSQL container bootstraps the baseline MindSetu schema from `backend/dev_init.sql` on first creation.

Pull the configured model once:

```bash
docker exec -it mindsetu-dev-ollama ollama pull qwen3:4b
```

### 2. Run the FastAPI backend locally

Create `backend/.env` from `backend/dev.env.example`, set a local PostgreSQL password, then:

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

### 3. Run the frontend locally

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

### 4. Stop development infrastructure

```bash
docker compose -f docker-compose.dev.yml down
```

The development volumes are separate from the production-style Compose volumes, so local development does not change the deployment stack.

## Full Docker deployment

For a reproducible all-in-one environment, keep using the normal Compose file:

```bash
docker compose up -d --build
```

That runs the frontend, backend, PostgreSQL and Ollama in containers.

## Safety and privacy

Do not commit `.env` files, passwords, API keys or real personnel data. Welfare scores are support signals and should not be presented as clinical diagnoses, disciplinary scores or automated personnel decisions. Real deployment requires appropriate security, privacy, governance and domain validation.
