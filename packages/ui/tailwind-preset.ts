import type { Config } from 'tailwindcss';
import { nexara, moduleColors, sectorColors, colors, fontFamily, fontSize, borderRadius, boxShadow } from './src/tokens';

const preset: Partial<Config> = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // CSS-variable-driven semantic tokens (light/dark mode)
        border: 'hsl(var(--border-hsl, 217 33% 17%))',
        input: 'hsl(var(--input, 217 33% 17%))',
        ring: 'hsl(var(--ring, 217 78% 60%))',
        background: 'var(--bg-page, #080B12)',
        foreground: 'var(--text-primary, #EDF3FC)',
        primary: {
          DEFAULT: 'var(--accent-primary, #3B78F5)',
          foreground: 'var(--text-primary, #EDF3FC)',
        },
        secondary: {
          DEFAULT: 'var(--accent-teal, #00C4A8)',
          foreground: 'var(--text-primary, #EDF3FC)',
        },
        destructive: {
          DEFAULT: '#F04B5A',
          foreground: '#EDF3FC',
        },
        muted: {
          DEFAULT: 'var(--raised, #1C2940)',
          foreground: 'var(--text-muted, #5A7099)',
        },
        accent: {
          DEFAULT: 'var(--accent-teal, #00C4A8)',
          foreground: 'var(--text-primary, #EDF3FC)',
        },
        card: {
          DEFAULT: 'var(--bg-card, #162032)',
          foreground: 'var(--text-primary, #EDF3FC)',
        },
        // Nexara foundation palette
        nexara,
        // Module colours
        module: moduleColors,
        // Sector colours
        sector: sectorColors,
        // Static brand palette (legacy compat)
        brand: colors.brand,
        gold: colors.gold,
        success: colors.success,
        warning: colors.warning,
        danger: colors.danger,
        info: colors.info,
        gray: colors.gray,
        // Named palette tokens
        navy: colors.navy,
        sage: colors.sage,
        teal: colors.teal,
        surface: colors.surface,
        // Semantic aliases
        critical: '#F04B5A',
        neutral: '#5A7099',
      },
      fontFamily,
      fontSize,
      borderRadius,
      boxShadow,
      backgroundImage: {
        'brand-gradient': 'linear-gradient(135deg, #2660D8 0%, #3B78F5 45%, #00C4A8 100%)',
        'brand-gradient-r': 'linear-gradient(315deg, #2660D8 0%, #3B78F5 45%, #00C4A8 100%)',
        'dark-gradient': 'linear-gradient(160deg, #0C1220 0%, #101828 100%)',
      },
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
