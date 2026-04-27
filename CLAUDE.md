# Architecture deep-dive (for Claude Code)

Read `README.md` first for the high-level overview and build/deploy flow.
This document covers conventions, patterns, and gotchas that aren't obvious
from the file structure.

## Mental model

The app is a *renderer for a token-based component library*. The library is
defined declaratively in `src/seed.ts` and edited at runtime via the
Tokens / Catalog admin tabs. Components are pure data: a `params` schema, a
`template` string, optional `variant_styles` and `presets`. There is no
per-component code — `src/render.ts` interprets the template against
the params + tokens.

This means: **adding a new component never touches React code.** You only
add a new entry to `SEED_COMPONENTS` in `src/seed.ts`. The Build page picks
it up automatically.

## The template language (`src/render.ts`)

Templates are strings with `{{...}}` substitutions. Spaces are tolerated
inside the braces. The resolver supports six namespaces:

| Token form | What it resolves to |
|---|---|
| `{{param.KEY}}` | The block instance's param value, HTML-escaped |
| `{{color.SLUG}}` | Hex from `tokens.colors[SLUG]`. Also accepts literal hex (`#RRGGBB`) and the keyword `transparent` |
| `{{type.SLUG.field}}` | One of: `size_px`, `line_height_px`, `letter_spacing_px`, `weight`, `transform`, `decoration` |
| `{{weight.regular\|medium\|bold}}` | The numeric weight from `tokens.typography.weights` |
| `{{spacing.SLUG}}` | Pixel value. Viewport-aware (see below) |
| `{{token.font_family}}` / `{{token.radius_px}}` | Top-level token values |

### Special: `@param.KEY` indirection

The resolver substitutes `@param.KEY` *before* splitting on dots. This lets
templates parameterize the slug:

```
{{color.@param._headline_color_slug}}
{{spacing.@param.padding_top}}
```

If `_headline_color_slug` is `text_inverse`, the resolved path becomes
`color.text_inverse`. Critical bug class: substitution must happen on the
raw path, not on the dot-split parts.

### Viewport-aware spacing

`tokens.spacing[slug]` is either a `number` (legacy, same value every
viewport) or `{ desktop: number; mobile?: number }`. The renderer takes a
`viewport` parameter (`'desktop' | 'mobile'`, default `'desktop'`).

- `{{spacing.X}}` resolves to the active viewport's value.
- `{{spacing.X.desktop}}` and `{{spacing.X.mobile}}` force a viewport
  (useful inside `<style>@media{...}</style>` blocks).

The Build canvas's *Mobile* device toggle calls `renderBlock` with
`viewport: 'mobile'`, so inline styles in the preview adapt without
relying on CSS `@media` queries that don't fire in DOM-based previews.

The exported HTML still emits `@media` queries for real email clients, so
inbox behavior is unchanged.

## Variants

### `variant_styles`

A two-level mapping: `{ paramKey: { paramValue: { computedKey: value }}}`.
When a block is rendered, every entry is iterated *in insertion order* and
matching values inject computed params into the merged param map. Later
writes overwrite earlier ones — this is intentional, used for OR-logic and
for forcing certain values when a higher-priority axis is set.

Example: Hero's variant_styles iterates show/hide booleans first, then the
`application` axis (alignment), then `color_variant` last. This ordering
means Purple hero forces image/bottom-section to `display: none` and
alignment to `center` regardless of what the user toggled. **Insertion
order matters.**

### `presets`

When a component declares `presets: [...]`, the left rail shows one card
per preset instead of a single card for the base component. Clicking a
preset card adds the block with `param_overrides` applied immediately.

Used on Hero (White / Purple) and Offers shelf could use it too.

## Data persistence

Three things live in `quick.db` (key-value store, JSON-serialized):

| Key | Shape |
|---|---|
| `tokens:singleton` | `Tokens` (colors, typography, spacing, radius_px) |
| `components:<id>` | `ComponentDef` |
| `drafts:<id>` | `Draft` (currently always one draft per session) |

The on-load migration (`App.tsx`) handles schema drift:
- Inserts any seed *colors* / *spacing* / *components* missing from quick.db.
- Refreshes stored components whose template, presets, or params have
  changed in the seed.
- Migrates older typography role shape to v2 (default_weight,
  letter_spacing_px, transform, decoration).

The migration runs on every page load, so changes to `seed.ts` propagate
to existing users on next refresh.

## Auth

`quick.id.waitForUser()` returns the IAP-authenticated user (the bug from
v0 was using `.get()` — that resolves before IAP completes). The app gates
the admin tabs on an allowlist (`ADMIN_ALLOWLIST` in `App.tsx`).

## Image upload

`quick.fs.uploadImage(file)` returns a public URL hosted on Quick's CDN.
The Build inspector uses this for image params. There's an IAP-warning
banner because the CDN URLs are *not* IAP-protected (intentional —
external email recipients need to load them).

## Auto-reload on deploy

`vite.config.ts` stamps a `BUILD_ID = String(Date.now())` into the bundle
as `__BUILD_ID__` and writes it to `version.json` at the repo root.
`src/version.ts` polls `/version.json` every 30s; when the live ID
differs from the bundled one, it forces a reload. Means CRM users
always get the latest code without hard-refresh gymnastics.

## Conventions

- **Self-contained components, NOT wrapper-blocks.** Hero/Header/Footer
  are single blocks with internal show/hide toggles, not section-start +
  section-end pairs. (The old section-start/end components are
  deprecated; left in for legacy drafts.)
- **No responsive typography.** Single type scale, desktop only — Outlook
  reliability. Spacing *can* vary by viewport via responsive tokens.
- **Light mode canonical**, dark optional via
  `@media (prefers-color-scheme: dark)`. Alpha colors in Figma are
  pre-flattened to solid hex against `#FFFFFF` (light) / `#121212` (dark).
- **Buttons:** pill (999px), max 360px every viewport, full-width on
  mobile.
- **Components must work in Outlook.** That means table-based layouts, no
  flex/grid, inline-block carries weight risk (gets degraded fallback in
  Outlook). When using inline-block, accept that Outlook shows a
  vertically-stacked fallback.

## Gotchas

- **Source location.** The React source is in `source/`. Build outputs
  to the repo root. **Old hashed JS bundles in `/assets` must be deleted
  manually** before each commit, otherwise the assets directory grows
  unbounded.
- **Template changes don't refresh components automatically** unless the
  staleness check in `App.tsx` detects them. The check compares
  `seed.template !== cur.template` — so any string change triggers a
  refresh. If you change *only* `variant_styles` (without touching the
  template), check that the migration still picks it up.
- **`quick.db` writes are async and not transactional.** If you're
  updating multiple components, do them serially (await each). Bulk
  parallel writes can interleave and lose data.
- **Grid layouts in mobile email** — 2-column grids on mobile from a
  3-column desktop need duplicated markup or inline-block tricks.
  Inline-block (current Offers Shelf approach) works in modern clients;
  Outlook desktop falls back to a vertical stack. If reliable
  cross-Outlook 2-column-mobile is needed, plan on `<!--[if mso]>`
  conditional comment markup.
- **Migration runs on every load.** It must be idempotent. Don't add
  side effects beyond the staleness checks.

## Key files (in priority order for reading)

1. `src/types.ts` — the data model. Read this first.
2. `src/seed.ts` — the actual design system. Big file (~600 lines) but
   each component is self-contained.
3. `src/render.ts` — the template engine. Small (~150 lines).
4. `src/App.tsx` — bootstrap, auth, migration, admin gating.
5. `src/pages/BuildPage.tsx` — the composer UI. Largest file. Look for
   `Canvas`, `BlockListWithDnd`, `Inspector`, `LeftRail`,
   `ComponentThumb`.
6. `src/pages/TokensPage.tsx` / `CatalogPage.tsx` — admin UIs.
7. `src/pages/PreviewPage.tsx` — iframe-isolated device frame previews.

## When working with Figma specs

The standard flow has been:

1. Joe extracts a component spec from Figma using Claude Code + the
   Figma MCP, producing a YAML/markdown blob.
2. Spec is converted to a `mk({...})` entry in `SEED_COMPONENTS`.
3. New tokens (if any) added to `SEED_TOKENS`.
4. Migration in `App.tsx` is checked — if the change shape is novel,
   add a new staleness signal.
5. Build + deploy. Existing drafts pick up the new shape on next load.

Alpha-channel colors in Figma should be **pre-flattened to solid hex**
against the canonical light or dark surface (`#FFFFFF` or `#121212`).
The token registry stores only solid hex.

## Roadmap (open work)

See the latest commit messages and Slack thread for what's actually
shipped. As of last handoff:

- Round 1 components: Hero (done v2 with W/P presets), Offers Shelf
  (done v2 with merchant + bottom button), Header (next),
  Footer (after).
- Round 2: Card, Product card, Quote, Social icons.
- Round 3: Asset library tab, multiple drafts, starter templates.
- Round 4: Mozart GraphQL integration (export to draft email).
