import { useState, useEffect } from 'react';
import { Button, Text, BlockStack, InlineStack, Spinner } from '@shopify/polaris';
import { PlusIcon } from '@shopify/polaris-icons';

import type { Draft } from '../types';
import { loadDrafts, saveDraft, deleteDraft } from '../quick';

function openDraft(id: string) {
  const tab = window.open(`?draft=${id}`, '_blank');
  if (!tab) window.location.href = `?draft=${id}`;
}

function relativeTime(isoStr: string): string {
  const diff = Date.now() - new Date(isoStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function HomePage({ identity }: {
  identity: { email: string; name?: string } | null;
  isAdmin?: boolean;
  onNavigate?: (route: 'tokens' | 'catalog') => void;
}) {
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const refresh = () => loadDrafts().then((d) => { setDrafts(d); setLoading(false); });

  useEffect(() => {
    refresh();
    // Reload when the user switches back to this tab (e.g. after editing a draft)
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  const createDraft = async () => {
    setCreating(true);
    const d: Draft = {
      id: crypto.randomUUID(),
      name: 'Untitled email',
      blocks: [],
      subject: '',
      preheader: '',
      created_by: identity?.email,
      updated_at: new Date().toISOString(),
    };
    // Add to list immediately so the card appears without waiting for the DB write.
    setDrafts((cur) => [d, ...cur]);
    // Open in new tab right away (within the click gesture) so popup blockers don't fire.
    openDraft(d.id);
    try {
      await saveDraft(d);
    } catch (e) {
      console.warn('[home] saveDraft failed:', e);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this email? This cannot be undone.')) return;
    await deleteDraft(id);
    setDrafts((cur) => cur.filter((d) => d.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#F1F2F4', padding: 32, boxSizing: 'border-box' }}>
      <div style={{ maxWidth: 960, margin: '0 auto' }}>
        <BlockStack gap="600">
          <InlineStack align="space-between" blockAlign="center">
            <BlockStack gap="100">
              <Text variant="heading2xl" as="h1">Emails</Text>
              <Text as="p" variant="bodyMd" tone="subdued">All emails, shared across the team.</Text>
            </BlockStack>
            <Button icon={PlusIcon} variant="primary" onClick={createDraft} loading={creating}>
              New email
            </Button>
          </InlineStack>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 64 }}>
              <Spinner size="large" />
            </div>
          ) : drafts.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '64px 32px', background: '#fff', borderRadius: 12, border: '1px dashed #C9CCCF' }}>
              <Text variant="headingMd" as="p">No emails yet</Text>
              <div style={{ marginTop: 8 }}>
                <Text as="p" variant="bodyMd" tone="subdued">Create your first email to get started.</Text>
              </div>
              <div style={{ marginTop: 20 }}>
                <Button variant="primary" onClick={createDraft} loading={creating}>New email</Button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: 16,
            }}>
              {drafts.map((d) => (
                <DraftCard
                  key={d.id}
                  draft={d}
                  onClick={() => openDraft(d.id)}
                  onDelete={() => handleDelete(d.id)}
                />
              ))}
            </div>
          )}
        </BlockStack>
      </div>
    </div>
  );
}

function DraftCard({ draft, onClick, onDelete }: {
  draft: Draft;
  onClick: () => void;
  onDelete: () => void;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: 12,
        border: `1px solid ${hovered ? '#8C9196' : '#E1E3E5'}`,
        cursor: 'pointer',
        position: 'relative',
        transition: 'border-color 0.1s, box-shadow 0.1s',
        boxShadow: hovered ? '0 4px 16px rgba(0,0,0,0.08)' : '0 1px 2px rgba(0,0,0,0.04)',
        overflow: 'hidden',
      }}
    >
      {/* card body — click opens the draft */}
      <div onClick={onClick} style={{ padding: '20px 20px 16px' }}>
        <BlockStack gap="100">
          <Text variant="headingMd" as="h2">{draft.name || 'Untitled email'}</Text>
          <Text as="p" variant="bodySm" tone={draft.subject ? undefined : 'subdued'}>
            {draft.subject || <em>No subject</em>}
          </Text>
        </BlockStack>
      </div>

      {/* footer */}
      <div style={{ borderTop: '1px solid #F1F2F4', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <Text as="p" variant="bodySm" tone="subdued">
            {draft.created_by ?? 'Unknown'} · {relativeTime(draft.updated_at)}
          </Text>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete email"
          aria-label="Delete email"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 28, height: 28, borderRadius: 6, flexShrink: 0,
            background: 'transparent', border: 0, cursor: 'pointer',
            color: '#8C9196', fontSize: 14,
            transition: 'background 0.1s, color 0.1s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#FFF4F4'; e.currentTarget.style.color = '#D82C0D'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#8C9196'; }}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
