/**
 * IMS Design Tokens — Resolvex 2026 Enterprise Palette
 *
 * Brand colours, typography, spacing, radius, and shadows.
 * Source of truth consumed by tailwind preset and CSS variables.
 *
 * Primary:   #1E3A8A (navy) · #0F172A (navy-dark)
 * Secondary: #065F46 (sage) · #047857 (sage-mid)
 * Highlight:  #059669 (teal) · #0EA5E9 (teal-bright)
 */

// ── Brand Palette ──────────────────────────────────────────
export const colors = {
  brand: {
    900: '#0F172A', // ← navy-dark / dark mode primary
    800: '#1E293B',
    700: '#1E3A8A', // ← primary navy
    600: '#1E3A8A', // ← primary navy (kept for backward compat)
    500: '#2563EB',
    400: '#3B82F6',
    300: '#60A5FA',
    200: '#93C5FD',
    100: '#DBEAFE',
    50: '#EFF6FF',
  },
  gold: {
    700: '#047857', // sage-mid (gold replaced by teal/sage)
    600: '#059669', // teal
    500: '#059669', // ← teal CTA (replaces gold accent)
    400: '#10B981',
    300: '#34D399',
    200: '#6EE7B7',
    100: '#A7F3D0',
    50: '#D1FAE5',
  },
  success: {
    700: '#047857',
    600: '#059669',
    500: '#10B981', // ← compliant / green metrics
    400: '#34D399',
    300: '#6EE7B7',
    200: '#A7F3D0',
    100: '#D1FAE5',
    50: '#ECFDF5',
  },
  warning: {
    700: '#B45309',
    600: '#D97706', // ← warning-deep
    500: '#F59E0B', // ← at-risk / pending
    400: '#FBBF24',
    300: '#FCD34D',
    200: '#FDE68A',
    100: '#FEF3C7',
    50: '#FFFBEB',
  },
  danger: {
    700: '#B91C1C',
    600: '#DC2626', // ← non-compliant / alert
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
    500: '#0EA5E9', // ← teal-bright
    400: '#38BDF8',
    300: '#7DD3FC',
    200: '#BAE6FD',
    100: '#E0F2FE',
    50: '#F0F9FF',
  },
  gray: {
    950: '#030712',
    900: '#111827', // ← dark mode bg
    800: '#1F2937',
    700: '#374151',
    600: '#4B5563',
    500: '#6B7280',
    400: '#9CA3AF', // ← neutral
    300: '#D1D5DB',
    200: '#E5E7EB',
    100: '#F3F4F6',
    50: '#F9FAFB',
  },
  // ── New named palette tokens ──
  navy: {
    DEFAULT: '#1E3A8A',
    dark: '#0F172A',
    light: '#DBEAFE',
  },
  sage: {
    DEFAULT: '#065F46',
    mid: '#047857',
    light: '#D1FAE5',
  },
  teal: {
    DEFAULT: '#059669',
    bright: '#0EA5E9',
    light: '#D1FAE5',
  },
  surface: {
    light: '#F8FAFC',
    'light-alt': '#F1F5F9',
    dark: '#111827',
    'dark-alt': '#0F172A',
  },
} as const;

// ── Chart palette (for Recharts / data viz) ──────────────
export const chartColors = [
  '#1E3A8A', // navy
  '#059669', // teal
  '#0EA5E9', // teal-bright
  '#F59E0B', // warning
  '#10B981', // success
  '#DC2626', // critical
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#F97316', // orange
  '#6366F1', // indigo
] as const;

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
  card: '0 0 0 1px rgba(0, 0, 0, 0.06), 0 2px 8px rgba(0, 0, 0, 0.06)',
  nav: '0 1px 0 rgba(0, 0, 0, 0.08)',
  modal: '0 25px 50px rgba(0, 0, 0, 0.25)',
  'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.08), 0 2px 4px -2px rgba(0, 0, 0, 0.06)',
} as const;
