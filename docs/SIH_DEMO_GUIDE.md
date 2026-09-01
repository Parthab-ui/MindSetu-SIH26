# MindSetu — SIH 2026 Jury & Mentor Demonstration Guide

This guide provides a structured, high-impact demonstration script and jury defense strategy for **Problem Statement SIH26186** (Personnel Welfare Support & Triage).

---

## 1. Demo Tracks: Timing & Pacing

```
┌──────────────────────────────────────┬──────────────────────────────────────┐
│ TRACK A: 3-MINUTE LIGHTNING PITCH    │ TRACK B: 7-MINUTE FULL EVALUATION    │
├──────────────────────────────────────┼──────────────────────────────────────┤
│ 0:00 - Problem & Mandate (30s)       │ 0:00 - Operational Problem Context   │
│ 0:30 - Guided Check-In (45s)         │ 1:00 - Anonymous Protected Session   │
│ 1:15 - Triage & SHAP XAI (45s)       │ 2:00 - Wellness & Duty Context Flow  │
│ 2:00 - Gemini Streaming Companion (30s)│ 3:15 - Deterministic Triage Breakdown │
│ 2:30 - Safety & HITL Wrap-up (30s)   │ 4:15 - Research Lab & SHAP XAI Modal │
│                                      │ 5:15 - Modern Gemini AI Companion    │
│                                      │ 6:15 - Crisis Escalation & Hotlines  │
│                                      │ 7:00 - Safety, Privacy & Governance  │
└──────────────────────────────────────┴──────────────────────────────────────┘
```

---

## 2. Stage-by-Stage Live Walkthrough

### Step 1: Start Protected Session (`StartScreen.jsx`)
- **Action**: Click *"Begin Protected Check-In"* after confirming anonymous consent.
- **Talking Point**:
  > *"In operational forces, personnel hesitate to seek help due to perceived career stigma. MindSetu starts with an anonymous, confidential session where no PII or military IDs are stored."*

### Step 2: 6-Question Wellness Pulse (`WellnessScreen.jsx`)
- **Action**: Select responses reflecting moderate sleep fatigue and pacing stress.
- **Talking Point**:
  > *"Rather than intimidating clinical depression forms, MindSetu uses a 6-item validated wellness pulse capturing energy, recovery, and daily mood."*

### Step 3: Operational Workload Context (`WorkloadScreen.jsx`)
- **Action**: Input sample values:
  - Weekly Duty Hours: `68`
  - Night Duties in Past Week: `4`
  - Average Unbroken Rest: `5.5 hrs`
  - Consecutive Weeks without Leave: `16`
- **Talking Point**:
  > *"Wellness cannot be understood in a vacuum. MindSetu contextualizes mental wellbeing with real operational drivers: shift fatigue, night duty frequency, and prolonged deployment without leave."*

### Step 4: Deterministic Welfare Triage Dashboard (`AnalysisScreen.jsx`)
- **Action**: Show the **Combined Score (68.9 - Moderate Risk)** and primary driver breakdown.
- **Talking Point**:
  > *"Risk scoring is strictly deterministic: 55% wellness + 45% workload. It is not an unverified AI guess. The system highlights actionable recovery recommendations tailored to duty fatigue."*

### Step 5: Research Lab & Explainability Modal (`ResearchLabModal.jsx`)
- **Action**: Click *"Open Research Lab"*, display the LightGBM probability and SHAP Waterfall chart.
- **Talking Point**:
  > *"For research and institutional analysis, we pair LightGBM with TreeSHAP. When a jury asks 'Why was this flagged?', SHAP explicitly shows that 68h weekly duty and 4 night shifts contributed +0.46 to the risk prediction."*

### Step 6: MindSetu AI Companion (`ChatScreen.jsx`)
- **Action**: Click the suggestion card: *"What are practical ways to manage sleep recovery during night shifts?"*
- **Talking Point**:
  > *"MindSetu uses Google Gemini 2.5 Flash via real-time streaming NDJSON for empathetic, structured coaching. Notice the integrated pill composer, thinking pulse, and editorial list formatting."*

---

## 3. High-Probability Jury Q&A Matrix

### Q1: *"Is MindSetu attempting to diagnose mental health conditions?"*
**Answer**:
> *"No, absolutely not. MindSetu is strictly a supportive personnel welfare triage prototype. It triages operational stress and duty fatigue, providing recovery coaching and connecting personnel to human welfare counselors. It never issues psychiatric diagnoses or prescribes medications."*

### Q2: *"Why use both Deterministic scoring AND LightGBM?"*
**Answer**:
> *"Deterministic scoring guarantees that risk tiering is 100% predictable, safe, and transparent for operational decisions. LightGBM and SHAP provide a research layer to discover complex non-linear interactions across large operational datasets and explain them transparently."*

### Q3: *"How do you prevent Gemini from hallucinating or giving dangerous advice?"*
**Answer**:
> *"We employ a 3-layer safety system: (1) System prompt boundary instructions forbidding medical advice; (2) An automated AI Self-Audit regression suite in testing; (3) A regex crisis interception layer that catches self-harm language and immediately displays Tele-MANAS (14416) and KIRAN (1800-599-0019) emergency lines."*

### Q4: *"How will this work in remote border outposts with poor internet?"*
**Answer**:
> *"The deterministic scoring engine and LightGBM inference run locally on the edge device or intranet server without needing external internet. Only the conversational Gemini companion requires API access, and when offline, the system seamlessly falls back to pre-validated deterministic coping strategies."*

---

## 4. Pre-Demo Verification Checklist

- [ ] Backend is running on `http://127.0.0.1:8000` (`uvicorn main:app --reload`).
- [ ] Frontend is running on `http://localhost:5173` (`npm run dev`).
- [ ] Verify health endpoints: `/api/health`, `/api/gemini/health`, `/api/sih26186/ml/health`.
- [ ] Run `pytest backend/tests` (all 15 tests passing).
- [ ] Run `npm run build` in `frontend` (0 errors).
