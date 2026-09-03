# MindSetu — API Reference Specification

Comprehensive specification of all REST and Streaming NDJSON endpoints provided by the MindSetu backend (`FastAPI`) for SIH Problem Statement **SIH26186** (Personnel Welfare Support).

---

## 1. Overview & Base URLs

- **Local Development Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger UI**: `http://127.0.0.1:8000/docs`
- **OpenAPI Schema**: `http://127.0.0.1:8000/openapi.json`
- **Content-Type**: `application/json`, `multipart/form-data`, or `application/x-ndjson` (Streaming chat)

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

## 4. Multimodal Voice ML Endpoints

### `GET /api/sih26186/voice/health`
Returns the status, version, and feature count of the Voice ML model.

- **Response `200 OK`**:
  ```json
  {
    "status": "ready",
    "model": "GradientBoostingClassifier",
    "model_version": "1.0.0-voice-gbdt",
    "features_count": 24,
    "features": ["rms_energy", "pitch_f0_mean", "pitch_f0_std", "pause_ratio", "speech_rate_estimate", "..."],
    "clinical_diagnosis": false
  }
  ```

---

### `POST /api/sih26186/voice/demo-sample`
Generates a synthetic 16kHz PCM WAV demo sample for noisy hackathon environments.

- **Query Parameter**: `scenario` (`strained` | `resilient` | `moderate`)
- **Response `200 OK`**:
  ```json
  {
    "scenario": "strained",
    "audio_base64": "data:audio/wav;base64,...",
    "analysis": {
      "depression_signal": 84.5,
      "trauma_signal": 72.0,
      "confidence": 0.85,
      "audio_quality": "good"
    }
  }
  ```

---

### `POST /api/sih26186/voice/analyze`
Extracts 24 acoustic & prosodic biomarkers in-memory from raw WAV audio bytes or base64. **Zero raw audio is stored.**

- **Request Body (JSON option)**:
  ```json
  {
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "audio_base64": "data:audio/wav;base64,..."
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "success",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "depression_signal": 78.5,
    "trauma_signal": 65.0,
    "trauma_status": "experimental_proxy",
    "confidence": 0.82,
    "audio_quality": "good",
    "diagnostics": {
      "duration_seconds": 12.4,
      "snr_db_estimate": 22.5,
      "quality": "good"
    },
    "top_acoustic_contributors": [
      {
        "feature": "pitch_range",
        "label": "Dynamic Pitch Range",
        "direction": "increases signal"
      },
      {
        "feature": "pause_ratio",
        "label": "Hesitation & Pause Proportion",
        "direction": "increases signal"
      }
    ],
    "signal_interpretation": "Voice acoustic patterns exhibit constrained pitch variability and higher hesitation intervals.",
    "clinical_diagnosis": false
  }
  ```

- **HTTP Response Codes**:
  - `200 OK`: Audio successfully decoded, 24 features extracted, and paralinguistic ML prediction generated.
  - `400 Bad Request`: Payload missing audio, invalid base64, or data length < 100 bytes.
  - `413 Payload Too Large`: Audio file exceeds the 10MB maximum upload limit.
  - `422 Unprocessable Entity`: Recording duration < 1.0s, inaudible/silent recording (RMS < 0.005), or corrupted WAV header.
  - `500 Internal Server Error`: Internal audio processing or inference failure.

---


## 5. Explainable Research ML (TreeSHAP) Endpoints

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
      }
    ]
  }
  ```

---

## 6. Longitudinal History & AI Companion Endpoints

- `GET /api/sih26186/history/{session_id}`: Retrieves all historical triage check-ins for the session.
- `POST /api/chat`: Streams real-time empathetic coping responses as Server-Sent NDJSON (`application/x-ndjson`).
- `POST /api/mood`: Logs daily recovery mood rating (1–5).
- `GET /api/dashboard/mood-trend`: Fetches 7-day mood trend averages.

---

## 7. Doctor Directory, Appointments & Tele-Consultation Endpoints

### `GET /api/doctors`
Lists verified Medical Officers and Clinical Psychologists. Supports filtering by specialization.

- **Query Parameters**:
  - `specialization` (optional, string): Filter by clinical domain (e.g. `Trauma & PTSD`, `Operational Stress`, `Sleep & Circadian`).
- **Response `200 OK`**:
  ```json
  [
    {
      "id": "doc-001",
      "name": "Col. Dr. Rajesh Sharma",
      "rank_or_title": "Col. (Retd.) / Senior Psychiatrist",
      "specialization": "Trauma & Operational Stress",
      "experience_years": 18,
      "bio": "Former Armed Forces Medical Services (AFMS) lead specializing in combat trauma recovery.",
      "avatar_url": "/avatars/doc1.png",
      "available_today": true,
      "languages": ["English", "Hindi"],
      "rating": 4.9,
      "total_consultations": 342
    }
  ]
  ```

---

### `GET /api/doctors/{doctor_id}/availability`
Fetches available consultation time slots for a given doctor on a specific date.

- **Path Parameter**: `doctor_id` (string)
- **Query Parameter**: `date` (string, `YYYY-MM-DD`)
- **Response `200 OK`**:
  ```json
  {
    "doctor_id": "doc-001",
    "date": "2026-09-04",
    "slots": [
      { "slot": "10:00 - 10:30", "available": true },
      { "slot": "11:00 - 11:30", "available": false },
      { "slot": "14:00 - 14:30", "available": true }
    ]
  }
  ```

---

### `POST /api/appointments`
Schedules a confidential tele-consultation appointment.

- **Request Body**:
  ```json
  {
    "doctor_id": "doc-001",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "appointment_date": "2026-09-04",
    "time_slot": "10:00 - 10:30",
    "reason_for_consultation": "Tactical hypervigilance and sleep disruption after deployment.",
    "confidentiality_acknowledged": true
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "appt-7c89f",
    "doctor_id": "doc-001",
    "session_id": "9f2e3b1a-4c5d-6e7f-8a9b-0c1d2e3f4a5b",
    "appointment_date": "2026-09-04",
    "time_slot": "10:00 - 10:30",
    "status": "scheduled",
    "consultation_room_id": "room-appt-7c89f"
  }
  ```

---

### `GET /api/appointments/session/{session_id}`
Retrieves all appointments scheduled under the current anonymous session.

---

### `POST /api/appointments/{appointment_id}/cancel`
Cancels a scheduled appointment with a mandatory cancellation reason.

---

### `GET /api/consultation/{appointment_id}` & `POST /api/consultation/{appointment_id}/notes`
Manages the in-browser consultation room metadata and allows attending medical personnel to record encrypted clinical observations.

