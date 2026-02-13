import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs'],
  dts: false,
  external: ['@ims/database/hr', '@ims/database', '@prisma/client'],
  noExternal: [/^@ims\/(?!database)/],
});
