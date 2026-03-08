/** @type {import('jest').Config} */
module.exports = {
  displayName: 'module-owner-training',
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.spec.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};
