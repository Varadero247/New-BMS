/** @type {import('jest').Config} */
module.exports = {
  displayName: 'web-regional-dashboard',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ims/ui$': '<rootDir>/../../packages/ui/src/index.ts',
    '^@ims/regional-data$': '<rootDir>/../../packages/regional-data/src/index.ts',
  },
};
