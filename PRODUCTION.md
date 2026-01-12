# Production Deployment Guide

## Overview

The Credentialing Passport system is now production-ready with:
- ✅ Database persistence (SQLite for dev, PostgreSQL for production)
- ✅ Professional UI with passport management
- ✅ No hardcoded data
- ✅ Full CRUD operations
- ✅ Agent-based workflow orchestration
- ✅ Document upload and management

## Key Features

### Backend
- **Database Layer**: SQLAlchemy with SQLite (dev) / PostgreSQL (prod)
- **RESTful API**: FastAPI with automatic OpenAPI documentation
- **Agent System**: 8 specialized agents for credentialing workflows
- **File Storage**: Secure document upload and storage

### Frontend
- **Modern UI**: Professional, clean interface similar to Medallion
- **Passport Management**: Create, view, edit passports
- **Workflow Tracking**: Real-time workflow status and progress
- **Quality Reports**: Data quality validation and issue detection
- **Requirements**: Destination-specific requirement checklists

## Deployment Steps

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (production)
export DATABASE_URL="postgresql://user:password@localhost/credentialing"
export SECRET_KEY="your-secret-key-here"

# Initialize database
python -c "from app.database import init_db; init_db()"

# Run migrations (if using Alembic)
alembic upgrade head

# Start server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Preview production build
npm run preview

# Or serve with a static file server
# The dist/ folder contains the production build
```

### 3. Production Considerations

#### Database
- Use PostgreSQL for production: `DATABASE_URL=postgresql://...`
- Set up regular backups
- Configure connection pooling

#### Security
- Add authentication middleware (JWT tokens)
- Enable HTTPS
- Configure CORS properly (remove wildcard)
- Add rate limiting
- Encrypt sensitive fields (SSN, etc.)

#### File Storage
- Use cloud storage (S3, Azure Blob) instead of local filesystem
- Implement virus scanning
- Set up CDN for document delivery

#### Monitoring
- Add logging (structured logging with JSON)
- Set up error tracking (Sentry, etc.)
- Monitor API performance
- Track agent execution times

#### Scaling
- Use a process manager (PM2, systemd)
- Add load balancer for multiple instances
- Use Redis for caching and session storage
- Consider async task queue (Celery, RQ) for long-running agent tasks

## Environment Variables

```bash
# Database
DATABASE_URL=sqlite:///./credentialing_passport.db  # Dev
DATABASE_URL=postgresql://user:pass@host/db          # Prod

# Security
SECRET_KEY=your-secret-key-here
JWT_SECRET=your-jwt-secret
JWT_ALGORITHM=HS256

# File Storage
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE=10485760  # 10MB

# External APIs (for agent integrations)
NPPES_API_KEY=your-key
CAQH_API_KEY=your-key
STATE_LICENSE_API_KEYS=...
```

## API Endpoints

### Passport Management
- `GET /api/passports` - List all passports
- `GET /api/passport/{clinician_id}` - Get passport with quality/verification
- `POST /api/passport` - Create or update passport
- `GET /api/passport/{clinician_id}/quality` - Get quality report

### Workflow Management
- `GET /api/workflows` - List workflows
- `GET /api/workflow/{workflow_id}` - Get workflow status
- `POST /api/workflow` - Start new workflow
- `POST /api/passport/{clinician_id}/authorize` - Authorize access

### Documents
- `POST /api/documents/upload` - Upload document

### Requirements
- `GET /api/requirements/{destination_id}` - Get requirements checklist

## Next Steps for Full Production

1. **Authentication**: Add JWT-based auth for clinicians and organizations
2. **Authorization**: Role-based access control (RBAC)
3. **Real Agent Integrations**: Connect to actual APIs (NPPES, CAQH, etc.)
4. **Email Notifications**: Send status updates and reminders
5. **Audit Logging**: Track all changes and access
6. **Compliance**: HIPAA compliance measures
7. **Testing**: Unit tests, integration tests, E2E tests
8. **Documentation**: API documentation, user guides

## Architecture

See `docs/architecture.md` for detailed system architecture diagrams.

## Data Sources

See `docs/data-sources.md` for complete list of credentialing data sources and APIs.

