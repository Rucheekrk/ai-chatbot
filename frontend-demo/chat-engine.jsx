// chat-engine.jsx — shared chat state + scripted-event player.
// useChat({ business }) returns { messages, traces, activePath, suggestions, send, runScenario, reset }.
// "messages" are what the user sees in the chat bubble stream.
// "traces" are the dev-view trace cards (guardrails, agent decisions, rag, tools).
// "activePath" highlights the architecture diagram while a scenario plays.

const DELAYS = { user: 250, guard: 380, agent: 480, rag: 620, tool: 700, card: 380, bot: 540 };

function useChat({ business }) {
  const biz = BUSINESSES[business];
  const scenarios = React.useMemo(() => makeScenarios(business), [business]);

  const [messages, setMessages] = React.useState([]);
  const [traces, setTraces] = React.useState([]);
  const [activePath, setActivePath] = React.useState(null);
  const [isTyping, setIsTyping] = React.useState(false);
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
        // Update path if the agent switched (e.g. low-confidence RAG → escalate)
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

    // Linger the path highlight, then fade
    await sleep(900);
    setActivePath(null);
    playingRef.current = false;
  };

  const runScenario = (key) => {
    const s = scenarios[key];
    if (!s) return;
    playEvents(s.events, s.path);
  };

  // Keyword routing for typed input
  const matchScenario = (text) => {
    const t = text.toLowerCase().trim();
    // Direct chip-label fast paths (short, exact suggestion clicks)
    if (/^(talk to (a |the )?(human|person|agent)|speak to (a |the )?(human|person|agent)|get a human|human please)$/.test(t)) return 'escalation';
    if (/^(pricing|prices?|cost|costs|rates?|how much)\??$/.test(t)) return 'faq';
    if (/^(book( a visit| a wash| a mowing| a detail| it)?|schedule( a visit)?|book now)\??$/.test(t)) return 'booking';
    if (/^(service area\??|where do you (go|serve)\??|do you (cover|serve) .*|coverage( area)?\??|area\??)$/.test(t)) return 'service_area';
    if (/^(estimate( my .*)?|get (an )?estimate|rough quote|ballpark)\??$/.test(t)) return 'estimate';

    if (/forget|ignore (prior|previous)|jailbreak|scrape|python|script|reviews?\b/.test(t)) return 'guardrail';
    if (/(book|schedule|appointment|tuesday|thursday|saturday|next week)/.test(t)) return 'booking';
    if (/(estimate|quote|how much for|rough price|ballpark)/.test(t)) return 'estimate';
    if (/(call.*back|leave.*number|callback|reach me|contact me)/.test(t)) return 'lead';
    if (/(steep|slope|complex|custom|atrium|wet[\s-]?sand|oxidation|unusual|special|human|person|agent)/.test(t)) return 'escalation';
    if (/(service area|coverage|do you (cover|serve)|come to|come out)/.test(t)) return 'service_area';
    if (/(price|pricing|cost|charge|how much|rate|hours|where)/.test(t)) return 'faq';
    return null;
  };

  const send = (text) => {
    const key = matchScenario(text);
    if (key) {
      runScenario(key);
    } else {
      // Generic fallback — log a low-confidence agent decision + clarify response
      (async () => {
        playingRef.current = true;
        setActivePath('clarify');
        pushMsg({ role: 'user', text });
        await sleep(360);
        pushTrace({ kind: 'guard', stage: 'input', verdict: 'pass', rule: 'PII / off-topic / injection scan', note: 'No PII · ambiguous intent' });
        await sleep(420);
        pushTrace({ kind: 'agent', decision: 'clarify', confidence: 0.52, reasoning: 'Intent unclear — ask a follow-up rather than guess.' });
        setIsTyping(true);
        await sleep(700);
        setIsTyping(false);
        pushMsg({ role: 'bot', text: `Could you tell me a bit more about what you need? I can help with pricing, booking, service area, or hand off to a person.`, chips: ['Pricing', 'Book a visit', 'Talk to a human'] });
        await sleep(700);
        setActivePath(null);
        playingRef.current = false;
      })();
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
