import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#0B1E38',
          light: '#1E3A5F',
          dark: '#091628',
        },
        gold: {
          DEFAULT: '#B8860B',
          light: '#D4A017',
        },
      },
    },
  },
  plugins: [],
};

export default config;
