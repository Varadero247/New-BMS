// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
module.exports = {
  displayName: 'linear-algebra',
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
