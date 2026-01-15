"""
Pydantic models for the Credentialing Passport system.
"""
from datetime import date, datetime
from typing import List, Literal, Optional
from enum import Enum

from pydantic import BaseModel, Field, EmailStr


class LicenseStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    EXPIRED = "expired"
    SUSPENDED = "suspended"
    REVOKED = "revoked"


class VerificationStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    VERIFIED = "verified"
    FAILED = "failed"
    EXCEPTION = "exception"


class WorkflowStatus(str, Enum):
    DRAFT = "draft"
    IN_PROGRESS = "in_progress"
    PENDING_REVIEW = "pending_review"
    APPROVED = "approved"
    REJECTED = "rejected"
    COMPLETED = "completed"


# Identity and Demographics
class Address(BaseModel):
    street: str
    city: str
    state: str
    zip_code: str
    country: str = "USA"
    start_date: date
    end_date: Optional[date] = None


class Identity(BaseModel):
    legal_name: str
    aliases: List[str] = Field(default_factory=list)
    date_of_birth: date
    ssn: Optional[str] = None  # Encrypted in production
    address_history: List[Address] = Field(default_factory=list)
    email: EmailStr
    phone: str


# Education and Training
class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_date: date
    end_date: date
    graduation_date: Optional[date] = None
    verified: bool = False


class Training(BaseModel):
    program_name: str
    institution: str
    specialty: str
    start_date: date
    end_date: date
    program_type: Literal["residency", "fellowship", "internship"]


# Work History
class WorkHistory(BaseModel):
    employer: str
    position: str
    start_date: date
    end_date: Optional[date] = None
    location: str
    verified: bool = False


class HospitalAffiliation(BaseModel):
    hospital_name: str
    appointment_type: str
    start_date: date
    end_date: Optional[date] = None
    privileges: List[str] = Field(default_factory=list)
    verified: bool = False


# Licenses
class StateLicense(BaseModel):
    state: str
    license_number: str
    license_type: str
    issue_date: date
    expiration_date: date
    status: LicenseStatus
    verified: bool = False
    verification_date: Optional[datetime] = None


class Licenses(BaseModel):
    state_licenses: List[StateLicense] = Field(default_factory=list)
    dea_number: Optional[str] = None
    dea_expiration: Optional[date] = None
    cds_registrations: List[str] = Field(default_factory=list)


# Board Certification
class BoardCertification(BaseModel):
    board_name: str
    specialty: str
    certification_number: str
    issue_date: date
    expiration_date: Optional[date] = None
    status: Literal["active", "expired", "lapsed"]
    moc_status: Optional[str] = None  # Maintenance of Certification
    verified: bool = False


# Malpractice
class MalpracticeClaim(BaseModel):
    claim_number: str
    date_of_incident: date
    date_closed: Optional[date] = None
    amount_paid: Optional[float] = None
    status: str


class Malpractice(BaseModel):
    carrier: str
    policy_number: str
    coverage_amount: float
    effective_date: date
    expiration_date: date
    claims_history: List[MalpracticeClaim] = Field(default_factory=list)
    loss_runs_available: bool = False


# Disclosures
class Disclosure(BaseModel):
    type: Literal["sanction", "disciplinary_action", "criminal", "dea_action"]
    description: str
    date: date
    jurisdiction: str
    status: str
    resolved: bool = False


# References
class Reference(BaseModel):
    name: str
    title: str
    organization: str
    email: EmailStr
    phone: str
    relationship: str
    contact_date: Optional[datetime] = None
    verified: bool = False


# Enrollment
class PracticeLocation(BaseModel):
    name: str
    address: Address
    npi: Optional[str] = None
    taxonomy_codes: List[str] = Field(default_factory=list)


class Enrollment(BaseModel):
    practice_locations: List[PracticeLocation] = Field(default_factory=list)
    ein: Optional[str] = None
    w9_on_file: bool = False
    eft_info: Optional[dict] = None
    specialties: List[str] = Field(default_factory=list)
    taxonomies: List[str] = Field(default_factory=list)


# Document
class Document(BaseModel):
    document_id: str
    document_type: str
    file_name: str
    upload_date: datetime
    source_artifact: str
    extracted_fields: dict = Field(default_factory=dict)
    verification_receipts: List[dict] = Field(default_factory=list)


# Passport
class Passport(BaseModel):
    clinician_id: str
    identity: Identity
    education: List[Education] = Field(default_factory=list)
    training: List[Training] = Field(default_factory=list)
    work_history: List[WorkHistory] = Field(default_factory=list)
    hospital_affiliations: List[HospitalAffiliation] = Field(default_factory=list)
    licenses: Licenses
    board_certifications: List[BoardCertification] = Field(default_factory=list)
    malpractice: Optional[Malpractice] = None
    disclosures: List[Disclosure] = Field(default_factory=list)
    references: List[Reference] = Field(default_factory=list)
    enrollment: Enrollment
    documents: List[Document] = Field(default_factory=list)
    created_at: datetime
    updated_at: datetime


# Verification
class VerificationResult(BaseModel):
    verification_id: str
    field_name: str
    source: str
    status: VerificationStatus
    verified_at: Optional[datetime] = None
    result: dict
    exception_reason: Optional[str] = None


# Requirements
class Requirement(BaseModel):
    requirement_id: str
    category: str
    description: str
    required: bool
    status: Literal["pending", "complete", "exception"]
    source: Optional[str] = None


class RequirementsChecklist(BaseModel):
    destination_id: str
    destination_type: Literal["hospital", "group", "staffing_firm", "telehealth"]
    requirements: List[Requirement] = Field(default_factory=list)
    generated_at: datetime


# Workflow
class WorkflowStep(BaseModel):
    step_id: str
    agent_name: str
    status: WorkflowStatus
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    exception_reason: Optional[str] = None


class Workflow(BaseModel):
    workflow_id: str
    clinician_id: str
    destination_id: str
    destination_type: str
    status: WorkflowStatus
    steps: List[WorkflowStep] = Field(default_factory=list)
    exceptions: List[str] = Field(default_factory=list)
    eta: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    # Optional: audit-ready evidence bundle produced by Audit Trail Agent
    evidence_bundle: Optional[dict] = None


# Agent Outputs
class QualityIssue(BaseModel):
    field_name: str
    issue_type: Literal["missing", "inconsistent", "expired", "conflict"]
    severity: Literal["low", "medium", "high", "critical"]
    description: str
    suggested_fix: Optional[str] = None


class QualityReport(BaseModel):
    clinician_id: str
    issues: List[QualityIssue] = Field(default_factory=list)
    completeness_score: float
    generated_at: datetime


class VerificationSummary(BaseModel):
    verification_id: str
    category: str
    status: VerificationStatus
    verified_count: int
    failed_count: int
    exception_count: int
    results: List[VerificationResult] = Field(default_factory=list)


# API Response Models
class PassportResponse(BaseModel):
    passport: Passport
    quality_report: Optional[QualityReport] = None
    verification_summary: Optional[VerificationSummary] = None


class WorkflowStatusResponse(BaseModel):
    workflow: Workflow
    timeline: List[dict] = Field(default_factory=list)
    progress_percentage: float
    task_runs: List[dict] = Field(default_factory=list)
    audit_events: List[dict] = Field(default_factory=list)


class AuthorizationRequest(BaseModel):
    destination_id: str
    destination_type: str
    scoped_permissions: List[str] = Field(default_factory=list)


class DocumentUpload(BaseModel):
    document_type: str
    file_name: str
    file_data: str  # Base64 encoded


class TimingInfo(BaseModel):
    data_collection_ms: int
    agent_processing_ms: int
    generated_at: datetime
