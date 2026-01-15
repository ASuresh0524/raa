# Share Your Credentialing Passport App

## Quick Start - Share Locally

### Option 1: Cloudflare Tunnel (Recommended - Public URL)

1. **Make sure backend and Streamlit are running:**
   ```bash
   # Terminal 1 - Backend
   cd backend
   source .venv/bin/activate
   uvicorn app.main:app --reload --port 8000
   
   # Terminal 2 - Streamlit  
   streamlit run streamlit_app.py
   ```

2. **Start the tunnel (Terminal 3):**
   ```bash
   cloudflared tunnel --url http://localhost:8501
   ```

3. **Copy the URL** that appears (looks like `https://xxxxx.trycloudflare.com`)

4. **Share that URL** with anyone! They can access your app from anywhere.

5. **To stop:** Press `Ctrl+C` in the tunnel terminal

### Option 2: Local Network Sharing

If you're on the same Wi-Fi network:

1. **Find your local IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Or simpler
   ipconfig getifaddr en0
   ```

2. **Start Streamlit with network access:**
   ```bash
   streamlit run streamlit_app.py --server.address 0.0.0.0 --server.port 8501
   ```

3. **Share:** `http://YOUR_IP:8501` (e.g., `http://192.168.1.20:8501`)

### Option 3: All-in-One Script

Run the helper script:
```bash
./start_shareable_app.sh
```

This will:
- Start backend if not running
- Start Streamlit if not running  
- Start Cloudflare tunnel
- Show you the public URL

## Current Status

✅ **Backend:** http://localhost:8000  
✅ **Streamlit:** http://localhost:8501  
🌐 **Public URL:** Check tunnel output

## Troubleshooting

**Tunnel not showing URL?**
- Make sure Streamlit is running: `lsof -ti:8501`
- Check tunnel logs for errors
- Try restarting: `pkill cloudflared && cloudflared tunnel --url http://localhost:8501`

**Backend connection errors?**
- Verify backend is running: `curl http://localhost:8000/api/ping`
- Check `.streamlit/secrets.toml` has correct `API_BASE_URL`

**Port already in use?**
- Kill existing processes: `pkill -f "uvicorn|streamlit|cloudflared"`
- Or use different ports

## Security Note

⚠️ The Cloudflare tunnel creates a **public URL** that anyone with the link can access. For production, add authentication!



