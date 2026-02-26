// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
module.exports = {
  displayName: 'api-chemicals',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: { '^.+\.tsx?$': ['ts-jest', { useESM: true }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: { '^@ims/(.*)$': '<rootDir>/../../packages/$1/src' },
};
