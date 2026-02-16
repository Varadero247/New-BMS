module.exports = {
  displayName: 'web-dashboard',
  testEnvironment: 'node',
  rootDir: '.',
  testMatch: ['<rootDir>/src/**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true }] },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@ims/(.*)$': '<rootDir>/../../packages/$1/src',
  },
};
