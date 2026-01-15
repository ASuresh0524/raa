# Deploy Frontend on Vercel

## 1) Deploy Backend (FastAPI) First

Deploy `backend/` to Render, Railway, or Fly.io.

Set:
- `DATABASE_URL` (Postgres recommended)
- `CORS` already allows `*.vercel.app`

Example health check:
```
https://your-backend.example.com/api/ping
```

## 2) Deploy Frontend (Next.js) to Vercel

1. Push this repo to GitHub.
2. In Vercel, import the repo.
3. Set **Root Directory** = `frontend`.
4. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` = `https://your-backend.example.com`
5. Deploy.

Vercel will give you a public URL:
```
https://your-project.vercel.app
```

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

