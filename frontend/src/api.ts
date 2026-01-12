import type {
  PassportResponse,
  Passport,
  Workflow,
  WorkflowStatusResponse,
  RequirementsChecklist,
  AuthorizationRequest,
  QualityReport,
  VerificationSummary,
} from './types'

// In development, calls go through the Vite dev server proxy (`/api`).
// In production, set VITE_API_BASE_URL to the backend URL (e.g. https://api.yourdomain.com).
const DEFAULT_API_BASE = ''
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE

export async function getPassport(clinicianId: string): Promise<PassportResponse> {
  const response = await fetch(`${API_BASE}/api/passport/${clinicianId}`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return (await response.json()) as PassportResponse
}

export async function createOrUpdatePassport(passport: Passport): Promise<Passport> {
  const response = await fetch(`${API_BASE}/api/passport`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(passport),
  })
  if (!response.ok) {
    throw new Error('Failed to save passport')
  }
  return (await response.json()) as Passport
}

export async function authorizeAccess(
  clinicianId: string,
  authorization: AuthorizationRequest,
): Promise<Workflow> {
  const response = await fetch(`${API_BASE}/api/passport/${clinicianId}/authorize`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(authorization),
  })
  if (!response.ok) {
    throw new Error('Authorization failed')
  }
  return (await response.json()) as Workflow
}

export async function getWorkflowStatus(workflowId: string): Promise<WorkflowStatusResponse> {
  const response = await fetch(`${API_BASE}/api/workflow/${workflowId}`)
  if (!response.ok) {
    throw new Error('Workflow not found')
  }
  return (await response.json()) as WorkflowStatusResponse
}

export async function startWorkflow(
  clinicianId: string,
  destinationId: string,
  destinationType: string,
): Promise<Workflow> {
  const params = new URLSearchParams({
    clinician_id: clinicianId,
    destination_id: destinationId,
    destination_type: destinationType,
  })
  const response = await fetch(`${API_BASE}/api/workflow?${params}`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Failed to start workflow')
  }
  return (await response.json()) as Workflow
}

export async function getRequirements(
  destinationId: string,
  clinicianId: string,
  destinationType: string,
): Promise<RequirementsChecklist> {
  const params = new URLSearchParams({
    clinician_id: clinicianId,
    destination_type: destinationType,
  })
  const response = await fetch(`${API_BASE}/api/requirements/${destinationId}?${params}`)
  if (!response.ok) {
    throw new Error('Failed to get requirements')
  }
  return (await response.json()) as RequirementsChecklist
}

export async function uploadDocument(
  clinicianId: string,
  documentType: string,
  file: File,
): Promise<{ status: string; document_id: string; message: string }> {
  const formData = new FormData()
  formData.append('file', file)
  const params = new URLSearchParams({
    clinician_id: clinicianId,
    document_type: documentType,
  })
  const response = await fetch(`${API_BASE}/api/documents/upload?${params}`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error('Document upload failed')
  }
  return (await response.json()) as { status: string; document_id: string; message: string }
}

export async function getVerification(
  verificationId: string,
  clinicianId: string,
): Promise<VerificationSummary> {
  const params = new URLSearchParams({ clinician_id: clinicianId })
  const response = await fetch(`${API_BASE}/api/verification/${verificationId}?${params}`)
  if (!response.ok) {
    throw new Error('Verification not found')
  }
  return (await response.json()) as VerificationSummary
}

export async function submitEnrollment(
  clinicianId: string,
  payerId: string,
  payerName: string,
): Promise<{
  status: string
  clinician_id: string
  payer_id: string
  payer_name: string
  submission_id: string
  submitted_at: string
  message: string
}> {
  const params = new URLSearchParams({
    clinician_id: clinicianId,
    payer_id: payerId,
    payer_name: payerName,
  })
  const response = await fetch(`${API_BASE}/api/enrollment/submit?${params}`, {
    method: 'POST',
  })
  if (!response.ok) {
    throw new Error('Enrollment submission failed')
  }
  return (await response.json()) as {
    status: string
    clinician_id: string
    payer_id: string
    payer_name: string
    submission_id: string
    submitted_at: string
    message: string
  }
}

export async function getQualityReport(clinicianId: string): Promise<QualityReport> {
  const response = await fetch(`${API_BASE}/api/passport/${clinicianId}/quality`)
  if (!response.ok) {
    throw new Error('Quality report not found')
  }
  return (await response.json()) as QualityReport
}

export async function listAllPassports(): Promise<Passport[]> {
  const response = await fetch(`${API_BASE}/api/passports`)
  if (!response.ok) {
    throw new Error('Failed to list passports')
  }
  return (await response.json()) as Passport[]
}
