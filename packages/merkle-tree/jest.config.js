module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/*.test.part*.ts', '**/*.test.ts'],
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] },
};
