/** @type {import('jest').Config} */
module.exports = {
  displayName: 'chemical-register',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
