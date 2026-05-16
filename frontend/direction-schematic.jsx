// direction-schematic.jsx — "System Trace"
// Dev-leaning schematic. Cool navy + bone + amber accent. Mono labels.
// Architecture diagram is a rectilinear wire schematic with line edges.

const schemTheme = {
  bg: '#F4F1EA',
  panel: '#FFFFFF',
  ink: '#15202B',
  inkSoft: '#5B6878',
  hair: 'rgba(21,32,43,0.10)',
  accent: '#1F3D6B',
  accent2: '#D89A2C',
  green: '#3F7D44',
  red: '#B2483A',
  bubbleUser: '#15202B',
  bubbleUserInk: '#F4F1EA',
};

function SchemDirection({ business, view, setView, setBusiness }) {
  const chat = useChat({ business });
  const t = schemTheme;

  return (
    <div style={{
      width: '100%', height: '100%', background: t.bg, color: t.ink,
      fontFamily: '"Geist", -apple-system, system-ui, sans-serif',
      display: 'grid', gridTemplateRows: '64px 1fr',
    }}>
      <SchemHeader business={business} view={view} setView={setView} setBusiness={setBusiness} t={t} />
      <div style={{ display: 'grid', gridTemplateColumns: '1.05fr 1fr', overflow: 'hidden' }}>
        <SchemDiagram t={t} activePath={chat.activePath} />
        <SchemChat chat={chat} view={view} t={t} />
      </div>
    </div>
  );
}

function SchemHeader({ business, view, setView, setBusiness, t }) {
  const biz = BUSINESSES[business];
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 24px', borderBottom: `1px solid ${t.hair}`, background: t.panel }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 30, height: 30, background: t.accent, color: '#fff', display: 'flex',
          alignItems: 'center', justifyContent: 'center', borderRadius: 4, font: '700 14px "JetBrains Mono", monospace' }}>::</div>
        <div>
          <div style={{ font: '600 14px "JetBrains Mono", monospace', color: t.ink, letterSpacing: -0.2 }}>
            localchat<span style={{ color: t.inkSoft, fontWeight: 400 }}>/{biz.id}</span>
          </div>
          <div style={{ font: '500 10px "JetBrains Mono", monospace', color: t.inkSoft, marginTop: 1, letterSpacing: 0.4 }}>
            {biz.tagline}
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <SchemBizPicker business={business} setBusiness={setBusiness} t={t} />
        <SchemViewToggle view={view} setView={setView} t={t} />
      </div>
    </div>
  );
}

function SchemBizPicker({ business, setBusiness, t }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: t.bg, border: `1px solid ${t.hair}`, padding: 3, borderRadius: 6 }}>
      {BIZ_LIST.map((b) => {
        const on = b.id === business;
        return (
          <button key={b.id} onClick={() => setBusiness(b.id)}
            style={{
              border: 0, background: on ? t.panel : 'transparent', color: on ? t.ink : t.inkSoft,
              padding: '5px 10px', borderRadius: 4, cursor: 'pointer',
              font: `${on ? 600 : 500} 11px "JetBrains Mono", monospace`,
              boxShadow: on ? `inset 0 0 0 1px ${t.hair}` : 'none',
            }}>
            {b.id}
          </button>
        );
      })}
    </div>
  );
}

function SchemViewToggle({ view, setView, t }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: t.bg, border: `1px solid ${t.hair}`, padding: 3, borderRadius: 6 }}>
      {[['customer', 'customer'], ['dev', 'developer']].map(([k, label]) => {
        const on = view === k;
        return (
          <button key={k} onClick={() => setView(k)}
            style={{
              border: 0, background: on ? t.ink : 'transparent', color: on ? t.bg : t.inkSoft,
              padding: '5px 12px', borderRadius: 4, cursor: 'pointer',
              font: `${on ? 600 : 500} 11px "JetBrains Mono", monospace`,
            }}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// ── Schematic diagram ───────────────────────────────────────────────────────

function SchemDiagram({ t, activePath }) {
  const path = activePath ? ARCH_PATHS[activePath] : null;
  const activeNodes = path ? new Set(path.nodes) : new Set();
  const activeEdges = path ? new Set(path.edges) : new Set();

  const W = 560, H = 760;
  // Layout: cleaner orthogonal grid w/ clear "lanes"
  const N = {
    user_in:   { x: 280, y:  52 },
    guard_in:  { x: 280, y: 142 },
    agent:     { x: 280, y: 240 },
    rag:       { x:  92, y: 360 },
    tool:      { x: 282, y: 360 },
    human:     { x: 470, y: 360 },
    response:  { x: 188, y: 484 },
    guard_out: { x: 188, y: 580 },
    user_out:  { x: 188, y: 668 },
  };

  // Right-angle paths between nodes for the wire look
  const wire = (a, b) => {
    if (a.x === b.x) return `M ${a.x} ${a.y + 30} L ${b.x} ${b.y - 30}`;
    const midY = (a.y + b.y) / 2;
    return `M ${a.x} ${a.y + 30} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y - 30}`;
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
    <div style={{ background: t.panel, borderRight: `1px solid ${t.hair}`, overflow: 'hidden',
      display: 'grid', gridTemplateRows: 'auto auto 1fr',
      backgroundImage: `radial-gradient(${t.hair} 1px, transparent 1px)`,
      backgroundSize: '14px 14px', backgroundPosition: '7px 7px' }}>
      <div style={{ padding: '20px 28px 4px', background: `linear-gradient(${t.panel}, transparent)` }}>
        <div style={{ font: '600 10.5px "JetBrains Mono", monospace', letterSpacing: 1.6, color: t.accent, textTransform: 'uppercase' }}>
          system.flow
        </div>
        <div style={{ fontSize: 26, lineHeight: 1.15, marginTop: 6, fontWeight: 600, letterSpacing: -0.5, maxWidth: 520 }}>
          Decide before you generate.
        </div>
        <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 6, maxWidth: 480, lineHeight: 1.55 }}>
          The agent classifies every message before any retrieval or tool call runs.
          Cheap rejections happen at the guardrail. Expensive paths only fire when warranted.
        </div>
      </div>

      <div style={{ padding: '8px 28px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {[['rag','RAG'],['tool','Tool'],['escalate','Human'],['block','Blocked'],['clarify','Clarify']].map(([k, label]) => (
          <span key={k} style={{
            font: '500 10.5px "JetBrains Mono", monospace',
            padding: '4px 9px', borderRadius: 4,
            background: activePath === k ? t.accent2 : t.bg,
            color: activePath === k ? t.ink : t.inkSoft,
            border: `1px solid ${activePath === k ? t.accent2 : t.hair}`,
            fontWeight: activePath === k ? 700 : 500,
          }}>{label}</span>
        ))}
        <span style={{ flex: 1 }} />
        <span style={{ font: '500 10.5px "JetBrains Mono", monospace', color: t.inkSoft }}>
          {activePath ? `path = ${activePath}` : 'idle'}
        </span>
      </div>

      <div style={{ padding: 8, overflow: 'hidden', position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '100%', display: 'block' }} preserveAspectRatio="xMidYMid meet">
          <defs>
            <marker id="schem-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill={t.inkSoft} opacity="0.5" />
            </marker>
            <marker id="schem-arrow-on" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto">
              <path d="M0 0 L8 4 L0 8 z" fill={t.accent2} />
            </marker>
          </defs>

          {/* edges */}
          {edges.map(([from, to]) => {
            const a = N[from], b = N[to];
            const key = `${from}>${to}`;
            const on = activeEdges.has(key);
            return (
              <g key={key}>
                <path d={wire(a, b)} fill="none"
                  stroke={on ? t.accent2 : t.inkSoft}
                  strokeOpacity={on ? 1 : 0.32}
                  strokeWidth={on ? 1.8 : 1}
                  strokeDasharray={on ? '5 4' : '0'}
                  markerEnd={on ? 'url(#schem-arrow-on)' : 'url(#schem-arrow)'}>
                  {on && <animate attributeName="stroke-dashoffset" from="18" to="0" dur="0.7s" repeatCount="indefinite" />}
                </path>
              </g>
            );
          })}

          {/* nodes */}
          {ARCH_NODES.map((n) => {
            const p = N[n.id];
            if (!p) return null;
            const on = activeNodes.has(n.id);
            const w = 156, h = 60;
            return (
              <g key={n.id} transform={`translate(${p.x - w/2}, ${p.y - h/2})`}>
                <rect width={w} height={h} rx={6} ry={6}
                  fill={on ? t.panel : t.bg}
                  stroke={on ? t.accent : t.hair}
                  strokeWidth={on ? 1.5 : 1} />
                {on && (
                  <rect width={w} height={3} fill={t.accent2} />
                )}
                <text x={12} y={26}
                  style={{ font: `600 13px "Geist", sans-serif`, fill: t.ink }}>
                  {n.label}
                </text>
                <text x={12} y={44}
                  style={{ font: `500 10px "JetBrains Mono", monospace`, fill: t.inkSoft, letterSpacing: 0.3 }}>
                  {n.sub}
                </text>
                <text x={w - 8} y={18} textAnchor="end"
                  style={{ font: '500 9px "JetBrains Mono", monospace', fill: on ? t.accent2 : 'transparent', letterSpacing: 0.5 }}>
                  ●
                </text>
              </g>
            );
          })}

          {/* Branch annotations */}
          <text x={185} y={302} style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>knowledge</text>
          <text x={282} y={302} textAnchor="middle" style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>actions</text>
          <text x={378} y={302} textAnchor="end" style={{ font: '500 10px "JetBrains Mono", monospace', fill: t.inkSoft }}>escalate</text>

          {/* Guardrail brackets */}
          <text x={460} y={148} style={{ font: '500 9.5px "JetBrains Mono", monospace', fill: t.red, letterSpacing: 0.4 }}>filter →</text>
          <text x={360} y={584} style={{ font: '500 9.5px "JetBrains Mono", monospace', fill: t.red, letterSpacing: 0.4 }}>grounding →</text>
        </svg>
      </div>
    </div>
  );
}

// ── Schematic chat ──────────────────────────────────────────────────────────

function SchemChat({ chat, view, t }) {
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
    <div style={{ display: 'grid', gridTemplateRows: view === 'dev' ? '1fr 240px' : '1fr', overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateRows: 'auto 1fr auto', overflow: 'hidden', background: t.bg }}>
        <div style={{ padding: '10px 18px', borderBottom: `1px solid ${t.hair}`,
          display: 'flex', alignItems: 'center', gap: 8, background: t.panel }}>
          <span style={{ width: 7, height: 7, borderRadius: 4, background: t.green }} />
          <span style={{ font: '600 11px "JetBrains Mono", monospace', color: t.ink }}>
            chat::{chat.biz.botName.toLowerCase()}
          </span>
          <span style={{ font: '500 10.5px "JetBrains Mono", monospace', color: t.inkSoft }}>
            · online · {chat.messages.length} msg
          </span>
          <span style={{ flex: 1 }} />
          <button onClick={chat.reset} style={{
            border: `1px solid ${t.hair}`, background: 'transparent', color: t.inkSoft,
            padding: '3px 8px', borderRadius: 4, cursor: 'pointer',
            font: '500 10.5px "JetBrains Mono", monospace',
          }}>reset</button>
        </div>
        <div ref={scrollRef} style={{ overflowY: 'auto', padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 540, margin: '0 auto' }}>
            {chat.messages.map((m) => <SchemBubble key={m.id} m={m} t={t} onChip={(label) => chat.send(label)} />)}
            {chat.isTyping && <SchemTyping t={t} />}
            {chat.messages.length <= 1 && (
              <div style={{ display: 'grid', gap: 6, marginTop: 8 }}>
                <div style={{ font: '500 10px "JetBrains Mono", monospace', color: t.inkSoft, letterSpacing: 1, textTransform: 'uppercase' }}>scenarios</div>
                {chat.suggestions.map((s) => (
                  <button key={s.key} onClick={() => chat.runScenario(s.key)}
                    style={{
                      border: `1px solid ${t.hair}`, background: t.panel, color: t.ink,
                      padding: '9px 12px', borderRadius: 6, cursor: 'pointer',
                      fontSize: 12.5, textAlign: 'left', fontFamily: 'inherit',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                    <span style={{ font: '500 10px "JetBrains Mono", monospace', color: t.accent }}>›</span>
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
        <form onSubmit={submit} style={{ padding: '12px 20px 16px', borderTop: `1px solid ${t.hair}`, background: t.panel }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'stretch',
            border: `1px solid ${t.hair}`, borderRadius: 6, padding: 4, background: t.bg, maxWidth: 540, margin: '0 auto' }}>
            <span style={{ font: '500 11px "JetBrains Mono", monospace', color: t.accent, padding: '7px 6px 7px 10px' }}>{'>'}</span>
            <input value={text} onChange={(e) => setText(e.target.value)} placeholder="type a message…"
              style={{ flex: 1, border: 0, outline: 0, background: 'transparent',
                font: '500 13px "Geist", sans-serif', color: t.ink, padding: '6px 0' }} />
            <button type="submit" style={{
              border: 0, background: t.ink, color: t.bg, padding: '6px 14px', borderRadius: 4,
              fontFamily: 'inherit', font: '600 12px "JetBrains Mono", monospace', cursor: 'pointer',
            }}>send ⏎</button>
          </div>
        </form>
      </div>
      {view === 'dev' && (
        <div ref={traceRef} style={{ background: t.ink, color: t.bg, overflow: 'auto', padding: '12px 18px',
          borderTop: `1px solid ${t.hair}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ font: '500 10px "JetBrains Mono", monospace', letterSpacing: 1.2, color: t.accent2, textTransform: 'uppercase' }}>
              trace
            </span>
            <span style={{ font: '500 10px "JetBrains Mono", monospace', color: 'rgba(244,241,234,0.5)' }}>
              {chat.traces.length} events
            </span>
            <span style={{ flex: 1 }} />
          </div>
          {chat.traces.length === 0 && (
            <div style={{ font: '500 11.5px "JetBrains Mono", monospace', color: 'rgba(244,241,234,0.5)', fontStyle: 'italic' }}>
              waiting for input · run a scenario to populate trace
            </div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {chat.traces.map((tr) => <SchemTrace key={tr.id} tr={tr} t={t} />)}
          </div>
        </div>
      )}
    </div>
  );
}

function SchemBubble({ m, t, onChip }) {
  if (m.role === 'user') {
    return (
      <div style={{ alignSelf: 'flex-end', maxWidth: '78%' }}>
        <div style={{ font: '500 9.5px "JetBrains Mono", monospace', color: t.inkSoft, marginBottom: 3, textAlign: 'right' }}>user</div>
        <div style={{ background: t.bubbleUser, color: t.bubbleUserInk, padding: '10px 13px', borderRadius: 6, fontSize: 13.5, lineHeight: 1.45 }}>
          {m.text}
        </div>
      </div>
    );
  }
  if (m.card) return <SchemCard card={m.card} t={t} />;
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%' }}>
      <div style={{ font: '500 9.5px "JetBrains Mono", monospace', color: t.inkSoft, marginBottom: 3 }}>assistant</div>
      <div style={{ background: t.panel, color: t.ink, padding: '11px 14px', borderRadius: 6, border: `1px solid ${t.hair}`, fontSize: 13.5, lineHeight: 1.55 }}>
        {renderText(m.text)}
      </div>
      {m.chips && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {m.chips.map((c) => (
            <button key={c} onClick={() => onChip(c)} style={{
              border: `1px solid ${t.accent}`, background: t.panel, color: t.accent,
              padding: '4px 9px', borderRadius: 4, cursor: 'pointer',
              font: '500 11px "JetBrains Mono", monospace',
            }}>{c}</button>
          ))}
        </div>
      )}
    </div>
  );
}

function SchemTyping({ t }) {
  return (
    <div style={{ alignSelf: 'flex-start', background: t.panel, border: `1px solid ${t.hair}`,
      padding: '10px 14px', borderRadius: 6, display: 'flex', gap: 4, alignItems: 'center' }}>
      {[0,1,2].map((i) => (
        <span key={i} style={{ width: 5, height: 5, borderRadius: 3, background: t.accent,
          animation: `schem-dot 0.9s ${i * 0.12}s infinite` }} />
      ))}
      <style>{`@keyframes schem-dot { 0%,80%,100% { opacity: 0.2 } 40% { opacity: 1 }}`}</style>
    </div>
  );
}

function SchemCard({ card, t }) {
  const accent = card.kind === 'booking' ? t.green
    : card.kind === 'estimate' ? t.accent
    : card.kind === 'handoff' ? t.accent2
    : t.inkSoft;
  const titleMap = {
    booking: ['booking.confirmed', card.confirmation],
    estimate: ['estimate.computed', null],
    handoff: ['handoff.created', card.ticket],
    lead: ['lead.saved', null],
  };
  const [title, id] = titleMap[card.kind] || ['card', null];
  return (
    <div style={{ alignSelf: 'flex-start', maxWidth: '88%', background: t.panel,
      border: `1px solid ${t.hair}`, borderLeft: `3px solid ${accent}`, borderRadius: 4, padding: 12 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span style={{ font: '600 10px "JetBrains Mono", monospace', color: accent, letterSpacing: 0.6, textTransform: 'uppercase' }}>{title}</span>
        {id && <span style={{ font: '500 10px "JetBrains Mono", monospace', color: t.inkSoft }}>{id}</span>}
      </div>
      {card.kind === 'booking' && (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{card.service}</div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 1, font: '500 12px "JetBrains Mono", monospace' }}>{card.slot}</div>
        </>
      )}
      {card.kind === 'estimate' && (
        <>
          <div style={{ fontSize: 13, color: t.inkSoft, marginTop: 4 }}>{card.item}</div>
          <div style={{ font: '600 22px "JetBrains Mono", monospace', color: t.accent, marginTop: 4 }}>
            ${card.low}–${card.high}
          </div>
        </>
      )}
      {card.kind === 'handoff' && (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>routed to human</div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 2 }}>reply {card.eta}</div>
        </>
      )}
      {card.kind === 'lead' && (
        <>
          <div style={{ fontSize: 13.5, fontWeight: 600, marginTop: 4 }}>{card.name}</div>
          <div style={{ fontSize: 12, color: t.inkSoft, marginTop: 1 }}>callback · {card.when}</div>
        </>
      )}
    </div>
  );
}

function SchemTrace({ tr, t }) {
  const color = tr.kind === 'guard' ? (tr.verdict === 'block' ? '#FF6B6B' : t.accent2)
    : tr.kind === 'agent' ? (tr.decision === 'escalate' ? '#FFB347' : tr.decision === 'block' ? '#FF6B6B' : '#7FB6FF')
    : tr.kind === 'rag' ? '#85D6A8' : '#F4B860';

  const head = tr.kind === 'guard' ? `[guard:${tr.stage}]` : tr.kind === 'agent' ? '[agent]' : tr.kind === 'rag' ? '[rag]' : `[tool:${tr.name}]`;

  return (
    <div style={{ font: '500 11px "JetBrains Mono", monospace', color: '#E8E2D2', lineHeight: 1.6 }}>
      <span style={{ color: 'rgba(232,226,210,0.4)' }}>{new Date(tr.ts).toLocaleTimeString().slice(0, 8)}</span>
      <span style={{ color, marginLeft: 8 }}>{head}</span>
      {tr.kind === 'guard' && (
        <>
          <span style={{ marginLeft: 8 }}>{tr.rule}</span>
          <span style={{ marginLeft: 8, color: tr.verdict === 'block' ? '#FF6B6B' : '#85D6A8' }}>{tr.verdict}</span>
          <div style={{ marginLeft: 24, opacity: 0.65 }}>{tr.note}</div>
        </>
      )}
      {tr.kind === 'agent' && (
        <>
          <span style={{ marginLeft: 8 }}>decision=<span style={{ color: '#FFD27F' }}>{tr.decision}</span></span>
          <span style={{ marginLeft: 8 }}>conf=<span style={{ color: '#FFD27F' }}>{tr.confidence.toFixed(2)}</span></span>
          <div style={{ marginLeft: 24, opacity: 0.65 }}>{tr.reasoning}</div>
        </>
      )}
      {tr.kind === 'rag' && (
        <>
          <span style={{ marginLeft: 8 }}>q="<span style={{ color: '#FFD27F' }}>{tr.query}</span>"</span>
          {tr.hits.map((h, i) => (
            <div key={i} style={{ marginLeft: 24, opacity: 0.8 }}>
              <span style={{ color: '#85D6A8' }}>{h.score.toFixed(2)}</span>
              <span style={{ marginLeft: 8, color: '#FFD27F' }}>{h.doc}</span>
              <span style={{ marginLeft: 8, opacity: 0.6 }}>{h.snippet.slice(0, 80)}{h.snippet.length > 80 ? '…' : ''}</span>
            </div>
          ))}
        </>
      )}
      {tr.kind === 'tool' && (
        <>
          <span style={{ marginLeft: 8, color: '#FFD27F' }}>
            ({Object.entries(tr.args).map(([k, v]) => `${k}=${typeof v === 'string' ? `"${v}"` : JSON.stringify(v)}`).join(', ')})
          </span>
          <div style={{ marginLeft: 24, opacity: 0.7 }}>
            → {Object.entries(tr.result).map(([k, v]) => `${k}: ${typeof v === 'string' ? v : JSON.stringify(v)}`).join('  ')}
          </div>
        </>
      )}
    </div>
  );
}

Object.assign(window, { SchemDirection });
