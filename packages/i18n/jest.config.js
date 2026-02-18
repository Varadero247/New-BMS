/** @type {import('jest').Config} */
module.exports = {
  displayName: 'i18n',
  testEnvironment: 'jsdom',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts', '<rootDir>/__tests__/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        isolatedModules: true,
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^react$': '<rootDir>/__mocks__/react.js',
    '^react/jsx-runtime$': '<rootDir>/__mocks__/react-jsx-runtime.js',
  },
};
