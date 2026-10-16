import uuid
from datetime import datetime, timezone
from sqlalchemy import (
    Column,
    String,
    Text,
    Integer,
    Boolean,
    DateTime,
    ForeignKey,
    JSON,
)
from sqlalchemy.orm import relationship
from app.database import Base


def generate_uuid(prefix: str = "") -> str:
    return f"{prefix}_{uuid.uuid4().hex[:12]}" if prefix else uuid.uuid4().hex[:16]


class Investigation(Base):
    __tablename__ = "investigations"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("inv"))
    title = Column(String(255), nullable=False)
    description = Column(Text, default="")
    status = Column(String(50), default="active")  # active, analyzing, analyzed
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    evidence_files = relationship("EvidenceFile", back_populates="investigation", cascade="all, delete-orphan")
    entities = relationship("Entity", back_populates="investigation", cascade="all, delete-orphan")
    events = relationship("Event", back_populates="investigation", cascade="all, delete-orphan")
    claims = relationship("Claim", back_populates="investigation", cascade="all, delete-orphan")
    relationships = relationship("Relationship", back_populates="investigation", cascade="all, delete-orphan")
    contradictions = relationship("Contradiction", back_populates="investigation", cascade="all, delete-orphan")


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("ev"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(20), nullable=False)  # txt, pdf
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    extracted_text = Column(Text, default="")
    page_count = Column(Integer, default=1)
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="evidence_files")


class Entity(Base):
    __tablename__ = "entities"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("ent"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    type = Column(String(50), nullable=False)  # person, username, phone, email, organization, location, financial, other
    value = Column(String(255), nullable=False)
    classification = Column(String(50), default="source_stated")  # source_stated, inferred, verified
    source_evidence_ids = Column(JSON, default=list)
    source_quotes = Column(JSON, default=list)
    page_references = Column(JSON, default=list)
    needs_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="entities")


class Event(Base):
    __tablename__ = "events"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("evt"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    date = Column(String(50), nullable=True)  # YYYY-MM-DD or readable date string, None if undated
    description = Column(Text, nullable=False)
    participant_entity_ids = Column(JSON, default=list)
    source_evidence_ids = Column(JSON, default=list)
    source_quotes = Column(JSON, default=list)
    classification = Column(String(50), default="source_stated")
    needs_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="events")


class Claim(Base):
    __tablename__ = "claims"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("clm"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    text = Column(Text, nullable=False)
    classification = Column(String(50), default="reported_claim")  # reported_claim, observation, inference
    entity_ids = Column(JSON, default=list)
    source_evidence_ids = Column(JSON, default=list)
    source_quotes = Column(JSON, default=list)
    needs_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="claims")


class Relationship(Base):
    __tablename__ = "relationships"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("rel"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    source_entity_id = Column(String(50), nullable=False)
    target_entity_id = Column(String(50), nullable=False)
    type = Column(String(100), nullable=False)  # mentioned_with, transferred_funds_to, authorized_access_for, etc.
    description = Column(Text, default="")
    source_evidence_ids = Column(JSON, default=list)
    source_quotes = Column(JSON, default=list)
    confidence_label = Column(String(50), default="source_supported")
    needs_review = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="relationships")


class Contradiction(Base):
    __tablename__ = "contradictions"

    id = Column(String(50), primary_key=True, default=lambda: generate_uuid("cnt"))
    investigation_id = Column(String(50), ForeignKey("investigations.id", ondelete="CASCADE"), nullable=False)
    claim_1_id = Column(String(50), nullable=True)
    claim_2_id = Column(String(50), nullable=True)
    entity_id = Column(String(50), nullable=True)
    contradiction_type = Column(String(50), default="statement_conflict")  # date_conflict, amount_conflict, statement_conflict
    description = Column(Text, nullable=False)
    claim_1_quote = Column(Text, default="")
    claim_2_quote = Column(Text, default="")
    evidence_1_id = Column(String(50), nullable=True)
    evidence_2_id = Column(String(50), nullable=True)
    status = Column(String(50), default="unresolved")  # unresolved, resolved, dismissed
    resolution_notes = Column(Text, default="")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    investigation = relationship("Investigation", back_populates="contradictions")
