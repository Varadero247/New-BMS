module.exports = {
  displayName: 'web-finance-compliance',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: { jsx: 'react-jsx', module: 'commonjs', moduleResolution: 'node', esModuleInterop: true, allowJs: true, strict: false },
      isolatedModules: true,
      diagnostics: false,
    }],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: { '^@/(.*)$': '<rootDir>/src/$1', '^@ims/(.*)$': '<rootDir>/../../packages/$1/src' },
};
