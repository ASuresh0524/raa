"""
Database service layer for passport operations.
"""
from typing import Optional
from sqlalchemy.orm import Session
from datetime import datetime
import uuid

from .database import PassportDB, WorkflowDB, DocumentDB, VerificationDB
from .models import Passport, Workflow


def create_passport(db: Session, passport: Passport) -> PassportDB:
    """Create a new passport in the database."""
    db_passport = PassportDB(
        clinician_id=passport.clinician_id,
        passport_data=passport.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_passport)
    db.commit()
    db.refresh(db_passport)
    return db_passport


def get_passport(db: Session, clinician_id: str) -> Optional[PassportDB]:
    """Get a passport by clinician ID."""
    return db.query(PassportDB).filter(PassportDB.clinician_id == clinician_id).first()


def update_passport(db: Session, clinician_id: str, passport: Passport) -> Optional[PassportDB]:
    """Update an existing passport."""
    db_passport = get_passport(db, clinician_id)
    if not db_passport:
        return None
    
    db_passport.passport_data = passport.model_dump()
    db_passport.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_passport)
    return db_passport


def list_passports(db: Session, skip: int = 0, limit: int = 100):
    """List all passports with pagination."""
    return db.query(PassportDB).offset(skip).limit(limit).all()


def create_workflow(db: Session, workflow: Workflow) -> WorkflowDB:
    """Create a new workflow."""
    db_workflow = WorkflowDB(
        workflow_id=workflow.workflow_id,
        clinician_id=workflow.clinician_id,
        destination_id=workflow.destination_id,
        destination_type=workflow.destination_type,
        status=workflow.status.value,
        workflow_data=workflow.model_dump(),
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )
    db.add(db_workflow)
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


def get_workflow(db: Session, workflow_id: str) -> Optional[WorkflowDB]:
    """Get a workflow by ID."""
    return db.query(WorkflowDB).filter(WorkflowDB.workflow_id == workflow_id).first()


def update_workflow(db: Session, workflow_id: str, workflow: Workflow) -> Optional[WorkflowDB]:
    """Update a workflow."""
    db_workflow = get_workflow(db, workflow_id)
    if not db_workflow:
        return None
    
    db_workflow.status = workflow.status.value
    db_workflow.workflow_data = workflow.model_dump()
    db_workflow.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(db_workflow)
    return db_workflow


def list_workflows(db: Session, clinician_id: Optional[str] = None, skip: int = 0, limit: int = 100):
    """List workflows, optionally filtered by clinician."""
    query = db.query(WorkflowDB)
    if clinician_id:
        query = query.filter(WorkflowDB.clinician_id == clinician_id)
    return query.order_by(WorkflowDB.created_at.desc()).offset(skip).limit(limit).all()


def save_document(
    db: Session,
    clinician_id: str,
    document_type: str,
    file_name: str,
    file_path: str,
    metadata: dict,
) -> DocumentDB:
    """Save document metadata to database."""
    document_id = f"doc-{uuid.uuid4().hex[:12]}"
    db_document = DocumentDB(
        document_id=document_id,
        clinician_id=clinician_id,
        document_type=document_type,
        file_name=file_name,
        file_path=file_path,
        document_metadata=metadata,  # Use document_metadata instead of metadata
        created_at=datetime.utcnow(),
    )
    db.add(db_document)
    db.commit()
    db.refresh(db_document)
    return db_document

