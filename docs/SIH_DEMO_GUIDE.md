# MindSetu — Multimodal SIH 2026 Presentation, Demo & Judge Defense Guide

---

## 1. Quick Pitches

### 30-Second Elevator Pitch
> *"Uniformed personnel in defense, paramilitary, and police services operate under severe pressures—tactical hypervigilance, critical incident trauma, and night watch sleep disruption—yet often avoid seeking help due to career stigma.  
> **MindSetu** solves this with a **multimodal mental health decision-support platform**. By combining a clinically mapped screening matrix and objective duty context with an in-memory **Voice ML paralinguistic analysis engine**, MindSetu computes deterministic triage priority alongside explainable TreeSHAP feature attributions. It converts operational strain into tailored recovery pathways and longitudinal follow-up, ensuring personnel receive timely support before acute strain escalates into career-ending burnout."*

### 60-Second Pitch
> *"Every day, thousands of defense and emergency personnel transition between high-threat field duties and routine base rotations. Standard mental health questionnaires ask generic questions about office stress, completely missing tactical hypervigilance, trauma flashbacks, and night watch circadian disruption.  
> **MindSetu** is built specifically for uniformed personnel combining three complementary modalities:  
> **1. Operational Duty Context:** Capturing shift hours, night watches, and sleep deficits into an Operational Workload Index.  
> **2. Specialized Screening:** Evaluating Depression (DSI) and PTSD/Trauma (TSI) symptoms across a 6-item clinically mapped matrix.  
> **3. Multimodal Voice ML:** Extracting 24 acoustic and prosodic biomarkers—such as pitch flattening and pause hesitation—in-memory without storing raw audio.  
> **4. Dual-Layer AI Governance:** Authoritative deterministic triage (55% Wellness + 45% Workload) paired with a supervised LightGBM model computing exact TreeSHAP feature attributions in under 15 milliseconds.  
> **Finally**, it delivers tailored tactical decompression protocols, longitudinal tracking, and an empathetic AI companion with strict safety guardrails. MindSetu empowers personnel to seek support early while keeping sessions completely anonymous and protected."*

---

## 2. The 3-Minute Live Demonstration Script (Flagship Multimodal Flow)

| Timing | Screen | Action | Spoken Script |
| :---: | :--- | :--- | :--- |
| **0:00 - 0:25** | **Home → Context** | Click *Start Protected Session* → Click `✦ Field Patrol / Operations` preset | *"Welcome to MindSetu. Sessions are initialized with anonymous UUIDs—zero service numbers or biometrics stored. We capture service branch and operational environment context directly."* |
| **0:25 - 0:50** | **Wellbeing Pulse** | Click `⚡ High Trauma & Depressive Strain` preset → Click *Continue* | *"Our 6 screening questions evaluate operational exhaustion, tactical hypervigilance, emotional numbing, decision fatigue, trauma intrusion, and duty burden."* |
| **0:50 - 1:15** | **Workload Demands** | Click `⚔️ Forward Field Deployment` preset → Click *Proceed to Voice Check* | *"We combine self-reported symptoms with objective duty demands—14h shifts, 4 night duties, and sleep deficit—weighted into an Operational Workload Index."* |
| **1:15 - 1:50** | **Multimodal Voice Check** | Click `⚡ Strained Shift Audio` (or record live microphone) → Click *Generate Multimodal Summary* | ***THE FLAGSHIP MOMENT:*** *"Now we introduce our third modality—speech paralinguistics. In under 15 milliseconds, our in-memory Voice ML classifier extracts 24 acoustic parameters like pitch range and hesitation ratios, immediately discarding the raw audio for privacy."* |
| **1:50 - 2:30** | **Multimodal Results** | Scroll to DSI, TSI, Voice Signal & Cross-Modal Concordance | *"Here is our multimodal summary: Depression Indicator (DSI), PTSD/Trauma Indicator (TSI), and Voice ML Signal, alongside a cross-modal concordance analysis that explains any divergence between self-report and vocal biomarkers."* |
| **2:30 - 2:50** | **TreeSHAP Lab** | Click *Explainable ML Research Lab 🔬* → Click `⚡ Special Forces Active Combat` | *"For technical decision-support, our LightGBM model trained on military research data (DOI 10.5061/dryad.j1r30) computes exact TreeSHAP feature attributions in <15ms."* |
| **2:50 - 3:00** | **History & Trends** | Click *Record Daily Mood* → Click *Assessment History* tab | *"Finally, personnel can track recovery milestones chronologically over time. MindSetu transforms multimodal signals into timely human support."* |

---

## 3. Top Voice ML Judge Defense Answers

1. **Q: Is Voice ML actually machine learning or just a heuristic?**  
   *A:* It is a real supervised Gradient Boosting classifier pipeline with StandardScaler preprocessor trained on 24 acoustic & prosodic features (pitch mean/std/range via autocorrelation, pause ratios, speech rate, spectral flux, and 13 MFCCs). Predictions come from the learned decision trees, not manual if/else rules.
2. **Q: Does Voice ML diagnose depression or PTSD?**  
   *A:* No. Voice ML provides an objective behavioral signal of paralinguistic psychomotor strain (such as pitch flattening or elevated hesitation). It is explicitly non-diagnostic.
3. **Q: Is raw audio stored?**  
   *A:* No. Raw audio is processed in-memory, acoustic features are extracted, and the raw audio buffer is immediately released. Zero audio files are stored on disk or database.
4. **Q: What if the microphone fails or the room is noisy?**  
   *A:* MindSetu provides real-time audio quality validation (SNR estimation and clipping detection). If audio quality is poor or permissions are denied, users can easily skip voice without compromising the deterministic triage engine!
5. **Q: What if self-reported answers and voice signals disagree?**  
   *A:* This is a vital clinical feature! If self-reported fatigue is high but voice is steady, it indicates cognitive load without deep vocal psychomotor slowing. If voice is strained despite low self-report, it highlights possible underreporting due to duty stigma.
6. **Q: Why not use voice alone?**  
   *A:* Mental health is multi-dimensional. A single modality can be misleading. MindSetu fuses self-report (55%), duty workload (45%), and voice ML into a balanced decision-support view.
7. **Q: What is the scoring formula?**  
   *A:* Combined Triage Score = 55% Wellness Pulse + 45% Operational Workload. High (≥70), Moderate (≥45), Low (<45).
8. **Q: What dataset trained your LightGBM research model?**  
   *A:* The published Dryad dataset from the *Sri Lanka Navy Personnel Follow-up Study* (DOI: `10.5061/dryad.j1r30`), containing 495 military personnel.
9. **Q: What happens in a crisis?**  
   *A:* Real-time keyword safety detection triggers immediate escalation to the National Mental Health Helpline (Tele-MANAS `14416` / `1800-891-4416`).
10. **Q: What are the 5 Pillars of MindSetu?**  
    *A:* Self-Report Pulse → Operational Duty Demands → Voice ML Paralinguistics → LightGBM/TreeSHAP (Explainability) → Qualified Human Welfare Officer.
