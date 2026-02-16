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
