#!/bin/bash
# Start Cloudflare tunnel for Streamlit app

echo "🚀 Starting Cloudflare tunnel..."
echo "📡 Connecting to http://localhost:8501"
echo ""
echo "⏳ Establishing connection..."
echo ""

# Start tunnel and capture URL
cloudflared tunnel --url http://localhost:8501 2>&1 | while IFS= read -r line; do
    echo "$line"
    # Cloudflared outputs the URL in a specific format
    if [[ "$line" == *"https://"* ]]; then
        echo ""
        echo "✅ ========================================="
        echo "✅ YOUR PUBLIC URL:"
        echo "✅ $line"
        echo "✅ ========================================="
        echo ""
        echo "📋 Share this URL with anyone!"
        echo "🛑 Press Ctrl+C to stop the tunnel"
    fi
done



