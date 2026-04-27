import type { Tokens, ComponentDef } from './types';
import { LOGO_LIGHT_DATA_URI, LOGO_DARK_DATA_URI } from './assets/shop-logo';

export const SEED_TOKENS: Tokens = {
  colors: {
    text: '#000000',
    text_secondary: '#404040',
    text_tertiary: '#707070',
    text_placeholder: '#A6A6A6',
    text_inverse: '#FFFFFF',
    text_inverse_secondary: '#C4C4C4',
    text_brand: '#5433EB',
    text_brand_secondary: '#9C83F8',
    text_success: '#004839',
    text_success_secondary: '#008552',
    text_success_tertiary: '#BAEBCB',
    text_critical: '#D92A0F',
    text_caution: '#832711',
    bg: '#FCFCFC',
    bg_fill: '#FFFFFF',
    bg_fill_secondary: '#F2F4F5',
    bg_brand: '#5433EB',
    bg_fill_brand_secondary: '#DBD1FF',
    bg_fill_inverse: '#121212',
    bg_fill_critical: '#D92A0F',
    bg_fill_success: '#008552',
    border: '#E5E5E5',
    border_secondary: '#F1F3F4',
    border_tertiary: '#F5F5F5',
    border_brand: '#5433EB',
    border_brand_secondary: '#DBD1FF',
    border_critical: '#D92A0F',
  },
  typography: {
    font_family: "'Helvetica Neue', Helvetica, Arial, sans-serif",
    weights: { regular: 400, medium: 500, bold: 700 },
    // Sourced from the Shop email Figma "Text Styles" frame.
    // Every role supports regular / medium / bold; default_weight is what the role
    // renders as without an explicit override.
    sizes: {
      dsp:                { size_px: 56, line_height_px: 60, letter_spacing_px: -1.5, default_weight: 'medium' },
      t1:                 { size_px: 44, line_height_px: 48, letter_spacing_px: -1,   default_weight: 'medium' },
      t2:                 { size_px: 36, line_height_px: 40, letter_spacing_px: -0.5, default_weight: 'medium' },
      t3:                 { size_px: 30, line_height_px: 36, letter_spacing_px: 0,    default_weight: 'medium' },
      t4:                 { size_px: 24, line_height_px: 28, letter_spacing_px: 0,    default_weight: 'bold' },
      t5:                 { size_px: 22, line_height_px: 28, letter_spacing_px: 0,    default_weight: 'bold' },
      eyebrow:            { size_px: 16, line_height_px: 20, letter_spacing_px: 1.5,  default_weight: 'bold', transform: 'uppercase' },
      body_large:         { size_px: 18, line_height_px: 28, letter_spacing_px: 0.15, default_weight: 'medium' },
      body_regular:       { size_px: 16, line_height_px: 24, letter_spacing_px: 0.15, default_weight: 'medium' },
      body_small:         { size_px: 14, line_height_px: 20, letter_spacing_px: 0.15, default_weight: 'medium' },
      body_legal:         { size_px: 12, line_height_px: 16, letter_spacing_px: 0.15, default_weight: 'regular' },
      body_link_large:    { size_px: 18, line_height_px: 28, letter_spacing_px: 0.15, default_weight: 'medium', decoration: 'underline' },
      body_link_regular:  { size_px: 16, line_height_px: 24, letter_spacing_px: 0.15, default_weight: 'medium', decoration: 'underline' },
      body_link_small:    { size_px: 14, line_height_px: 20, letter_spacing_px: 0.15, default_weight: 'medium', decoration: 'underline' },
      button:             { size_px: 16, line_height_px: 20, letter_spacing_px: 0.15, default_weight: 'medium' },
      button_link:        { size_px: 16, line_height_px: 20, letter_spacing_px: 0.15, default_weight: 'medium', decoration: 'underline' },
    },
  },
  spacing: {
    // Generic numeric scale — same value across all viewports.
    v0: 0, v4: 4, v8: 8, v12: 12, v16: 16, v24: 24, v32: 32, v40: 40, v64: 64, v80: 80,
    // Responsive semantic tokens. The renderer picks desktop or mobile based
    // on its viewport context (driven by the device toggle on the Build page).
    // Components reference these by purpose, not raw value, so spacing stays
    // consistent and any breakpoint change happens in one place.
    section_padding_v: { desktop: 32, mobile: 24 }, // 32 desktop, 24 mobile
    section_padding_h: { desktop: 24, mobile: 16 }, // 24 desktop, 16 mobile
    section_radius:    { desktop: 28, mobile: 20 }, // (Figma: 28 desktop, 20 mobile)
  },
  radius_px: 28,
  updated_at: new Date().toISOString(),
  updated_by: 'seed',
};

function mk(c: Omit<ComponentDef, 'updated_at' | 'updated_by'>): ComponentDef {
  return { ...c, updated_at: new Date().toISOString(), updated_by: 'seed' };
}

// Reused options array for any per-block padding param. Kept compact — only
// values from the spacing scale, plus 0 for "no padding".
const SPACING_OPTIONS = [
  { value: 'v0', label: '0px' },
  { value: 'v4', label: '4px' },
  { value: 'v8', label: '8px' },
  { value: 'v12', label: '12px' },
  { value: 'v16', label: '16px' },
  { value: 'v24', label: '24px' },
  { value: 'v32', label: '32px' },
  { value: 'v40', label: '40px' },
  { value: 'v64', label: '64px' },
  { value: 'v80', label: '80px' },
];

export const SEED_COMPONENTS: ComponentDef[] = [
  mk({
    id: 'heading',
    name: 'Heading',
    category: 'Content',
    description: 'Headline using any token type role.',
    params: [
      { key: 'text', label: 'Text', kind: 'text', default: 'Your headline goes here', required: true },
      { key: 'size', label: 'Size', kind: 'typography_token', default: 't2', options: [
        { value: 'dsp', label: 'Display (56px)' }, { value: 't1', label: 'T1 (44px)' },
        { value: 't2', label: 'T2 (36px)' }, { value: 't3', label: 'T3 (30px)' },
        { value: 't4', label: 'T4 (24px)' }, { value: 't5', label: 'T5 (22px)' },
      ]},
      { key: 'weight', label: 'Weight', kind: 'weight_token', default: 'medium' },
      { key: 'color', label: 'Color', kind: 'color_token', default: 'text' },
      { key: 'align', label: 'Align', kind: 'select', default: 'left', options: [
        { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
      ]},
      { key: 'padding_top', label: 'Padding above', kind: 'spacing_token', default: 'v0', options: SPACING_OPTIONS },
      { key: 'padding_bottom', label: 'Padding below', kind: 'spacing_token', default: 'v0', options: SPACING_OPTIONS },
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding-top:{{spacing.@param.padding_top}}px;padding-bottom:{{spacing.@param.padding_bottom}}px;text-align:{{param.align}};font-family:{{token.font_family}};font-size:{{type.@param.size.size_px}}px;line-height:{{type.@param.size.line_height_px}}px;font-weight:{{weight.@param.weight}};letter-spacing:{{type.@param.size.letter_spacing_px}}px;text-transform:{{type.@param.size.transform}};text-decoration:{{type.@param.size.decoration}};color:{{color.@param.color}};">{{param.text}}</td></tr>
</table>`,
  }),
  mk({
    id: 'body-text',
    name: 'Body Text',
    category: 'Content',
    description: 'Paragraph of body copy.',
    params: [
      { key: 'text', label: 'Text', kind: 'textarea', default: 'Write your email body here.', required: true },
      { key: 'size', label: 'Size', kind: 'typography_token', default: 'body_regular', options: [
        { value: 'body_large', label: 'Body Large (18px)' }, { value: 'body_regular', label: 'Body Regular (16px)' },
        { value: 'body_small', label: 'Body Small (14px)' }, { value: 'body_legal', label: 'Body Legal (12px)' },
      ]},
      { key: 'weight', label: 'Weight', kind: 'weight_token', default: 'medium' },
      { key: 'color', label: 'Color', kind: 'color_token', default: 'text_secondary' },
      { key: 'align', label: 'Align', kind: 'select', default: 'left', options: [
        { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' },
      ]},
      { key: 'padding_top', label: 'Padding above', kind: 'spacing_token', default: 'v0', options: SPACING_OPTIONS },
      { key: 'padding_bottom', label: 'Padding below', kind: 'spacing_token', default: 'v0', options: SPACING_OPTIONS },
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="padding-top:{{spacing.@param.padding_top}}px;padding-bottom:{{spacing.@param.padding_bottom}}px;text-align:{{param.align}};font-family:{{token.font_family}};font-size:{{type.@param.size.size_px}}px;line-height:{{type.@param.size.line_height_px}}px;font-weight:{{weight.@param.weight}};letter-spacing:{{type.@param.size.letter_spacing_px}}px;text-transform:{{type.@param.size.transform}};text-decoration:{{type.@param.size.decoration}};color:{{color.@param.color}};">{{param.text}}</td></tr>
</table>`,
  }),
  mk({
    id: 'button',
    name: 'Button',
    category: 'CTA',
    description: 'Pill button with five variants matching the Figma library. Full-width on mobile, intrinsic on desktop.',
    params: [
      { key: 'label', label: 'Label', kind: 'text', default: 'Shop now', required: true },
      { key: 'url', label: 'URL', kind: 'url', default: 'https://shop.app', required: true },
      {
        key: 'variant',
        label: 'Variant',
        kind: 'select',
        default: 'primary',
        options: [
          { value: 'primary', label: 'Primary (brand)' },
          { value: 'secondary', label: 'Secondary (black)' },
          { value: 'tertiary', label: 'Tertiary (subtle)' },
          { value: 'outline', label: 'Outline' },
          { value: 'link', label: 'Link (no background)' },
        ],
      },
      { key: 'align', label: 'Align', kind: 'select', default: 'center', options: [
        { value: 'left', label: 'Left' }, { value: 'center', label: 'Center' }, { value: 'right', label: 'Right' },
      ]},
      { key: 'padding_top', label: 'Padding above', kind: 'spacing_token', default: 'v16', options: SPACING_OPTIONS },
      { key: 'padding_bottom', label: 'Padding below', kind: 'spacing_token', default: 'v16', options: SPACING_OPTIONS },
    ],
    // variant_styles inject _bg / _color / _border / _border_color into the
    // params at render time, based on which variant was chosen.
    // rgba colors flattened against #FFFFFF for email-client safety.
    variant_styles: {
      variant: {
        primary:   { _bg: '#5433EB', _color: '#FFFFFF', _border_style: 'none', _border_color: 'transparent' },
        secondary: { _bg: '#121212', _color: '#FFFFFF', _border_style: 'none', _border_color: 'transparent' },
        tertiary:  { _bg: '#E6E6E6', _color: '#000000', _border_style: 'none', _border_color: 'transparent' },
        outline:   { _bg: '#FFFFFF', _color: '#000000', _border_style: 'solid', _border_color: '#EEF1F2' },
        link:      { _bg: 'transparent', _color: '#000000', _border_style: 'none', _border_color: 'transparent' },
      },
    },
    // 52px tall (16px vertical padding + 20px line-height); 999px pill radius.
    // Mobile-first 100% width; on ≥560px viewport, shrink to intrinsic but cap at 360px (matches Figma).
    // 100% width up to 360px on every viewport — mobile fills its container,
    // desktop caps at 360 instead of shrinking to fit the label. Align on the
    // <td> determines whether the 360 sits left / center / right.
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="{{param.align}}" style="padding-top:{{spacing.@param.padding_top}}px;padding-bottom:{{spacing.@param.padding_bottom}}px;"><a href="{{param.url}}" target="_blank" style="display:inline-block;width:100%;max-width:360px;text-align:center;box-sizing:border-box;padding:16px 24px;background-color:{{param._bg}};color:{{param._color}};text-decoration:none;border-radius:999px;border:1px {{param._border_style}} {{param._border_color}};font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;">{{param.label}}</a></td></tr>
</table>`,
  }),
  mk({
    id: 'image',
    name: 'Image',
    category: 'Media',
    description: 'Full-width responsive image.',
    params: [
      { key: 'src', label: 'Image URL', kind: 'image_url', default: 'https://placehold.co/1200x600', required: true },
      { key: 'alt', label: 'Alt text', kind: 'text', default: 'Image' },
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td><img src="{{param.src}}" alt="{{param.alt}}" width="600" style="display:block;width:100%;max-width:600px;height:auto;border:0;border-radius:{{token.radius_px}}px;"/></td></tr>
</table>`,
  }),
  mk({
    id: 'spacer',
    name: 'Spacer',
    category: 'Layout',
    description: 'Vertical whitespace from the spacing scale.',
    params: [
      { key: 'size', label: 'Size', kind: 'spacing_token', default: 'v24', options: [
        { value: 'v4', label: '4px' }, { value: 'v8', label: '8px' }, { value: 'v12', label: '12px' },
        { value: 'v16', label: '16px' }, { value: 'v24', label: '24px' }, { value: 'v32', label: '32px' },
        { value: 'v40', label: '40px' }, { value: 'v64', label: '64px' }, { value: 'v80', label: '80px' },
      ]},
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="height:{{spacing.@param.size}}px;line-height:{{spacing.@param.size}}px;font-size:1px;">&nbsp;</td></tr>
</table>`,
  }),
  mk({
    id: 'divider',
    name: 'Divider',
    category: 'Layout',
    description: '1px horizontal rule.',
    params: [
      { key: 'color', label: 'Color', kind: 'color_token', default: 'border' },
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="border-top:1px solid {{color.@param.color}};height:1px;line-height:1px;font-size:1px;">&nbsp;</td></tr>
</table>`,
  }),
  mk({
    id: 'hero',
    name: 'Hero',
    category: 'Hero',
    description: 'Hero block with headline + optional subhead, button, image, and after-image content. Color (White / Purple) and Application (Marketing / Transactional) variants control colors and alignment.',
    params: [
      // ----- Required: headline -----
      { key: 'headline_text', label: 'Headline', kind: 'text', default: 'Lorem ipsum dolor sit amet consectetur' },
      {
        key: 'headline_size', label: 'Headline size', kind: 'typography_token', default: 'dsp',
        options: [
          { value: 'dsp', label: 'Display (56px)' },
          { value: 't1',  label: 'T1 (44px)' },
          { value: 't2',  label: 'T2 (36px)' },
          { value: 't3',  label: 'T3 (30px)' },
        ],
      },

      // ----- Subhead (above image) -----
      { key: 'show_subhead', label: 'Show subhead', kind: 'boolean', default: true },
      { key: 'subhead_text', label: 'Subhead', kind: 'textarea', default: 'Lorem ipsum dolor sit amet consectetur' },

      // ----- Middle button (above image) -----
      { key: 'show_button_middle', label: 'Show middle button', kind: 'boolean', default: false },
      { key: 'button_middle_label', label: 'Middle button label', kind: 'text', default: 'Button' },
      { key: 'button_middle_url',   label: 'Middle button URL',   kind: 'url',  default: 'https://shop.app' },

      // ----- Image -----
      { key: 'show_image', label: 'Show image', kind: 'boolean', default: true },
      { key: 'image_src',  label: 'Image',     kind: 'image_url', default: 'https://placehold.co/1200x1200' },
      { key: 'image_alt',  label: 'Image alt', kind: 'text',      default: '' },

      // ----- Bottom section (after image) -----
      // Each toggle controls its own element. The 40px before-bottom-section
      // gap auto-hides when both bottom toggles are off.
      { key: 'show_subhead_bottom', label: 'Show bottom subhead', kind: 'boolean', default: false },
      { key: 'subhead_bottom_text', label: 'Bottom subhead', kind: 'textarea', default: 'Lorem ipsum dolor sit amet consectetur' },
      { key: 'show_button_bottom', label: 'Show bottom button', kind: 'boolean', default: false },
      { key: 'button_bottom_label', label: 'Bottom button label', kind: 'text', default: 'Button' },
      { key: 'button_bottom_url',   label: 'Bottom button URL',   kind: 'url',  default: 'https://shop.app' },

      // ----- Color & application variants -----
      {
        key: 'color_variant', label: 'Color variant', kind: 'select', default: 'White',
        options: [
          { value: 'White',  label: 'White (light)' },
          { value: 'Purple', label: 'Purple (brand)' },
        ],
      },
      {
        key: 'application', label: 'Application', kind: 'select', default: 'Marketing',
        options: [
          { value: 'Marketing',     label: 'Marketing (centered)' },
          { value: 'Transactional', label: 'Transactional (left-aligned)' },
        ],
      },
    ],
    // Hero v2 — matches the Figma spec.
    // Image gets a 28px radius on desktop and 20px on mobile (media query override).
    // Color and application variants drive container bg, padding, text colors, alignment, button styles.
    // Subhead colors:
    //   White: text_secondary (#404040)
    //   Purple: text_inverse_secondary (#C4C4C4 — the new token)
    template: `<style>
@media (max-width:560px) {
  .sed-hero-image { border-radius: 20px !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:{{color.@param._container_bg_slug}};padding:{{param._container_padding}};border-radius:{{token.radius_px}}px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr><td align="{{param._text_align}}" style="text-align:{{param._text_align}};font-family:{{token.font_family}};font-size:{{type.@param.headline_size.size_px}}px;line-height:{{type.@param.headline_size.line_height_px}}px;font-weight:{{type.@param.headline_size.weight}};letter-spacing:{{type.@param.headline_size.letter_spacing_px}}px;color:{{color.@param._headline_color_slug}};">{{param.headline_text}}</td></tr>
    <tr style="display:{{param._subhead_display}};"><td style="height:12px;line-height:12px;font-size:1px;">&nbsp;</td></tr>
    <tr style="display:{{param._subhead_display}};"><td align="{{param._text_align}}" style="text-align:{{param._text_align}};font-family:{{token.font_family}};font-size:{{type.t5.size_px}}px;line-height:{{type.t5.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.t5.letter_spacing_px}}px;color:{{color.@param._subhead_color_slug}};">{{param.subhead_text}}</td></tr>
    <tr style="display:{{param._button_middle_display}};"><td style="height:24px;line-height:24px;font-size:1px;">&nbsp;</td></tr>
    <tr style="display:{{param._button_middle_display}};"><td align="{{param._button_align}}"><a href="{{param.button_middle_url}}" target="_blank" style="display:inline-block;width:100%;max-width:360px;text-align:center;box-sizing:border-box;padding:16px 24px;background-color:{{color.@param._btn_bg_slug}};color:{{color.@param._btn_color_slug}};text-decoration:none;border-radius:999px;font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;">{{param.button_middle_label}}</a></td></tr>
    <tr style="display:{{param._image_display}};"><td style="height:40px;line-height:40px;font-size:1px;">&nbsp;</td></tr>
    <tr style="display:{{param._image_display}};"><td><img class="sed-hero-image" src="{{param.image_src}}" alt="{{param.image_alt}}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:28px;"></td></tr>
    <tr style="display:{{param._bottom_section_display}};"><td style="height:40px;line-height:40px;font-size:1px;">&nbsp;</td></tr>
    <tr style="display:{{param._subhead_bottom_display}};"><td align="{{param._text_align}}" style="text-align:{{param._text_align}};font-family:{{token.font_family}};font-size:{{type.t5.size_px}}px;line-height:{{type.t5.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.t5.letter_spacing_px}}px;color:{{color.@param._subhead_color_slug}};">{{param.subhead_bottom_text}}</td></tr>
    <tr style="display:{{param._button_bottom_display}};"><td style="height:24px;line-height:24px;font-size:1px;">&nbsp;</td></tr>
    <tr style="display:{{param._button_bottom_display}};"><td align="{{param._button_align}}"><a href="{{param.button_bottom_url}}" target="_blank" style="display:inline-block;width:100%;max-width:360px;text-align:center;box-sizing:border-box;padding:16px 24px;background-color:{{color.@param._btn_bg_slug}};color:{{color.@param._btn_color_slug}};text-decoration:none;border-radius:999px;font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;">{{param.button_bottom_label}}</a></td></tr>
  </table>
</td></tr>
</table>`,
    // Variant style ordering matters — the renderer iterates this object in
    // insertion order and later writes overwrite earlier ones. Order:
    //   1. show/hide toggles
    //   2. application (alignment for White variant)
    //   3. color_variant LAST — Purple overrides force display:none on
    //      image/bottom-section and force center alignment, regardless of
    //      what the user toggled.
    variant_styles: {
      // ----- Show/hide booleans -----
      show_subhead:       { 'true': { _subhead_display: 'table-row' },       'false': { _subhead_display: 'none' } },
      show_button_middle: { 'true': { _button_middle_display: 'table-row' }, 'false': { _button_middle_display: 'none' } },
      show_image:         { 'true': { _image_display: 'table-row' },         'false': { _image_display: 'none' } },
      // _bottom_section_display = OR of the two children. button_bottom's
      // 'false' branch is silent so subhead_bottom's value wins by default.
      show_subhead_bottom: {
        'true':  { _subhead_bottom_display: 'table-row', _bottom_section_display: 'table-row' },
        'false': { _subhead_bottom_display: 'none',      _bottom_section_display: 'none' },
      },
      show_button_bottom: {
        'true':  { _button_bottom_display: 'table-row', _bottom_section_display: 'table-row' },
        'false': { _button_bottom_display: 'none' },
      },
      // ----- Application: alignment (White variant only; Purple overrides below) -----
      application: {
        Marketing:     { _text_align: 'center', _button_align: 'center' },
        Transactional: { _text_align: 'left',   _button_align: 'left' },
      },
      // ----- Color variant (LAST) — drives bg/padding/text colors and
      // Purple-specific layout overrides. -----
      color_variant: {
        White: {
          _container_bg_slug: 'transparent',             // no fill — inherits whatever's behind
          _container_padding: '0 24px 32px 24px',
          _headline_color_slug: 'text',                  // #000000
          _subhead_color_slug: 'text_secondary',         // #404040
          _btn_bg_slug: 'bg_brand',                      // #5433EB
          _btn_color_slug: 'text_inverse',               // #FFFFFF
        },
        Purple: {
          _container_bg_slug: 'bg_brand',                // #5433EB
          _container_padding: '24px 24px 24px 24px',
          _headline_color_slug: 'text_inverse',          // #FFFFFF
          _subhead_color_slug: 'text_inverse_secondary', // #C4C4C4
          _btn_bg_slug: 'bg_fill',                       // #FFFFFF
          _btn_color_slug: 'text',                       // #000000
          // Purple is heading + button only, always centered.
          _text_align: 'center',
          _button_align: 'center',
          _image_display: 'none',
          _subhead_bottom_display: 'none',
          _button_bottom_display: 'none',
          _bottom_section_display: 'none',
        },
      },
    },
    // Two cards in the left rail, one per color variant. Replaces the single
    // Hero card so CRM picks the variant when dropping rather than configuring
    // after.
    presets: [
      {
        id: 'hero-white',
        name: 'Hero — White',
        description: 'Heading + image + buttons on a transparent background.',
        param_overrides: { color_variant: 'White' },
      },
      {
        id: 'hero-purple',
        name: 'Hero — Purple',
        description: 'Heading + button only, on a brand-purple background. Always centered.',
        param_overrides: { color_variant: 'Purple', show_image: false },
      },
    ],
  }),
  mk({
    id: 'offers-shelf',
    name: 'Offers shelf',
    category: 'Product',
    description: 'Centered headline + 3×2 merchant card grid + bottom CTA button.',
    params: [
      // ----- Header -----
      { key: 'headline_text', label: 'Headline', kind: 'text', default: 'Lorem ipsum dolor sit amet consectetur' },
      { key: 'show_subhead', label: 'Show subhead', kind: 'boolean', default: true },
      { key: 'subhead_text', label: 'Subhead', kind: 'text', default: 'Lorem ipsum dolor sit amet consectetur' },
      // Header layout: when show_cta is on the header switches to left-aligned
      // so the arrow on the right makes visual sense. When off, header is
      // centered (matches the Figma reference).
      { key: 'show_cta', label: 'Show arrow CTA', kind: 'boolean', default: false },
      { key: 'cta_url', label: 'Arrow CTA URL', kind: 'url', default: 'https://shop.app' },
      // ----- Product cards (1-6) — fixed 6, always shown.
      // Each card has 3 text rows: merchant name, product name, price. -----
      { key: 'product_1_merchant', label: 'Product 1 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_1_name',     label: 'Product 1 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_1_price',    label: 'Product 1 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_1_image_url',label: 'Product 1 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_1_url',      label: 'Product 1 — URL',      kind: 'url',  default: 'https://shop.app' },
      { key: 'product_2_merchant', label: 'Product 2 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_2_name',     label: 'Product 2 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_2_price',    label: 'Product 2 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_2_image_url',label: 'Product 2 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_2_url',      label: 'Product 2 — URL',      kind: 'url',  default: 'https://shop.app' },
      { key: 'product_3_merchant', label: 'Product 3 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_3_name',     label: 'Product 3 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_3_price',    label: 'Product 3 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_3_image_url',label: 'Product 3 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_3_url',      label: 'Product 3 — URL',      kind: 'url',  default: 'https://shop.app' },
      { key: 'product_4_merchant', label: 'Product 4 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_4_name',     label: 'Product 4 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_4_price',    label: 'Product 4 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_4_image_url',label: 'Product 4 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_4_url',      label: 'Product 4 — URL',      kind: 'url',  default: 'https://shop.app' },
      { key: 'product_5_merchant', label: 'Product 5 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_5_name',     label: 'Product 5 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_5_price',    label: 'Product 5 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_5_image_url',label: 'Product 5 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_5_url',      label: 'Product 5 — URL',      kind: 'url',  default: 'https://shop.app' },
      { key: 'product_6_merchant', label: 'Product 6 — Merchant', kind: 'text', default: 'Merchant Name' },
      { key: 'product_6_name',     label: 'Product 6 — Name',     kind: 'text', default: 'Product Name' },
      { key: 'product_6_price',    label: 'Product 6 — Price',    kind: 'text', default: '$50.00' },
      { key: 'product_6_image_url',label: 'Product 6 — Image',    kind: 'image_url', default: 'https://placehold.co/400x400' },
      { key: 'product_6_url',      label: 'Product 6 — URL',      kind: 'url',  default: 'https://shop.app' },
      // ----- Bottom button -----
      { key: 'show_button',  label: 'Show button', kind: 'boolean', default: true },
      { key: 'button_label', label: 'Button label', kind: 'text', default: 'Button' },
      { key: 'button_url',   label: 'Button URL',   kind: 'url',  default: 'https://shop.app' },
    ],
    // Card grid uses inline-block at 33.33% (desktop) / 50% (mobile) inside a
    // font-size:0 wrapper. Negative horizontal margin on the wrapper aligns
    // outer card edges with the container's content edge. Outlook (Word
    // engine) doesn't render display:inline-block reliably and will fall back
    // to vertically stacked cards, which is acceptable.
    //
    // Container padding/radius come from responsive spacing tokens
    // (section_padding_v / section_padding_h / section_radius) so the values
    // adapt automatically to the renderer's viewport context. The exported
    // HTML still emits a media query for real email clients.
    template: `<style>
@media screen and (max-width:560px) {
  .sed-shelf-container { padding: {{spacing.section_padding_v.mobile}}px {{spacing.section_padding_h.mobile}}px !important; border-radius: {{spacing.section_radius.mobile}}px !important; }
  .sed-shelf-cell { width: 50% !important; }
  .sed-shelf-button { width: 100% !important; max-width: 100% !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td align="center" class="sed-shelf-container" style="padding:{{spacing.section_padding_v}}px {{spacing.section_padding_h}}px;border-radius:{{spacing.section_radius}}px;">
  <!-- Header. Two-cell table: left cell has headline+subhead, right cell
       has the optional arrow CTA. text-align flips to center when the arrow
       is off (variant_styles). -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td valign="top" align="{{param._header_align}}" style="vertical-align:top;text-align:{{param._header_align}};">
        <div style="font-family:{{token.font_family}};font-size:{{type.t3.size_px}}px;line-height:{{type.t3.line_height_px}}px;font-weight:{{type.t3.weight}};letter-spacing:{{type.t3.letter_spacing_px}}px;color:{{color.text}};">{{param.headline_text}}</div>
        <div style="display:{{param._subhead_display}};font-family:{{token.font_family}};font-size:{{type.body_regular.size_px}}px;line-height:{{type.body_regular.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_regular.letter_spacing_px}}px;color:{{color.text_secondary}};padding-top:4px;">{{param.subhead_text}}</div>
      </td>
      <td width="36" valign="top" style="display:{{param._cta_display}};vertical-align:top;text-align:right;padding-left:12px;width:36px;">
        <a href="{{param.cta_url}}" target="_blank" style="display:inline-block;width:36px;height:36px;line-height:36px;text-align:center;text-decoration:none;color:{{color.text}};background-color:{{color.bg_fill_secondary}};border-radius:9999px;font-size:18px;font-family:{{token.font_family}};">→</a>
      </td>
    </tr>
  </table>
  <!-- 24px gap to grid -->
  <div style="height:24px;line-height:24px;font-size:1px;">&nbsp;</div>
  <!-- 3-up desktop / 2-up mobile grid via inline-block cells.
       Negative margin on the wrapper offsets the cells' inner padding so the
       outer card edges align with the container's content edge. -->
  <div style="margin:0 -8px;font-size:0;line-height:0;">
    <div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_1_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_1_image_url}}" alt="{{param.product_1_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_1_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_1_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_1_price}}</div></a></div><div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_2_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_2_image_url}}" alt="{{param.product_2_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_2_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_2_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_2_price}}</div></a></div><div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_3_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_3_image_url}}" alt="{{param.product_3_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_3_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_3_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_3_price}}</div></a></div><div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_4_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_4_image_url}}" alt="{{param.product_4_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_4_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_4_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_4_price}}</div></a></div><div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_5_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_5_image_url}}" alt="{{param.product_5_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_5_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_5_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_5_price}}</div></a></div><div class="sed-shelf-cell" style="display:inline-block;width:33.33%;vertical-align:top;box-sizing:border-box;padding:0 8px 16px 8px;text-align:left;"><a href="{{param.product_6_url}}" target="_blank" style="text-decoration:none;color:{{color.text}};display:block;"><img src="{{param.product_6_image_url}}" alt="{{param.product_6_name}}" style="display:block;width:100%;height:auto;border:1px solid #E6EAED;border-radius:20px;"><div style="height:8px;line-height:8px;font-size:1px;">&nbsp;</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_6_merchant}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_6_name}}</div><div style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.body_legal.letter_spacing_px}}px;color:{{color.text}};">{{param.product_6_price}}</div></a></div>
  </div>
  <!-- Bottom button (optional) — 24px gap then primary pill, max 360px desktop, full-width mobile. -->
  <div style="display:{{param._button_display}};height:24px;line-height:24px;font-size:1px;">&nbsp;</div>
  <div style="display:{{param._button_display}};text-align:center;"><a class="sed-shelf-button" href="{{param.button_url}}" target="_blank" style="display:inline-block;width:100%;max-width:360px;text-align:center;box-sizing:border-box;padding:16px 24px;background-color:{{color.bg_brand}};color:{{color.text_inverse}};text-decoration:none;border-radius:999px;font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;">{{param.button_label}}</a></div>
</td></tr>
</table>`,
    variant_styles: {
      show_subhead: { 'true': { _subhead_display: 'block' }, 'false': { _subhead_display: 'none' } },
      show_button:  { 'true': { _button_display: 'block' },  'false': { _button_display: 'none' } },
      // Arrow on -> left-align header (so the right-aligned arrow makes
      // visual sense). Arrow off -> center header (Figma reference).
      show_cta: {
        'true':  { _cta_display: 'table-cell', _header_align: 'left' },
        'false': { _cta_display: 'none',       _header_align: 'center' },
      },
    },
  }),
  mk({
    id: 'section-start',
    name: 'Section start',
    category: 'Layout',
    description: 'Opens a styled section. Drop blocks below it; close with "Section end".',
    params: [
      { key: 'bg', label: 'Background', kind: 'color_token', default: 'bg_fill' },
      { key: 'padding_top', label: 'Padding top', kind: 'spacing_token', default: 'v32', options: SPACING_OPTIONS },
      { key: 'padding_bottom', label: 'Padding bottom', kind: 'spacing_token', default: 'v32', options: SPACING_OPTIONS },
      { key: 'padding_x', label: 'Padding left & right', kind: 'spacing_token', default: 'v24', options: SPACING_OPTIONS },
    ],
    // Opens a wrapper table-cell. Section end closes it. Blocks in between
    // sit in the cell and inherit the bg + padding.
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:{{color.@param.bg}};">
<tr><td style="padding:{{spacing.@param.padding_top}}px {{spacing.@param.padding_x}}px {{spacing.@param.padding_bottom}}px {{spacing.@param.padding_x}}px;">
`,
  }),
  mk({
    id: 'section-end',
    name: 'Section end',
    category: 'Layout',
    description: 'Closes the most-recently-opened section.',
    params: [],
    template: `</td></tr>
</table>
`,
  }),
  mk({
    id: 'logo',
    name: 'Shop logo',
    category: 'Brand',
    description: 'Centered Shop wordmark with branded padding. Auto mode swaps light/dark via prefers-color-scheme on supporting clients. Mobile padding tightens automatically.',
    params: [
      {
        key: 'mode',
        label: 'Mode',
        kind: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto (light / dark by client)' },
          { value: 'light', label: 'Light only' },
          { value: 'dark', label: 'Dark only' },
        ],
      },
      {
        key: 'width_px',
        label: 'Width',
        kind: 'select',
        default: '68',
        options: [
          { value: '68', label: '68px (1×, default)' },
          { value: '102', label: '102px (1.5×)' },
          { value: '136', label: '136px (2×)' },
          { value: '170', label: '170px (2.5×)' },
          { value: '204', label: '204px (3×)' },
        ],
      },
    ],
    // Padding 24px on desktop, 16/16/20 on mobile (top/sides/bottom) per Figma.
    // Logo always centered. Auto mode emits both <img>s with a prefers-
    // color-scheme media query so dark-mode-capable clients (Apple Mail,
    // modern Gmail) flip automatically; Outlook ignores it and shows light.
    template: `<style>
@media (prefers-color-scheme: dark) {
  .sed-logo-light { display: none !important; }
  .sed-logo-dark { display: block !important; }
}
@media (max-width:560px) {
  .sed-logo-cell { padding: 16px 16px 20px !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="sed-logo-cell" align="center" style="padding:24px;font-size:0;line-height:0;text-align:center;">
  <img class="sed-logo-light" src="${LOGO_LIGHT_DATA_URI}" alt="Shop" width="{{param.width_px}}" height="{{param._height}}" style="display:{{param._show_light}};border:0;width:{{param.width_px}}px;height:{{param._height}}px;margin:0 auto;">
  <img class="sed-logo-dark" src="${LOGO_DARK_DATA_URI}" alt="Shop" width="{{param.width_px}}" height="{{param._height}}" style="display:{{param._show_dark}};border:0;width:{{param.width_px}}px;height:{{param._height}}px;margin:0 auto;">
</td></tr>
</table>`,
    variant_styles: {
      mode: {
        auto:  { _show_light: 'block', _show_dark: 'none' },
        light: { _show_light: 'block', _show_dark: 'none' },
        dark:  { _show_light: 'none',  _show_dark: 'block' },
      },
      width_px: {
        '68':  { _height: '30' },
        '102': { _height: '45' },
        '136': { _height: '60' },
        '170': { _height: '75' },
        '204': { _height: '90' },
      },
    },
  }),
];
