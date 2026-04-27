import { useState, useMemo } from 'react';
import {
  Page, Layout, Card, BlockStack, InlineStack, Text, TextField, Button, Banner, Badge, Select, ButtonGroup, Modal,
} from '@shopify/polaris';

import type { Tokens, TokenFontSize } from '../types';
import { resetToDefaults } from '../quick';
import { SEED_TOKENS, SEED_COMPONENTS } from '../seed';

type WeightKey = 'regular' | 'medium' | 'bold';

type Props = {
  tokens: Tokens;
  onChange: (t: Tokens) => Promise<void>;
  identity: { email: string; name?: string } | null;
};

export function TokensPage({ tokens, onChange, identity }: Props) {
  const [draft, setDraft] = useState<Tokens>(tokens);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    const next: Tokens = { ...draft, updated_at: new Date().toISOString(), updated_by: identity?.email ?? 'unknown' };
    await onChange(next);
    setDraft(next);
    setSaving(false);
    setSavedFlash('Saved');
    setTimeout(() => setSavedFlash(null), 1500);
  };

  const dirty = JSON.stringify(draft) !== JSON.stringify(tokens);
  const [resetOpen, setResetOpen] = useState(false);
  const [resetting, setResetting] = useState(false);

  return (
    <Page
      title="Design tokens"
      subtitle="Colors, typography, spacing, radius. Edits propagate to the builder within seconds."
      primaryAction={{
        content: saving ? 'Saving…' : (savedFlash ?? 'Save'),
        disabled: !dirty || saving,
        onAction: save,
        loading: saving,
      }}
      secondaryActions={[
        {
          content: 'Reset to Figma defaults',
          destructive: true,
          onAction: () => setResetOpen(true),
        },
      ]}
    >
      <Layout>
        <Layout.Section>
          {savedFlash && (
            <Banner tone="success" title="Saved" onDismiss={() => setSavedFlash(null)}>
              <p>Tokens updated.</p>
            </Banner>
          )}

          <Card>
            <BlockStack gap="400">
              <InlineStack align="space-between" blockAlign="center">
                <Text variant="headingMd" as="h2">Colors</Text>
                <Text variant="bodySm" as="p" tone="subdued">{Object.keys(draft.colors).length} tokens</Text>
              </InlineStack>
              <ColorGrid
                colors={draft.colors}
                onChange={(slug, hex) => setDraft({ ...draft, colors: { ...draft.colors, [slug]: hex } })}
                onDelete={(slug) => {
                  const { [slug]: _, ...rest } = draft.colors;
                  setDraft({ ...draft, colors: rest });
                }}
              />
              <AddTokenRow kind="color" onAdd={(slug, val) => setDraft({ ...draft, colors: { ...draft.colors, [slug]: val } })} existingKeys={Object.keys(draft.colors)} />
            </BlockStack>
          </Card>

          <div style={{ marginTop: 16 }}>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">Typography</Text>
                  <Text variant="bodySm" as="p" tone="subdued">{Object.keys(draft.typography.sizes).length} roles</Text>
                </InlineStack>
                <TextField label="Font family stack" value={draft.typography.font_family} onChange={(v) => setDraft({ ...draft, typography: { ...draft.typography, font_family: v } })} autoComplete="off" />
                <BlockStack gap="200">
                  <Text variant="headingSm" as="h3">Weights</Text>
                  <InlineStack gap="400">
                    {(['regular', 'medium', 'bold'] as const).map((k) => (
                      <div key={k} style={{ flex: 1 }}>
                        <TextField label={k} value={String(draft.typography.weights[k])} type="number" onChange={(v) => {
                          const n = parseInt(v, 10);
                          if (!isNaN(n)) setDraft({ ...draft, typography: { ...draft.typography, weights: { ...draft.typography.weights, [k]: n } } });
                        }} autoComplete="off" />
                      </div>
                    ))}
                  </InlineStack>
                </BlockStack>
                <BlockStack gap="400">
                  <Text variant="headingSm" as="h3">Type roles</Text>
                  {Object.entries(draft.typography.sizes).map(([slug, spec]) => (
                    <TypeRoleCard
                      key={slug}
                      slug={slug}
                      spec={spec}
                      fontFamily={draft.typography.font_family}
                      weights={draft.typography.weights}
                      onChange={(next) => setDraft({
                        ...draft,
                        typography: { ...draft.typography, sizes: { ...draft.typography.sizes, [slug]: next } },
                      })}
                      onDelete={() => {
                        const { [slug]: _, ...rest } = draft.typography.sizes;
                        setDraft({ ...draft, typography: { ...draft.typography, sizes: rest } });
                      }}
                    />
                  ))}
                </BlockStack>
              </BlockStack>
            </Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <Card>
              <BlockStack gap="400">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingMd" as="h2">Spacing</Text>
                  <Text variant="bodySm" as="p" tone="subdued">{Object.keys(draft.spacing).length} values</Text>
                </InlineStack>
                <BlockStack gap="200">
                  {Object.entries(draft.spacing).map(([slug, val]) => {
                    // A spacing value is either a number (legacy: same value
                    // every viewport) or { desktop, mobile }. Editor exposes
                    // both fields; when desktop=mobile the value is stored
                    // as a plain number to keep the seed compact.
                    const desktopPx = typeof val === 'number' ? val : val.desktop;
                    const mobilePx = typeof val === 'number' ? val : (val.mobile ?? val.desktop);
                    const isResponsive = typeof val !== 'number' && val.mobile != null && val.mobile !== val.desktop;
                    const update = (d: number, m: number) => {
                      const next = d === m ? d : { desktop: d, mobile: m };
                      setDraft({ ...draft, spacing: { ...draft.spacing, [slug]: next } });
                    };
                    return (
                      <InlineStack gap="300" blockAlign="center" key={slug}>
                        <div style={{ flex: 1 }}>
                          <Text variant="bodyMd" as="p" fontWeight="medium">{slug}</Text>
                          {isResponsive && (
                            <Text variant="bodySm" as="p" tone="subdued">responsive</Text>
                          )}
                        </div>
                        <div style={{ height: 12, width: `${Math.min(desktopPx * 4, 240)}px`, background: '#5433EB', borderRadius: 3 }} />
                        <div style={{ width: 100 }}>
                          <TextField label="Desktop" labelHidden value={String(desktopPx)} type="number" suffix="px" prefix="D" onChange={(v) => {
                            const n = parseInt(v, 10);
                            if (!isNaN(n)) update(n, mobilePx);
                          }} autoComplete="off" />
                        </div>
                        <div style={{ width: 100 }}>
                          <TextField label="Mobile" labelHidden value={String(mobilePx)} type="number" suffix="px" prefix="M" onChange={(v) => {
                            const n = parseInt(v, 10);
                            if (!isNaN(n)) update(desktopPx, n);
                          }} autoComplete="off" />
                        </div>
                        <Button variant="plain" tone="critical" onClick={() => {
                          const { [slug]: _, ...rest } = draft.spacing;
                          setDraft({ ...draft, spacing: rest });
                        }}>Delete</Button>
                      </InlineStack>
                    );
                  })}
                </BlockStack>
                <AddTokenRow kind="spacing" onAdd={(slug, val) => setDraft({ ...draft, spacing: { ...draft.spacing, [slug]: parseInt(val, 10) || 0 } })} existingKeys={Object.keys(draft.spacing)} />
              </BlockStack>
            </Card>
          </div>

          <div style={{ marginTop: 16 }}>
            <Card>
              <BlockStack gap="400">
                <Text variant="headingMd" as="h2">Radius</Text>
                <TextField label="Default border radius" value={String(draft.radius_px)} type="number" suffix="px" onChange={(v) => {
                  const n = parseInt(v, 10);
                  if (!isNaN(n)) setDraft({ ...draft, radius_px: n });
                }} autoComplete="off" />
              </BlockStack>
            </Card>
          </div>
        </Layout.Section>

        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">Metadata</Text>
              <BlockStack gap="100">
                <Text variant="bodySm" as="p" tone="subdued">Last updated</Text>
                <Text variant="bodyMd" as="p">{formatDate(tokens.updated_at)}</Text>
              </BlockStack>
              <BlockStack gap="100">
                <Text variant="bodySm" as="p" tone="subdued">Updated by</Text>
                <Text variant="bodyMd" as="p">{tokens.updated_by}</Text>
              </BlockStack>
              {dirty && <Badge tone="attention">Unsaved changes</Badge>}
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>
      {resetOpen && (
        <Modal
          open
          onClose={() => setResetOpen(false)}
          title="Reset everything to Figma defaults?"
          primaryAction={{
            content: resetting ? 'Resetting…' : 'Reset',
            destructive: true,
            loading: resetting,
            onAction: async () => {
              setResetting(true);
              try {
                await resetToDefaults(SEED_TOKENS, SEED_COMPONENTS);
              } catch (e) {
                console.error('[reset] failed', e);
              }
              setResetting(false);
              setResetOpen(false);
              window.location.reload();
            },
          }}
          secondaryActions={[{ content: 'Cancel', onAction: () => setResetOpen(false) }]}
        >
          <Modal.Section>
            <BlockStack gap="200">
              <Text as="p" variant="bodyMd">
                This wipes the tokens and component catalog stored in <code>quick.db</code>
                and re-seeds them from the canonical Figma defaults shipped in the app.
              </Text>
              <Text as="p" variant="bodySm" tone="subdued">
                Anyone editing tokens or templates loses their changes. Use this when stored
                data drifts from the seed shape and the visual editor stops rendering correctly.
              </Text>
            </BlockStack>
          </Modal.Section>
        </Modal>
      )}
    </Page>
  );
}

function formatDate(iso: string): string {
  try { return new Date(iso).toLocaleString(); } catch { return iso; }
}

// Group color tokens by their slug prefix (text_, bg_, border_, etc.) and
// derive a friendly display name from the suffix. Renders a card per group
// with a 4-column grid of swatches; click-to-copy hex.
function ColorGrid({
  colors,
  onChange,
  onDelete,
}: {
  colors: Record<string, string>;
  onChange: (slug: string, hex: string) => void;
  onDelete: (slug: string) => void;
}) {
  const groups = useMemo(() => {
    const m = new Map<string, [string, string][]>();
    for (const [slug, hex] of Object.entries(colors)) {
      const groupKey = slug.split('_')[0]; // text, bg, border, surface, etc.
      const arr = m.get(groupKey) ?? [];
      arr.push([slug, hex]);
      m.set(groupKey, arr);
    }
    return Array.from(m.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [colors]);

  const [editing, setEditing] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const copyHex = async (hex: string) => {
    try {
      await navigator.clipboard.writeText(hex);
      setCopied(hex);
      setTimeout(() => setCopied(null), 1500);
    } catch {}
  };

  return (
    <BlockStack gap="400">
      {groups.map(([groupKey, items]) => (
        <BlockStack gap="200" key={groupKey}>
          <Text as="h3" variant="headingSm">{groupTitle(groupKey)}</Text>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
            {items.map(([slug, hex]) => (
              <ColorSwatch
                key={slug}
                slug={slug}
                hex={hex}
                groupKey={groupKey}
                isEditing={editing === slug}
                isCopied={copied === hex}
                onStartEdit={() => setEditing(slug)}
                onStopEdit={() => setEditing(null)}
                onChangeHex={(v) => onChange(slug, v)}
                onDelete={() => onDelete(slug)}
                onCopy={() => copyHex(hex)}
              />
            ))}
          </div>
        </BlockStack>
      ))}
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

// Convert a slug like 'text_brand_secondary' to display name 'Brand Secondary'
// (the first segment is the group; we drop it).
function shortName(slug: string, groupKey: string): string {
  const rest = slug.startsWith(groupKey + '_') ? slug.slice(groupKey.length + 1) : slug;
  if (!rest) return 'Default';
  return rest
    .split('_')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(' ');
}

function ColorSwatch({
  slug,
  hex,
  groupKey,
  isEditing,
  isCopied,
  onStartEdit,
  onStopEdit,
  onChangeHex,
  onDelete,
  onCopy,
}: {
  slug: string;
  hex: string;
  groupKey: string;
  isEditing: boolean;
  isCopied: boolean;
  onStartEdit: () => void;
  onStopEdit: () => void;
  onChangeHex: (v: string) => void;
  onDelete: () => void;
  onCopy: () => void;
}) {
  return (
    <div
      style={{
        border: '1px solid #E1E3E5',
        borderRadius: 8,
        background: '#FFFFFF',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <button
        onClick={onCopy}
        title="Click to copy hex"
        style={{
          background: hex,
          height: 64,
          border: 0,
          cursor: 'pointer',
          position: 'relative',
        }}
      >
        {isCopied && (
          <span style={{
            position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(0,0,0,0.6)', color: '#FFF', fontSize: 12, fontWeight: 600,
          }}>Copied</span>
        )}
      </button>
      <div style={{ padding: 10 }}>
        <Text as="p" variant="bodyMd" fontWeight="medium">{shortName(slug, groupKey)}</Text>
        <Text as="p" variant="bodySm" tone="subdued">{slug}</Text>
        {isEditing ? (
          <div style={{ marginTop: 8, display: 'flex', gap: 6 }}>
            <TextField
              label="Hex"
              labelHidden
              value={hex}
              onChange={onChangeHex}
              autoComplete="off"
              autoFocus
            />
            <Button onClick={onStopEdit} size="slim">Done</Button>
          </div>
        ) : (
          <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text as="p" variant="bodySm" tone="subdued" fontWeight="medium">{hex.toUpperCase()}</Text>
            <div style={{ display: 'flex', gap: 4 }}>
              <Button onClick={onStartEdit} variant="plain" size="slim">Edit</Button>
              <Button onClick={onDelete} variant="plain" tone="critical" size="slim">×</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function TypeRoleCard({
  slug,
  spec,
  fontFamily,
  weights,
  onChange,
  onDelete,
}: {
  slug: string;
  spec: TokenFontSize;
  fontFamily: string;
  weights: { regular: number; medium: number; bold: number };
  onChange: (next: TokenFontSize) => void;
  onDelete: () => void;
}) {
  const defaultWeight: WeightKey = spec.default_weight
    ?? (spec.weight === weights.bold ? 'bold' : spec.weight === weights.medium ? 'medium' : 'regular');
  const [previewWeight, setPreviewWeight] = useState<WeightKey>(defaultWeight);

  const transform = spec.transform ?? 'none';
  const decoration = spec.decoration ?? 'none';
  const letter_spacing_px = spec.letter_spacing_px ?? 0;

  const sampleStyle: React.CSSProperties = {
    fontFamily,
    fontSize: `${spec.size_px}px`,
    lineHeight: `${spec.line_height_px}px`,
    letterSpacing: `${letter_spacing_px}px`,
    fontWeight: weights[previewWeight],
    textTransform: transform === 'none' ? 'none' : transform,
    textDecoration: decoration === 'none' ? 'none' : 'underline',
    color: '#0F1721',
    margin: 0,
    overflowWrap: 'anywhere',
  };

  return (
    <Card>
      <BlockStack gap="300">
        <InlineStack align="space-between" blockAlign="center" gap="200">
          <BlockStack gap="050">
            <Text variant="headingSm" as="h4">{slug}</Text>
            <Text variant="bodySm" as="p" tone="subdued">
              {spec.size_px}/{spec.line_height_px}px · default {defaultWeight} · ls {letter_spacing_px}px
              {transform !== 'none' && ` · ${transform}`}
              {decoration !== 'none' && ` · ${decoration}`}
            </Text>
          </BlockStack>
          <ButtonGroup variant="segmented">
            <Button pressed={previewWeight === 'regular'} onClick={() => setPreviewWeight('regular')}>Regular</Button>
            <Button pressed={previewWeight === 'medium'} onClick={() => setPreviewWeight('medium')}>Medium</Button>
            <Button pressed={previewWeight === 'bold'} onClick={() => setPreviewWeight('bold')}>Bold</Button>
          </ButtonGroup>
        </InlineStack>

        <div
          style={{
            background: '#F6F6F7',
            border: '1px solid #E1E3E5',
            borderRadius: 8,
            padding: 16,
            minHeight: Math.max(spec.line_height_px + 32, 60),
          }}
        >
          <p style={sampleStyle}>The quick brown fox jumps over</p>
        </div>

        <InlineStack gap="300" blockAlign="end">
          <div style={{ width: 96 }}>
            <TextField
              label="Size"
              type="number"
              suffix="px"
              value={String(spec.size_px)}
              onChange={(v) => {
                const n = parseFloat(v);
                if (!isNaN(n)) onChange({ ...spec, size_px: n });
              }}
              autoComplete="off"
            />
          </div>
          <div style={{ width: 96 }}>
            <TextField
              label="Line height"
              type="number"
              suffix="px"
              value={String(spec.line_height_px)}
              onChange={(v) => {
                const n = parseFloat(v);
                if (!isNaN(n)) onChange({ ...spec, line_height_px: n });
              }}
              autoComplete="off"
            />
          </div>
          <div style={{ width: 110 }}>
            <TextField
              label="Letter spacing"
              type="number"
              suffix="px"
              value={String(letter_spacing_px)}
              onChange={(v) => {
                const n = parseFloat(v);
                if (!isNaN(n)) onChange({ ...spec, letter_spacing_px: n });
              }}
              autoComplete="off"
            />
          </div>
          <div style={{ width: 130 }}>
            <Select
              label="Default weight"
              options={[
                { value: 'regular', label: 'Regular' },
                { value: 'medium', label: 'Medium' },
                { value: 'bold', label: 'Bold' },
              ]}
              value={defaultWeight}
              onChange={(v) => onChange({ ...spec, default_weight: v as WeightKey, weight: weights[v as WeightKey] })}
            />
          </div>
          <div style={{ width: 130 }}>
            <Select
              label="Transform"
              options={[
                { value: 'none', label: 'None' },
                { value: 'uppercase', label: 'Uppercase' },
                { value: 'lowercase', label: 'Lowercase' },
                { value: 'capitalize', label: 'Capitalize' },
              ]}
              value={transform}
              onChange={(v) => onChange({ ...spec, transform: v as TokenFontSize['transform'] })}
            />
          </div>
          <div style={{ width: 130 }}>
            <Select
              label="Decoration"
              options={[
                { value: 'none', label: 'None' },
                { value: 'underline', label: 'Underline' },
              ]}
              value={decoration}
              onChange={(v) => onChange({ ...spec, decoration: v as TokenFontSize['decoration'] })}
            />
          </div>
          <Button variant="plain" tone="critical" onClick={onDelete}>Delete</Button>
        </InlineStack>
      </BlockStack>
    </Card>
  );
}

function AddTokenRow({ kind, onAdd, existingKeys }: { kind: 'color' | 'spacing'; onAdd: (slug: string, value: string) => void; existingKeys: string[] }) {
  const [slug, setSlug] = useState('');
  const [value, setValue] = useState(kind === 'color' ? '#000000' : '8');
  const dup = existingKeys.includes(slug);
  const valid = /^[a-z0-9_]+$/.test(slug) && !dup;

  return (
    <InlineStack gap="300" blockAlign="end">
      <div style={{ flex: 1 }}>
        <TextField label={`New ${kind} token name`} value={slug} placeholder={kind === 'color' ? 'e.g. accent_warm' : 'e.g. v96'} onChange={setSlug}
          error={dup ? 'Token already exists' : undefined} autoComplete="off" />
      </div>
      <div style={{ width: 160 }}>
        <TextField label={kind === 'color' ? 'Hex' : 'Pixels'} value={value} onChange={setValue} autoComplete="off" suffix={kind === 'spacing' ? 'px' : undefined} />
      </div>
      <Button disabled={!valid} onClick={() => {
        if (!valid) return;
        onAdd(slug, value);
        setSlug('');
        setValue(kind === 'color' ? '#000000' : '8');
      }}>Add</Button>
    </InlineStack>
  );
}
