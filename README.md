# shop-email-design

Standalone V3 email design system for Shop emails. Live at
<https://shop-email-design.quick.shopify.io> (IAP-protected, Shopifolk only).

A Polaris React app deployed via [Quick](https://quick.shopify.io/) that lets
the Shop CRM team compose marketing emails from a Figma-derived component
library. Output is raw HTML to paste into Mozart's email editor.

## Repository layout

```
.
├── README.md          ← you are here
├── CLAUDE.md          ← architecture deep-dive for AI assistants
├── index.html         ← deployed (built by Vite)
├── favicon.svg
├── icons.svg
├── version.json       ← polled by the app for auto-reload-on-deploy
├── assets/
│   └── index-XXXX.js  ← deployed bundle (hashed; old hashes must be deleted on each deploy)
└── source/            ← React source. Not served (Quick serves <repo>/ root)
    ├── package.json
    ├── pnpm-lock.yaml
    ├── tsconfig.json
    ├── vite.config.ts
    ├── index.html     ← Vite entry (different from deployed index.html)
    ├── public/
    └── src/
        ├── App.tsx           ← top-level shell + token/component bootstrap
        ├── main.tsx          ← React mount + version polling
        ├── types.ts          ← Tokens, ComponentDef, BlockInstance, Draft
        ├── render.ts         ← template language + viewport-aware token resolver
        ├── seed.ts           ← SEED_TOKENS + SEED_COMPONENTS (the design system)
        ├── quick.ts          ← quick.db + quick.fs + quick.id wrappers
        ├── version.ts        ← /version.json polling for auto-reload
        ├── App.css / index.css
        ├── assets/
        │   └── shop-logo.ts  ← inlined SVG data URIs (light + dark)
        └── pages/
            ├── BuildPage.tsx     ← canvas + left rail + inspector
            ├── PreviewPage.tsx   ← iframe-isolated device-frame previews
            ├── TokensPage.tsx    ← admin: edit colors / type / spacing / radius
            └── CatalogPage.tsx   ← admin: edit components + variant_styles
```

## Local development

Requires Node 22+ and pnpm.

```bash
cd source
pnpm install
pnpm dev          # local dev server on http://localhost:5173
```

Local dev *does* hit production `quick.db` / `quick.fs` / `quick.id` because
those APIs are bound to the deployed origin via the Quick global. Edits made
locally to tokens or components persist in production. To avoid clobbering
production state while experimenting, use draft objects in the UI rather
than admin actions.

## Deploying

```bash
cd source
pnpm build         # outputs index.html + assets/index-XXXX.js + version.json to ..
cd ..

# Delete the old hashed JS bundle so the assets dir doesn't accumulate
# stale chunks. Find the previous hash in the previous commit's assets/.
rm -f assets/index-OLDHASH.js

git add -A
git commit -m "..."
git push origin main                 # tracks source changes
git push origin main:deploy          # triggers Quick deploy
```

The `main:deploy` push triggers Quick's deployment pipeline. The app polls
`/version.json` every 30s and auto-reloads when the build ID changes — no
manual hard-refresh needed.

### Push auth

Pushes from a personal machine use Quick's standard git credentials. Pushes
from a sandboxed agent require two extra HTTP headers:

```
Authorization: Bearer $RIVER_SESSION_JWT
On-Behalf-Of: <user-email>@shopify.com
```

Set them with `-c http.extraHeader=...` on the `git push` invocation.

## App structure

- **Build tab** (default): visual composer. Left rail = component library,
  centre = canvas (drag-and-drop reorder), right rail = inspector.
- **Tokens tab** (admin only): edit colors, typography roles, spacing,
  radius. Allowlist is `joe.letchford@shopify.com` for now.
- **Catalog tab** (admin only): edit components, params, templates,
  variant_styles, presets.

Auth is via `quick.id.waitForUser()`. Any `*@shopify.com` user can use the
Build tab; admin tabs require allowlist membership (`ADMIN_ALLOWLIST` in
`App.tsx`).

## Data model

- `tokens` — single row in `quick.db` keyed by `'singleton'` containing the
  full token registry (colors, typography, spacing, radius).
- `components` — N rows keyed by component id. Each is a `ComponentDef`
  with `params`, `template`, optional `variant_styles`, optional `presets`.
- `drafts` — currently a single in-memory draft per session (multi-draft
  is on the roadmap).

All seeded from `src/seed.ts` on first load; an on-load migration inserts
new seed colors/spacing/components and refreshes stored components when
the seed template/presets change.

See `CLAUDE.md` for deep architecture detail.
