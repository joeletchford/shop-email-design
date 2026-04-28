// Template rendering for V3 email components.

import type { Tokens, ComponentDef, BlockInstance } from './types';

export type Viewport = 'desktop' | 'mobile';

function resolveToken(path: string, tokens: Tokens, params: Record<string, unknown>, viewport: Viewport): string | null {
  // Substitute @param.KEY in the path BEFORE splitting on dots, otherwise the
  // split breaks `@param.size` into ['@param', 'size'] and the substitution
  // never fires. After substitution the path is plain dot-separated.
  const substituted = path.replace(/@param\.([A-Za-z0-9_]+)/g, (_, key) => {
    const v = params[key];
    return v == null ? '' : String(v);
  });
  const parts = substituted.split('.');

  switch (parts[0]) {
    case 'color': {
      const v = parts[1];
      // Allow literal hex (#RRGGBB / #RGB / #RRGGBBAA) and CSS keyword
      // 'transparent' to pass through. Lets a component author pick a non-
      // token literal value (e.g. transparent backgrounds for hero variants)
      // without storing it as a token.
      if (v === 'transparent') return 'transparent';
      if (v && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6}|[0-9A-Fa-f]{8})$/.test(v)) {
        return v;
      }
      return tokens.colors[v] ?? null;
    }
    case 'spacing': {
      const v = tokens.spacing[parts[1]];
      if (v == null) return null;
      // Legacy: numeric value applies to every viewport.
      if (typeof v === 'number') return String(v);
      // Object value: optional third path part forces a viewport (.desktop /
      // .mobile). Otherwise pick based on the renderer's viewport context.
      const sub = parts[2];
      let px: number;
      if (sub === 'desktop') px = v.desktop;
      else if (sub === 'mobile') px = v.mobile ?? v.desktop;
      else px = viewport === 'mobile' ? (v.mobile ?? v.desktop) : v.desktop;
      return String(px);
    }
    case 'type': {
      const slug = parts[1];
      const field = parts[2];
      const spec = tokens.typography.sizes[slug];
      if (!spec) return null;
      if (field === 'size_px' || field === 'line_height_px') {
        return String(spec[field]);
      }
      if (field === 'letter_spacing_px') {
        return String(spec.letter_spacing_px ?? 0);
      }
      if (field === 'weight') {
        // Prefer `default_weight` (the canonical source) and only fall back to
        // the legacy numeric `weight` when no default_weight is set. Old data
        // in quick.db kept both fields after migration; reading default_weight
        // first ensures we honor the Figma default the role declares.
        if (spec.default_weight) {
          return String(tokens.typography.weights[spec.default_weight] ?? 400);
        }
        if (typeof spec.weight === 'number') return String(spec.weight);
        return '400';
      }
      if (field === 'transform') return spec.transform ?? 'none';
      if (field === 'decoration') return spec.decoration ?? 'none';
      return null;
    }
    case 'token': {
      const field = parts[1];
      if (field === 'font_family') return tokens.typography.font_family;
      if (field === 'radius_px') return String(tokens.radius_px);
      return null;
    }
    case 'weight': {
      const slug = parts[1] as 'regular' | 'medium' | 'bold';
      const w = tokens.typography.weights[slug];
      return typeof w === 'number' ? String(w) : null;
    }
    default:
      return null;
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function renderTemplate(
  template: string,
  params: Record<string, unknown>,
  tokens: Tokens,
  viewport: Viewport = 'desktop'
): string {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (_, expr) => {
    const trimmed = expr.trim();
    if (trimmed.startsWith('param.')) {
      const key = trimmed.slice('param.'.length);
      const v = params[key];
      return v == null ? '' : escapeHtml(String(v));
    }
    const resolved = resolveToken(trimmed, tokens, params, viewport);
    return resolved ?? '';
  });
}

export function renderBlock(
  instance: BlockInstance,
  components: ComponentDef[],
  tokens: Tokens,
  viewport: Viewport = 'desktop'
): string {
  const comp = components.find((c) => c.id === instance.component_id);
  if (!comp) return `<!-- missing component: ${instance.component_id} -->`;

  // Merge user params with the component def's defaults; treat empty string
  // as missing so token-kind params fall back to default rather than
  // resolving against an empty key.
  const mergedParams: Record<string, unknown> = {};
  for (const p of comp.params) {
    const v = instance.params[p.key];
    const missing = v === undefined || v === null || v === '';
    mergedParams[p.key] = missing ? p.default ?? '' : v;
  }
  // Also carry through extra instance params not declared in comp.params
  // (e.g. system params like color_variant / _mode injected by the renderer).
  for (const [k, v] of Object.entries(instance.params)) {
    if (!(k in mergedParams)) mergedParams[k] = v;
  }

  // Apply variant_styles: for any param whose value matches a variant_styles
  // entry, fold the computed params into mergedParams. Keeps templates simple
  // (no conditionals) for components that have several visual variants.
  if (comp.variant_styles) {
    for (const [paramKey, mapping] of Object.entries(comp.variant_styles)) {
      const value = String(mergedParams[paramKey] ?? '');
      const computed = mapping[value];
      if (computed) {
        for (const [k, v] of Object.entries(computed)) {
          mergedParams[k] = v;
        }
      }
    }
  }

  return renderTemplate(comp.template, mergedParams, tokens, viewport);
}

export function renderEmail(
  blocks: BlockInstance[],
  components: ComponentDef[],
  tokens: Tokens,
  viewport: Viewport = 'desktop'
): string {
  const body = blocks.map((b) => renderBlock(b, components, tokens, viewport)).join('\n');
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Email preview</title>
</head>
<body style="margin:0;padding:0;background-color:${tokens.colors.bg ?? '#ffffff'};font-family:${tokens.typography.font_family};">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${tokens.colors.bg ?? '#ffffff'};">
  <tr>
    <td align="center" style="padding:24px 0;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;background-color:${tokens.colors.bg_fill ?? '#ffffff'};">
        <tr>
          <td style="padding:32px 24px;">
            ${body}
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}
