// Credentialing Passport TypeScript types

export type LicenseStatus = 'active' | 'inactive' | 'expired' | 'suspended' | 'revoked'
export type VerificationStatus = 'pending' | 'in_progress' | 'verified' | 'failed' | 'exception'
export type WorkflowStatus = 'draft' | 'in_progress' | 'pending_review' | 'approved' | 'rejected' | 'completed'

export type Address = {
  street: string
  city: string
  state: string
  zip_code: string
  country?: string
  start_date: string
  end_date?: string
}

export type Identity = {
  legal_name: string
  aliases: string[]
  date_of_birth: string
  ssn?: string
  address_history: Address[]
  email: string
  phone: string
}

export type Education = {
  institution: string
  degree: string
  field_of_study: string
  start_date: string
  end_date: string
  graduation_date?: string
  verified: boolean
}

export type Training = {
  program_name: string
  institution: string
  specialty: string
  start_date: string
  end_date: string
  program_type: 'residency' | 'fellowship' | 'internship'
}

export type WorkHistory = {
  employer: string
  position: string
  start_date: string
  end_date?: string
  location: string
  verified: boolean
}

export type HospitalAffiliation = {
  hospital_name: string
  appointment_type: string
  start_date: string
  end_date?: string
  privileges: string[]
  verified: boolean
}

export type StateLicense = {
  state: string
  license_number: string
  license_type: string
  issue_date: string
  expiration_date: string
  status: LicenseStatus
  verified: boolean
  verification_date?: string
}

export type Licenses = {
  state_licenses: StateLicense[]
  dea_number?: string
  dea_expiration?: string
  cds_registrations: string[]
}

export type BoardCertification = {
  board_name: string
  specialty: string
  certification_number: string
  issue_date: string
  expiration_date?: string
  status: 'active' | 'expired' | 'lapsed'
  moc_status?: string
  verified: boolean
}

export type MalpracticeClaim = {
  claim_number: string
  date_of_incident: string
  date_closed?: string
  amount_paid?: number
  status: string
}

export type Malpractice = {
  carrier: string
  policy_number: string
  coverage_amount: number
  effective_date: string
  expiration_date: string
  claims_history: MalpracticeClaim[]
  loss_runs_available: boolean
}

export type Disclosure = {
  type: 'sanction' | 'disciplinary_action' | 'criminal' | 'dea_action'
  description: string
  date: string
  jurisdiction: string
  status: string
  resolved: boolean
}

export type Reference = {
  name: string
  title: string
  organization: string
  email: string
  phone: string
  relationship: string
  contact_date?: string
  verified: boolean
}

export type PracticeLocation = {
  name: string
  address: Address
  npi?: string
  taxonomy_codes: string[]
}

export type Enrollment = {
  practice_locations: PracticeLocation[]
  ein?: string
  w9_on_file: boolean
  eft_info?: Record<string, unknown>
  specialties: string[]
  taxonomies: string[]
}

export type Document = {
  document_id: string
  document_type: string
  file_name: string
  upload_date: string
  source_artifact: string
  extracted_fields: Record<string, unknown>
  verification_receipts: Record<string, unknown>[]
}

export type Passport = {
  clinician_id: string
  identity: Identity
  education: Education[]
  training: Training[]
  work_history: WorkHistory[]
  hospital_affiliations: HospitalAffiliation[]
  licenses: Licenses
  board_certifications: BoardCertification[]
  malpractice?: Malpractice
  disclosures: Disclosure[]
  references: Reference[]
  enrollment: Enrollment
  documents: Document[]
  created_at: string
  updated_at: string
}

export type QualityIssue = {
  field_name: string
  issue_type: 'missing' | 'inconsistent' | 'expired' | 'conflict'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  suggested_fix?: string
}

export type QualityReport = {
  clinician_id: string
  issues: QualityIssue[]
  completeness_score: number
  generated_at: string
}

export type VerificationResult = {
  verification_id: string
  field_name: string
  source: string
  status: VerificationStatus
  verified_at?: string
  result: Record<string, unknown>
  exception_reason?: string
}

export type VerificationSummary = {
  verification_id: string
  category: string
  status: VerificationStatus
  verified_count: number
  failed_count: number
  exception_count: number
  results: VerificationResult[]
}

export type Requirement = {
  requirement_id: string
  category: string
  description: string
  required: boolean
  status: 'pending' | 'complete' | 'exception'
  source?: string
}

export type RequirementsChecklist = {
  destination_id: string
  destination_type: 'hospital' | 'group' | 'staffing_firm' | 'telehealth'
  requirements: Requirement[]
  generated_at: string
}

export type WorkflowStep = {
  step_id: string
  agent_name: string
  status: WorkflowStatus
  started_at?: string
  completed_at?: string
  exception_reason?: string
}

export type Workflow = {
  workflow_id: string
  clinician_id: string
  destination_id: string
  destination_type: string
  status: WorkflowStatus
  steps: WorkflowStep[]
  exceptions: string[]
  eta?: string
  created_at: string
  updated_at: string
}

export type PassportResponse = {
  passport: Passport
  quality_report?: QualityReport
  verification_summary?: VerificationSummary
}

export type WorkflowStatusResponse = {
  workflow: Workflow
  timeline: Array<{
    step_id: string
    agent_name: string
    status: string
    started_at?: string
    completed_at?: string
  }>
  progress_percentage: number
}

export type AuthorizationRequest = {
  destination_id: string
  destination_type: string
  scoped_permissions: string[]
}
