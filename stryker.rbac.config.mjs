/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * Stryker mutation config for packages/rbac.
 * Run: pnpm test:mutation:rbac
 *
 * Covers:
 *   permissions.ts   — Permission checking logic (hasPermission, canAccess)
 *   roles.ts         — Role definitions and hierarchy
 *   middleware.ts    — Express RBAC enforcement middleware
 *
 * ownership-scope.ts is excluded because it depends on request context
 * that is hard to exercise through mutation alone; test it via integration
 * tests instead.
 */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/rbac/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/rbac/src/permissions.ts',
    'packages/rbac/src/roles.ts',
    'packages/rbac/src/middleware.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 60000,
  timeoutFactor: 2.5,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/rbac/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/rbac/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    // RBAC is security-critical; keep thresholds high.
    high: 75,
    low: 60,
    break: 50,
  },
};
