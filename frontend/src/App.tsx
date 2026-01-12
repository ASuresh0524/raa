import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  getPassport,
  createOrUpdatePassport,
  authorizeAccess,
  getWorkflowStatus,
  uploadDocument,
  getRequirements,
  listAllPassports,
} from './api'
import type {
  Passport,
  PassportResponse,
  Workflow,
  WorkflowStatusResponse,
  RequirementsChecklist,
  AuthorizationRequest,
  QualityIssue,
  VerificationResult,
} from './types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'
type TabView = 'passport' | 'workflow' | 'quality' | 'requirements'
type ViewMode = 'list' | 'view' | 'create' | 'edit'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  })

const QualityIssueCard = ({ issue }: { issue: QualityIssue }) => (
  <article className={`quality-card severity-${issue.severity}`}>
    <header>
      <h4>{issue.field_name}</h4>
      <span className={`severity-badge ${issue.severity}`}>{issue.severity.toUpperCase()}</span>
    </header>
    <p>{issue.description}</p>
    {issue.suggested_fix && (
      <div className="suggested-fix">
        <strong>Suggested Fix:</strong> {issue.suggested_fix}
      </div>
    )}
    <span className="issue-type">{issue.issue_type}</span>
  </article>
)

const VerificationResultCard = ({ result }: { result: VerificationResult }) => (
  <article className={`verification-card status-${result.status}`}>
    <header>
      <h4>{result.field_name}</h4>
      <span className={`status-badge ${result.status}`}>{result.status.toUpperCase()}</span>
    </header>
    <p>
      <strong>Source:</strong> {result.source}
    </p>
    {result.verified_at && (
      <p>
        <strong>Verified:</strong> {formatDate(result.verified_at)}
      </p>
    )}
    {result.exception_reason && (
      <div className="exception-reason">
        <strong>Exception:</strong> {result.exception_reason}
      </div>
    )}
  </article>
)

const RequirementCard = ({ requirement }: { requirement: any }) => (
  <article className={`requirement-card status-${requirement.status}`}>
    <header>
      <h4>{requirement.category}</h4>
      <span className={`status-badge ${requirement.status}`}>{requirement.status.toUpperCase()}</span>
    </header>
    <p>{requirement.description}</p>
    {requirement.required && <span className="required-badge">Required</span>}
  </article>
)

const WorkflowStepCard = ({ step }: { step: any }) => (
  <article className={`workflow-step status-${step.status}`}>
    <header>
      <h4>{step.agent_name}</h4>
      <span className={`status-badge ${step.status}`}>{step.status.replace('_', ' ').toUpperCase()}</span>
    </header>
    {step.started_at && (
      <p>
        <strong>Started:</strong> {formatDate(step.started_at)}
      </p>
    )}
    {step.completed_at && (
      <p>
        <strong>Completed:</strong> {formatDate(step.completed_at)}
      </p>
    )}
    {step.exception_reason && (
      <div className="exception-reason">
        <strong>Exception:</strong> {step.exception_reason}
      </div>
    )}
  </article>
)

const PassportListItem = ({
  passport,
  onClick,
}: {
  passport: Passport
  onClick: () => void
}) => (
  <div className="passport-list-item" onClick={onClick}>
    <div>
      <h3>{passport.identity.legal_name}</h3>
      <p className="text-light">ID: {passport.clinician_id}</p>
    </div>
    <div>
      <p className="text-light">
        {passport.licenses.state_licenses.length} License{passport.licenses.state_licenses.length !== 1 ? 's' : ''}
      </p>
      <p className="text-light">Updated: {formatDate(passport.updated_at)}</p>
    </div>
  </div>
)

function App() {
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string>()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [passportResponse, setPassportResponse] = useState<PassportResponse>()
  const [passports, setPassports] = useState<Passport[]>([])
  const [activeTab, setActiveTab] = useState<TabView>('passport')
  const [workflow, setWorkflow] = useState<WorkflowStatusResponse>()
  const [requirements, setRequirements] = useState<RequirementsChecklist>()
  const [uploading, setUploading] = useState(false)
  const [clinicianId, setClinicianId] = useState('')
  const [destinationId, setDestinationId] = useState('')
  const [destinationType, setDestinationType] = useState<'hospital' | 'group' | 'staffing_firm' | 'telehealth'>('hospital')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    loadPassports()
  }, [])

  const loadPassports = async () => {
    try {
      const data = await listAllPassports()
      setPassports(data)
    } catch (err) {
      console.error('Failed to load passports:', err)
    }
  }

  const loadPassport = async (id: string) => {
    try {
      setState('loading')
      const data = await getPassport(id)
      setPassportResponse(data)
      setClinicianId(id)
      setViewMode('view')
      setState('ready')
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Unknown error')
      setState('error')
    }
  }

  const handleAuthorizeAccess = async () => {
    if (!destinationId || !destinationType || !clinicianId) {
      alert('Please enter destination ID and select type')
      return
    }
    try {
      const auth: AuthorizationRequest = {
        destination_id: destinationId,
        destination_type: destinationType,
        scoped_permissions: [],
      }
      const newWorkflow = await authorizeAccess(clinicianId, auth)
      const workflowStatus = await getWorkflowStatus(newWorkflow.workflow_id)
      setWorkflow(workflowStatus)
      setActiveTab('workflow')
    } catch (err) {
      alert('Authorization failed: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleGetRequirements = async () => {
    if (!destinationId || !destinationType || !clinicianId) {
      alert('Please enter destination ID and select type')
      return
    }
    try {
      const reqs = await getRequirements(destinationId, clinicianId, destinationType)
      setRequirements(reqs)
      setActiveTab('requirements')
    } catch (err) {
      alert('Failed to get requirements: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleFileUpload = async (file: File) => {
    if (!clinicianId) {
      alert('Please select a passport first')
      return
    }
    try {
      setUploading(true)
      const result = await uploadDocument(clinicianId, 'supporting_document', file)
      alert(result.message)
      if (passportResponse) {
        const data = await getPassport(clinicianId)
        setPassportResponse(data)
      }
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handleCreatePassport = () => {
    setViewMode('create')
    setClinicianId('')
    setPassportResponse(undefined)
  }

  if (viewMode === 'list') {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Credentialing Passport</p>
            <h1>Clinician Passports</h1>
          </div>
          <button onClick={handleCreatePassport}>+ Create New Passport</button>
        </header>

        <div className="passport-list-view">
          {passports.length === 0 ? (
            <div className="empty-state">
              <h2>No Passports Yet</h2>
              <p>Create your first credentialing passport to get started.</p>
              <button onClick={handleCreatePassport}>Create Passport</button>
            </div>
          ) : (
            <div className="passport-list">
              {passports.map((p) => (
                <PassportListItem
                  key={p.clinician_id}
                  passport={p}
                  onClick={() => loadPassport(p.clinician_id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    )
  }

  if (viewMode === 'create') {
    return (
      <main className="app-shell">
        <header className="app-header">
          <div>
            <p className="eyebrow">Create Passport</p>
            <h1>New Credentialing Passport</h1>
          </div>
          <button onClick={() => setViewMode('list')}>← Back to List</button>
        </header>

        <div className="create-passport-view">
          <div className="section">
            <h2>Basic Information</h2>
            <div className="form-group">
              <label>Clinician ID</label>
              <input
                type="text"
                value={clinicianId}
                onChange={(e) => setClinicianId(e.target.value)}
                placeholder="e.g., clinician-001"
              />
            </div>
            <div className="form-group">
              <label>Legal Name</label>
              <input type="text" placeholder="Dr. John Doe" />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" placeholder="john.doe@example.com" />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input type="date" />
            </div>
            <div className="form-actions">
              <button onClick={() => setViewMode('list')}>Cancel</button>
              <button
                onClick={async () => {
                  if (!clinicianId) {
                    alert('Please enter a Clinician ID')
                    return
                  }
                  // Create minimal passport
                  const newPassport: Passport = {
                    clinician_id: clinicianId,
                    identity: {
                      legal_name: '',
                      aliases: [],
                      date_of_birth: new Date().toISOString().split('T')[0],
                      email: '',
                      phone: '',
                      address_history: [],
                    },
                    education: [],
                    training: [],
                    work_history: [],
                    hospital_affiliations: [],
                    licenses: {
                      state_licenses: [],
                      cds_registrations: [],
                    },
                    board_certifications: [],
                    disclosures: [],
                    references: [],
                    enrollment: {
                      practice_locations: [],
                      w9_on_file: false,
                      specialties: [],
                      taxonomies: [],
                    },
                    documents: [],
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  }
                  try {
                    await createOrUpdatePassport(newPassport)
                    await loadPassports()
                    await loadPassport(clinicianId)
                  } catch (err) {
                    alert('Failed to create passport: ' + (err instanceof Error ? err.message : 'Unknown'))
                  }
                }}
              >
                Create Passport
              </button>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (state === 'loading' || state === 'idle') {
    return (
      <main className="app-shell">
        <section className="loading">
          <p>Loading Credentialing Passport…</p>
        </section>
      </main>
    )
  }

  if (state === 'error' || !passportResponse) {
    return (
      <main className="app-shell">
        <section className="error">
          <h2>Unable to load passport</h2>
          <p>{error}</p>
          <button onClick={() => setViewMode('list')}>Back to List</button>
        </section>
      </main>
    )
  }

  const { passport, quality_report, verification_summary } = passportResponse

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Credentialing Passport</p>
          <h1>{passport.identity.legal_name || 'Unnamed Passport'}</h1>
          <p>Clinician ID: {passport.clinician_id}</p>
        </div>
        <div>
          <p className="eyebrow">Agents Active</p>
          <h2>
            Orchestrator · Requirements · Intake · Quality · Verification · Enrollment · Guardrail
            · Audit
          </h2>
        </div>
        {quality_report && (
          <div className="quality-score">
            <p className="eyebrow">Completeness Score</p>
            <h2>{(quality_report.completeness_score * 100).toFixed(0)}%</h2>
          </div>
        )}
        <button onClick={() => setViewMode('list')}>← Back to List</button>
      </header>

      <div className="controls-panel">
        <div className="destination-controls">
          <label>
            Destination ID:
            <input
              type="text"
              value={destinationId}
              onChange={(e) => setDestinationId(e.target.value)}
              placeholder="e.g., hospital-001"
            />
          </label>
          <label>
            Destination Type:
            <select
              value={destinationType}
              onChange={(e) =>
                setDestinationType(e.target.value as 'hospital' | 'group' | 'staffing_firm' | 'telehealth')
              }
            >
              <option value="hospital">Hospital</option>
              <option value="group">Group Practice</option>
              <option value="staffing_firm">Staffing Firm</option>
              <option value="telehealth">Telehealth Network</option>
            </select>
          </label>
          <button onClick={handleAuthorizeAccess} disabled={!destinationId}>
            Authorize Access & Start Workflow
          </button>
          <button onClick={handleGetRequirements} disabled={!destinationId}>
            View Requirements
          </button>
        </div>
        <div className="document-upload">
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx,.jpg,.png"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
            {uploading ? 'Uploading...' : '📄 Upload Document'}
          </button>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={activeTab === 'passport' ? 'active' : ''}
          onClick={() => setActiveTab('passport')}
        >
          Passport
        </button>
        <button
          className={activeTab === 'workflow' ? 'active' : ''}
          onClick={() => setActiveTab('workflow')}
        >
          Workflow
        </button>
        <button
          className={activeTab === 'quality' ? 'active' : ''}
          onClick={() => setActiveTab('quality')}
        >
          Quality Report
        </button>
        <button
          className={activeTab === 'requirements' ? 'active' : ''}
          onClick={() => setActiveTab('requirements')}
        >
          Requirements
        </button>
      </div>

      {activeTab === 'passport' && (
        <section className="passport-view">
          <div className="passport-sections">
            <div className="section">
              <h2>Identity & Demographics</h2>
              <p>
                <strong>Legal Name:</strong> {passport.identity.legal_name || 'Not provided'}
              </p>
              <p>
                <strong>Email:</strong> {passport.identity.email || 'Not provided'}
              </p>
              <p>
                <strong>Phone:</strong> {passport.identity.phone || 'Not provided'}
              </p>
              {passport.identity.date_of_birth && (
                <p>
                  <strong>Date of Birth:</strong> {formatDate(passport.identity.date_of_birth)}
                </p>
              )}
              {passport.identity.aliases.length > 0 && (
                <p>
                  <strong>Aliases:</strong> {passport.identity.aliases.join(', ')}
                </p>
              )}
            </div>

            {passport.education.length > 0 && (
              <div className="section">
                <h2>Education & Training</h2>
                {passport.education.map((edu, idx) => (
                  <div key={idx} className="education-item">
                    <p>
                      <strong>{edu.degree}</strong> - {edu.institution}
                    </p>
                    <p>
                      {formatDate(edu.start_date)} to {formatDate(edu.end_date)}
                    </p>
                  </div>
                ))}
                {passport.training.map((train, idx) => (
                  <div key={idx} className="training-item">
                    <p>
                      <strong>{train.program_name}</strong> - {train.institution}
                    </p>
                    <p>
                      {train.specialty} · {formatDate(train.start_date)} to {formatDate(train.end_date)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {passport.licenses.state_licenses.length > 0 && (
              <div className="section">
                <h2>Licenses</h2>
                {passport.licenses.state_licenses.map((license, idx) => (
                  <div key={idx} className="license-item">
                    <p>
                      <strong>{license.state}</strong> - {license.license_number}
                    </p>
                    <p>
                      Status: {license.status} · Expires: {formatDate(license.expiration_date)}
                    </p>
                  </div>
                ))}
                {passport.licenses.dea_number && (
                  <div className="license-item">
                    <p>
                      <strong>DEA:</strong> {passport.licenses.dea_number}
                    </p>
                    {passport.licenses.dea_expiration && (
                      <p>Expires: {formatDate(passport.licenses.dea_expiration)}</p>
                    )}
                  </div>
                )}
              </div>
            )}

            {passport.board_certifications.length > 0 && (
              <div className="section">
                <h2>Board Certifications</h2>
                {passport.board_certifications.map((cert, idx) => (
                  <div key={idx} className="cert-item">
                    <p>
                      <strong>{cert.specialty}</strong> - {cert.board_name}
                    </p>
                    <p>
                      Status: {cert.status}
                      {cert.expiration_date && ` · Expires: ${formatDate(cert.expiration_date)}`}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {passport.malpractice && (
              <div className="section">
                <h2>Malpractice Insurance</h2>
                <p>
                  <strong>Carrier:</strong> {passport.malpractice.carrier}
                </p>
                <p>
                  <strong>Policy:</strong> {passport.malpractice.policy_number}
                </p>
                <p>
                  Coverage: ${passport.malpractice.coverage_amount.toLocaleString()} · Expires:{' '}
                  {formatDate(passport.malpractice.expiration_date)}
                </p>
              </div>
            )}

            {passport.work_history.length > 0 && (
              <div className="section">
                <h2>Work History</h2>
                {passport.work_history.map((work, idx) => (
                  <div key={idx} className="work-item">
                    <p>
                      <strong>{work.position}</strong> - {work.employer}
                    </p>
                    <p>
                      {formatDate(work.start_date)}
                      {work.end_date ? ` to ${formatDate(work.end_date)}` : ' - Present'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {verification_summary && (
            <aside className="verification-sidebar">
              <h3>Verification Summary</h3>
              <div className="verification-stats">
                <p>
                  <strong>Verified:</strong> {verification_summary.verified_count}
                </p>
                <p>
                  <strong>Failed:</strong> {verification_summary.failed_count}
                </p>
                <p>
                  <strong>Exceptions:</strong> {verification_summary.exception_count}
                </p>
              </div>
              <div className="verification-results">
                {verification_summary.results.map((result) => (
                  <VerificationResultCard key={result.verification_id} result={result} />
                ))}
              </div>
            </aside>
          )}
        </section>
      )}

      {activeTab === 'workflow' && (
        <section className="workflow-view">
          {workflow ? (
            <>
              <div className="workflow-header">
                <h2>Workflow: {workflow.workflow.workflow_id}</h2>
                <div className="workflow-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${workflow.progress_percentage}%` }}
                    />
                  </div>
                  <p>{workflow.progress_percentage.toFixed(0)}% Complete</p>
                </div>
                <p>
                  <strong>Status:</strong> {workflow.workflow.status.replace('_', ' ').toUpperCase()}
                </p>
                <p>
                  <strong>Destination:</strong> {workflow.workflow.destination_id} ({workflow.workflow.destination_type})
                </p>
              </div>
              <div className="workflow-steps">
                {workflow.workflow.steps.map((step) => (
                  <WorkflowStepCard key={step.step_id} step={step} />
                ))}
              </div>
              {workflow.workflow.exceptions.length > 0 && (
                <div className="exceptions-list">
                  <h3>Exceptions</h3>
                  <ul>
                    {workflow.workflow.exceptions.map((exc, idx) => (
                      <li key={idx}>{exc}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          ) : (
            <div className="empty-workflow">
              <p>No active workflow. Authorize access to start a credentialing workflow.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'quality' && quality_report && (
        <section className="quality-view">
          <div className="quality-header">
            <h2>Data Quality Report</h2>
            <div className="completeness-score">
              <h3>Completeness: {(quality_report.completeness_score * 100).toFixed(0)}%</h3>
            </div>
          </div>
          <div className="quality-issues">
            {quality_report.issues.length > 0 ? (
              quality_report.issues.map((issue, idx) => (
                <QualityIssueCard key={idx} issue={issue} />
              ))
            ) : (
              <p className="no-issues">No quality issues found. Passport is complete and consistent.</p>
            )}
          </div>
        </section>
      )}

      {activeTab === 'requirements' && (
        <section className="requirements-view">
          {requirements ? (
            <>
              <div className="requirements-header">
                <h2>Requirements Checklist</h2>
                <p>
                  <strong>Destination:</strong> {requirements.destination_id} ({requirements.destination_type})
                </p>
                <p>
                  <strong>Generated:</strong> {formatDate(requirements.generated_at)}
                </p>
              </div>
              <div className="requirements-list">
                {requirements.requirements.map((req) => (
                  <RequirementCard key={req.requirement_id} requirement={req} />
                ))}
              </div>
            </>
          ) : (
            <div className="empty-requirements">
              <p>No requirements loaded. Click "View Requirements" to generate a checklist.</p>
            </div>
          )}
        </section>
      )}
    </main>
  )
}

export default App
