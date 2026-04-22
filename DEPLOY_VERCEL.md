# Deploy Full Stack on Vercel

This repo is configured for Vercel multi-service deploys from the root `vercel.json`:
- `frontend` (Next.js) is served at `/`
- `backend` (FastAPI) is served at `/api`

## 1) Import the repo in Vercel

1. Push this repo to GitHub.
2. In Vercel, click **New Project** and import this repo.
3. Keep **Root Directory** as `./` (repo root).
4. Confirm services:
   - `frontend` entrypoint: `frontend`, route prefix: `/`
   - `backend` entrypoint: `backend`, route prefix: `/api`
5. Deploy.

After deploy:
- App: `https://your-project.vercel.app`
- API health: `https://your-project.vercel.app/api/ping`

## 2) Environment Variables (optional)

- For same-domain deploy (recommended): no `NEXT_PUBLIC_API_BASE_URL` needed.
- Only set `NEXT_PUBLIC_API_BASE_URL` if your backend is hosted elsewhere.

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

