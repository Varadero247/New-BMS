import type { Config } from 'tailwindcss';
import { colors, fontFamily, fontSize, borderRadius, boxShadow } from './src/tokens';

const preset: Partial<Config> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-driven semantic tokens (light/dark mode)
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // Static brand palette
        brand: colors.brand,
        gold: colors.gold,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
        // Named palette tokens
        navy: colors.navy,
        sage: colors.sage,
        teal: colors.teal,
        surface: colors.surface,
        // Semantic aliases
        critical: '#DC2626',
        neutral: '#9CA3AF',
      },
      fontFamily,
      fontSize,
      borderRadius,
      boxShadow,
      animation: {
        'fade-in': 'fadeIn 200ms ease-out',
        'slide-up': 'slideUp 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
        'slide-in-right': 'slideInRight 250ms ease-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideUp: {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          from: { opacity: '0', transform: 'translateX(-8px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
};

export default preset;
