"""
Vercel serverless entry for FastAPI.

Routes all /api/* traffic to the same ASGI app (see vercel.json).
"""
from __future__ import annotations

import sys
from pathlib import Path

_BACKEND_ROOT = Path(__file__).resolve().parent.parent / "backend"
if str(_BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(_BACKEND_ROOT))

from app.main import app  # noqa: E402 — Vercel expects ASGI `app`
