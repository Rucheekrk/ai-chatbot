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

## Phase 2 — Agent Pipeline (In Progress)
### Guardrails (agent/guardrails.py)
- [x] INJECTION_PATTERNS, OFF_TOPIC_PATTERNS, PII_PATTERNS
- [x] check_injection(), check_off_topic(), check_pii()
- [x] check_moderation() — OpenAI moderation API
- [ ] check_llm_fallback() — GPT call for what regex misses
- [x] run_input_guardrails()

### Classifier (agent/classifier.py)
- [ ] GPT-4o-mini call to classify intent: rag / tool / clarify / escalate
- [ ] Returns intent + confidence score
- [ ] Applies CONFIDENCE_CLARIFY and CONFIDENCE_ESCALATE thresholds

### RAG (rag/retriever.py)
- [ ] Embed query with text-embedding-3-small
- [ ] pgvector similarity search filtered by business
- [ ] Returns top-K chunks above RAG_MIN_SCORE

### Generator (agent/generator.py)
- [ ] Builds system prompt per business + agent persona
- [ ] Handles rag / tool / clarify / escalate response paths
- [ ] Calls appropriate tool if intent = tool
- [ ] Returns structured response: text + optional card (booking/estimate/handoff/lead)

### Tool Mocks (tools/)
- [ ] price_estimator.py
- [ ] create_lead.py
- [ ] create_handoff.py

---

## Phase 3 — Integration
- [ ] Google Calendar MCP: check_availability + book_visit
- [ ] models/schemas.py: Pydantic request/response models
- [ ] routes/chat.py: POST /chat endpoint
- [ ] main.py: FastAPI app, session state (in-memory dict), mount routes

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
