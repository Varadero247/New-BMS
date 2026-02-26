// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
module.exports = {
  ci: {
    collect: {
      url: [
        'http://localhost:3000', // Dashboard
        'http://localhost:3001', // H&S
        'http://localhost:3002', // Environment
        'http://localhost:3003', // Quality
        'http://localhost:3004', // Settings
        'http://localhost:3005', // Inventory
        'http://localhost:3006', // HR
        'http://localhost:3013', // Finance
        'http://localhost:3014', // CRM
        'http://localhost:3015', // InfoSec
        'http://localhost:3016', // ESG
        'http://localhost:3017', // CMMS
        'http://localhost:3020', // Food Safety
        'http://localhost:3021', // Energy
        'http://localhost:3022', // Analytics
        'http://localhost:3023', // Field Service
      ],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        chromeFlags: '--no-sandbox --headless',
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
