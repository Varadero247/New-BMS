// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration test configuration — runs against real DB and Redis (no mocks for infra)
'use strict';

module.exports = {
  testMatch: ['**/__tests__/integration/**/*.test.ts'],
  testTimeout: 30000,
  maxWorkers: 1,
  forceExit: true,
  globalSetup: './jest.integration.globalSetup.js',
  setupFiles: ['./jest.integration.setup.js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  moduleNameMapper: {
    '^@ims/database$': '<rootDir>/packages/database/src/index.ts',
    '^@ims/database/core$': '<rootDir>/packages/database/generated/core/index.js',
    '^@ims/database/quality$': '<rootDir>/packages/database/generated/quality/index.js',
    '^@ims/database/health-safety$': '<rootDir>/packages/database/generated/health-safety/index.js',
    '^@ims/database/hr$': '<rootDir>/packages/database/generated/hr/index.js',
    '^@ims/database/workflows$': '<rootDir>/packages/database/generated/workflows/index.js',
    '^@ims/database/inventory$': '<rootDir>/packages/database/generated/inventory/index.js',
    '^@ims/database/payroll$': '<rootDir>/packages/database/generated/payroll/index.js',
    '^@ims/auth$': '<rootDir>/packages/auth/src/index.ts',
    '^@ims/shared$': '<rootDir>/packages/shared/src/index.ts',
    '^@ims/monitoring$': '<rootDir>/packages/monitoring/src/index.ts',
    '^@ims/event-bus$': '<rootDir>/packages/event-bus/src/index.ts',
    '^@ims/service-auth$': '<rootDir>/packages/service-auth/src/index.ts',
    '^@ims/tax-engine$': '<rootDir>/packages/tax-engine/src/index.ts',
    '^@ims/rbac$': '<rootDir>/packages/rbac/src/index.ts',
  },
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: './test-results',
        outputName: 'integration.xml',
        suiteName: 'Integration Tests',
      },
    ],
  ],
  collectCoverage: false,
};
