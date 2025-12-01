import { useEffect, useState } from 'react'
import './App.css'
import { fetchAgentPacket } from './api'
import type { AgentPacket, LongitudinalSummary, Study } from './types'

type LoadState = 'idle' | 'loading' | 'ready' | 'error'

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

function App() {
  const [state, setState] = useState<LoadState>('idle')
  const [error, setError] = useState<string>()
  const [packet, setPacket] = useState<AgentPacket>()

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
    <main className="app-shell">
      <header className="app-header">
        <div>
          <p className="eyebrow">Case</p>
          <h1>{packet.case_id}</h1>
        </div>
        <div>
          <p className="eyebrow">Agents active</p>
          <h2>Screen · Change · Guidelines · Drafting</h2>
        </div>
      </header>

      <section className="pacs-layout">
        <div className="viewport-column">
          <h2>Studies on screen</h2>
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
        </aside>
      </section>
    </main>
  )
}

export default App
