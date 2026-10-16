from typing import Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import (
    Investigation,
    EvidenceFile,
    Entity,
    Event,
    Claim,
    Relationship,
    Contradiction,
    generate_uuid
)
from app.schemas import AnalysisResponse
from app.services.gemma import run_gemma_extraction
from app.services.validation import validate_and_ground_finding
from app.services.contradictions import detect_contradictions_in_investigation

router = APIRouter(prefix="/api/investigations/{id}/analyze", tags=["Analysis"])


@router.post("", response_model=AnalysisResponse)
def analyze_investigation(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")

    evidence_files = db.query(EvidenceFile).filter(EvidenceFile.investigation_id == id).all()
    if not evidence_files:
        raise HTTPException(
            status_code=400,
            detail="No evidence files uploaded for this investigation. Please upload at least one .txt or .pdf file."
        )

    # Prepare evidence map for grounding
    evidence_items = [
        {"id": ev.id, "filename": ev.filename, "text": ev.extracted_text}
        for ev in evidence_files
    ]
    evidence_map = {ev.id: ev.extracted_text for ev in evidence_files}

    # Mark status as analyzing
    inv.status = "analyzing"
    db.commit()

    try:
        # Run Gemma extraction
        ai_result, model_used, is_live = run_gemma_extraction(evidence_items)

        # Clear previous findings to prevent duplicates on re-analysis
        db.query(Relationship).filter(Relationship.investigation_id == id).delete()
        db.query(Claim).filter(Claim.investigation_id == id).delete()
        db.query(Event).filter(Event.investigation_id == id).delete()
        db.query(Entity).filter(Entity.investigation_id == id).delete()
        db.query(Contradiction).filter(Contradiction.investigation_id == id).delete()
        db.flush()

        # Map AI entity ID to new DB entity ID to maintain consistent foreign keys
        entity_id_translation: Dict[str, str] = {}
        persisted_entities: Dict[str, Entity] = {}

        total_grounded_findings = 0
        total_unverified_findings = 0

        # 1. Persist Entities
        for ai_ent in ai_result.entities:
            # Map evidence IDs: if model used relative names, map them
            mapped_ev_ids = []
            for ev_id in ai_ent.source_evidence_ids:
                if ev_id in evidence_map:
                    mapped_ev_ids.append(ev_id)
                else:
                    # Match by filename or fallback to first evidence
                    matched = next((e["id"] for e in evidence_items if ev_id in e["filename"] or e["filename"] in ev_id), None)
                    mapped_ev_ids.append(matched or evidence_items[0]["id"])

            grounding = validate_and_ground_finding(ai_ent.source_quotes, mapped_ev_ids, evidence_map)
            if grounding["is_grounded"]:
                total_grounded_findings += 1
            else:
                total_unverified_findings += 1

            new_ent_id = generate_uuid("ent")
            entity_id_translation[ai_ent.id] = new_ent_id

            db_ent = Entity(
                id=new_ent_id,
                investigation_id=id,
                type=ai_ent.type.lower(),
                value=ai_ent.value.strip(),
                classification=ai_ent.classification,
                source_evidence_ids=mapped_ev_ids,
                source_quotes=ai_ent.source_quotes,
                needs_review=grounding["needs_review"]
            )
            db.add(db_ent)
            persisted_entities[new_ent_id] = db_ent

        db.flush()

        # 2. Persist Events
        persisted_events = []
        for ai_evt in ai_result.events:
            mapped_ev_ids = [
                ev_id if ev_id in evidence_map else evidence_items[0]["id"]
                for ev_id in ai_evt.source_evidence_ids
            ] or [evidence_items[0]["id"]]

            grounding = validate_and_ground_finding(ai_evt.source_quotes, mapped_ev_ids, evidence_map)
            if grounding["is_grounded"]:
                total_grounded_findings += 1
            else:
                total_unverified_findings += 1

            # Translate participant IDs
            translated_participants = [
                entity_id_translation.get(pid, pid)
                for pid in ai_evt.participant_entity_ids
            ]

            db_evt = Event(
                id=generate_uuid("evt"),
                investigation_id=id,
                date=ai_evt.date if ai_evt.date and ai_evt.date.strip() else None,
                description=ai_evt.description.strip(),
                participant_entity_ids=translated_participants,
                source_evidence_ids=mapped_ev_ids,
                source_quotes=ai_evt.source_quotes,
                classification="source_stated",
                needs_review=grounding["needs_review"]
            )
            db.add(db_evt)
            persisted_events.append(db_evt)

        db.flush()

        # 3. Persist Claims
        persisted_claims = []
        for ai_clm in ai_result.claims:
            mapped_ev_ids = [
                ev_id if ev_id in evidence_map else evidence_items[0]["id"]
                for ev_id in ai_clm.source_evidence_ids
            ] or [evidence_items[0]["id"]]

            grounding = validate_and_ground_finding(ai_clm.source_quotes, mapped_ev_ids, evidence_map)
            if grounding["is_grounded"]:
                total_grounded_findings += 1
            else:
                total_unverified_findings += 1

            translated_entities = [
                entity_id_translation.get(eid, eid)
                for eid in ai_clm.entity_ids
            ]

            db_clm = Claim(
                id=generate_uuid("clm"),
                investigation_id=id,
                text=ai_clm.text.strip(),
                classification=ai_clm.classification,
                entity_ids=translated_entities,
                source_evidence_ids=mapped_ev_ids,
                source_quotes=ai_clm.source_quotes,
                needs_review=grounding["needs_review"]
            )
            db.add(db_clm)
            persisted_claims.append(db_clm)

        db.flush()

        # 4. Persist Relationships
        persisted_relationships = []
        for ai_rel in ai_result.relationships:
            src_id = entity_id_translation.get(ai_rel.source_entity_id, ai_rel.source_entity_id)
            tgt_id = entity_id_translation.get(ai_rel.target_entity_id, ai_rel.target_entity_id)

            # Ensure both entities exist in our persisted list
            if src_id not in persisted_entities or tgt_id not in persisted_entities:
                continue

            mapped_ev_ids = [
                ev_id if ev_id in evidence_map else evidence_items[0]["id"]
                for ev_id in ai_rel.source_evidence_ids
            ] or [evidence_items[0]["id"]]

            grounding = validate_and_ground_finding(ai_rel.source_quotes, mapped_ev_ids, evidence_map)

            db_rel = Relationship(
                id=generate_uuid("rel"),
                investigation_id=id,
                source_entity_id=src_id,
                target_entity_id=tgt_id,
                type=ai_rel.type.strip().lower(),
                description=ai_rel.description.strip(),
                source_evidence_ids=mapped_ev_ids,
                source_quotes=ai_rel.source_quotes,
                confidence_label="source_supported" if grounding["is_grounded"] else "needs_review",
                needs_review=grounding["needs_review"]
            )
            db.add(db_rel)
            persisted_relationships.append(db_rel)

        db.flush()

        # 5. Detect and persist Contradictions
        detected_contradictions = detect_contradictions_in_investigation(
            investigation_id=id,
            claims=persisted_claims,
            events=persisted_events,
            entities=list(persisted_entities.values())
        )
        for cnt in detected_contradictions:
            db.add(cnt)

        # Update Investigation state
        inv.status = "analyzed"
        db.commit()

        return AnalysisResponse(
            investigation_id=id,
            status="analyzed",
            model_used=model_used,
            entities_count=len(persisted_entities),
            events_count=len(persisted_events),
            claims_count=len(persisted_claims),
            relationships_count=len(persisted_relationships),
            contradictions_count=len(detected_contradictions),
            verification_summary={
                "grounded_findings": total_grounded_findings,
                "unverified_findings": total_unverified_findings,
                "is_live_api": is_live
            }
        )

    except Exception as e:
        db.rollback()
        inv.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Analysis pipeline execution failed: {str(e)}")
