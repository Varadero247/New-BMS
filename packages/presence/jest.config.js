/** @type {import('jest').Config} */
module.exports = {
  displayName: 'presence',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.test.json' }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: ['src/index.ts'],
};
