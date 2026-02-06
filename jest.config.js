/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      useESM: true,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    '**/src/**/*.ts',
    '!**/node_modules/**',
    '!**/dist/**',
    '!**/__tests__/**',
    '!**/index.ts',
    // Exclude route handlers (require integration tests)
    '!**/src/routes/**',
    // Exclude simple middleware
    '!**/src/middleware/error-handler.ts',
    '!**/src/middleware/not-found.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    // Security-critical modules require high coverage
    './packages/secrets/src/validators.ts': {
      branches: 80,
      functions: 100,
      lines: 90,
      statements: 90,
    },
    './packages/auth/src/jwt.ts': {
      branches: 70,
      functions: 100,
      lines: 85,
      statements: 85,
    },
    './apps/api-gateway/src/middleware/account-lockout.ts': {
      branches: 40,
      functions: 70,
      lines: 50,
      statements: 50,
    },
  },
  projects: [
    '<rootDir>/packages/secrets',
    '<rootDir>/packages/auth',
    '<rootDir>/packages/validation',
    '<rootDir>/packages/file-upload',
    '<rootDir>/packages/audit',
    '<rootDir>/apps/api-gateway',
    '<rootDir>/apps/api-health-safety',
    '<rootDir>/apps/api-quality',
  ],
  moduleNameMapper: {
    '^@ims/(.*)$': '<rootDir>/packages/$1/src',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  verbose: true,
};
