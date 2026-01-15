"""
Workflow Orchestrator Agent runtime.

Implements the "run in parallel, manage dependencies, produce timeline/ETA/exceptions"
layer described in docs/architecture.md.

This is a lightweight in-process orchestrator suitable for demo/local. In production,
replace with a real job queue + workers (RQ/Celery/Temporal).
"""

from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor, as_completed
from datetime import datetime
import uuid
from typing import Callable

from sqlalchemy.orm import Session

from . import agents
from .db_service import (
    add_audit_event,
    create_task_run,
    update_task_run,
)
from .models import Passport, Workflow, WorkflowStatus


def _event_id() -> str:
    return f"evt-{uuid.uuid4().hex[:12]}"


def _task_id(agent_name: str) -> str:
    return f"task-{agent_name.lower().replace(' ', '-')}-{uuid.uuid4().hex[:8]}"


def run_workflow(db: Session, workflow: Workflow, passport: Passport, payer_name: str | None = None) -> Workflow:
    """
    Run the core workflow:
    - requirements + gap analysis (already computed on creation)
    - quality check
    - verification (NPPES lookup if NPI present)
    - document ingestion/extraction stub (for any uploaded docs we know about at runtime)
    - payer enrollment submission stub (optional)
    - guardrails stub
    - evidence bundle creation
    - audit trail events for every step
    """

    workflow.updated_at = datetime.utcnow()

    add_audit_event(
        db,
        event_id=_event_id(),
        workflow_id=workflow.workflow_id,
        clinician_id=workflow.clinician_id,
        actor="agent:Workflow Orchestrator Agent",
        action="workflow.started",
        source="system",
        details={"destination_id": workflow.destination_id, "destination_type": workflow.destination_type},
    )

    # Map of agent runner callables. These should be idempotent.
    def run_quality():
        return agents.generate_quality_report(passport).model_dump()

    def run_verification():
        # Use NPI if present
        npi = None
        for loc in passport.enrollment.practice_locations:
            if loc.npi:
                npi = loc.npi
                break
        if not npi:
            return {
                "status": "exception",
                "reason": "No NPI present on passport enrollment.practice_locations",
                "citation_url": "https://npiregistry.cms.hhs.gov/api-page",
            }
        try:
            return {"status": "ok", "nppes": agents.primary_source_verify_nppes(npi)}
        except Exception as e:  # noqa: BLE001 - demo surface
            return {"status": "failed", "error": str(e), "citation_url": "https://npiregistry.cms.hhs.gov/api-page"}

    def run_documents_stub():
        # For demo: no direct file contents here; just produce extraction envelopes for known docs
        out = []
        for d in passport.documents:
            out.append(agents.document_ingestion_extract_stub(d.file_name, d.document_type))
        return {"status": "ok", "extractions": out}

    def run_payer_submission():
        if not payer_name:
            return {"status": "skipped"}
        return {"status": "ok", "submission": agents.payer_enrollment_submission_stub(payer_name)}

    def run_guardrails():
        return {"status": "ok", "guardrails": agents.billing_scheduling_guardrails_stub()}

    agent_jobs: list[tuple[str, Callable[[], dict]]] = [
        ("Data Quality & Consistency Agent", run_quality),
        ("Primary Source Verification Agent", run_verification),
        ("Document Ingestion & Data Extraction Agent", run_documents_stub),
        ("Payer Enrollment Submission Agent", run_payer_submission),
        ("Billing & Scheduling Guardrail Agent", run_guardrails),
    ]

    task_run_ids: dict[str, str] = {}
    for agent_name, _ in agent_jobs:
        tid = _task_id(agent_name)
        task_run_ids[agent_name] = tid
        create_task_run(db, tid, workflow.workflow_id, workflow.clinician_id, agent_name, status="pending")

    results: dict[str, dict] = {}
    exceptions: list[str] = []

    with ThreadPoolExecutor(max_workers=5) as pool:
        futures = {}
        for agent_name, fn in agent_jobs:
            tid = task_run_ids[agent_name]
            update_task_run(db, tid, status="running", started_at=datetime.utcnow())
            add_audit_event(
                db,
                event_id=_event_id(),
                workflow_id=workflow.workflow_id,
                clinician_id=workflow.clinician_id,
                actor=f"agent:{agent_name}",
                action="agent.started",
                source="system",
                details={"task_run_id": tid},
            )
            futures[pool.submit(fn)] = (agent_name, tid)

        for fut in as_completed(futures):
            agent_name, tid = futures[fut]
            try:
                out = fut.result()
            except Exception as e:  # noqa: BLE001
                out = {"status": "failed", "error": str(e)}

            results[agent_name] = out
            status = out.get("status", "ok")
            mapped_status = "completed"
            if status in ("failed",):
                mapped_status = "failed"
                exceptions.append(f"{agent_name}: {out.get('error', 'failed')}")
            elif status in ("exception",):
                mapped_status = "exception"
                exceptions.append(f"{agent_name}: {out.get('reason', 'exception')}")
            elif status in ("skipped",):
                mapped_status = "completed"

            update_task_run(
                db,
                tid,
                status=mapped_status,
                completed_at=datetime.utcnow(),
                output=out,
                exceptions=out if mapped_status in ("failed", "exception") else None,
            )

            add_audit_event(
                db,
                event_id=_event_id(),
                workflow_id=workflow.workflow_id,
                clinician_id=workflow.clinician_id,
                actor=f"agent:{agent_name}",
                action="agent.completed",
                source=out.get("source") if isinstance(out, dict) else None,
                details={"task_run_id": tid, "status": mapped_status},
            )

    # Evidence bundle (audit-ready)
    requirements = agents.generate_requirements_checklist(workflow.destination_id, workflow.destination_type, passport)
    quality_report = agents.generate_quality_report(passport)
    verifications = [results.get("Primary Source Verification Agent", {})]
    submissions = []
    if results.get("Payer Enrollment Submission Agent", {}).get("submission"):
        submissions.append(results["Payer Enrollment Submission Agent"]["submission"])

    evidence = agents.build_evidence_bundle(
        passport=passport,
        requirements=requirements,
        quality=quality_report,
        verifications=verifications,
        submissions=submissions,
    )

    workflow.exceptions = exceptions
    workflow.status = WorkflowStatus.COMPLETED if not exceptions else WorkflowStatus.PENDING_REVIEW
    workflow.updated_at = datetime.utcnow()

    add_audit_event(
        db,
        event_id=_event_id(),
        workflow_id=workflow.workflow_id,
        clinician_id=workflow.clinician_id,
        actor="agent:Audit Trail Agent",
        action="evidence_bundle.created",
        source="system",
        details={"keys": list(evidence.keys())},
    )

    # Store evidence bundle inside workflow_data (simple demo approach)
    wd = workflow.model_dump()
    wd["evidence_bundle"] = evidence
    # caller is responsible for persisting updated workflow_data
    workflow.__dict__["_evidence_bundle"] = evidence  # internal convenience
    return workflow




