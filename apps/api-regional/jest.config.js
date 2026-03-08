// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api-regional',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.{test,spec}.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@ims/auth$': '<rootDir>/../../packages/auth/src/index.ts',
    '^@ims/monitoring$': '<rootDir>/../../packages/monitoring/src/index.ts',
    '^@ims/shared$': '<rootDir>/../../packages/shared/src/index.ts',
    '^@ims/validation$': '<rootDir>/../../packages/validation/src/index.ts',
    '^@ims/regional-data$': '<rootDir>/../../packages/regional-data/src/index.ts',
    '^@ims/service-auth$': '<rootDir>/../../packages/service-auth/src/index.ts',
    '^@ims/sentry$': '<rootDir>/../../packages/sentry/src/index.ts',
    '^@prisma/client$': '<rootDir>/__mocks__/prisma-client.js',
  },
  forceExit: true,
};
