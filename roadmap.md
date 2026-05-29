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
- [x] Pricing questions route to RAG (KB has full pricing tables)
- [x] price_estimator tool reserved for booking/quote intent only
- [x] Conversation context (last 2 messages) injected into prompt for multi-turn accuracy
- [x] Clarify → service-selection chip replies correctly classified as tool/price_estimator

### RAG (rag/retriever.py + rag/embedder.py)
- [x] embed() helper — text-embedding-3-small
- [x] pgvector similarity search filtered by business
- [x] Returns top-K chunks above RAG_MIN_SCORE

### Generator (agent/generator.py)
- [x] RAG path — Sage persona, GPT call with context chunks
- [x] Tool path — price_estimator multi-turn flow (service → yard size → price + card)
- [x] price_estimator extracts service + yard_size from user message before prompting (skips unnecessary round trips)
- [x] Clarify path — options cards for service and yard size, wires into price_estimator on service selection
- [x] Escalate path — GPT summary, create_handoff, handoff card
- [x] Closing phrases detected in clarify path → graceful goodbye
- [x] check_availability + book_visit — stubbed (Google Calendar MCP TODO)

### Tools & Actions
- [x] tools/price_estimator.py — PRICES dict mock
- [x] actions/create_lead.py — saves lead to Postgres
- [x] actions/create_handoff.py — saves escalation + chat summary to Postgres

### API Layer
- [x] models/schemas.py — ChatRequest, ChatResponse (Pydantic)
- [x] routes/chat.py — POST /chat, session state, lead capture flow, off-topic 3-strike loop
- [x] main.py — FastAPI app with CORS

---

## Phase 3 — Testing & Hardening (Done)

### Guardrail improvements
- [x] Off-topic 3-strike loop — strike 1: soft redirect, strike 2: firmer, strike 3: final message
- [x] Off-topic bypass during lead capture — names/phone numbers don't trigger the guardrail
- [x] LLM fallback prompt tightened — short chip replies ("Yes", "Book now", "Reach out") always pass
- [x] Sensitive PII blocking — SSN, credit card patterns blocked before reaching the LLM

### Lead capture flow
- [x] "Reach out to me later" → collects name → collects phone → calls create_lead → saved to DB
- [x] Works both after price estimator and as a standalone request
- [x] PII extracted from message automatically (phone number pre-filled if detected in text)

### RAG knowledge base improvements
- [x] FAQ sections added to lawn/services.md — what services, aeration, overseeding, fertilization, bed weeding
- [x] FAQ sections added to lawn/service-area.md — service area coverage, weekend hours
- [x] FAQ section added to lawn/policies.md — payment methods
- [x] One `##` section per Q&A pair — each chunk is focused, prevents embedding score dilution
- [x] All target queries now score ≥ 0.50 against correct chunks (up from 0.32–0.46)

### Bug fixes
- [x] Chip selections ("Medium (¼ to ½ acre)") no longer blocked by guardrail as off-topic
- [x] Clarify → service chip selection correctly wires into price_estimator via classifier examples
- [x] price_estimator extracts service + yard_size from first message (no unnecessary round trips)
- [x] Pricing questions reclassified to RAG; price_estimator reserved for booking intent only

### Automated testing
- [x] test_runner.py — 34 automated test cases across 8 paths, runs against live backend
- [x] test-plan.md — human-readable test plan for manual/UI testing reference
- [x] All 34 tests passing

---

## Phase 4 — Frontend Wiring (Next)
- [ ] Wire frontend JSX to real POST /chat endpoint
- [ ] Verify chips, cards (booking/estimate/handoff/lead) render correctly end to end
- [ ] Test all 3 business personas end to end

---

## Phase 5 — Calendar Integration
- [ ] Google Calendar MCP: check_availability + book_visit (real integration)
- [ ] Replace "coming soon" stub response with live calendar flow

---

## Phase 6 — Acceptance Testing
- [ ] All RAG paths answer correctly within 3s
- [ ] Tool paths (Google Calendar) complete within 3s
- [ ] Guardrails block injection/off-topic/harmful inputs
- [ ] Escalate path triggers correctly
- [ ] All 3 business personas tested end to end

---

## Future (Post-Demo)
- SSE streaming for real-time typing effect
- Real integrations: HubSpot/Google Sheets for leads, Zendesk/Intercom + Twilio/SendGrid for handoffs
- Session persistence in DB (for returning users)
- Login + conversation history
- Per-client deployment (scope down to one business per instance)
- Groq + Llama 3.1 8B as latency fallback if GPT-4o-mini is too slow
