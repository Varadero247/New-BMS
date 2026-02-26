// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
  },
  {
    entry: ['src/react/index.ts'],
    format: ['cjs', 'esm'],
    dts: true,
    outDir: 'dist/react',
    banner: { js: '"use client";' },
  },
]);
