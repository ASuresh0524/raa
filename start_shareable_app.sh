#!/bin/bash
# Start backend, Streamlit, and tunnel for sharing

echo "🩺 Credentialing Passport - Starting Shareable App"
echo "=================================================="
echo ""

# Check if backend is running
if ! lsof -ti:8000 > /dev/null 2>&1; then
    echo "🚀 Starting backend..."
    cd backend
    source .venv/bin/activate
    uvicorn app.main:app --reload --port 8000 --host 0.0.0.0 > /tmp/backend.log 2>&1 &
    cd ..
    sleep 3
    echo "✅ Backend started on http://localhost:8000"
else
    echo "✅ Backend already running"
fi

# Check if Streamlit is running
if ! lsof -ti:8501 > /dev/null 2>&1; then
    echo "🚀 Starting Streamlit..."
    streamlit run streamlit_app.py --server.headless=true --server.port=8501 > /tmp/streamlit.log 2>&1 &
    sleep 3
    echo "✅ Streamlit started on http://localhost:8501"
else
    echo "✅ Streamlit already running"
fi

echo ""
echo "🌐 Starting Cloudflare tunnel..."
echo "=================================================="
echo ""
echo "⏳ Establishing connection..."
echo ""

# Start tunnel - it will output the URL
cloudflared tunnel --url http://localhost:8501



