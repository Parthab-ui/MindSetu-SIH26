# MindSetu — API Reference

Comprehensive specification of all REST and Streaming NDJSON endpoints provided by the MindSetu backend (`FastAPI`) for SIH Problem Statement **SIH26186** (Personnel Welfare Support).

---

## 1. Overview & Base URLs

- **Local Development Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **OpenAPI Schema**: `http://127.0.0.1:8000/openapi.json`
- **Content-Type**: `application/json` (Standard endpoints) or `application/x-ndjson` (Streaming chat)

---

## 2. Core & Session Endpoints

### `POST /api/sessions`
Creates a new anonymous, consented session for personnel welfare check-in.

- **Request Body**:
  ```json
  {
    "consent": true,
    "role": "Duty Officer",
    "unit": "Unit-Alpha"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "status": "active",
    "created_at": "2026-09-02T04:40:00Z"
  }
  ```

---

## 3. SIH26186 Welfare Triage Endpoints

### `POST /api/sih26186/wellness`
Submits responses for the 6-question personnel wellness pulse (each 0–3, mapped to 0–100 scale).

- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "answers": [2, 1, 3, 2, 1, 2]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "recorded",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "wellness_score": 61.1,
    "recorded_at": "2026-09-02T04:40:15Z"
  }
  ```

### `POST /api/sih26186/workload`
Submits duty context, workload intensity, and operational recovery metrics.

- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "weekly_hours": 68,
    "night_duties": 4,
    "rest_hours": 5.5,
    "leave_gap_weeks": 16,
    "workload_intensity": 3,
    "high_pressure_assignment": true,
    "duty_changes": 2
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "recorded",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "workload_score": 78.4,
    "recorded_at": "2026-09-02T04:40:30Z"
  }
  ```

### `POST /api/sih26186/analyze/{session_id}`
Computes the deterministic welfare triage score $(55\% \text{ Wellness} + 45\% \text{ Workload})$, assigns the risk band (`Low`, `Moderate`, `High`), and generates structured recovery focus recommendations.

- **Path Parameter**: `session_id` (string UUID)
- **Response `200 OK`**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "wellness_score": 61.1,
    "workload_score": 78.4,
    "combined_score": 68.9,
    "risk_band": "Moderate",
    "primary_driver": "Workload & Shift Recovery",
    "recommended_focus": [
      "Prioritize 7-8 hours unbroken rest between shifts",
      "Request fatigue rotation review with duty supervisor",
      "Utilize MindSetu AI companion for coping & sleep pacing"
    ],
    "is_crisis": false
  }
  ```

### `GET /api/sih26186/dashboard/{session_id}`
Retrieves the consolidated triage breakdown and history for an active session.

---

## 4. Machine Learning & Explainability (LightGBM + SHAP)

### `GET /api/sih26186/ml/health`
Checks whether the research LightGBM model artifact (`.joblib`) and SHAP explainer are loaded and ready.

- **Response `200 OK`**:
  ```json
  {
    "status": "healthy",
    "model_type": "LightGBM Classifier",
    "features_count": 7,
    "threshold": 0.50,
    "shap_explainer_ready": true
  }
  ```

### `POST /api/sih26186/ml/predict`
Runs inference on the LightGBM research model given raw operational and wellness indicators.

- **Request Body**:
  ```json
  {
    "weekly_hours": 68,
    "night_duties": 4,
    "rest_hours": 5.5,
    "leave_gap_weeks": 16,
    "workload_intensity": 3,
    "high_pressure_assignment": 1,
    "wellness_pulse_mean": 1.83
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "prediction_signal": "Elevated Welfare Attention",
    "probability_score": 0.762,
    "classification_threshold": 0.50,
    "disclaimer": "Research model output. Not a clinical diagnosis or personnel decision."
  }
  ```

### `POST /api/sih26186/ml/analyze`
Generates full local SHAP feature attributions (waterfall / feature impacts) explaining how each feature shifted the research prediction.

- **Response `200 OK`**:
  ```json
  {
    "base_value": 0.231,
    "prediction_probability": 0.762,
    "shap_values": [
      { "feature": "weekly_hours", "value": 68, "contribution": 0.28 },
      { "feature": "night_duties", "value": 4, "contribution": 0.18 },
      { "feature": "rest_hours", "value": 5.5, "contribution": 0.11 },
      { "feature": "leave_gap_weeks", "value": 16, "contribution": 0.08 },
      { "feature": "workload_intensity", "value": 3, "contribution": 0.05 }
    ]
  }
  ```

---

## 5. Conversational AI Companion (Google Gemini Streaming)

### `POST /api/chat`
Streams real-time supportive coaching tokens via chunked **NDJSON (`application/x-ndjson`)**.

- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "message": "I feel exhausted after continuous night duties and cannot sleep well.",
    "recent_history": [
      { "role": "user", "content": "Hello" },
      { "role": "assistant", "content": "Hello! I am MindSetu. How can I support you today?" }
    ],
    "welfare_context": {
      "risk_band": "Moderate",
      "workload_score": 78.4,
      "primary_driver": "Workload & Shift Recovery"
    }
  }
  ```

- **Streaming NDJSON Response Stream**:
  ```json
  {"type": "start", "model": "gemini-2.5-flash"}
  {"type": "token", "content": "I hear "}
  {"type": "token", "content": "how demanding those night shifts have been. "}
  {"type": "token", "content": "Let's look at three practical steps to ease your rest transition:"}
  {"type": "done", "total_tokens": 84}
  ```

- **Fallback Event (When external LLM fails or times out)**:
  ```json
  {"type": "fallback", "content": "I understand duty fatigue can feel heavy. Make sure to prioritize rest, hydrate, and consider speaking with your unit welfare officer if recovery time remains short."}
  {"type": "done"}
  ```

---

## 6. System Health, Diagnostics & AI Self-Audit

| Endpoint | Method | Purpose |
| :--- | :---: | :--- |
| `/api/health` | `GET` | Core backend uptime and process health |
| `/api/database` | `GET` | PostgreSQL connectivity and table verification |
| `/api/gemini/health` | `GET` | Verifies `GEMINI_API_KEY`, selected model, and timeout settings |
| `/api/chat/health` | `GET` | Validates streaming chat configuration and fallbacks |
| `/api/ai/self-audit` | `GET` | Runs internal regression test checks ensuring Gemini responses never violate safety or medical boundaries |

### Example Diagnostic Check
```powershell
curl.exe -s http://127.0.0.1:8000/api/ai/self-audit
```
```json
{
  "status": "passed",
  "diagnostic_checks": {
    "no_clinical_diagnoses": true,
    "no_prescription_mentions": true,
    "no_disciplinary_claims": true,
    "crisis_escalation_active": true
  }
}
```
