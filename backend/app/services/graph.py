import math
from typing import List, Dict, Any
from app.models import Entity, Relationship, Event, EvidenceFile
from app.schemas import GraphNode, GraphEdge, GraphNodeData, GraphEdgeData, GraphResponse


def build_investigation_graph(
    investigation_id: str,
    entities: List[Entity],
    relationships: List[Relationship],
    events: List[Event] = None,
    evidence_files: List[EvidenceFile] = None
) -> GraphResponse:
    """
    Constructs React Flow compatible nodes and edges from stored intelligence.
    Computes an aesthetic circular/orbital layout to prevent node overlap.
    """
    nodes: List[GraphNode] = []
    edges: List[GraphEdge] = []
    stats: Dict[str, int] = {}

    entity_id_set = {e.id for e in entities}
    total_nodes = len(entities)

    # Compute positions in an orbital layout around the center (x=450, y=300)
    center_x = 450.0
    center_y = 300.0
    radius = max(240.0, total_nodes * 28.0) if total_nodes > 1 else 0.0

    for idx, ent in enumerate(entities):
        stats[ent.type] = stats.get(ent.type, 0) + 1

        if total_nodes == 1:
            x, y = center_x, center_y
        else:
            angle = (2 * math.pi * idx) / total_nodes
            # Stagger alternate nodes slightly for visual depth
            current_radius = radius if idx % 2 == 0 else radius * 0.78
            x = center_x + current_radius * math.cos(angle)
            y = center_y + current_radius * math.sin(angle)

        node_data = GraphNodeData(
            label=ent.value,
            type=ent.type,
            classification=ent.classification,
            sourceCount=len(ent.source_evidence_ids or []),
            sourceQuotes=ent.source_quotes or [],
            sourceEvidenceIds=ent.source_evidence_ids or [],
            needsReview=bool(ent.needs_review),
            raw={
                "id": ent.id,
                "value": ent.value,
                "type": ent.type,
                "classification": ent.classification,
                "needs_review": bool(ent.needs_review)
            }
        )

        nodes.append(GraphNode(
            id=ent.id,
            type="customEntity",
            position={"x": round(x, 1), "y": round(y, 1)},
            data=node_data
        ))

    # Build Edges - only include relationships where both source and target exist
    for rel in relationships:
        if rel.source_entity_id in entity_id_set and rel.target_entity_id in entity_id_set:
            is_animated = rel.type in ["communicated_with", "transferred_funds_to", "authorized_access_for"]
            edge_data = GraphEdgeData(
                type=rel.type,
                description=rel.description or "",
                confidenceLabel=rel.confidence_label or "source_supported",
                sourceQuotes=rel.source_quotes or [],
                sourceEvidenceIds=rel.source_evidence_ids or []
            )

            edges.append(GraphEdge(
                id=rel.id,
                source=rel.source_entity_id,
                target=rel.target_entity_id,
                label=rel.type.replace("_", " "),
                animated=is_animated,
                data=edge_data
            ))

    return GraphResponse(
        investigation_id=investigation_id,
        nodes=nodes,
        edges=edges,
        stats=stats
    )
