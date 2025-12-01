# Radiology Action Assistant (RAA)

Screen-native, multi-agent co-pilot demo for longitudinal and context-aware radiology interpretation. The repo contains:

- `backend/`: FastAPI service that simulates the Screen Intelligence, Change-Detection, Guideline, and Drafting agents with rule-based logic and stubbed studies.
- `frontend/`: Vite + React UI that mimics a PACS layout with agent overlays for quick pitch demos.

## Prerequisites

- **Python 3.11+**
- **Node.js 20+** (Vite 7 requires Node ≥20.19.0; upgrade locally if you see engine warnings.)

## Backend (FastAPI)

```bash
cd /Users/aakashsuresh/raa/backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

The API exposes:

- `GET /api/ping` – health check.
- `GET /api/case` – returns the aggregated agent packet consumed by the UI.

## Frontend (React + Vite)

```bash
cd /Users/aakashsuresh/raa/frontend
npm install
npm run dev
```

By default the UI proxies `/api/*` to `http://localhost:8000`. To point elsewhere, set `VITE_API_BASE_URL`.

## Demo Script

1. Open the frontend at `http://localhost:5173`.
2. Walk through the left “Studies on screen” column (mimics baseline and follow-up CTs with measurements).
3. Highlight the right sidebar agents:
   - **Longitudinal** card auto-narrates growth using DAG-inspired deltas.
   - **Guideline** card surfaces inline Fleischner recommendations with links.
   - **Drafting** card suggests comparison/impression phrasing.

Everything runs locally with stub data, so you can screen record or live demo without PACS access. Extend the backend stubs or add more agents as needed for your storyline.
