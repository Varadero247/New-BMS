/**
 * Nexara Brand Identity v3.0 — Design Tokens
 *
 * Dark-first enterprise palette with blue/teal brand signal.
 * Source of truth consumed by tailwind preset and CSS variables.
 */

// ── Foundation (dark-first backgrounds → text) ──────────────
export const nexara = {
  ink: '#080B12',
  deep: '#0C1220',
  midnight: '#101828',
  surface: '#162032',
  raised: '#1C2940',
  border: '#1E2E48',
  'border-hi': '#263852',
  muted: '#344D72',
  steel: '#5A7099',
  silver: '#8EA8CC',
  light: '#C8D9EF',
  white: '#EDF3FC',
  // Brand signal
  'blue-deep': '#1A4FBF',
  'blue-core': '#2660D8',
  'blue-mid': '#3B78F5',
  'blue-hi': '#5B94FF',
  'blue-glow': '#7AACFF',
  'teal-deep': '#009E87',
  'teal-core': '#00C4A8',
  'teal-hi': '#00E0BF',
} as const;

// ── Module colours (one per ISO domain) ──────────────────────
export const moduleColors = {
  quality: '#3B78F5',
  safety: '#F04B5A',
  env: '#00C4A8',
  hr: '#9B6FEA',
  payroll: '#F59E0B',
  projects: '#4EB8FF',
  finance: '#34D399',
  crm: '#FB923C',
  infosec: '#818CF8',
  esg: '#6EE7B7',
  cmms: '#FCD34D',
  ai: '#E879F9',
} as const;

// ── Sector vertical colours ──────────────────────────────────
export const sectorColors = {
  auto: '#DC2626',
  medical: '#0891B2',
  aero: '#1D4ED8',
  food: '#16A34A',
  energy: '#D97706',
  antibrib: '#7C3AED',
} as const;

// ── Legacy compatibility palette (used by existing components) ──
export const colors = {
  brand: {
    900: '#080B12',
    800: '#0C1220',
    700: '#1A4FBF',
    600: '#2660D8',
    500: '#3B78F5',
    400: '#5B94FF',
    300: '#7AACFF',
    200: '#8EA8CC',
    100: '#C8D9EF',
    50: '#EDF3FC',
  },
  gold: {
    700: '#009E87',
    600: '#00C4A8',
    500: '#00C4A8',
    400: '#00E0BF',
    300: '#34D399',
    200: '#6EE7B7',
    100: '#A7F3D0',
    50: '#D1FAE5',
  },
  success: {
    700: '#047857',
    600: '#059669',
    500: '#10B981',
    400: '#34D399',
    300: '#6EE7B7',
    200: '#A7F3D0',
    100: '#D1FAE5',
    50: '#ECFDF5',
  },
  warning: {
    700: '#B45309',
    600: '#D97706',
    500: '#F59E0B',
    400: '#FBBF24',
    300: '#FCD34D',
    200: '#FDE68A',
    100: '#FEF3C7',
    50: '#FFFBEB',
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
    950: '#080B12',
    900: '#0C1220',
    800: '#101828',
    700: '#162032',
    600: '#344D72',
    500: '#5A7099',
    400: '#8EA8CC',
    300: '#C8D9EF',
    200: '#E5E7EB',
    100: '#EDF3FC',
    50: '#EDF3FC',
  },
  navy: {
    DEFAULT: '#1A4FBF',
    dark: '#080B12',
    light: '#C8D9EF',
  },
  sage: {
    DEFAULT: '#009E87',
    mid: '#00C4A8',
    light: '#D1FAE5',
  },
  teal: {
    DEFAULT: '#00C4A8',
    bright: '#00E0BF',
    light: '#D1FAE5',
  },
  surface: {
    light: '#EDF3FC',
    'light-alt': '#C8D9EF',
    dark: '#0C1220',
    'dark-alt': '#080B12',
  },
} as const;

// ── Chart palette (for Recharts / data viz) ──────────────────
export const chartColors = [
  '#3B78F5', // blue-mid
  '#00C4A8', // teal-core
  '#F04B5A', // safety
  '#F59E0B', // payroll/warning
  '#9B6FEA', // hr
  '#34D399', // finance
  '#FB923C', // crm
  '#818CF8', // infosec
  '#E879F9', // ai
  '#4EB8FF', // projects
] as const;

// ── Typography ───────────────────────────────────────────────
export const fontFamily = {
  display: ['Syne', 'sans-serif'],
  body: ['DM Sans', 'sans-serif'],
  mono: ['DM Mono', 'monospace'],
} as const;

export const fontSize = {
  'display-xl': ['2.25rem', { lineHeight: '2.75rem', fontWeight: '800' }],
  'display-lg': ['1.875rem', { lineHeight: '2.375rem', fontWeight: '800' }],
  'display-md': ['1.5rem', { lineHeight: '2rem', fontWeight: '700' }],
  'display-sm': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '700' }],
  'body-lg': ['1.1rem', { lineHeight: '1.75', fontWeight: '300' }],
  'body-md': ['0.92rem', { lineHeight: '1.7', fontWeight: '400' }],
  'body-sm': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
  'body-xs': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }],
  'label-lg': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }],
  'label-md': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }],
  'label-sm': ['0.75rem', { lineHeight: '1rem', fontWeight: '500' }],
} as const;

// ── Spacing (4px grid) ───────────────────────────────────────
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

// ── Border Radius ────────────────────────────────────────────
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

// ── Shadows ──────────────────────────────────────────────────
export const boxShadow = {
  card: '0 0 0 1px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.06)',
  nav: '0 1px 0 rgba(0, 0, 0, 0.08)',
  modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
  'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
  glow: '0 8px 32px rgba(38,96,216,0.35)',
} as const;
