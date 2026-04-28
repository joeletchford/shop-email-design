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
    v0: 0, v4: 4, v8: 8, v12: 12, v16: 16, v24: 24, v32: 32, v40: 40, v64: 64, v80: 80,
    section_padding_v: { desktop: 32, mobile: 24 },
    section_padding_h: { desktop: 24, mobile: 16 },
    section_radius:    { desktop: 28, mobile: 20 },
  },
  radius_px: 28,
  updated_at: new Date().toISOString(),
  updated_by: 'seed',
};

function mk(c: Omit<ComponentDef, 'updated_at' | 'updated_by'>): ComponentDef {
  return { ...c, updated_at: new Date().toISOString(), updated_by: 'seed' };
}

export const SEED_COMPONENTS: ComponentDef[] = [
  mk({
    id: 'logo',
    name: 'Shop logo',
    category: 'Brand',
    description: 'Shop wordmark with branded padding. Left or center aligned. Auto mode swaps light/dark via prefers-color-scheme on supporting clients. Mobile padding tightens automatically.',
    params: [
      {
        key: 'align',
        label: 'Align',
        kind: 'select',
        default: 'center',
        options: [
          { value: 'center', label: 'Center' },
          { value: 'left', label: 'Left' },
        ],
      },
      {
        key: '_mode',
        label: 'Mode',
        kind: 'select',
        default: 'auto',
        options: [
          { value: 'auto', label: 'Auto' },
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' },
        ],
      },
    ],
    template: `<style>
@media (prefers-color-scheme: dark) {
  .sed-logo-light { display: none !important; }
  .sed-logo-dark { display: block !important; }
}
@media (max-width:560px) {
  .sed-logo-cell { padding: 16px 16px 20px !important; }
  .sed-logo-light, .sed-logo-dark { width: 54px !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="sed-logo-cell" align="{{param.align}}" style="padding:24px;font-size:0;line-height:0;text-align:{{param.align}};">
  <img class="sed-logo-light" src="${LOGO_LIGHT_DATA_URI}" alt="Shop" width="68" height="30" style="display:{{param._show_light}};border:0;width:68px;height:30px;margin:{{param._img_margin}};">
  <img class="sed-logo-dark" src="${LOGO_DARK_DATA_URI}" alt="Shop" width="68" height="30" style="display:{{param._show_dark}};border:0;width:68px;height:30px;margin:{{param._img_margin}};">
</td></tr>
</table>`,
    variant_styles: {
      align: {
        center: { _img_margin: '0 auto' },
        left:   { _img_margin: '0' },
      },
      _mode: {
        auto:  { _show_light: 'block', _show_dark: 'none' },
        light: { _show_light: 'block', _show_dark: 'none' },
        dark:  { _show_light: 'none',  _show_dark: 'block' },
      },
    },
  }),
  mk({
    id: 'hero',
    name: 'Hero',
    category: 'Sections',
    description: 'Full-width hero block. White or Purple scheme. Eyebrow, headline, body copy, and CTA button.',
    params: [
      {
        key: 'scheme',
        label: 'Scheme',
        kind: 'select',
        default: 'white',
        options: [
          { value: 'white', label: 'White' },
          { value: 'purple', label: 'Purple' },
        ],
      },
      { key: 'eyebrow',   label: 'Eyebrow',   kind: 'text',     default: 'New on Shop' },
      { key: 'show_eyebrow', label: 'Show eyebrow', kind: 'boolean', default: true },
      { key: 'headline',  label: 'Headline',   kind: 'text',     default: 'Your store, your way.' },
      { key: 'body',      label: 'Body text',  kind: 'textarea', default: 'Everything you need to discover and buy the things you love — in one place.' },
      { key: 'show_body', label: 'Show body',  kind: 'boolean',  default: true },
      { key: 'cta_label', label: 'CTA label',  kind: 'text',     default: 'Get the app' },
      { key: 'cta_url',   label: 'CTA URL',    kind: 'url',      default: 'https://shop.app' },
      { key: 'show_cta',  label: 'Show CTA',   kind: 'boolean',  default: true },
    ],
    template: `<style>
@media (max-width:560px) {
  .hero-td { padding:40px {{spacing.section_padding_h.mobile}}px !important; }
  .hero-btn-wrap { width:100% !important; max-width:100% !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td class="hero-td" align="center" style="background-color:{{color.@param._bg_slug}};padding:64px {{spacing.section_padding_h.desktop}}px;">
  <p style="display:{{param._eyebrow_display}};margin:0 0 12px;font-family:{{token.font_family}};font-size:{{type.eyebrow.size_px}}px;line-height:{{type.eyebrow.line_height_px}}px;font-weight:{{type.eyebrow.weight}};letter-spacing:{{type.eyebrow.letter_spacing_px}}px;text-transform:{{type.eyebrow.transform}};color:{{color.@param._eyebrow_slug}};text-align:center;mso-hide:{{param._mso_eyebrow_hide}};">{{param.eyebrow}}</p>
  <p style="margin:0 0 16px;font-family:{{token.font_family}};font-size:{{type.t2.size_px}}px;line-height:{{type.t2.line_height_px}}px;font-weight:{{type.t2.weight}};letter-spacing:{{type.t2.letter_spacing_px}}px;color:{{color.@param._headline_slug}};text-align:center;">{{param.headline}}</p>
  <p style="display:{{param._body_display}};margin:0 0 28px;font-family:{{token.font_family}};font-size:{{type.body_regular.size_px}}px;line-height:{{type.body_regular.line_height_px}}px;font-weight:{{type.body_regular.weight}};letter-spacing:{{type.body_regular.letter_spacing_px}}px;color:{{color.@param._body_slug}};text-align:center;mso-hide:{{param._mso_body_hide}};">{{param.body}}</p>
  <table class="hero-btn-wrap" role="presentation" cellpadding="0" cellspacing="0" border="0" style="display:{{param._cta_display}};margin:0 auto;max-width:360px;mso-hide:{{param._mso_cta_hide}};">
  <tr><td align="center" style="border-radius:999px;background-color:{{color.@param._btn_bg_slug}};">
    <a href="{{param.cta_url}}" target="_blank" style="display:inline-block;padding:14px 32px;font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;color:{{color.@param._btn_text_slug}};text-decoration:none;border-radius:999px;mso-padding-alt:14px 32px;">{{param.cta_label}}</a>
  </td></tr>
  </table>
</td></tr>
</table>`,
    variant_styles: {
      scheme: {
        white: {
          _bg_slug:       'bg_fill',
          _eyebrow_slug:  'text_brand',
          _headline_slug: 'text',
          _body_slug:     'text_secondary',
          _btn_bg_slug:   'bg_brand',
          _btn_text_slug: 'text_inverse',
        },
        purple: {
          _bg_slug:       'bg_brand',
          _eyebrow_slug:  'text_brand_secondary',
          _headline_slug: 'text_inverse',
          _body_slug:     'text_inverse_secondary',
          _btn_bg_slug:   'bg_fill',
          _btn_text_slug: 'text_brand',
        },
      },
      show_eyebrow: {
        true:  { _eyebrow_display: 'block',  _mso_eyebrow_hide: '' },
        false: { _eyebrow_display: 'none',   _mso_eyebrow_hide: 'all' },
      },
      show_body: {
        true:  { _body_display: 'block', _mso_body_hide: '' },
        false: { _body_display: 'none',  _mso_body_hide: 'all' },
      },
      show_cta: {
        true:  { _cta_display: 'table', _mso_cta_hide: '' },
        false: { _cta_display: 'none',  _mso_cta_hide: 'all' },
      },
    },
    presets: [
      {
        id: 'white',
        name: 'Hero — White',
        description: 'Light background with brand purple eyebrow and CTA.',
        param_overrides: { scheme: 'white' },
      },
      {
        id: 'purple',
        name: 'Hero — Purple',
        description: 'Brand purple background with white headline and CTA.',
        param_overrides: { scheme: 'purple' },
      },
    ],
  }),
  mk({
    id: 'footer',
    name: 'Footer',
    category: 'Brand',
    description: 'Email footer: top divider, unsubscribe link, legal/address text. Light and dark variants.',
    params: [
      { key: 'unsubscribe_url', label: 'Unsubscribe URL', kind: 'url', default: 'https://shop.app' },
      { key: 'legal_text', label: 'Legal / address', kind: 'textarea', default: 'Shopify | 151 O\'Connor Street, Ground floor, Ottawa ON, K2P 2L8\nCopyright © 2022 Shopify, all rights reserved.' },
    ],
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
<tr><td style="background-color:{{color.@param._bg_slug}};padding:24px;border-top:1px solid {{color.@param._border_slug}};text-align:center;font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};color:{{color.@param._text_color_slug}};">
  <div>At Shop, we respect your privacy and take great care to safeguard your personal information. Your information will only be used in accordance with our Privacy Policy, and you can update your details or delete your account at any time.</div>
  <div style="height:12px;line-height:12px;font-size:1px;">&nbsp;</div>
  <div>Don&rsquo;t want to receive these emails? <a href="{{param.unsubscribe_url}}" target="_blank" style="color:{{color.@param._link_color_slug}};text-decoration:underline;">Unsubscribe here</a>.</div>
  <div style="height:12px;line-height:12px;font-size:1px;">&nbsp;</div>
  <div>{{param.legal_text}}</div>
</td></tr>
</table>`,
    variant_styles: {
      color_variant: {
        light: {
          _bg_slug: 'transparent',
          _border_slug: 'border',
          _text_color_slug: 'text_tertiary',
          _link_color_slug: 'text',
        },
        dark: {
          _bg_slug: 'bg_fill_inverse',
          _border_slug: 'bg_fill_inverse',
          _text_color_slug: 'text_inverse_secondary',
          _link_color_slug: 'text_inverse',
        },
      },
    },
  }),
];
