# Architecture

MindSetu is an SIH prototype with a React/Vite frontend and FastAPI backend.

## Runtime flow

```text
Frontend → FastAPI → PostgreSQL
                 ├→ deterministic SIH26186 welfare triage
                 ├→ research LightGBM + SHAP route
                 └→ Gemini supportive communication
```

## Responsibility boundaries

- Deterministic logic computes structured support signals.
- LightGBM and SHAP are research/demo components.
- Gemini generates supportive language and is not the decision authority.
- Humans retain responsibility for intervention and final decisions.

## Key API areas

- Core sessions, mood and chat: `backend/main.py`
- SIH26186 workflow: `backend/sih26186_server.py`
- ML routes: `backend/sih26186_ml_routes.py`
- AI regression checks: `backend/tests/`

## Resilience

External AI failures are handled by validation and deterministic fallbacks. Configuration health is distinct from proof of live provider availability.
