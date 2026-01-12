"""
Database models and session management for Credentialing Passport.
"""
from sqlalchemy import create_engine, Column, String, DateTime, JSON, Boolean, Float, Integer
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from datetime import datetime
import os

# Use SQLite for development, PostgreSQL for production
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./credentialing_passport.db")

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

