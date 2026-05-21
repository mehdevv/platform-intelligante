"""
Split long extracted PDF text into overlapping segments for embedding.

Tune overlap and size with `docs/fastapi-rag-railway-plan.md` §9.7 (sweet spot ~300–600 tokens).
Until `tiktoken` is wired, character-based splits are a practical default.
"""

from __future__ import annotations


def chunk_text(
    text: str,
    *,
    max_chars: int = 2000,
    overlap_chars: int = 200,
) -> list[str]:
    """
    Character-based windows with overlap. Replace with token-based splitting
    when the embedding model is fixed (OpenAI vs Gemini dimension strategy).
    """
    t = " ".join(text.split())
    if not t:
        return []
    chunks: list[str] = []
    start = 0
    n = len(t)
    while start < n:
        end = min(start + max_chars, n)
        piece = t[start:end].strip()
        if piece:
            chunks.append(piece)
        if end >= n:
            break
        start = max(0, end - overlap_chars)
    return chunks
