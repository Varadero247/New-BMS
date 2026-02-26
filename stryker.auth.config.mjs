// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * Stryker mutation config for packages/auth.
 * Run: pnpm test:mutation:auth
 *
 * Covers the security-critical auth package:
 *   jwt.ts          — token signing/verification
 *   middleware.ts   — Express authentication middleware
 *   password.ts     — bcrypt hashing/comparison
 *   adaptive-auth.ts — risk-based login scoring
 *   magic-link.ts   — time-limited magic link flows
 *
 * Note: jwt-rotation.ts and continuous-verification.ts are deliberately
 * excluded from the initial baseline; add them once existing scores are
 * established and green.
 */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/auth/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/auth/src/jwt.ts',
    'packages/auth/src/middleware.ts',
    'packages/auth/src/password.ts',
    'packages/auth/src/adaptive-auth.ts',
    'packages/auth/src/magic-link.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 60000,
  timeoutFactor: 2.5,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/auth/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/auth/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    // Auth is security-critical; require a stronger mutation score than
    // general packages.  Break the build below 50% so regressions are
    // caught immediately.
    high: 75,
    low: 60,
    break: 50,
  },
};
