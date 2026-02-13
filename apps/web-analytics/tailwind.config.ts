import type { Config } from 'tailwindcss';
import uiPreset from '@ims/ui/tailwind-preset';

const config: Config = {
  presets: [uiPreset as Config],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
    '../../packages/charts/src/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
};

export default config;
