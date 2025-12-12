import type {
  AgentPacket,
  VoiceCommand,
  VoiceResponse,
  Report,
  PatientMemory,
} from './types'

const DEFAULT_API_BASE = 'http://localhost:8000'
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE

export async function fetchAgentPacket(): Promise<AgentPacket> {
  const response = await fetch(`${API_BASE}/api/case`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return (await response.json()) as AgentPacket
}

export async function submitVoiceCommand(
  payload: VoiceCommand,
): Promise<VoiceResponse> {
  const response = await fetch(`${API_BASE}/api/voice`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || 'Voice endpoint error')
  }
  return (await response.json()) as VoiceResponse
}

export async function uploadScreenCapture(
  file: File,
  patientId?: string,
): Promise<{ status: string; message: string }> {
  const formData = new FormData()
  formData.append('file', file)
  if (patientId) {
    formData.append('patient_id', patientId)
  }
  const response = await fetch(`${API_BASE}/api/screen-capture`, {
    method: 'POST',
    body: formData,
  })
  if (!response.ok) {
    throw new Error('Screen capture upload failed')
  }
  return (await response.json()) as { status: string; message: string }
}

export async function savePatientMemory(
  memory: PatientMemory,
): Promise<PatientMemory> {
  const response = await fetch(`${API_BASE}/api/patient-memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(memory),
  })
  if (!response.ok) {
    throw new Error('Failed to save patient memory')
  }
  return (await response.json()) as PatientMemory
}

export async function getPatientMemory(
  patientId: string,
): Promise<PatientMemory> {
  const response = await fetch(`${API_BASE}/api/patient-memory/${patientId}`)
  if (!response.ok) {
    throw new Error('Patient memory not found')
  }
  return (await response.json()) as PatientMemory
}

export async function generateReport(
  patientId: string,
  studyId: string,
): Promise<Report> {
  const response = await fetch(
    `${API_BASE}/api/report/generate?patient_id=${patientId}&study_id=${studyId}`,
    { method: 'POST' },
  )
  if (!response.ok) {
    throw new Error('Report generation failed')
  }
  return (await response.json()) as Report
}

