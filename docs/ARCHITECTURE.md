# MindSetu — System Architecture & Design

This document details the end-to-end software, machine learning, and security architecture of **MindSetu**, an AI-assisted personnel welfare screening and decision-support platform designed for Smart India Hackathon 2026 Problem Statement **SIH26186**.

---

## 1. System Topology & Component Layout

```mermaid
flowchart TB
    subgraph Client ["Client Presentation Tier (React 19 + Vite)"]
        UI_Start["1. Anonymous Session & Context (StartScreen.jsx)"]
        UI_Pulse["2. 6-Item Wellbeing Pulse (WellnessScreen.jsx)"]
        UI_Duty["3. Operational Duty Demands (WorkloadScreen.jsx)"]
        UI_Triage["4. Multi-Dimensional Results Dashboard (AnalysisScreen.jsx)"]
        UI_ML["5. TreeSHAP Research Lab Modal (ResearchLabModal.jsx)"]
        UI_Chat["6. MindSetu AI Companion (ChatScreen.jsx)"]
        UI_Hist["7. Longitudinal Assessment Timeline (MoodScreen.jsx)"]
    end

    subgraph Server ["Application & API Tier (FastAPI Async)"]
        API_Gateway["FastAPI Gateway / Router"]
        Triage_Engine["Deterministic Triage Engine (55% Wellness + 45% Workload)"]
        Subscale_Engine["Subscale Analyzer (DSI / TSI / OSI)"]
        Safety_Filter["AI Self-Audit & Crisis Guardrails"]
        Gemini_Service["Gemini Streaming Service (NDJSON)"]
    end

    subgraph ML_Tier ["Explainable Machine Learning Tier (Python / Scikit / TreeSHAP)"]
        LGBM["LightGBM Classifier (Supervised Research Signal)"]
        SHAP_Engine["TreeSHAP Exact Feature Attribution Engine"]
    end

    subgraph Persistence ["Persistence Layer (Neon Lakebase Postgres)"]
        DB[(PostgreSQL Database Pool)]
    end

    subgraph External ["External AI Provider"]
        Gemini_API["Google Gemini 3.5 Flash API"]
    end

    UI_Start -->|POST /api/sessions| API_Gateway
    UI_Pulse -->|POST /api/sih26186/wellness| API_Gateway
    UI_Duty -->|POST /api/sih26186/workload| API_Gateway
    UI_Triage -->|POST /api/sih26186/analyze| API_Gateway
    UI_Hist -->|GET /api/sih26186/history| API_Gateway
    UI_ML -->|POST /api/sih26186/ml/predict| API_Gateway
    UI_Chat -->|POST /api/chat streaming| API_Gateway

    API_Gateway --> Triage_Engine
    API_Gateway --> Subscale_Engine
    API_Gateway --> LGBM
    LGBM --> SHAP_Engine
    API_Gateway --> Safety_Filter
    Safety_Filter --> Gemini_Service
    Gemini_Service -->|Google GenAI SDK| Gemini_API
    API_Gateway --> DB
```

---

## 2. Four-Pillar Responsibility Governance

MindSetu enforces strict separation between statistical research signals, deterministic risk gating, and generative conversational support:

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                       AI RESPONSIBILITY BOUNDARIES                         │
├──────────────────────────┬─────────────────────────────────────────────────┤
│ Tier                     │ Explicit System Responsibility                  │
├──────────────────────────┼─────────────────────────────────────────────────┤
│ 1. Deterministic Engine  │ Authoritative Welfare Triage & Risk Tiering     │
│ 2. LightGBM Classifier   │ Supervised Research Signal & Pattern Discovery  │
│ 3. TreeSHAP Engine       │ Local & Global Feature Attribution (<15 ms)     │
│ 4. Google Gemini 3.5     │ Streaming Empathetic & Actionable Coping Chat   │
│ 5. Qualified Human       │ Actual Welfare Intervention & Medical Decisions │
└──────────────────────────┴─────────────────────────────────────────────────┘
```

---

## 3. Data Flow & Subscale Formulas

### 1. Wellbeing Pulse & Subscales
- **Depression Symptom Indicator (DSI)**:
  $$\text{DSI} = \frac{Q1 (\text{Exhaustion}) + Q4 (\text{Cognitive Fog}) + Q6 (\text{Duty Burden})}{9} \times 100$$
- **PTSD / Trauma Symptom Indicator (TSI)**:
  $$\text{TSI} = \frac{Q2 (\text{Hypervigilance}) + Q3 (\text{Detachment}) + Q5 (\text{Trauma Intrusion})}{9} \times 100$$

### 2. Operational Workload Index (OSI)
Combines duty hours, night duties, rest deficit, leave gap, intensity rating, high-pressure assignment, and duty changes into a normalized score out of 100.

### 3. Composite Triage Score & Bands
$$\text{Combined Score} = (0.55 \times \text{Wellness Score}) + (0.45 \times \text{Workload Score})$$

- **High Risk**: $\text{Combined} \ge 70 \lor \text{Wellness} \ge 80 \lor \text{Workload} \ge 85$
- **Moderate Risk**: $\text{Combined} \ge 45 \lor \text{Wellness} \ge 50 \lor \text{Workload} \ge 60$
- **Low Risk**: Otherwise.

---

## 4. Resilience & Fallback Architecture

1. **AI Latency Budget**: Gemini calls are wrapped in an 8-second thread timeout with automatic fallback to pre-compiled deterministic coping recommendations.
2. **Database Pooling**: Connections are pooled using `psycopg_pool` to ensure zero connection leaks under burst traffic.
3. **Session Privacy**: Anonymous UUIDv4 tokens prevent cross-session correlation without storing any personal identifiers.
