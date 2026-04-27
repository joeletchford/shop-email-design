import { useState, useMemo, useEffect, useRef } from 'react';
import {
  Button, ButtonGroup, TextField, Select, Banner, Modal, BlockStack, InlineStack, Text, Divider, Tooltip, Icon, Tag,
} from '@shopify/polaris';
import {
  PlusIcon, DeleteIcon, ClipboardIcon, ArrowUpIcon, ArrowDownIcon, ViewIcon, UploadIcon, DesktopIcon, MobileIcon,
} from '@shopify/polaris-icons';

import type { ComponentDef, Tokens, BlockInstance, ParamDef } from '../types';
import { renderBlock, renderEmail } from '../render';
import { PREVIEW_STORAGE_KEY, PREVIEW_CHANNEL } from './PreviewPage';
import { uploadImage } from '../quick';

type Props = {
  tokens: Tokens;
  components: ComponentDef[];
  identity: { email: string; name?: string } | null;
  isAdmin?: boolean;
  onNavigate?: (route: 'tokens' | 'catalog') => void;
};

const DRAFT_KEY = 'shop-email-design.draft.v1';
const SURROUND_KEY = 'shop-email-design.surround.v1';

type DraftLocal = { name: string; blocks: BlockInstance[] };
type DeviceMode = 'desktop' | 'mobile' | 'fullscreen';
type SurroundMode = 'light' | 'dark';

function loadSurround(): SurroundMode {
  return localStorage.getItem(SURROUND_KEY) === 'dark' ? 'dark' : 'light';
}
function saveSurround(s: SurroundMode) {
  localStorage.setItem(SURROUND_KEY, s);
}

function loadDraft(): DraftLocal {
  try {
    const s = localStorage.getItem(DRAFT_KEY);
    if (!s) return { name: 'Untitled email', blocks: [] };
    return JSON.parse(s) as DraftLocal;
  } catch { return { name: 'Untitled email', blocks: [] }; }
}
function saveDraft(d: DraftLocal) { localStorage.setItem(DRAFT_KEY, JSON.stringify(d)); }

const COLORS = {
  rail_bg: '#1A1C1F', rail_text: '#E3E3E3', rail_text_muted: '#9DA0A4',
  rail_hover: '#27292D', rail_border: '#2D3036',
  toolbar_bg: '#FFFFFF', toolbar_border: '#E1E3E5',
  canvas_bg: '#F1F2F4', inspector_bg: '#FFFFFF',
};

export function BuildPage({ tokens, components, isAdmin, onNavigate }: Props) {
  const [draft, setDraft] = useState<DraftLocal>(loadDraft);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(draft.blocks.length > 0 ? 0 : null);
  const [device, setDevice] = useState<DeviceMode>('desktop');
  const [surround, setSurround] = useState<SurroundMode>(loadSurround);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => { saveSurround(surround); }, [surround]);

  useEffect(() => { saveDraft(draft); }, [draft]);

  // Broadcast to any open preview tab
  useEffect(() => {
    const payload = { name: draft.name, blocks: draft.blocks, components, tokens };
    try { sessionStorage.setItem(PREVIEW_STORAGE_KEY, JSON.stringify(payload)); } catch {}
    let channel: BroadcastChannel | null = null;
    try { channel = new BroadcastChannel(PREVIEW_CHANNEL); channel.postMessage(payload); } catch {}
    return () => channel?.close();
  }, [draft, components, tokens]);

  useEffect(() => {
    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(PREVIEW_CHANNEL);
      channel.onmessage = (ev) => {
        if (ev.data?.type === 'request_payload') {
          channel?.postMessage({ name: draft.name, blocks: draft.blocks, components, tokens });
        }
      };
    } catch {}
    return () => channel?.close();
  }, [draft, components, tokens]);

  const byCategory = useMemo(() => {
    const map = new Map<string, ComponentDef[]>();
    for (const c of components) {
      if (!map.has(c.category)) map.set(c.category, []);
      map.get(c.category)!.push(c);
    }
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [components]);

  const addBlock = (component: ComponentDef, paramOverrides?: Record<string, unknown>) => {
    const baseParams = Object.fromEntries(component.params.map((p) => [p.key, p.default ?? '']));
    const instance: BlockInstance = {
      instance_id: crypto.randomUUID(),
      component_id: component.id,
      params: { ...baseParams, ...(paramOverrides ?? {}) },
    };
    const newBlocks = [...draft.blocks, instance];
    setDraft({ ...draft, blocks: newBlocks });
    setSelectedIdx(newBlocks.length - 1);
  };
  const updateBlockParam = (idx: number, key: string, value: unknown) => {
    const newBlocks = [...draft.blocks];
    newBlocks[idx] = { ...newBlocks[idx], params: { ...newBlocks[idx].params, [key]: value } };
    setDraft({ ...draft, blocks: newBlocks });
  };
  const removeBlock = (idx: number) => {
    const newBlocks = draft.blocks.filter((_, i) => i !== idx);
    setDraft({ ...draft, blocks: newBlocks });
    setSelectedIdx(newBlocks.length === 0 ? null : Math.min(idx, newBlocks.length - 1));
  };
  const moveBlock = (idx: number, dir: -1 | 1) => {
    const target = idx + dir;
    if (target < 0 || target >= draft.blocks.length) return;
    const newBlocks = [...draft.blocks];
    [newBlocks[idx], newBlocks[target]] = [newBlocks[target], newBlocks[idx]];
    setDraft({ ...draft, blocks: newBlocks });
    setSelectedIdx(target);
  };

  // Move a block from index `from` to be placed AT index `to` in the resulting
  // list (so dragging block 0 to drop-target 3 means "drop me as the 3rd item").
  // Used by the drag-and-drop reorder.
  const moveBlockTo = (from: number, to: number) => {
    if (from === to || from === to - 1) return; // no-op
    const newBlocks = [...draft.blocks];
    const [moved] = newBlocks.splice(from, 1);
    const adjusted = to > from ? to - 1 : to;
    newBlocks.splice(adjusted, 0, moved);
    setDraft({ ...draft, blocks: newBlocks });
    setSelectedIdx(adjusted);
  };

  const selected = selectedIdx != null ? draft.blocks[selectedIdx] : null;
  const selectedComponent = selected ? components.find((c) => c.id === selected.component_id) : null;
  const html = useMemo(() => renderEmail(draft.blocks, components, tokens), [draft.blocks, components, tokens]);

  const copyToClipboard = async (text: string, label: string) => {
    try { await navigator.clipboard.writeText(text); setCopied(label); setTimeout(() => setCopied(null), 2000); } catch {}
  };
  const openPreview = () => window.open(`${window.location.pathname}?view=preview`, 'shop-email-preview');
  const newDraft = () => {
    if (draft.blocks.length === 0 || confirm('Start a new email?')) {
      setDraft({ name: 'Untitled email', blocks: [] });
      setSelectedIdx(null);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      display: 'grid',
      gridTemplateRows: '56px 1fr',
      gridTemplateColumns: '320px 1fr 360px',
      gridTemplateAreas: `'toolbar toolbar toolbar' 'left canvas right'`,
      background: COLORS.canvas_bg, zIndex: 50,
    }}>
      <Toolbar
        emailName={draft.name}
        onEmailNameChange={(v) => setDraft({ ...draft, name: v })}
        device={device} onDeviceChange={setDevice}
        surround={surround} onSurroundChange={setSurround}
        blockCount={draft.blocks.length}
        copied={copied}
        onCopy={() => copyToClipboard(html, 'html')}
        onPreview={openPreview} onNewDraft={newDraft}
        previewDisabled={draft.blocks.length === 0}
        isAdmin={isAdmin} onNavigate={onNavigate}
      />
      <LeftRail byCategory={byCategory} onAdd={addBlock} components={components} tokens={tokens} />
      <Canvas device={device} surround={surround} blocks={draft.blocks} components={components} tokens={tokens}
        selectedIdx={selectedIdx} onSelect={setSelectedIdx} onMove={moveBlock} onMoveTo={moveBlockTo} onRemove={removeBlock} />
      <RightRail
        selectedBlock={selected}
        selectedComponent={selectedComponent}
        tokens={tokens}
        onParamChange={(key, val) => { if (selectedIdx != null) updateBlockParam(selectedIdx, key, val); }}
      />
    </div>
  );
}

function Toolbar({
  emailName, onEmailNameChange, device, onDeviceChange, surround, onSurroundChange, blockCount, copied,
  onCopy, onPreview, onNewDraft, previewDisabled, isAdmin, onNavigate,
}: {
  emailName: string; onEmailNameChange: (v: string) => void;
  device: DeviceMode; onDeviceChange: (d: DeviceMode) => void;
  surround: SurroundMode; onSurroundChange: (s: SurroundMode) => void;
  blockCount: number; copied: string | null;
  onCopy: () => void; onPreview: () => void; onNewDraft: () => void;
  previewDisabled: boolean;
  isAdmin?: boolean; onNavigate?: (route: 'tokens' | 'catalog') => void;
}) {
  return (
    <div style={{
      gridArea: 'toolbar', background: COLORS.toolbar_bg, borderBottom: `1px solid ${COLORS.toolbar_border}`,
      display: 'flex', alignItems: 'center', gap: 16, padding: '0 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
        <div style={{ minWidth: 0, flex: 1, maxWidth: 360 }}>
          <input type="text" value={emailName} onChange={(e) => onEmailNameChange(e.target.value)} placeholder="Untitled email"
            style={{ width: '100%', border: 0, background: 'transparent', fontSize: 14, fontWeight: 600, color: '#202223', padding: '8px 8px', borderRadius: 6, outline: 'none', fontFamily: 'inherit' }}
            onFocus={(e) => (e.target.style.background = '#F6F6F7')}
            onBlur={(e) => (e.target.style.background = 'transparent')} />
        </div>
        <Text as="span" variant="bodySm" tone="subdued">{blockCount} block{blockCount === 1 ? '' : 's'}</Text>
        {isAdmin && onNavigate && (
          <div style={{ marginLeft: 12 }}>
            <ButtonGroup variant="segmented">
              <Button onClick={() => onNavigate('tokens')} variant="tertiary">Tokens</Button>
              <Button onClick={() => onNavigate('catalog')} variant="tertiary">Catalog</Button>
            </ButtonGroup>
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: '0 0 auto', gap: 8 }}>
        <ButtonGroup variant="segmented">
          <Button icon={DesktopIcon} pressed={device === 'desktop'} onClick={() => onDeviceChange('desktop')} accessibilityLabel="Desktop" />
          <Button icon={MobileIcon} pressed={device === 'mobile'} onClick={() => onDeviceChange('mobile')} accessibilityLabel="Mobile" />
          <Button pressed={device === 'fullscreen'} onClick={() => onDeviceChange('fullscreen')}>Fullscreen</Button>
        </ButtonGroup>
        <ButtonGroup variant="segmented">
          <Tooltip content="Light surround"><Button pressed={surround === 'light'} onClick={() => onSurroundChange('light')}>☼</Button></Tooltip>
          <Tooltip content="Dark surround"><Button pressed={surround === 'dark'} onClick={() => onSurroundChange('dark')}>☾</Button></Tooltip>
        </ButtonGroup>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end', flex: 1 }}>
        <Button onClick={onNewDraft} variant="tertiary">New</Button>
        <Button icon={ViewIcon} onClick={onPreview} disabled={previewDisabled}>Open preview</Button>
        <Button icon={ClipboardIcon} variant="primary" onClick={onCopy}>
          {copied === 'html' ? 'Copied ✓' : 'Copy HTML'}
        </Button>
      </div>
    </div>
  );
}

const LEFT_RAIL_COLLAPSED_KEY = 'shop-email-design.left-rail-collapsed.v1';

function loadCollapsedCategories(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(LEFT_RAIL_COLLAPSED_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch { return {}; }
}
function saveCollapsedCategories(state: Record<string, boolean>) {
  localStorage.setItem(LEFT_RAIL_COLLAPSED_KEY, JSON.stringify(state));
}

function LeftRail({
  byCategory,
  onAdd,
  components,
  tokens,
}: {
  byCategory: [string, ComponentDef[]][];
  onAdd: (c: ComponentDef, paramOverrides?: Record<string, unknown>) => void;
  components: ComponentDef[];
  tokens: Tokens;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(loadCollapsedCategories);
  useEffect(() => { saveCollapsedCategories(collapsed); }, [collapsed]);

  const toggleCategory = (cat: string) => {
    setCollapsed((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const expandAll = () => setCollapsed({});
  const collapseAll = () => {
    const next: Record<string, boolean> = {};
    for (const [cat] of byCategory) next[cat] = true;
    setCollapsed(next);
  };

  const allCollapsed = byCategory.every(([cat]) => collapsed[cat]);

  return (
    <div style={{ gridArea: 'left', background: COLORS.rail_bg, color: COLORS.rail_text, borderRight: `1px solid ${COLORS.rail_border}`, overflowY: 'auto' }}>
      <div style={{ padding: '20px 20px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, color: COLORS.rail_text_muted, fontWeight: 600 }}>Sections</div>
          <button
            onClick={allCollapsed ? expandAll : collapseAll}
            style={{ fontSize: 11, color: COLORS.rail_text_muted, background: 'transparent', border: 0, cursor: 'pointer', fontFamily: 'inherit', padding: 2 }}
            title={allCollapsed ? 'Expand all' : 'Collapse all'}
          >
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </button>
        </div>
        <div style={{ fontSize: 13, color: COLORS.rail_text_muted, marginTop: 4 }}>Click a card to add it to your email</div>
      </div>
      {byCategory.map(([category, list]) => {
        const isCollapsed = !!collapsed[category];
        return (
          <div key={category} style={{ padding: '4px 12px 12px' }}>
            <button
              onClick={() => toggleCategory(category)}
              style={{
                width: '100%',
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '8px 8px 6px',
                background: 'transparent', border: 0,
                cursor: 'pointer', fontFamily: 'inherit',
                color: COLORS.rail_text_muted,
                fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 600,
              }}
              aria-expanded={!isCollapsed}
              aria-label={`${isCollapsed ? 'Expand' : 'Collapse'} ${category}`}
            >
              <span style={{ fontSize: 10, transition: 'transform 0.12s', transform: isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▾</span>
              <span style={{ flex: 1, textAlign: 'left' }}>{category}</span>
              <span style={{ fontWeight: 400, opacity: 0.6 }}>{list.length}</span>
            </button>
            {!isCollapsed && list.flatMap((c) => {
              // If a component declares presets, show one card per preset
              // instead of a single card for the base component. The preset's
              // param_overrides are passed to addBlock so the dropped block
              // already has the right variant set.
              if (c.presets && c.presets.length > 0) {
                return c.presets.map((preset) => (
                  <ComponentThumb
                    key={`${c.id}/${preset.id}`}
                    component={c}
                    presetOverrides={preset.param_overrides}
                    presetName={preset.name}
                    presetDescription={preset.description}
                    components={components}
                    tokens={tokens}
                    onAdd={() => onAdd(c, preset.param_overrides)}
                  />
                ));
              }
              return [
                <ComponentThumb key={c.id} component={c} components={components} tokens={tokens} onAdd={() => onAdd(c)} />,
              ];
            })}
          </div>
        );
      })}
    </div>
  );
}

// Renders a small, scaled preview of the component at its default params and
// makes the whole card a click-to-add target. For section-start/end and other
// components that emit non-rendering HTML, fall back to a label-only card.
function ComponentThumb({
  component,
  presetOverrides,
  presetName,
  presetDescription,
  components,
  tokens,
  onAdd,
}: {
  component: ComponentDef;
  presetOverrides?: Record<string, unknown>;
  presetName?: string;
  presetDescription?: string;
  components: ComponentDef[];
  tokens: Tokens;
  onAdd: () => void;
}) {
  const previewHtml = useMemo(() => {
    if (component.id === 'section-start' || component.id === 'section-end') return null;
    const params: Record<string, unknown> = {};
    for (const p of component.params) params[p.key] = p.default ?? '';
    if (presetOverrides) Object.assign(params, presetOverrides);
    return renderBlock(
      { instance_id: 'thumb', component_id: component.id, params },
      components,
      tokens
    );
  }, [component, components, tokens, presetOverrides]);

  const displayName = presetName ?? component.name;

  return (
    <button
      onClick={onAdd}
      style={{
        width: '100%',
        background: COLORS.rail_hover,
        border: '1px solid transparent',
        color: COLORS.rail_text,
        padding: 0,
        borderRadius: 8,
        marginBottom: 8,
        cursor: 'pointer',
        fontFamily: 'inherit',
        textAlign: 'left',
        overflow: 'hidden',
        display: 'block',
        transition: 'border-color 0.1s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#5433EB'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'transparent'; }}
    >
      {previewHtml ? (
        <div
          style={{
            background: '#FFFFFF',
            height: 88,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Scale the component down so the 600px-wide email block fits ~280px of rail */}
          <div
            style={{
              transform: 'scale(0.45)',
              transformOrigin: 'top left',
              width: `${100 / 0.45}%`,
              pointerEvents: 'none',
            }}
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
          {/* fade-out at bottom so clipped previews look intentional */}
          <div style={{
            position: 'absolute', left: 0, right: 0, bottom: 0, height: 24,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,1))',
          }} />
        </div>
      ) : (
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(84,51,235,0.15)',
            color: '#B5A3FF',
            fontSize: 11,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
            border: '1px dashed rgba(84,51,235,0.5)',
            borderRadius: 6,
            margin: 6,
          }}
        >
          {component.id === 'section-start' ? '▼ Section opens' :
           component.id === 'section-end'   ? '▲ Section closes' :
           component.name}
        </div>
      )}
      <div style={{ padding: '6px 10px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{displayName}</div>
          {presetDescription && (
            <div style={{ fontSize: 10, color: COLORS.rail_text_muted, marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{presetDescription}</div>
          )}
        </div>
        <Icon source={PlusIcon} tone="subdued" />
      </div>
    </button>
  );
}

function Canvas({ device, surround, blocks, components, tokens, selectedIdx, onSelect, onMove, onMoveTo, onRemove }: {
  device: DeviceMode; surround: SurroundMode;
  blocks: BlockInstance[]; components: ComponentDef[]; tokens: Tokens;
  selectedIdx: number | null;
  onSelect: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onMoveTo: (from: number, to: number) => void;
  onRemove: (i: number) => void;
}) {
  // All three modes (Desktop / Mobile / Fullscreen) now share the same DOM
  // rendering so drag-and-drop works everywhere. The only difference is the
  // canvas frame width. The Preview tab still uses an iframe for true CSS
  // isolation — that's the "ground truth" view.
  // Mobile picks the responsive-spacing-token mobile values inline so the
  // preview reflects mobile padding/radius even though the parent browser
  // viewport is wider than the @media breakpoint.
  const viewport = device === 'mobile' ? 'mobile' : 'desktop';
  const frameWidth = device === 'mobile' ? 400 : 720;
  const frameLabel = device === 'mobile' ? 'Mobile · 400px' : device === 'fullscreen' ? 'Edit · 720px' : 'Desktop · 720px';
  const surroundBg = surround === 'dark' ? '#121212' : COLORS.canvas_bg;

  return (
    <div style={{ gridArea: 'canvas', background: surroundBg, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: 32 }}>
      <div style={{ width: frameWidth, background: '#fff', borderRadius: 12, boxShadow: '0 1px 0 rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.08)', overflow: 'hidden', alignSelf: 'flex-start' }}>
        <div style={{ borderBottom: '1px solid #E5E5E5', padding: '6px 12px', fontSize: 11, fontFamily: 'monospace', color: '#6D7175', background: '#FAFBFB' }}>
          {frameLabel} · click + drag blocks to reorder
        </div>
        <div style={{ padding: 16 }}>
          {blocks.length === 0 ? (
            <div style={{ padding: 64, textAlign: 'center', color: '#6D7175' }}>
              <p style={{ fontSize: 14, marginBottom: 4 }}>Start composing</p>
              <p style={{ fontSize: 13 }}>Pick a section from the left to add your first block.</p>
            </div>
          ) : (
            <BlockListWithDnd
              blocks={blocks}
              components={components}
              tokens={tokens}
              viewport={viewport}
              selectedIdx={selectedIdx}
              onSelect={onSelect}
              onMove={onMove}
              onMoveTo={onMoveTo}
              onRemove={onRemove}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Block list with drag-and-drop reordering. Each block is draggable; thin
// drop-zone bands between blocks (and at the top/bottom) accept the drag.
// onMoveTo(from, to) does the reorder; the up/down arrows still work as a
// fallback for keyboard / accessibility users.
function BlockListWithDnd({
  blocks,
  components,
  tokens,
  viewport,
  selectedIdx,
  onSelect,
  onMove,
  onMoveTo,
  onRemove,
}: {
  blocks: BlockInstance[];
  components: ComponentDef[];
  tokens: Tokens;
  viewport: 'desktop' | 'mobile';
  selectedIdx: number | null;
  onSelect: (i: number) => void;
  onMove: (i: number, dir: -1 | 1) => void;
  onMoveTo: (from: number, to: number) => void;
  onRemove: (i: number) => void;
}) {
  const [draggingIdx, setDraggingIdx] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);

  const onDragOver = (e: React.DragEvent, target: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDropTarget(target);
  };

  const onDrop = (e: React.DragEvent, target: number) => {
    e.preventDefault();
    setDropTarget(null);
    if (draggingIdx == null) return;
    onMoveTo(draggingIdx, target);
    setDraggingIdx(null);
  };

  return (
    <div onDragLeave={(e) => {
      // Reset target when leaving the whole list (not when moving between zones)
      if (e.currentTarget === e.target) setDropTarget(null);
    }}>
      <DropZone active={dropTarget === 0} onDragOver={(e) => onDragOver(e, 0)} onDrop={(e) => onDrop(e, 0)} />
      {blocks.map((b, idx) => {
        const comp = components.find((c) => c.id === b.component_id);
        const isSelected = idx === selectedIdx;
        const isDragging = idx === draggingIdx;
        const isSectionStart = b.component_id === 'section-start';
        const isSectionEnd = b.component_id === 'section-end';
        const sectionBg = isSectionStart ? (tokens.colors[String(b.params.bg ?? 'bg_fill')] ?? '#FFFFFF') : null;
        return (
          <div key={b.instance_id}>
            <div
              draggable
              onDragStart={(e) => {
                setDraggingIdx(idx);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', String(idx));
              }}
              onDragEnd={() => { setDraggingIdx(null); setDropTarget(null); }}
              onClick={() => onSelect(idx)}
              style={{
                position: 'relative', padding: 8, borderRadius: 6, cursor: isDragging ? 'grabbing' : 'grab',
                outline: isSelected ? '2px solid #5433EB' : '2px solid transparent',
                marginBottom: 0,
                background: isSelected ? 'rgba(84,51,235,0.04)' : 'transparent',
                opacity: isDragging ? 0.4 : 1,
              }}
            >
              {isSelected && (
                <div
                  style={{ position: 'absolute', top: -2, right: -2, background: '#FFFFFF', border: '1px solid #E5E5E5', borderRadius: 6, padding: 2, display: 'flex', gap: 2, zIndex: 2 }}
                  onClick={(e) => e.stopPropagation()}
                  draggable={false}
                  onDragStart={(e) => e.stopPropagation()}
                >
                  <Tooltip content="Move up"><Button icon={ArrowUpIcon} onClick={() => onMove(idx, -1)} disabled={idx === 0} size="micro" accessibilityLabel="Up" /></Tooltip>
                  <Tooltip content="Move down"><Button icon={ArrowDownIcon} onClick={() => onMove(idx, 1)} disabled={idx === blocks.length - 1} size="micro" accessibilityLabel="Down" /></Tooltip>
                  <Tooltip content="Delete"><Button icon={DeleteIcon} tone="critical" onClick={() => onRemove(idx)} size="micro" accessibilityLabel="Delete" /></Tooltip>
                </div>
              )}
              <div style={{ fontSize: 11, color: '#6D7175', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'monospace', color: '#9DA0A4' }}>☰</span>
                <span>{idx + 1}. {comp?.name ?? b.component_id}</span>
              </div>
              {isSectionStart || isSectionEnd ? (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 12px', borderRadius: 4,
                  background: '#F4F0FE', border: '1px dashed #5433EB',
                  fontSize: 12, color: '#5433EB', fontWeight: 600,
                  textTransform: 'uppercase', letterSpacing: 0.5,
                }}>
                  <span>{isSectionStart ? '▼ Section opens' : '▲ Section closes'}</span>
                  {isSectionStart && sectionBg && (
                    <span style={{ width: 14, height: 14, background: sectionBg, borderRadius: 3, border: '1px solid rgba(0,0,0,0.1)' }} />
                  )}
                  {isSectionStart && (
                    <span style={{ fontWeight: 400, textTransform: 'none', letterSpacing: 0, color: '#6D7175' }}>
                      {String(b.params.bg ?? 'bg_fill')}
                    </span>
                  )}
                </div>
              ) : (
                <div style={{ pointerEvents: 'none' }} dangerouslySetInnerHTML={{ __html: renderBlock(b, components, tokens, viewport) }} />
              )}
            </div>
            <DropZone active={dropTarget === idx + 1} onDragOver={(e) => onDragOver(e, idx + 1)} onDrop={(e) => onDrop(e, idx + 1)} />
          </div>
        );
      })}
    </div>
  );
}

function DropZone({
  active,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDrop={onDrop}
      style={{
        height: active ? 12 : 6,
        margin: '2px 0',
        borderRadius: 3,
        background: active ? '#5433EB' : 'transparent',
        transition: 'height 0.08s, background 0.08s',
      }}
    />
  );
}

function RightRail({ selectedBlock, selectedComponent, tokens, onParamChange }: {
  selectedBlock: BlockInstance | null;
  selectedComponent: ComponentDef | undefined | null;
  tokens: Tokens;
  onParamChange: (key: string, value: unknown) => void;
}) {
  return (
    <div style={{ gridArea: 'right', background: COLORS.inspector_bg, borderLeft: `1px solid ${COLORS.toolbar_border}`, overflowY: 'auto', padding: 16 }}>
      {!selectedBlock || !selectedComponent ? (
        <BlockStack gap="200">
          <Text variant="headingSm" as="h2">Settings</Text>
          <Text as="p" variant="bodyMd" tone="subdued">Select a block on the canvas to edit its parameters.</Text>
        </BlockStack>
      ) : (
        <BlockStack gap="400">
          <BlockStack gap="100">
            <InlineStack align="space-between" blockAlign="center" gap="200">
              <Text variant="headingSm" as="h2">{selectedComponent.name}</Text>
              <Tag>{selectedComponent.category}</Tag>
            </InlineStack>
            {selectedComponent.description && <Text variant="bodySm" as="p" tone="subdued">{selectedComponent.description}</Text>}
          </BlockStack>
          <Divider />
          <BlockStack gap="400">
            {selectedComponent.params.map((p) => (
              <ParamField key={p.key} param={p} value={selectedBlock.params[p.key]} tokens={tokens} onChange={(v) => onParamChange(p.key, v)} />
            ))}
          </BlockStack>
        </BlockStack>
      )}
    </div>
  );
}

function ParamField({ param, value, tokens, onChange }: { param: ParamDef; value: unknown; tokens: Tokens; onChange: (v: unknown) => void }) {
  const str = value == null ? '' : String(value);
  if (param.kind === 'textarea') return <TextField label={param.label} value={str} multiline={3} onChange={onChange} autoComplete="off" helpText={param.help} />;
  if (param.kind === 'url') return <TextField label={param.label} value={str} onChange={onChange} autoComplete="off" type="url" helpText={param.help} placeholder="https://…" />;
  if (param.kind === 'image_url') return <ImageParamField param={param} value={str} onChange={onChange} />;
  if (param.kind === 'color_token') {
    return <ColorTokenPicker label={param.label} colors={tokens.colors}
      value={str || (param.default as string | undefined) || Object.keys(tokens.colors)[0] || ''}
      onChange={onChange} helpText={param.help} />;
  }
  if (param.kind === 'spacing_token') {
    const opts = Object.entries(tokens.spacing).map(([slug, px]) => ({ value: slug, label: `${slug} (${px}px)` }));
    return <Select label={param.label} options={opts} value={str || (param.default as string | undefined) || opts[0]?.value || ''} onChange={onChange} helpText={param.help} />;
  }
  if (param.kind === 'typography_token') {
    const opts = Object.entries(tokens.typography.sizes).map(([slug, spec]) => ({ value: slug, label: `${slug} (${spec.size_px}px)` }));
    return <Select label={param.label} options={opts} value={str || (param.default as string | undefined) || opts[0]?.value || ''} onChange={onChange} helpText={param.help} />;
  }
  if (param.kind === 'weight_token') {
    const opts = (['regular', 'medium', 'bold'] as const).map((k) => ({ value: k, label: `${k} (${tokens.typography.weights[k]})` }));
    return <Select label={param.label} options={opts} value={str || (param.default as string | undefined) || 'regular'} onChange={onChange} helpText={param.help} />;
  }
  if (param.kind === 'select') return <Select label={param.label} options={param.options ?? []} value={str || (param.default as string | undefined) || param.options?.[0]?.value || ''} onChange={onChange} helpText={param.help} />;
  if (param.kind === 'boolean') {
    return <Select label={param.label} options={[{ value: 'true', label: 'Yes' }, { value: 'false', label: 'No' }]} value={typeof value === 'boolean' ? String(value) : String(param.default ?? 'false')} onChange={(v) => onChange(v === 'true')} helpText={param.help} />;
  }
  return <TextField label={param.label} value={str} onChange={onChange} autoComplete="off" helpText={param.help} />;
}

// View toggle persisted across blocks/params — not strictly per-instance.
const COLOR_PICKER_VIEW_KEY = 'shop-email-design.color-picker-view.v1';

function ColorTokenPicker({
  label,
  colors,
  value,
  onChange,
  helpText,
}: {
  label: string;
  colors: Record<string, string>;
  value: string;
  onChange: (v: unknown) => void;
  helpText?: string;
}) {
  const [view, setView] = useState<'grid' | 'list'>(() => {
    return localStorage.getItem(COLOR_PICKER_VIEW_KEY) === 'list' ? 'list' : 'grid';
  });
  const [open, setOpen] = useState(false);

  useEffect(() => { localStorage.setItem(COLOR_PICKER_VIEW_KEY, view); }, [view]);

  const groups = useMemo(() => {
    const m = new Map<string, [string, string][]>();
    for (const [slug, hex] of Object.entries(colors)) {
      const groupKey = slug.split('_')[0];
      const arr = m.get(groupKey) ?? [];
      arr.push([slug, hex]);
      m.set(groupKey, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [colors]);

  // A value starting with '#' is a literal custom hex (off-token); otherwise
  // it's a token slug we look up in the palette.
  const isCustomHex = /^#[0-9A-Fa-f]{3,8}$/.test(value);
  const currentHex = isCustomHex ? value : colors[value];
  const currentGroup = value.split('_')[0];
  const currentDisplayName = isCustomHex
    ? 'Custom color'
    : (() => {
        const rest = value.startsWith(currentGroup + '_') ? value.slice(currentGroup.length + 1) : value;
        if (!rest) return 'Default';
        return rest.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
      })();

  // Local state for the custom-hex sub-picker. Seeded with the current value
  // when entering custom mode, so the user can edit-then-apply rather than
  // committing every keystroke (which would spam the live preview).
  const [customDraft, setCustomDraft] = useState<string>(() => isCustomHex ? value : '#000000');
  const customDraftValid = /^#[0-9A-Fa-f]{6}$/.test(customDraft) || /^#[0-9A-Fa-f]{3}$/.test(customDraft);

  return (
    <BlockStack gap="100">
      <Text as="p" variant="bodyMd" fontWeight="medium">{label}</Text>

      {/* Trigger row — shows current selection, click to expand picker */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '6px 10px',
          border: `1px solid ${isCustomHex ? '#FFC453' : '#C9CCCF'}`,
          borderRadius: 8,
          background: isCustomHex ? '#FFF8EB' : '#FFFFFF',
          cursor: 'pointer', fontFamily: 'inherit',
          width: '100%', textAlign: 'left',
        }}
      >
        <span style={{ width: 20, height: 20, background: currentHex ?? '#FFFFFF', borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
        <span style={{ flex: 1, fontSize: 13 }}>{currentDisplayName}</span>
        {isCustomHex && (
          <span style={{ fontSize: 10, fontWeight: 600, color: '#8A6116', background: '#FFE7AC', padding: '2px 6px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            Custom
          </span>
        )}
        <span style={{ fontSize: 12, color: '#6D7175', fontFamily: 'monospace' }}>{currentHex}</span>
        <span style={{ fontSize: 11, color: '#6D7175' }}>{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div style={{ border: '1px solid #E1E3E5', borderRadius: 8, padding: 10, background: '#FFFFFF' }}>
          {/* Custom hex section. Off-token — styled with a yellow tint so it's
              visually distinct from the token grid below. */}
          <div style={{ background: '#FFF8EB', border: '1px solid #FFE7AC', borderRadius: 6, padding: 10, marginBottom: 12 }}>
            <Text as="p" variant="bodySm" fontWeight="medium">Custom color</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Bypasses the token system. Use sparingly — saving as a token (Tokens tab) keeps the design system consistent.
            </Text>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <input
                type="color"
                value={customDraft.length === 7 ? customDraft : '#000000'}
                onChange={(e) => setCustomDraft(e.target.value)}
                style={{ width: 36, height: 32, padding: 0, border: '1px solid #C9CCCF', borderRadius: 4, cursor: 'pointer', background: 'transparent' }}
                aria-label="Pick a custom color"
              />
              <input
                type="text"
                value={customDraft}
                onChange={(e) => setCustomDraft(e.target.value)}
                placeholder="#000000"
                style={{
                  flex: 1, padding: '6px 8px',
                  border: '1px solid #C9CCCF', borderRadius: 6,
                  fontFamily: 'monospace', fontSize: 13,
                }}
              />
              <Button
                size="slim"
                disabled={!customDraftValid}
                onClick={() => { onChange(customDraft); setOpen(false); }}
              >
                Apply
              </Button>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <Text as="p" variant="bodySm" fontWeight="medium">Token palette</Text>
            <ButtonGroup variant="segmented">
              <Button size="micro" pressed={view === 'grid'} onClick={() => setView('grid')}>Grid</Button>
              <Button size="micro" pressed={view === 'list'} onClick={() => setView('list')}>List</Button>
            </ButtonGroup>
          </div>

          {groups.map(([groupKey, items]) => (
            <BlockStack gap="100" key={groupKey}>
              <Text as="p" variant="bodySm" tone="subdued" fontWeight="medium">
                {groupTitle(groupKey)}
              </Text>
              {view === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6, marginBottom: 12 }}>
                  {items.map(([slug, hex]) => {
                    const isCurrent = slug === value;
                    const subtitle = swatchShortName(slug, groupKey);
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => { onChange(slug); setOpen(false); }}
                        title={`${slug} — ${hex}`}
                        style={{
                          width: '100%', aspectRatio: '1 / 1',
                          border: isCurrent ? '2px solid #5433EB' : '1px solid rgba(0,0,0,0.1)',
                          borderRadius: 6,
                          background: hex,
                          cursor: 'pointer',
                          padding: 0,
                          position: 'relative',
                        }}
                        aria-label={`${groupTitle(groupKey)} ${subtitle}`}
                      />
                    );
                  })}
                </div>
              ) : (
                <BlockStack gap="050">
                  {items.map(([slug, hex]) => {
                    const isCurrent = slug === value;
                    return (
                      <button
                        key={slug}
                        type="button"
                        onClick={() => { onChange(slug); setOpen(false); }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 10,
                          padding: '6px 8px',
                          border: 0,
                          borderRadius: 6,
                          background: isCurrent ? '#F4F0FE' : 'transparent',
                          cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
                          width: '100%', marginBottom: 12,
                        }}
                      >
                        <span style={{ width: 20, height: 20, background: hex, borderRadius: 4, border: '1px solid rgba(0,0,0,0.1)', flexShrink: 0 }} />
                        <span style={{ flex: 1, fontSize: 13, fontWeight: isCurrent ? 600 : 400 }}>{swatchShortName(slug, groupKey)}</span>
                        <span style={{ fontSize: 11, color: '#6D7175', fontFamily: 'monospace' }}>{hex}</span>
                      </button>
                    );
                  })}
                </BlockStack>
              )}
            </BlockStack>
          ))}
        </div>
      )}
      {helpText && <Text as="p" variant="bodySm" tone="subdued">{helpText}</Text>}
    </BlockStack>
  );
}

function groupTitle(groupKey: string): string {
  switch (groupKey) {
    case 'text': return 'Text';
    case 'bg': return 'Background';
    case 'border': return 'Border';
    case 'surface': return 'Surface';
    default: return groupKey.charAt(0).toUpperCase() + groupKey.slice(1);
  }
}

function swatchShortName(slug: string, groupKey: string): string {
  const rest = slug.startsWith(groupKey + '_') ? slug.slice(groupKey.length + 1) : slug;
  if (!rest) return 'Default';
  return rest.split('_').map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
}

function ImageParamField({ param, value, onChange }: { param: ParamDef; value: string; onChange: (v: unknown) => void }) {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <BlockStack gap="200">
      <Text as="p" variant="bodyMd" fontWeight="medium">{param.label}</Text>
      {value ? (
        <div style={{ position: 'relative', border: '1px solid #E5E5E5', borderRadius: 8, overflow: 'hidden', background: '#F2F4F5' }}>
          <img src={value} alt={`${param.label} preview`}
            style={{ display: 'block', width: '100%', height: 'auto', maxHeight: 220, objectFit: 'cover' }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = '0.4'; }} />
          <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 8 }}>
            <Button size="slim" icon={UploadIcon} onClick={() => setModalOpen(true)}>Replace</Button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setModalOpen(true)}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, border: '1px dashed #C9CCCF', borderRadius: 8, padding: '32px 16px', background: '#F6F6F7', color: '#5C5F62', fontSize: 13, cursor: 'pointer', width: '100%', fontFamily: 'inherit' }}>
          <span style={{ fontSize: 24, lineHeight: 1 }}>↑</span>
          <span>Click to add an image</span>
        </button>
      )}
      {param.help && <Text as="p" variant="bodySm" tone="subdued">{param.help}</Text>}
      {modalOpen && (
        <ImageSourceModal currentUrl={value} onClose={() => setModalOpen(false)}
          onChoose={(url) => { onChange(url); setModalOpen(false); }}
          onClear={() => { onChange(''); setModalOpen(false); }} />
      )}
    </BlockStack>
  );
}

function ImageSourceModal({ currentUrl, onClose, onChoose, onClear }: {
  currentUrl: string; onClose: () => void; onChoose: (url: string) => void; onClear: () => void;
}) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [urlDraft, setUrlDraft] = useState(currentUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const isQuickHosted = !!urlDraft && (urlDraft.includes('.quick.shopify.io/files/') || urlDraft.includes('/files/'));

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setUploadError('Pick an image file.'); return; }
    setUploadError(null); setUploading(true);
    try { const { url } = await uploadImage(file); setUrlDraft(url); }
    catch (err) { setUploadError(err instanceof Error ? err.message : String(err)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  };

  return (
    <Modal open onClose={onClose} title="Add image"
      primaryAction={{ content: 'Use this image', onAction: () => onChoose(urlDraft), disabled: !urlDraft }}
      secondaryActions={[
        ...(currentUrl ? [{ content: 'Remove image', destructive: true, onAction: onClear }] : []),
        { content: 'Cancel', onAction: onClose },
      ]}>
      <Modal.Section>
        <BlockStack gap="400">
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Upload from your computer</Text>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFile} />
            <InlineStack gap="200" blockAlign="center">
              <Button onClick={() => fileRef.current?.click()} loading={uploading} disabled={uploading} icon={UploadIcon}>
                {uploading ? 'Uploading…' : 'Choose file'}
              </Button>
              <Text as="p" variant="bodySm" tone="subdued">PNG, JPG, GIF, or WebP.</Text>
            </InlineStack>
            {uploadError && <Banner tone="critical" title="Upload failed" onDismiss={() => setUploadError(null)}><p>{uploadError}</p></Banner>}
          </BlockStack>
          <Divider />
          <BlockStack gap="200">
            <Text as="h3" variant="headingSm">Or paste a URL</Text>
            <TextField label="Image URL" labelHidden value={urlDraft} onChange={setUrlDraft} autoComplete="off" type="url" placeholder="https://…/image.png" />
          </BlockStack>
          {urlDraft && (
            <BlockStack gap="200">
              <Text as="h3" variant="headingSm">Preview</Text>
              <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, background: '#F2F4F5', padding: 12, display: 'flex', justifyContent: 'center' }}>
                <img src={urlDraft} alt="Preview" style={{ maxWidth: '100%', maxHeight: 280, borderRadius: 4 }} />
              </div>
            </BlockStack>
          )}
          {isQuickHosted && (
            <Banner tone="warning" title="Preview-only image">
              <p>Uploaded images live behind Google IAP. They render in this preview but <strong>won't load in real email clients</strong>. Replace with a public CDN URL before sending.</p>
            </Banner>
          )}
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
