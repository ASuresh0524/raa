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
from .database import SessionLocal, get_db, init_db
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
    FormPopulateRequest,
    FormPopulateResponse,
    PassportEmailRequest,
    PassportEmailResponse,
)
from .forms import populate_state_form
from . import email_service

# In-memory demo state for vendor HIPAA / lab-ingest simulation (local demo only).
_vendor_demo_state: dict[str, dict] = {}


def updated_workflow(db: Session, workflow_id: str, workflow: Workflow) -> None:
    """Persist updated workflow into DB (helper)."""
    update_workflow(db, workflow_id, workflow)


def ensure_demo_seed() -> None:
    """
    Ensure deterministic demo data is always present for end-to-end fetch demos.
    """
    db = SessionLocal()
    try:
        sample = data.create_sample_passport()
        existing = get_passport_db(db, sample.clinician_id)
        if existing:
            update_passport(db, sample.clinician_id, sample)
        else:
            create_passport(db, sample)
    finally:
        db.close()


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
        ensure_demo_seed()
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
        "http://localhost:8080",
        "http://127.0.0.1:8080",
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


@app.get("/api/demo/document-guidance")
def document_guidance_demo() -> dict:
    """
    Static guidance for the live HTML demo: who usually supplies each artifact and how to obtain it.
    """
    return {
        "items": [
            {
                "id": "malpractice_coi",
                "title": "Malpractice certificate of insurance",
                "typically_provided_by": "Clinician (from carrier) or employer if tail covered",
                "how_to_obtain": "Request current COI from your malpractice carrier portal (e.g. NORCAL, MedPro) or HR if hospital-sponsored. Ensure limits and dates match payer minimums.",
            },
            {
                "id": "privilege_letter",
                "title": "Hospital privilege verification letter",
                "typically_provided_by": "Organization (Medical Staff Office)",
                "how_to_obtain": "Ask the hospital Medical Staff Office for a verification of active privileges on letterhead. Often submitted through symplr/Verity or hospital credentialing portal.",
            },
            {
                "id": "dea",
                "title": "DEA registration",
                "typically_provided_by": "Clinician",
                "how_to_obtain": "Download from DEA Diversion; confirm address matches NPI practice location for payer matching.",
            },
            {
                "id": "state_license",
                "title": "State medical license",
                "typically_provided_by": "Clinician (PSV from board)",
                "how_to_obtain": "Verify via state board website or API where available (e.g. CA DCA search). Passport should store number + expiration.",
            },
            {
                "id": "pecos_reassign",
                "title": "PECOS enrollment + reassignment",
                "typically_provided_by": "Joint: clinician signs; org signs reassignment acceptance",
                "how_to_obtain": "Individual completes PECOS; group signs reassignment in PECOS when adding to Medicare billing entity. Credentialing team coordinates sequencing.",
            },
            {
                "id": "references",
                "title": "Professional references",
                "typically_provided_by": "Clinician coordinates; peers respond",
                "how_to_obtain": "Send secure questionnaire links to department chief or peers listed in work history; track in portal.",
            },
            {
                "id": "temp_priv_packet",
                "title": "Temporary privileges packet",
                "typically_provided_by": "Organization decision; clinician supplies evidence",
                "how_to_obtain": "Assemble clean license, DEA, core privileges request, FPPE plan. Joint Commission caps new applicant temp priv at 120 consecutive days — document rationale.",
            },
            {
                "id": "background_check_vendor",
                "title": "Background check (criminal / employment / SSN trace)",
                "typically_provided_by": "Vendor pays screening company; employer may reimburse",
                "how_to_obtain": "Order through approved CVO vendor list; 7–14 days common. Passport agent should ingest final PDF into vault after HIPAA release.",
            },
            {
                "id": "drug_screen_clinic",
                "title": "Drug screen (clinic requisition)",
                "typically_provided_by": "Clinician at lab; employer or vendor coordinates ticket",
                "how_to_obtain": "Use hospital/staffing requisition at network lab; upload PDF or have results routed to passport with authorization.",
            },
        ]
    }


def _vendor_demo_get(clinician_id: str) -> dict:
    if clinician_id not in _vendor_demo_state:
        _vendor_demo_state[clinician_id] = {
            "clinician_id": clinician_id,
            "hipaa_release_signed": False,
            "lab_agent_ingested": False,
            "background_agent_ingested": False,
            "events": [],
        }
    return _vendor_demo_state[clinician_id]


@app.get("/api/demo/vendor-strategy")
def vendor_strategy_demo() -> dict:
    """Narrative for demos: hospitals vs vendors, plug-and-play CVO, pricing wedge."""
    return {
        "pull_quote": (
            "Replacing a hospital's credentialing system as a startup would be like moving mountains — "
            "so we plug the passport into whatever they already use."
        ),
        "hospital_reality": [
            "Hospitals hold leverage; they often do not pay for vendor-side credentialing tools.",
            "They pick CVO systems for accreditation fit and usability — migration cost is enormous.",
            "Distribution and trust come from the hospital; revenue can come from vendors who need speed.",
        ],
        "vendor_value": [
            "Locums, staffing, and clinical vendors pay because time-to-case-coverage is revenue.",
            "Charge vendors lightly; win on volume and activation speed.",
            "Export/adapters place passport evidence into Symplr, Medallion, and other shapes without manual re-upload per portal.",
        ],
        "hipaa_labs": [
            "Lab and screening artifacts are PHI — HIPAA-grade handling and BAAs.",
            "Signup includes HIPAA authorization so agents can ingest results on behalf of the user.",
            "Document-ingestion agents reduce 'download PDF → upload to ten portals' work.",
        ],
        "security": "Encryption, access control, audit trails, and minimum necessary — non-negotiable for enterprise and delegated credentialing.",
    }


@app.get("/api/demo/background-check-flow")
def background_check_flow_demo() -> dict:
    """Side-by-side: typical vendor friction vs passport-oriented path (demo narrative)."""
    return {
        "typical_today": [
            "Screening vendor runs SSN-based background (7–14 days); vendor/clinician pays, seeks reimbursement.",
            "Separate clinic drug screen with employer ticket; clinician retrieves PDF.",
            "Some vendors bundle drug + background; others require two uploads.",
            "Clinician manually uploads each file into each hospital credentialing portal.",
            "Opaque rejections → re-upload loops → delayed facility access and case coverage.",
        ],
        "with_passport": [
            "HIPAA release at signup authorizes receipt and processing of lab/screening artifacts.",
            "Agents ingest PDFs into the vault with provenance and timestamps.",
            "Pre-flight QA catches gaps before submission to any CVO.",
            "Export packs map the same evidence into each hospital's system shape.",
            "Goal: fewer manual hops and faster path to approved-for-access.",
        ],
    }


@app.get("/api/demo/market-positioning")
def market_positioning_demo() -> dict:
    """
    Product narrative: canonical record + submission/compliance orchestration (CAQH, PECOS, NCQA).
    Single source for HTML demo and Figma when API_BASE is set.
    """
    return {
        "title": "Master record & orchestration",
        "subtitle": "Why a credentialing passport can be very large — CAQH, PECOS, NCQA",
        "thesis": [
            (
                "The stack is fragmented. Providers and groups already use CAQH-style flows to enter "
                "information once and share it with participating plans and organizations — but they still "
                "run Medicare enrollment and updates in PECOS, payer-specific processes, verification "
                "requirements, and internal credentialing review in parallel."
            ),
            (
                "The passport is not just document storage. It is the canonical source of truth for "
                "provider and group data, then generating the right packet for each downstream destination "
                "and tracking what was submitted, what is missing, and what must be re-attested."
            ),
        ],
        "hospital_capabilities": [
            "Maintain one canonical provider profile and one group profile.",
            "Auto-generate the right packet for each payer, CVO, hospital, and enrollment portal.",
            "Track what was submitted, when, by whom, and what is still missing.",
            "Manage re-attestations, expirables, sanctions monitoring, and re-credentialing cycles.",
            "Preserve audit trail and evidence for credentialing and accreditation expectations.",
        ],
        "trust_note": (
            "NCQA-aligned buyers still expect primary source verification, committee review, and ongoing "
            "monitoring. Software can collect information and support workflow, but the organization remains "
            "accountable for compliant credentialing — a passport that only exports data is weaker than one "
            "that supports verification, committee-ready packets, and operational workflow."
        ),
        "positioning_tagline": (
            "Use us as the master provider identity and credentialing record; we sync or submit into "
            "CAQH-shaped flows, PECOS, payer rosters, and hospital credentialing systems while tracking "
            "the full status layer on top."
        ),
        "why_it_lands": (
            "It promises less duplicate entry, lower admin burden, and better data quality — the same class "
            "of pain CAQH markets against — while owning orchestration across channels, not another silo."
        ),
        "ugly_parts": [
            "Credential matching across sources and destinations.",
            "Missing-field and completeness logic.",
            "Payer- and destination-specific requirements.",
            "Signatures, attestations, and document freshness.",
            "Delegated roster and trading-partner formats.",
            "Workflow orchestration when a portal cannot be fully automated.",
        ],
        "bottom_line": (
            "The winning product is not a wallet for credentials — it is a passport plus submission "
            "and compliance orchestration layer."
        ),
        "maps_to_product": [
            "Provider Truth Graph",
            "Export / adapter packs",
            "Pre-flight QA",
            "Primary source verification workflows",
            "Committee and temp-priv modules",
            "Audit-ready evidence",
        ],
        "sources": [
            {"label": "CAQH", "url": "https://www.caqh.org/"},
            {"label": "NCQA", "url": "https://www.ncqa.org/"},
        ],
    }


@app.get("/api/demo/vendor/status")
def vendor_demo_status(clinician_id: str = Query("clinician-001")) -> dict:
    """Demo: HIPAA + simulated agent ingest flags for the selected clinician."""
    return _vendor_demo_get(clinician_id)


@app.post("/api/demo/vendor/sign-hipaa")
def vendor_demo_sign_hipaa(clinician_id: str = Query("clinician-001")) -> dict:
    """Demo: record that the user accepted HIPAA authorization for lab/background handling."""
    s = _vendor_demo_get(clinician_id)
    s["hipaa_release_signed"] = True
    s["events"].append({"at": datetime.utcnow().isoformat(), "type": "hipaa_release_signed"})
    return s


@app.post("/api/demo/vendor/simulate-lab-agent")
def vendor_demo_simulate_lab_agent(clinician_id: str = Query("clinician-001")) -> dict:
    """Demo: pretend the ingestion agent pulled drug-screen / lab PDF into the passport."""
    s = _vendor_demo_get(clinician_id)
    if not s.get("hipaa_release_signed"):
        raise HTTPException(
            status_code=400,
            detail="Demo gate: sign HIPAA release first (POST /api/demo/vendor/sign-hipaa).",
        )
    s["lab_agent_ingested"] = True
    s["events"].append(
        {
            "at": datetime.utcnow().isoformat(),
            "type": "document_ingestion_agent",
            "artifact": "drug_screen_pdf_stub",
        }
    )
    return s


@app.post("/api/demo/vendor/simulate-background-agent")
def vendor_demo_simulate_background_agent(clinician_id: str = Query("clinician-001")) -> dict:
    """Demo: pretend the agent ingested a consolidated background report."""
    s = _vendor_demo_get(clinician_id)
    if not s.get("hipaa_release_signed"):
        raise HTTPException(
            status_code=400,
            detail="Demo gate: sign HIPAA release first (POST /api/demo/vendor/sign-hipaa).",
        )
    s["background_agent_ingested"] = True
    s["events"].append(
        {
            "at": datetime.utcnow().isoformat(),
            "type": "document_ingestion_agent",
            "artifact": "background_check_report_stub",
        }
    )
    return s


@app.get("/api/email/status")
def email_status() -> dict:
    """Whether SMTP is configured (actual sends) vs log-only mode."""
    return {
        "smtp_configured": email_service.smtp_configured(),
        "mode": "smtp" if email_service.smtp_configured() else "log_only",
        "hint": "Set SMTP_HOST (and SMTP_USER/SMTP_PASSWORD) to send real mail; otherwise emails are logged only.",
    }


@app.post("/api/email/send-passport", response_model=PassportEmailResponse)
def send_passport_email(payload: PassportEmailRequest, db: Session = Depends(get_db)) -> PassportEmailResponse:
    """
    Send (or log) an email built from the clinician passport — e.g. summaries, nudges, workflow-complete notices.
    """
    db_passport = get_passport_db(db, payload.clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")

    passport = Passport(**db_passport.passport_data)
    workflow = None
    if payload.workflow_id:
        db_wf = get_workflow_db(db, payload.workflow_id)
        if not db_wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        if db_wf.clinician_id != payload.clinician_id:
            raise HTTPException(status_code=400, detail="Workflow does not belong to this clinician")
        workflow = Workflow(**db_wf.workflow_data)

    if payload.template == "employer_missing_documents":
        quality = agents.generate_quality_report(passport)
        subject, text_body, html_body = email_service.build_employer_missing_docs_email(
            passport, quality, workflow=workflow, note=payload.note
        )
    else:
        subject, text_body, html_body = email_service.build_passport_summary_email(
            passport,
            payload.template,
            workflow=workflow,
            note=payload.note,
        )
    status, msg = email_service.send_html_email(payload.to, subject, text_body, html_body)
    if status == "failed":
        raise HTTPException(status_code=502, detail=msg)

    return PassportEmailResponse(
        status=status,
        message=msg,
        mode="smtp" if email_service.smtp_configured() else "log_only",
    )


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


@app.post("/api/forms/populate", response_model=FormPopulateResponse)
def populate_state_form_endpoint(payload: FormPopulateRequest, db: Session = Depends(get_db)) -> FormPopulateResponse:
    """
    Populate state-specific credentialing form fields using passport data.
    """
    db_passport = get_passport_db(db, payload.clinician_id)
    if not db_passport:
        raise HTTPException(status_code=404, detail="Passport not found")
    passport = Passport(**db_passport.passport_data)
    filled = populate_state_form(payload.state, passport)
    if payload.workflow_id:
        db_wf = get_workflow_db(db, payload.workflow_id)
        if not db_wf:
            raise HTTPException(status_code=404, detail="Workflow not found")
        workflow = Workflow(**db_wf.workflow_data)
        evidence = workflow.evidence_bundle or {}
        forms = evidence.get("populated_forms", [])
        forms.append(
            {
                "state": filled.get("state"),
                "form_name": filled.get("form_name"),
                "fields": jsonable_encoder(filled.get("fields", {})),
                "populated_at": datetime.utcnow().isoformat(),
            }
        )
        evidence["populated_forms"] = forms
        evidence["latest_populated_form"] = forms[-1]
        workflow.evidence_bundle = evidence
        workflow.updated_at = datetime.utcnow()
        update_workflow(db, payload.workflow_id, workflow)
    return FormPopulateResponse(**filled)
