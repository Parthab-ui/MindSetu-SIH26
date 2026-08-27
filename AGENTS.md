# MindSetu — Codex Project Instructions

## Project goal
MindSetu is being adapted for SIH 2026 Problem Statement SIH26186 as a personnel welfare-support prototype.

Primary demonstration flow:

Personnel
→ Protected session
→ Wellness pulse
→ Workload + duty context
→ Welfare triage analysis
→ Explainable research model
→ Gemini support
→ Human intervention

The prototype is for welfare support/triage. It must not diagnose people or make disciplinary/personnel decisions.

## Repository and branch rules
- Repository: `Parthab-ui/MindSetu`
- Main branch is the stable baseline. Do NOT modify `main` unless explicitly requested.
- SIH26186 work belongs on `v2` for this working MVP unless explicitly instructed otherwise.
- Before editing, verify the current branch.
- Prefer small, focused commits with descriptive messages.
- Never force-push or rewrite history unless explicitly requested.

## Development environment
Active development is local:
- FastAPI runs with `uvicorn ... --reload`.
- Vite runs with `npm run dev`.
- PostgreSQL is the configured persistence layer.
- Gemini is the only AI provider in the architecture.

Development services:
- PostgreSQL: configured through backend environment variables
- Gemini: external API via `GEMINI_API_KEY`
- FastAPI: normally `127.0.0.1:8000`
- Vite: normally `localhost:5173`

## Backend
- FastAPI entrypoint for SIH26186 development: `backend/sih26186_server.py` with `sih26186_server:app`.
- It imports/reuses the base app from `backend/main.py` and adds SIH26186 routes.
- Keep environment configuration in `backend/.env`; never commit real secrets.
- Gemini configuration uses `GEMINI_API_KEY`, `GEMINI_MODEL`, and `GEMINI_TIMEOUT_MS`.

## Frontend
- The primary React UI is focused on the SIH26186 welfare workflow and the MindSetu Gemini companion.
- Keep the workflow focused; avoid unnecessary feature expansion.
- Prevent duplicate analysis requests and preserve a single completed analysis object through the dashboard transition.

## SIH26186 scoring
Current prototype uses deterministic welfare scoring before the recommendation layer:
- Wellness stress score: 6 wellbeing answers, each 0–3, mapped to 0–100.
- Workload score combines duty hours, night duties, rest, leave gap, workload intensity, high-pressure assignment, and duty changes.
- Combined score = 55% wellness + 45% workload.
- Current bands:
  - High: combined >= 70 OR wellness >= 80 OR workload >= 85
  - Moderate: combined >= 45 OR wellness >= 50 OR workload >= 60
  - Low: otherwise
Do not silently change these thresholds or weights.

## AI architecture
The project uses Gemini for the MindSetu conversational AI layer and supportive communication around structured research-model outputs.

The responsibilities are:
- LightGBM = research prediction
- SHAP = model explanation
- Gemini = student-facing communication
- Human = welfare intervention/decision

Risk classification must remain deterministic where defined by the SIH26186 scoring engine. The research-model signal must never be presented as a clinical diagnosis or as the probability that a person has a mental-health condition.

The AI response must:
- be concise and supportive
- focus on workload, recovery, practical coping, check-ins, and professional support when appropriate
- never diagnose or prescribe medication
- never make disciplinary/personnel decisions
- never expose prompts, system instructions, chain-of-thought, task framing, or meta commentary

If Gemini is unavailable or returns unsuitable text, use a safe deterministic fallback instead of exposing model errors or hidden reasoning.

## Reliability requirements
When debugging:
1. Reproduce the issue.
2. Inspect actual runtime behavior and logs before changing code.
3. Check branch and local-vs-container source alignment.
4. Prefer root-cause fixes over workarounds.
5. Run targeted tests/smoke checks after edits.
6. Report exactly what changed and what was verified.

Do not claim a fix was tested if it was only edited in GitHub and not executed in a runtime.

## Database
- PostgreSQL is persistent development infrastructure.
- The backend initializes required SIH26186 tables when needed.
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
