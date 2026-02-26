// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/** @type {import('jest').Config} */
module.exports = {
  displayName: 'deque',
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }],
  },
};
