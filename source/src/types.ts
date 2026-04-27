// Shop V3 Email Design System — types

export type TokenColors = Record<string, string>;

// One type role (e.g. "T1", "Body Large", "Eyebrow").
// All roles support all three weights at runtime; `default_weight` says which one
// the role renders as when no override is given. `letter_spacing_px` can be
// negative. `transform` and `decoration` capture role-specific styling like
// uppercase eyebrows or underlined link text.
export type TokenFontSize = {
  size_px: number;
  line_height_px: number;
  letter_spacing_px?: number;
  // Legacy single weight field — kept for back-compat reads. Newly written
  // tokens use default_weight; the migration on load fills both.
  weight?: number;
  default_weight?: 'regular' | 'medium' | 'bold';
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  decoration?: 'none' | 'underline';
};
export type TokenTypography = {
  font_family: string;
  weights: { regular: number; medium: number; bold: number };
  sizes: Record<string, TokenFontSize>;
};
// A spacing value can be a single number (legacy: same value on every
// viewport) or an object with explicit per-viewport values. The renderer
// picks based on its viewport context (default 'desktop'). When mobile is
// omitted it falls back to desktop. Templates can also force a specific
// viewport with {{spacing.X.desktop}} / {{spacing.X.mobile}}.
export type SpacingValue = number | { desktop: number; mobile?: number };
export type TokenSpacing = Record<string, SpacingValue>;
export type Tokens = {
  colors: TokenColors;
  typography: TokenTypography;
  spacing: TokenSpacing;
  radius_px: number;
  updated_at: string;
  updated_by: string;
};

export type ParamKind =
  | 'text'
  | 'textarea'
  | 'url'
  | 'color_token'
  | 'typography_token'
  | 'weight_token'
  | 'spacing_token'
  | 'image_url'
  | 'select'
  | 'boolean';

export type ParamDef = {
  key: string;
  label: string;
  kind: ParamKind;
  default?: string | boolean;
  required?: boolean;
  help?: string;
  options?: { value: string; label: string }[];
};

// Computed params: when a component has a `variant` (or any) select-style
// param, the param's value can map to a set of *computed* params that get
// injected into the rendering context. Lets one component template support
// multiple variants without conditionals — e.g. Button picks bg/color/border
// based on which variant was selected.
//
// Shape: variant_styles[paramKey][paramValue] = { computedParamKey: value }
// Example:
//   variant_styles: {
//     variant: {
//       primary:   { _bg: '#5433EB', _color: '#FFFFFF', _border: 'transparent' },
//       secondary: { _bg: '#121212', _color: '#FFFFFF', _border: 'transparent' },
//     }
//   }
export type VariantStyles = Record<string, Record<string, Record<string, string>>>;

// Presets: an optional list of pre-configured variants of the component, each
// shown as its own card in the left rail. Useful when a component has a
// dominant axis (e.g. Hero color White vs Purple) and CRM should pick at
// drop-time, not configure after.
export type ComponentPreset = {
  id: string;
  name: string;
  description?: string;
  param_overrides: Record<string, unknown>;
};

export type ComponentDef = {
  id: string;
  name: string;
  category: string;
  description?: string;
  params: ParamDef[];
  template: string;
  variant_styles?: VariantStyles;
  presets?: ComponentPreset[];
  preview_height_px?: number;
  updated_at: string;
  updated_by: string;
};

export type BlockInstance = {
  instance_id: string;
  component_id: string;
  params: Record<string, unknown>;
};

export type Draft = {
  id: string;
  name: string;
  blocks: BlockInstance[];
  updated_at: string;
};
