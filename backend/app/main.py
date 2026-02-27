"""
FastAPI application for the Credentialing Passport system.
"""
from datetime import datetime
from typing import List, Optional
import uuid
import os

from fastapi import FastAPI, HTTPException, UploadFile, File, Query, Depends, BackgroundTasks
from fastapi.encoders import jsonable_encoder
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from . import agents, data
from .orchestrator import run_workflow
from .database import get_db, init_db
from .db_service import (
    create_passport,
    get_passport as get_passport_db,
    update_passport,
    list_passports,
    create_workflow,
    get_workflow as get_workflow_db,
    update_workflow,
    list_workflows,
    save_document,
    list_task_runs,
    list_audit_events,
)
from .models import (
    Passport,
    PassportResponse,
    QualityReport,
    RequirementsChecklist,
    VerificationSummary,
    VerificationResult,
    VerificationStatus,
    Workflow,
    WorkflowStatus,
    WorkflowStatusResponse,
    AuthorizationRequest,
)


def updated_workflow(db: Session, workflow_id: str, workflow: Workflow) -> None:
    """Persist updated workflow into DB (helper)."""
    update_workflow(db, workflow_id, workflow)

app = FastAPI(
    title="Credentialing Passport API",
    description="Universal clinician credentialing and enrollment platform",
    version="1.0.0",
)

# Initialize database on startup
@app.on_event("startup")
def startup_event():
    try:
        init_db()
    except Exception as e:  # noqa: BLE001 - surface startup errors in Render logs
        print(f"Database init failed: {e}")
        raise

# Allow local dev frontends to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8501",
        "http://127.0.0.1:8501",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],  # Allow all in dev
    allow_origin_regex=r"^https:\/\/.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/ping")
def ping() -> dict[str, str]:
    """Basic readiness probe."""
    return {"status": "ok", "service": "Credentialing Passport API", "version": "1.0.0"}


@app.get("/api/passports", response_model=List[Passport])
def list_all_passports(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """List all passports."""
    db_passports = list_passports(db, skip=skip, limit=limit)
    return [Passport(**p.passport_data) for p in db_passports]


@app.post("/api/demo/seed", response_model=Passport)
@app.get("/api/demo/seed", response_model=Passport)
def seed_demo_passport(db: Session = Depends(get_db)) -> Passport:
    """
    Seed a demo passport for quick testing (architecture-aligned sample).
    """
    try:
        sample = data.create_sample_passport()
        existing = get_passport_db(db, sample.clinician_id)
        if existing:
            update_passport(db, sample.clinician_id, sample)
        else:
            create_passport(db, sample)
        return sample
    except Exception as e:  # noqa: BLE001 - surface error for deploy diagnostics
        raise HTTPException(status_code=500, detail=f"Seed failed: {e}")


@app.get("/api/passport/{clinician_id}", response_model=PassportResponse)
def get_passport(clinician_id: str, db: Session = Depends(get_db)) -> PassportResponse:
    """Get clinician passport with quality report and verification summary."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = Passport(**db_passport.passport_data)
    
    # Generate quality report
    quality_report = agents.generate_quality_report(passport)
    
    # Generate mock verifications
    verifications: List[VerificationResult] = []
    for license in passport.licenses.state_licenses:
        verifications.append(
            VerificationResult(
                verification_id=f"verify-{license.state}-{license.license_number}",
                field_name=f"licenses.state_licenses.{license.state}",
                source="State Licensing Board",
                status=VerificationStatus.VERIFIED if license.verified else VerificationStatus.PENDING,
                verified_at=license.verification_date,
                result={"status": license.status.value, "expiration": str(license.expiration_date)},
            )
        )
    
    verification_summary = agents.generate_verification_summary(passport, verifications)
    
    return PassportResponse(
        passport=passport,
        quality_report=quality_report,
        verification_summary=verification_summary,
    )


@app.post("/api/passport", response_model=Passport)
def create_or_update_passport(passport: Passport, db: Session = Depends(get_db)) -> Passport:
    """Create or update a clinician passport."""
    passport.updated_at = datetime.utcnow()
    
    # Check if exists
    existing = get_passport_db(db, passport.clinician_id)
    if existing:
        update_passport(db, passport.clinician_id, passport)
    else:
        create_passport(db, passport)
    
    return passport


@app.post("/api/passport/{clinician_id}/authorize", response_model=Workflow)
def authorize_access(
    clinician_id: str,
    authorization: AuthorizationRequest,
    db: Session = Depends(get_db),
) -> Workflow:
    """Authorize organization access and start credentialing workflow."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = Passport(**db_passport.passport_data)
    
    # Generate requirements checklist
    requirements = agents.generate_requirements_checklist(
        authorization.destination_id,
        authorization.destination_type,
        passport,
    )
    
    # Generate workflow steps
    steps = agents.generate_workflow_steps(
        authorization.destination_type,
        requirements,
    )
    
    # Create workflow
    workflow_id = f"wf-{uuid.uuid4().hex[:12]}"
    workflow = Workflow(
        workflow_id=workflow_id,
        clinician_id=clinician_id,
        destination_id=authorization.destination_id,
        destination_type=authorization.destination_type,
        status=WorkflowStatus.IN_PROGRESS,
        steps=steps,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    
    create_workflow(db, workflow)
    return workflow


@app.post("/api/demo/workflow", response_model=Workflow)
@app.get("/api/demo/workflow", response_model=Workflow)
def demo_workflow_run(
    destination_id: str = Query("demo-hospital"),
    destination_type: str = Query("hospital"),
    payer_name: str | None = Query(None),
    db: Session = Depends(get_db),
) -> Workflow:
    """
    Create + run a demo workflow for the sample passport.
    """

    try:
        sample = data.create_sample_passport()
        existing = get_passport_db(db, sample.clinician_id)
        if existing:
            update_passport(db, sample.clinician_id, sample)
        else:
            create_passport(db, sample)

        authorization = AuthorizationRequest(
            destination_id=destination_id,
            destination_type=destination_type,
            scoped_permissions=[],
        )
        workflow = authorize_access(sample.clinician_id, authorization, db)
        updated = run_workflow(db, workflow, sample, payer_name=payer_name)
        wf_dump = jsonable_encoder(updated.model_dump())
        if getattr(updated, "_evidence_bundle", None):
            wf_dump["evidence_bundle"] = jsonable_encoder(getattr(updated, "_evidence_bundle"))
        updated_workflow(db, workflow.workflow_id, Workflow(**wf_dump))
        return Workflow(**wf_dump)
    except Exception as e:  # noqa: BLE001
        raise HTTPException(status_code=500, detail=f"Demo workflow failed: {e}")


@app.post("/api/workflow/{workflow_id}/run", response_model=Workflow)
def run_workflow_now(
    workflow_id: str,
    background: BackgroundTasks,
    payer_name: str | None = None,
    db: Session = Depends(get_db),
) -> Workflow:
    """
    Trigger the Workflow Orchestrator Agent execution.
    For demo: runs synchronously unless background execution is desired.
    """
    db_wf = get_workflow_db(db, workflow_id)
    if not db_wf:
        raise HTTPException(status_code=404, detail="Workflow not found")

    db_passport = get_passport_db(db, db_wf.clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")

    workflow = Workflow(**db_wf.workflow_data)
    passport = Passport(**db_passport.passport_data)

    # Run in-process (fast demo). You can switch to background for long workflows.
    updated = run_workflow(db, workflow, passport, payer_name=payer_name)
    # Persist updated workflow_data + evidence bundle
    wf_dump = jsonable_encoder(updated.model_dump())
    if getattr(updated, "_evidence_bundle", None):
        wf_dump["evidence_bundle"] = jsonable_encoder(getattr(updated, "_evidence_bundle"))
    updated_workflow(db, workflow_id, Workflow(**wf_dump))
    return Workflow(**wf_dump)


@app.get("/api/workflows", response_model=List[Workflow])
def list_all_workflows(
    clinician_id: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    """List workflows, optionally filtered by clinician."""
    db_workflows = list_workflows(db, clinician_id=clinician_id, skip=skip, limit=limit)
    return [Workflow(**w.workflow_data) for w in db_workflows]


@app.get("/api/workflow/{workflow_id}", response_model=WorkflowStatusResponse)
def get_workflow_status(workflow_id: str, db: Session = Depends(get_db)) -> WorkflowStatusResponse:
    """Get workflow status, timeline, and progress."""
    db_workflow = get_workflow_db(db, workflow_id)
    if not db_workflow:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = Workflow(**db_workflow.workflow_data)
    
    # Calculate progress
    completed_steps = sum(1 for step in workflow.steps if step.status == WorkflowStatus.COMPLETED)
    total_steps = len(workflow.steps)
    progress_percentage = (completed_steps / total_steps * 100) if total_steps > 0 else 0
    
    # Generate timeline
    timeline = []
    for step in workflow.steps:
        timeline.append({
            "step_id": step.step_id,
            "agent_name": step.agent_name,
            "status": step.status.value,
            "started_at": step.started_at.isoformat() if step.started_at else None,
            "completed_at": step.completed_at.isoformat() if step.completed_at else None,
        })
    
    task_runs = [
        {
            "task_run_id": tr.task_run_id,
            "agent_name": tr.agent_name,
            "status": tr.status,
            "started_at": tr.started_at.isoformat() if tr.started_at else None,
            "completed_at": tr.completed_at.isoformat() if tr.completed_at else None,
            "output": tr.output,
            "exceptions": tr.exceptions,
        }
        for tr in list_task_runs(db, workflow_id)
    ]

    audit_events = [
        {
            "event_id": e.event_id,
            "actor": e.actor,
            "action": e.action,
            "source": e.source,
            "details": e.details,
            "created_at": e.created_at.isoformat() if e.created_at else None,
        }
        for e in list_audit_events(db, workflow_id=workflow_id)
    ]

    return WorkflowStatusResponse(
        workflow=workflow,
        timeline=timeline,
        progress_percentage=progress_percentage,
        task_runs=task_runs,
        audit_events=audit_events,
    )


@app.post("/api/workflow", response_model=Workflow)
def start_workflow(
    clinician_id: str = Query(...),
    destination_id: str = Query(...),
    destination_type: str = Query(...),
    db: Session = Depends(get_db),
) -> Workflow:
    """Start a new credentialing workflow."""
    authorization = AuthorizationRequest(
        destination_id=destination_id,
        destination_type=destination_type,
    )
    return authorize_access(clinician_id, authorization, db)


@app.get("/api/requirements/{destination_id}", response_model=RequirementsChecklist)
def get_requirements(
    destination_id: str,
    clinician_id: str = Query(...),
    destination_type: str = Query(..., regex="^(hospital|group|staffing_firm|telehealth)$"),
    db: Session = Depends(get_db),
) -> RequirementsChecklist:
    """Get requirements checklist for a destination."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = Passport(**db_passport.passport_data)
    return agents.generate_requirements_checklist(
        destination_id,
        destination_type,
        passport,
    )


@app.post("/api/documents/upload")
async def upload_document(
    clinician_id: str = Query(...),
    document_type: str = Query(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
) -> dict:
    """Upload a supporting document to the passport."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join(os.getcwd(), "uploads", clinician_id)
    os.makedirs(upload_dir, exist_ok=True)
    
    # Save file
    file_path = os.path.join(upload_dir, file.filename or "uploaded_file")
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)
    
    # Save document metadata
    document = save_document(
        db,
        clinician_id,
        document_type,
        file.filename or "uploaded_file",
        file_path,
        {"size": len(content), "content_type": file.content_type},
    )
    
    return {
        "status": "uploaded",
        "document_id": document.document_id,
        "message": f"Document {file.filename} uploaded successfully",
    }


@app.get("/api/verification/{verification_id}", response_model=VerificationSummary)
def get_verification(verification_id: str, clinician_id: str = Query(...), db: Session = Depends(get_db)) -> VerificationSummary:
    """Get verification results for a clinician."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = Passport(**db_passport.passport_data)
    
    # Generate mock verifications
    verifications: List[VerificationResult] = []
    for license in passport.licenses.state_licenses:
        verifications.append(
            VerificationResult(
                verification_id=f"verify-{license.state}-{license.license_number}",
                field_name=f"licenses.state_licenses.{license.state}",
                source="State Licensing Board",
                status=VerificationStatus.VERIFIED if license.verified else VerificationStatus.PENDING,
                verified_at=license.verification_date,
                result={"status": license.status.value, "expiration": str(license.expiration_date)},
            )
        )
    
    return agents.generate_verification_summary(passport, verifications)


@app.post("/api/enrollment/submit")
def submit_enrollment(
    clinician_id: str = Query(...),
    payer_id: str = Query(...),
    payer_name: str = Query(...),
    db: Session = Depends(get_db),
) -> dict:
    """Submit payer enrollment application."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    # In production, generate payer-specific application and submit via portal
    # For demo, return submission confirmation
    return {
        "status": "submitted",
        "clinician_id": clinician_id,
        "payer_id": payer_id,
        "payer_name": payer_name,
        "submission_id": f"sub-{uuid.uuid4().hex[:12]}",
        "submitted_at": datetime.utcnow().isoformat(),
        "message": f"Enrollment application submitted to {payer_name}",
    }


@app.get("/api/passport/{clinician_id}/quality", response_model=QualityReport)
def get_quality_report(clinician_id: str, db: Session = Depends(get_db)) -> QualityReport:
    """Get data quality report for a passport."""
    db_passport = get_passport_db(db, clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = Passport(**db_passport.passport_data)
    return agents.generate_quality_report(passport)
