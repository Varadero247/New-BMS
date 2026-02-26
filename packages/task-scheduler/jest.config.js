module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testTimeout: 10000,
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }]
  },
  testMatch: ['**/__tests__/**/*.test.ts']
};
