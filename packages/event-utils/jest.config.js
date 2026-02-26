module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] },
  testMatch: ['**/__tests__/**/*.test.ts'],
};
