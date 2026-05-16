# Agent Contract — Event Shapes & API

> The frontend already binds to these event shapes (see `chat-engine.jsx` → `playEvents()`). If the backend emits these, the existing UI works with no changes.

## Transport

**Server-sent events over POST `/api/chat`.**

Request:
```json
POST /api/chat
{
  "businessId": "lawn" | "windows" | "auto",
  "sessionId": "abc-123",
  "message": "How much for weekly mowing?"
}
```

Response: SSE stream of events. Connection closes when response is complete.

---

## Event types

Each line of the SSE stream is `data: { ...event }\n\n`.

### `guard` — guardrail check
```json
{
  "kind": "guard",
  "stage": "input" | "output",
  "verdict": "pass" | "block",
  "rule": "PII / off-topic / injection scan",
  "note": "No PII detected · on-topic · 0 injection patterns"
}
```

### `agent` — classifier decision
```json
{
  "kind": "agent",
  "decision": "rag" | "tool" | "clarify" | "escalate" | "block",
  "confidence": 0.94,
  "reasoning": "Pricing question — answerable from KB. Route to RAG."
}
```

### `rag` — retrieval results
```json
{
  "kind": "rag",
  "query": "weekly mowing price residential",
  "hits": [
    { "doc": "pricing.md", "score": 0.94, "snippet": "## Mowing rates\nWeekly mowing: $45 (≤¼ acre)..." }
  ]
}
```

### `tool` — tool invocation
```json
{
  "kind": "tool",
  "name": "check_availability",
  "args": { "window": "Tue AM", "service": "Weekly mowing" },
  "result": { "open": true, "slot": "Tuesday Apr 22, 9:30 AM", "crew": "Crew B" }
}
```

### `bot` — message to user
```json
{
  "kind": "bot",
  "text": "Weekly mowing starts at **$45**...",
  "chips": ["Book a visit", "Service area?"]
}
```

`text` supports `**bold**` markdown. `chips` are optional quick-reply suggestions.

### `card` — structured UI card
```json
{
  "kind": "card",
  "card": {
    "kind": "booking" | "estimate" | "handoff" | "lead",
    ...
  }
}
```

Card shapes:

```ts
type BookingCard  = { kind: "booking",  slot: string, service: string, confirmation: string }
type EstimateCard = { kind: "estimate", low: number, high: number, item: string }
type HandoffCard  = { kind: "handoff",  ticket: string, eta: string }
type LeadCard     = { kind: "lead",     name: string, when: string }
```

---

## Tool signatures

Implement these as ordinary functions; the LLM calls them via tool-calling.

```ts
check_availability(args: {
  window: string,        // "Tue AM" | "Thu PM" | ISO range
  service: string        // human-readable service name
}) => Promise<{
  open: boolean,
  slot: string,          // confirmed timestamp, human-readable
  crew: string
}>

book_visit(args: {
  customer: string,      // "Sam Park"
  slot: string,          // exact slot returned by check_availability
  service: string
}) => Promise<{
  confirmation: string,  // e.g. "GA-4821"
  ics: boolean           // whether a calendar invite was sent
}>

price_estimator(args: {
  // Shape varies by business — pass through whatever the agent extracted
  [k: string]: unknown
}) => Promise<{
  low: number,
  high: number,
  note: string
}>

create_lead(args: {
  source: "chat",
  name: string,
  phone: string,
  best_time: string
}) => Promise<{
  lead_id: string,
  queued: boolean
}>

create_handoff(args: {
  reason: string,        // e.g. "specialized_job"
  summary: string        // 1-line summary of the conversation
}) => Promise<{
  ticket: string,        // e.g. "H-2014"
  eta: string            // e.g. "within 1 business day"
}>
```

---

## Example: full SSE stream for "How much for weekly mowing?"

```
data: {"kind":"guard","stage":"input","verdict":"pass","rule":"PII / off-topic / injection scan","note":"No PII · on-topic"}

data: {"kind":"agent","decision":"rag","confidence":0.94,"reasoning":"Pricing question — answerable from KB."}

data: {"kind":"rag","query":"weekly mowing price residential","hits":[{"doc":"pricing.md","score":0.94,"snippet":"..."}]}

data: {"kind":"guard","stage":"output","verdict":"pass","rule":"Grounding · hallucination check","note":"Cites pricing.md · all numbers in context"}

data: {"kind":"bot","text":"Weekly mowing starts at **$45**...","chips":["Book a visit","Service area?"]}

data: [DONE]
```

---

## Error handling

| Failure | Behavior |
|---|---|
| LLM timeout (>5s) | Emit `{kind:"bot", text:"Still thinking — give me a moment..."}` then retry once |
| Tool failure | Emit `{kind:"tool", ..., result:{error: "..."}}` then escalate |
| RAG empty / low-score | Emit `{kind:"agent", decision:"escalate", ...}` then `create_handoff` |
| Rate limit | HTTP 429; frontend shows "Too many messages — please wait." |
