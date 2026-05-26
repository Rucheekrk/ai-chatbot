// lawn-poc-engine.jsx — chat engine for lawn POC (backend-connected).
// Based on chat-engine.jsx. Only change: send() calls POST /chat on the real backend
// instead of keyword-matching to scripted scenarios.
// useChat({ business }) returns { messages, traces, activePath, suggestions, send, runScenario, reset, biz }.

const DELAYS = { user: 250, guard: 380, agent: 480, rag: 620, tool: 700, card: 380, bot: 540 };

function useChat({ business }) {
  const biz = BUSINESSES[business];
  const scenarios = React.useMemo(() => makeScenarios(business), [business]);

  const [messages, setMessages] = React.useState([]);
  const [traces, setTraces] = React.useState([]);
  const [activePath, setActivePath] = React.useState(null);
  const [isTyping, setIsTyping] = React.useState(false);
  const [sessionId] = React.useState(() => 'lawn-poc-' + Date.now());
  const playingRef = React.useRef(false);

  // Seed welcome whenever business changes
  React.useEffect(() => {
    setMessages([{ id: 'welcome', role: 'bot', text: biz.welcome, ts: Date.now() }]);
    setTraces([]);
    setActivePath(null);
  }, [business]);

  const pushMsg = (m) => setMessages((p) => [...p, { id: 'm' + Date.now() + Math.random(), ts: Date.now(), ...m }]);
  const pushTrace = (t) => setTraces((p) => [...p, { id: 't' + Date.now() + Math.random(), ts: Date.now(), ...t }]);

  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  const playEvents = async (events, pathKey) => {
    if (playingRef.current) return;
    playingRef.current = true;
    setActivePath(pathKey);

    for (let i = 0; i < events.length; i++) {
      const ev = events[i];
      await sleep(DELAYS[ev.kind] || 400);

      if (ev.kind === 'user') {
        pushMsg({ role: 'user', text: ev.text });
      } else if (ev.kind === 'guard') {
        pushTrace({ kind: 'guard', stage: ev.stage, verdict: ev.verdict, rule: ev.rule, note: ev.note });
        if (ev.verdict === 'block') setActivePath('block');
      } else if (ev.kind === 'agent') {
        pushTrace({ kind: 'agent', decision: ev.decision, confidence: ev.confidence, reasoning: ev.reasoning });
        if (ev.decision === 'escalate') setActivePath('escalate');
        else if (ev.decision === 'tool') setActivePath('tool');
        else if (ev.decision === 'rag') setActivePath('rag');
        else if (ev.decision === 'block') setActivePath('block');
      } else if (ev.kind === 'rag') {
        pushTrace({ kind: 'rag', query: ev.query, hits: ev.hits });
      } else if (ev.kind === 'tool') {
        pushTrace({ kind: 'tool', name: ev.name, args: ev.args, result: ev.result });
      } else if (ev.kind === 'card') {
        pushMsg({ role: 'bot', card: ev.card });
      } else if (ev.kind === 'bot') {
        setIsTyping(true);
        await sleep(550);
        setIsTyping(false);
        pushMsg({ role: 'bot', text: ev.text, chips: ev.chips });
      }
    }

    await sleep(900);
    setActivePath(null);
    playingRef.current = false;
  };

  const runScenario = (key) => {
    const s = scenarios[key];
    if (!s) return;
    playEvents(s.events, s.path);
  };

  // send() — calls real backend instead of scripted keyword routing
  const send = async (text) => {
    if (playingRef.current) return;
    pushMsg({ role: 'user', text });
    setIsTyping(true);
    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, message: text, business: 'lawn' }),
      });
      const data = await res.json();
      setIsTyping(false);
      if (data.card) pushMsg({ role: 'bot', card: data.card });
      pushMsg({ role: 'bot', text: data.text });
    } catch (err) {
      setIsTyping(false);
      pushMsg({ role: 'bot', text: "Couldn't reach the server. Make sure the backend is running on localhost:8000." });
    }
  };

  const reset = () => {
    setMessages([{ id: 'welcome' + Date.now(), role: 'bot', text: biz.welcome, ts: Date.now() }]);
    setTraces([]);
    setActivePath(null);
  };

  const suggestions = [
    { label: scenarios.faq.label, key: 'faq' },
    { label: scenarios.service_area.label, key: 'service_area' },
    { label: scenarios.booking.label, key: 'booking' },
    { label: scenarios.estimate.label, key: 'estimate' },
    { label: scenarios.lead.label, key: 'lead' },
    { label: scenarios.escalation.label, key: 'escalation' },
    { label: scenarios.guardrail.label, key: 'guardrail' },
  ];

  return { messages, traces, activePath, suggestions, isTyping, send, runScenario, reset, biz };
}

// Tiny markdown-ish renderer: **bold** only.
function renderText(text) {
  if (!text) return null;
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => p.startsWith('**') && p.endsWith('**')
    ? <strong key={i}>{p.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{p}</React.Fragment>);
}

// Architecture nodes shared across directions. Edges describe paths.
const ARCH_NODES = [
  { id: 'user_in',   label: 'User',              sub: 'input' },
  { id: 'guard_in',  label: 'Input Guardrails',  sub: 'filter · PII · injection' },
  { id: 'agent',     label: 'Agent',             sub: 'decision engine' },
  { id: 'rag',       label: 'RAG',               sub: 'vector db · docs' },
  { id: 'tool',      label: 'Tools',             sub: 'calendar · CRM · pricing' },
  { id: 'human',     label: 'Human',             sub: 'escalation' },
  { id: 'response',  label: 'Response',          sub: 'LLM generation' },
  { id: 'guard_out', label: 'Output Guardrails', sub: 'grounding · safety' },
  { id: 'user_out',  label: 'User',              sub: 'reply' },
];

// Each path key activates a set of nodes + edges in the diagram.
const ARCH_PATHS = {
  rag:      { nodes: ['user_in','guard_in','agent','rag','response','guard_out','user_out'],
              edges: ['user_in>guard_in','guard_in>agent','agent>rag','rag>response','response>guard_out','guard_out>user_out'] },
  tool:     { nodes: ['user_in','guard_in','agent','tool','response','guard_out','user_out'],
              edges: ['user_in>guard_in','guard_in>agent','agent>tool','tool>response','response>guard_out','guard_out>user_out'] },
  escalate: { nodes: ['user_in','guard_in','agent','human'],
              edges: ['user_in>guard_in','guard_in>agent','agent>human'] },
  clarify:  { nodes: ['user_in','guard_in','agent','response','guard_out','user_out'],
              edges: ['user_in>guard_in','guard_in>agent','agent>response','response>guard_out','guard_out>user_out'] },
  block:    { nodes: ['user_in','guard_in'],
              edges: ['user_in>guard_in'] },
};

Object.assign(window, { useChat, renderText, ARCH_NODES, ARCH_PATHS });
