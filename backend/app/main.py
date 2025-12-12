"""
FastAPI application exposing the demo agents to the React frontend.
"""
import io
from datetime import datetime
from time import perf_counter

from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from . import agents, data
from .models import (
    AgentPacket,
    TimingInfo,
    VoiceCommand,
    VoiceResponse,
    VoiceAction,
    PatientMemory,
    Report,
    ReportSection,
)

app = FastAPI(title="Radiology Action Assistant Demo")

# Allow local dev frontends to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory patient memory store (D2P: replace with local storage in production)
_patient_memory: dict[str, PatientMemory] = {}


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

    if "summarize" in transcript or "comparison" in transcript or "changes" in transcript:
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

    if "guideline" in transcript or "follow-up" in transcript or "recommend" in transcript:
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

    if "populate" in transcript or "fill" in transcript or "auto" in transcript:
        actions.append(
            VoiceAction(
                action="auto_populate",
                target="report",
                message="Auto-populating report sections with agent suggestions.",
            )
        )
        narration_parts.append("Populating report with findings and recommendations.")

    if not actions:
        narration_parts.append(
            "I heard you, but this demo can only open studies, summarize changes, recall guidelines, or populate reports."
        )

    return VoiceResponse(
        narration=" ".join(narration_parts),
        actions=actions,
    )


@app.post("/api/screen-capture")
async def process_screen_capture(
    file: UploadFile = File(...), patient_id: str | None = None
) -> dict:
    """Process uploaded screen capture for D2P workflow."""
    try:
        image_data = await file.read()
        Image.open(io.BytesIO(image_data))  # Validate image format
        
        # In production, use OCR/vision models here
        # For demo, return stub analysis
        return {
            "status": "processed",
            "patient_id": patient_id or "unknown",
            "detected_studies": len(data.STUDIES),
            "message": "Screen capture processed. Extracted study context.",
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")


@app.post("/api/patient-memory", response_model=PatientMemory)
def save_patient_memory(memory: PatientMemory) -> PatientMemory:
    """Store patient context for D2P workflow."""
    memory.last_updated = datetime.utcnow()
    _patient_memory[memory.patient_id] = memory
    return memory


@app.get("/api/patient-memory/{patient_id}", response_model=PatientMemory)
def get_patient_memory(patient_id: str) -> PatientMemory:
    """Retrieve stored patient context."""
    if patient_id not in _patient_memory:
        raise HTTPException(status_code=404, detail="Patient memory not found")
    return _patient_memory[patient_id]


@app.post("/api/report/generate", response_model=Report)
def generate_report(patient_id: str, study_id: str) -> Report:
    """Generate auto-populated report from agent suggestions."""
    studies = data.STUDIES  # In production, fetch from patient memory
    longitudinal = agents.generate_longitudinal(studies)
    guideline_recs = agents.generate_guideline_recs(studies)
    drafting_hints = agents.generate_drafting_hints(studies)

    sections: list[ReportSection] = []

    # Findings section
    findings_content = "; ".join(
        f"{h.suggestion}" for h in drafting_hints if h.section == "Findings"
    )
    if findings_content:
        sections.append(
            ReportSection(
                section="Findings",
                content=findings_content,
                source="auto",
                editable=True,
            )
        )

    # Comparison section from longitudinal
    if longitudinal:
        comp_text = " ".join(summary.narrative for summary in longitudinal)
        sections.append(
            ReportSection(
                section="Comparison",
                content=comp_text,
                source="auto",
                editable=True,
            )
        )

    # Impression section
    impression_parts = []
    for hint in drafting_hints:
        if hint.section == "Impression":
            impression_parts.append(hint.suggestion)
    if guideline_recs:
        impression_parts.append(
            f"Follow-up per {guideline_recs[0].guideline}: {guideline_recs[0].recommendation}"
        )
    if impression_parts:
        sections.append(
            ReportSection(
                section="Impression",
                content=" ".join(impression_parts),
                source="auto",
                editable=True,
            )
        )

    return Report(
        patient_id=patient_id,
        study_id=study_id,
        sections=sections,
        generated_at=datetime.utcnow(),
    )

