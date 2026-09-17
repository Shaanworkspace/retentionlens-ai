# Part 12 — Evidence Retrieval / GenAI (Q171-188)

## Short answer for interview
"This churn project has NO evidence retrieval and NO GenAI. I removed all GenAI code — prediction-only focus."

## 171-178. What + why
- In sentiment project, retrieval was word-overlap (NOT vector RAG). In this churn project, retrieval does NOT exist at all.
- If interviewer asks "Is it RAG?", say: **Not RAG, not vector, not LLM-based**. No `vector`, no `FAISS`, no embeddings, no `GROQ` calls remain. VERIFIED FROM CODE (grep for groq/genai/retention_offers = zero hits after removal).

## 179-188. Current state
- `backend/app/retention_offers/` folder: DELETED. VERIFIED (ls shows no such folder).
- `backend/app/routers/offers.py`: DELETED. VERIFIED.
- `frontend/src/pages/Offers.jsx`: DELETED. VERIFIED.
- `frontend/src/services/genai-log.js`: DELETED. VERIFIED.
- Remaining evidence paths: `GET /api/batch/runs/{id}/segment/{seg}` returns alert tiers (high/medium/low) as grouping, NOT retrieval. `CustomerBoard` shows static tenure vs churn and contract risk bars as evidence — NOT retrieved quotes. VERIFIED.
- If asked "difference vs true RAG": True RAG = embeddings + vector DB + LLM generation. This project = tabular lookup + rule-based tiers. No LLM generation remains by design.
