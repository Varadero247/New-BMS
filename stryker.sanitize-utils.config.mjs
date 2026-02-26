// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/sanitize-utils/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/sanitize-utils/src/sanitize-utils.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 30000,
  timeoutFactor: 2.0,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/sanitize-utils/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/sanitize-utils/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
