import { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import type { Tokens, ComponentDef, BlockInstance, ParamDef } from '../types';
import { renderBlock } from '../render';

// ─── Design tokens ────────────────────────────────────────────────────────────

const FONT       = "'Suisse Intl', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";
const BG         = '#F2F4F5';
const TEXT       = '#000000';
const TEXT2      = 'rgba(0,0,0,0.56)';
const TEXT3      = 'rgba(0,0,0,0.35)';
const ACCENT     = '#5433EB';
const BORDER     = 'rgba(0,0,0,0.1)';
const EMAIL_W    = 600;
const MOBILE_W   = 375;
const PANEL_GAP  = 16;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function defaultParams(comp: ComponentDef): Record<string, unknown> {
  const p: Record<string, unknown> = {};
  for (const param of comp.params) {
    if (param.default !== undefined) p[param.key] = param.default;
  }
  return p;
}

function makeInstance(compId: string, params: Record<string, unknown>): BlockInstance {
  return { instance_id: 'preview', component_id: compId, params };
}

function makeDoc(html: string, dark = false): string {
  const colorScheme = dark
    ? '<meta name="color-scheme" content="dark"><style>:root{color-scheme:dark}</style>'
    : '<meta name="color-scheme" content="light"><style>:root{color-scheme:light}</style>';
  return `<!doctype html><html><head><meta charset="utf-8">${colorScheme}<style>html,body{margin:0;padding:0;}</style></head><body>${html}</body></html>`;
}

type GridItem = {
  key: string;
  comp: ComponentDef;
  name: string;
  description?: string;
  presetOverrides?: Record<string, unknown>;
};

function buildGridItems(components: ComponentDef[]): GridItem[] {
  const items: GridItem[] = [];
  for (const comp of components) {
    if (comp.presets && comp.presets.length > 0) {
      for (const preset of comp.presets) {
        items.push({
          key: `${comp.id}--${preset.id}`,
          comp,
          name: preset.name,
          description: preset.description ?? comp.description,
          presetOverrides: preset.param_overrides,
        });
      }
    } else {
      items.push({ key: comp.id, comp, name: comp.name, description: comp.description });
    }
  }
  return items;
}

// ─── Icons ────────────────────────────────────────────────────────────────────

function ChevronRight({ size = 12, color = TEXT }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <polyline points="4,2 8,6 4,10" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    </svg>
  );
}

function ShopIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="11" fill={ACCENT} />
      <path d="M7 8.5C7 7.12 8.12 6 9.5 6S12 7.12 12 8.5v1H7V8.5Z" fill="white" opacity="0.9" />
      <rect x="6" y="9.5" width="10" height="7" rx="1.5" fill="white" />
    </svg>
  );
}

// ─── Sidebar nav item ─────────────────────────────────────────────────────────

function NavItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        padding: '8px 8px',
        borderRadius: 8, border: 'none',
        background: active ? ACCENT : hovered ? 'rgba(0,0,0,0.05)' : 'transparent',
        cursor: 'pointer', transition: 'background .1s',
        textAlign: 'left',
      }}
    >
      <ChevronRight size={12} color={active ? 'white' : 'rgba(0,0,0,0.35)'} />
      <span style={{
        fontFamily: FONT, fontSize: 14, fontWeight: 400, letterSpacing: '-0.2px',
        color: active ? 'white' : TEXT,
        lineHeight: '20px',
      }}>
        {label}
      </span>
    </button>
  );
}

// ─── ResetButton ─────────────────────────────────────────────────────────────

function ResetButton({ onReset }: { onReset: () => Promise<void> }) {
  const [state, setState] = useState<'idle' | 'confirm' | 'running'>('idle');
  const run = async () => {
    setState('running');
    try { await onReset(); } finally { setState('idle'); }
  };
  if (state === 'confirm') {
    return (
      <div style={{ padding: '6px 8px 6px 24px', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <span style={{ fontFamily: FONT, fontSize: 11, color: '#B91C1C', lineHeight: 1.4 }}>
          Wipes all components and re-seeds from the canonical seed. Can't undo.
        </span>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={run} style={{ flex: 1, padding: '5px 0', background: '#B91C1C', border: 'none', borderRadius: 6, color: '#fff', fontFamily: FONT, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}>
            Confirm reset
          </button>
          <button onClick={() => setState('idle')} style={{ flex: 1, padding: '5px 0', background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, color: TEXT2, fontFamily: FONT, fontSize: 11, cursor: 'pointer' }}>
            Cancel
          </button>
        </div>
      </div>
    );
  }
  return (
    <button
      onClick={() => setState(state === 'running' ? 'running' : 'confirm')}
      disabled={state === 'running'}
      style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        padding: '8px 8px', borderRadius: 8, border: 'none',
        background: 'transparent', cursor: state === 'running' ? 'wait' : 'pointer',
        textAlign: 'left',
      }}
    >
      <ChevronRight size={12} color="rgba(185,28,28,0.5)" />
      <span style={{ fontFamily: FONT, fontSize: 14, fontWeight: 400, letterSpacing: '-0.2px', color: '#B91C1C', lineHeight: '20px' }}>
        {state === 'running' ? 'Resetting…' : 'Reset to defaults'}
      </span>
    </button>
  );
}

// ─── ParamField ───────────────────────────────────────────────────────────────

function ParamField({ param, value, tokens, onChange }: {
  param: ParamDef;
  value: unknown;
  tokens: Tokens;
  onChange: (v: unknown) => void;
}) {
  const base: React.CSSProperties = {
    width: '100%', background: '#fff',
    border: `1px solid ${BORDER}`, borderRadius: 6,
    color: TEXT, fontFamily: FONT, fontSize: 13,
    padding: '7px 10px', outline: 'none', boxSizing: 'border-box',
  };

  if (param.kind === 'boolean') {
    const on = value === true || value === 'true';
    return (
      <button role="switch" aria-checked={on} onClick={() => onChange(!on)}
        style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
        <span style={{ width: 38, height: 21, borderRadius: 999, background: on ? ACCENT : '#D1D1D6', position: 'relative', flexShrink: 0, transition: 'background .15s', display: 'inline-block' }}>
          <span style={{ position: 'absolute', top: 2.5, left: on ? 19 : 2.5, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: 'left .15s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
        </span>
        <span style={{ color: TEXT, fontSize: 13 }}>{on ? 'On' : 'Off'}</span>
      </button>
    );
  }
  if (param.kind === 'textarea') {
    return <textarea value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} rows={3} style={{ ...base, resize: 'vertical', lineHeight: 1.5 }} />;
  }
  if (param.kind === 'color_token') {
    const cur = String(value ?? '');
    return (
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <span style={{ width: 22, height: 22, borderRadius: 5, flexShrink: 0, background: tokens.colors[cur] ?? cur ?? '#ccc', border: `1px solid ${BORDER}` }} />
        <select value={cur} onChange={(e) => onChange(e.target.value)} style={{ ...base, flex: 1 }}>
          {Object.entries(tokens.colors).map(([k, hex]) => <option key={k} value={k}>{k} — {hex}</option>)}
        </select>
      </div>
    );
  }
  if (param.kind === 'typography_token') {
    const opts = param.options ?? Object.keys(tokens.typography.sizes).map((k) => ({ value: k, label: k }));
    return <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={base}>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  }
  if (param.kind === 'spacing_token') {
    const opts = param.options ?? Object.keys(tokens.spacing).map((k) => ({ value: k, label: k }));
    return <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={base}>{opts.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  }
  if (param.kind === 'weight_token') {
    return (
      <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={base}>
        {(['regular', 'medium', 'bold'] as const).map((w) => <option key={w} value={w}>{w} ({tokens.typography.weights[w]})</option>)}
      </select>
    );
  }
  if (param.kind === 'select') {
    return <select value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={base}>{(param.options ?? []).map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}</select>;
  }
  return <input type="text" value={String(value ?? '')} onChange={(e) => onChange(e.target.value)} style={base} />;
}

// ─── ComponentSection ─────────────────────────────────────────────────────────

function ComponentSection({ item, tokens, components, isExpanded, onToggleExpand, onCopy }: {
  item: GridItem;
  tokens: Tokens;
  components: ComponentDef[];
  isExpanded: boolean;
  onToggleExpand: () => void;
  onCopy: (name: string) => void;
}) {
  const [params, setParams] = useState<Record<string, unknown>>(() => ({
    ...defaultParams(item.comp),
    ...(item.presetOverrides ?? {}),
  }));
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const [iframeNaturalH, setIframeNaturalH] = useState(item.comp.preview_height_px ?? 300);
  const [mobileIframeNaturalH, setMobileIframeNaturalH] = useState(item.comp.preview_height_px ?? 300);

  const sectionRef     = useRef<HTMLElement>(null);
  const iframeRef      = useRef<HTMLIFrameElement>(null);
  const mobileIframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setParams({ ...defaultParams(item.comp), ...(item.presetOverrides ?? {}) });
    setIframeNaturalH(item.comp.preview_height_px ?? 300);
    setMobileIframeNaturalH(item.comp.preview_height_px ?? 300);
  }, [item.key]);

  // Preview always reflects the dark/light toggle.
  // Export (Copy HTML) uses the user's explicit param values.
  const previewParams = useMemo(() => ({
    ...params,
    color_variant: isDark ? 'dark' : 'light',
    _mode: isDark ? 'dark' : 'light',
  }), [params, isDark]);

  const previewHtml = useMemo(() => {
    try { return renderBlock(makeInstance(item.comp.id, previewParams), components, tokens); }
    catch { return '<p style="padding:16px;color:#888;font-size:13px;">Preview error</p>'; }
  }, [item.comp.id, previewParams, components, tokens]);

  const mobilePreviewHtml = useMemo(() => {
    try { return renderBlock(makeInstance(item.comp.id, previewParams), components, tokens, 'mobile'); }
    catch { return '<p style="padding:16px;color:#888;font-size:13px;">Preview error</p>'; }
  }, [item.comp.id, previewParams, components, tokens]);

  const exportHtml = useMemo(() => {
    try { return renderBlock(makeInstance(item.comp.id, params), components, tokens); }
    catch { return '<p style="padding:16px;color:#888;font-size:13px;">Preview error</p>'; }
  }, [item.comp.id, params, components, tokens]);

  const doc       = useMemo(() => makeDoc(previewHtml, isDark), [previewHtml, isDark]);
  const mobileDoc = useMemo(() => makeDoc(mobilePreviewHtml, isDark), [mobilePreviewHtml, isDark]);

  const visibleParams = item.comp.params.filter((p) => !p.key.startsWith('_'));

  const handleIframeLoad = useCallback(() => {
    try {
      const body = iframeRef.current?.contentDocument?.body;
      if (body && body.scrollHeight > 0) setIframeNaturalH(body.scrollHeight);
    } catch {}
  }, []);

  const handleMobileIframeLoad = useCallback(() => {
    try {
      const body = mobileIframeRef.current?.contentDocument?.body;
      if (body && body.scrollHeight > 0) setMobileIframeNaturalH(body.scrollHeight);
    } catch {}
  }, []);

  const copy = async () => {
    try { await navigator.clipboard.writeText(exportHtml); setCopied(true); setTimeout(() => setCopied(false), 2000); onCopy(item.name); }
    catch {}
  };

  const chromeBg     = isDark ? '#2A2A2A' : '#F2F4F5';
  const chromeBorder = isDark ? 'rgba(255,255,255,0.08)' : BORDER;
  const panelBorder  = isDark ? 'rgba(255,255,255,0.08)' : BORDER;
  const panelBg      = isDark ? '#1A1A1A' : '#F9F9FB';

  return (
    <section ref={sectionRef} id={`section-${item.key}`}>
      <div style={{
        background: '#fff',
        borderRadius: 16,
        border: `1px solid ${BORDER}`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        padding: 12,
        width: EMAIL_W + MOBILE_W + PANEL_GAP + 24,
      }}>
        {/* Card header */}
        <div style={{ marginBottom: 12, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <h2 style={{ fontFamily: FONT, fontSize: 15, fontWeight: 600, letterSpacing: '-0.2px', color: TEXT, margin: 0 }}>
              {item.name}
            </h2>
            {item.description && (
              <p style={{ fontFamily: FONT, fontSize: 12, color: TEXT2, margin: '2px 0 0', lineHeight: 1.5 }}>
                {item.description}
              </p>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2, flexShrink: 0 }}>
            <span style={{
              background: BG, color: TEXT3,
              fontFamily: FONT, fontSize: 10, fontWeight: 600, letterSpacing: '0.04em',
              padding: '2px 8px', borderRadius: 999, whiteSpace: 'nowrap',
              textTransform: 'uppercase',
            }}>
              {item.comp.category}
            </span>
            <button
              onClick={copy}
              title={copied ? 'Copied!' : 'Copy HTML'}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 26, height: 26, borderRadius: 6, border: `1px solid ${copied ? '#BBF7D0' : BORDER}`,
                background: copied ? '#F0FDF4' : '#fff', cursor: 'pointer',
                color: copied ? '#16A34A' : TEXT2, transition: 'all .15s', flexShrink: 0,
              }}
            >
              {copied ? (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <polyline points="2,7 5.5,10.5 12,4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                  <rect x="5" y="1" width="8" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
                  <path d="M3 4H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h7a1 1 0 0 0 1-1v-1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Desktop + Mobile panels side by side */}
        <div style={{ display: 'flex', gap: PANEL_GAP, alignItems: 'flex-start' }}>

          {/* ── Desktop panel ── */}
          <div style={{
            width: EMAIL_W,
            border: `1px solid ${panelBorder}`,
            borderRadius: 10,
            overflow: 'hidden',
            background: panelBg,
            transition: 'background .2s',
            flexShrink: 0,
          }}>
            <div style={{ background: chromeBg, borderBottom: `1px solid ${chromeBorder}`, padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 5 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F57' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#28C840' }} />
              </div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.35)' : TEXT3, fontFamily: FONT, fontSize: 10 }}>600px · Desktop</span>
              {/* Light / dark mode toggle */}
              <button
                onClick={() => setIsDark((d) => !d)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  background: isDark ? 'rgba(255,255,255,0.1)' : BG,
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : BORDER}`,
                  borderRadius: 999, padding: '2px 8px 2px 6px',
                  cursor: 'pointer', fontFamily: FONT, fontSize: 10, fontWeight: 500,
                  color: isDark ? 'rgba(255,255,255,0.7)' : TEXT2,
                  transition: 'all .15s',
                }}
              >
                {isDark ? (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <circle cx="5" cy="5" r="2" fill="currentColor" />
                    <line x1="5" y1="0.5" x2="5" y2="1.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="5" y1="8.2" x2="5" y2="9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="0.5" y1="5" x2="1.8" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="8.2" y1="5" x2="9.5" y2="5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="1.9" y1="1.9" x2="2.8" y2="2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="7.2" y1="7.2" x2="8.1" y2="8.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="8.1" y1="1.9" x2="7.2" y2="2.8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    <line x1="2.8" y1="7.2" x2="1.9" y2="8.1" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                  </svg>
                ) : (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M9 5.5A4 4 0 0 1 4.5 1a4 4 0 1 0 4.5 4.5z" fill="currentColor" />
                  </svg>
                )}
                {isDark ? 'Light' : 'Dark'}
              </button>
            </div>
            <iframe
              ref={iframeRef}
              srcDoc={doc}
              onLoad={handleIframeLoad}
              scrolling="no"
              style={{ border: 'none', width: EMAIL_W, height: iframeNaturalH, display: 'block', pointerEvents: 'none' }}
            />
          </div>

          {/* ── Mobile panel ── */}
          <div style={{
            width: MOBILE_W,
            border: `1px solid ${panelBorder}`,
            borderRadius: 10,
            overflow: 'hidden',
            background: panelBg,
            transition: 'background .2s',
            flexShrink: 0,
          }}>
            <div style={{ background: chromeBg, borderBottom: `1px solid ${chromeBorder}`, padding: '7px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)' }} />
              </div>
              <span style={{ color: isDark ? 'rgba(255,255,255,0.35)' : TEXT3, fontFamily: FONT, fontSize: 10 }}>375px · Mobile</span>
              <span style={{ width: 48 }} />
            </div>
            <iframe
              ref={mobileIframeRef}
              srcDoc={mobileDoc}
              onLoad={handleMobileIframeLoad}
              scrolling="no"
              style={{ border: 'none', width: MOBILE_W, height: mobileIframeNaturalH, display: 'block', pointerEvents: 'none' }}
            />
          </div>

        </div>

        {/* Customize toggle */}
        <div style={{ borderTop: `1px solid ${BORDER}`, margin: '12px -12px 0', padding: '0 12px' }}>
          <button
            onClick={onToggleExpand}
            style={{
              width: '100%', background: 'none', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 0', fontFamily: FONT, fontSize: 12, fontWeight: 500,
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6" stroke={isExpanded ? ACCENT : TEXT3} strokeWidth="1.4" />
                <line x1="7" y1="4" x2="7" y2="10" stroke={isExpanded ? ACCENT : TEXT3} strokeWidth="1.4" strokeLinecap="round" />
                {!isExpanded && <line x1="4" y1="7" x2="10" y2="7" stroke={TEXT3} strokeWidth="1.4" strokeLinecap="round" />}
              </svg>
              <span style={{ color: isExpanded ? ACCENT : TEXT2 }}>
                {isExpanded ? 'Close editor' : `Customize${visibleParams.length > 0 ? ` · ${visibleParams.length} param${visibleParams.length !== 1 ? 's' : ''}` : ''}`}
              </span>
            </span>
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none"
              style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', flexShrink: 0 }}>
              <polyline points="2,4 6,8 10,4" stroke={TEXT3} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
          </button>
        </div>

        {/* Inline editor */}
        {isExpanded && (
          <div style={{ borderTop: `1px solid ${BORDER}`, background: '#FAFAFA', margin: '0 -12px -12px', padding: '16px 12px 12px', borderRadius: '0 0 16px 16px' }}>
            {visibleParams.length === 0 ? (
              <p style={{ color: TEXT2, fontFamily: FONT, fontSize: 13, margin: 0 }}>No editable parameters.</p>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 10, columnGap: 16, alignItems: 'start', marginBottom: 16 }}>
                {visibleParams.map((p) => (
                  <>
                    <div key={`${p.key}-label`} style={{ color: TEXT2, fontFamily: FONT, fontSize: 11, fontWeight: 500, paddingTop: 8, lineHeight: 1.4 }}>
                      {p.label}
                      {p.help && <div style={{ color: TEXT3, fontSize: 10, fontWeight: 400, marginTop: 2 }}>{p.help}</div>}
                    </div>
                    <div key={`${p.key}-field`}>
                      <ParamField param={p} value={params[p.key]} tokens={tokens}
                        onChange={(v) => setParams((c) => ({ ...c, [p.key]: v }))} />
                    </div>
                  </>
                ))}
              </div>
            )}
            <p style={{ color: TEXT3, fontFamily: FONT, fontSize: 11, margin: '14px 0 0', paddingTop: 14, borderTop: `1px solid ${BORDER}` }}>
              Use the copy button above to grab the HTML for Mozart or Liquid templates.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── SystemPage ───────────────────────────────────────────────────────────────

export function SystemPage({ tokens, components, isAdmin, onNavigate, onReset }: {
  tokens: Tokens;
  components: ComponentDef[];
  identity?: { email: string; name?: string } | null;
  isAdmin: boolean;
  onNavigate: (route: 'emails' | 'tokens' | 'catalog') => void;
  onReset?: () => Promise<void>;
}) {
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = useCallback((name: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(name);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  }, []);

  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef   = useRef<HTMLDivElement>(null);

  const allItems = useMemo(() => buildGridItems(components), [components]);

  const categories = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of allItems) map.set(item.comp.category, (map.get(item.comp.category) ?? 0) + 1);
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [allItems]);

  const filtered = useMemo(() => {
    let list = allItems;
    if (categoryFilter) list = list.filter((i) => i.comp.category === categoryFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.comp.category.toLowerCase().includes(q) ||
        (i.description ?? '').toLowerCase().includes(q)
      );
    }
    return list;
  }, [allItems, query, categoryFilter]);

  const grouped = useMemo(() => {
    const map = new Map<string, GridItem[]>();
    for (const item of filtered) {
      const g = map.get(item.comp.category) ?? [];
      g.push(item);
      map.set(item.comp.category, g);
    }
    return [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [filtered]);

  const scrollToId = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      window.scrollTo({ top: window.scrollY + el.getBoundingClientRect().top - 24, behavior: 'smooth' });
    }
  }, []);

  const toggleExpand = useCallback((key: string) => {
    setExpandedKey((cur) => (cur === key ? null : key));
    setTimeout(() => scrollToId(`section-${key}`), 10);
  }, [scrollToId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setExpandedKey(null); setQuery(''); setCategoryFilter(null); }
      if (e.key === '/' && document.activeElement !== searchRef.current) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Track which category + individual section is in view for sidebar highlight
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (visible.length === 0) return;
        visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        const id = visible[0].target.id;
        if (id.startsWith('section-')) {
          const key = id.replace(/^section-/, '');
          setActiveSection(key);
          const item = allItems.find((i) => i.key === key);
          if (item) setActiveCategory(item.comp.category);
        } else if (id.startsWith('cat-')) {
          setActiveCategory(id.replace(/^cat-/, '').replace(/-/g, ' '));
          setActiveSection(null);
        }
      },
      { rootMargin: '-5% 0px -80% 0px', threshold: 0 },
    );
    document.querySelectorAll('[id^="cat-"],[id^="section-"]').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [allItems, grouped]);

  return (
    <>
    <div style={{ display: 'flex', minHeight: '100vh', background: BG, fontFamily: FONT }}>

      {/* ── Sidebar ────────────────────────────────────────────── */}
      <nav style={{
        width: 250, flexShrink: 0,
        position: 'sticky', top: 0, height: '100vh',
        display: 'flex', flexDirection: 'column',
        padding: '20px 12px',
        gap: 0,
        overflowY: 'auto', overflowX: 'hidden',
      }}>
        <div style={{ padding: '0 8px 0', marginBottom: 0, display: 'flex', alignItems: 'center', height: 32 }}>
          <ShopIcon />
        </div>

        <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 20, paddingTop: 20 }}>
          <div style={{ padding: '8px 8px 4px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: TEXT3, textTransform: 'uppercase', paddingLeft: 8 }}>
              Pages
            </span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: -12 }}>
              <NavItem label="Components" active={true} onClick={() => { setQuery(''); setCategoryFilter(null); setExpandedKey(null); window.scrollTo({ top: 0 }); }} />
              {/* Inset category sub-nav with nested item links */}
              {categories.map(([cat]) => {
                const isCatActive = activeCategory === cat;
                const catItems = allItems.filter((i) => i.comp.category === cat);
                return (
                  <div key={cat}>
                    <button
                      onClick={() => scrollToId(`cat-${cat.replace(/\s+/g, '-')}`)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        width: '100%', padding: '5px 8px 5px 24px',
                        borderRadius: 6, border: 'none',
                        background: isCatActive && !activeSection ? `rgba(84,51,235,0.08)` : 'transparent',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'background .1s',
                      }}
                    >
                      <span style={{
                        width: 4, height: 4, borderRadius: '50%', flexShrink: 0,
                        background: isCatActive ? ACCENT : TEXT3,
                        transition: 'background .1s',
                      }} />
                      <span style={{
                        fontFamily: FONT, fontSize: 13, fontWeight: isCatActive ? 500 : 400,
                        letterSpacing: '-0.1px', lineHeight: '18px',
                        color: isCatActive ? ACCENT : TEXT2,
                        transition: 'color .1s',
                      }}>
                        {cat}
                      </span>
                    </button>
                    {/* Nested component/preset items */}
                    {catItems.map((item) => {
                      const isItemActive = activeSection === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => scrollToId(`section-${item.key}`)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            width: '100%', padding: '4px 8px 4px 40px',
                            borderRadius: 6, border: 'none',
                            background: isItemActive ? `rgba(84,51,235,0.08)` : 'transparent',
                            cursor: 'pointer', textAlign: 'left',
                            transition: 'background .1s',
                          }}
                        >
                          <span style={{
                            fontFamily: FONT, fontSize: 12, fontWeight: isItemActive ? 500 : 400,
                            letterSpacing: '-0.1px', lineHeight: '16px',
                            color: isItemActive ? ACCENT : TEXT3,
                            transition: 'color .1s',
                          }}>
                            {item.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {isAdmin && (
          <div style={{ borderTop: `1px solid ${BORDER}`, marginTop: 20, paddingTop: 20 }}>
            <div style={{ padding: '8px 8px 4px', display: 'flex', flexDirection: 'column', gap: 20 }}>
              <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: TEXT3, textTransform: 'uppercase', paddingLeft: 8 }}>
                Admin
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2, marginTop: -12 }}>
                <NavItem label="Email Composer" active={false} onClick={() => onNavigate('emails')} />
                <NavItem label="Tokens" active={false} onClick={() => onNavigate('tokens')} />
                <NavItem label="Catalog" active={false} onClick={() => onNavigate('catalog')} />
                {onReset && <ResetButton onReset={onReset} />}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* ── Main white card ─────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0, padding: '10px 10px 10px 0' }}>
        <div
          ref={mainRef}
          style={{
            background: '#ffffff',
            borderRadius: 28,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          }}
        >
          {/* ── Hero section ── */}
          <div style={{ padding: '48px 48px 40px' }}>
            <p style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', color: TEXT3, textTransform: 'uppercase', margin: '0 0 12px' }}>
              Shop · System
            </p>
            <h1 style={{ fontFamily: FONT, fontSize: 56, fontWeight: 700, letterSpacing: '-1px', lineHeight: 1.05, color: TEXT, margin: '0 0 8px' }}>
              Shop email<br />design system
            </h1>
            <p style={{ fontFamily: FONT, fontSize: 18, fontWeight: 600, color: TEXT2, letterSpacing: '-0.5px', lineHeight: '20px', margin: '0 0 32px' }}>
              Reusable styles, components, and templates
            </p>

            {/* ── Chip bar: search + category filters ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
              {/* Search pill */}
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <svg style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke={TEXT3} strokeWidth="1.4" />
                  <line x1="11" y1="11" x2="14" y2="14" stroke={TEXT3} strokeWidth="1.4" strokeLinecap="round" />
                </svg>
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{
                    height: 40, width: 220, boxSizing: 'border-box',
                    background: 'rgba(255,255,255,0.85)',
                    border: '0.5px solid rgba(24,59,78,0.06)',
                    borderRadius: 999,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    color: TEXT, fontFamily: FONT, fontSize: 14, fontWeight: 400,
                    letterSpacing: '-0.2px',
                    padding: '0 36px 0 36px', outline: 'none',
                  }}
                />
                {query && (
                  <button onClick={() => setQuery('')} style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', color: TEXT3,
                    fontSize: 14, lineHeight: 1, padding: 0, display: 'flex', alignItems: 'center',
                  }}>×</button>
                )}
              </div>

              {/* Category chips */}
              {categories.map(([cat]) => {
                const active = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(active ? null : cat)}
                    style={{
                      height: 40, padding: '0 16px',
                      borderRadius: 999,
                      border: active ? '0.5px solid rgba(0,0,0,0.75)' : '0.5px solid rgba(24,59,78,0.06)',
                      background: active ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.85)',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                      color: active ? '#fff' : TEXT,
                      fontFamily: FONT, fontSize: 14, fontWeight: 600,
                      letterSpacing: '-0.2px',
                      cursor: 'pointer', whiteSpace: 'nowrap',
                      transition: 'background 0.15s, color 0.15s, border-color 0.15s',
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Component sections — single column, 600px artboards ── */}
          <div style={{ padding: '0 48px 80px' }}>
            {filtered.length === 0 && (
              <p style={{ color: TEXT2, fontFamily: FONT, fontSize: 14 }}>No results{query ? ` for "${query}"` : ''}.</p>
            )}

            {grouped.map(([cat, items]) => (
              <div key={cat} id={`cat-${cat.replace(/\s+/g, '-')}`} style={{ marginBottom: 56 }}>
                {!categoryFilter && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
                    <div style={{ height: 1, flex: 1, background: BORDER }} />
                    <span style={{ fontFamily: FONT, fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', color: TEXT3, textTransform: 'uppercase' }}>
                      {cat}
                    </span>
                    <div style={{ height: 1, flex: 1, background: BORDER }} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {items.map((item) => (
                    <ComponentSection
                      key={item.key}
                      item={item}
                      tokens={tokens}
                      components={components}
                      isExpanded={expandedKey === item.key}
                      onToggleExpand={() => toggleExpand(item.key)}
                      onCopy={showToast}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>

    {/* ── Copy toast ── */}

    <div style={{
      position: 'fixed', bottom: 28, left: '50%', transform: `translateX(-50%) translateY(${toast ? '0' : '12px'})`,
      opacity: toast ? 1 : 0, pointerEvents: 'none',
      transition: 'opacity .2s, transform .2s',
      zIndex: 9999,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        background: '#1A1A1A', borderRadius: 12,
        padding: '10px 16px 10px 12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.28)',
      }}>
        <div style={{
          width: 22, height: 22, borderRadius: 6, background: '#16A34A',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
            <polyline points="2,7 5.5,10.5 12,4" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <span style={{ fontFamily: FONT, fontSize: 13, fontWeight: 500, color: '#fff', whiteSpace: 'nowrap' }}>
          <span style={{ color: 'rgba(255,255,255,0.5)' }}>{toast}</span>
          {' '}HTML copied — paste into Mozart
        </span>
      </div>
    </div>
    </>
  );
}
