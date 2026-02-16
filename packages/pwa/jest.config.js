/** @type {import('jest').Config} */
module.exports = {
  displayName: 'pwa',
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { useESM: true, diagnostics: false }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};
