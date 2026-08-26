# MindSetu — SIH Mentor Demo Guide

## Goal
Demonstrate a complete personnel-welfare journey in 5–8 minutes without unnecessary feature detours.

## Recommended flow

### 1. Problem → solution (30 seconds)
Explain that MindSetu gives personnel a private first step for structured wellbeing check-ins, workload-aware welfare triage, explainable research ML, supportive AI communication and human escalation.

### 2. Start a protected session (30 seconds)
Show anonymous session creation and fictional role/unit information.

### 3. Wellbeing pulse + duty context (1–2 minutes)
Complete the six-item wellbeing pulse, then enter duty hours, night duties, recovery time, leave gap, workload intensity, pressure and duty changes.

### 4. Welfare analysis (45 seconds)
Show the deterministic welfare signal and explain that it is a support/triage result, not a clinical diagnosis and not a personnel or disciplinary decision.

### 5. Explainable research ML (1 minute)
Show the separate SIH26186 research model and explain the architecture:

- LightGBM produces the research prediction.
- SHAP explains the contributing features.
- Gemini communicates structured findings supportively.
- A qualified human remains responsible for intervention.

### 6. MindSetu AI companion (1 minute)
Ask: `I'm stressed about my workload and can't switch off after duty.`
Explain that the Google Gemini API is called behind FastAPI; the API key never reaches the browser.

### 7. Mood check-in (45 seconds)
Log a mood and optional note to show longitudinal self-check-ins.

### 8. Human support (45 seconds)
Explain that AI is an accessibility/support layer, not a replacement for qualified professionals.

## Questions a mentor is likely to ask

### What is innovative?
The prototype combines structured personnel wellbeing input, workload-aware triage, explainable research ML and a Gemini support companion in one focused welfare workflow.

### Why Gemini?
Gemini provides hosted conversational intelligence while the provider key remains server-side behind FastAPI.

### Is this a diagnostic tool?
No. The system produces welfare/support signals and a separate research-model output. Neither should be presented as a clinical diagnosis.

### What happens in a crisis?
The backend detects obvious crisis language before normal AI generation and returns a safety-priority response directing the person toward immediate professional/emergency support and a trusted person.

### What remains for production?
Clinical/domain validation, stronger privacy and security controls, accessibility testing, observability, abuse protection, institutional governance and professionally governed escalation pathways.

## Pre-demo checklist

- Start PostgreSQL and verify the database is reachable.
- Configure `GEMINI_API_KEY` on the backend only.
- Start FastAPI on port 8000.
- Start Vite and verify the frontend opens.
- Run `npm run lint` and `npm run build` before presenting.
- Complete one dry-run of the full journey.
- Use fictional demo information only.
- Keep deterministic fallback behavior available if Gemini is temporarily unavailable.

## Demo principle
Do not claim the prototype is clinically validated or production-ready. Present it as an SIH prototype demonstrating the proposed engineering workflow and identifying the validation and governance work required for deployment.
