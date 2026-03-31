# Credentialing Passport for Clinicians

**Universal, Clinician-Owned Credentialing and Enrollment Platform**

Credentialing Passport is a web application for a **single credentialing profile** reused across hospitals and payers, with **AI agents** for verification, pre-submission QA, and document ingestion. The **go-to-market wedge** is **vendors** (staffing, locums, etc.) who need **fast case coverage**: we **plug into existing hospital CVO systems** (Symplr, Medallion, etc.) via **exports and adapters** rather than replacing them, while keeping **HIPAA-grade** handling for labs and background artifacts. See `docs/product-strategy.md` for the full vendor/hospital/lab story.

## Features

### 🎯 Universal Passport
- **Single Source of Truth**: Complete credentialing profile stored once, reused everywhere
- **Secure Document Vault**: Upload and store all supporting documents with provenance tracking
- **Continuous Readiness**: Automatic monitoring for expirations, licensure changes, and recredentialing windows

### 🤖 Multi-Agent System
- **Workflow Orchestrator Agent**: Manages end-to-end credentialing workflows with parallel execution
- **Requirements & Checklist Agent**: Builds destination-specific requirement packs
- **Provider Intake Concierge Agent**: Collects missing information via guided chat
- **Document Ingestion & Data Extraction Agent**: Converts CVs and PDFs into structured fields
- **Data Quality & Consistency Agent**: Validates completeness and flags inconsistencies
- **Primary Source Verification Agent**: Automates license, board, and sanctions verification
- **Payer Enrollment Submission Agent**: Generates and submits payer-specific applications
- **Billing & Scheduling Guardrail Agent**: Translates effective dates into operational rules
- **Audit Trail Agent**: Creates evidence bundles for accreditation and compliance

### 📋 Credentialing Data Model
- **Identity & Demographics**: Names, aliases, DOB, SSN, address history (5-10 years)
- **Education & Training**: Medical school, residency, fellowship (lifetime)
- **Work History**: Employment, hospital appointments, privileges (5-10 years)
- **Licenses**: State licenses, DEA, CDS registrations (lifetime)
- **Board Certification**: Status and maintenance of certification (lifetime and current)
- **Malpractice**: Carrier, policy, loss runs, claims history (5-10 years)
- **Disclosures**: Sanctions, discipline, criminal, DEA actions (lifetime)
- **References**: Peer references (current)
- **Enrollment**: Practice locations, EIN, W9, EFT, specialty and taxonomy (current)

### 🔗 Data Source Integrations
- **NPPES/NPI**: Provider identity, taxonomy, enrollment status
- **CMS Medicare**: Enrollment data, ordering/referring eligibility, opt-out affidavits
- **OIG LEIE**: Federal healthcare program exclusions
- **NPDB**: Malpractice payments and adverse actions
- **State Licensing Boards**: License verification (FL, WA, CA, and more)
- **Board Certification**: Certification status and MOC
- **CAQH ProView**: Payer enrollment data
- **Open Payments**: Industry financial relationships

## Prerequisites

- **Python 3.10+**
- **Node.js 18+** (Next.js / Vercel)
- **SQLite** (included, used for development)
- **PostgreSQL** (optional, for production - set DATABASE_URL environment variable)

## Quick Start (Local)

```bash
# Backend (Terminal 1)
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000

# Frontend (Terminal 2)
# Use the Figma frontend for the full UI
cd Figma
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

### HTML demo (no Node; full local workflow)

Uses the same backend and exercises passports, workflows, task runs, audit events, **first billable–style guardrails**, **provider truth preview**, evidence download, and **state form populate**.

```bash
# Terminal 1: API (same as above)
cd backend && source .venv/bin/activate && uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Terminal 2: serve demo/ over HTTP (do not use file://)
cd demo && python3 -m http.server 8080
```

Open **`http://127.0.0.1:8080`**. The page defaults to `http://127.0.0.1:8000` for the API; use **Test connection** to verify. For a remote API, append `?api=https://your-backend.example.com` to the demo URL.

### Email bot (passport-based)

The API can send HTML emails built from passport (and optional workflow) data:

- `GET /api/email/status` — whether SMTP is configured
- `POST /api/email/send-passport` — body: `{ "to", "clinician_id", "template", "workflow_id"?, "note"? }`  
  Templates: `passport_summary`, `workflow_complete`, `credentialing_nudge`, `employer_missing_documents` (uses pre-flight / quality issues)
- `GET /api/demo/document-guidance` — short “how to obtain” copy for the HTML demo
- `GET /api/demo/vendor-strategy` — vendor vs hospital CVO narrative for demos
- `GET /api/demo/background-check-flow` — typical background/drug-screen friction vs passport path
- `GET /api/demo/vendor/status` — demo HIPAA + simulated agent ingest flags
- `POST /api/demo/vendor/sign-hipaa` — demo HIPAA authorization
- `POST /api/demo/vendor/simulate-lab-agent` — demo drug-screen ingest (requires HIPAA)
- `POST /api/demo/vendor/simulate-background-agent` — demo background report ingest (requires HIPAA)

**Without SMTP**, messages are **logged only** (see the uvicorn terminal). To send real mail, set:

| Variable | Example |
|----------|---------|
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `587` (or `465` for SSL) |
| `SMTP_USER` | your address |
| `SMTP_PASSWORD` | app password |
| `SMTP_FROM` | display/from address |
| `SMTP_USE_TLS` | `true` (default for 587) |
| `SMTP_SSL` | `true` when using port **465** |

The HTML demo includes an **Email bot** card that calls this endpoint.

During development:
- Frontend reads `NEXT_PUBLIC_API_BASE_URL` (defaults to `http://localhost:8000`)
- Backend CORS allows local + Vercel domains

## Vercel Deployment (Public Link)

1. Push this repo to GitHub
2. Create a Vercel project and select this repo
3. In Vercel, set **Root Directory** to `frontend`
4. Add environment variable:
   - `NEXT_PUBLIC_API_BASE_URL` = your deployed FastAPI URL
5. Deploy. Vercel will give you a public `https://...vercel.app` link

See `DEPLOY_VERCEL.md` for full instructions.

## Troubleshooting

- If you see “Failed to fetch” on Vercel, ensure:
  - Backend is live: `https://<backend>/api/ping`
  - Vercel env var: `NEXT_PUBLIC_API_BASE_URL=https://<backend>`
  - Redeploy after changing env vars

## Backend Deployment

Deploy the FastAPI backend separately (Render, Railway, Fly.io).
Set the `NEXT_PUBLIC_API_BASE_URL` in Vercel to that backend URL.

## API Endpoints

- `GET /api/ping` – Health check
- `GET /api/passport/{clinician_id}` – Get clinician passport
- `POST /api/passport` – Create or update passport
- `POST /api/passport/{clinician_id}/authorize` – Authorize organization access
- `GET /api/workflow/{workflow_id}` – Get workflow status and timeline
- `POST /api/workflow` – Start new credentialing workflow
- `GET /api/verification/{verification_id}` – Get verification results
- `POST /api/documents/upload` – Upload supporting documents
- `GET /api/requirements/{destination_id}` – Get requirements checklist
- `POST /api/enrollment/submit` – Submit payer enrollment application
- `GET /api/email/status` – SMTP configured vs log-only
- `POST /api/email/send-passport` – Send passport/workflow HTML email (includes employer / MSO missing-items template)
- `GET /api/demo/document-guidance` – Document finder snippets for the local demo
- `GET /api/demo/vendor-strategy` / `GET /api/demo/background-check-flow` – Vendor + CVO plug-and-play narrative
- `GET|POST /api/demo/vendor/*` – HIPAA + simulated lab/background agent (local demo state)

## Usage Workflow

1. **Create Passport**: Clinician completes guided intake, uploads documents, signs attestations
2. **Authorize Access**: When an organization needs credentialing, clinician authorizes access
3. **Automated Processing**: Agents run in parallel to verify, validate, and prepare submissions
4. **Exception Review**: Credentialing staff review only true exceptions and final approvals
5. **Continuous Monitoring**: System monitors for expirations and maintains readiness

## Product strategy

See `docs/product-strategy.md` for market context, competitor framing (Verifiable / Medallion / Symplr), scope (privileging, enrollment, reassignment), Provider Truth Graph, first billable date intelligence, and NCQA / Joint Commission–aligned modules.

## Architecture

See `docs/architecture.md` for detailed system architecture diagrams including:
- System architecture overview
- Agent interaction flows
- Data model architecture
- Integration layer details

## Data Sources

See `docs/data-sources.md` for complete list of credentialing data sources and APIs including:
- NPPES/NPI data sources
- CMS Medicare enrollment data
- State licensing board APIs
- OIG exclusions databases
- NPDB public data
- Board certification sources

## Roadmap

See `docs/roadmap.md` for planned enhancements including:
- Additional state licensing board integrations
- Enhanced AI agent capabilities
- Real-time verification workflows
- Advanced exception handling
