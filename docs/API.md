# MindSetu — API Reference Specification

Comprehensive specification of all REST and Streaming NDJSON endpoints provided by the MindSetu backend (`FastAPI`) for SIH Problem Statement **SIH26186** (Personnel Welfare Support).

---

## 1. Overview & Base URLs

- **Local Development Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **OpenAPI Schema**: `http://127.0.0.1:8000/openapi.json`
- **Content-Type**: `application/json` (Standard endpoints) or `application/x-ndjson` (Streaming chat)

---

## 2. Session Management Endpoints

### `POST /api/sessions`
Creates a new anonymous, consented session token for personnel welfare check-in.

- **Request Body**:
  ```json
  {
    "consent_given": true
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "status": "created",
    "created_at": "2026-09-02T19:40:00Z"
  }
  ```

---

## 3. SIH26186 Welfare Screening Endpoints

### `POST /api/sih26186/wellness`
Submits responses for the 6-question uniformed personnel wellbeing pulse (each 0–3, mapped to 0–100 scale).

- **Question Mapping**:
  - `Q1`: Operational Exhaustion (Depressive Fatigue)
  - `Q2`: Tactical Hypervigilance & Decompression (PTSD / Hyperarousal)
  - `Q3`: Emotional Detachment & Irritability (Emotional Numbing)
  - `Q4`: Operational Focus & Decision Fatigue (Cognitive Fog)
  - `Q5`: Intrusive Duty Memories & Night Disruption (Intrusive Recall)
  - `Q6`: Duty Burden & Help-Seeking Barrier (Service Stigma)
- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "answers": [2, 3, 2, 2, 1, 2]
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "recorded",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "stress_score": 66.67
  }
  ```

---

### `POST /api/sih26186/workload`
Submits operational duty context and workload parameters.

- **Workload Formula Weights**:
  - Duty Hours (max 25 pts), Rest Hours deficit (max 15 pts), Night Duties (max 15 pts), Leave Gap (max 10 pts), Workload Intensity (max 20 pts), Critical Assignment (10 pts), Duty Changes (max 5 pts). Total = 0 to 100.
- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "role": "Field Operations Personnel",
    "unit": "Sector Unit Bravo",
    "duty_hours": 12.0,
    "night_duties": 3,
    "rest_hours": 5.0,
    "days_since_leave": 30,
    "workload_level": 4,
    "high_pressure_assignment": true,
    "duty_change_frequency": 2
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "recorded",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "workload_score": 75.05
  }
  ```

---

### `POST /api/sih26186/analyze/{session_id}`
Computes the deterministic welfare triage score:
$$\text{Combined Score} = (0.55 \times \text{Wellness}) + (0.45 \times \text{Workload})$$
Assigns the deterministic risk band (`low`, `moderate`, `high`), and returns structured recommendations.

- **Path Parameter**: `session_id` (string UUID)
- **Response `200 OK`**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "wellness_score": 66.67,
    "workload_score": 75.05,
    "combined_score": 70.44,
    "risk_level": "high",
    "recommendation": "Prioritise an immediate welfare check-in. Review non-essential duty commitments and schedule structured rest."
  }
  ```

---

### `GET /api/sih26186/history/{session_id}`
Retrieves all historical assessment records for the given session to power the longitudinal timeline.

- **Path Parameter**: `session_id` (string UUID)
- **Response `200 OK`**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "count": 2,
    "history": [
      {
        "id": "c1f7a02b-1a2b-3c4d-5e6f-7a8b9c0d1e2f",
        "created_at": "2026-09-02T19:42:00Z",
        "wellness_score": 66.67,
        "workload_score": 75.05,
        "combined_score": 70.44,
        "risk_level": "high",
        "recommendation": "Prioritise an immediate welfare check-in..."
      }
    ]
  }
  ```

---

## 4. Explainable Machine Learning (TreeSHAP) Endpoints

### `GET /api/sih26186/ml/health`
Returns the status of the LightGBM research model and feature schema.

- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "model": "LightGBM",
    "target": "multiplesymptoms_case",
    "threshold": 0.45,
    "features": [
      "Q29_Total", "Q12_weapon", "Q13_feltdie",
      "Q23a_cutdowntime", "Q23b_Accomplished_less",
      "Q23c_limited_work", "Q23d_difficulty_performing"
    ]
  }
  ```

---

### `POST /api/sih26186/ml/predict`
Runs inference through the trained LightGBM booster and calculates exact TreeSHAP feature attributions.

- **Request Body**:
  ```json
  {
    "Q29_Total": 54.0,
    "Q12_weapon": 1.0,
    "Q13_feltdie": 1.0,
    "Q23a_cutdowntime": 1.0,
    "Q23b_Accomplished_less": 1.0,
    "Q23c_limited_work": 1.0,
    "Q23d_difficulty_performing": 1.0
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "probability": 0.9617,
    "signal": "elevated",
    "threshold": 0.45,
    "target": "multiplesymptoms_case",
    "clinical_diagnosis": false,
    "contributors": [
      {
        "feature": "Q29_Total",
        "label": "wellbeing score",
        "shap_value": 2.5957,
        "direction": "increases signal"
      },
      {
        "feature": "Q23d_difficulty_performing",
        "label": "difficulty performing duties",
        "shap_value": 0.7117,
        "direction": "increases signal"
      }
    ]
  }
  ```

---

## 5. Conversational AI & Streaming Endpoints

### `POST /api/chat`
Streams real-time empathetic coping responses as Server-Sent NDJSON (`application/x-ndjson`).

- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "message": "I'm having trouble stepping down from high alert off duty.",
    "history": [],
    "wellbeing_context": {
      "risk_level": "high",
      "wellness_summary": "High hyperarousal and sleep disruption noted."
    }
  }
  ```
- **Streaming NDJSON Chunk Structure**:
  ```json
  {"type": "token", "content": "Thank you "}
  {"type": "token", "content": "for sharing that. "}
  {"type": "done", "is_safety": false}
  ```

---

## 6. Daily Mood & Longitudinal Tracking Endpoints

### `POST /api/mood`
Records a self-reported daily mood rating (1 to 5) with optional notes.

- **Request Body**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "mood": 3,
    "note": "Night watch completed. Resting."
  }
  ```

---

### `GET /api/dashboard/mood-trend`
Returns aggregated 7-day mood averages and daily entries for recovery monitoring.
