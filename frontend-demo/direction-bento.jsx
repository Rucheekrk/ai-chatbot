// direction-bento.jsx — "Bento"
// Modern SaaS grid. Cream + black + sage green accent.
// Architecture is a bento-style grid of tiles; the active path highlights tiles
// and draws connection arrows between them.

const bentoTheme = {
  bg: '#EFECE3',
  panel: '#FFFFFF',
  ink: '#13140F',
  inkSoft: '#6A695F',
  hair: 'rgba(19,20,15,0.08)',
  accent: '#3F6F4A',    // sage green
  accent2: '#13140F',
  amber: '#D9914A',
  red: '#B24A3F',
  bubbleUser: '#13140F',
  bubbleUserInk: '#EFECE3',
};

function BentoDirection({ business, view, setView, setBusiness }) {
  const chat = useChat({ business });
  const t = bentoTheme;
  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: '"Manrope", -apple-system, system-ui, sans-serif',
      display: 'grid', gridTemplateRows: '64px 1fr',
    }}>
      <BentoHeader business={business} view={view} setView={setView} setBusiness={setBusiness} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', overflow: 'hidden', gap: 14, padding: 14 }}>
        <BentoDiagram t={t} activePath={chat.activePath} />
        <BentoChat chat={chat} view={view} t={t} />
      </div>
    </div>
  );
}

function BentoHeader({ business, view, setView, setBusiness, t }) {
  const biz = BUSINESSES[business];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', borderBottom: `1px solid ${t.hair}`, background: t.bg }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ position: 'relative', width: 30, height: 30 }}>
          <div style={{ position: 'absolute', inset: 0, background: t.accent, borderRadius: 9 }} />
          <div style={{ position: 'absolute', top: 7, left: 7, width: 16, height: 16, background: t.bg, borderRadius: 3 }} />
        </div>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, letterSpacing: -0.4 }}>
            localchat <span style={{ color: t.inkSoft, fontWeight: 500 }}>· {biz.short}</span>
          </div>
          <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 1 }}>{biz.tagline}</div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <BentoBizPicker business={business} setBusiness={setBusiness} t={t} />
        <BentoViewToggle view={view} setView={setView} t={t} />
      </div>
    </div>
  );
}

function BentoBizPicker({ business, setBusiness, t }) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {BIZ_LIST.map((b) => {
        const on = b.id === business;
        return (
          <button key={b.id} onClick={() => setBusiness(b.id)} title={b.name}
            style={{
              width: 38, height: 32, borderRadius: 8, cursor: 'pointer',
              border: `1px solid ${on ? t.ink : t.hair}`,
              background: on ? t.ink : t.panel, color: on ? t.bg : t.ink,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 0,
            }}>
            <BizIcon kind={b.icon} size={16} color={on ? t.bg : t.ink} />
          </button>
        );
      })}
    </div>
  );
}

function BizIcon({ kind, size = 16, color = '#000' }) {
  if (kind === 'lawn') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 13 L4 8 L6 13" />
        <path d="M6 13 L8 6 L10 13" />
        <path d="M10 13 L12 9 L14 13" />
        <path d="M1.5 13 L14.5 13" />
      </svg>
    );
  }
  if (kind === 'window') {
    return (
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4">
        <rect x="2" y="2" width="12" height="12" rx="1" />
        <path d="M8 2 V14 M2 8 H14" />
      </svg>
    );
  }
  return ( // car
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke={color} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 10 L3 6 H13 L14 10 V12 H2 Z" />
      <circle cx="5" cy="12" r="1" />
      <circle cx="11" cy="12" r="1" />
    </svg>
  );
}

function BentoViewToggle({ view, setView, t }) {
  return (
    <div style={{ display: 'flex', background: t.panel, border: `1px solid ${t.hair}`, borderRadius: 8, padding: 3 }}>
      {[['customer', 'Customer'], ['dev', 'Developer']].map(([k, label]) => {
        const on = view === k;
        return (
          <button key={k} onClick={() => setView(k)}
            style={{
              border: 0, background: on ? t.accent : 'transparent', color: on ? '#fff' : t.inkSoft,
              padding: '5px 12px', borderRadius: 6, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
            }}>{label}</button>
        );
      })}
    </div>
  );
}

// ── Bento diagram ───────────────────────────────────────────────────────────
// Tiles arranged in a grid that mimics a real bento layout.

function BentoDiagram({ t, activePath }) {
  const path = activePath ? ARCH_PATHS[activePath] : null;
  const activeNodes = path ? new Set(path.nodes) : new Set();

  const tile = (id, content, gridArea, extra = {}) => {
    const on = activeNodes.has(id);
    return (
      <div key={id} style={{
        gridArea,
        background: on ? t.panel : t.panel,
        border: on ? `1.5px solid ${t.accent}` : `1px solid ${t.hair}`,
        borderRadius: 14,
        padding: 14,
        position: 'relative',
        boxShadow: on ? `0 8px 24px rgba(63,111,74,0.18)` : 'none',
        transition: 'all .3s ease',
        ...extra,
      }}>
        {on && (
          <div style={{ position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4,
            background: t.accent, boxShadow: `0 0 0 4px rgba(63,111,74,0.18)` }} />
        )}
        {content}
      </div>
    );
  };

  const NodeContent = ({ id, title, sub, icon, sample }) => {
    const on = activeNodes.has(id);
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: on ? t.accent : t.bg, color: on ? '#fff' : t.ink,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: on ? 'none' : `1px solid ${t.hair}`,
          }}>{icon}</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: -0.2 }}>{title}</div>
            <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 1 }}>{sub}</div>
          </div>
        </div>
        {sample && <div style={{
          fontSize: 11, color: on ? t.ink : t.inkSoft, marginTop: 10,
          background: t.bg, padding: '7px 9px', borderRadius: 8, lineHeight: 1.45,
          fontFamily: '"JetBrains Mono", monospace',
        }}>{sample}</div>}
      </>
    );
  };

  return (
    <div style={{ background: t.panel, borderRadius: 16, padding: 14, overflow: 'hidden', display: 'grid', gridTemplateRows: 'auto 1fr' }}>
      <div style={{ padding: '4px 6px 12px', borderBottom: `1px solid ${t.hair}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <div style={{ width: 5, height: 5, borderRadius: 3, background: t.accent }} />
          <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: t.accent }}>Architecture</div>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginTop: 6, letterSpacing: -0.6, lineHeight: 1.15 }}>
          RAG knows the answers. Tools take the action. Humans catch the rest.
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gridTemplateRows: 'auto auto auto auto auto',
        gridTemplateAreas: `
          "input  input  agent  agent"
          "guard  guard  agent  agent"
          "rag    rag    tool   human"
          "rag    rag    tool   human"
          "out    out    out    out"
        `,
        gap: 10, marginTop: 12, alignContent: 'start',
      }}>
        {tile('user_in', <NodeContent id="user_in" title="User input" sub="customer message" icon="✍" />, 'input')}
        {tile('guard_in', <NodeContent id="guard_in" title="Input guardrails" sub="PII · off-topic · injection" icon="◈"
          sample={activeNodes.has('guard_in') ? '"how much for weekly mowing?"\n  ✓ on-topic  ✓ no PII  ✓ safe' : 'filter before reasoning'} />, 'guard')}
        {tile('agent', <NodeContent id="agent" title="Agent / Decision engine" sub="route to RAG · tool · human · clarify" icon="◆"
          sample={activeNodes.has('agent') ? `decision = ${activePath}` : 'classify intent, pick path, set confidence'} />, 'agent')}
        {tile('rag', <NodeContent id="rag" title="RAG" sub="pricing · hours · policies · services" icon="📚" />, 'rag')}
        {tile('tool', <NodeContent id="tool" title="Tools" sub="book · estimate · lead · check" icon="⚙" />, 'tool')}
        {tile('human', <NodeContent id="human" title="Human" sub="escalation handoff" icon="↗" />, 'human')}
        {tile('user_out', (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: activeNodes.has('guard_out') ? t.accent : t.bg,
                color: activeNodes.has('guard_out') ? '#fff' : t.ink, border: activeNodes.has('guard_out') ? 'none' : `1px solid ${t.hair}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>◈</div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700 }}>Output guardrails</div>
                <div style={{ fontSize: 10.5, color: t.inkSoft }}>grounding · safety · numbers cited</div>
              </div>
            </div>
            <div style={{ flex: 1, height: 1, background: t.hair }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, textAlign: 'right' }}>Response → User</div>
                <div style={{ fontSize: 10.5, color: t.inkSoft, textAlign: 'right' }}>grounded reply</div>
              </div>
              <div style={{ width: 30, height: 30, borderRadius: 8, background: activeNodes.has('user_out') ? t.accent : t.bg,
                color: activeNodes.has('user_out') ? '#fff' : t.ink, border: activeNodes.has('user_out') ? 'none' : `1px solid ${t.hair}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            </div>
          </div>
        ), 'out', { padding: '10px 14px' })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 10 }}>
        <Stat n="< 200ms" l="guardrail check" t={t} />
        <Stat n="3 docs" l="avg retrieved" t={t} />
        <Stat n="0.70" l="conf. threshold" t={t} />
        <Stat n="1 biz day" l="human SLA" t={t} />
      </div>
    </div>
  );
}

function Stat({ n, l, t }) {
  return (
    <div style={{ background: t.bg, padding: '8px 10px', borderRadius: 10, border: `1px solid ${t.hair}` }}>
      <div style={{ fontSize: 15, fontWeight: 700, letterSpacing: -0.3 }}>{n}</div>
      <div style={{ fontSize: 10.5, color: t.inkSoft, marginTop: 1 }}>{l}</div>
    </div>
  );
}

// ── Bento chat ──────────────────────────────────────────────────────────────

function BentoChat({ chat, view, t }) {
  const [text, setText] = React.useState('');
  const scrollRef = React.useRef(null);
  const traceRef = React.useRef(null);

  React.useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat.messages.length, chat.isTyping]);
  React.useEffect(() => {
    if (traceRef.current) traceRef.current.scrollTop = traceRef.current.scrollHeight;
  }, [chat.traces.length]);

  const submit = (e) => {
    e?.preventDefault();
    if (!text.trim()) return;
    chat.send(text.trim());
    setText('');
  };

  return (
    <div style={{ display: 'grid', gridTemplateRows: view === 'dev' ? '1fr 220px' : '1fr', gap: 12, overflow: 'hidden' }}>
      <div style={{ background: t.panel, borderRadius: 16, overflow: 'hidden',
        display: 'grid', gridTemplateRows: 'auto 1fr auto', border: `1px solid ${t.hair}` }}>
        <div style={{ padding: '12px 16px', borderBottom: `1px solid ${t.hair}`, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 9, background: t.accent, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13 }}>{chat.biz.botName[0]}</div>
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: -0.2 }}>
              {chat.biz.botName} <span style={{ color: t.inkSoft, fontWeight: 500 }}>· {chat.biz.short}</span>
            </div>
            <div style={{ fontSize: 11, color: t.accent, display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: 3, background: t.accent }} />
              Online · typically replies instantly
            </div>
          </div>
          <span style={{ flex: 1 }} />
          <button onClick={chat.reset} style={{ border: `1px solid ${t.hair}`, background: 'transparent',
            color: t.inkSoft, padding: '5px 10px', borderRadius: 6, cursor: 'pointer', fontSize: 11.5, fontFamily: 'inherit' }}>
            Reset
          </button>
        </div>
        <div ref={scrollRef} style={{ overflowY: 'auto', padding: '16px 18px', background: t.bg }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {chat.messages.map((m) => <BentoBubble key={m.id} m={m} t={t} onChip={(label) => chat.send(label)} />)}
            {chat.isTyping && <BentoTyping t={t} />}
            {chat.messages.length <= 1 && (
              <div style={{ marginTop: 6, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                {chat.suggestions.map((s) => (
                  <button key={s.key} onClick={() => chat.runScenario(s.key)}
                    style={{
                      border: `1px solid ${t.hair}`, background: t.panel, color: t.ink,
                      padding: '9px 11px', borderRadius: 10, cursor: 'pointer',
                      fontSize: 12, fontFamily: 'inherit', textAlign: 'left', lineHeight: 1.35,
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <form onSubmit={submit} style={{ padding: 12, borderTop: `1px solid ${t.hair}`, background: t.panel }}>
          <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 12, background: t.bg, border: `1px solid ${t.hair}` }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Ask ${chat.biz.botName} anything…`}
              style={{ flex: 1, border: 0, outline: 0, background: 'transparent', padding: '8px 10px',
                fontFamily: 'inherit', fontSize: 13.5, color: t.ink }} />
            <button type="submit" style={{
              border: 0, background: t.ink, color: t.bg, padding: '0 16px', borderRadius: 8,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}>Send</button>
          </div>
        </form>
      </div>

      {view === 'dev' && (
        <div ref={traceRef} style={{ background: t.panel, borderRadius: 16, border: `1px solid ${t.hair}`, padding: 14, overflow: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <div style={{ width: 5, height: 5, borderRadius: 3, background: t.accent }} />
            <div style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 1.2, textTransform: 'uppercase', color: t.accent }}>
              Live trace · {chat.traces.length}
            </div>
          </div>
          {chat.traces.length === 0 && (
            <div style={{ fontSize: 12, color: t.inkSoft, fontStyle: 'italic' }}>
              Decision trace appears here as the agent reasons.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {chat.traces.map((tr) => <BentoTrace key={tr.id} tr={tr} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function BentoBubble({ m, t, onChip }) {
  if (m.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '76%' }}>
        <div style={{ background: t.bubbleUser, color: t.bubbleUserInk, padding: '10px 14px',
          borderRadius: 14, fontSize: 13.5, lineHeight: 1.45 }}>{m.text}</div>
      </div>
    );
  }
  if (m.card) return <BentoCard card={m.card} t={t} />;
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
      <div style={{ background: t.panel, color: t.ink, padding: '11px 14px', borderRadius: 14,
        fontSize: 13.5, lineHeight: 1.55, border: `1px solid ${t.hair}` }}>
        {renderText(m.text)}
      </div>
      {m.chips && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {m.chips.map((c) => (
            <button key={c} onClick={() => onChip(c)} style={{
              border: `1px solid ${t.hair}`, background: t.panel, color: t.ink,
              padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
              fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function BentoTyping({ t }) {
  return (
    <div style={{ alignSelf: 'flex-start', background: t.panel, border: `1px solid ${t.hair}`,
      padding: '11px 14px', borderRadius: 14, display: 'flex', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: t.accent,
          animation: `bento-dot 1s ${i * 0.12}s infinite` }} />
      ))}
      <style>{`@keyframes bento-dot { 0%,80%,100% { opacity: 0.3 } 40% { opacity: 1 }}`}</style>
    </div>
  );
}

function BentoCard({ card, t }) {
  if (card.kind === 'booking') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: t.panel, border: `1px solid ${t.hair}`,
        borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: 'auto 1fr auto', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: t.accent, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>{card.service}</div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 1 }}>{card.slot}</div>
        </div>
        <div style={{ fontSize: 10.5, fontWeight: 600, color: t.inkSoft, letterSpacing: 0.8, textAlign: 'right' }}>
          {card.confirmation}
        </div>
      </div>
    );
  }
  if (card.kind === 'estimate') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: t.panel, border: `1px solid ${t.hair}`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 10.5, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>Estimate</div>
        <div style={{ fontSize: 13, marginTop: 3, color: t.inkSoft }}>{card.item}</div>
        <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, letterSpacing: -0.8, color: t.accent }}>
          ${card.low}<span style={{ color: t.inkSoft, fontWeight: 600 }}> – </span>${card.high}
        </div>
      </div>
    );
  }
  if (card.kind === 'handoff') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: t.panel, border: `1px solid ${t.amber}`,
        borderRadius: 14, padding: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: t.amber, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>↗</div>
        <div>
          <div style={{ fontSize: 13.5, fontWeight: 700 }}>Connecting you with a person</div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 1 }}>Ticket {card.ticket} · reply {card.eta}</div>
        </div>
      </div>
    );
  }
  if (card.kind === 'lead') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: t.panel, border: `1px solid ${t.hair}`, borderRadius: 14, padding: 14 }}>
        <div style={{ fontSize: 10.5, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 700 }}>Lead saved</div>
        <div style={{ fontSize: 13.5, fontWeight: 700, marginTop: 3 }}>{card.name}</div>
        <div style={{ fontSize: 12, color: t.inkSoft }}>Callback · {card.when}</div>
      </div>
    );
  }
  return null;
}

function BentoTrace({ tr, t }) {
  const color = tr.kind === 'guard' ? (tr.verdict === 'block' ? t.red : t.amber)
    : tr.kind === 'agent' ? (tr.decision === 'escalate' ? t.amber : tr.decision === 'block' ? t.red : t.accent)
    : tr.kind === 'rag' ? t.accent : t.ink;
  return (
    <div style={{ background: t.bg, border: `1px solid ${t.hair}`, borderRadius: 8, padding: '8px 10px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
        <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: 0.6, textTransform: 'uppercase', color }}>
          {tr.kind === 'guard' ? `Guardrail · ${tr.stage}` : tr.kind === 'agent' ? `Agent · ${tr.decision}` : tr.kind === 'rag' ? 'RAG' : `Tool · ${tr.name}`}
        </span>
        {tr.kind === 'agent' && (
          <span style={{ marginLeft: 'auto', fontSize: 10.5, color: t.inkSoft, fontFamily: '"JetBrains Mono", monospace' }}>
            conf {tr.confidence.toFixed(2)}
          </span>
        )}
        {tr.kind === 'guard' && (
          <span style={{ marginLeft: 'auto', fontSize: 10.5, fontWeight: 700, color: tr.verdict === 'block' ? t.red : t.accent }}>
            {tr.verdict.toUpperCase()}
          </span>
        )}
      </div>
      <div style={{ fontSize: 11.5, color: t.ink, marginTop: 4, lineHeight: 1.45 }}>
        {tr.kind === 'guard' && (<><b>{tr.rule}</b> — <span style={{ color: t.inkSoft }}>{tr.note}</span></>)}
        {tr.kind === 'agent' && tr.reasoning}
        {tr.kind === 'rag' && (
          <>
            <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 10.5, color: t.inkSoft }}>
              q: <span style={{ color: t.ink }}>{tr.query}</span>
            </div>
            {tr.hits.map((h, i) => (
              <div key={i} style={{ display: 'flex', gap: 6, fontSize: 11, marginTop: 2 }}>
                <span style={{ fontFamily: '"JetBrains Mono", monospace', color: t.accent, minWidth: 32 }}>{h.score.toFixed(2)}</span>
                <span style={{ color: t.inkSoft, minWidth: 100 }}>{h.doc}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: t.ink, opacity: 0.85 }}>{h.snippet}</span>
              </div>
            ))}
          </>
        )}
        {tr.kind === 'tool' && (
          <div style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 11 }}>
            <span style={{ color: t.accent }}>{tr.name}</span>
            <span style={{ color: t.inkSoft }}>({Object.entries(tr.args).map(([k, v]) => `${k}=${typeof v === 'string' ? `"${v}"` : JSON.stringify(v)}`).join(', ')})</span>
            <div style={{ color: t.inkSoft, marginTop: 2 }}>
              → {Object.entries(tr.result).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('  ·  ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { BentoDirection });
