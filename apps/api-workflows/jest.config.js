/** @type {import('jest').Config} */
module.exports = {
  displayName: 'api-workflows',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        useESM: true,
        diagnostics: false,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/**/*.ts', '!src/index.ts'],
  moduleNameMapper: {
    '^@ims/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
