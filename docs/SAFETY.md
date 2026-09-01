# MindSetu — Safety, Ethics & Responsible AI Guardrails

This document defines the strict safety policies, ethical standards, crisis intervention mechanisms, and technical guardrails governing **MindSetu** for SIH Problem Statement **SIH26186**.

---

## 1. Fundamental Welfare & Non-Clinical Principles

MindSetu operates strictly as a **supportive personnel welfare triage prototype**.

```
┌──────────────────────────────────────────────┬──────────────────────────────────────────────┐
│ WHAT MINDSETU DOES                           │ WHAT MINDSETU NEVER DOES                     │
├──────────────────────────────────────────────┼──────────────────────────────────────────────┤
│ ✓ Triage operational stress & fatigue        │ ✗ Provide clinical psychiatric diagnoses     │
│ ✓ Provide empathetic, structured coaching    │ ✗ Prescribe pharmaceutical medications       │
│ ✓ Highlight shift recovery & sleep habits    │ ✗ Make disciplinary or personnel decisions   │
│ ✓ Connect personnel with certified hotlines  │ ✗ Replace licensed psychological care        │
│ ✓ Explain research signals with SHAP         │ ✗ Act as an autonomous deployment gatekeeper │
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
   - **Tele-MANAS (Govt. of India)**: `14416` *(Toll-Free, 24/7, Multi-lingual)*
   - **KIRAN Mental Health Helpline**: `1800-599-0019` *(Ministry of Social Justice)*
   - **Emergency Medical Assistance**: `112`

---

## 3. Privacy-by-Design & Data Protection

- **Anonymous Session Tokens**: Sessions are initiated with random UUIDs (`session_id`). No names, national IDs, employee numbers, or permanent identifiers are collected.
- **Zero-PII Storage**: PostgreSQL records aggregate scores and check-in numbers rather than personally identifiable information.
- **No Disciplinary Profiling**: Welfare triage scores cannot be accessed by unit command for punitive reviews, disciplinary actions, or appraisal grading.
- **Zero Client Credential Exposure**: API keys (`GEMINI_API_KEY`, database secrets) reside strictly in the server-side environment and are never transmitted to the browser.

---

## 4. AI Self-Audit & Deterministic Fallback Pipeline

To ensure model reliability and protect users from LLM hallucinations:

### 1. Automated Regression Suite (`backend/tests/test_ai_self_audit.py`)
Every build is tested against automated regression checks verifying that:
- Model responses never contain forbidden diagnostic language (e.g., *"You suffer from Major Depressive Disorder"*).
- Model responses never propose prescription drugs.
- Model responses adhere to concise, empathetic, and actionable recovery recommendations.

### 2. Deterministic Fallback on External API Failure
If the external Gemini API encounters network latency, rate limits, or provider timeouts:
- The streaming parser captures the error.
- A pre-validated, deterministic supportive message is returned within the 15-second response window.
- The UI never displays unhandled stack traces, raw error codes, or blank screens.

---

## 5. Human-in-the-Loop Governance

MindSetu adheres to the principle of **Human-in-the-Loop (HITL)**:
- Machine learning models and deterministic triage scores are advisory support tools.
- Real-world interventions (duty adjustments, rest leave approval, clinical consultations) are executed exclusively by certified human welfare officers, medical personnel, and unit commanders.
