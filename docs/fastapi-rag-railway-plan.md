# FastAPI RAG Backend — Full Build & Deploy Plan
### Stack: Python · FastAPI · Gemini · Supabase pgvector · Railway

> **Researcha integration:** This file is the **performance and RAG-behavior reference** (streaming, caching, HNSW, chunking, temperatures). The production app uses **`public.report_chunks`** with **`vector(1536)`** and `report_assets` — not the generic `documents` / `768`-dim example below. Follow the same *patterns* here, but map types and SQL to [`pdf-ingest-rag-pipeline.md`](./pdf-ingest-rag-pipeline.md) and [`architecture-ai-backend.md`](./architecture-ai-backend.md).

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Environment Setup](#2-environment-setup)
3. [Dependencies](#3-dependencies)
4. [Supabase pgvector Setup](#4-supabase-pgvector-setup)
5. [FastAPI App — Core Setup](#5-fastapi-app--core-setup)
6. [Embedding Pipeline](#6-embedding-pipeline)
7. [Vector Search](#7-vector-search)
8. [RAG Generation with Streaming](#8-rag-generation-with-streaming)
9. [Making AI Responses Fast & Efficient](#9-making-ai-responses-fast--efficient)
10. [Ingest Endpoint](#10-ingest-endpoint)
11. [RAG Query Endpoint](#11-rag-query-endpoint)
12. [Auth — Protect Your Endpoints](#12-auth--protect-your-endpoints)
13. [Deploy to Railway](#13-deploy-to-railway)
14. [Connect React Frontend](#14-connect-react-frontend)
15. [Performance Checklist](#15-performance-checklist)

---

## 1. Project Structure

```
my-rag-backend/
├── main.py              # FastAPI app, all routes
├── rag.py               # RAG pipeline logic
├── embeddings.py        # Embedding + cache logic
├── db.py                # Supabase client
├── auth.py              # JWT verification
├── requirements.txt     # Python dependencies
├── Procfile             # Tells Railway how to run the app
├── .env                 # Local secrets (never commit this)
└── .gitignore
```

---

## 2. Environment Setup

### On your laptop (one time)

```bash
# Install Python 3.11+ from python.org, then:
python -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

pip install -r requirements.txt
```

### Your `.env` file (local only, never push to GitHub)

```env
GEMINI_API_KEY=your_gemini_key_here
SUPABASE_URL=https://yourproject.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key_here
SUPABASE_JWT_SECRET=your_jwt_secret_here
```

> Get your Gemini key from [Google AI Studio](https://aistudio.google.com).
> Get Supabase keys from your project dashboard under Settings → API.
> Use the **service role key** for the backend (bypasses RLS). Never expose this in the frontend.

### `.gitignore`

```
.env
venv/
__pycache__/
*.pyc
```

---

## 3. Dependencies

### `requirements.txt`

```
fastapi==0.111.0
uvicorn==0.29.0
google-generativeai==0.7.2
supabase==2.4.0
python-dotenv==1.0.1
python-jose==3.3.0
httpx==0.27.0
```

**What each one does:**

| Package | Type | Why you need it |
|---|---|---|
| `fastapi` | API framework | Defines your routes and handles HTTP requests |
| `uvicorn` | ASGI server | Actually runs FastAPI — like a web server |
| `google-generativeai` | AI SDK | Calls Gemini for embeddings and generation |
| `supabase` | DB client | Connects to Supabase, runs vector search |
| `python-dotenv` | Config | Loads your `.env` secrets into the app |
| `python-jose` | Auth | Verifies Supabase JWT tokens from your users |
| `httpx` | HTTP client | Makes async HTTP calls if needed |

---

## 4. Supabase pgvector Setup

Run these once in your Supabase SQL editor (Dashboard → SQL Editor).

### Enable the extension

```sql
create extension if not exists vector;
```

### Create the documents table

```sql
create table documents (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users(id) on delete cascade,
  content     text not null,
  metadata    jsonb default '{}',
  embedding   vector(768),        -- 768 dims = Gemini text-embedding-004
  created_at  timestamptz default now()
);
```

### Create the HNSW index (critical for speed)

```sql
-- HNSW is 10-100x faster than the default ivfflat index.
-- Do this before inserting data.
create index on documents
using hnsw (embedding vector_cosine_ops)
with (m = 16, ef_construction = 64);
```

> **What HNSW does:** Instead of comparing your query vector against every row,
> it builds a graph of "nearby" vectors so it can jump straight to the closest
> ones. At 10,000 rows it's already dramatically faster.

### Create the search function

```sql
create or replace function match_documents (
  query_embedding   vector(768),
  match_count       int      default 5,
  filter_user_id    uuid     default null
)
returns table (
  id          uuid,
  content     text,
  metadata    jsonb,
  similarity  float
)
language sql stable
as $$
  select
    id,
    content,
    metadata,
    1 - (embedding <=> query_embedding) as similarity
  from documents
  where
    (filter_user_id is null or user_id = filter_user_id)
    and embedding is not null
  order by embedding <=> query_embedding
  limit match_count;
$$;
```

### Enable Row Level Security

```sql
alter table documents enable row level security;

-- Users can only read/write their own documents
create policy "Users manage own documents"
on documents for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
```

---

## 5. FastAPI App — Core Setup

### `main.py`

```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import os

load_dotenv()

genai.configure(api_key=os.environ["GEMINI_API_KEY"])

app = FastAPI(title="RAG Backend", version="1.0.0")

# Allow your React app on Vercel to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",           # local React dev
        "https://yourapp.vercel.app",      # your production frontend
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and register routes
from rag import router as rag_router
app.include_router(rag_router, prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
```

### `db.py`

```python
from supabase import create_client
import os

supabase = create_client(
    os.environ["SUPABASE_URL"],
    os.environ["SUPABASE_SERVICE_KEY"],   # service role — server only
)
```

---

## 6. Embedding Pipeline

### `embeddings.py`

```python
import google.generativeai as genai
import hashlib

# In-memory cache — survives as long as the server is running.
# Same question asked twice = instant response, no API call.
_cache: dict[str, list[float]] = {}

EMBEDDING_MODEL = "models/text-embedding-004"
EMBEDDING_DIMS  = 768

def _hash(text: str) -> str:
    return hashlib.md5(text.strip().lower().encode()).hexdigest()

def get_embedding(text: str) -> list[float]:
    """Convert text to a 768-dim vector. Cached."""
    key = _hash(text)
    if key in _cache:
        return _cache[key]                          # instant

    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_query",                # optimised for search
    )
    embedding = result["embedding"]
    _cache[key] = embedding
    return embedding

def get_document_embedding(text: str) -> list[float]:
    """Use a different task_type when embedding documents at ingest."""
    result = genai.embed_content(
        model=EMBEDDING_MODEL,
        content=text,
        task_type="retrieval_document",             # optimised for storage
    )
    return result["embedding"]
```

> **Why two task types?**
> `retrieval_query` is optimised for short questions.
> `retrieval_document` is optimised for longer text chunks.
> Mixing them gives better search accuracy than using one type for both.

---

## 7. Vector Search

Add this to `rag.py`:

```python
from db import supabase
from embeddings import get_embedding

def search_documents(question: str, user_id: str, top_k: int = 5) -> list[dict]:
    """Find the top_k most relevant chunks for the user's question."""
    query_vector = get_embedding(question)

    result = supabase.rpc("match_documents", {
        "query_embedding": query_vector,
        "match_count": top_k,
        "filter_user_id": user_id,
    }).execute()

    return result.data or []
```

---

## 8. RAG Generation with Streaming

The most important section. This is what makes the AI feel fast.

### How streaming works

```
Without streaming:                With streaming (SSE):
User asks question                User asks question
[spinner for 6 seconds]           First word appears in ~1s
Full answer appears               Words keep appearing...
                                  Answer completes naturally
```

### `rag.py` — full streaming pipeline

```python
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import google.generativeai as genai
import asyncio
import json

from db import supabase
from embeddings import get_embedding, get_document_embedding
from auth import get_current_user

router = APIRouter()

GENERATION_MODEL = "gemini-1.5-flash"   # fast + free tier — ideal for RAG

class QueryBody(BaseModel):
    question: str

class IngestBody(BaseModel):
    content: str
    metadata: dict = {}


def build_prompt(question: str, chunks: list[dict]) -> str:
    """Build the RAG prompt. Context is injected here — Gemini never 'knows'
    your data from training. You're giving it the answer sheet at runtime."""
    context = "\n\n---\n\n".join(
        f"[Source {i+1}]\n{c['content']}"
        for i, c in enumerate(chunks)
    )
    return f"""You are a helpful assistant. Answer the user's question using
ONLY the context provided below. If the answer is not in the context, say
"I don't have enough information to answer that."

CONTEXT:
{context}

USER QUESTION:
{question}

ANSWER:"""


async def stream_gemini(prompt: str):
    """Generator that yields SSE-formatted tokens as Gemini produces them."""
    model = genai.GenerativeModel(GENERATION_MODEL)

    # generate_content with stream=True returns chunks as they are produced
    response = model.generate_content(
        prompt,
        stream=True,
        generation_config=genai.types.GenerationConfig(
            temperature=0.2,        # lower = more factual, less hallucination
            max_output_tokens=1024, # cap response length
        ),
    )

    for chunk in response:
        if chunk.text:
            # SSE format: each message starts with "data: " and ends with "\n\n"
            yield f"data: {json.dumps({'token': chunk.text})}\n\n"
            await asyncio.sleep(0)  # yield control so other requests don't block

    yield "data: [DONE]\n\n"       # tells React the stream has finished


@router.post("/rag")
async def rag_query(body: QueryBody, user=Depends(get_current_user)):
    """Main RAG endpoint. Streams the response token by token."""

    # Step 1: find relevant chunks in pgvector (~50-250ms total)
    chunks = search_documents(body.question, user["sub"])

    if not chunks:
        async def empty():
            yield f"data: {json.dumps({'token': 'No relevant information found.'})}\n\n"
            yield "data: [DONE]\n\n"
        return StreamingResponse(empty(), media_type="text/event-stream")

    # Step 2: build prompt with retrieved context
    prompt = build_prompt(body.question, chunks)

    # Step 3: stream Gemini's response back to React
    return StreamingResponse(
        stream_gemini(prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # prevents nginx from buffering the stream
        },
    )
```

---

## 9. Making AI Responses Fast & Efficient

These are the concrete techniques, in order of impact.

### 9.1 Streaming (biggest impact)

Already covered above. The user sees the first token in ~800ms instead of waiting for the full response. Non-negotiable for any chat interface.

### 9.2 Use Gemini 1.5 Flash, not Pro

```python
# DO THIS — Flash: ~800ms to first token, free tier generous
GENERATION_MODEL = "gemini-1.5-flash"

# NOT THIS for RAG — Pro is slower and more expensive, rarely better for RAG
# GENERATION_MODEL = "gemini-1.5-pro"
```

For RAG, the LLM is just summarising retrieved text. Flash is more than capable.
Pro only helps when the reasoning task itself is complex.

### 9.3 Cache query embeddings

```python
# Already in embeddings.py — _cache dict saves ~200ms per repeated question
embedding = get_embedding(question)   # instant on second call
```

### 9.4 HNSW index on pgvector

```sql
-- Already set up in section 4.
-- Without HNSW: full table scan, gets slow at 1000+ rows.
-- With HNSW: stays fast up to millions of rows.
create index on documents using hnsw (embedding vector_cosine_ops);
```

### 9.5 Pre-embed at ingest, never at query time

```python
# WRONG — embedding at query time for every request
chunks = fetch_raw_text_from_db()
embeddings = [embed(c) for c in chunks]   # slow, runs on every request

# RIGHT — embed once at ingest, store in pgvector
# At query time you only embed the question, not the documents
```

### 9.6 Limit context window size

```python
# Don't retrieve 20 chunks — more context = slower generation
# 5 chunks of ~500 tokens each is the sweet spot
chunks = search_documents(question, user_id, top_k=5)
```

### 9.7 Tune chunk size at ingest

```python
def chunk_text(text: str, chunk_size: int = 500, overlap: int = 50) -> list[str]:
    """
    Split text into overlapping chunks.
    overlap: how many tokens carry over between chunks so context isn't lost
             at chunk boundaries.
    """
    words = text.split()
    chunks = []
    for i in range(0, len(words), chunk_size - overlap):
        chunk = " ".join(words[i : i + chunk_size])
        if chunk:
            chunks.append(chunk)
    return chunks
```

> **Sweet spot:** 300-600 words per chunk.
> Too small → retrieved chunks lack context.
> Too large → irrelevant content dilutes the prompt.

### 9.8 Set a low temperature

```python
generation_config=genai.types.GenerationConfig(
    temperature=0.2,   # 0.0 = deterministic, 1.0 = creative
                       # RAG wants factual answers → keep low
)
```

---

## 10. Ingest Endpoint

This is how you get your Supabase data into pgvector.
Run this once to embed existing data, then call it whenever new data is added.

```python
@router.post("/ingest")
async def ingest(body: IngestBody, user=Depends(get_current_user)):
    """Chunk, embed, and store a piece of text in pgvector."""
    chunks = chunk_text(body.content)

    rows = []
    for chunk in chunks:
        embedding = get_document_embedding(chunk)
        rows.append({
            "user_id":   user["sub"],
            "content":   chunk,
            "metadata":  body.metadata,
            "embedding": embedding,
        })

    supabase.table("documents").insert(rows).execute()

    return {"inserted": len(rows)}
```

---

## 11. RAG Query Endpoint

Already built in section 8. Summary of what happens on each request:

```
POST /api/rag  { "question": "How do I reset my password?" }

1. auth.py verifies JWT from Supabase             ~5ms
2. embeddings.py embeds the question              ~200ms (or 0ms if cached)
3. pgvector finds top 5 relevant chunks           ~50ms
4. rag.py builds prompt with chunks               <1ms
5. Gemini Flash generates — first token arrives   ~800ms
6. Tokens stream to React as SSE                  ongoing
                                          ─────────────────
                       User sees first word in:   ~1.1 seconds
```

---

## 12. Auth — Protect Your Endpoints

Without this, anyone can call your RAG endpoint and use your Gemini quota.

### `auth.py`

```python
from fastapi import HTTPException, Header
from jose import jwt, JWTError
import os

SUPABASE_JWT_SECRET = os.environ["SUPABASE_JWT_SECRET"]

def get_current_user(authorization: str = Header(...)):
    """Verify Supabase JWT. Raises 401 if invalid or missing."""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")

    token = authorization.removeprefix("Bearer ")

    try:
        payload = jwt.decode(
            token,
            SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
        return payload   # contains user id at payload["sub"]
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
```

### How React sends the token

```javascript
const { data: { session } } = await supabase.auth.getSession();

fetch("https://yourapp.railway.app/api/rag", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${session.access_token}`,  // Supabase JWT
  },
  body: JSON.stringify({ question }),
});
```

---

## 13. Deploy to Railway

### Step 1 — Create `Procfile`

Railway uses this to know how to start your app.

```
web: uvicorn main:app --host 0.0.0.0 --port $PORT
```

> `$PORT` is set automatically by Railway. Do not hardcode a port number.

### Step 2 — Push to GitHub

```bash
git init
git add .
git commit -m "initial RAG backend"
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

### Step 3 — Create Railway project

1. Go to [railway.app](https://railway.app) → New Project
2. Select **Deploy from GitHub repo**
3. Select your repository
4. Railway detects Python automatically and starts building

### Step 4 — Set environment variables

In Railway dashboard → your service → **Variables** tab, add:

```
GEMINI_API_KEY        = your_gemini_key
SUPABASE_URL          = https://yourproject.supabase.co
SUPABASE_SERVICE_KEY  = your_service_role_key
SUPABASE_JWT_SECRET   = your_jwt_secret
```

> Find `SUPABASE_JWT_SECRET` in Supabase dashboard → Settings → API → JWT Secret.

### Step 5 — Get your public URL

Railway gives you a URL like `https://yourapp-production.up.railway.app`.
Go to Settings → Networking → Generate Domain if it doesn't appear automatically.

### Step 6 — Test it

```bash
curl https://yourapp-production.up.railway.app/health
# → {"status": "ok"}
```

### Redeploy after changes

```bash
git add .
git commit -m "your change"
git push
# Railway auto-detects the push and redeploys in ~2 minutes
```

---

## 14. Connect React Frontend

### `.env.local` (local dev)

```env
VITE_API_URL=http://localhost:8000
```

### `.env.production` (after Railway deploy)

```env
VITE_API_URL=https://yourapp-production.up.railway.app
```

### Streaming chat component

```jsx
import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Chat() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer]     = useState("");
  const [loading, setLoading]   = useState(false);

  async function ask() {
    setAnswer("");
    setLoading(true);

    const { data: { session } } = await supabase.auth.getSession();

    const res = await fetch(`${import.meta.env.VITE_API_URL}/api/rag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`,
      },
      body: JSON.stringify({ question }),
    });

    const reader  = res.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.replace("data: ", "").trim();
        if (data === "[DONE]") { setLoading(false); break; }
        try {
          const { token } = JSON.parse(data);
          setAnswer(prev => prev + token);
        } catch {}
      }
    }
  }

  return (
    <div>
      <input value={question} onChange={e => setQuestion(e.target.value)} />
      <button onClick={ask} disabled={loading}>Ask</button>
      <p style={{ whiteSpace: "pre-wrap" }}>{answer}</p>
      {loading && <span>AI is typing...</span>}
    </div>
  );
}
```

---

## 15. Performance Checklist

Before going live, verify every item below.

### Speed

- [ ] Streaming enabled — `StreamingResponse` + `stream=True` in Gemini call
- [ ] Using `gemini-1.5-flash` not Pro
- [ ] HNSW index created on the `embedding` column
- [ ] Embedding cache active — `_cache` dict in `embeddings.py`
- [ ] `top_k = 5` — not more than needed
- [ ] Temperature set to `0.2` for factual RAG answers
- [ ] `X-Accel-Buffering: no` header on streaming responses

### Security

- [ ] JWT verification on every AI endpoint
- [ ] Service role key only in backend env vars, never in React
- [ ] Row Level Security enabled on `documents` table
- [ ] CORS restricted to your Vercel domain only

### Quality

- [ ] Using `retrieval_document` task type at ingest
- [ ] Using `retrieval_query` task type at query time
- [ ] Chunk size between 300-600 words
- [ ] Chunk overlap set to ~50 words
- [ ] Prompt instructs Gemini to only use provided context

### Railway

- [ ] `Procfile` present with correct `$PORT` variable
- [ ] All 4 env vars set in Railway dashboard
- [ ] `/health` endpoint returns 200
- [ ] Railway domain added to CORS `allow_origins` list

---

## Estimated Response Latency (target)

| Step | Target |
|---|---|
| JWT verification | < 5ms |
| Query embedding (cold) | ~200ms |
| Query embedding (cached) | < 1ms |
| pgvector search (HNSW) | ~50ms |
| Gemini first token | ~800ms |
| **Total to first word** | **~1.1 seconds** |

---

*Built with FastAPI · Gemini 1.5 Flash · Supabase pgvector · Railway*
