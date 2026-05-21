# Supabase setup for admin PDF uploads (`report-pdfs`)

After this setup, **Admin → New report** can upload a **PDF** that is stored in Supabase Storage and linked in **`public.report_assets`** (same path used for `full_pdf` and `preview_pdf` until you generate a separate preview).

**Upload limit:** the app enforces **30 MB** after automatic compression (structure optimization, then JPEG re-encode tiers if needed). Oversized exports may still fail until you reduce them manually.

---

## 1. Run the SQL migration

Apply the migration that creates the bucket and Storage RLS policies:

- File: `supabase/migrations/20260521100000_report_pdf_storage.sql`

**Supabase Dashboard → SQL Editor:** paste that file and run once.

Or with CLI (from repo): `supabase db push` / `supabase migration up` (if the project is linked).

---

## 2. Confirm in the Dashboard

| Check | Where |
|--------|--------|
| Bucket **`report-pdfs`** exists | **Storage** → Buckets |
| **Public bucket** toggle | Leave **off** (private); access is via RLS policies |
| **`vector` extension** (for RAG later) | **Database → Extensions** → enable **vector** if not already (your initial migration runs `create extension if not exists vector`) |

---

## 3. Auth / roles

Upload uses the **anon key in the browser** + the logged-in user’s JWT. Policies require **`profiles.app_role` in (`admin`, `editor`)** for insert/update/delete on `storage.objects` in this bucket.

Ensure your admin user has been promoted:

```sql
update public.profiles
set app_role = 'admin'
where id = 'YOUR-USER-UUID';
```

(See `context/SUPABASE_SETUP.md`.)

---

## 4. Optional: RAG / vectors (not required for upload)

| Goal | Action |
|------|--------|
| Chunk + embed for AI | Follow `docs/pdf-ingest-rag-pipeline.md` (FastAPI on Railway). |
| Faster similarity search | After you have embeddings in `report_chunks`, add an **HNSW** index (see `docs/fastapi-rag-railway-plan.md` §9.4). |
| RPC `match_report_chunks` | Add when the backend is ready to query vectors (SQL in `docs/pdf-ingest-rag-pipeline.md`). |

Uploading a PDF **does not** require vectors to be enabled first.

---

## 5. Troubleshooting

| Symptom | Likely cause |
|---------|----------------|
| `new row violates row-level security policy` on Storage | Migration not applied, or user is not **admin/editor** in `profiles`. |
| `Bucket not found` | Bucket `report-pdfs` not created (migration not run). |
| Anonymous user cannot open preview PDF | Report must be **`published`** and a **`preview_pdf`** row must exist in `report_assets` (the new-report flow inserts both `full_pdf` and `preview_pdf` pointing at the same object). |

---

## 6. Frontend constant

Bucket id is defined in code as:

`src/lib/reportPdfStorage.js` → `REPORT_PDFS_BUCKET = 'report-pdfs'`

Keep this in sync with the migration if you rename the bucket.
