/**
 * IMS Design Tokens
 *
 * Brand colours, typography, spacing, radius, and shadows.
 * Source of truth consumed by tailwind preset and CSS variables.
 */

// ── Brand Palette ──────────────────────────────────────────
export const colors = {
  brand: {
    900: '#0D1F3C',
    800: '#152D54',
    700: '#1B3A6B', // primary navy
    600: '#24508F',
    500: '#2E6CC7', // mid-blue
    400: '#5A92DB',
    300: '#89B4E8',
    200: '#B8D5F3',
    100: '#D6E4F7', // light-blue
    50: '#EBF2FB',
  },
  gold: {
    700: '#8E7535',
    600: '#B09243',
    500: '#C8A951', // accent gold
    400: '#D4BE78',
    300: '#E1D4A0',
    200: '#EDE5C7',
    100: '#F6F1E3',
    50: '#FBF8F1',
  },
  success: {
    700: '#15803D',
    600: '#16A34A',
    500: '#22C55E',
    400: '#4ADE80',
    300: '#86EFAC',
    200: '#BBF7D0',
    100: '#DCFCE7',
    50: '#F0FDF4',
  },
  warning: {
    700: '#A16207',
    600: '#CA8A04',
    500: '#EAB308',
    400: '#FACC15',
    300: '#FDE047',
    200: '#FEF08A',
    100: '#FEF9C3',
    50: '#FEFCE8',
  },
  danger: {
    700: '#B91C1C',
    600: '#DC2626',
    500: '#EF4444',
    400: '#F87171',
    300: '#FCA5A5',
    200: '#FECACA',
    100: '#FEE2E2',
    50: '#FEF2F2',
  },
  info: {
    700: '#0369A1',
    600: '#0284C7',
    500: '#0EA5E9',
    400: '#38BDF8',
    300: '#7DD3FC',
    200: '#BAE6FD',
    100: '#E0F2FE',
    50: '#F0F9FF',
  },
  gray: {
    950: '#0A0A0B',
    900: '#18181B',
    800: '#27272A',
    700: '#3F3F46',
    600: '#52525B',
    500: '#71717A',
    400: '#A1A1AA',
    300: '#D4D4D8',
    200: '#E4E4E7',
    100: '#F4F4F5',
    50: '#FAFAFA',
  },
} as const;

// ── Typography ─────────────────────────────────────────────
export const fontFamily = {
  display: ['Sora', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  body: ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
  mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
} as const;

export const fontSize = {
  'display-xl': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '700' }],
  'display-lg': ['1.875rem', { lineHeight: '2.375rem', fontWeight: '700' }],
  'display-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }],
  'display-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }],
  'body-lg': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '400' }],
  'body-md': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }],
  'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
  'body-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
  'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '600' }],
  'label-md': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
  'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
} as const;

// ── Spacing (4px grid) ────────────────────────────────────
export const spacing = {
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
} as const;

// ── Border Radius ──────────────────────────────────────────
export const borderRadius = {
  none: '0px',
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
  '2xl': '1.5rem',
  full: '9999px',
} as const;

// ── Shadows ────────────────────────────────────────────────
export const boxShadow = {
  card: '0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
  nav: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.08)',
  modal: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
  'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
} as const;
