import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class', '[data-theme="dark"]'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'DM Sans', 'sans-serif'],
        display: ['var(--font-display)', 'Syne', 'sans-serif'],
        mono: ['var(--font-mono)', 'DM Mono', 'monospace'],
      },
      colors: {
        background: 'var(--ink)',
        foreground: 'var(--silver)',
        card: 'var(--surface)',
        border: 'var(--border-default)',
        muted: 'var(--muted)',
      },
    },
  },
  plugins: [],
};

export default config;
