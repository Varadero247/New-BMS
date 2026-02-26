module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['**/__tests__/**/*.test.ts'],
  transform: { '^.+\.tsx?$': ['ts-jest', { tsconfig: 'tsconfig.json', isolatedModules: true, diagnostics: false }] },
  forceExit: true,
};
