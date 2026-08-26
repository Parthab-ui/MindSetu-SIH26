# MindSetu — SIH 2026 Master Project Context

> Canonical working context for future MindSetu/SIH conversations and mentor preparation.

## 1. Project identity

- **Project:** MindSetu
- **SIH:** Smart India Hackathon 2026
- **Problem Statement:** SIH26186
- **Theme:** HealthTech / Welfare Technology
- **Category:** Software
- **Team:** MANOMITRAS
- **Goal:** Build a focused AI-assisted personnel welfare-support prototype.

## 2. Current repository

- **GitHub:** `Parthab-ui/MindSetu`
- **Default branch:** `main`
- **Working MVP branch:** `v2`
- **Frontend:** React 19 + Vite
- **Backend:** FastAPI + Python
- **Database:** PostgreSQL via psycopg
- **AI:** Google Gemini API
- **Research ML:** LightGBM + SHAP
- **Frontend API base:** `http://127.0.0.1:8000`

## 3. Product flow

1. Person opens MindSetu.
2. Protected onboarding explains privacy, consent and welfare-only positioning.
3. An anonymous session is created.
4. Person completes a six-item wellbeing pulse.
5. Person provides workload and duty/recovery context.
6. Backend computes a deterministic welfare triage signal.
7. The separate SIH26186 research model can produce a research signal.
8. SHAP explains the research model's contributing features.
9. Gemini provides supportive communication.
10. Mood check-ins and human-support pathways remain available.

The prototype is for welfare support and triage. It must not diagnose people or make disciplinary/personnel decisions.

## 4. AI design

MindSetu uses the Google Gemini API for the student/person-facing conversational layer and for supportive communication around structured research-model outputs.

The architecture separates responsibilities:
- **LightGBM:** research welfare-signal prediction.
- **SHAP:** local model explanation.
- **Gemini:** supportive communication and conversational interaction.
- **Human:** welfare intervention and professional decision-making.

The backend applies a deterministic crisis-language check before normal Gemini generation. Crisis messages receive a safety-priority response instead of being sent to normal generation.

## 5. Safety and privacy positioning

Important presentation claims:
- MindSetu is a **welfare support and triage prototype**, not a diagnostic medical system.
- Welfare signals are not clinical diagnoses or personnel decisions.
- The prototype supports anonymous sessions and avoids requiring identity during onboarding.
- The system contains explicit crisis handling and AI guardrails.
- A research-model probability is a model score, not the probability that a person has a mental-health condition.
- Real deployment requires domain validation, institutional governance, stronger privacy/security controls, professional escalation pathways and operational monitoring.

Avoid claiming the prototype is clinically validated, production-ready or a replacement for qualified professionals.

## 6. Current implementation highlights

### Frontend
- React application focused on the SIH26186 welfare workflow.
- Anonymous session creation.
- Six-item wellbeing pulse.
- Workload and duty/recovery form.
- Explainable research-model view.
- Gemini AI companion.
- Mood check-ins and history.
- Dark/light mode.
- Loading and error states.

### Backend
- FastAPI application with security headers and restricted local CORS.
- UUID-based anonymous sessions.
- PostgreSQL persistence.
- Deterministic welfare scoring.
- Crisis-language handling.
- Gemini conversational integration.
- LightGBM + SHAP SIH26186 research layer.
- Mood endpoints.

## 7. Mentor-demo priority

For a short SIH mentor demo, prioritize:
1. **Problem:** welfare concerns can remain hidden until they affect recovery and performance.
2. **Solution:** MindSetu provides a private first step: wellbeing pulse → workload context → welfare signal → explainability → Gemini support → human intervention.
3. **Technical explanation:** React/Vite → FastAPI → PostgreSQL + research ML → Gemini API.
4. **Differentiator:** AI is not the sole decision-maker; deterministic scoring, explainability and human intervention surround it.

## 8. Mentor questions to be ready for

### Why AI?
AI provides an accessible conversational support layer and helps people articulate what they are experiencing. It is not positioned as a diagnostician.

### Why Gemini?
Gemini provides hosted conversational intelligence while the API key remains server-side behind FastAPI.

### What is the ML doing?
LightGBM produces a research-only signal from the seven trained features; SHAP provides local feature contributions. This research output is separate from the deterministic welfare triage score.

### What happens in a crisis?
The backend checks explicit crisis language before normal Gemini generation and returns a safety-priority response directing the person toward immediate professional/emergency support and a trusted person.

### How is privacy handled?
The prototype uses anonymous session IDs and keeps the Gemini API key server-side. Production requires a stronger privacy and security architecture.

### Is this production-ready?
No. It is a working SIH prototype. Production would require domain validation, governance, security/privacy review, institutional integration, professionally governed escalation, reliability testing and compliance work.

## 9. Presentation language

Use:
- “AI-assisted personnel welfare support”
- “welfare triage”
- “risk-aware guidance”
- “explainable research signal”
- “human support escalation”
- “prototype”
- “privacy-conscious design”

Avoid:
- “AI therapist”
- “AI diagnoses depression/anxiety”
- “100% anonymous” unless deployment guarantees it
- “clinically proven”
- “replaces counsellors/doctors”
- treating a model probability as a clinical probability

## 10. Working rule

Preserve the focused SIH26186 workflow. Prefer small, testable improvements, conservative safety/privacy claims, and explicit separation between implemented prototype behavior and future production scope.
