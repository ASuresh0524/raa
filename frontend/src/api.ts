import type { AgentPacket } from './types'

const DEFAULT_API_BASE = 'http://localhost:8000'
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE

export async function fetchAgentPacket(): Promise<AgentPacket> {
  const response = await fetch(`${API_BASE}/api/case`)
  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }
  return (await response.json()) as AgentPacket
}

