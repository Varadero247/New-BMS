/** @type {import('jest').Config} */
module.exports = {
  displayName: 'mobile',
  testEnvironment: 'node',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      isolatedModules: true,
      diagnostics: false,
      tsconfig: {
        jsx: 'react',
        module: 'commonjs',
        moduleResolution: 'node',
      },
    }],
  },
  testMatch: ['**/__tests__/**/*.spec.ts'],
  moduleNameMapper: {},
};
