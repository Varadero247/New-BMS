/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * Stryker mutation config for packages/security.
 * Run: pnpm test:mutation:security
 *
 * Covers:
 *   rasp.ts                  — Runtime Application Self-Protection middleware
 *   behavioral-analytics.ts  — User behaviour anomaly detection
 *   credential-scanner.ts    — Leaked credential detection
 *   siem.ts                  — SIEM event correlation engine
 *
 * Note: envelope-encryption.ts is excluded until a dedicated
 * encryption test suite is in place.
 */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/security/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/security/src/rasp.ts',
    'packages/security/src/behavioral-analytics.ts',
    'packages/security/src/credential-scanner.ts',
    'packages/security/src/siem.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 60000,
  timeoutFactor: 2.5,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/security/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/security/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    high: 70,
    low: 55,
    break: 45,
  },
};
