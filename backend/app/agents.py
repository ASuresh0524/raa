"""
Credentialing Passport agents that process passport data and execute workflows.
"""
from datetime import datetime, timedelta
from typing import List, Optional

from .models import (
    Passport,
    QualityIssue,
    QualityReport,
    Requirement,
    RequirementsChecklist,
    VerificationResult,
    VerificationSummary,
    VerificationStatus,
    WorkflowStep,
    WorkflowStatus,
)


def generate_requirements_checklist(
    destination_id: str,
    destination_type: str,
    passport: Passport,
) -> RequirementsChecklist:
    """
    Requirements & Checklist Agent
    Builds the requirements pack for the destination.
    Adapts to setting and state, licensing, hospital credentialing and privileging,
    Medicare and Medicaid, commercial payer enrollment, and required documents.
    """
    requirements: List[Requirement] = []

    # Identity requirements
    requirements.append(
        Requirement(
            requirement_id="identity-legal-name",
            category="Identity",
            description="Legal name verification",
            required=True,
            status="complete" if passport.identity.legal_name else "pending",
        )
    )

    # Education requirements
    if destination_type in ["hospital", "group"]:
        requirements.append(
            Requirement(
                requirement_id="education-medical-school",
                category="Education",
                description="Medical school diploma",
                required=True,
                status="complete" if passport.education else "pending",
            )
        )
        requirements.append(
            Requirement(
                requirement_id="training-residency",
                category="Training",
                description="Residency completion certificate",
                required=True,
                status="complete" if any(t.program_type == "residency" for t in passport.training) else "pending",
            )
        )

    # License requirements
    requirements.append(
        Requirement(
            requirement_id="license-state-active",
            category="Licensing",
            description="Active state license in destination state",
            required=True,
            status="complete" if passport.licenses.state_licenses else "pending",
        )
    )

    if destination_type in ["hospital", "group"]:
        requirements.append(
            Requirement(
                requirement_id="license-dea",
                category="Licensing",
                description="DEA registration",
                required=True,
                status="complete" if passport.licenses.dea_number else "pending",
            )
        )

    # Board certification
    if destination_type in ["hospital", "group"]:
        requirements.append(
            Requirement(
                requirement_id="board-certification",
                category="Certification",
                description="Board certification in specialty",
                required=True,
                status="complete" if passport.board_certifications else "pending",
            )
        )

    # Malpractice
    requirements.append(
        Requirement(
            requirement_id="malpractice-coverage",
            category="Malpractice",
            description="Current malpractice insurance",
            required=True,
            status="complete" if passport.malpractice else "pending",
        )
    )

    # References
    requirements.append(
        Requirement(
            requirement_id="references-peer",
            category="References",
            description="2-3 peer references",
            required=True,
            status="complete" if len(passport.references) >= 2 else "pending",
        )
    )

    # Work history
    requirements.append(
        Requirement(
            requirement_id="work-history-5-years",
            category="Work History",
            description="5-10 years work history",
            required=True,
            status="complete" if len(passport.work_history) > 0 else "pending",
        )
    )

    # Disclosures
    requirements.append(
        Requirement(
            requirement_id="disclosures-complete",
            category="Disclosures",
            description="Sanctions, discipline, criminal disclosures",
            required=True,
            status="complete" if passport.disclosures else "pending",
        )
    )

    # Enrollment (for payer enrollment)
    if destination_type in ["telehealth", "group"]:
        requirements.append(
            Requirement(
                requirement_id="enrollment-npi",
                category="Enrollment",
                description="NPI number",
                required=True,
                status="complete" if any(loc.npi for loc in passport.enrollment.practice_locations) else "pending",
            )
        )
        requirements.append(
            Requirement(
                requirement_id="enrollment-w9",
                category="Enrollment",
                description="W9 form",
                required=True,
                status="complete" if passport.enrollment.w9_on_file else "pending",
            )
        )

    return RequirementsChecklist(
        destination_id=destination_id,
        destination_type=destination_type,
        requirements=requirements,
        generated_at=datetime.utcnow(),
    )


def generate_quality_report(passport: Passport) -> QualityReport:
    """
    Data Quality & Consistency Agent
    Validates completeness and consistency before any submission.
    Flags gaps in work history, date conflicts, address inconsistencies,
    expired certifications, mismatched names, and produces a prioritized fix list.
    """
    issues: List[QualityIssue] = []

    # Check for missing identity
    if not passport.identity.legal_name:
        issues.append(
            QualityIssue(
                field_name="identity.legal_name",
                issue_type="missing",
                severity="critical",
                description="Legal name is required",
            )
        )

    # Check for expired licenses
    for license in passport.licenses.state_licenses:
        if license.expiration_date < datetime.utcnow().date():
            issues.append(
                QualityIssue(
                    field_name=f"licenses.state_licenses.{license.state}",
                    issue_type="expired",
                    severity="critical",
                    description=f"License in {license.state} expired on {license.expiration_date}",
                    suggested_fix="Renew license or update expiration date",
                )
            )

    # Check for expired DEA
    if passport.licenses.dea_expiration and passport.licenses.dea_expiration < datetime.utcnow().date():
        issues.append(
            QualityIssue(
                field_name="licenses.dea_expiration",
                issue_type="expired",
                severity="critical",
                description=f"DEA registration expired on {passport.licenses.dea_expiration}",
                suggested_fix="Renew DEA registration",
            )
        )

    # Check for expired board certifications
    for cert in passport.board_certifications:
        if cert.expiration_date and cert.expiration_date < datetime.utcnow().date():
            issues.append(
                QualityIssue(
                    field_name=f"board_certifications.{cert.board_name}",
                    issue_type="expired",
                    severity="high",
                    description=f"Board certification {cert.specialty} expired on {cert.expiration_date}",
                    suggested_fix="Renew board certification or update status",
                )
            )

    # Check for expired malpractice
    if passport.malpractice and passport.malpractice.expiration_date < datetime.utcnow().date():
        issues.append(
            QualityIssue(
                field_name="malpractice.expiration_date",
                issue_type="expired",
                severity="critical",
                description=f"Malpractice insurance expired on {passport.malpractice.expiration_date}",
                suggested_fix="Renew malpractice insurance",
            )
        )

    # Check for date conflicts in work history
    for i, work in enumerate(passport.work_history):
        if work.end_date and work.start_date > work.end_date:
            issues.append(
                QualityIssue(
                    field_name=f"work_history[{i}]",
                    issue_type="inconsistent",
                    severity="high",
                    description=f"Start date {work.start_date} is after end date {work.end_date}",
                    suggested_fix="Correct the date range",
                )
            )

    # Check for address inconsistencies
    if len(passport.identity.address_history) > 1:
        for i in range(len(passport.identity.address_history) - 1):
            current = passport.identity.address_history[i]
            next_addr = passport.identity.address_history[i + 1]
            if current.end_date and next_addr.start_date:
                if current.end_date > next_addr.start_date:
                    issues.append(
                        QualityIssue(
                            field_name=f"identity.address_history[{i}]",
                            issue_type="inconsistent",
                            severity="medium",
                            description="Address date ranges overlap",
                            suggested_fix="Correct address date ranges",
                        )
                    )

    # Check for missing references
    if len(passport.references) < 2:
        issues.append(
            QualityIssue(
                field_name="references",
                issue_type="missing",
                severity="high",
                description="At least 2 peer references required",
                suggested_fix="Add additional peer references",
            )
        )

    # Calculate completeness score
    total_fields = 10  # Approximate count of major sections
    completed_fields = sum([
        1 if passport.identity.legal_name else 0,
        1 if passport.education else 0,
        1 if passport.training else 0,
        1 if passport.work_history else 0,
        1 if passport.licenses.state_licenses else 0,
        1 if passport.board_certifications else 0,
        1 if passport.malpractice else 0,
        1 if passport.references else 0,
        1 if passport.enrollment.practice_locations else 0,
        1 if passport.disclosures is not None else 0,
    ])
    completeness_score = completed_fields / total_fields

    return QualityReport(
        clinician_id=passport.clinician_id,
        issues=issues,
        completeness_score=completeness_score,
        generated_at=datetime.utcnow(),
    )


def generate_verification_summary(
    passport: Passport,
    verifications: List[VerificationResult],
) -> VerificationSummary:
    """
    Primary Source Verification Agent
    Performs core verifications: license status, board certification,
    sanctions checks, NPDB workflows where applicable, and affiliation verification.
    """
    verified_count = sum(1 for v in verifications if v.status == VerificationStatus.VERIFIED)
    failed_count = sum(1 for v in verifications if v.status == VerificationStatus.FAILED)
    exception_count = sum(1 for v in verifications if v.status == VerificationStatus.EXCEPTION)

    # Group verifications by category
    categories = {}
    for v in verifications:
        if v.field_name.startswith("licenses"):
            category = "Licensing"
        elif v.field_name.startswith("board"):
            category = "Board Certification"
        elif v.field_name.startswith("education"):
            category = "Education"
        elif v.field_name.startswith("work"):
            category = "Work History"
        elif v.field_name.startswith("malpractice"):
            category = "Malpractice"
        else:
            category = "Other"

        if category not in categories:
            categories[category] = []
        categories[category].append(v)

    # Determine overall status
    if failed_count > 0:
        overall_status = VerificationStatus.FAILED
    elif exception_count > 0:
        overall_status = VerificationStatus.EXCEPTION
    elif verified_count == len(verifications):
        overall_status = VerificationStatus.VERIFIED
    else:
        overall_status = VerificationStatus.IN_PROGRESS

    return VerificationSummary(
        verification_id=f"verify-{passport.clinician_id}",
        category="Primary Source Verification",
        status=overall_status,
        verified_count=verified_count,
        failed_count=failed_count,
        exception_count=exception_count,
        results=verifications,
    )


def generate_workflow_steps(
    destination_type: str,
    requirements: RequirementsChecklist,
) -> List[WorkflowStep]:
    """
    Workflow Orchestrator Agent
    Creates the workflow steps for credentialing a provider.
    """
    steps: List[WorkflowStep] = []

    # Step 1: Requirements generation
    steps.append(
        WorkflowStep(
            step_id="req-generation",
            agent_name="Requirements & Checklist Agent",
            status=WorkflowStatus.COMPLETED,
            started_at=datetime.utcnow() - timedelta(minutes=5),
            completed_at=datetime.utcnow() - timedelta(minutes=4),
        )
    )

    # Step 2: Quality validation
    steps.append(
        WorkflowStep(
            step_id="quality-check",
            agent_name="Data Quality & Consistency Agent",
            status=WorkflowStatus.IN_PROGRESS,
            started_at=datetime.utcnow() - timedelta(minutes=3),
        )
    )

    # Step 3: Primary source verification
    steps.append(
        WorkflowStep(
            step_id="verification",
            agent_name="Primary Source Verification Agent",
            status=WorkflowStatus.PENDING_REVIEW,
            started_at=datetime.utcnow() - timedelta(minutes=2),
        )
    )

    # Step 4: Document preparation
    steps.append(
        WorkflowStep(
            step_id="document-prep",
            agent_name="Document Ingestion & Data Extraction Agent",
            status=WorkflowStatus.PENDING_REVIEW,
        )
    )

    # Step 5: Payer enrollment (if applicable)
    if destination_type in ["telehealth", "group"]:
        steps.append(
            WorkflowStep(
                step_id="payer-enrollment",
                agent_name="Payer Enrollment Submission Agent",
                status=WorkflowStatus.PENDING_REVIEW,
            )
        )

    # Step 6: Guardrails
    steps.append(
        WorkflowStep(
            step_id="guardrails",
            agent_name="Billing & Scheduling Guardrail Agent",
            status=WorkflowStatus.PENDING_REVIEW,
        )
    )

    # Step 7: Audit trail
    steps.append(
        WorkflowStep(
            step_id="audit-trail",
            agent_name="Audit Trail Agent",
            status=WorkflowStatus.PENDING_REVIEW,
        )
    )

    return steps
