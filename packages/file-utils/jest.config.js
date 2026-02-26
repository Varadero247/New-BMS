// Copyright (c) 2026 Nexara DMCC. All rights reserved.
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: {
    '^.+\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
        diagnostics: false,
      },
    ],
  },
  clearMocks: true,
};
