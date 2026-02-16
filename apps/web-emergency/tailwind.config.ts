import type { Config } from 'tailwindcss';
const config: Config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)'],
        display: ['var(--font-display)'],
        mono: ['var(--font-mono)'],
      },
      colors: {
        emergency: {
          DEFAULT: '#F04B5A',
          light: '#FEE2E4',
          dark: '#B91C2A',
        },
      },
    },
  },
  plugins: [],
};
export default config;
