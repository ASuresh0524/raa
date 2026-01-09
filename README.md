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

- **Python 3.11+**
- **Node.js 20+** (Vite 7 requires Node ≥20.19.0)
- **PostgreSQL** (for production passport storage)
- **Redis** (for caching and session management)

## Quick Start

### Backend (FastAPI)

```bash
cd backend
python3 -m venv .venv        # Create virtualenv (Python 3.11+)
source .venv/bin/activate    # On Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Development server (hot reload on code changes)
uvicorn app.main:app --reload --port 8000
```

### Frontend (React + Vite)

```bash
cd frontend
npm install

# Development server (uses Vite proxy to talk to backend at http://localhost:8000)
npm run dev
```

Open `http://localhost:5173` in your browser.

During development:
- Frontend calls `/api/...` which Vite proxies to `http://localhost:8000`
- Backend CORS is configured to allow `http://localhost:5173`

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
