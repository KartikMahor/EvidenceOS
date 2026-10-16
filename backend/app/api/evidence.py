import os
import shutil
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models import Investigation, EvidenceFile, generate_uuid
from app.schemas import EvidenceFileOut
from app.services.document_parser import parse_document, DocumentParsingError

router = APIRouter(prefix="/api/investigations/{id}/evidence", tags=["Evidence"])

ALLOWED_EXTENSIONS = {"txt", "pdf", "png", "jpg", "jpeg"}
MAX_BYTES = settings.max_upload_size_mb * 1024 * 1024


@router.post("", response_model=List[EvidenceFileOut], status_code=status.HTTP_201_CREATED)
async def upload_evidence_files(
    id: str,
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")

    if not files:
        raise HTTPException(status_code=400, detail="No files provided for upload.")

    saved_evidence_list: List[EvidenceFile] = []
    errors = []

    # Target folder for this investigation
    inv_dir = os.path.join(settings.upload_dir, id)
    os.makedirs(inv_dir, exist_ok=True)

    for file in files:
        filename = file.filename or "unknown"
        ext = filename.split(".")[-1].lower() if "." in filename else ""

        if ext not in ALLOWED_EXTENSIONS:
            errors.append(f"File '{filename}' has an unsupported extension (.{ext}). Only .txt and .pdf are allowed.")
            continue

        file_id = generate_uuid("ev")
        safe_filename = f"{file_id}_{os.path.basename(filename)}"
        target_path = os.path.join(inv_dir, safe_filename)

        # Read content and enforce size limit
        try:
            content = await file.read()
            if len(content) == 0:
                errors.append(f"File '{filename}' is empty (0 bytes).")
                continue
            if len(content) > MAX_BYTES:
                errors.append(f"File '{filename}' exceeds {settings.max_upload_size_mb} MB limit ({len(content)} bytes).")
                continue

            with open(target_path, "wb") as f:
                f.write(content)

            # Parse document text
            parsed_data = parse_document(target_path, filename)

            ev_record = EvidenceFile(
                id=file_id,
                investigation_id=inv.id,
                filename=filename,
                file_type=parsed_data["file_type"],
                file_size=len(content),
                file_path=target_path,
                extracted_text=parsed_data["text"],
                page_count=parsed_data["page_count"]
            )
            db.add(ev_record)
            saved_evidence_list.append(ev_record)

        except DocumentParsingError as pe:
            if os.path.exists(target_path):
                try:
                    os.remove(target_path)
                except OSError:
                    pass
            errors.append(f"Failed to extract text from '{filename}': {str(pe)}")
        except Exception as e:
            if os.path.exists(target_path):
                try:
                    os.remove(target_path)
                except OSError:
                    pass
            errors.append(f"Unexpected error processing '{filename}': {str(e)}")

    if not saved_evidence_list and errors:
        raise HTTPException(
            status_code=400,
            detail={"message": "All uploaded files failed validation or parsing.", "errors": errors}
        )

    db.commit()

    # Refresh saved records
    response_items = []
    for ev in saved_evidence_list:
        db.refresh(ev)
        response_items.append(EvidenceFileOut(
            id=ev.id,
            investigation_id=ev.investigation_id,
            filename=ev.filename,
            file_type=ev.file_type,
            file_size=ev.file_size,
            page_count=ev.page_count,
            uploaded_at=ev.uploaded_at,
            extracted_text_preview=(ev.extracted_text[:200] + "...") if len(ev.extracted_text) > 200 else ev.extracted_text
        ))

    return response_items


@router.get("", response_model=List[EvidenceFileOut])
def list_evidence_files(id: str, db: Session = Depends(get_db)):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")

    response_items = []
    for ev in inv.evidence_files:
        response_items.append(EvidenceFileOut(
            id=ev.id,
            investigation_id=ev.investigation_id,
            filename=ev.filename,
            file_type=ev.file_type,
            file_size=ev.file_size,
            page_count=ev.page_count,
            uploaded_at=ev.uploaded_at,
            extracted_text_preview=(ev.extracted_text[:200] + "...") if len(ev.extracted_text) > 200 else ev.extracted_text
        ))
    return response_items


@router.get("/{evidence_id}")
def get_evidence_file_details(id: str, evidence_id: str, db: Session = Depends(get_db)):
    ev = db.query(EvidenceFile).filter(
        EvidenceFile.id == evidence_id,
        EvidenceFile.investigation_id == id
    ).first()
    if not ev:
        raise HTTPException(status_code=404, detail=f"Evidence file '{evidence_id}' not found.")

    return {
        "id": ev.id,
        "investigation_id": ev.investigation_id,
        "filename": ev.filename,
        "file_type": ev.file_type,
        "file_size": ev.file_size,
        "page_count": ev.page_count,
        "uploaded_at": ev.uploaded_at,
        "extracted_text": ev.extracted_text
    }
