# AI Chatbot — Project Roadmap

## Goal
Build and demo a decision-driven AI chatbot that local service businesses can embed on their website. The chatbot handles inbound questions, gives instant pricing estimates, books appointments via Google Calendar, and escalates edge cases to a human — replacing "call us back" web forms.

## Target Businesses (Demo)
- Lawn care (Green Acres — Sage)
- Window cleaning (Crystal View — Iris)
- Auto detailing (Bramble's — Otto)

---

## Phase 1 — Foundation (Done)
- [x] Project structure and file layout
- [x] Docker Compose: Postgres + pgvector (port 5433)
- [x] config.py: env vars, model names, confidence thresholds
- [x] db/connection.py: psycopg2 helpers
- [x] knowledge_base/: 13 .md files across 3 businesses
- [x] rag/seed.py: embed + insert all knowledge base docs into pgvector

---

## Phase 2 — Agent Pipeline (Done)
### Guardrails (agent/guardrails.py)
- [x] INJECTION_PATTERNS, OFF_TOPIC_PATTERNS, CONTACT_PATTERNS, SENSITIVE_PATTERNS
- [x] check_injection(), check_off_topic(), check_pii(), check_sensitive_pii()
- [x] check_moderation() — OpenAI moderation API
- [x] check_llm_fallback() — GPT call for what regex misses
- [x] run_input_guardrails() — runs all checks in order

### Classifier (agent/classifier.py)
- [x] GPT-4o-mini few-shot prompt: rag / tool / clarify / escalate
- [x] Returns intent + confidence + tool
- [x] Applies CONFIDENCE_CLARIFY and CONFIDENCE_ESCALATE thresholds
- [x] Pricing questions route to tool/price_estimator (not rag)

### RAG (rag/retriever.py + rag/embedder.py)
- [x] embed() helper — text-embedding-3-small
- [x] pgvector similarity search filtered by business
- [x] Returns top-K chunks above RAG_MIN_SCORE

### Generator (agent/generator.py)
- [x] RAG path — Sage persona, GPT call with context chunks
- [x] Tool path — price_estimator multi-turn flow (service → yard size → price + card)
- [x] Clarify path — options cards for service and yard size
- [x] Escalate path — GPT summary, create_handoff, handoff card
- [x] check_availability + book_visit — stubbed (Google Calendar MCP TODO)

### Tools & Actions
- [x] tools/price_estimator.py — PRICES dict mock
- [x] actions/create_lead.py — saves lead to Postgres
- [x] actions/create_handoff.py — saves escalation + chat summary to Postgres

### API Layer
- [x] models/schemas.py — ChatRequest, ChatResponse (Pydantic)
- [x] routes/chat.py — POST /chat, session state, multi-turn price estimator
- [x] main.py — FastAPI app with CORS

### Tested in Postman
- [x] RAG path — general service questions
- [x] Escalate path — complaint → handoff card
- [x] Price estimator — 3-turn flow (question → service → yard size → price + card)
- [x] Guardrails — injection, off-topic, sensitive PII, LLM fallback all blocking correctly

---

## Phase 3 — Integration (In Progress)
- [ ] Google Calendar MCP: check_availability + book_visit
- [ ] "Reach out to me later" flow — collect name/phone across turns, call create_lead

---

## Phase 4 — Frontend Wiring
- [ ] Wire frontend useChat hook to real POST /chat endpoint
- [ ] Verify bot event (text + chips) and card event (booking/estimate/handoff/lead) render correctly
- [ ] Test all 3 business personas end to end

---

## Phase 5 — Acceptance Testing
- [ ] Run 04-scenarios.json: 7 scenarios x 3 businesses
- [ ] All RAG paths answer correctly within 3s
- [ ] Tool paths (Google Calendar) complete within 3s
- [ ] Guardrails block injection/off-topic/harmful inputs
- [ ] Escalate path triggers correctly on low confidence

---

## Future (Post-Demo)
- SSE streaming for real-time typing effect
- Real integrations: HubSpot/Google Sheets for leads, Zendesk/Intercom + Twilio/SendGrid for handoffs
- Session persistence in DB (for returning users)
- Login + conversation history
- Per-client deployment (scope down to one business per instance)
- Groq + Llama 3.1 8B as latency fallback if GPT-4o-mini is too slow
