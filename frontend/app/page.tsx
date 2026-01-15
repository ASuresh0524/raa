"use client"

import { useEffect, useMemo, useState } from 'react'

type Passport = any
type WorkflowStatus = any

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'

async function api<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    throw new Error(await res.text())
  }
  return (await res.json()) as T
}

export default function HomePage() {
  const [passports, setPassports] = useState<Passport[]>([])
  const [selected, setSelected] = useState<Passport | null>(null)
  const [workflowId, setWorkflowId] = useState('')
  const [workflowStatus, setWorkflowStatus] = useState<WorkflowStatus | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [destinationId, setDestinationId] = useState('')
  const [destinationType, setDestinationType] = useState('hospital')

  const evidenceBundle = useMemo(
    () => (workflowStatus?.workflow?.evidence_bundle ? workflowStatus.workflow.evidence_bundle : null),
    [workflowStatus],
  )

  const refreshPassports = async () => {
    try {
      setLoading(true)
      const data = await api<Passport[]>('/api/passports')
      setPassports(data)
    } catch (e: any) {
      setError(e.message || 'Failed to load passports')
    } finally {
      setLoading(false)
    }
  }

  const selectPassport = async (id: string) => {
    try {
      setLoading(true)
      const data = await api<{ passport: Passport }>('/api/passport/' + id)
      setSelected(data.passport)
    } catch (e: any) {
      setError(e.message || 'Failed to load passport')
    } finally {
      setLoading(false)
    }
  }

  const startWorkflow = async () => {
    if (!selected || !destinationId) return
    try {
      setLoading(true)
      const wf = await api<{ workflow_id: string }>(
        '/api/passport/' + selected.clinician_id + '/authorize',
        {
        method: 'POST',
        body: JSON.stringify({
          destination_id: destinationId,
          destination_type: destinationType,
          scoped_permissions: [],
        }),
        },
      )
      await api('/api/workflow/' + wf.workflow_id + '/run', { method: 'POST' })
      setWorkflowId(wf.workflow_id)
      const status = await api('/api/workflow/' + wf.workflow_id)
      setWorkflowStatus(status)
    } catch (e: any) {
      setError(e.message || 'Failed to start workflow')
    } finally {
      setLoading(false)
    }
  }

  const refreshWorkflow = async () => {
    if (!workflowId) return
    try {
      setLoading(true)
      const status = await api('/api/workflow/' + workflowId)
      setWorkflowStatus(status)
    } catch (e: any) {
      setError(e.message || 'Failed to refresh workflow')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshPassports()
  }, [])

  return (
    <div className="container">
      <div className="hero">
        <div>
          <h1>Credentialing Passport for Clinicians</h1>
          <p>Fill once, reuse everywhere. Orchestrated credentialing with audit‑ready evidence bundles.</p>
        </div>
        <span className="pill">● Live Demo</span>
      </div>

      {error && (
        <div className="card" style={{ borderColor: 'rgba(239,68,68,0.5)' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      <div className="grid grid-2">
        <div className="card">
          <h3>Passports</h3>
          <p className="muted">Click a clinician to view the passport. Refresh to sync.</p>
          <div style={{ marginTop: 12 }}>
            <button className="button secondary" onClick={refreshPassports}>
              Refresh
            </button>
          </div>
          <div className="list" style={{ marginTop: 16 }}>
            {passports.length === 0 && <div className="muted">No passports yet.</div>}
            {passports.map((p) => (
              <div key={p.clinician_id} className="list-item" onClick={() => selectPassport(p.clinician_id)}>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.identity?.legal_name || 'Unnamed'}</div>
                  <div className="muted">{p.clinician_id}</div>
                </div>
                <span className="badge">{p.licenses?.state_licenses?.length || 0} licenses</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3>Selected Passport</h3>
          <p className="muted">Identity, licenses, and enrollment snapshot.</p>
          {!selected && <div className="muted" style={{ marginTop: 12 }}>Select a clinician from the list.</div>}
          {selected && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontWeight: 600 }}>{selected.identity?.legal_name}</div>
              <div className="muted">{selected.identity?.email}</div>
              <div className="muted">{selected.identity?.phone}</div>
              <div style={{ marginTop: 12 }}>
                <span className="badge">NPI: {selected.enrollment?.practice_locations?.[0]?.npi || '—'}</span>
              </div>
              <div style={{ marginTop: 16 }}>
                <label className="label">Destination ID</label>
                <input className="input" value={destinationId} onChange={(e) => setDestinationId(e.target.value)} placeholder="hospital-001" />
                <label className="label" style={{ marginTop: 10 }}>Destination Type</label>
                <select className="select" value={destinationType} onChange={(e) => setDestinationType(e.target.value)}>
                  <option value="hospital">Hospital</option>
                  <option value="group">Group</option>
                  <option value="staffing_firm">Staffing Firm</option>
                  <option value="telehealth">Telehealth</option>
                </select>
                <div style={{ marginTop: 14 }}>
                  <button className="button" onClick={startWorkflow}>Start Workflow</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h3>Workflow Status</h3>
          <p className="muted">Timeline, task runs, and exceptions.</p>
          <div style={{ marginTop: 12 }}>
            <label className="label">Workflow ID</label>
            <input className="input" value={workflowId} onChange={(e) => setWorkflowId(e.target.value)} placeholder="wf-..." />
            <div style={{ marginTop: 12 }}>
              <button className="button secondary" onClick={refreshWorkflow}>Refresh Status</button>
            </div>
          </div>
          {workflowStatus && (
            <div style={{ marginTop: 16 }}>
              <div className="muted">Progress: {workflowStatus.progress_percentage?.toFixed?.(0) || 0}%</div>
              <div className="muted">Status: {workflowStatus.workflow?.status}</div>
              {(workflowStatus.workflow?.exceptions || []).length > 0 && (
                <div style={{ marginTop: 8 }} className="badge status-warning">Exceptions flagged</div>
              )}
            </div>
          )}
        </div>

        <div className="card">
          <h3>Evidence Bundle</h3>
          <p className="muted">Audit‑ready receipts and provenance.</p>
          {!evidenceBundle && <div className="muted" style={{ marginTop: 12 }}>Run a workflow to generate evidence.</div>}
          {evidenceBundle && (
            <div style={{ marginTop: 12 }}>
              <div className="badge status-success">Generated</div>
              <div style={{ marginTop: 10 }}>
                <a
                  className="button"
                  href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(evidenceBundle, null, 2))}`}
                  download={`evidence-${workflowId}.json`}
                >
                  Download Evidence (JSON)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {loading && <div className="card">Loading…</div>}
    </div>
  )
}


