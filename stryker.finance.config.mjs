/** @type {import('@stryker-mutator/api/core').PartialStrykerOptions} */
/**
 * Stryker mutation config for packages/finance-calculations.
 * Run: pnpm test:mutation:finance
 *
 * Covers the pure-function financial calculation engine:
 *   currency.ts      — Currency conversion, rounding, formatting
 *   interest.ts      — Simple/compound interest, APR/APY, amortisation
 *   depreciation.ts  — Straight-line, declining balance, sum-of-years-digits
 *
 * Pure numeric code is an ideal candidate for mutation testing because
 * off-by-one errors, wrong operators, and boundary conditions are easy
 * to introduce and hard to spot in code review.
 */
export default {
  packageManager: 'pnpm',
  plugins: ['@stryker-mutator/jest-runner'],
  reporters: ['html', 'clear-text', 'json'],
  testRunner: 'jest',
  jest: {
    projectType: 'custom',
    configFile: 'packages/finance-calculations/jest.config.js',
    enableFindRelatedTests: true,
  },
  mutate: [
    'packages/finance-calculations/src/currency.ts',
    'packages/finance-calculations/src/interest.ts',
    'packages/finance-calculations/src/depreciation.ts',
  ],
  coverageAnalysis: 'perTest',
  timeoutMS: 45000,
  timeoutFactor: 2.0,
  concurrency: 4,
  htmlReporter: {
    fileName: 'reports/mutation/finance/index.html',
  },
  jsonReporter: {
    fileName: 'reports/mutation/finance/mutation.json',
  },
  ignorePatterns: ['node_modules', 'dist', 'coverage', '.next'],
  thresholds: {
    // Financial calculations require high accuracy — strong thresholds.
    high: 80,
    low: 65,
    break: 55,
  },
};
