from typing import List, Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict


# ============================================================================
# Core Investigation & Evidence Schemas
# ============================================================================

class InvestigationCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = ""


class InvestigationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None


class EvidenceFileOut(BaseModel):
    id: str
    investigation_id: str
    filename: str
    file_type: str
    file_size: int
    page_count: int
    uploaded_at: datetime
    extracted_text_preview: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class EntityOut(BaseModel):
    id: str
    investigation_id: str
    type: str  # person, username, phone, email, organization, location, financial, other
    value: str
    classification: str  # source_stated, inferred, verified
    source_evidence_ids: List[str] = []
    source_quotes: List[str] = []
    page_references: List[int] = []
    needs_review: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventOut(BaseModel):
    id: str
    investigation_id: str
    date: Optional[str] = None
    description: str
    participant_entity_ids: List[str] = []
    source_evidence_ids: List[str] = []
    source_quotes: List[str] = []
    classification: str = "source_stated"
    needs_review: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ClaimOut(BaseModel):
    id: str
    investigation_id: str
    text: str
    classification: str = "reported_claim"
    entity_ids: List[str] = []
    source_evidence_ids: List[str] = []
    source_quotes: List[str] = []
    needs_review: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class RelationshipOut(BaseModel):
    id: str
    investigation_id: str
    source_entity_id: str
    target_entity_id: str
    type: str
    description: str = ""
    source_evidence_ids: List[str] = []
    source_quotes: List[str] = []
    confidence_label: str = "source_supported"
    needs_review: bool = False
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContradictionOut(BaseModel):
    id: str
    investigation_id: str
    claim_1_id: Optional[str] = None
    claim_2_id: Optional[str] = None
    entity_id: Optional[str] = None
    contradiction_type: str  # date_conflict, amount_conflict, statement_conflict
    description: str
    claim_1_quote: str = ""
    claim_2_quote: str = ""
    evidence_1_id: Optional[str] = None
    evidence_2_id: Optional[str] = None
    status: str = "unresolved"  # unresolved, resolved, dismissed
    resolution_notes: str = ""
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContradictionResolveRequest(BaseModel):
    status: str = Field(..., pattern="^(resolved|unresolved|dismissed)$")
    resolution_notes: Optional[str] = ""


class InvestigationStats(BaseModel):
    evidence_count: int = 0
    entity_count: int = 0
    event_count: int = 0
    claim_count: int = 0
    relationship_count: int = 0
    contradiction_count: int = 0
    unresolved_contradictions: int = 0


class InvestigationListItem(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    stats: InvestigationStats

    model_config = ConfigDict(from_attributes=True)


class InvestigationDetail(BaseModel):
    id: str
    title: str
    description: str
    status: str
    created_at: datetime
    updated_at: datetime
    evidence_files: List[EvidenceFileOut] = []
    entities: List[EntityOut] = []
    events: List[EventOut] = []
    claims: List[ClaimOut] = []
    relationships: List[RelationshipOut] = []
    contradictions: List[ContradictionOut] = []
    stats: InvestigationStats

    model_config = ConfigDict(from_attributes=True)


# ============================================================================
# Graph Schemas (React Flow Compatible)
# ============================================================================

class GraphNodeData(BaseModel):
    label: str
    type: str
    classification: Optional[str] = None
    sourceCount: int = 0
    sourceQuotes: List[str] = []
    sourceEvidenceIds: List[str] = []
    needsReview: bool = False
    raw: Optional[Dict[str, Any]] = None


class GraphNode(BaseModel):
    id: str
    type: str = "customEntity"
    position: Dict[str, float]
    data: GraphNodeData


class GraphEdgeData(BaseModel):
    type: str
    description: str
    confidenceLabel: str
    sourceQuotes: List[str] = []
    sourceEvidenceIds: List[str] = []


class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: Optional[str] = None
    animated: bool = False
    data: Optional[GraphEdgeData] = None


class GraphResponse(BaseModel):
    investigation_id: str
    nodes: List[GraphNode]
    edges: List[GraphEdge]
    stats: Dict[str, int]


# ============================================================================
# Timeline Schemas
# ============================================================================

class TimelineResponse(BaseModel):
    investigation_id: str
    dated_events: List[EventOut]
    undated_events: List[EventOut]
    total_events: int


# ============================================================================
# AI Extraction Schemas (Structured Output from Gemma 4)
# ============================================================================

class AIExtractedEntity(BaseModel):
    id: str
    type: str = Field(description="One of: person, username, phone, email, organization, location, financial, other")
    value: str = Field(description="Extracted value or name, preserving source spelling")
    source_evidence_ids: List[str] = Field(default_factory=list, description="IDs of source files where entity appears")
    source_quotes: List[str] = Field(default_factory=list, description="Exact substrings from the source supporting this entity")
    classification: str = Field(default="source_stated", description="source_stated or inferred")


class AIExtractedEvent(BaseModel):
    id: str
    date: Optional[str] = Field(default=None, description="ISO format date YYYY-MM-DD or readable date string if found. Null if undated.")
    description: str = Field(description="Factual summary of the event based solely on source statements")
    participant_entity_ids: List[str] = Field(default_factory=list, description="Entity IDs participating in this event")
    source_evidence_ids: List[str] = Field(default_factory=list)
    source_quotes: List[str] = Field(default_factory=list, description="Exact verbatim quotes from source text")


class AIExtractedClaim(BaseModel):
    id: str
    text: str = Field(description="Statement or allegation made in the source")
    classification: str = Field(default="reported_claim", description="reported_claim, direct_observation, or inferred_claim")
    entity_ids: List[str] = Field(default_factory=list, description="Entities involved in or making this claim")
    source_evidence_ids: List[str] = Field(default_factory=list)
    source_quotes: List[str] = Field(default_factory=list, description="Exact verbatim supporting quote")


class AIExtractedRelationship(BaseModel):
    source_entity_id: str = Field(description="ID of source entity")
    target_entity_id: str = Field(description="ID of target entity")
    type: str = Field(description="Relationship type, e.g., mentioned_with, communicated_with, transferred_funds_to, authorized_access_for, works_for")
    description: str = Field(description="Factual description grounded in source evidence")
    source_evidence_ids: List[str] = Field(default_factory=list)
    source_quotes: List[str] = Field(default_factory=list, description="Exact verbatim supporting quote")


class AIExtractionResult(BaseModel):
    entities: List[AIExtractedEntity] = []
    events: List[AIExtractedEvent] = []
    claims: List[AIExtractedClaim] = []
    relationships: List[AIExtractedRelationship] = []


class AnalysisResponse(BaseModel):
    investigation_id: str
    status: str
    model_used: str
    entities_count: int
    events_count: int
    claims_count: int
    relationships_count: int
    contradictions_count: int
    verification_summary: Dict[str, Any]
