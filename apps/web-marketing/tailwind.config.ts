import type { Config } from 'tailwindcss';
import uiPreset from '@ims/ui/tailwind-preset';

const config: Config = {
  presets: [uiPreset as Config],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  plugins: [],
};

export default config;
