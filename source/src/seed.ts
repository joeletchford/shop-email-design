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
    section_padding_v: { desktop: 24, mobile: 16 },
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
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word;">
<tbody>
<tr>
<td class="sed-logo-cell" align="{{param.align}}" style="mso-table-lspace:0;mso-table-rspace:0;padding:24px;font-size:0;line-height:0;text-align:{{param.align}};">
  <img class="sed-logo-light" src="${LOGO_LIGHT_DATA_URI}" alt="Shop" width="68" height="30" style="display:{{param._show_light}};border:0;width:68px;height:30px;margin:{{param._img_margin}};">
  <img class="sed-logo-dark" src="${LOGO_DARK_DATA_URI}" alt="Shop" width="68" height="30" style="display:{{param._show_dark}};border:0;width:68px;height:30px;margin:{{param._img_margin}};">
</td>
</tr>
</tbody>
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
    category: 'Hero',
    description: 'Full-width hero block. White or Purple scheme. DSP headline, body copy, CTA button, and image.',
    params: [
      {
        key: '_scheme',
        label: 'Scheme',
        kind: 'select',
        default: 'white',
        options: [
          { value: 'white', label: 'White' },
          { value: 'purple', label: 'Purple' },
        ],
      },
      { key: 'headline',      label: 'Headline',      kind: 'text',   default: 'Lorem ipsum dolor sit amet consectetur' },
      { key: 'headline_size', label: 'Headline size', kind: 'select', default: 'dsp',
        options: [{ value: 'dsp', label: 'Display' }, { value: 't1', label: 'T1' }, { value: 't2', label: 'T2' }] },
      { key: 'body',         label: 'Body text',     kind: 'textarea',  default: 'Lorem ipsum dolor sit amet consectetur' },
      { key: 'show_body',    label: 'Show body',     kind: 'boolean',   default: true },
      { key: 'cta_label',    label: 'CTA label',     kind: 'text',      default: 'Button' },
      { key: 'cta_url',      label: 'CTA URL',       kind: 'url',       default: 'https://shop.app' },
      { key: 'show_cta',     label: 'Show CTA',      kind: 'boolean',   default: true },
      { key: 'image_url',    label: 'Image',         kind: 'image_url', default: '' },
      { key: 'image_alt',    label: 'Image alt text', kind: 'text',     default: '' },
      { key: 'show_image',   label: 'Show image',    kind: 'boolean',   default: false },
    ],
    template: `<style>
@media (max-width:560px) {
  .hero-td { padding-left:{{spacing.section_padding_h.mobile}}px !important; padding-right:{{spacing.section_padding_h.mobile}}px !important; padding-bottom:{{param._padding_bottom_mobile}}px !important; }
  .hero-btn-wrap { max-width:100% !important; width:100% !important; }
  .hero-image-td { padding-top:{{param._image_pt_mobile}}px !important; }
}
@media (prefers-color-scheme: dark) {
  .hero-bg { background-color:{{color.@param._dm_bg_slug}} !important; }
  .hero-headline { color:{{color.@param._dm_headline_slug}} !important; }
  .hero-headline span { color:{{color.@param._dm_headline_slug}} !important; }
  .hero-body { color:{{color.@param._dm_body_slug}} !important; }
  .hero-body span { color:{{color.@param._dm_body_slug}} !important; }
  .hero-btn-td { background-color:{{color.@param._dm_btn_bg_slug}} !important; }
  .hero-btn-a { color:{{color.@param._dm_btn_text_slug}} !important; }
}
</style>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word;">
<tr><td class="hero-bg" style="background-color:{{color.@param._bg_slug}};border-radius:{{spacing.section_radius.desktop}}px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;">
  <tr><td class="hero-td" align="center" style="padding:{{param._padding_top}}px {{spacing.section_padding_h.desktop}}px {{param._padding_bottom}}px;text-align:center;">
    <p class="hero-headline" style="margin:0 0 {{param._headline_end_margin}}px;font-family:{{token.font_family}};font-size:{{type.@param.headline_size.size_px}}px;line-height:{{type.@param.headline_size.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.@param.headline_size.letter_spacing_px}}px;color:{{color.@param._headline_slug}};"><span style="font-family:{{token.font_family}};font-size:{{type.@param.headline_size.size_px}}px;line-height:{{type.@param.headline_size.line_height_px}}px;font-weight:{{weight.bold}};letter-spacing:{{type.@param.headline_size.letter_spacing_px}}px;color:{{color.@param._headline_slug}};word-break:break-word;">{{param.headline}}</span></p>
    <p class="hero-body" style="display:{{param._body_display}};margin:0 0 {{param._body_mb}}px;font-family:{{token.font_family}};font-size:{{type.@param._body_size_slug.size_px}}px;line-height:{{type.@param._body_size_slug.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.@param._body_size_slug.letter_spacing_px}}px;color:{{color.@param._body_slug}};mso-hide:{{param._mso_body_hide}};"><span style="font-family:{{token.font_family}};font-size:{{type.@param._body_size_slug.size_px}}px;line-height:{{type.@param._body_size_slug.line_height_px}}px;font-weight:{{weight.regular}};letter-spacing:{{type.@param._body_size_slug.letter_spacing_px}}px;color:{{color.@param._body_slug}};word-break:break-word;">{{param.body}}</span></p>
    <table align="center" width="360" class="hero-btn-wrap" role="presentation" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;display:{{param._cta_display}};margin:{{param._cta_mt}}px auto 0;max-width:360px;width:360px;mso-hide:{{param._mso_cta_hide}};">
    <tr><td class="hero-btn-td" align="center" style="border-radius:999px;background-color:{{color.@param._btn_bg_slug}};">
      <a class="hero-btn-a" href="{{param.cta_url}}" target="_blank" style="display:inline-block;padding:16px 32px;font-family:{{token.font_family}};font-size:{{type.button.size_px}}px;line-height:{{type.button.line_height_px}}px;font-weight:{{type.button.weight}};letter-spacing:{{type.button.letter_spacing_px}}px;color:{{color.@param._btn_text_slug}};text-decoration:none;border-radius:999px;mso-padding-alt:16px 32px;">{{param.cta_label}}</a>
    </td></tr>
    </table>
    <div style="display:{{param._image_display}};max-height:{{param._image_max_h}};overflow:hidden;mso-hide:{{param._mso_image_hide}};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;">
    <tr><td class="hero-image-td" style="padding-top:{{param._image_pt_desktop}}px;">
      <img src="{{param.image_url}}" alt="{{param.image_alt}}" width="552" height="310" style="display:block;width:100%;max-width:552px;height:auto;border-radius:20px;border:0;background-color:#EBEBEB;">
    </td></tr>
    </table>
    </div>
  </td></tr>
  </table>
</td></tr>
</table>`,
    variant_styles: {
      _scheme: {
        white: {
          _bg_slug:              'transparent',
          _padding_top:          '0',
          _padding_bottom:       '24',
          _padding_bottom_mobile:'16',
          _headline_slug:        'text',
          _body_slug:            'text_secondary',
          _btn_bg_slug:          'bg_brand',
          _btn_text_slug:        'text_inverse',
          _dm_bg_slug:           'bg_fill_inverse',
          _dm_headline_slug:     'text_inverse',
          _dm_body_slug:         'text_inverse_secondary',
          _dm_btn_bg_slug:       'bg_brand',
          _dm_btn_text_slug:     'text_inverse',
        },
        purple: {
          _bg_slug:              'bg_brand',
          _padding_top:          '24',
          _padding_bottom:       '24',
          _padding_bottom_mobile:'20',
          _headline_slug:        'text_inverse',
          _body_slug:            'text_inverse_secondary',
          _btn_bg_slug:          'bg_fill',
          _btn_text_slug:        'text_brand',
          _dm_bg_slug:           'bg_brand',
          _dm_headline_slug:     'text_inverse',
          _dm_body_slug:         'text_inverse_secondary',
          _dm_btn_bg_slug:       'bg_fill',
          _dm_btn_text_slug:     'text_brand',
        },
      },
      headline_size: {
        dsp: { _body_size_slug: 't5',         _headline_end_margin: '12' },
        t1:  { _body_size_slug: 'body_large', _headline_end_margin: '8'  },
        t2:  { _body_size_slug: 'body_large', _headline_end_margin: '4'  },
      },
      show_body: {
        true:  { _body_display: 'block', _mso_body_hide: '',    _cta_mt: '0'  },
        false: { _body_display: 'none',  _mso_body_hide: 'all', _cta_mt: '24', _headline_end_margin: '0' },
      },
      show_cta: {
        true:  { _cta_display: 'table', _mso_cta_hide: '',    _body_mb: '24', _image_pt_desktop: '40', _image_pt_mobile: '32' },
        false: { _cta_display: 'none',  _mso_cta_hide: 'all', _body_mb: '0',  _image_pt_desktop: '40', _image_pt_mobile: '32' },
      },
      show_image: {
        true:  { _image_display: 'block', _image_max_h: '9999px', _mso_image_hide: '' },
        false: { _image_display: 'none',  _image_max_h: '0px',    _mso_image_hide: 'all' },
      },
      // _mode is injected by the preview (isDark toggle) — overrides scheme colors
      // so the in-app preview reflects dark state. The @media CSS handles real clients.
      _mode: {
        light: {},
        dark: {
          _headline_slug: 'text_inverse',
          _body_slug:     'text_inverse_secondary',
        },
      },
    },
    presets: [
      {
        id: 'white',
        name: 'Hero — White',
        description: 'Light background with DSP headline, body, CTA button, and image.',
        param_overrides: { _scheme: 'white' },
      },
      {
        id: 'purple',
        name: 'Hero — Purple',
        description: 'Brand purple background with white headline and CTA.',
        param_overrides: { _scheme: 'purple' },
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
    template: `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word;">
<tbody>
<tr>
<td style="mso-table-lspace:0;mso-table-rspace:0;padding-top:24px;padding-bottom:24px;vertical-align:top;border-top:1px solid {{color.@param._border_slug}};background-color:{{color.@param._bg_slug}};" width="100%">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="mso-table-lspace:0;mso-table-rspace:0;word-break:break-word;">
  <tbody>
  <tr>
  <td>
    <div style="font-family:{{token.font_family}};">
      <div style="font-size:{{type.body_legal.size_px}}px;font-family:{{token.font_family}};mso-line-height-alt:{{type.body_legal.line_height_px}}px;color:{{color.@param._text_color_slug}};line-height:{{type.body_legal.line_height_px}}px;">
        <p style="margin:0;font-size:{{type.body_legal.size_px}}px;text-align:center;mso-line-height-alt:{{type.body_legal.line_height_px}}px;"><span style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};color:{{color.@param._text_color_slug}};word-break:break-word;">At Shop, we respect your privacy and take great care to safeguard your personal information. Your information will only be used in accordance with our Privacy Policy, and you can update your details or delete your account at any time.</span></p>
        <p style="margin:0;font-size:{{type.body_legal.size_px}}px;text-align:center;mso-line-height-alt:{{type.body_legal.line_height_px}}px;">&nbsp;</p>
        <p style="margin:0;font-size:{{type.body_legal.size_px}}px;text-align:center;mso-line-height-alt:{{type.body_legal.line_height_px}}px;"><span style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};color:{{color.@param._text_color_slug}};word-break:break-word;">Don&rsquo;t want to receive these emails?<br><a href="{{param.unsubscribe_url}}" target="_blank" rel="noopener" style="text-decoration:none;color:{{color.@param._link_color_slug}};">Unsubscribe here.</a></span></p>
        <p style="margin:0;font-size:{{type.body_legal.size_px}}px;text-align:center;mso-line-height-alt:{{type.body_legal.line_height_px}}px;">&nbsp;</p>
        <p style="margin:0;font-size:{{type.body_legal.size_px}}px;text-align:center;mso-line-height-alt:{{type.body_legal.line_height_px}}px;"><span style="font-family:{{token.font_family}};font-size:{{type.body_legal.size_px}}px;line-height:{{type.body_legal.line_height_px}}px;font-weight:{{weight.regular}};color:{{color.@param._text_color_slug}};word-break:break-word;">{{param.legal_text}}</span></p>
      </div>
    </div>
  </td>
  </tr>
  </tbody>
  </table>
</td>
</tr>
</tbody>
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
