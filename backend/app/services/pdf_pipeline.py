"""
PDF download → optional shrink → text extract → chunk → embed → `report_chunks`.

Orchestration lives here; keep side effects (Storage upload, Supabase writes) explicit.

Spec: docs/pdf-ingest-rag-pipeline.md
Performance patterns: docs/fastapi-rag-railway-plan.md
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class IngestResult:
    report_id: str
    chunks_written: int
    storage_updated: bool
    detail: str


async def ingest_report_pdf(report_id: str, **_kwargs: Any) -> IngestResult:
    """
    Full pipeline placeholder.

    Planned steps:
      1. Load `report_assets` paths for `report_id` (service role).
      2. Download PDF bytes from Storage.
      3. Shrink / linearize PDF (optional write-back to Storage).
      4. Extract plaintext.
      5. `chunk_text` from `app.services.chunking`.
      6. Embed each chunk (ingest-time / retrieval_document semantics).
      7. Delete existing `report_chunks` for `report_id`; insert new rows.

    Embedding dimension must match `report_chunks.embedding` (currently 1536).
    """
    raise NotImplementedError(
        "Implement ingest per docs/pdf-ingest-rag-pipeline.md "
        f"(report_id={report_id!r})"
    )
