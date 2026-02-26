// Copyright (c) 2026 Nexara DMCC. All rights reserved.
/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  transform: {
    "^.+\.tsx?$": [
      "ts-jest",
      {
        isolatedModules: true,
        diagnostics: false
      }
    ]
  }
};
