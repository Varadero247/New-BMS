import type { Config } from 'tailwindcss';
import preset from '../tailwind-preset';

const config: Config = {
  content: ['../src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  presets: [preset as Config],
};

export default config;
