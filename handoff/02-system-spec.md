# System Architecture — AI Chatbot for Local Businesses

## Goal
Replace the "we'll call you back" form on a local service business website with a chat that **handles 70-80% of inbound questions and bookings autonomously**, and cleanly hands off the rest.

## Core principle: decide before you generate

Every user message goes through a **classifier (the Agent)** *before* any retrieval, tool call, or LLM generation. This is the most important architectural decision.

Why: a generic "chat with retrieval" architecture wastes tokens, hallucinates prices, mishandles PII, and can't tell "what are your hours" (RAG) apart from "book me Tuesday" (tool) apart from "ignore previous instructions" (block). Classifying first means cheap paths stay cheap and expensive paths only fire when warranted.

---

## Components

### 1. Input Guardrails
A lightweight filter that runs **before** the agent. Cheap, deterministic, fast (~50-200ms).

Rules:
- **PII detection** — flag phone, email, address, payment info. Pass through, but tag for non-LLM-only storage.
- **Off-topic filter** — reject obvious off-topic (code requests, general knowledge, news).
- **Prompt-injection scan** — pattern-match for "ignore previous instructions", "you are now", "system prompt", role-play overrides.
- **Verdict**: `pass` | `block`. Blocked messages bypass the agent entirely and return a canned redirect.

### 2. Agent (Decision Engine)
Single LLM call. Cheap model (Haiku-tier). Returns a structured decision:

```
{ decision: "rag" | "tool" | "clarify" | "escalate" | "block", confidence: 0..1, reasoning: "..." }
```

Decision rules:
- `rag` — factual question answerable from the knowledge base (pricing, hours, service area, policies)
- `tool` — action request (book, estimate, lead capture, availability check)
- `clarify` — intent unclear, confidence < 0.65
- `escalate` — confidence < 0.70 after retrieval, OR matches "specialized job" patterns
- `block` — should have been caught by input guardrails; second line of defense

### 3. RAG (Knowledge)
Vector store over business-specific docs: `pricing.md`, `services.md`, `service-area.md`, `policies.md`, etc.

- Retrieve top-3 docs per query.
- Generate answer **strictly grounded** in retrieved context.
- If top hit score < 0.50, treat as no-answer and escalate.

### 4. Tools (Actions)
Five tools cover ~95% of action intents:

| Tool | Args | Result |
|---|---|---|
| `check_availability` | `{ window, service }` | `{ open, slot, crew }` |
| `book_visit` | `{ customer, slot, service }` | `{ confirmation, ics }` |
| `price_estimator` | `{ ...params }` | `{ low, high, note }` |
| `create_lead` | `{ name, phone, best_time }` | `{ lead_id, queued }` |
| `create_handoff` | `{ reason, summary }` | `{ ticket, eta }` |

### 5. Human Handoff
When the agent escalates: create a ticket, notify the business owner (SMS/email), tell the user a human will respond within 1 business day.

### 6. Output Guardrails
Runs after generation, before sending to user:

- **Grounding check** — every number and policy claim must appear in retrieved context. If not, regenerate or escalate.
- **Safety scan** — final pass for PII leakage, off-policy claims, hallucinated commitments.
- **Verdict**: `pass` | `regenerate` | `escalate`.

---

## Request flow

```
User message
   ↓
[Input Guardrails]  ──block──→  Canned redirect → User
   ↓ pass
[Agent / Classifier]
   ↓
   ├─ rag      → [RAG retrieve]   ─→
   ├─ tool     → [Tool execute]   ─→  [LLM generate response]
   ├─ clarify  → (skip retrieval) ─→
   ├─ escalate → [create_handoff]  → Handoff card → User
   └─ block    → Canned redirect  → User
                                    ↓
                              [Output Guardrails]
                                    ↓ pass
                                  User
```

---

## Confidence thresholds (calibrate after launch)

| Threshold | Value | Behavior |
|---|---|---|
| Agent decision confidence | 0.70 | Below → clarify or escalate |
| RAG top-hit score | 0.50 | Below → treat as no-answer, escalate |
| Output grounding | 100% | Every claim must be in context, else regenerate |

---

## Performance budgets (90th percentile)

| Stage | Budget |
|---|---|
| Input guardrails | 200ms |
| Agent classification | 600ms |
| RAG retrieval | 400ms |
| Tool execution | 800ms (varies by tool) |
| Response generation | 1.5s |
| Output guardrails | 300ms |
| **Total** | **~3-4s end to end** |

Stream tokens so the user sees output start in <1s.

---

## What we are NOT building (v1)

- Voice / phone integration
- Multi-turn task memory beyond the current session
- Outbound notifications to customers
- Owner-side analytics dashboard (basic logs only)
- Multi-language support (English only)
