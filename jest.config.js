module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  
  // Force exit after tests complete
  forceExit: true,
  
  // Don't detect open handles (we're forcing exit anyway)
  detectOpenHandles: false,
  
  // Clear all mocks between tests
  clearMocks: true,
  
  // Timeouts
  testTimeout: 10000,
  
  // Performance
  maxWorkers: '50%',
  
  // Test files
  roots: ['<rootDir>/packages', '<rootDir>/apps'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/?(*.)+(spec|test).ts'],
  
  // TypeScript
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      diagnostics: false,
      tsconfig: {
        jsx: 'react',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },
  
  // Coverage
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
  ],
  
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  
  // Module mapping
  moduleNameMapper: {
    '^@ims/(.*)$': '<rootDir>/packages/$1/src',
  },
  
  // Setup
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  
  // Ignore
  testPathIgnorePatterns: ['/node_modules/', '/.next/', '/dist/'],
  
  // Extensions
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};
