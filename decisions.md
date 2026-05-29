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

---

## Pricing questions route to RAG, not price_estimator
The knowledge base already has full pricing tables (all services × all yard sizes). Routing "how much does X cost?" to the price_estimator tool was wrong — it started a multi-turn booking flow when the user just wanted a price. RAG answers pricing questions directly from pricing.md. The price_estimator tool is now reserved exclusively for booking/quote intent ("I'd like to get a quote", "give me an estimate for my property"). This keeps the tool semantically clean and avoids committing session state prematurely.

## One ## section per Q&A in the knowledge base
The seeder splits documents by `##` — each section becomes one embedding chunk. Putting multiple Q&A pairs in a single section dilutes the embedding vector across all topics, causing similarity scores to drop from ~0.83 (isolated) to ~0.38 (combined). The fix: one `## FAQ — Topic` section per Q&A pair, so each chunk stays semantically focused and scores consistently above the RAG_MIN_SCORE = 0.50 threshold.

## Off-topic 3-strike loop instead of hard block
A single off-topic message could be a misunderstanding or a very short reply taken out of context. Three graduated responses (soft redirect → firmer redirect → final message) give the user two chances to get back on track before the conversation ends. This reduces false-positive frustration while still cutting off persistent off-topic users.

## Guardrail off-topic bypass during lead capture
During lead capture, user replies like "John Smith" and "404-555-0192" look off-topic to the guardrail (no service context). Rather than bypassing guardrails entirely, only the off-topic check is bypassed when `session["awaiting_lead"]` is active. Injection and moderation still block normally. The same pattern applies to pending_tool flows where chip selections can also appear context-free.

## Service + yard_size extraction in the generator, not the route
The price_estimator handler in generator.py checks the user message for service name and yard size before falling through to the prompting cards. This avoids unnecessary round trips when the user includes that info in their first message. The extraction logic belongs in the generator (business logic layer) not the route (transport/session layer). The route's job is session management and calling the pipeline — not knowing what "weekly mowing" means.

## Automated test runner against live backend
Manual UI testing is slow and inconsistent. test_runner.py sends real HTTP requests to the live backend and checks responses with keyword and card-type assertions. Each path uses a fresh session_id to prevent state bleed. This makes regression testing fast (runs in ~2-3 minutes) and repeatable. The test runner is also the canonical documentation for expected bot behavior across all 8 paths.
