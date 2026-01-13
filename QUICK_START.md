# Quick Start Guide

## 🚀 Streamlit App (Easiest to Deploy)

### Local Run

1. **Start Backend:**
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

2. **Start Streamlit (new terminal):**
```bash
streamlit run streamlit_app.py
```

3. **Open:** http://localhost:8501

### Deploy to Streamlit Cloud

1. **Push to GitHub:**
```bash
git add .
git commit -m "Add Streamlit app"
git push
```

2. **Deploy:**
   - Go to https://share.streamlit.io
   - Sign in with GitHub
   - Click "New app"
   - Select your repository
   - Main file: `streamlit_app.py`
   - Python version: 3.10 or 3.11

3. **Add Secret:**
   - In Streamlit Cloud dashboard → Settings → Secrets
   - Add: `API_BASE_URL = "https://your-backend-url.com"`

4. **Deploy Backend Separately:**
   - Deploy FastAPI to Railway/Render/Fly.io
   - Update `API_BASE_URL` secret to point to deployed backend

## 📋 Current Status

✅ **Backend:** Running on http://localhost:8000  
✅ **Streamlit:** Running on http://localhost:8501  
✅ **React:** Running on http://localhost:5173 (optional)

## 🎯 Features Available

- ✅ Create and manage clinician passports
- ✅ View passport details with tabs
- ✅ Upload documents
- ✅ Start credentialing workflows
- ✅ View quality reports
- ✅ Track workflow progress

## 📚 Documentation

- **Streamlit Deployment:** See `STREAMLIT_DEPLOY.md`
- **Production Guide:** See `PRODUCTION.md`
- **Architecture:** See `docs/architecture.md`
- **Data Sources:** See `docs/data-sources.md`

