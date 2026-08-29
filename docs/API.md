# API reference

## Core

- `GET /api/health` — backend status
- `GET /api/database` — database connectivity
- `POST /api/sessions` — create consented anonymous session
- `POST /api/chat` — supportive streaming chat
- `POST /api/mood` — store mood entry
- `GET /api/mood/{session_id}` — mood history
- `GET /api/dashboard/mood-trend` — aggregate trend

## AI

- `GET /api/chat/health`
- `GET /api/gemini/health`
- `GET /api/ai/self-audit`

## SIH26186

- `POST /api/sih26186/wellness`
- `POST /api/sih26186/workload`
- `POST /api/sih26186/analyze/{session_id}`
- `GET /api/sih26186/dashboard/{session_id}`
- `GET /api/sih26186/ml/health`
- `POST /api/sih26186/ml/predict`
- `POST /api/sih26186/ml/analyze`

See Pydantic request models in the backend source for exact request schemas.
