# PDF ingest, storage shrink, and RAG vector pipeline

This document is the **Researcha-specific** blueprint for turning report PDFs into **compact storage objects** plus **chunked text + embeddings** in Supabase for retrieval-augmented generation (RAG).

**Read together with:**

| Doc | Role |
|-----|------|
| [`architecture-ai-backend.md`](./architecture-ai-backend.md) | Monorepo layout, Vercel + Railway + Supabase boundaries, JWT to FastAPI. |
| [`fastapi-rag-railway-plan.md`](./fastapi-rag-railway-plan.md) | **Performance contract**: streaming, Flash vs Pro, query-embedding cache, HNSW, pre-embed at ingest, `top_k`, temperature, chunk sizing. **Implement RAG/chat behavior to match that guide** (adapt table names below). |

---

## Goals

1. **Less Supabase Storage usage** — store a **shrunk / optimized** PDF (or a derived “reader” PDF) in `report_assets` instead of bloated originals where possible.
2. **No huge blobs in Postgres** — only **text chunks + vectors** in `public.report_chunks` (and metadata on `public.reports` / `public.report_assets`).
3. **All heavy work on Railway (FastAPI)** — download PDF, linearize/compress, text extraction, chunking, embedding, DB writes. The browser and Edge functions stay thin.

---

## Existing schema (do not reinvent a second “documents” table)

From `supabase/migrations/20260408120000_researcha_initial.sql`:

| Object | Use |
|--------|-----|
| `public.report_assets` | `storage_path` for `preview_pdf` / `full_pdf` in Supabase Storage. |
| `public.reports` | Catalogue row (`id`, `slug`, `status`, …). |
| `public.report_chunks` | `report_id`, `chunk_index`, `content`, `token_count`, **`embedding vector(1536)`**. |

The generic plan in `fastapi-rag-railway-plan.md` uses a **`documents`** table and **Gemini 768** embeddings. In Researcha you should either:

- **Option A (recommended for minimal migration):** Use an embedding model with **1536 dimensions** (e.g. OpenAI `text-embedding-3-small` with `dimensions=1536`) so rows fit the current column, **or**
- **Option B:** Add a new migration to change `vector(1536)` → `vector(768)` **and** recreate indexes if you standardize on Gemini `text-embedding-004`.

Until you change the column, **every insert into `report_chunks.embedding` must match 1536 dims**.

---

## End-to-end data flow

```mermaid
sequenceDiagram
  participant Admin as Admin UI
  participant SB as Supabase Storage
  participant API as FastAPI Railway
  participant PG as Postgres pgvector

  Admin->>SB: Upload PDF (existing flow)
  Admin->>API: POST reindex job (report_id + JWT or HMAC)
  API->>SB: Download PDF bytes (service role)
  API->>API: Shrink / optimize PDF
  API->>SB: Optional: overwrite asset with smaller file
  API->>API: Extract plain text
  API->>API: Chunk + embed chunks
  API->>PG: Delete old chunks for report_id; insert new rows
```

**Why backend downloads:** the service role key and PDF bytes never pass through the end-user browser.

---

## Pipeline stages (FastAPI)

### 1. Fetch

- Resolve `report_id` → rows in `report_assets` for `full_pdf` (ingest usually uses full document; preview-only is a product choice).
- `storage_path` + bucket → download via Supabase Storage API using **`SUPABASE_SERVICE_ROLE_KEY`** on Railway only.

### 2. Shrink / optimize (storage win)

Purpose: reduce **Storage** bill and download time for humans; extraction can run on the **optimized** bytes.

Techniques (pick one or combine; all are backend concerns):

| Approach | Notes |
|----------|--------|
| **pikepdf / pypdf** | Remove redundant objects, compress streams, drop embedded thumbnails if policy allows. Pure Python-friendly on Railway. |
| **qpdf --linearize** | Good for web-optimized linearization; may need a **Dockerfile** on Railway with `qpdf` installed. |
| **Ghostscript** | Aggressive size reduction; also usually **Dockerfile**. |

**Policy:** Never shrink in a way that removes text needed for RAG without validating extraction first (spot-check chunk count and sample text).

### 3. Text extraction

| Library | Pros |
|---------|------|
| **PyMuPDF (`fitz`)** | Fast, good text order on many PDFs; can also rasterize pages if you add “first page only” previews later. |
| **pypdf** | Lightweight; weaker on complex layouts. |

Output: a **single normalized UTF-8 string** (or per-page array then join with `\n\n`).

### 4. Chunking

Align with **§9.7** in `fastapi-rag-railway-plan.md`: target **~300–600 tokens** (or ~800–1.2k chars as a rough stand-in before `tiktoken`), with **overlap** (e.g. 50–100 tokens) so boundaries do not split facts.

Implementation detail: prefer **token-based** splitting when the embedder is token-aware (OpenAI), else character-based with conservative limits.

### 5. Embedding (ingest-time only)

Align with **§9.3 / §9.5** in `fastapi-rag-railway-plan.md`:

- Use **`retrieval_document`** (or provider equivalent) at **ingest**.
- Use **`retrieval_query`** (or equivalent) at **query** time for the user question.
- **Pre-embed at ingest**; at query time embed **only the question** (plus optional cache for repeated questions).

### 6. Write to Postgres

For each chunk `i`:

- `report_id` = catalogue id  
- `chunk_index` = `i` (0-based; enforce `unique (report_id, chunk_index)` by deleting old chunks first)  
- `content` = chunk text  
- `token_count` = optional but useful for budgeting context  
- `embedding` = vector literal compatible with `vector(1536)`

**Transaction pattern:** `DELETE FROM report_chunks WHERE report_id = $1` then batch `INSERT` (or `upsert` if you use stable chunk keys later).

### 7. Vector index (query-time speed)

The initial migration comments out `ivfflat`. For production volume, add an **HNSW** index on `report_chunks.embedding` (see §9.4 in the performance plan). Apply via a **new migration** when you have enough rows to justify tuning `m` / `ef_construction`.

### 8. RPC for RAG retrieval

Add a Supabase RPC such as `match_report_chunks(query_embedding vector(1536), match_count int, allowed_report_ids uuid[])` that:

- Restricts results to `report_id = ANY(allowed_report_ids)` where `allowed_report_ids` is computed **after** FastAPI checks entitlements / staff role (never trust the client alone).
- Orders by cosine distance (`<=>`) and returns `content`, `report_id`, `chunk_index`, optional similarity score.

The generic `match_documents` in the plan is the same idea; swap table/column names to Researcha.

---

## API surface (FastAPI, proposed)

| Method | Path | Purpose |
|--------|------|---------|
| `POST` | `/v1/reports/{report_id}/ingest` | Trigger full pipeline for one report (admin/service auth). |
| `GET` | `/v1/reports/{report_id}/ingest/status` | Optional: job status if you move work to a queue. |
| `POST` | `/v1/rag/...` | Chat + retrieval — follow streaming + latency patterns in `fastapi-rag-railway-plan.md`. |

**Auth:** Admin ingest should require **verified Supabase JWT** with `profiles.app_role in ('admin','editor')` **or** a Railway-only **HMAC / shared secret** between Supabase Edge cron and FastAPI (if you trigger ingest server-side only).

---

## What stays small where

| Location | What you store |
|----------|----------------|
| **Storage** | One optimized PDF per asset key (and optional separate “source archive” in cold storage outside Supabase if legal needs originals). |
| **Postgres** | Text chunks + `vector(1536)` only — no PDF binary. |
| **Railway** | Ephemeral disk during processing; do not rely on local disk for durability. |

---

## Frontend responsibilities (minimal)

- After admin uploads a PDF and saves `report_assets`, call **ingest** (or rely on a Supabase **Edge Function** / database webhook that forwards to FastAPI—still “not heavy in the browser”).
- Show “Indexing…” / “Ready for AI” state on `AdminReportEditPage` when `report_chunks` exist.

---

## Implementation order (suggested)

1. FastAPI: download + extract + chunk **without** embeddings; log chunk sizes.  
2. Wire **embeddings + delete/insert** into `report_chunks`.  
3. Add **`match_report_chunks`** RPC + HNSW.  
4. Implement **RAG query** path per `fastapi-rag-railway-plan.md` (streaming, `top_k`, caches).  
5. Add **PDF shrink** step and optional Storage overwrite.  
6. Harden **auth**, rate limits, and audit logging (`admin_audit_log`).

---

## Code anchors in this repo

| Area | Path |
|------|------|
| Backend app entry | `backend/app/main.py` |
| Ingest routes (stub → impl) | `backend/app/api/ingest.py` |
| PDF + orchestration stubs | `backend/app/services/pdf_pipeline.py` |
| Chunking helpers | `backend/app/services/chunking.py` |

Extend `backend/requirements.txt` as you implement (PyMuPDF, OpenAI or Google SDK, `tiktoken`, etc.).
