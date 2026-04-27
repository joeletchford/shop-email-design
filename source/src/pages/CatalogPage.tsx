import { useState, useMemo } from 'react';
import {
  Page, Layout, Card, BlockStack, InlineStack, Text, TextField, Button, Select,
  ResourceList, ResourceItem, Modal, Tag,
} from '@shopify/polaris';
import { DeleteIcon, EditIcon, PlusIcon } from '@shopify/polaris-icons';

import { saveComponent, deleteComponent, loadTokens } from '../quick';
import type { ComponentDef, ParamDef, ParamKind, Tokens } from '../types';
import { renderTemplate } from '../render';

type Props = {
  components: ComponentDef[];
  onChanged: () => Promise<void>;
  identity: { email: string; name?: string } | null;
};

const KINDS: { value: ParamKind; label: string }[] = [
  { value: 'text', label: 'Text (single-line)' },
  { value: 'textarea', label: 'Text (multi-line)' },
  { value: 'url', label: 'URL' },
  { value: 'image_url', label: 'Image URL' },
  { value: 'color_token', label: 'Color token' },
  { value: 'typography_token', label: 'Typography role' },
  { value: 'spacing_token', label: 'Spacing token' },
  { value: 'weight_token', label: 'Weight token' },
  { value: 'select', label: 'Select (custom options)' },
  { value: 'boolean', label: 'Boolean' },
];

export function CatalogPage({ components, onChanged, identity }: Props) {
  const [editing, setEditing] = useState<ComponentDef | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const categories = useMemo(() => Array.from(new Set(components.map((c) => c.category))).sort(), [components]);

  return (
    <Page title="Component catalog" subtitle={`${components.length} components.`}
      primaryAction={{ content: 'New component', icon: PlusIcon, onAction: () => setAdding(true) }}>
      <Layout>
        <Layout.Section>
          <Card>
            <ResourceList resourceName={{ singular: 'component', plural: 'components' }} items={components}
              renderItem={(c) => (
                <ResourceItem id={c.id} accessibilityLabel={`Edit ${c.name}`} onClick={() => setEditing(c)}>
                  <InlineStack gap="400" align="space-between" blockAlign="center">
                    <BlockStack gap="100">
                      <InlineStack gap="200" blockAlign="center">
                        <Text variant="bodyMd" as="p" fontWeight="semibold">{c.name}</Text>
                        <Tag>{c.category}</Tag>
                        <Text variant="bodySm" as="p" tone="subdued">{c.id}</Text>
                      </InlineStack>
                      {c.description && <Text variant="bodySm" as="p" tone="subdued">{c.description}</Text>}
                    </BlockStack>
                    <InlineStack gap="200">
                      <Button icon={EditIcon} onClick={() => setEditing(c)}>Edit</Button>
                      <Button icon={DeleteIcon} tone="critical" variant="plain" onClick={() => setConfirmDelete(c.id)}>Delete</Button>
                    </InlineStack>
                  </InlineStack>
                </ResourceItem>
              )} />
          </Card>
        </Layout.Section>
        <Layout.Section variant="oneThird">
          <Card>
            <BlockStack gap="300">
              <Text variant="headingSm" as="h3">Categories</Text>
              <InlineStack gap="200">{categories.map((c) => <Tag key={c}>{c}</Tag>)}</InlineStack>
            </BlockStack>
          </Card>
        </Layout.Section>
      </Layout>

      {editing && <ComponentEditor component={editing} onClose={() => setEditing(null)}
        onSave={async (c) => {
          await saveComponent({ ...c, updated_at: new Date().toISOString(), updated_by: identity?.email ?? 'unknown' });
          await onChanged();
          setEditing(null);
        }} />}
      {adding && <ComponentEditor component={{
        id: 'new-component', name: 'New component', category: 'Content', description: '',
        params: [], template: '<div></div>',
        updated_at: new Date().toISOString(), updated_by: identity?.email ?? 'unknown',
      }} onClose={() => setAdding(false)}
        onSave={async (c) => {
          await saveComponent({ ...c, updated_at: new Date().toISOString(), updated_by: identity?.email ?? 'unknown' });
          await onChanged();
          setAdding(false);
        }} />}
      {confirmDelete && <Modal open onClose={() => setConfirmDelete(null)} title="Delete component?"
        primaryAction={{ content: 'Delete', destructive: true, onAction: async () => {
          await deleteComponent(confirmDelete);
          await onChanged();
          setConfirmDelete(null);
        }}}
        secondaryActions={[{ content: 'Cancel', onAction: () => setConfirmDelete(null) }]}
      >
        <Modal.Section>
          <Text as="p" variant="bodyMd">Drafts using this component will show a "missing component" placeholder.</Text>
        </Modal.Section>
      </Modal>}
    </Page>
  );
}

function ComponentEditor({ component, onSave, onClose }: { component: ComponentDef; onSave: (c: ComponentDef) => Promise<void>; onClose: () => void; }) {
  const [draft, setDraft] = useState<ComponentDef>(component);
  const [saving, setSaving] = useState(false);
  const [previewTokens, setPreviewTokens] = useState<Tokens | null>(null);

  useMemo(() => { loadTokens().then(setPreviewTokens); }, []);

  const updateParam = (idx: number, patch: Partial<ParamDef>) => {
    const next = [...draft.params];
    next[idx] = { ...next[idx], ...patch };
    setDraft({ ...draft, params: next });
  };
  const addParam = () => {
    setDraft({ ...draft, params: [...draft.params, { key: `param_${draft.params.length + 1}`, label: 'New parameter', kind: 'text', default: '' }] });
  };
  const removeParam = (idx: number) => setDraft({ ...draft, params: draft.params.filter((_, i) => i !== idx) });

  const previewHtml = useMemo(() => {
    if (!previewTokens) return '<p style="color:#999">Loading preview…</p>';
    const params: Record<string, unknown> = {};
    for (const p of draft.params) params[p.key] = p.default ?? '';
    try { return renderTemplate(draft.template, params, previewTokens); }
    catch (e) { return `<p style="color:#D92A0F">Preview error: ${e instanceof Error ? e.message : String(e)}</p>`; }
  }, [draft.template, draft.params, previewTokens]);

  const slugValid = /^[a-z0-9-]+$/.test(draft.id);

  return (
    <Modal open onClose={onClose} title={`Edit ${component.name}`} size="large"
      primaryAction={{ content: saving ? 'Saving…' : 'Save', onAction: async () => {
        setSaving(true);
        await onSave(draft);
        setSaving(false);
      }, disabled: !slugValid || saving, loading: saving }}
      secondaryActions={[{ content: 'Cancel', onAction: onClose }]}>
      <Modal.Section>
        <BlockStack gap="400">
          <InlineStack gap="300">
            <div style={{ flex: 1 }}>
              <TextField label="Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} autoComplete="off" />
            </div>
            <div style={{ flex: 1 }}>
              <TextField label="ID (kebab-case)" value={draft.id} onChange={(v) => setDraft({ ...draft, id: v })}
                error={slugValid ? undefined : 'Use lowercase letters, digits, hyphens'} autoComplete="off" />
            </div>
          </InlineStack>
          <InlineStack gap="300">
            <div style={{ flex: 1 }}>
              <TextField label="Category" value={draft.category} onChange={(v) => setDraft({ ...draft, category: v })} autoComplete="off" />
            </div>
            <div style={{ flex: 2 }}>
              <TextField label="Description" value={draft.description ?? ''} onChange={(v) => setDraft({ ...draft, description: v })} autoComplete="off" />
            </div>
          </InlineStack>

          <BlockStack gap="200">
            <InlineStack align="space-between" blockAlign="center">
              <Text variant="headingSm" as="h3">Parameters</Text>
              <Button onClick={addParam}>Add parameter</Button>
            </InlineStack>
            {draft.params.length === 0 && <Text variant="bodySm" as="p" tone="subdued">No parameters defined.</Text>}
            {draft.params.map((p, idx) => (
              <Card key={idx} padding="300">
                <BlockStack gap="300">
                  <InlineStack gap="300">
                    <div style={{ flex: 1 }}><TextField label="Key" value={p.key} onChange={(v) => updateParam(idx, { key: v })} autoComplete="off" /></div>
                    <div style={{ flex: 1 }}><TextField label="Label" value={p.label} onChange={(v) => updateParam(idx, { label: v })} autoComplete="off" /></div>
                    <div style={{ flex: 1 }}><Select label="Kind" options={KINDS} value={p.kind} onChange={(v) => updateParam(idx, { kind: v as ParamKind })} /></div>
                    <div style={{ flex: 1 }}><TextField label="Default" value={String(p.default ?? '')} onChange={(v) => updateParam(idx, { default: v })} autoComplete="off" /></div>
                    <Button tone="critical" variant="plain" onClick={() => removeParam(idx)}>Remove</Button>
                  </InlineStack>
                  {p.kind === 'select' && (
                    <TextField label="Options (one per line, value|Label)"
                      value={(p.options ?? []).map((o) => `${o.value}|${o.label}`).join('\n')}
                      multiline={3}
                      onChange={(v) => {
                        const options = v.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
                          const [val, ...rest] = line.split('|');
                          return { value: val.trim(), label: (rest.join('|') || val).trim() };
                        });
                        updateParam(idx, { options });
                      }} autoComplete="off" />
                  )}
                </BlockStack>
              </Card>
            ))}
          </BlockStack>

          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">HTML template</Text>
            <TextField label="" labelHidden value={draft.template} multiline={12} onChange={(v) => setDraft({ ...draft, template: v })} autoComplete="off" monospaced />
          </BlockStack>

          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">Live preview (defaults)</Text>
            <div style={{ border: '1px solid #E5E5E5', borderRadius: 8, padding: 16, background: '#FFF' }}
              dangerouslySetInnerHTML={{ __html: previewHtml }} />
          </BlockStack>
        </BlockStack>
      </Modal.Section>
    </Modal>
  );
}
