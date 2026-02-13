/** @type {import('jest').Config} */
module.exports = {
  displayName: 'oee-engine',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
