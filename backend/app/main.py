"""
FastAPI application exposing the demo agents to the React frontend.
"""
from datetime import datetime
from time import perf_counter

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from . import agents, data
from .models import AgentPacket, TimingInfo, VoiceCommand, VoiceResponse, VoiceAction

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
    started = perf_counter()
    studies = data.STUDIES
    data_done = perf_counter()
    longitudinal = agents.generate_longitudinal(studies)
    guideline_recs = agents.generate_guideline_recs(studies)
    drafting_hints = agents.generate_drafting_hints(studies)
    agents_done = perf_counter()

    return AgentPacket(
        case_id=data.CURRENT_CASE_ID,
        studies=studies,
        longitudinal=longitudinal,
        guideline_recs=guideline_recs,
        drafting_hints=drafting_hints,
        timing=TimingInfo(
            data_collection_ms=int((data_done - started) * 1000),
            agent_processing_ms=int((agents_done - data_done) * 1000),
            generated_at=datetime.utcnow(),
        ),
    )


@app.post("/api/voice", response_model=VoiceResponse)
def voice_command(command: VoiceCommand) -> VoiceResponse:
    transcript = command.transcript.strip().lower()
    if not transcript:
        raise HTTPException(status_code=400, detail="Transcript required")

    actions: list[VoiceAction] = []
    narration_parts: list[str] = []

    if "open" in transcript or "show" in transcript:
        actions.append(
            VoiceAction(
                action="open_study",
                target="ct-chest-2024",
                message="Opening the most recent CT chest study.",
            )
        )
        narration_parts.append("Opening the latest CT chest in the primary viewport.")

    if "summarize" in transcript or "comparison" in transcript:
        summaries = agents.generate_longitudinal(data.STUDIES)
        if summaries:
            trending = summaries[0]
            actions.append(
                VoiceAction(
                    action="summarize",
                    target=trending.lesion,
                    message=trending.narrative,
                )
            )
            narration_parts.append(trending.narrative)

    if "guideline" in transcript or "follow-up" in transcript:
        recs = agents.generate_guideline_recs(data.STUDIES)
        if recs:
            rec = recs[0]
            actions.append(
                VoiceAction(
                    action="highlight",
                    target=rec.guideline,
                    message=rec.recommendation,
                )
            )
            narration_parts.append(
                f"According to {rec.guideline}, {rec.recommendation}"
            )

    if not actions:
        narration_parts.append(
            "I heard you, but this demo can only open studies, summarize changes, or recall guidelines."
        )

    return VoiceResponse(
        narration=" ".join(narration_parts),
        actions=actions,
    )

