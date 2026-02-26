// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
module.exports = {
  displayName: 'pdf-utils',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/__tests__/**/*.test.ts'],
  transform: { '^.+\\.ts$': ['ts-jest', { tsconfig: { strict: false }, isolatedModules: true, diagnostics: false }] },
};
