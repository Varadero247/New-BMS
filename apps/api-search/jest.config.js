// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api-search',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@ims/auth$': '<rootDir>/../../packages/auth/src/index.ts',
    '^@ims/monitoring$': '<rootDir>/../../packages/monitoring/src/index.ts',
    '^@ims/shared$': '<rootDir>/../../packages/shared/src/index.ts',
  },
  forceExit: true,
};
