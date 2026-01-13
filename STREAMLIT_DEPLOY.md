# Streamlit Deployment Guide

## Quick Start

### Local Development

1. **Install Streamlit dependencies:**
```bash
pip install -r requirements.txt
```

2. **Start the FastAPI backend** (in one terminal):
```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload --port 8000
```

3. **Start the Streamlit app** (in another terminal):
```bash
streamlit run streamlit_app.py
```

The app will open at `http://localhost:8501`

## Streamlit Cloud Deployment

### Option 1: Deploy Streamlit App Only (Backend Separate)

1. **Push your code to GitHub**

2. **Go to [share.streamlit.io](https://share.streamlit.io)**

3. **Connect your GitHub repository**

4. **Configure deployment:**
   - **Main file path:** `streamlit_app.py`
   - **Python version:** 3.10 or 3.11

5. **Add secrets** (in Streamlit Cloud dashboard):
   ```
   API_BASE_URL = "https://your-backend-api.com"
   ```

6. **Deploy!**

### Option 2: Deploy Both Backend and Frontend Together

#### Using Docker (Recommended)

Create a `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements
COPY requirements.txt .
COPY backend/requirements.txt backend/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy application code
COPY . .

# Expose ports
EXPOSE 8000 8501

# Start both services
CMD sh -c "cd backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 & streamlit run streamlit_app.py --server.port 8501 --server.address 0.0.0.0"
```

#### Using Railway/Render/Fly.io

1. **Set up backend service** (FastAPI on port 8000)
2. **Set up frontend service** (Streamlit on port 8501)
3. **Set environment variables:**
   - `API_BASE_URL` pointing to backend service URL

## Configuration

### Environment Variables

Create `.streamlit/secrets.toml` (for local) or add to Streamlit Cloud secrets:

```toml
API_BASE_URL = "http://localhost:8000"  # Local
# API_BASE_URL = "https://your-api.com"  # Production
```

### Backend API URL

The Streamlit app connects to the FastAPI backend. Make sure:

1. **Local:** Backend runs on `http://localhost:8000`
2. **Production:** Backend is deployed and accessible
3. **CORS:** Backend allows requests from Streamlit domain

Update backend CORS in `backend/app/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8501",  # Local Streamlit
        "https://your-app.streamlit.app",  # Streamlit Cloud
        "*"  # For development only
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Features

The Streamlit app provides:

- ✅ **Passport List** - View all clinician passports
- ✅ **Create Passport** - Create new credentialing passports
- ✅ **View Passport** - Detailed passport view with tabs
- ✅ **Workflows** - Track credentialing workflows
- ✅ **Quality Reports** - Data quality validation

## Troubleshooting

### Backend Connection Issues

If you see "Cannot connect to backend API":

1. Check backend is running: `curl http://localhost:8000/api/ping`
2. Verify `API_BASE_URL` in secrets
3. Check CORS settings in backend
4. For Streamlit Cloud, ensure backend URL is publicly accessible

### Database Issues

The backend uses SQLite by default. For production:

1. Set `DATABASE_URL` environment variable
2. Use PostgreSQL: `DATABASE_URL=postgresql://user:pass@host/db`
3. Initialize database: `python -c "from app.database import init_db; init_db()"`

## Production Checklist

- [ ] Deploy FastAPI backend to cloud service
- [ ] Set up PostgreSQL database
- [ ] Configure CORS for Streamlit domain
- [ ] Add authentication (JWT tokens)
- [ ] Set up file storage (S3, etc.)
- [ ] Configure environment variables
- [ ] Set up monitoring and logging
- [ ] Enable HTTPS
- [ ] Test all features end-to-end

## Alternative: Single App Deployment

You can also embed the FastAPI app directly in Streamlit using `st.components.v1.html` or run both in the same process, but separate services is recommended for production.

