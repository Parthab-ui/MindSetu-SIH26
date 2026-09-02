# MindSetu — SIH 2026 Presentation, Demo & Judge Defense Guide

---

## 1. Quick Pitches

### 30-Second Elevator Pitch
> *"Uniformed personnel in defense, paramilitary, and police services operate under severe pressures—tactical hypervigilance, critical incident trauma, and night watch sleep disruption—yet often avoid seeking help due to career stigma.  
> **MindSetu** solves this with a purpose-built mental health screening and decision-support platform. By combining a clinically mapped screening matrix with objective duty context, MindSetu calculates deterministic triage priority alongside supervised LightGBM and TreeSHAP feature attributions. It converts operational strain into tailored recovery pathways and longitudinal follow-up, ensuring personnel receive timely support before acute strain escalates into career-ending burnout."*

### 60-Second Pitch
> *"Every day, thousands of defense and emergency personnel transition between high-threat field duties and routine base rotations. Standard mental health questionnaires ask generic questions about office stress, completely missing tactical hypervigilance, trauma flashbacks, and night watch circadian disruption.  
> **MindSetu** is built specifically for uniformed personnel.  
> **First**, it captures operational context: service branch, field postings, shift hours, and sleep deficits.  
> **Second**, it screens for Depression, PTSD/Trauma, and duty burden across a 6-item clinically mapped matrix.  
> **Third**, it runs a dual-layer intelligence engine: a deterministic triage formula (55% Wellness + 45% Workload) providing predictable safety boundaries, paired with a supervised LightGBM model trained on military research data that computes exact TreeSHAP feature attributions in under 15 milliseconds.  
> **Finally**, it delivers tailored tactical decompression protocols, longitudinal tracking, and an empathetic AI companion with strict safety guardrails. MindSetu empowers personnel to seek support early while keeping sessions completely anonymous and protected."*

---

## 2. The 3-Minute Live Demonstration Script

| Timing | Screen | Action | Spoken Script |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:30** | **Home → Context** | Click *Start Protected Session* → Click `✦ Field Patrol / Operations` preset | *"Welcome to MindSetu. Sessions are initialized with anonymous UUIDs—no service numbers or biometrics stored. We capture service branch and operational environment context directly."* |
| **0:30 - 1:00** | **Wellbeing Pulse** | Click `⚡ High Trauma & Depressive Strain` preset → Click *Continue* | *"Our 6 screening questions evaluate operational exhaustion, tactical hypervigilance, emotional numbing, decision fatigue, trauma intrusion, and duty burden."* |
| **1:00 - 1:30** | **Workload Demands** | Click `⚔️ Forward Field Deployment` preset → Click *Generate Summary* | *"We combine self-reported symptoms with objective duty demands—14h shifts, 4 night duties, and sleep deficit—weighted into an Operational Workload Index."* |
| **1:30 - 2:15** | **Results Dashboard** | Scroll to DSI, TSI, OSI gauges & Action Pathways | *"In under a second, MindSetu computes our multi-dimensional breakdown: the Depression Symptom Indicator (DSI), PTSD/Trauma Symptom Indicator (TSI), and tailored tactical recovery pathways."* |
| **2:15 - 2:45** | **TreeSHAP Lab** | Click *Explainable ML Research Lab 🔬* → Click `⚡ Special Forces Active Combat` | *"For technical decision-support, our LightGBM model trained on military research data (DOI 10.5061/dryad.j1r30) computes exact TreeSHAP feature attributions in <15ms."* |
| **2:45 - 3:00** | **History & Trends** | Click *Record Daily Mood* → Click *Assessment History* tab | *"Finally, personnel can track recovery milestones chronologically over time. MindSetu transforms operational signals into timely human support."* |

---

## 3. Top 10 Judge Defense Answers

1. **Q: Why specifically uniformed personnel?**  
   *A:* Uniformed personnel experience high-threat operational trauma, night watch circadian disruption, and severe help-seeking stigma due to fear of fitness-for-duty consequences. Generic civilian tools do not capture this reality.
2. **Q: Does MindSetu diagnose mental illnesses?**  
   *A:* No. MindSetu is explicitly an early welfare-support and triage decision-aid. Formal diagnoses and fitness decisions remain strictly human-driven.
3. **Q: What is the difference between DSI and TSI?**  
   *A:* DSI measures affective exhaustion, decision fatigue, and perceived duty burden. TSI measures trauma hyperarousal, emotional detachment, and intrusive duty memories.
4. **Q: Where did your ML training data come from?**  
   *A:* The published Dryad dataset from the *Sri Lanka Navy Personnel Follow-up Study* (DOI: `10.5061/dryad.j1r30`), containing 495 military personnel across Special Forces and Regular units.
5. **Q: Why LightGBM and TreeSHAP?**  
   *A:* Tabular psychological data performs best with decision-tree ensembles. TreeSHAP provides exact, polynomial-time Shapley values directly from the tree structure.
6. **Q: What is the scoring formula?**  
   *A:* Combined Score = 55% Wellness Pulse + 45% Operational Workload. High (≥70), Moderate (≥45), Low (<45).
7. **Q: How is user privacy protected?**  
   *A:* Completely pseudonymous UUID session tokens. Zero names, service numbers, or biometrics are stored.
8. **Q: What happens in a crisis?**  
   *A:* Real-time keyword safety detection triggers immediate escalation to the National Mental Health Helpline (Tele-MANAS `14416` / `1800-891-4416`).
9. **Q: How does the system handle AI timeouts?**  
   *A:* All LLM calls have an 8-second timeout budget with automatic fallback to pre-compiled deterministic coping text.
10. **Q: What are the 4 Pillars of MindSetu?**  
    *A:* LightGBM (Research ML) → TreeSHAP (Explainability) → Gemini (Supportive AI) → Human Welfare Officer (Decision).
