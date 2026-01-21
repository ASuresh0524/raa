# Credentialing Passport for Clinicians

**Universal, Clinician-Owned Credentialing and Enrollment Platform**

Credentialing Passport is a production-ready web application that enables clinicians to create a single, comprehensive credentialing profile once, then reuse it across all future onboarding events. The platform uses AI agents to automate credentialing workflows, primary source verification, payer enrollment, and exception handling—transforming credentialing from a repetitive, manual process into an automated, evidence-based system.

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
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

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

## Usage Workflow

1. **Create Passport**: Clinician completes guided intake, uploads documents, signs attestations
2. **Authorize Access**: When an organization needs credentialing, clinician authorizes access
3. **Automated Processing**: Agents run in parallel to verify, validate, and prepare submissions
4. **Exception Review**: Credentialing staff review only true exceptions and final approvals
5. **Continuous Monitoring**: System monitors for expirations and maintains readiness

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
