// direction-warm.jsx — "Local & Loved"
// Warm consumer SMB: cream + terracotta + deep evergreen, soft serif headlines.
// Architecture diagram is hand-drawn-feeling with rounded organic nodes.

const warmTheme = {
  bg: '#FBF6EC',
  panel: '#FFFDF8',
  ink: '#2A2520',
  inkSoft: '#6E6258',
  hair: 'rgba(42,37,32,0.10)',
  accent: '#C8553D',      // terracotta
  accent2: '#3E5C3A',     // deep green
  agentBlue: '#3E5C3A',
  rag: '#3E5C3A',
  tool: '#C8553D',
  human: '#8C6A3E',
  block: '#A23E2A',
  warn: '#C68A3E',
  bubbleUser: '#3E5C3A',
  bubbleUserInk: '#FBF6EC',
  bubbleBot: '#FFFFFF',
};

function WarmDirection({ business, view, setView, setBusiness }) {
  const chat = useChat({ business });
  const t = warmTheme;

  return (
    <div style={{
      width: '100%', height: '100%',
      background: t.bg, color: t.ink,
      fontFamily: '"Plus Jakarta Sans", -apple-system, system-ui, sans-serif',
      display: 'grid', gridTemplateRows: '64px 1fr',
    }}>
      <WarmHeader business={business} view={view} setView={setView} setBusiness={setBusiness} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', overflow: 'hidden' }}>
        <WarmDiagram t={t} activePath={chat.activePath} traces={chat.traces} />
        <WarmChat chat={chat} view={view} t={t} />
      </div>
    </div>
  );
}

function WarmHeader({ business, view, setView, setBusiness, t }) {
  const biz = BUSINESSES[business];
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: `1px solid ${t.hair}`, background: t.panel,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <WarmLogo t={t} />
        <div>
          <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 22, lineHeight: 1, fontWeight: 400 }}>
            <span style={{ color: t.accent }}>localchat</span>
            <span style={{ color: t.inkSoft }}> · {biz.short}</span>
          </div>
          <div style={{ fontSize: 11, color: t.inkSoft, marginTop: 3, letterSpacing: 0.4, textTransform: 'uppercase' }}>
            RAG · Agent · Tools · Human handoff
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <BizPicker business={business} setBusiness={setBusiness} t={t} />
        <ViewToggle view={view} setView={setView} t={t} />
      </div>
    </div>
  );
}

function WarmLogo({ t }) {
  return (
    <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
      <circle cx="17" cy="17" r="16" fill={t.accent} />
      <path d="M9 21c0-5 3-9 8-9s8 4 8 9v3H9z" fill={t.bg} />
      <circle cx="14" cy="18" r="1.2" fill={t.accent} />
      <circle cx="20" cy="18" r="1.2" fill={t.accent} />
    </svg>
  );
}

function BizPicker({ business, setBusiness, t }) {
  return (
    <div style={{ display: 'flex', background: t.bg, border: `1px solid ${t.hair}`, borderRadius: 999, padding: 3 }}>
      {BIZ_LIST.map((b) => {
        const on = b.id === business;
        return (
          <button key={b.id} onClick={() => setBusiness(b.id)}
            style={{
              border: 0, background: on ? t.ink : 'transparent', color: on ? t.bg : t.inkSoft,
              padding: '6px 12px', borderRadius: 999, cursor: 'pointer',
              fontSize: 12, fontWeight: 500, fontFamily: 'inherit', letterSpacing: 0.2,
            }}>
            {b.short}
          </button>
        );
      })}
    </div>
  );
}

function ViewToggle({ view, setView, t }) {
  return (
    <div style={{ display: 'flex', background: t.bg, border: `1px solid ${t.hair}`, borderRadius: 999, padding: 3 }}>
      {[['customer', 'Customer'], ['dev', 'Developer']].map(([k, label]) => {
        const on = view === k;
        return (
          <button key={k} onClick={() => setView(k)}
            style={{
              border: 0, background: on ? t.accent : 'transparent', color: on ? '#fff' : t.inkSoft,
              padding: '6px 14px', borderRadius: 999, cursor: 'pointer',
              fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
            {k === 'dev' && (
              <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor"><circle cx="2" cy="5" r="1"/><circle cx="5" cy="5" r="1"/><circle cx="8" cy="5" r="1"/></svg>
            )}
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Architecture diagram (warm direction) ───────────────────────────────────
// Hand-drawn-ish: rounded organic node shapes, terracotta active highlights,
// curved connection paths. Active path animates with a flowing dash.

function WarmDiagram({ t, activePath, traces }) {
  const path = activePath ? ARCH_PATHS[activePath] : null;
  const activeNodes = path ? new Set(path.nodes) : new Set();
  const activeEdges = path ? new Set(path.edges) : new Set();

  // Node positions (in 560 × 720 design space; CSS scales)
  // Layout: user_in top, guard_in below, agent below that, then a branch row
  // (rag, tool, human, clarify), then response, guard_out, user_out at bottom.
  const W = 560, H = 720;
  const N = {
    user_in:   { x: 280, y:  44 },
    guard_in:  { x: 280, y: 134 },
    agent:     { x: 280, y: 234 },
    rag:       { x:  92, y: 354 },
    tool:      { x: 282, y: 354 },
    human:     { x: 470, y: 354 },
    response:  { x: 188, y: 484 },
    guard_out: { x: 188, y: 574 },
    user_out:  { x: 188, y: 654 },
  };

  const edges = [
    ['user_in', 'guard_in'],
    ['guard_in', 'agent'],
    ['agent', 'rag'],
    ['agent', 'tool'],
    ['agent', 'human'],
    ['rag', 'response'],
    ['tool', 'response'],
    ['response', 'guard_out'],
    ['guard_out', 'user_out'],
  ];

  return (
    <div style={{
      padding: '24px 28px', overflow: 'hidden',
      borderRight: `1px solid ${t.hair}`, position: 'relative',
      display: 'grid', gridTemplateRows: 'auto 1fr',
    }}>
      <div>
        <div style={{ fontSize: 11, color: t.inkSoft, letterSpacing: 1.2, textTransform: 'uppercase', fontWeight: 600 }}>
          How it works
        </div>
        <div style={{ fontFamily: '"Instrument Serif", Georgia, serif', fontSize: 28, lineHeight: 1.22, marginTop: 6, marginBottom: 18 }}>
          A <em style={{ color: t.accent }}>decision-driven</em> chatbot — RAG for knowledge, tools for action, humans as fallback.
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, lineHeight: 1.5, maxWidth: 460 }}>
          Every message is filtered, classified, and routed before a single token is generated. The active path lights up below as the chat runs →
        </div>
      </div>

      <div style={{ position: 'relative', marginTop: 8 }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <filter id="warm-soft" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="0.3"/>
            </filter>
            <marker id="warm-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={t.inkSoft} opacity="0.5" />
            </marker>
            <marker id="warm-arrow-on" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0,0 L10,5 L0,10 z" fill={t.accent} />
            </marker>
          </defs>

          {/* edges */}
          {edges.map(([from, to]) => {
            const a = N[from], b = N[to];
            const key = `${from}>${to}`;
            const on = activeEdges.has(key);
            const dx = b.x - a.x;
            const dy = b.y - a.y;
            // Curve sideways for branches
            const isBranch = from === 'agent' || to === 'response';
            const mx = isBranch ? a.x + dx * 0.5 + (dx === 0 ? 0 : dx > 0 ? 18 : -18) : (a.x + b.x) / 2;
            const my = isBranch ? a.y + dy * 0.5 : (a.y + b.y) / 2;
            const ay = a.y + 30, by = b.y - 30;
            const d = `M ${a.x} ${ay} Q ${mx} ${my} ${b.x} ${by}`;
            return (
              <g key={key}>
                <path d={d} fill="none"
                  stroke={on ? t.accent : t.inkSoft}
                  strokeOpacity={on ? 1 : 0.28}
                  strokeWidth={on ? 2.2 : 1.4}
                  strokeDasharray={on ? '6 5' : '0'}
                  markerEnd={on ? 'url(#warm-arrow-on)' : 'url(#warm-arrow)'}>
                  {on && <animate attributeName="stroke-dashoffset" from="22" to="0" dur="0.9s" repeatCount="indefinite" />}
                </path>
              </g>
            );
          })}

          {/* nodes */}
          {ARCH_NODES.map((n) => {
            const p = N[n.id];
            if (!p) return null;
            const on = activeNodes.has(n.id);
            const w = 152, h = 58;
            const color = on
              ? (n.id === 'human' ? t.human : n.id === 'rag' ? t.rag : n.id === 'tool' ? t.tool : n.id.startsWith('guard') ? t.warn : t.accent)
              : t.ink;
            return (
              <g key={n.id} transform={`translate(${p.x - w / 2}, ${p.y - h / 2})`}>
                <rect width={w} height={h} rx={18} ry={18}
                  fill={on ? '#FFFFFF' : t.panel}
                  stroke={on ? color : t.hair}
                  strokeWidth={on ? 2 : 1}
                  filter="url(#warm-soft)"
                  style={{ transition: 'all .35s' }}/>
                {on && (
                  <rect width={w} height={h} rx={18} ry={18} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth="6">
                    <animate attributeName="stroke-opacity" values="0.3;0.05;0.3" dur="1.6s" repeatCount="indefinite" />
                  </rect>
                )}
                <text x={w / 2} y={24} textAnchor="middle"
                  style={{ font: `600 13px/1 "Plus Jakarta Sans", sans-serif`, fill: color, letterSpacing: 0.1 }}>
                  {n.label}
                </text>
                <text x={w / 2} y={42} textAnchor="middle"
                  style={{ font: `400 10.5px/1 "Plus Jakarta Sans", sans-serif`, fill: on ? color : t.inkSoft, opacity: 0.75 }}>
                  {n.sub}
                </text>
              </g>
            );
          })}

          {/* Branch labels */}
          <text x={185} y={296} style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>knowledge</text>
          <text x={282} y={296} textAnchor="middle" style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>actions</text>
          <text x={378} y={296} textAnchor="end" style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>escalate</text>
        </svg>

        {/* Phase chips */}
        <div style={{ position: 'absolute', bottom: 14, left: 14, right: 14, display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Pill t={t} label="Phase 1 · RAG + Base LLM" on />
          <Pill t={t} label="Phase 2 · Tools + Booking" />
          <Pill t={t} label="Phase 3 · Eval" />
          <Pill t={t} label="Phase 4 · Fine-tune (only if needed)" />
        </div>
      </div>
    </div>
  );
}

function Pill({ label, on, t }) {
  return (
    <div style={{
      fontSize: 10.5, padding: '5px 11px', borderRadius: 999,
      background: on ? t.accent : 'transparent',
      color: on ? '#fff' : t.inkSoft,
      border: on ? 'none' : `1px dashed ${t.hair}`,
      fontWeight: 500, letterSpacing: 0.2,
    }}>{label}</div>
  );
}

// ── Chat panel (warm direction) ─────────────────────────────────────────────

function WarmChat({ chat, view, t }) {
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
    <div style={{ display: 'grid', gridTemplateRows: view === 'dev' ? '1fr 220px' : '1fr', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateRows: '1fr auto', overflow: 'hidden' }}>
        <div ref={scrollRef} style={{ overflowY: 'auto', padding: '20px 24px 8px' }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {chat.messages.map((m) => <WarmBubble key={m.id} m={m} t={t} onChip={(label) => chat.send(label)} />)}
            {chat.isTyping && <WarmTyping t={t} />}
            {chat.messages.length <= 1 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 6 }}>
                {chat.suggestions.map((s) => (
                  <button key={s.key} onClick={() => chat.runScenario(s.key)}
                    style={{
                      border: `1px solid ${t.hair}`, background: t.panel, color: t.ink,
                      padding: '8px 14px', borderRadius: 999, cursor: 'pointer',
                      fontSize: 12.5, fontWeight: 500, fontFamily: 'inherit',
                    }}>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <form onSubmit={submit} style={{ padding: '14px 24px 18px', borderTop: `1px solid ${t.hair}`, background: t.panel }}>
          <div style={{ maxWidth: 520, margin: '0 auto', display: 'flex', gap: 8, alignItems: 'center',
            border: `1px solid ${t.hair}`, borderRadius: 14, padding: '6px 6px 6px 14px', background: t.bg }}>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder={`Message ${chat.biz.botName}…`}
              style={{ flex: 1, border: 0, outline: 0, background: 'transparent', fontFamily: 'inherit', fontSize: 14, color: t.ink }} />
            <button type="button" onClick={chat.reset} style={{ background: 'transparent', border: 0, color: t.inkSoft, fontSize: 11.5, padding: '6px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>reset</button>
            <button type="submit" style={{
              border: 0, background: t.accent, color: '#fff', padding: '8px 16px', borderRadius: 10,
              fontFamily: 'inherit', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}>Send</button>
          </div>
          <div style={{ maxWidth: 520, margin: '8px auto 0', fontSize: 10.5, color: t.inkSoft, letterSpacing: 0.3, textAlign: 'center' }}>
            Try a suggested scenario above, or type your own.
          </div>
        </form>
      </div>
      {view === 'dev' && (
        <div ref={traceRef} style={{ background: '#F4ECDD', borderTop: `1px solid ${t.hair}`, overflow: 'auto', padding: '12px 18px' }}>
          <div style={{ fontSize: 10, letterSpacing: 1.4, textTransform: 'uppercase', fontWeight: 700, color: t.inkSoft, marginBottom: 8 }}>
            Decision trace · {chat.traces.length} events
          </div>
          {chat.traces.length === 0 && (
            <div style={{ fontSize: 12, color: t.inkSoft, fontStyle: 'italic' }}>
              Start a scenario — guardrails, agent decisions, RAG retrievals, and tool calls will stream here.
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {chat.traces.map((tr) => <WarmTrace key={tr.id} tr={tr} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function WarmBubble({ m, t, onChip }) {
  if (m.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '76%', background: t.bubbleUser, color: t.bubbleUserInk,
        padding: '10px 14px', borderRadius: '16px 16px 4px 16px', fontSize: 14, lineHeight: 1.45 }}>
        {m.text}
      </div>
    );
  }
  if (m.card) return <WarmCard card={m.card} t={t} />;
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '86%' }}>
      <div style={{
        background: t.bubbleBot, color: t.ink, padding: '11px 14px', borderRadius: '16px 16px 16px 4px',
        fontSize: 14, lineHeight: 1.55, border: `1px solid ${t.hair}`,
      }}>
        {renderText(m.text)}
      </div>
      {m.chips && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {m.chips.map((c) => (
            <button key={c} onClick={() => onChip(c)} style={{
              border: `1px solid ${t.accent}`, background: 'transparent', color: t.accent,
              padding: '5px 11px', borderRadius: 999, cursor: 'pointer',
              fontSize: 11.5, fontWeight: 500, fontFamily: 'inherit',
            }}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function WarmTyping({ t }) {
  return (
    <div style={{ alignSelf: 'flex-start', background: t.bubbleBot, padding: '12px 16px',
      borderRadius: '16px 16px 16px 4px', border: `1px solid ${t.hair}`, display: 'flex', gap: 4 }}>
      {[0, 1, 2].map((i) => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: 3, background: t.inkSoft, opacity: 0.4,
          animation: `warm-dot 1s ${i * 0.15}s infinite` }} />
      ))}
      <style>{`@keyframes warm-dot { 0%,80%,100% { opacity: 0.2; transform: translateY(0)} 40% { opacity: 0.85; transform: translateY(-3px)}}`}</style>
    </div>
  );
}

function WarmCard({ card, t }) {
  if (card.kind === 'booking') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: t.panel, border: `1px solid ${t.hair}`,
        borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: t.accent2, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✓</div>
        <div>
          <div style={{ fontSize: 11, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Booking confirmed · {card.confirmation}</div>
          <div style={{ fontSize: 14.5, fontWeight: 600, marginTop: 2 }}>{card.service}</div>
          <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 1 }}>{card.slot}</div>
        </div>
      </div>
    );
  }
  if (card.kind === 'estimate') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: t.panel, border: `1px solid ${t.hair}`,
        borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Estimate</div>
        <div style={{ fontSize: 14, marginTop: 2 }}>{card.item}</div>
        <div style={{ fontFamily: '"Instrument Serif", serif', fontSize: 30, marginTop: 6, color: t.accent }}>
          ${card.low}<span style={{ color: t.inkSoft }}> – </span>${card.high}
        </div>
      </div>
    );
  }
  if (card.kind === 'handoff') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: '#FFF6E8', border: `1px solid ${t.warn}`,
        borderRadius: 12, padding: 14, display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 12, alignItems: 'center' }}>
        <div style={{ width: 44, height: 44, borderRadius: 10, background: t.warn, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>↗</div>
        <div>
          <div style={{ fontSize: 11, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Handoff · {card.ticket}</div>
          <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>Routed to a human</div>
          <div style={{ fontSize: 12.5, color: t.inkSoft, marginTop: 1 }}>Reply {card.eta}</div>
        </div>
      </div>
    );
  }
  if (card.kind === 'lead') {
    return (
      <div style={{ alignSelf: 'flex-start', maxWidth: '86%', background: t.panel, border: `1px solid ${t.hair}`,
        borderRadius: 12, padding: 14 }}>
        <div style={{ fontSize: 11, color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>Lead saved</div>
        <div style={{ fontSize: 14, fontWeight: 600, marginTop: 3 }}>{card.name}</div>
        <div style={{ fontSize: 12.5, color: t.inkSoft }}>Callback · {card.when}</div>
      </div>
    );
  }
  return null;
}

function WarmTrace({ tr, t }) {
  const color = tr.kind === 'guard' ? (tr.verdict === 'block' ? t.block : t.warn)
    : tr.kind === 'agent' ? (tr.decision === 'escalate' ? t.human : tr.decision === 'block' ? t.block : t.agentBlue)
    : tr.kind === 'rag' ? t.rag : t.tool;
  const label = tr.kind === 'guard' ? `guardrail · ${tr.stage}` : tr.kind;
  return (
    <div style={{ background: '#FFFDF8', border: `1px solid ${t.hair}`, borderLeft: `3px solid ${color}`, borderRadius: 8, padding: '9px 11px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ font: '600 10px "JetBrains Mono", monospace', textTransform: 'uppercase', letterSpacing: 0.8, color }}>
          {label}{tr.kind === 'agent' && ` · ${tr.decision}`}{tr.kind === 'tool' && ` · ${tr.name}`}
        </div>
        {tr.kind === 'agent' && (
          <div style={{ font: '500 10.5px "JetBrains Mono", monospace', color: t.inkSoft }}>
            confidence {tr.confidence.toFixed(2)}
          </div>
        )}
        {tr.kind === 'guard' && (
          <div style={{ font: '500 10.5px "JetBrains Mono", monospace', color: tr.verdict === 'block' ? t.block : t.accent2 }}>
            {tr.verdict.toUpperCase()}
          </div>
        )}
      </div>
      {tr.kind === 'guard' && (
        <div style={{ fontSize: 11.5, color: t.ink, marginTop: 4 }}><b>{tr.rule}</b> — <span style={{ color: t.inkSoft }}>{tr.note}</span></div>
      )}
      {tr.kind === 'agent' && (
        <div style={{ fontSize: 11.5, color: t.ink, marginTop: 4 }}>{tr.reasoning}</div>
      )}
      {tr.kind === 'rag' && (
        <div style={{ marginTop: 4 }}>
          <div style={{ fontSize: 11, color: t.inkSoft }}>query: <code style={{ background: '#F3EBDA', padding: '1px 5px', borderRadius: 3, color: t.ink }}>{tr.query}</code></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
            {tr.hits.map((h, i) => (
              <div key={i} style={{ fontSize: 11, display: 'flex', gap: 8, color: t.ink }}>
                <span style={{ font: '500 10.5px "JetBrains Mono", monospace', color: t.accent, minWidth: 32 }}>{h.score.toFixed(2)}</span>
                <span style={{ color: t.inkSoft, minWidth: 110 }}>{h.doc}</span>
                <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: t.ink, opacity: 0.85 }}>{h.snippet}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {tr.kind === 'tool' && (
        <div style={{ marginTop: 4, fontSize: 11, color: t.ink }}>
          <code style={{ font: '500 11px "JetBrains Mono", monospace', color: t.accent }}>{tr.name}(</code>
          <span style={{ font: '500 11px "JetBrains Mono", monospace', color: t.inkSoft }}>
            {Object.entries(tr.args).map(([k, v]) => `${k}=${typeof v === 'string' ? `"${v}"` : Array.isArray(v) ? `[${v.join(',')}]` : JSON.stringify(v)}`).join(', ')}
          </span>
          <code style={{ font: '500 11px "JetBrains Mono", monospace', color: t.accent }}>)</code>
          <span style={{ color: t.inkSoft }}> → </span>
          <span style={{ font: '500 11px "JetBrains Mono", monospace', color: t.ink }}>
            {Object.entries(tr.result).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join(' · ')}
          </span>
        </div>
      )}
    </div>
  );
}

Object.assign(window, { WarmDirection });
