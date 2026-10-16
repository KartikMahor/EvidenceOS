from fastapi import APIRouter, Depends, HTTPException, Query, Response
from fastapi.responses import HTMLResponse, PlainTextResponse
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Investigation
from app.services.report import generate_markdown_report, generate_html_report

router = APIRouter(prefix="/api/investigations/{id}/report", tags=["Reports"])


@router.get("")
def download_investigation_report(
    id: str,
    format: str = Query("markdown", pattern="^(markdown|html|md)$"),
    db: Session = Depends(get_db)
):
    inv = db.query(Investigation).filter(Investigation.id == id).first()
    if not inv:
        raise HTTPException(status_code=404, detail=f"Investigation '{id}' not found.")

    if format in ["markdown", "md"]:
        content = generate_markdown_report(inv)
        safe_title = "".join(c for c in inv.title if c.isalnum() or c in ("-", "_")).strip() or id
        filename = f"EvidenceOS_Report_{safe_title}.md"
        return Response(
            content=content,
            media_type="text/markdown",
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
    else:
        content = generate_html_report(inv)
        safe_title = "".join(c for c in inv.title if c.isalnum() or c in ("-", "_")).strip() or id
        filename = f"EvidenceOS_Report_{safe_title}.html"
        return HTMLResponse(
            content=content,
            headers={"Content-Disposition": f'attachment; filename="{filename}"'}
        )
