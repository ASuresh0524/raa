# Deploy Full Stack on Vercel

This repo uses a **root `vercel.json`** with two builds:

- **Next.js** (`frontend/`) is served at `/`
- **FastAPI** is exposed via `api/index.py`; all `/api/*` requests are routed to that single ASGI app (same pattern as a monolithic backend).

## 1) Import the repo in Vercel

1. Push this repo to GitHub.
2. In Vercel, click **New Project** and import this repo.
3. Set **Root Directory** to **`.`** (repository root). Do **not** set it to `frontend` only.
4. Deploy. (Framework / install commands from the dashboard may be ignored when `vercel.json` includes `builds`; that is expected.)

After deploy:

- App: `https://your-project.vercel.app`
- API health: `https://your-project.vercel.app/api/ping`

## 2) Environment Variables (optional)

- **Same deploy:** leave `NEXT_PUBLIC_API_BASE_URL` unset so the UI calls `/api/*` on the same host.
- **Separate backend:** set `NEXT_PUBLIC_API_BASE_URL` to your external API origin.

## 3) Local Dev

```bash
# Terminal 1
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2
cd frontend
npm install
npm run dev
```

Open: http://localhost:3000

