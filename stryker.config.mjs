/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * Root Stryker config — targets packages/validation only.
 * For other packages use their dedicated configs:
 *   stryker.auth.config.mjs
 *   stryker.security.config.mjs
 *   stryker.rbac.config.mjs
 *   stryker.finance.config.mjs
 * To run everything: pnpm test:mutation:all
 */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/validation/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/validation/src/sanitize.ts',
    'packages/validation/src/schemas.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 30000,
  timeoutFactor: 2.0,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/validation/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/validation/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    high: 80,
    low: 60,
    break: 50,
  },
};
