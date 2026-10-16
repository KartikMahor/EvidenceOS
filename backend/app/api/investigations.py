from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Investigation, Contradiction, Entity, Event, Claim, Relationship, EvidenceFile
from app.schemas import (
    InvestigationCreate,
    InvestigationUpdate,
    InvestigationListItem,
    InvestigationDetail,
    InvestigationStats,
    GraphResponse,
    TimelineResponse,
    ContradictionOut,
    ContradictionResolveRequest,
    EventOut
)
from app.services.graph import build_investigation_graph

router = APIRouter(prefix="/api/investigations", tags=["Investigations"])


def compute_investigation_stats(inv: Investigation) -> InvestigationStats:
    unresolved = sum(1 for c in inv.contradictions if c.status == "unresolved")
    return InvestigationStats(
        evidence_count=len(inv.evidence_files),
        entity_count=len(inv.entities),
        event_count=len(inv.events),
        claim_count=len(inv.claims),
        relationship_count=len(inv.relationships),
        contradiction_count=len(inv.contradictions),
        unresolved_contradictions=unresolved
    )


@router.get("", response_model=List[InvestigationListItem])
def list_investigations(db: Session = Depends(get_db)):
    investigations = db.query(Investigation).order_by(Investigation.created_at.desc()).all()
    results = []
    for inv in investigations:
        stats = compute_investigation_stats(inv)
        results.append(InvestigationListItem(
            id=inv.id,
            title=inv.title,
            description=inv.description or "",
            status=inv.status,
            created_at=inv.created_at,
            updated_at=inv.updated_at,
            stats=stats
        ))
    return results


@router.post("", response_model=InvestigationDetail, status_code=status.HTTP_201_CREATED)
def create_investigation(payload: InvestigationCreate, db: Session = Depends(get_db)):
    new_inv = Investigation(
        title=payload.title.strip(),
        description=(payload.description or "").strip(),
        status="active"
    )
    db.add(new_inv)
    db.commit()
    db.refresh(new_inv)
    stats = compute_investigation_stats(new_inv)
    return InvestigationDetail(
        id=new_inv.id,
        title=new_inv.title,
        description=new_inv.description,
        status=new_inv.status,
        created_at=new_inv.created_at,
        updated_at=new_inv.updated_at,
        evidence_files=[],
        entities=[],
        events=[],
        claims=[],
        relationships=[],
        contradictions=[],
        stats=stats
    )


@router.get("/{id}", response_model=InvestigationDetail)
def get_investigation(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")
    
    stats = compute_investigation_stats(inv)
    return InvestigationDetail(
        id=inv.id,
        title=inv.title,
        description=inv.description,
        status=inv.status,
        created_at=inv.created_at,
        updated_at=inv.updated_at,
        evidence_files=inv.evidence_files,
        entities=inv.entities,
        events=inv.events,
        claims=inv.claims,
        relationships=inv.relationships,
        contradictions=inv.contradictions,
        stats=stats
    )


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_investigation(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")
    db.delete(inv)
    db.commit()
    return None


@router.get("/{id}/graph", response_model=GraphResponse)
def get_investigation_graph(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")
    
    return build_investigation_graph(
        investigation_id=inv.id,
        entities=inv.entities,
        relationships=inv.relationships,
        events=inv.events,
        evidence_files=inv.evidence_files
    )


@router.get("/{id}/timeline", response_model=TimelineResponse)
def get_investigation_timeline(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")
    
    dated = [EventOut.model_validate(e) for e in inv.events if e.date]
    undated = [EventOut.model_validate(e) for e in inv.events if not e.date]

    # Sort dated events chronologically
    dated.sort(key=lambda x: x.date or "")

    return TimelineResponse(
        investigation_id=inv.id,
        dated_events=dated,
        undated_events=undated,
        total_events=len(inv.events)
    )


@router.get("/{id}/contradictions", response_model=List[ContradictionOut])
def get_investigation_contradictions(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")
    return [ContradictionOut.model_validate(c) for c in inv.contradictions]


@router.post("/{id}/contradictions/{contradiction_id}/resolve", response_model=ContradictionOut)
def resolve_contradiction(
    id: str,
    contradiction_id: str,
    payload: ContradictionResolveRequest,
    db: Session = Depends(get_db)
):
    cnt = db.query(Contradiction).filter(
        Contradiction.id == contradiction_id,
        Contradiction.investigation_id == id
    ).first()
    if not cnt:
        raise HTTPException(status_code=404, detail=f"Contradiction '{contradiction_id}' not found in investigation.")
    
    cnt.status = payload.status
    if payload.resolution_notes:
        cnt.resolution_notes = payload.resolution_notes
    db.commit()
    db.refresh(cnt)
    return ContradictionOut.model_validate(cnt)
