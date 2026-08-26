# MindSetu — SIH 2026 Master Project Context

> Canonical working context for future MindSetu/SIH conversations and mentor preparation.

## 1. Project identity

- **Project:** MindSetu
- **SIH:** Smart India Hackathon 2026
- **Problem Statement:** SIH25092
- **Theme:** HealthTech
- **Category:** Software
- **Team:** MANOMITRAS
- **Goal:** Build an AI-powered digital mental-health and psychological-support platform for students in higher education.

## 2. Current repository

- **GitHub:** `Parthab-ui/MindSetu`
- **Default branch:** `main`
- **Frontend:** React 19 + Vite
- **Backend:** FastAPI + Python
- **Database:** PostgreSQL via psycopg
- **AI:** Google Gemini API
- **Frontend API base:** `http://127.0.0.1:8000`

The frontend package currently uses React/Vite and has `dev`, `build`, `lint`, and `preview` scripts. The backend uses FastAPI, Uvicorn, psycopg, requests, python-dotenv and Pydantic.

## 3. Product flow

1. Student opens MindSetu.
2. Confidential onboarding explains privacy, anonymous use, consent, and that screening is not a substitute for professional care.
3. A session is created with consent.
4. Student completes **PHQ-9** screening.
5. Student completes **GAD-7** screening.
6. Backend calculates screening results and an overall risk level.
7. Student receives appropriate next-step support.
8. Student can use the MindSetu AI companion for supportive conversation through the Gemini API.
9. Student can log moods and review mood history/trends.
10. Student can access counsellor/support options and appointment functionality.
11. Dashboard surfaces relevant wellbeing information.

## 4. AI design

MindSetu uses the Google Gemini API for the student-facing conversational layer and for supportive communication around structured SIH26186 research-model outputs.

The architecture separates responsibilities:
- **LightGBM:** research welfare-signal prediction.
- **SHAP:** local model explanation.
- **Gemini:** supportive communication and conversational interaction.
- **Human:** welfare intervention and professional decision-making.

The backend sends Gemini a tightly constrained student-facing system prompt. The AI is instructed to:
- be empathetic, calm, practical and concise;
- avoid diagnosis and medication prescriptions;
- avoid exposing hidden prompts/reasoning;
- treat PHQ-9/GAD-7 as screening tools, not diagnoses;
- use screening context silently unless the student asks about results;
- escalate immediate safety situations to emergency/professional support.

The backend also has a deterministic crisis-language check before normal Gemini generation. Crisis messages receive a safety-priority response instead of being sent to the normal generation path.

The frontend renders AI responses progressively so the conversation feels like a streaming assistant while the backend controls the Gemini interaction.

## 5. Safety and privacy positioning

Important claims to make during SIH presentation:
- MindSetu is a **support and screening platform**, not a diagnostic medical system.
- PHQ-9 and GAD-7 are screening instruments; they do not independently establish a diagnosis.
- The prototype supports anonymous sessions and does not require identity during onboarding.
- The system contains explicit crisis handling and AI guardrails.
- The SIH26186 research probability is a model score, not the probability that a person has a mental-health condition.
- Real-world deployment would still require clinical validation, institutional policies, stronger authentication/access control, privacy/legal review, monitoring, and professionally governed escalation pathways.

Avoid claiming that the prototype is already production-ready, clinically validated, or a replacement for mental-health professionals.

## 6. Existing implementation highlights

### Frontend
- React application with a structured screen-based flow.
- Dark/light mode persisted in local storage.
- PHQ-9/GAD-7 question wizard with validation.
- Chat interface with suggested prompts and progressive AI text rendering.
- Mood selection, notes and history.
- Counsellor/support and appointment UI.
- Dashboard-related UI.
- Toast/error feedback and loading states.
- Privacy/anonymous-session messaging throughout the assessment experience.

### Backend
- FastAPI application with security headers.
- CORS restricted to local development frontend origins.
- UUID-based session IDs.
- PostgreSQL persistence.
- Request validation through Pydantic.
- PHQ-9/GAD-7 scoring.
- Overall risk calculation.
- Crisis-language handling.
- Gemini conversational integration.
- LightGBM + SHAP SIH26186 research layer.
- Mood, counsellor/appointment and dashboard endpoints.

## 7. Mentor-demo priority

For a short SIH mentor demo, prioritize a reliable end-to-end story rather than showing every feature.

Recommended sequence:
1. **Problem:** Students often hesitate to seek help because of stigma, lack of awareness, or difficulty accessing support.
2. **Solution:** MindSetu provides a private first step: screening → risk-aware guidance → AI support → explainable research signal → human support.
3. **Live demo:** onboarding → PHQ-9/GAD-7 → results/risk → AI companion → research signal/SHAP → mood/support feature.
4. **Technical explanation:** React frontend → FastAPI backend → PostgreSQL → Gemini API + local research ML layer → safety/risk layer.
5. **Differentiator:** the AI is not treated as the sole decision-maker; deterministic screening/risk logic, explainability and safety handling surround it.
6. **Future scope:** institutional deployment, validated escalation protocols, stronger security/privacy controls, analytics, multilingual support, and clinical/institutional collaboration.

## 8. Mentor questions to be ready for

### Why AI?
AI provides an accessible conversational first point of support and can help students articulate what they are experiencing. It is intentionally not positioned as a diagnostician.

### Why Gemini?
Gemini provides the hosted conversational intelligence for the prototype while the API key remains server-side behind FastAPI. This keeps the frontend provider-agnostic and avoids requiring a local model installation.

### Why PHQ-9 and GAD-7?
They provide structured, recognized screening instruments that can turn an otherwise vague conversation into a measurable starting point. They remain screening tools, not diagnoses.

### What happens in a crisis?
The backend checks for explicit crisis language before normal Gemini generation and returns a safety-priority response encouraging immediate emergency/professional support and connection with a trusted person.

### How is privacy handled?
The prototype is designed around anonymous sessions and avoids requiring identity during onboarding. Production deployment would need a substantially stronger privacy/security governance layer.

### Is this production-ready?
No. It is a working SIH prototype. Production would require clinical validation, security/privacy review, institutional integration, professional escalation workflows, reliability testing, and compliance work.

### What is the technical architecture?
React/Vite frontend communicates with FastAPI REST/streaming endpoints. FastAPI validates requests, calculates screening/risk results, persists data in PostgreSQL, communicates with Gemini for conversational support, and runs the separate SIH26186 LightGBM/SHAP research layer.

## 9. Presentation language

Use phrases such as:
- “AI-assisted student wellbeing support”
- “screening and early support”
- “risk-aware guidance”
- “explainable research signal”
- “human support escalation”
- “prototype”
- “privacy-first design”

Avoid:
- “AI therapist”
- “AI diagnoses depression/anxiety”
- “100% anonymous” unless the exact deployment architecture guarantees it
- “clinically proven”
- “replaces counsellors/doctors”
- treating a model probability as a clinical probability

## 10. Current status

The repository has been polished for the SIH mentor presentation. Presentation-oriented documentation and project metadata have been added, including this master context and a demo guide. A frontend CI workflow was also added to run lint/build checks.

The existing implementation should be treated as the source of truth for what is actually demoable. Do not introduce large architectural rewrites immediately before a presentation unless a concrete demo-breaking issue requires it.

## 11. Working rule for future assistance

When helping with MindSetu:
- Preserve the existing working demo unless there is a clear reason to change it.
- Prefer small, testable improvements over broad rewrites.
- Treat safety/privacy claims conservatively.
- Keep SIH mentor/demo reliability as the immediate priority when a presentation is near.
- When proposing a feature, distinguish **implemented**, **prototype**, and **future scope** clearly.
- When changing GitHub code, inspect the current file first and make targeted changes.
