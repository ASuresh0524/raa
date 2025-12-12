import { useEffect, useRef, useState } from 'react'
import './App.css'
import {
  fetchAgentPacket,
  submitVoiceCommand,
  uploadScreenCapture,
  generateReport,
  savePatientMemory,
} from './api'
import type {
  AgentPacket,
  LongitudinalSummary,
  Study,
  VoiceResponse,
  Report,
  ReportSection,
} from './types'

type SpeechRecognitionEventLite = {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface SpeechRecognitionLite {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  onresult: (event: SpeechRecognitionEventLite) => void
  onerror: (event: Event) => void
  onend: () => void
  start: () => void
  stop: () => void
}

type SpeechRecognitionConstructor = new () => SpeechRecognitionLite

declare global {
  interface Window {
    webkitSpeechRecognition?: SpeechRecognitionConstructor
    SpeechRecognition?: SpeechRecognitionConstructor
  }
}

type LoadState = 'idle' | 'loading' | 'ready' | 'error'
type TabView = 'studies' | 'report' | 'agents'

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
    day: 'numeric',
  })

const StudyCard = ({ study }: { study: Study }) => (
  <article className="study-card">
    <header>
      <h3>{study.body_part}</h3>
      <span>
        {study.modality} · {formatDate(study.study_date)}
      </span>
    </header>
    <p>{study.summary}</p>
    <ul>
      {study.measurements.map((measurement) => (
        <li key={measurement.id}>
          <strong>{measurement.lesion}</strong> — {measurement.value_mm.toFixed(1)} mm
        </li>
      ))}
    </ul>
  </article>
)

const LongitudinalCard = ({ item }: { item: LongitudinalSummary }) => (
  <article className={`agent-card trend-${item.trend}`}>
    <header>
      <h4>{item.lesion}</h4>
      <span>{item.trend.toUpperCase()}</span>
    </header>
    <p>{item.narrative}</p>
    <ul>
      {item.deltas.map((delta) => (
        <li key={delta}>{delta}</li>
      ))}
    </ul>
  </article>
)

const ReportSectionEditor = ({
  section,
  onUpdate,
}: {
  section: ReportSection
  onUpdate: (content: string) => void
}) => (
  <div className="report-section">
    <header>
      <h4>{section.section}</h4>
      <span className="source-badge">{section.source}</span>
    </header>
    <textarea
      value={section.content}
      onChange={(e) => onUpdate(e.target.value)}
      disabled={!section.editable}
      className="report-textarea"
      placeholder={`Enter ${section.section.toLowerCase()}...`}
    />
  </div>
)

function App() {
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string>()
  const [packet, setPacket] = useState<AgentPacket>()
  const [activeTab, setActiveTab] = useState<TabView>('studies')
  const [report, setReport] = useState<Report | null>(null)
  const [voiceTranscript, setVoiceTranscript] = useState('')
  const [voiceResponse, setVoiceResponse] = useState<VoiceResponse>()
  const [voiceError, setVoiceError] = useState<string>()
  const [voiceLoading, setVoiceLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [patientId, setPatientId] = useState('')
  const recognitionRef = useRef<SpeechRecognitionLite | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const load = async () => {
      try {
        setState('loading')
        const data = await fetchAgentPacket()
        setPacket(data)
        setState('ready')
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err.message : 'Unknown error')
        setState('error')
      }
    }
    load()
  }, [])

  const startListening = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setVoiceError('Browser does not support SpeechRecognition API')
      return
    }
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.onresult = (event: SpeechRecognitionEventLite) => {
      const transcript = event.results[0][0].transcript
      setVoiceTranscript(transcript)
      // Auto-submit for seamless voice workflow
      setTimeout(() => handleVoiceSubmit(transcript), 300)
    }
    recognition.onerror = () => {
      setVoiceError('Unable to capture audio. Check permissions and retry.')
    }
    recognition.onend = () => {
      setListening(false)
    }
    recognition.start()
    recognitionRef.current = recognition
    setListening(true)
    setVoiceError(undefined)
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setListening(false)
  }

  const handleVoiceSubmit = async (transcriptOverride?: string) => {
    const text = transcriptOverride || voiceTranscript.trim()
    if (!text) {
      setVoiceError('Speak or type a command first.')
      return
    }
    try {
      setVoiceLoading(true)
      setVoiceError(undefined)
      const response = await submitVoiceCommand({ transcript: text })
      setVoiceResponse(response)

      // Auto-execute actions for seamless workflow
      for (const action of response.actions) {
        if (action.action === 'auto_populate' && packet) {
          handleGenerateReport()
        }
      }
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : 'Voice command failed')
    } finally {
      setVoiceLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      const result = await uploadScreenCapture(file, patientId || undefined)
      alert(result.message)
      // Reload case data after screen capture
      const data = await fetchAgentPacket()
      setPacket(data)
    } catch (err) {
      alert('Upload failed: ' + (err instanceof Error ? err.message : 'Unknown error'))
    } finally {
      setUploading(false)
    }
  }

  const handlePaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          await handleFileUpload(file)
        }
      }
    }
  }

  const handleGenerateReport = async () => {
    if (!packet) return
    try {
      const generated = await generateReport(
        patientId || packet.case_id,
        packet.studies[0]?.id || 'unknown',
      )
      setReport(generated)
      setActiveTab('report')
    } catch (err) {
      alert('Report generation failed: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  const handleUpdateReportSection = (section: string, content: string) => {
    if (!report) return
    const updated = {
      ...report,
      sections: report.sections.map((s) =>
        s.section === section ? { ...s, content, source: 'user' as const } : s,
      ),
    }
    setReport(updated)
  }

  const handleSavePatientMemory = async () => {
    if (!packet || !patientId) return
    try {
      await savePatientMemory({
        patient_id: patientId,
        studies: packet.studies,
        notes: '',
        last_updated: new Date().toISOString(),
      })
      alert('Patient context saved locally')
    } catch (err) {
      alert('Failed to save: ' + (err instanceof Error ? err.message : 'Unknown'))
    }
  }

  if (state === 'loading' || state === 'idle') {
    return (
      <main className="app-shell">
        <section className="loading">
          <p>Initializing Radiology Action Assistant…</p>
        </section>
      </main>
    )
  }

  if (state === 'error' || !packet) {
    return (
      <main className="app-shell">
        <section className="error">
          <h2>Unable to reach backend</h2>
          <p>{error}</p>
          <p>Start FastAPI on port 8000 and reload this page.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="app-shell" onPaste={handlePaste}>
      <header className="app-header">
        <div>
          <p className="eyebrow">Case</p>
          <h1>{packet.case_id}</h1>
        </div>
      <div>
          <p className="eyebrow">Agents active</p>
          <h2>Screen · Change · Guidelines · Drafting · Voice</h2>
        </div>
        <div className="timing-panel">
          <p className="eyebrow">Latency</p>
          <p>
            Data {packet.timing.data_collection_ms} ms · Agents{' '}
            {packet.timing.agent_processing_ms} ms
          </p>
        </div>
      </header>

      <div className="d2p-controls">
        <div className="patient-id-input">
          <label>
            Patient ID:
            <input
              type="text"
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="Enter patient ID for context"
            />
          </label>
          <button onClick={handleSavePatientMemory} disabled={!patientId}>
            Save Context
          </button>
        </div>
        <div className="screen-capture-controls">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) handleFileUpload(file)
            }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading...' : '📷 Upload Screen'}
          </button>
          <span className="hint">Or paste image (Ctrl/Cmd+V)</span>
        </div>
      </div>

      <div className="tab-navigation">
        <button
          className={activeTab === 'studies' ? 'active' : ''}
          onClick={() => setActiveTab('studies')}
        >
          Studies
        </button>
        <button
          className={activeTab === 'report' ? 'active' : ''}
          onClick={() => setActiveTab('report')}
        >
          Report Editor
        </button>
        <button
          className={activeTab === 'agents' ? 'active' : ''}
          onClick={() => setActiveTab('agents')}
        >
          Agent Suggestions
        </button>
      </div>

      {activeTab === 'studies' && (
        <section className="pacs-layout">
          <div className="viewport-column">
            <h2>Studies on screen</h2>
            <div className="viewport-grid">
              {packet.studies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </div>
        </section>
      )}

      {activeTab === 'report' && (
        <section className="report-editor">
          <div className="report-header">
            <h2>Report Editor</h2>
            <button onClick={handleGenerateReport} className="generate-btn">
              Auto-Populate from Agents
            </button>
          </div>
          {report ? (
            <div className="report-sections">
              {report.sections.map((section) => (
                <ReportSectionEditor
                  key={section.section}
                  section={section}
                  onUpdate={(content) =>
                    handleUpdateReportSection(section.section, content)
                  }
                />
              ))}
            </div>
          ) : (
            <div className="empty-report">
              <p>No report generated yet. Click "Auto-Populate from Agents" to start.</p>
            </div>
          )}
        </section>
      )}

      {activeTab === 'agents' && (
        <section className="pacs-layout">
          <div className="viewport-column">
            <h2>Agent Analysis</h2>
            <div className="viewport-grid">
              {packet.studies.map((study) => (
                <StudyCard key={study.id} study={study} />
              ))}
            </div>
          </div>

          <aside className="agent-sidebar">
            <div>
              <h3>Longitudinal Agent</h3>
              <div className="card-stack">
                {packet.longitudinal.map((item) => (
                  <LongitudinalCard key={item.lesion} item={item} />
                ))}
              </div>
            </div>

            <div>
              <h3>Guideline Agent</h3>
              <div className="card-stack">
                {packet.guideline_recs.map((rec) => (
                  <article key={rec.condition} className="agent-card">
                    <header>
                      <h4>{rec.guideline}</h4>
                      <span>{rec.condition}</span>
                    </header>
                    <p>{rec.recommendation}</p>
                    <a href={rec.citation_url} target="_blank" rel="noreferrer">
                      View source
                    </a>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3>Drafting Agent</h3>
              <div className="card-stack">
                {packet.drafting_hints.map((hint) => (
                  <article key={hint.section} className="agent-card">
                    <header>
                      <h4>{hint.section}</h4>
                    </header>
                    <p>{hint.suggestion}</p>
                  </article>
                ))}
              </div>
            </div>

            <div>
              <h3>Voice Agent</h3>
              <div className="voice-card">
                <div className="voice-controls">
                  <button
                    type="button"
                    className={listening ? 'mic-button active' : 'mic-button'}
                    onClick={listening ? stopListening : startListening}
                  >
                    {listening ? '🎤 Listening…' : '🎤 Tap to speak'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleVoiceSubmit()}
                    disabled={voiceLoading}
                  >
                    {voiceLoading ? 'Sending…' : 'Send'}
                  </button>
                </div>
                <textarea
                  placeholder='Try: "Summarize changes", "Show guidelines", "Auto-populate report"'
                  value={voiceTranscript}
                  onChange={(event) => setVoiceTranscript(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleVoiceSubmit()
                    }
                  }}
                />
                {voiceError && <p className="voice-error">{voiceError}</p>}
                {voiceResponse && (
                  <div className="voice-response">
                    <p>{voiceResponse.narration}</p>
                    <ul>
                      {voiceResponse.actions.map((action) => (
                        <li key={`${action.action}-${action.target}`}>
                          <strong>{action.action}</strong> → {action.message}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </aside>
        </section>
      )}
    </main>
  )
}

export default App
