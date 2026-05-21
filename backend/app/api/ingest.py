"""
Admin / service ingest endpoints for PDF → `report_chunks`.

See docs/pdf-ingest-rag-pipeline.md and docs/fastapi-rag-railway-plan.md.
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException

from app.services.pdf_pipeline import ingest_report_pdf

router = APIRouter(prefix="/v1", tags=["ingest"])


@router.get("/ingest/health")
def ingest_health():
    return {"ingest": "ready", "pipeline": "stub"}


@router.post("/reports/{report_id}/ingest")
async def trigger_report_ingest(report_id: str):
    """
    Run (or enqueue) PDF shrink + extract + chunk + embed for one catalogue report.

    Auth: TODO — Supabase JWT + staff role, or service HMAC only.
    """
    try:
        return await ingest_report_pdf(report_id)
    except NotImplementedError as e:
        raise HTTPException(status_code=501, detail=str(e)) from e
