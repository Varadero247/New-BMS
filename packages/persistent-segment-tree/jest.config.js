module.exports = {
  displayName: 'persistent-segment-tree',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { tsconfig: { strict: false }, isolatedModules: true, diagnostics: false }]
  }
};
