# MindSetu — SIH Mentor Demo Guide

## Goal

Demonstrate a complete student wellbeing journey in 5–8 minutes rather than showing every screen.

## Recommended flow

### 1. Problem → solution (30 seconds)

Explain that MindSetu is an anonymous student wellbeing platform combining screening, early risk identification, an AI companion, mood tracking and access to human support.

### 2. Start anonymously (30 seconds)

Show the landing screen and explain that the prototype does not require a student's identity to start a wellbeing session.

### 3. PHQ-9 + GAD-7 (1–2 minutes)

Use a prepared, non-identifying demo response pattern. Complete both screenings and explain:

- PHQ-9 screens depressive symptoms.
- GAD-7 screens anxiety symptoms.
- Scores are screening signals, not diagnoses.
- The platform combines the results to guide the next support step.

### 4. Risk/support layer (45 seconds)

Show the generated wellbeing/risk interpretation and explain that the purpose is triage and support prioritisation, not clinical diagnosis.

### 5. AI companion (1 minute)

Ask a simple student-facing question such as: `I'm stressed about my college workload and can't switch off at night.`

Highlight that the backend uses a local Ollama/Qwen model, keeps screening context private to the AI prompt, blocks obvious crisis-language requests before model generation, and instructs the model not to diagnose or prescribe medication.

### 6. Mood tracking (45 seconds)

Log a mood with a short note, then show the history/trend. Explain how repeated check-ins can help a student notice changes over time.

### 7. Human support (45 seconds)

Show counsellor discovery and the appointment flow. Emphasise that AI is not intended to replace qualified professionals.

### 8. Dashboard (30 seconds)

Finish on the dashboard and connect the pieces: screening → AI support → mood history → human support.

## Questions a mentor is likely to ask

### What is innovative?

The prototype combines structured mental-health screening, an AI wellbeing companion, risk-aware routing, longitudinal mood tracking and counsellor access into one student-focused workflow.

### Why local AI?

The prototype uses local Ollama/Qwen inference to reduce dependence on a third-party hosted LLM during the demo and to keep the AI service under the team's control. A production deployment would require a full privacy/security architecture and formal model evaluation.

### Is this a diagnostic tool?

No. PHQ-9 and GAD-7 are used as screening instruments. MindSetu should support early identification and referral, not make clinical diagnoses.

### What happens in a crisis?

The backend checks for obvious crisis language before sending the message to the AI model and returns a safety-priority response directing the student toward immediate professional/emergency support and a trusted person.

### What remains for production?

Authentication/identity architecture, stronger privacy controls, encryption and audit design, comprehensive automated testing, abuse protection, clinical validation, accessibility testing, deployment/observability and regulatory review.

## Pre-demo checklist

- Start PostgreSQL and verify the MindSetu database is reachable.
- Start Ollama and confirm the configured Qwen model is available.
- Start FastAPI on port 8000.
- Start Vite and verify the frontend opens.
- Run `npm run lint` and `npm run build` before presenting.
- Complete one dry-run of the full journey.
- Do not use real student/mental-health data in the demo.
- Keep a second terminal/window ready in case the AI service needs restarting.

## Demo principle

Do not claim that the prototype is clinically validated or production-ready. Present it as an SIH prototype that demonstrates the proposed end-to-end workflow and identifies the engineering and validation work required for deployment.
