# Radiology Action Assistant (RAA)

**D2P-Ready Screen-Native Multi-Agent Co-Pilot for Radiology**

RAA is a production-ready web application that enables radiologists to work with intelligent agents for longitudinal analysis, guideline recommendations, and voice-controlled workflow—all without requiring PACS integration.

## Features

### 🎯 D2P (Direct-to-Physician) Ready
- **Screen Capture/Upload**: Upload screenshots or paste images (Ctrl/Cmd+V) to extract study context
- **Patient Memory**: Store patient context locally for continuity across sessions
- **No Integration Required**: Works entirely through screen perception and local processing

### 🤖 Multi-Agent System
- **Screen Intelligence Agent**: Perceives on-screen studies and measurements
- **Longitudinal Agent**: Tracks lesion changes across timepoints with trend analysis
- **Guideline Agent**: Surfaces evidence-based recommendations (Fleischner, LI-RADS, etc.)
- **Drafting Agent**: Suggests report phrasing and ensures completeness
- **Voice Agent**: Hands-free commands for navigation, summarization, and auto-population

### 📝 Report Editor
- **Auto-Population**: Generate complete reports from agent suggestions with one click
- **Editable Sections**: Findings, Comparison, and Impression sections that you can refine
- **Source Tracking**: See which content came from agents vs. manual input

### 🎤 Voice-First Workflow
- **Auto-Execute**: Voice commands automatically trigger actions (no extra clicks)
- **Natural Language**: "Summarize changes", "Show guidelines", "Auto-populate report"
- **Browser Speech API**: Works in Chrome/Edge, with text fallback

## Prerequisites

- **Python 3.11+**
- **Node.js 20+** (Vite 7 requires Node ≥20.19.0)

## Quick Start

### Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## API Endpoints

- `GET /api/ping` – Health check
- `GET /api/case` – Get agent packet with studies, longitudinal analysis, guidelines, and drafting hints
- `POST /api/voice` – Process voice/text commands
- `POST /api/screen-capture` – Upload screenshot for processing
- `POST /api/patient-memory` – Save patient context
- `GET /api/patient-memory/{patient_id}` – Retrieve patient context
- `POST /api/report/generate` – Auto-generate report from agent suggestions

## Usage Workflow

1. **Upload Screen Capture**: Click "📷 Upload Screen" or paste an image to extract study context
2. **Set Patient ID**: Enter patient ID to enable context memory across sessions
3. **View Agent Analysis**: Switch to "Agent Suggestions" tab to see longitudinal trends, guidelines, and drafting hints
4. **Generate Report**: Click "Auto-Populate from Agents" to create a complete report
5. **Edit & Refine**: Modify any section in the Report Editor
6. **Voice Commands**: Use the microphone or type commands like "Summarize changes" or "Auto-populate report"

## Architecture

- **Backend**: FastAPI with rule-based agents (ready for ML model integration)
- **Frontend**: React + TypeScript with tabbed interface for Studies, Report Editor, and Agent Suggestions
- **Storage**: In-memory patient memory (replace with local storage for true D2P deployment)

## Roadmap

See `docs/roadmap.md` for D2P strategies, voice-first enhancements, and FDA-compliant model routing ideas.
