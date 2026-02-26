// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { Config } from 'tailwindcss';
import uiPreset from '@ims/ui/tailwind-preset';

const config: Config = {
  presets: [uiPreset as Config],
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}', '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'],
  plugins: [],
};

export default config;
