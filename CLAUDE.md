# AI Chatbot — Claude Context

## What This Is
A decision-driven AI chatbot backend for local service businesses (lawn care, window cleaning, auto detailing). Replaces "call us back" web forms with AI that handles 70-80% of inbound questions and bookings autonomously. Used as a sales demo to sell the product to clients.

## Businesses in the Demo
- **Green Acres Lawn Care** — agent name: Sage
- **Crystal View Window Cleaning** — agent name: Iris
- **Bramble's Auto Detailing** — agent name: Otto

## Stack
| Layer | Choice |
|---|---|
| API server | FastAPI (Python) |
| LLM | GPT-4o-mini (classifier + generator) |
| Vector DB | pgvector (Postgres, port 5433) |
| Embeddings | text-embedding-3-small |
| Transport | Regular HTTP (no SSE) |
| Session state | In-memory dict (no DB persistence) |
| Calendar tools | Pre-built Google Calendar MCP |
| Other tools | Plain Python mocks |

## Key Config Values (backend/config.py)
- `CLASSIFIER_MODEL = "gpt-4o-mini"`
- `GENERATOR_MODEL = "gpt-4o-mini"`
- `EMBED_MODEL = "text-embedding-3-small"`
- `CONFIDENCE_CLARIFY = 0.65`
- `CONFIDENCE_ESCALATE = 0.70`
- `RAG_MIN_SCORE = 0.50`
- `RAG_TOP_K = 3`

## Pipeline (in order)
Input Guardrails → Classifier → RAG / Tool / Clarify / Escalate → Generator → Output Guardrails → Response

## File Structure
```
backend/
  config.py               # env vars, model names, thresholds
  main.py                 # FastAPI app entry point
  docker-compose.yml      # Postgres + pgvector container
  .env                    # secrets (not committed)
  agent/
    guardrails.py         # input + output safety checks
    classifier.py         # intent classification
    generator.py          # response generation
  db/
    connection.py         # psycopg2 connection helpers
  rag/
    seed.py               # embed + insert knowledge base docs
    retriever.py          # vector similarity search
  tools/
    price_estimator.py    # mock
    create_lead.py        # mock
    create_handoff.py     # mock
  routes/
    chat.py               # POST /chat endpoint
  models/
    schemas.py            # Pydantic request/response models
  knowledge_base/
    lawn/                 # pricing.md, services.md, policies.md, service-area.md
    windows/              # menu.md, addons.md, policies.md, service-area.md, screens-tracks.md
    auto/                 # menu.md, addons.md, policies.md, service-area.md
```

## Conventions
- `sys.path.append` at the very top of any script run directly (before all imports)
- Import config values directly: `from config import OPENAI_API_KEY`, not `import config`
- All guardrail functions return `{"verdict": "block"/"pass", "rule": ..., "note": ...}` except `check_pii` (returns list) and `run_input_guardrails` (returns `{"blocked": bool, "reason": ..., "pii": [...]}`)
- Multi-business: all DB queries filter by `business` column

## Current Phase
**Phase 2 — Agent pipeline**
- [x] guardrails.py — patterns + all functions including check_llm_fallback
- [ ] classifier.py
- [ ] rag/retriever.py
- [ ] generator.py
- [ ] tool mocks
- [ ] Google Calendar MCP setup
- [ ] models/schemas.py
- [ ] routes/chat.py
- [ ] main.py
