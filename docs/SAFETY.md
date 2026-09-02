# MindSetu — Safety, Ethics & Responsible AI Guardrails

This document defines the strict safety policies, ethical standards, crisis intervention mechanisms, and technical guardrails governing **MindSetu** for SIH Problem Statement **SIH26186**.

---

## 1. Fundamental Welfare & Non-Clinical Principles

MindSetu operates strictly as a **supportive personnel welfare triage and decision-support prototype**.

```text
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ WHAT MINDSETU DOES                           │ WHAT MINDSETU NEVER DOES                     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ ✓ Triage operational stress & fatigue        │ ✗ Provide clinical psychiatric diagnoses     │
│ ✓ Provide empathetic, structured coaching    │ ✗ Prescribe pharmaceutical medications       │
│ ✓ Highlight shift recovery & sleep habits    │ ✗ Make disciplinary or personnel decisions   │
│ ✓ Connect personnel with certified hotlines  │ ✗ Replace licensed psychological care        │
│ ✓ Explain research signals with TreeSHAP     │ ✗ Act as an autonomous deployment gatekeeper │
│ ✓ Extract voice acoustic biomarkers in RAM   │ ✗ Store raw voice recordings or biometrics   │
└──────────────────────────────────────────────┴──────────────────────────────────────────────┘
```

---

## 2. Crisis Language Detection & Immediate Escalation

### Automatic Safety Interception
MindSetu evaluates incoming chat messages through a regex and keyword-based safety screener before dispatching requests to external LLM APIs.

When language indicative of active crisis, acute distress, or self-harm is detected:
1. The standard LLM streaming pathway is bypassed immediately.
2. A high-priority **Crisis Action Banner** is rendered at the top of the interface.
3. The user is provided direct, one-click access to national crisis helplines:
   - **Tele-MANAS (Govt. of India)**: `14416` *(Toll-Free, 24/7, Multi-lingual)* or `1800-891-4416`
   - **KIRAN Mental Health Helpline**: `1800-599-0019` *(Ministry of Social Justice)*
   - **Emergency Medical Assistance**: `112`

---

## 3. Privacy-by-Design & Data Protection

- **Anonymous Session Tokens**: Sessions are initiated with random UUIDs (`session_id`). No names, national IDs, employee numbers, or permanent identifiers are collected.
- **Zero-PII Storage**: PostgreSQL records aggregate scores and check-in numbers rather than personally identifiable information.
- **No Disciplinary Profiling**: Welfare triage scores cannot be accessed by unit command for punitive reviews, disciplinary actions, or appraisal grading.
- **Zero Client Credential Exposure**: API keys (`GEMINI_API_KEY`, database secrets) reside strictly in the server-side environment and are never transmitted to the browser.
- **SQL Injection Defense**: Parameterized queries through PostgreSQL connection pooling (`psycopg_pool`).

---

## 4. Voice ML & Biometric Privacy Safeguards

Raw human voice recordings are inherently sensitive and potentially biometric. MindSetu implements strict technical guarantees:

1. **In-Memory Waveform Processing**:
   - Audio recordings are decoded in-memory (`io.BytesIO`).
   - The 24 acoustic and prosodic features are extracted in under 15 milliseconds.
   - **The raw audio buffer is immediately released and discarded.**
2. **Zero Audio Persistence**:
   - Zero audio files (WAV, WebM, MP3) are written to local disk, temp files, or cloud object storage.
   - No audio recordings or voiceprints are persisted to the database.
   - Only derived non-invertible aggregate metrics (e.g. `depression_signal: 78.5`, `confidence: 0.85`, `quality: "good"`) are returned.
3. **No External Audio Transmission**:
   - Audio waveforms are processed exclusively by local NumPy/SciPy extractors on the backend.
   - Raw audio is **never** transmitted to Google Gemini, cloud speech APIs, or third-party services.
4. **Non-Diagnostic Voice Framing**:
   - Voice outputs are strictly labeled as a *Depression-Related Voice Signal* and an *Experimental Stress Proxy*.
   - Voice paralinguistics never override the authoritative deterministic triage engine ($55\%$ Wellness $+ 45\%$ Workload).

---

## 5. AI Self-Audit & Deterministic Fallback Pipeline

To ensure model reliability and protect users from LLM hallucinations:

### 1. Automated Regression Suite (`backend/tests/test_ai_self_audit.py`)
Every build is tested against automated regression checks verifying that:
- Model responses never contain forbidden diagnostic language (e.g., *"You suffer from Major Depressive Disorder"*).
- Model responses never propose prescription drugs.
- Model responses adhere to concise, empathetic, and actionable recovery recommendations.

### 2. Deterministic Fallback on External API Failure
If the external Gemini API encounters network latency, rate limits, or provider timeouts:
- The streaming parser captures the error.
- A pre-validated, deterministic supportive message is returned within the response window.
- The UI never displays unhandled stack traces, raw error codes, or blank screens.

---

## 6. Human-in-the-Loop Governance

MindSetu adheres to the principle of **Human-in-the-Loop (HITL)**:
- Machine learning models and deterministic triage scores are advisory support tools.
- Real-world interventions (duty adjustments, rest leave approval, clinical consultations) are executed exclusively by certified human welfare officers, medical personnel, and unit commanders.
