# AI Chatbot — Engineering Handoff Package

A decision-driven AI chatbot for local service businesses (lawn care, window cleaning, auto detailing). This folder contains everything an engineer needs to build the **backend agent** that powers the chat — independent of the frontend visual direction.

> The HTML/JSX design files in the parent folder are reference for the UI. **This folder is the spec for what the AI agent must do.**

---

## Contents

| File | What it is | Why you need it |
|---|---|---|
| `01-architecture.svg` | System diagram — request flow from user → guardrails → agent → RAG/Tools/Human → response | The mental model for what you're building |
| `02-system-spec.md` | Written spec: components, decision rules, confidence thresholds, guardrail policies | The contract for each component |
| `03-agent-contract.md` | Event shapes, trace event types, tool signatures, response format | The exact JSON the agent emits — frontend already consumes this shape |
| `04-scenarios.json` | 7 scripted scenarios × 3 businesses = 21 test cases, with expected decision paths and outputs | Your acceptance test suite |
| `05-ui-reference.png` | Screenshot of the chosen UI direction ("Local & Loved") | What the chat surface looks like — the agent must produce content that fits this shape |
| `06-knowledge-base-seed.md` | Sample RAG documents for each of the 3 businesses (pricing, services, service area, policies) | Drop into your vector store on day one to make the demo work |

---

## How to use this package

1. **Read `02-system-spec.md` first** — it's the 10-minute overview.
2. Open `01-architecture.svg` in any browser. Each box is a service to build. Each arrow is a request/response contract.
3. `03-agent-contract.md` defines the JSON shapes — implement the agent so it emits these event types (the existing UI binds to them with no changes).
4. `04-scenarios.json` is your test fixture. Every scenario must produce the listed trace events and the equivalent response.
5. `06-knowledge-base-seed.md` is content to seed your vector DB so the FAQ/service-area scenarios resolve to real RAG hits.

---

## Suggested stack (one opinionated path)

| Layer | Pick | Why |
|---|---|---|
| Runtime | Node 20 + TypeScript | Frontend and agent share types |
| LLM | Anthropic Claude (Haiku for routing, Sonnet for generation) or OpenAI GPT-4.1 | Both support native tool-calling matching `03-agent-contract.md` |
| RAG | Pinecone / pgvector / Turbopuffer | Any vector DB. Embeddings: `voyage-3` or `text-embedding-3-large` |
| Tools | Plain functions called via tool-calling | `check_availability`, `book_visit`, `create_lead`, `create_handoff`, `price_estimator` |
| Guardrails | Lightweight: regex + a Haiku-tier classifier call | Spec covers exact rules in §3 |
| Transport | Server-sent events (SSE) | Stream trace events as they happen so the dev-view diagram lights up live |

---

## Minimum viable build order

1. **Tool stubs** — implement the 5 tools in `03-agent-contract.md` as in-memory mocks. Returns fake confirmation IDs. (1 day)
2. **RAG over seed docs** — index `06-knowledge-base-seed.md`. Build a `retrieve(query)` function. (1 day)
3. **Agent loop** — input guard → classify (rag/tool/clarify/escalate/block) → execute → output guard → reply. Emit trace events via SSE. (2 days)
4. **Wire to existing UI** — point `useChat` (in `chat-engine.jsx`) at your SSE endpoint instead of `playEvents()`. The event shapes match. (½ day)
5. **Run `04-scenarios.json` as acceptance tests** — every scenario passes = MVP done. (1 day)

Roughly a **week of one engineer's time** to a working demo.

---

## Open product questions (resolve before building)

- Single-tenant per business, or multi-tenant from day one?
- Where does business data live? (Google Calendar for availability? Custom CRM?)
- Human handoff: SMS to owner, email, or a separate inbox UI?
- Confidence threshold (currently spec'd as 0.70) — calibrate against real traffic
- Data retention for PII in CRM
