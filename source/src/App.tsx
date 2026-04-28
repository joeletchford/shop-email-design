import { useEffect, useState, useCallback } from 'react';
import {
  Frame, Navigation, TopBar, Page, Layout, Card, Banner, Spinner, InlineStack, Text,
} from '@shopify/polaris';
import { EditIcon, ComposeIcon, CollectionIcon, AppsIcon } from '@shopify/polaris-icons';

import { getCurrentIdentity, isAdmin, loadTokens, loadComponents, saveTokens, saveComponent, deleteComponent, resetToDefaults } from './quick';
import { SEED_TOKENS, SEED_COMPONENTS } from './seed';
import type { Tokens, ComponentDef, TokenFontSize } from './types';
import { TokensPage } from './pages/TokensPage';
import { CatalogPage } from './pages/CatalogPage';
import { BuildPage } from './pages/BuildPage';
import { PreviewPage } from './pages/PreviewPage';
import { HomePage } from './pages/HomePage';
import { SystemPage } from './pages/SystemPage';

type Route = 'system' | 'emails' | 'tokens' | 'catalog';

export default function App() {
  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'preview') return <PreviewPage />;
  const draftId = params.get('draft');
  return <MainApp draftId={draftId} />;
}

function MainApp({ draftId }: { draftId: string | null }) {
  const [route, setRoute] = useState<Route>('system');
  const [identity, setIdentity] = useState<{ email: string; name?: string } | null>(null);
  const [admin, setAdmin] = useState(false);
  const [tokens, setTokens] = useState<Tokens | null>(null);
  const [components, setComponents] = useState<ComponentDef[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      setLoading(true);
      const [id, adminFlag] = await Promise.all([getCurrentIdentity(), isAdmin()]);
      setIdentity(id);
      setAdmin(adminFlag);

      let t = await loadTokens();
      if (!t) {
        try { await saveTokens(SEED_TOKENS); t = SEED_TOKENS; }
        catch (e) { console.warn('[seed] saveTokens failed:', e); t = SEED_TOKENS; }
      } else {
        // Insert any seed color tokens missing from the stored row — e.g.
        // text_inverse_secondary added after the original seed deployed.
        // Without this, components that reference new color slugs render
        // with empty color values.
        const missingColors = Object.entries(SEED_TOKENS.colors).filter(([k]) => t!.colors[k] == null);
        if (missingColors.length > 0) {
          const merged = { ...t.colors };
          for (const [k, v] of missingColors) merged[k] = v;
          const nextColors: Tokens = { ...t, colors: merged };
          try {
            await saveTokens(nextColors);
            console.info('[seed] inserted missing color tokens:', missingColors.map(([k]) => k));
            t = nextColors;
          } catch (e) {
            console.warn('[seed] failed to insert missing colors:', e);
            t = nextColors;
          }
        }

        // Insert any seed spacing tokens missing from the stored row — e.g.
        // section_padding_v / section_padding_h / section_radius added when
        // the responsive-spacing system landed.
        const missingSpacing = Object.entries(SEED_TOKENS.spacing).filter(([k]) => t!.spacing[k] == null);
        if (missingSpacing.length > 0) {
          const merged = { ...t.spacing };
          for (const [k, v] of missingSpacing) merged[k] = v;
          const nextSpacing: Tokens = { ...t, spacing: merged };
          try {
            await saveTokens(nextSpacing);
            console.info('[seed] inserted missing spacing tokens:', missingSpacing.map(([k]) => k));
            t = nextSpacing;
          } catch (e) {
            console.warn('[seed] failed to insert missing spacing:', e);
            t = nextSpacing;
          }
        }

        // Migrate older typography shape: if any role is missing
        // default_weight or letter_spacing_px, merge in the seed defaults
        // for that role (or add the role outright if it's a new one).
        const sizes = t.typography?.sizes ?? {};
        const seedSizes = SEED_TOKENS.typography.sizes;
        const needsMigrate = Object.keys(seedSizes).some((slug) => {
          const cur = sizes[slug];
          if (!cur) return true;
          if (cur.default_weight == null) return true;
          if (cur.letter_spacing_px == null) return true;
          return false;
        });
        if (needsMigrate) {
          const merged = { ...sizes };
          for (const [slug, seed] of Object.entries(seedSizes)) {
            const cur = merged[slug] ?? {};
            // For roles that exist in the seed:
            //   - take size_px / line_height_px from cur if user customized them, else seed
            //   - take default_weight / letter_spacing / transform / decoration from seed
            //     (these are new fields; the user has never edited them, and we
            //      want the Figma-correct defaults to win, not the legacy `weight`)
            //   - drop the legacy numeric `weight` field so the resolver reads
            //     default_weight (the resolver prefers default_weight, but we
            //     remove `weight` to keep the data clean).
            const next: TokenFontSize = {
              size_px: cur.size_px ?? seed.size_px,
              line_height_px: cur.line_height_px ?? seed.line_height_px,
              default_weight: seed.default_weight,
              letter_spacing_px: seed.letter_spacing_px,
              transform: seed.transform,
              decoration: seed.decoration,
            };
            merged[slug] = next;
          }
          // Drop body_xsmall since it's renamed to body_legal
          if ('body_xsmall' in merged && 'body_legal' in merged) {
            const { body_xsmall: _x, ...rest } = merged;
            Object.keys(rest).forEach((k) => { (merged as Record<string, unknown>)[k] = (rest as Record<string, unknown>)[k]; });
            delete (merged as Record<string, unknown>).body_xsmall;
          }
          const migrated: Tokens = {
            ...t,
            typography: { ...t.typography, sizes: merged },
          };
          try {
            await saveTokens(migrated);
            console.info('[seed] migrated typography shape to v2 (16 roles + spacing/weight/decoration)');
            t = migrated;
          } catch (e) {
            console.warn('[seed] typography migration save failed:', e);
            t = migrated;
          }
        }
      }
      setTokens(t);

      let c = await loadComponents();
      if (c.length === 0) {
        try { for (const comp of SEED_COMPONENTS) await saveComponent(comp); c = SEED_COMPONENTS; }
        catch (e) { console.warn('[seed] saveComponent failed:', e); c = SEED_COMPONENTS; }
      } else {
        // Refresh seed components when their stored shape no longer matches the
        // canonical seed. Reasons we re-seed:
        //   - template missing the new style hooks (letter_spacing_px, etc.)
        //   - param default values dropped or empty when the seed has them
        //     (caused empty `font-size:px` and `color:` in the rendered HTML)
        const seedById = new Map(SEED_COMPONENTS.map((s) => [s.id, s] as const));
        const storedIds = new Set(c.map((cur) => cur.id));

        // 1. Insert any seed component that doesn't exist in quick.db yet.
        // Without this, adding a new component to the seed (like 'logo') wouldn't
        // show up for users whose db is already populated.
        const missing = SEED_COMPONENTS.filter((s) => !storedIds.has(s.id));
        if (missing.length > 0) {
          for (const m of missing) {
            try {
              await saveComponent({
                ...m,
                updated_at: new Date().toISOString(),
                updated_by: 'seed-add',
              });
              console.info(`[seed] inserted new component '${m.id}'`);
            } catch (e) {
              console.warn(`[seed] failed to insert '${m.id}':`, e);
            }
          }
        }

        // 2. Re-seed existing components whose stored shape is stale.
        const stale = c.filter((cur) => {
          const seed = seedById.get(cur.id);
          if (!seed) return false;
          // 1. Template missing letter_spacing_px hook — old shape.
          if (!cur.template.includes('letter_spacing_px') && seed.template.includes('letter_spacing_px')) {
            return true;
          }
          // 2. Seed variant_styles differs from stored (catches value changes, not just presence).
          if (JSON.stringify(seed.variant_styles ?? null) !== JSON.stringify(cur.variant_styles ?? null)) return true;
          // 3. Seed has presets that the stored component doesn't (or count differs).
          const seedPresetCount = seed.presets?.length ?? 0;
          const curPresetCount = cur.presets?.length ?? 0;
          if (seedPresetCount !== curPresetCount) return true;
          // 4. Seed template differs from stored template (catches general
          //    template-only updates like a hardcoded color or layout change).
          if (seed.template !== cur.template) return true;
          // 5. Seed has a param the stored component is missing.
          for (const seedParam of seed.params) {
            const curParam = cur.params.find((p) => p.key === seedParam.key);
            if (!curParam) return true;
            if (seedParam.default !== undefined && seedParam.default !== '' &&
                (curParam.default === undefined || curParam.default === '')) {
              return true;
            }
          }
          // 6. Stored component has params the seed deleted.
          for (const curParam of cur.params) {
            if (!seed.params.find((p) => p.key === curParam.key)) return true;
          }
          return false;
        });
        if (stale.length > 0) {
          for (const s of stale) {
            const seed = seedById.get(s.id)!;
            try {
              await saveComponent({
                ...seed,
                updated_at: new Date().toISOString(),
                updated_by: 'migration',
              });
              console.info(`[seed] refreshed component '${s.id}'`);
            } catch (e) {
              console.warn(`[seed] failed to refresh '${s.id}':`, e);
            }
          }
        }
        // 3. Remove any stored components that are no longer in the seed.
        const obsolete = c.filter((cur) => !seedById.has(cur.id));
        if (obsolete.length > 0) {
          for (const o of obsolete) {
            try {
              await deleteComponent(o.id);
              console.info(`[seed] removed obsolete component '${o.id}'`);
            } catch (e) {
              console.warn(`[seed] failed to remove obsolete '${o.id}':`, e);
            }
          }
        }
        if (missing.length > 0 || stale.length > 0 || obsolete.length > 0) {
          c = await loadComponents();
        }
      }
      setComponents(c);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);

  const nav = (
    <Navigation location={`/${route}`}>
      <Navigation.Section
        items={[
          { label: 'Components', icon: AppsIcon, selected: route === 'system', onClick: () => setRoute('system') },
          ...(admin ? [
            { label: 'Emails', icon: ComposeIcon, selected: route === 'emails', onClick: () => setRoute('emails') },
            { label: 'Tokens', icon: EditIcon, selected: route === 'tokens', onClick: () => setRoute('tokens') },
            { label: 'Catalog', icon: CollectionIcon, selected: route === 'catalog', onClick: () => setRoute('catalog') },
          ] : []),
        ]}
      />
    </Navigation>
  );

  const topBar = (
    <TopBar
      userMenu={
        <TopBar.UserMenu
          actions={[]}
          name={identity?.name ?? identity?.email ?? 'Signed out'}
          detail={admin ? 'Admin' : 'Read only'}
          initials={initialsFromEmail(identity?.email ?? '?')}
          open={false}
          onToggle={() => {}}
        />
      }
    />
  );

  if (loading) {
    return (
      <Frame topBar={topBar}>
        <Page title="Shop email design system">
          <Layout>
            <Layout.Section>
              <Card>
                <InlineStack gap="300" blockAlign="center">
                  <Spinner size="small" />
                  <Text as="p" variant="bodyMd">Loading design system…</Text>
                </InlineStack>
              </Card>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  if (error) {
    return (
      <Frame topBar={topBar}>
        <Page title="Shop email design system">
          <Layout>
            <Layout.Section>
              <Banner tone="critical" title="Could not load the design system">
                <p>{error}</p>
              </Banner>
            </Layout.Section>
          </Layout>
        </Page>
      </Frame>
    );
  }

  if (!tokens || !components) return null;

  const onTokensChange = async (next: Tokens) => { await saveTokens(next); setTokens(next); };
  const onComponentsChange = async () => { setComponents(await loadComponents()); };

  // Full-bleed pages bypass the Polaris Frame.
  if (draftId) {
    return (
      <BuildPage
        tokens={tokens}
        components={components}
        identity={identity}
        isAdmin={admin}
        draftId={draftId}
        onGoHome={() => { window.location.href = window.location.pathname; }}
      />
    );
  }

  if (route === 'system') {
    return (
      <SystemPage
        tokens={tokens}
        components={components}
        identity={identity}
        isAdmin={admin}
        onNavigate={(r) => setRoute(r)}
        onReset={async () => {
          await resetToDefaults(SEED_TOKENS, SEED_COMPONENTS);
          await reload();
        }}
      />
    );
  }

  return (
    <Frame topBar={topBar} navigation={nav}>
      {route === 'emails' && <HomePage identity={identity} isAdmin={admin} onNavigate={(r) => setRoute(r)} />}
      {route === 'tokens' && admin && <TokensPage tokens={tokens} onChange={onTokensChange} identity={identity} />}
      {route === 'catalog' && admin && <CatalogPage components={components} onChanged={onComponentsChange} identity={identity} />}
    </Frame>
  );
}

function initialsFromEmail(email: string): string {
  if (email === '?' || !email) return '?';
  const local = email.split('@')[0];
  const parts = local.split(/[.-_]/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0].toUpperCase()).join('') || local[0].toUpperCase();
}
