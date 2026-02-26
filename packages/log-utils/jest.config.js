// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  globals: {
    'ts-jest': {
      isolatedModules: true,
      diagnostics: false,
      tsconfig: '<rootDir>/tsconfig.json',
    },
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
