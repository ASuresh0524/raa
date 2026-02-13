"""
Database models and session management for Credentialing Passport.
"""
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Boolean, Float, Integer, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Use SQLite for development, PostgreSQL for production.
# Render may set DATABASE_URL as empty string, so guard with "or".
DATABASE_URL = os.getenv("DATABASE_URL") or "sqlite:////tmp/credentialing_passport.db"

if DATABASE_URL.startswith("sqlite:////"):
    # Ensure the sqlite directory exists (e.g., /tmp in Render).
    sqlite_path = DATABASE_URL.replace("sqlite:////", "/")
    sqlite_dir = os.path.dirname(sqlite_path)
    if sqlite_dir and not os.path.exists(sqlite_dir):
        os.makedirs(sqlite_dir, exist_ok=True)

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {},
    echo=False,
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class PassportDB(Base):
    """Database model for clinician passports."""
    __tablename__ = "passports"

    clinician_id = Column(String, primary_key=True, index=True)
    passport_data = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class WorkflowDB(Base):
    """Database model for credentialing workflows."""
    __tablename__ = "workflows"

    workflow_id = Column(String, primary_key=True, index=True)
    clinician_id = Column(String, index=True)
    destination_id = Column(String, index=True)
    destination_type = Column(String)
    status = Column(String)
    workflow_data = Column(JSON)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class DocumentDB(Base):
    """Database model for uploaded documents."""
    __tablename__ = "documents"

    document_id = Column(String, primary_key=True, index=True)
    clinician_id = Column(String, index=True)
    document_type = Column(String)
    file_name = Column(String)
    file_path = Column(String)
    document_metadata = Column(JSON)  # Renamed from 'metadata' (reserved in SQLAlchemy)
    created_at = Column(DateTime, default=datetime.utcnow)


class VerificationDB(Base):
    """Database model for verification results."""
    __tablename__ = "verifications"

    verification_id = Column(String, primary_key=True, index=True)
    clinician_id = Column(String, index=True)
    field_name = Column(String)
    source = Column(String)
    status = Column(String)
    result_data = Column(JSON)
    verified_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditEventDB(Base):
    """Append-only audit log (who/what/when/source)."""
    __tablename__ = "audit_events"

    event_id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, index=True)
    clinician_id = Column(String, index=True)
    actor = Column(String)  # agent:<name> | user:<id> | system
    action = Column(String)  # e.g. "verification.requested", "document.extracted"
    source = Column(String, nullable=True)  # external system / dataset / portal
    details = Column(JSON, nullable=True)  # evidence, fields, urls, receipts
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


class TaskRunDB(Base):
    """Tracks each agent run for a workflow, for timeline/ETA/exceptions."""
    __tablename__ = "task_runs"

    task_run_id = Column(String, primary_key=True, index=True)
    workflow_id = Column(String, index=True)
    clinician_id = Column(String, index=True)
    agent_name = Column(String, index=True)
    status = Column(String, index=True)  # pending|running|completed|failed|exception
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    eta_seconds = Column(Integer, nullable=True)
    exceptions = Column(JSON, nullable=True)
    output = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)


def get_db() -> Session:
    """Dependency for getting database session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Initialize database tables."""
    Base.metadata.create_all(bind=engine)

