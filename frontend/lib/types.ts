export interface HealthStatus {
  status: string;
  service: string;
  version: string;
  configured_model: string;
  ai_ready: boolean;
  mode: "live_api" | "evaluation_demo";
}

export interface InvestigationStats {
  evidence_count: number;
  entity_count: number;
  event_count: number;
  claim_count: number;
  relationship_count: number;
  contradiction_count: number;
  unresolved_contradictions: number;
}

export interface InvestigationListItem {
  id: string;
  title: string;
  description: string;
  status: "active" | "analyzing" | "analyzed" | "failed";
  created_at: string;
  updated_at: string;
  stats: InvestigationStats;
}

export interface EvidenceFile {
  id: string;
  investigation_id: string;
  filename: string;
  file_type: "txt" | "pdf";
  file_size: number;
  page_count: number;
  uploaded_at: string;
  extracted_text_preview?: string;
  extracted_text?: string;
}

export interface Entity {
  id: string;
  investigation_id: string;
  type: "person" | "username" | "phone" | "email" | "organization" | "location" | "financial" | "other" | string;
  value: string;
  classification: "source_stated" | "inferred" | "verified";
  source_evidence_ids: string[];
  source_quotes: string[];
  page_references: number[];
  needs_review: boolean;
  created_at: string;
}

export interface Event {
  id: string;
  investigation_id: string;
  date: string | null;
  description: string;
  participant_entity_ids: string[];
  source_evidence_ids: string[];
  source_quotes: string[];
  classification: string;
  needs_review: boolean;
  created_at: string;
}

export interface Claim {
  id: string;
  investigation_id: string;
  text: string;
  classification: "reported_claim" | "observation" | "inference" | string;
  entity_ids: string[];
  source_evidence_ids: string[];
  source_quotes: string[];
  needs_review: boolean;
  created_at: string;
}

export interface Relationship {
  id: string;
  investigation_id: string;
  source_entity_id: string;
  target_entity_id: string;
  type: string;
  description: string;
  source_evidence_ids: string[];
  source_quotes: string[];
  confidence_label: string;
  needs_review: boolean;
  created_at: string;
}

export interface Contradiction {
  id: string;
  investigation_id: string;
  claim_1_id: string | null;
  claim_2_id: string | null;
  entity_id: string | null;
  contradiction_type: "date_conflict" | "amount_conflict" | "statement_conflict" | string;
  description: string;
  claim_1_quote: string;
  claim_2_quote: string;
  evidence_1_id: string | null;
  evidence_2_id: string | null;
  status: "unresolved" | "resolved" | "dismissed";
  resolution_notes: string;
  created_at: string;
}

export interface InvestigationDetail {
  id: string;
  title: string;
  description: string;
  status: "active" | "analyzing" | "analyzed" | "failed";
  created_at: string;
  updated_at: string;
  evidence_files: EvidenceFile[];
  entities: Entity[];
  events: Event[];
  claims: Claim[];
  relationships: Relationship[];
  contradictions: Contradiction[];
  stats: InvestigationStats;
}

export interface GraphNodeData {
  label: string;
  type: string;
  classification?: string;
  sourceCount: number;
  sourceQuotes: string[];
  sourceEvidenceIds: string[];
  needsReview: boolean;
  raw?: any;
}

export interface GraphNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: GraphNodeData;
}

export interface GraphEdgeData {
  type: string;
  description: string;
  confidenceLabel: string;
  sourceQuotes: string[];
  sourceEvidenceIds: string[];
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
  data?: GraphEdgeData;
}

export interface GraphResponse {
  investigation_id: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
  stats: Record<string, number>;
}

export interface TimelineResponse {
  investigation_id: string;
  dated_events: Event[];
  undated_events: Event[];
  total_events: number;
}

export interface AnalysisResponse {
  investigation_id: string;
  status: string;
  model_used: string;
  entities_count: number;
  events_count: number;
  claims_count: number;
  relationships_count: number;
  contradictions_count: number;
  verification_summary: {
    grounded_findings: number;
    unverified_findings: number;
    is_live_api: boolean;
  };
}
