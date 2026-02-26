// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';
import path from 'path';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials'],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  viteFinal(config) {
    return mergeConfig(config, {
      css: {
        postcss: {
          plugins: [
            require('tailwindcss')({
              config: path.resolve(__dirname, './tailwind.config.ts'),
            }),
            require('autoprefixer'),
          ],
        },
      },
    });
  },
};

export default config;
