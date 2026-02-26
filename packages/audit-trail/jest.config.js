// Copyright (c) 2026 Nexara DMCC. All rights reserved.
module.exports = { displayName: 'audit-trail', preset: 'ts-jest', testEnvironment: 'node', testMatch: ['**/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] } };
