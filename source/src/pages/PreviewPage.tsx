import { useEffect, useMemo, useState } from 'react';
import {
  Card, BlockStack, InlineStack, Text, Button, ButtonGroup, Badge,
} from '@shopify/polaris';

import { renderEmail } from '../render';
import type { Tokens, ComponentDef, BlockInstance } from '../types';

type DeviceKey = 'mobile' | 'tablet' | 'desktop';
type ColorScheme = 'light' | 'dark';

type Device = { key: DeviceKey; label: string; width_px: number; frame_label: string };

const DEVICES: Device[] = [
  { key: 'mobile', label: 'Mobile', width_px: 400, frame_label: 'iPhone-ish · 400px' },
  { key: 'tablet', label: 'Tablet', width_px: 480, frame_label: 'Tablet · 480px' },
  { key: 'desktop', label: 'Desktop', width_px: 720, frame_label: 'Desktop · 720px' },
];

type PreviewPayload = {
  name: string;
  blocks: BlockInstance[];
  components: ComponentDef[];
  tokens: Tokens;
};

export const PREVIEW_STORAGE_KEY = 'shop-email-design.preview.v1';
export const PREVIEW_CHANNEL = 'shop-email-design.preview';

export function PreviewPage() {
  const [payload, setPayload] = useState<PreviewPayload | null>(null);
  const [activeDevices, setActiveDevices] = useState<DeviceKey[]>(['desktop', 'mobile']);
  const [scheme, setScheme] = useState<ColorScheme>('light');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(PREVIEW_STORAGE_KEY);
      if (raw) setPayload(JSON.parse(raw) as PreviewPayload);
    } catch (e) { console.warn('[preview] sessionStorage parse', e); }

    let channel: BroadcastChannel | null = null;
    try {
      channel = new BroadcastChannel(PREVIEW_CHANNEL);
      channel.onmessage = (ev) => {
        if (ev.data && typeof ev.data === 'object' && 'blocks' in ev.data) {
          setPayload(ev.data as PreviewPayload);
          setError(null);
        }
      };
      channel.postMessage({ type: 'request_payload' });
    } catch (e) { console.warn('[preview] BroadcastChannel unavailable', e); }

    if (!sessionStorage.getItem(PREVIEW_STORAGE_KEY)) {
      const timer = window.setTimeout(() => {
        if (!sessionStorage.getItem(PREVIEW_STORAGE_KEY)) {
          setError('No preview data found. Open this page from the Build tab.');
        }
      }, 800);
      return () => { window.clearTimeout(timer); channel?.close(); };
    }
    return () => channel?.close();
  }, []);

  const html = useMemo(() => payload ? renderEmail(payload.blocks, payload.components, payload.tokens) : '', [payload]);
  const visible = DEVICES.filter((d) => activeDevices.includes(d.key));

  if (error) return (
    <FullBleed>
      <Card><Text as="p" variant="bodyMd" tone="critical">{error}</Text></Card>
    </FullBleed>
  );
  if (!payload) return (
    <FullBleed>
      <Card><Text as="p" variant="bodyMd">Loading…</Text></Card>
    </FullBleed>
  );

  const toggleDevice = (k: DeviceKey) => {
    setActiveDevices((cur) => {
      if (cur.includes(k)) return cur.length === 1 ? cur : cur.filter((x) => x !== k);
      return [...cur, k];
    });
  };

  const surroundBg = scheme === 'dark' ? '#121212' : '#F2F4F5';
  const frameBg = scheme === 'dark' ? '#1F1F1F' : '#FFFFFF';
  const frameBorder = scheme === 'dark' ? '#2A2A2A' : '#E5E5E5';
  const frameText = scheme === 'dark' ? '#FFFFFF' : '#0F1721';

  return (
    <FullBleed>
      <BlockStack gap="400">
        <BlockStack gap="100">
          <Text variant="heading2xl" as="h1">{payload.name || 'Preview'}</Text>
          <Text as="p" variant="bodyMd" tone="subdued">
            Approximation. Exact rendering varies by email client; Outlook is its own beast.
          </Text>
        </BlockStack>

        <Card>
          <InlineStack align="space-between" blockAlign="center" gap="400">
            <BlockStack gap="100">
              <Text variant="headingSm" as="h2">Devices</Text>
              <Text as="p" variant="bodySm" tone="subdued">Toggle which sizes to render.</Text>
            </BlockStack>
            <ButtonGroup variant="segmented">
              {DEVICES.map((d) => (
                <Button key={d.key} pressed={activeDevices.includes(d.key)} onClick={() => toggleDevice(d.key)}>{d.label}</Button>
              ))}
            </ButtonGroup>
            <ButtonGroup variant="segmented">
              <Button pressed={scheme === 'light'} onClick={() => setScheme('light')}>Light surround</Button>
              <Button pressed={scheme === 'dark'} onClick={() => setScheme('dark')}>Dark surround</Button>
            </ButtonGroup>
          </InlineStack>
        </Card>

        <div style={{ display: 'flex', flexWrap: 'nowrap', gap: 16, overflowX: 'auto', paddingBottom: 8 }}>
          {visible.map((d) => (
            <div key={d.key} style={{ background: surroundBg, borderRadius: 12, padding: 16, flex: '0 0 auto', width: d.width_px + 32 }}>
              <BlockStack gap="200">
                <InlineStack align="space-between" blockAlign="center">
                  <Text variant="headingSm" as="h3">{d.label}</Text>
                  <Badge>{d.frame_label}</Badge>
                </InlineStack>
                <div style={{ background: frameBg, border: `1px solid ${frameBorder}`, borderRadius: 16, overflow: 'hidden', width: d.width_px }}>
                  <div style={{ borderBottom: `1px solid ${frameBorder}`, padding: '8px 12px', fontSize: 11, color: frameText, fontFamily: 'monospace', opacity: 0.6 }}>
                    {d.width_px}px viewport
                  </div>
                  <iframe srcDoc={html} title={`Preview ${d.label}`} style={{ display: 'block', width: '100%', height: 800, border: 0, background: '#fff' }} />
                </div>
              </BlockStack>
            </div>
          ))}
        </div>

        <Card>
          <BlockStack gap="200">
            <Text variant="headingSm" as="h3">What this preview is — and isn't</Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Same HTML you'd paste into Mozart, rendered at three viewport widths. Catches layout, mobile wrapping, image scaling, and font sizing.
            </Text>
            <Text as="p" variant="bodySm" tone="subdued">
              Doesn't simulate <strong>actual email clients</strong> (Outlook, Gmail's image proxy, Apple Mail dark mode). For client-by-client testing send through Mozart or Litmus.
            </Text>
          </BlockStack>
        </Card>
      </BlockStack>
    </FullBleed>
  );
}

function FullBleed({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ minHeight: '100vh', background: '#F1F2F4', padding: 24, boxSizing: 'border-box' }}>
      {children}
    </div>
  );
}
