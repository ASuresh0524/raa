"""
FastAPI application for the Credentialing Passport system.
"""
from datetime import datetime
from typing import List

from fastapi import FastAPI, HTTPException, UploadFile, File, Query
from fastapi.middleware.cors import CORSMiddleware

from . import agents, data
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

app = FastAPI(title="Credentialing Passport API")

# Allow local dev frontends to communicate with the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage (replace with database in production)
_passports: dict[str, Passport] = {
    data.CURRENT_CLINICIAN_ID: data.SAMPLE_PASSPORT,
}
_workflows: dict[str, Workflow] = {}


@app.get("/api/ping")
def ping() -> dict[str, str]:
    """Basic readiness probe."""
    return {"status": "ok", "service": "Credentialing Passport API"}


@app.get("/api/passport/{clinician_id}", response_model=PassportResponse)
def get_passport(clinician_id: str) -> PassportResponse:
    """Get clinician passport with quality report and verification summary."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
    
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
def create_or_update_passport(passport: Passport) -> Passport:
    """Create or update a clinician passport."""
    passport.updated_at = datetime.utcnow()
    _passports[passport.clinician_id] = passport
    return passport


@app.post("/api/passport/{clinician_id}/authorize", response_model=Workflow)
def authorize_access(
    clinician_id: str,
    authorization: AuthorizationRequest,
) -> Workflow:
    """Authorize organization access and start credentialing workflow."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
    
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
    workflow_id = f"workflow-{clinician_id}-{authorization.destination_id}"
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
    
    _workflows[workflow_id] = workflow
    return workflow


@app.get("/api/workflow/{workflow_id}", response_model=WorkflowStatusResponse)
def get_workflow_status(workflow_id: str) -> WorkflowStatusResponse:
    """Get workflow status, timeline, and progress."""
    if workflow_id not in _workflows:
        raise HTTPException(status_code=404, detail="Workflow not found")
    
    workflow = _workflows[workflow_id]
    
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
    
    return WorkflowStatusResponse(
        workflow=workflow,
        timeline=timeline,
        progress_percentage=progress_percentage,
    )


@app.post("/api/workflow", response_model=Workflow)
def start_workflow(
    clinician_id: str = Query(...),
    destination_id: str = Query(...),
    destination_type: str = Query(...),
) -> Workflow:
    """Start a new credentialing workflow."""
    authorization = AuthorizationRequest(
        destination_id=destination_id,
        destination_type=destination_type,
    )
    return authorize_access(clinician_id, authorization)


@app.get("/api/requirements/{destination_id}", response_model=RequirementsChecklist)
def get_requirements(
    destination_id: str,
    clinician_id: str = Query(...),
    destination_type: str = Query(..., regex="^(hospital|group|staffing_firm|telehealth)$"),
) -> RequirementsChecklist:
    """Get requirements checklist for a destination."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
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
) -> dict:
    """Upload a supporting document to the passport."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
    
    # In production, store file in secure vault
    # For demo, just acknowledge receipt
    await file.read()
    
    from .models import Document
    document = Document(
        document_id=f"doc-{datetime.utcnow().timestamp()}",
        document_type=document_type,
        file_name=file.filename or "uploaded_file",
        upload_date=datetime.utcnow(),
        source_artifact=f"upload-{file.filename}",
    )
    
    passport.documents.append(document)
    passport.updated_at = datetime.utcnow()
    
    return {
        "status": "uploaded",
        "document_id": document.document_id,
        "message": f"Document {file.filename} uploaded successfully",
    }


@app.get("/api/verification/{verification_id}", response_model=VerificationSummary)
def get_verification(verification_id: str, clinician_id: str = Query(...)) -> VerificationSummary:
    """Get verification results for a clinician."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
    
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
) -> dict:
    """Submit payer enrollment application."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    # In production, generate payer-specific application and submit via portal
    # For demo, return submission confirmation
    return {
        "status": "submitted",
        "clinician_id": clinician_id,
        "payer_id": payer_id,
        "payer_name": payer_name,
        "submission_id": f"sub-{datetime.utcnow().timestamp()}",
        "submitted_at": datetime.utcnow().isoformat(),
        "message": f"Enrollment application submitted to {payer_name}",
    }


@app.get("/api/passport/{clinician_id}/quality", response_model=QualityReport)
def get_quality_report(clinician_id: str) -> QualityReport:
    """Get data quality report for a passport."""
    if clinician_id not in _passports:
        raise HTTPException(status_code=404, detail="Passport not found")
    
    passport = _passports[clinician_id]
    return agents.generate_quality_report(passport)
