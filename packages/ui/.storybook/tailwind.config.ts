// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Config } from 'tailwindcss';
import preset from '../tailwind-preset';

const config: Config = {
  content: ['../src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  presets: [preset as Config],
};

export default config;
