"""
FastAPI application exposing the demo agents to the React frontend.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from . import agents, data
from .models import AgentPacket

app = FastAPI(title="Radiology Action Assistant Demo")

# Allow local dev frontends to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ping")
def ping() -> dict[str, str]:
    """Basic readiness probe."""
    return {"status": "ok"}


@app.get("/api/case", response_model=AgentPacket)
def get_case() -> AgentPacket:
    """
    Aggregate data from the stub studies and run each rule-based agent once.
    """
    studies = data.STUDIES
    return AgentPacket(
        case_id=data.CURRENT_CASE_ID,
        studies=studies,
        longitudinal=agents.generate_longitudinal(studies),
        guideline_recs=agents.generate_guideline_recs(studies),
        drafting_hints=agents.generate_drafting_hints(studies),
    )

