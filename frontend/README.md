# MindSetu Frontend

Modern React 19 + Vite frontend for the **MindSetu** personnel welfare support prototype (SIH26186).

---

## 1. Quick Start

```bash
# Install dependencies
npm ci

# Start development server
npm run dev
```

The frontend runs locally on `http://localhost:5173` and connects to the FastAPI backend at `http://127.0.0.1:8000`.

---

## 2. Core User Journey

```
Start Screen (Anonymous Consent)
       ↓
Wellness Pulse (6-Item Check-In)
       ↓
Workload & Duty Context (Shift Hours, Night Duties, Recovery)
       ↓
Deterministic Welfare Triage Dashboard (55% Wellness + 45% Workload)
       ↓
Research Lab Modal (LightGBM Inference + TreeSHAP Waterfall XAI)
       ↓
MindSetu AI Companion (Google Gemini 2.5 Flash Streaming NDJSON)
       ↓
Crisis Escalation (Tele-MANAS 14416 & KIRAN 1800-599-0019)
```

---

## 3. UI/UX & Design System Features

- **Integrated Capsule Composer**: Auto-growing prompt input with circular send action, keyboard shortcuts (<kbd>Enter</kbd> / <kbd>Shift</kbd>+<kbd>Enter</kbd>).
- **Rich Suggestion Cards**: 2x2 responsive grid on desktop, single-column stack on mobile with full context descriptions.
- **Editorial Conversational Typography**: Clean line spacing, structured bullet lists, copy-to-clipboard actions with checkmark feedback.
- **Dark & Light Mode Polish**: Comprehensive CSS custom property tokens with high-contrast accessibility (`:focus-visible`, screen reader `.sr-only`).

---

## 4. Development & Build Verification

```bash
# Verify production build compilation
npm run build

# Run linter
npm run lint
```
