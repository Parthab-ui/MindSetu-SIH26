# MindSetu Frontend

React 19 + Vite frontend for the MindSetu SIH 2026 prototype.

## Run locally

```bash
npm ci
npm run dev
```

The frontend currently talks to the FastAPI backend at `http://127.0.0.1:8000`.

## Useful checks

```bash
npm run lint
npm run build
```

`npm run build` is the quickest way to verify that the presentation build is production-compilable before a mentor demo.

## Main user journey

Home → anonymous session → PHQ-9 → GAD-7 → risk/support → AI companion → mood tracking → counsellors/appointments → dashboard.

See [`../docs/SIH_DEMO_GUIDE.md`](../docs/SIH_DEMO_GUIDE.md) for the recommended presentation flow.
