# AI Chatbot — Technical Decisions

A log of key decisions made during the build and why. Useful context when revisiting choices.

---

## FastAPI over Node/TypeScript
Python is preferred. FastAPI is async-native, familiar, and has native StreamingResponse if SSE is needed later. No reason to add TypeScript complexity for a Python-first stack.

## GPT-4o-mini as single model (classifier + generator)
One model for both routing and generation keeps the pipeline simple. GPT-4o-mini is fast enough (~500-800ms per call) to stay within the 1-2s latency budget. Model names are stored in config.py as strings so switching to Groq + Llama 3.1 8B later requires only a config change.

## pgvector over Pinecone
User already knows pgvector. The knowledge base is tiny (13 documents across 3 businesses) — a managed vector DB like Pinecone adds unnecessary cost and complexity. pgvector runs in the same Postgres container.

## Regular HTTP over SSE
The frontend demo uses a scripted playEvents() system that already handles the animation and timing. SSE streaming adds complexity with no benefit for the client demo. Deferred to post-demo if needed.

## Pre-built Google Calendar MCP for booking tools only
check_availability and book_visit need a real integration for the demo to be convincing. Using a pre-built MCP server gets this working fast. All other tools (price_estimator, create_lead, create_handoff) are plain Python mocks — real integrations (HubSpot, Zendesk, Twilio) added post-sale.

## Hybrid guardrails (regex + OpenAI moderation API + LLM fallback)
- Regex is fast and free but hardcoded — misses creative injection attempts
- OpenAI moderation API catches harmful content (hate, violence, sexual) without prompt engineering
- LLM fallback (GPT call) catches injection, off-topic, and PII that regex misses
Three layers because no single layer is sufficient.

## In-memory session state (no DB persistence)
MVP. Users visiting a service business website don't need conversation history across sessions. Persist to DB post-demo if returning-user memory becomes a requirement.

## Multi-business architecture from the start
All DB queries filter by a `business` column. Easy to scope down to one business per deployment for real clients. Keeping multi-business in the demo makes the product look more capable.

## sys.path.append at top of directly-run scripts
Running `python3 rag/seed.py` from backend/ fails with ModuleNotFoundError unless the backend root is on sys.path. Placing `sys.path.append` before all imports fixes this without needing package installs or PYTHONPATH env vars.

## Direct config imports (not module-level)
`from config import OPENAI_API_KEY` instead of `import config` then `config.OPENAI_API_KEY`. Cleaner and avoids attribute errors if the import style is mixed.
