module.exports = {
  testEnvironment: "node",
  transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] },
};
