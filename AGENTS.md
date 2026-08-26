# MindSetu — Codex Project Instructions

## Project goal
MindSetu is being adapted for SIH 2026 Problem Statement SIH26186 as a personnel welfare-support prototype.

Primary demonstration flow:

Personnel
→ Wellness Assessment
→ Workload + Duty Information
→ AI Stress / Risk Analysis
→ Low / Moderate / High Welfare Risk
→ Welfare Recommendation
→ Welfare Dashboard

The prototype is for welfare support/triage. It must not diagnose people or make disciplinary/personnel decisions.

## Repository and branch rules
- Repository: `Parthab-ui/MindSetu`
- Main branch is the stable baseline. Do NOT modify `main` unless explicitly requested.
- SIH26186 work belongs on `sih-26186-adaptation` unless explicitly instructed otherwise.
- Before editing, verify the current branch.
- Prefer small, focused commits with descriptive messages.
- Never force-push or rewrite history unless explicitly requested.

## Development environment
Active development is hybrid/local:
- FastAPI runs on the Windows host with `uvicorn ... --reload`.
- Vite runs on the Windows host with `npm run dev`.
- PostgreSQL runs in Docker using `docker-compose.dev.yml` when available.
- Gemini is the only AI provider in the architecture; do not reintroduce a local LLM provider unless explicitly requested.

Development services:
- PostgreSQL: `127.0.0.1:5432`
- Gemini: external API via `GEMINI_API_KEY`
- FastAPI: `127.0.0.1:8000`
- Vite: normally `localhost:5173`
- SIH26186 demo page: `http://localhost:5173/sih26186.html`

## Backend
- FastAPI entrypoint for SIH26186 development: `backend/sih26186_server.py` with `sih26186_server:app`.
- It imports/reuses the base app from `backend/main.py` and adds SIH26186 routes.
- Keep the SIH26186 implementation isolated from unrelated MindSetu functionality.
- Keep environment configuration in `backend/.env`; never commit real secrets.
- Gemini configuration uses `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_TIMEOUT_MS`.

## Frontend
- Dedicated SIH26186 page: `frontend/public/sih26186.html`.
- Preserve the existing 5-step flow unless explicitly asked to redesign it.
- Avoid unnecessary feature expansion; SIH26186 should stay focused.
- Prevent duplicate analysis requests and preserve a single completed analysis object through the dashboard transition.
- The dashboard must display exactly the analysis that was just generated.

## SIH26186 scoring
Current prototype uses deterministic scoring before the LLM recommendation:
- Wellness stress score: 6 answers, each 0–3, mapped to 0–100.
- Workload score combines duty hours, night duties, rest, leave gap, workload intensity, high-pressure assignment, and duty changes.
- Combined score = 55% wellness + 45% workload.
- Current bands:
  - High: combined >= 70 OR wellness >= 80 OR workload >= 85
  - Moderate: combined >= 45 OR wellness >= 50 OR workload >= 60
  - Low: otherwise
Do not silently change these thresholds or weights; discuss/confirm before changing them.

## AI architecture
The project uses Gemini for the MindSetu conversational AI layer and for supportive communication around structured research-model outputs.

The responsibilities are:
- LightGBM = research prediction
- SHAP = model explanation
- Gemini = student-facing communication
- Human = welfare intervention/decision

Risk classification must remain deterministic where defined by the SIH26186 scoring engine. The research-model signal must never be presented as a clinical diagnosis or as the probability that a person has a mental-health condition.

The AI response must:
- be concise and action-oriented
- focus on rest/recovery, workload review, welfare check-ins, and professional support when appropriate
- never diagnose or prescribe medication
- never make disciplinary/personnel decisions
- never expose prompts, system instructions, chain-of-thought, task framing, or meta commentary
- never dump or simply restate private screening metrics unless the student explicitly asks about them

If Gemini is unavailable or returns unsuitable text, use the safe deterministic fallback for the relevant workflow instead of exposing model errors or hidden reasoning.

## Reliability requirements
When debugging:
1. Reproduce the issue.
2. Inspect actual runtime behavior and logs before changing code.
3. Check branch and local-vs-container source alignment.
4. Prefer root-cause fixes over workarounds.
5. Run targeted tests/smoke checks after edits.
6. Report exactly what changed and what was verified.

Do not claim a fix was tested if it was only edited in GitHub and not executed in a runtime.

## Docker
- Do not ask the user to rebuild Docker for ordinary local Python/React edits during hybrid development.
- Use Docker primarily for PostgreSQL in development.
- Full Docker deployment remains available through the normal Compose stack.
- If Docker is involved in a bug, verify the actual image/container command and mounted/copied files before making repeated rebuild attempts.

## Database
- PostgreSQL is persistent development infrastructure.
- SIH26186 tables are created by the backend startup logic.
- Do not delete or reset development data unless explicitly requested.

## Security and privacy
- Never commit `.env`, passwords, API keys, tokens, or real personnel data.
- Use fictional demo information during presentations.
- Treat welfare scores as support signals, not clinical diagnoses or automated personnel decisions.
- Keep Gemini API keys on the backend; never place secrets in the React frontend.

## Coding style
- Keep changes minimal and readable.
- Prefer existing project patterns over introducing unnecessary frameworks.
- Validate external/LLM responses before persisting/displaying them.
- Keep user-facing messages concise and clear.
- Add comments only where they clarify non-obvious behavior.

## Before any SIH26186 feature change
Check:
- current branch
- relevant backend/frontend files
- existing API contract
- whether the change affects `main`
- whether a local test can verify the change
