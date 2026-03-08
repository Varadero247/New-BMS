// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
/** @type {import('jest').Config} */
module.exports = {
  // Use projects mode: each workspace runs its own jest config in parallel
  projects: [
    // API services
    '<rootDir>/apps/api-aerospace',
    '<rootDir>/apps/api-ai-analysis',
    '<rootDir>/apps/api-analytics',
    '<rootDir>/apps/api-assets',
    '<rootDir>/apps/api-audits',
    '<rootDir>/apps/api-automotive',
    '<rootDir>/apps/api-cmms',
    '<rootDir>/apps/api-complaints',
    '<rootDir>/apps/api-contracts',
    '<rootDir>/apps/api-crm',
    '<rootDir>/apps/api-documents',
    '<rootDir>/apps/api-energy',
    '<rootDir>/apps/api-environment',
    '<rootDir>/apps/api-esg',
    '<rootDir>/apps/api-field-service',
    '<rootDir>/apps/api-finance',
    '<rootDir>/apps/api-food-safety',
    '<rootDir>/apps/api-gateway',
    '<rootDir>/apps/api-health-safety',
    '<rootDir>/apps/api-hr',
    '<rootDir>/apps/api-incidents',
    '<rootDir>/apps/api-infosec',
    '<rootDir>/apps/api-inventory',
    '<rootDir>/apps/api-iso37001',
    '<rootDir>/apps/api-iso42001',
    '<rootDir>/apps/api-marketing',
    '<rootDir>/apps/api-medical',
    '<rootDir>/apps/api-mgmt-review',
    '<rootDir>/apps/api-partners',
    '<rootDir>/apps/api-payroll',
    '<rootDir>/apps/api-setup-wizard',
    '<rootDir>/apps/api-portal',
    '<rootDir>/apps/api-project-management',
    '<rootDir>/apps/api-ptw',
    '<rootDir>/apps/api-quality',
    '<rootDir>/apps/api-reg-monitor',
    '<rootDir>/apps/api-risk',
    '<rootDir>/apps/api-suppliers',
    '<rootDir>/apps/api-training',
    '<rootDir>/apps/api-workflows',
    '<rootDir>/apps/api-chemicals',
    '<rootDir>/apps/api-emergency',
    // Web apps
    '<rootDir>/apps/web-dashboard',
    '<rootDir>/apps/web-marketing',
    '<rootDir>/apps/web-quality',
    '<rootDir>/apps/web-health-safety',
    '<rootDir>/apps/web-risk',
    '<rootDir>/apps/web-esg',
    // Web apps — Phase 134 specification tests
    '<rootDir>/apps/web-admin',
    '<rootDir>/apps/web-aerospace',
    '<rootDir>/apps/web-analytics',
    '<rootDir>/apps/web-assets',
    '<rootDir>/apps/web-audits',
    '<rootDir>/apps/web-automotive',
    '<rootDir>/apps/web-chemicals',
    '<rootDir>/apps/web-cmms',
    '<rootDir>/apps/web-complaints',
    '<rootDir>/apps/web-contracts',
    '<rootDir>/apps/web-crm',
    '<rootDir>/apps/web-customer-portal',
    '<rootDir>/apps/web-documents',
    '<rootDir>/apps/web-emergency',
    '<rootDir>/apps/web-energy',
    '<rootDir>/apps/web-environment',
    '<rootDir>/apps/web-field-service',
    '<rootDir>/apps/web-finance',
    '<rootDir>/apps/web-finance-compliance',
    '<rootDir>/apps/web-food-safety',
    '<rootDir>/apps/web-hr',
    '<rootDir>/apps/web-incidents',
    '<rootDir>/apps/web-infosec',
    '<rootDir>/apps/web-inventory',
    '<rootDir>/apps/web-iso37001',
    '<rootDir>/apps/web-iso42001',
    '<rootDir>/apps/web-medical',
    '<rootDir>/apps/web-mgmt-review',
    '<rootDir>/apps/web-partners',
    '<rootDir>/apps/web-payroll',
    '<rootDir>/apps/web-project-management',
    '<rootDir>/apps/web-ptw',
    '<rootDir>/apps/web-reg-monitor',
    '<rootDir>/apps/web-settings',
    '<rootDir>/apps/web-supplier-portal',
    '<rootDir>/apps/web-suppliers',
    '<rootDir>/apps/web-training',
    '<rootDir>/apps/web-workflows',
    // Shared packages
    '<rootDir>/packages/shared',
    '<rootDir>/packages/audit',
    '<rootDir>/packages/auth',
    '<rootDir>/packages/automation-rules',
    '<rootDir>/packages/benchmarks',
    '<rootDir>/packages/database',
    '<rootDir>/packages/email',
    '<rootDir>/packages/emission-factors',
    '<rootDir>/packages/environmental-monitoring',
    '<rootDir>/packages/esig',
    '<rootDir>/packages/event-bus',
    '<rootDir>/packages/file-upload',
    '<rootDir>/packages/finance-calculations',
    '<rootDir>/packages/iso-checklists',
    '<rootDir>/packages/monitoring',
    '<rootDir>/packages/nlq',
    '<rootDir>/packages/notifications',
    '<rootDir>/packages/oee-engine',
    '<rootDir>/packages/pdf-generator',
    '<rootDir>/packages/portal-auth',
    '<rootDir>/packages/rbac',
    '<rootDir>/packages/regulatory-feed',
    '<rootDir>/packages/resilience',
    '<rootDir>/packages/secrets',
    '<rootDir>/packages/service-auth',
    '<rootDir>/packages/spc-engine',
    '<rootDir>/packages/standards-convergence',
    '<rootDir>/packages/status',
    '<rootDir>/packages/tax-engine',
    '<rootDir>/packages/validation',
    '<rootDir>/packages/pwa',
    '<rootDir>/packages/theming',
    '<rootDir>/packages/i18n',
    '<rootDir>/packages/webhooks',
    '<rootDir>/packages/sentry',
    // New packages with tests (added Feb 19, 2026)
    '<rootDir>/packages/calculations',
    '<rootDir>/packages/activity',
    '<rootDir>/packages/tasks',
    '<rootDir>/packages/nps',
    '<rootDir>/packages/changelog',
    '<rootDir>/packages/readiness',
    '<rootDir>/packages/plan-guard',
    '<rootDir>/packages/feature-flags',
    // New packages (added Feb 20, 2026 — 100% score sprint)
    '<rootDir>/packages/security',
    // Templates package (added Feb 20, 2026)
    '<rootDir>/packages/templates',
    // Packages with existing tests discovered Feb 20 (were missing from projects list)
    '<rootDir>/packages/a11y',
    '<rootDir>/packages/csv-import',
    '<rootDir>/packages/encryption',
    '<rootDir>/packages/performance',
    '<rootDir>/packages/performance-kpi',
    // New test suites added Feb 20 (Session 23+)
    '<rootDir>/packages/comments',
    '<rootDir>/packages/cache',
    '<rootDir>/packages/dpa',
    '<rootDir>/packages/dsar',
    '<rootDir>/packages/scheduled-reports',
    // SDK package
    '<rootDir>/packages/sdk',
    // OpenAPI spec generator
    '<rootDir>/packages/openapi',
    // Third-party API clients
    '<rootDir>/packages/hubspot-client',
    '<rootDir>/packages/intercom-client',
    '<rootDir>/packages/stripe-client',
    // Presence / record locking
    '<rootDir>/packages/presence',
    // Shared type utilities
    '<rootDir>/packages/types',
    // UI package utility functions
    '<rootDir>/packages/ui',
    // Testing utilities package
    '<rootDir>/packages/testing',
    // Charts package (logic tests)
    '<rootDir>/packages/charts',
    // Implementation acceleration packages (added Feb 24, 2026)
    '<rootDir>/packages/migration-assistant',
    '<rootDir>/packages/instant-start',
    '<rootDir>/packages/sync-engine',
    '<rootDir>/packages/bamboohr-client',
    '<rootDir>/packages/workday-client',
    '<rootDir>/packages/sap-client',
    '<rootDir>/packages/dynamics-client',
    '<rootDir>/packages/xero-client',
    '<rootDir>/packages/command-palette',
    // Q1 2026 Strategic Recommendations packages
    '<rootDir>/packages/keyboard-shortcuts',
    '<rootDir>/packages/knowledge-base',
    '<rootDir>/packages/bulk-actions',
    '<rootDir>/packages/inline-edit',
    '<rootDir>/packages/deep-links',
    '<rootDir>/packages/search',
    // Q2–Q4 2026 Strategic Recommendations packages
    '<rootDir>/packages/graphql-schema',
    '<rootDir>/packages/collab',
    '<rootDir>/packages/workflow-builder',
    '<rootDir>/packages/report-builder',
    '<rootDir>/packages/risk-ml',
    '<rootDir>/packages/iot-gateway',
    '<rootDir>/packages/plugin-registry',
    '<rootDir>/packages/developer-portal',
    // Q2–Q4 new packages (batch 2)
    '<rootDir>/packages/bulk-export',
    '<rootDir>/packages/onboarding-flow',
    '<rootDir>/packages/embedded-bi',
    '<rootDir>/packages/ai-root-cause',
    '<rootDir>/packages/ai-container',
    '<rootDir>/packages/ai-security',
    '<rootDir>/packages/cyber-security',
    // Global Search microservice
    '<rootDir>/apps/api-search',
    // APAC Regional Localisation service
    '<rootDir>/apps/api-regional',
    // Q2–Q4 new packages (batch 3) — AI/form/vision/chain
    '<rootDir>/packages/ai-autofill',
    '<rootDir>/packages/form-builder',
    '<rootDir>/packages/vision-inspect',
    '<rootDir>/packages/chain-audit',
    '<rootDir>/packages/anomaly-detector',
    // Strategic recommendations packages (added Feb 24, 2026 — batch 4)
    '<rootDir>/packages/rule-engine',
    '<rootDir>/packages/kanban-engine',
    '<rootDir>/packages/ab-testing',
    '<rootDir>/packages/gantt-engine',
    '<rootDir>/packages/data-pipeline',
    '<rootDir>/packages/doc-classifier',
    '<rootDir>/packages/score-engine',
    '<rootDir>/packages/timeline-engine',
    '<rootDir>/packages/budget-engine',
    '<rootDir>/packages/checklist-engine',
    '<rootDir>/packages/approval-flow',
    '<rootDir>/packages/geo-utils',
    '<rootDir>/packages/crypto-utils',
    // Strategic recommendations packages (added Feb 24, 2026 — batch 5)
    '<rootDir>/packages/event-sourcing',
    // type-utils (added Feb 25, 2026)
    '<rootDir>/packages/type-utils',
    // measurement-utils (added Feb 25, 2026)
    '<rootDir>/packages/measurement-utils',
    '<rootDir>/packages/price-engine',
    '<rootDir>/packages/date-utils',
    '<rootDir>/packages/matrix-utils',
    '<rootDir>/packages/filter-engine',
    '<rootDir>/packages/unit-converter',
    '<rootDir>/packages/kpi-engine',
    '<rootDir>/packages/locale-utils',
    '<rootDir>/packages/string-utils',
    '<rootDir>/packages/pagination',
    '<rootDir>/packages/compliance-rules',
    '<rootDir>/packages/import-validator',
    '<rootDir>/packages/audit-formatter',
    // Strategic recommendations packages (added Feb 24, 2026 — batch 6)
    '<rootDir>/packages/number-utils',
    '<rootDir>/packages/color-utils',
    '<rootDir>/packages/array-utils',
    '<rootDir>/packages/object-utils',
    '<rootDir>/packages/url-utils',
    '<rootDir>/packages/text-analytics',
    '<rootDir>/packages/duration-utils',

    // Phase 74 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/formula-engine',
    '<rootDir>/packages/alerting-engine',
    '<rootDir>/packages/chart-utils',
    '<rootDir>/packages/format-utils',
    '<rootDir>/packages/tree-utils',

    // Phase 75 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/diff-utils',
    '<rootDir>/packages/graph-utils',

    // graph-algorithms-2 package (added Feb 25, 2026)
    '<rootDir>/packages/graph-algorithms-2',

    '<rootDir>/packages/state-machine',
    '<rootDir>/packages/event-utils',
    '<rootDir>/packages/schema-builder',

    // Phase 76 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/parser-utils',
    '<rootDir>/packages/sort-utils',
    '<rootDir>/packages/math-utils',

    // statistics package (added Feb 25, 2026)
    '<rootDir>/packages/statistics',

    // matrix-ops package (added Feb 25, 2026)
    '<rootDir>/packages/matrix-ops',
    '<rootDir>/packages/codec-utils',
    '<rootDir>/packages/promise-utils',

    // Phase 77 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/queue-utils',
    '<rootDir>/packages/random-utils',
    '<rootDir>/packages/time-utils',
    '<rootDir>/packages/xml-utils',
    '<rootDir>/packages/path-utils',

    // Phase 78 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/collection-utils',

    // set-operations package (added Feb 25, 2026)
    '<rootDir>/packages/set-operations',
    '<rootDir>/packages/template-engine',
    '<rootDir>/packages/markdown-utils',
    '<rootDir>/packages/stream-utils',
    '<rootDir>/packages/csv-utils',

    // Phase 79 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/regex-utils',
    '<rootDir>/packages/binary-utils',
    '<rootDir>/packages/log-utils',
    '<rootDir>/packages/validator-utils',
    '<rootDir>/packages/config-utils',

    // Phase 80 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/http-utils',
    '<rootDir>/packages/ip-utils',
    '<rootDir>/packages/money-utils',
    '<rootDir>/packages/table-utils',
    '<rootDir>/packages/fuzzy-utils',

    // Phase 81 utility packages (added Feb 24, 2026)
    '<rootDir>/packages/jwt-utils',
    '<rootDir>/packages/phone-utils',
    '<rootDir>/packages/semver-utils',
    '<rootDir>/packages/search-utils',
    '<rootDir>/packages/circular-linked-list',
    '<rootDir>/packages/file-utils',
    '<rootDir>/packages/lazy-utils',
    '<rootDir>/packages/builder-pattern',
    '<rootDir>/packages/animation-utils',
    '<rootDir>/packages/reactive-utils',
    '<rootDir>/packages/dependency-graph',
    '<rootDir>/packages/html-utils',
    '<rootDir>/packages/observer-utils',
    '<rootDir>/packages/lru-cache-2',

    // caching-strategies package (added Feb 25, 2026)
    '<rootDir>/packages/caching-strategies',
    '<rootDir>/packages/pattern-match',

    // string-template package (added Feb 25, 2026)
    '<rootDir>/packages/string-template',

    // Phase 82 utility packages
    '<rootDir>/packages/tz-utils',

    // Email address utilities package (added Feb 24, 2026)
    '<rootDir>/packages/email-utils',

    // Cron expression utilities package (added Feb 24, 2026)
    '<rootDir>/packages/cron-utils',

    // Phase 82 gap-closing packages (added Feb 25, 2026)
    '<rootDir>/packages/totp-utils',
    '<rootDir>/packages/stats-utils',
    '<rootDir>/packages/slug-utils',
    '<rootDir>/packages/compression-utils',
    // error-correction package (added Feb 25, 2026)
    '<rootDir>/packages/cryptography-utils',
    // error-correction package (added Feb 25, 2026)
    '<rootDir>/packages/error-correction',
    // signal-processing package (added Feb 25, 2026)
    '<rootDir>/packages/signal-processing',
    // protocol-utils package (added Feb 25, 2026)
    '<rootDir>/packages/protocol-utils',
    // concurrency-utils package (added Feb 25, 2026)
    '<rootDir>/packages/concurrency-utils',
    // data-validation package (added Feb 25, 2026)
    '<rootDir>/packages/data-validation',
    // pipeline-utils (added Feb 25, 2026)
    '<rootDir>/packages/pipeline-utils',
    '<rootDir>/packages/observable',
    '<rootDir>/packages/business-calendar',
    '<rootDir>/packages/barcode-utils',

    // Phase 83 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/retry-utils',

    // Phase 84 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/hash-utils',

    // Phase 85 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/uuid-utils',

    // Phase 86 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/mime-utils',

    // Phase 87 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/sanitize-utils',

    // Phase 88 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/i18n-formatter',

    // Phase 88 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/event-emitter',

    // quadtree package (added Feb 25, 2026)
    '<rootDir>/packages/quadtree',

    // Phase 84 utility packages — feature-toggle (added Feb 25, 2026)
    '<rootDir>/packages/feature-toggle',

    // Phase 84 utility packages
    '<rootDir>/packages/qr-utils',

    // Phase 84 utility packages
    '<rootDir>/packages/pdf-utils',

    // Phase 85 utility packages
    '<rootDir>/packages/cache-strategy',
    '<rootDir>/packages/metric-utils',

    // Phase 85 utility packages
    '<rootDir>/packages/rate-limit-utils',

    // Phase 85 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/expression-eval',

    // Phase 85 utility packages
    '<rootDir>/packages/text-diff',

    // Phase 85 utility packages — locale-detect (added Feb 25, 2026)
    '<rootDir>/packages/locale-detect',

    // Phase 86 utility packages (added Feb 25, 2026)
    '<rootDir>/packages/result-type',

    // query-builder package (added Feb 25, 2026)
    '<rootDir>/packages/query-builder',

    // task-queue package (added Feb 25, 2026)
    '<rootDir>/packages/task-queue',

    // state-utils package (added Feb 25, 2026)
    '<rootDir>/packages/state-utils',
    // functional-utils package (added Feb 25, 2026)
    '<rootDir>/packages/functional-utils',
    // serialization-utils package (added Feb 25, 2026)
    '<rootDir>/packages/serialization-utils',
    // geometry-2d package (added Feb 25, 2026)
    '<rootDir>/packages/geometry-2d',

    // bloom-filter package (added Feb 25, 2026)
    '<rootDir>/packages/bloom-filter',

    // bloom-filter-2 package (added Feb 25, 2026)
    '<rootDir>/packages/bloom-filter-2',
    // hash-table package (added Feb 25, 2026)
    '<rootDir>/packages/hash-table',

    // trie package (added Feb 25, 2026)
    '<rootDir>/packages/trie',

    // message-bus package (added Feb 25, 2026)
    '<rootDir>/packages/message-bus',

    // circuit-breaker package (added Feb 25, 2026)
    '<rootDir>/packages/circuit-breaker',

    // health-check package (added Feb 25, 2026)
    '<rootDir>/packages/health-check',

    // lru-map package (added Feb 25, 2026)
    '<rootDir>/packages/lru-map',

    // interval-tree package (added Feb 25, 2026)
    '<rootDir>/packages/interval-tree',

    // interval-tree-2 package (added Feb 25, 2026)
    '<rootDir>/packages/interval-tree-2',

    // z-algorithm package (added Feb 26, 2026)
    '<rootDir>/packages/z-algorithm',

    // union-find package (added Feb 25, 2026)
    '<rootDir>/packages/union-find',

    // sliding-window package (added Feb 25, 2026)
    '<rootDir>/packages/sliding-window',

    // finite-automata package (added Feb 25, 2026)
    '<rootDir>/packages/finite-automata',

    // segment-tree package (added Feb 25, 2026)
    '<rootDir>/packages/segment-tree',
    // segment-tree-2 package (added Feb 25, 2026)
    '<rootDir>/packages/segment-tree-2',

    // avl-tree package (added Feb 25, 2026)
    '<rootDir>/packages/avl-tree',

    // fenwick-tree package (added Feb 25, 2026)
    '<rootDir>/packages/fenwick-tree',
    // merkle-tree package (added Feb 25, 2026)
    '<rootDir>/packages/merkle-tree',

    // deque package (added Feb 25, 2026)
    '<rootDir>/packages/deque',

    // heap-utils package (added Feb 25, 2026)
    '<rootDir>/packages/heap-utils',

    // sorting-algorithms package (added Feb 25, 2026)
    '<rootDir>/packages/sorting-algorithms',

    // scheduling-algorithms package (added Feb 25, 2026)
    '<rootDir>/packages/scheduling-algorithms',

    // suffix-array package (added Feb 25, 2026)
    '<rootDir>/packages/suffix-array',

    // string-search package (added Feb 25, 2026)
    '<rootDir>/packages/string-search',

    // text-search package (added Feb 25, 2026)
    '<rootDir>/packages/text-search',

    // graph-algorithms package
    '<rootDir>/packages/graph-algorithms',

    // lfu-cache package (added Feb 25, 2026)
    '<rootDir>/packages/lfu-cache',

    // red-black-tree package (added Feb 25, 2026)
    '<rootDir>/packages/red-black-tree',

    // number-theory package (added Feb 25, 2026)
    '<rootDir>/packages/number-theory',

    // dynamic-programming package (added Feb 25, 2026)
    '<rootDir>/packages/dynamic-programming',

    // optimization-algorithms package (added Feb 25, 2026)
    '<rootDir>/packages/optimization-algorithms',

    // geometry-utils package (added Feb 25, 2026)
    '<rootDir>/packages/geometry-utils',

    // bitset package (added Feb 25, 2026)
    '<rootDir>/packages/bitset',

    // combinatorics package (added Feb 25, 2026)
    '<rootDir>/packages/combinatorics',

    // linear-algebra package (added Feb 25, 2026)
    '<rootDir>/packages/linear-algebra',

    // probability package (added Feb 25, 2026)
    '<rootDir>/packages/probability',

    // optimization package (added Feb 25, 2026)
    '<rootDir>/packages/optimization',

    // huffman package (added Feb 25, 2026)
    '<rootDir>/packages/huffman',

    // time-series package (added Feb 25, 2026)
    { displayName: 'time-series', testMatch: ['<rootDir>/packages/time-series/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // fft package (added Feb 25, 2026)
    { displayName: 'fft', testMatch: ['<rootDir>/packages/fft/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // markov-chain package (added Feb 25, 2026)
    { displayName: 'markov-chain', testMatch: ['<rootDir>/packages/markov-chain/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // neural-net package (added Feb 25, 2026)
    { displayName: 'neural-net', testMatch: ['<rootDir>/packages/neural-net/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // treap package (added Feb 25, 2026)
    { displayName: 'treap', testMatch: ['<rootDir>/packages/treap/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // b-tree package (added Feb 25, 2026)
    { displayName: 'b-tree', testMatch: ['<rootDir>/packages/b-tree/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // b-plus-tree package (added Feb 25, 2026)
    { displayName: 'b-plus-tree', testMatch: ['<rootDir>/packages/b-plus-tree/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // cache-replacement package (added Feb 25, 2026)
    { displayName: 'cache-replacement', testMatch: ['<rootDir>/packages/cache-replacement/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // rope-structure package (added Feb 25, 2026)
    { displayName: 'rope-structure', testMatch: ['<rootDir>/packages/rope-structure/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // persistent-ds package (added Feb 25, 2026)
    { displayName: 'persistent-ds', testMatch: ['<rootDir>/packages/persistent-ds/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // spatial-index package (added Feb 25, 2026)
    { displayName: 'spatial-index', testMatch: ['<rootDir>/packages/spatial-index/src/__tests__/**/*.test.ts'], transform: { '^.+\\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },
    // finger-tree package (added Feb 25, 2026)
    { displayName: 'finger-tree', testMatch: ['<rootDir>/packages/finger-tree/src/__tests__/**/*.test.ts'], transform: { '^.+\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },
    // van-emde-boas package (added Feb 25, 2026)
    '<rootDir>/packages/van-emde-boas',
    // disjoint-set package (added Feb 25, 2026)
    '<rootDir>/packages/disjoint-set',
    // cartesian-tree package (added Feb 25, 2026)
    '<rootDir>/packages/cartesian-tree',
    // k-d-tree package (added Feb 25, 2026)
    '<rootDir>/packages/k-d-tree',
    // i18n-utils package (added Feb 25, 2026)
    { displayName: 'i18n-utils', testMatch: ['<rootDir>/packages/i18n-utils/src/__tests__/**/*.test.ts'], transform: { '^.+\.tsx?$': ['ts-jest', { isolatedModules: true, diagnostics: false }] }, testEnvironment: 'node' },

    // splay-tree package (added Feb 25, 2026)
    '<rootDir>/packages/splay-tree',
  '<rootDir>/packages/dependency-injection',

  // command-pattern package (added Feb 25, 2026)
  '<rootDir>/packages/command-pattern',
  // accessibility-utils package (added Feb 25, 2026)
  '<rootDir>/packages/accessibility-utils',
  // immutable-utils package (added Feb 25, 2026)
  '<rootDir>/packages/immutable-utils',
  // Phase 103 packages (added Feb 25, 2026)
  '<rootDir>/packages/finite-state-machine',
  '<rootDir>/packages/cache-utils',
  '<rootDir>/packages/async-utils',
  '<rootDir>/packages/storage-utils',
  '<rootDir>/packages/network-utils',
  '<rootDir>/packages/error-utils',
  '<rootDir>/packages/permission-utils',
  '<rootDir>/packages/event-replay',
  // Phase 103 final packages (added Feb 25, 2026)
  '<rootDir>/packages/runtime-utils',
  '<rootDir>/packages/crypto-primitives',
  '<rootDir>/packages/task-scheduler',
  // Phase 104 packages (added Feb 25, 2026)
  '<rootDir>/packages/locale-format',
  '<rootDir>/packages/signal-utils',
  '<rootDir>/packages/cache-store',
  '<rootDir>/packages/text-analysis',
  '<rootDir>/packages/config-schema',
  // Phase 105 packages (added Feb 25, 2026)
  '<rootDir>/packages/vector-math',
  '<rootDir>/packages/interval-utils',
  '<rootDir>/packages/color-convert',
  '<rootDir>/packages/mime-types',
  '<rootDir>/packages/deep-utils',
  // Phase 106 packages (added Feb 25, 2026)
  '<rootDir>/packages/bezier',
  '<rootDir>/packages/easing-functions',
  '<rootDir>/packages/noise-gen',
  '<rootDir>/packages/quaternion',
  '<rootDir>/packages/interpolation',
  '<rootDir>/packages/audit-trail',
  '<rootDir>/packages/unit-of-work',
  // Phase 107 packages (added Feb 25, 2026)
  '<rootDir>/packages/rope-data-structure',
  '<rootDir>/packages/trie-search',
  '<rootDir>/packages/lru-cache',
  '<rootDir>/packages/priority-queue',
  // Phase 108 packages (added Feb 25, 2026)
  '<rootDir>/packages/string-algorithms',
  '<rootDir>/packages/aho-corasick',
  '<rootDir>/packages/ring-buffer',
  '<rootDir>/packages/fibonacci-heap',
  '<rootDir>/packages/convex-hull',
  '<rootDir>/packages/scapegoat-tree',
  '<rootDir>/packages/wavelet-tree',
  // Phase 110 packages (added Feb 25, 2026)
  '<rootDir>/packages/bit-manipulation',
  '<rootDir>/packages/string-hashing',
  '<rootDir>/packages/edit-distance',
  '<rootDir>/packages/double-ended-queue',
  '<rootDir>/packages/order-statistics-tree',
  // persistent-segment-tree package (added Feb 26, 2026)
  '<rootDir>/packages/persistent-segment-tree',
  // galois-field package (added Feb 26, 2026)
  '<rootDir>/packages/galois-field',
  // vp-tree package (added Feb 26, 2026)
  '<rootDir>/packages/vp-tree',
  // suffix-automaton package (added Feb 26, 2026)
  '<rootDir>/packages/suffix-automaton',
  // hyperloglog package (added Feb 26, 2026)
  '<rootDir>/packages/hyperloglog',
  // count-min-sketch package (added Feb 26, 2026)
  '<rootDir>/packages/count-min-sketch',
  // dancing-links package (added Feb 26, 2026)
  '<rootDir>/packages/dancing-links',
  // link-cut-tree package (added Feb 26, 2026)
  '<rootDir>/packages/link-cut-tree',
  // cuckoo-hash package (added Feb 26, 2026)
  '<rootDir>/packages/cuckoo-hash',
  // auto-diff package (added Feb 26, 2026)
  '<rootDir>/packages/auto-diff',
  // hungarian-algorithm package (added Feb 26, 2026)
  '<rootDir>/packages/hungarian-algorithm',
  // simplex-method package (added Feb 26, 2026)
  '<rootDir>/packages/simplex-method',
  // regex-engine package (added Feb 26, 2026)
  '<rootDir>/packages/regex-engine',
  // lsh package (added Feb 26, 2026)
  '<rootDir>/packages/lsh',
  // treap package (added Feb 26, 2026)
  '<rootDir>/packages/treap',
  // sparse-table package (added Feb 26, 2026)
  '<rootDir>/packages/sparse-table',
  // monotone-queue package (added Feb 26, 2026)
  '<rootDir>/packages/monotone-queue',
  // network-flow package (added Feb 26, 2026)
  '<rootDir>/packages/network-flow',
  // polynomial package (added Feb 26, 2026)
  '<rootDir>/packages/polynomial',
  // sampling package (added Feb 26, 2026)
  '<rootDir>/packages/sampling',
  // disjoint-sets package (added Feb 26, 2026)
  '<rootDir>/packages/disjoint-sets',
  // rope package (added Feb 26, 2026)
  '<rootDir>/packages/rope',
  // kd-tree package (added Feb 26, 2026)
  '<rootDir>/packages/kd-tree',
  // skip-list package (added Feb 26, 2026)
  '<rootDir>/packages/skip-list',
  // heavy-light-decomposition package (added Feb 26, 2026)
  '<rootDir>/packages/heavy-light-decomposition',
  // interval-scheduling package (added Feb 26, 2026)
  '<rootDir>/packages/interval-scheduling',
  // centroid-decomposition package (added Feb 26, 2026)
  '<rootDir>/packages/centroid-decomposition',
  // linear-recurrence package (added Feb 26, 2026)
  '<rootDir>/packages/linear-recurrence',
  // Phase 119 packages: security/governance (added Feb 26, 2026)
  '<rootDir>/packages/threat-intel',
  '<rootDir>/packages/data-governance',
  '<rootDir>/packages/security-scanner',
  '<rootDir>/packages/incident-response',
  '<rootDir>/packages/compliance-automation',
  // supply-chain-risk package (added Feb 26, 2026)
  '<rootDir>/packages/supply-chain-risk',
  // change-management package (added Feb 26, 2026)
  '<rootDir>/packages/change-management',
  // business-continuity package (added Feb 26, 2026)
  '<rootDir>/packages/business-continuity',
  // document-control package (added Feb 26, 2026)
  '<rootDir>/packages/document-control',
  // asset-lifecycle package (added Feb 26, 2026)
  '<rootDir>/packages/asset-lifecycle',
  // training-tracker package (added Feb 26, 2026)
  '<rootDir>/packages/training-tracker',
  // corrective-action package (added Feb 26, 2026)
  '<rootDir>/packages/corrective-action',
  // stakeholder-management package (added Feb 26, 2026)
  '<rootDir>/packages/stakeholder-management',
  // quality-control package (added Feb 26, 2026)
  '<rootDir>/packages/quality-control',
  // legal-register package (added Feb 26, 2026)
  '<rootDir>/packages/legal-register',
  // meeting-management package (added Feb 26, 2026)
  '<rootDir>/packages/meeting-management',
  // objective-tracker package (added Feb 26, 2026)
  '<rootDir>/packages/objective-tracker',
  // supplier-evaluation package (added Feb 26, 2026)
  '<rootDir>/packages/supplier-evaluation',
  // audit-management package (added Feb 26, 2026)
  '<rootDir>/packages/audit-management',
  // equipment-calibration package (added Feb 26, 2026)
  '<rootDir>/packages/equipment-calibration',
  // risk-register package (added Feb 26, 2026)
  '<rootDir>/packages/risk-register',
  // permit-to-work package (added Feb 26, 2026)
  '<rootDir>/packages/permit-to-work',
  // contractor-management package (added Feb 26, 2026)
  '<rootDir>/packages/contractor-management',
  // inspection-management package (added Feb 26, 2026)
  '<rootDir>/packages/inspection-management',
  // waste-management package (added Feb 26, 2026)
  '<rootDir>/packages/waste-management',
  // complaint-management package (added Feb 26, 2026)
  '<rootDir>/packages/complaint-management',
  // energy-monitoring package (added Feb 26, 2026)
  '<rootDir>/packages/energy-monitoring',
  // Training Portal web app (added Feb 28, 2026)
  '<rootDir>/apps/web-training-portal',
  // Onboarding web app (added Mar 8, 2026 — Phase 135)
  '<rootDir>/apps/web-onboarding',
  // Regional Dashboard (added Mar 8, 2026 — Phase 138)
  '<rootDir>/apps/web-regional-dashboard',
  // Mobile app — regional screens (added Mar 8, 2026 — Phase 139)
  '<rootDir>/apps/mobile',
  // @ims/regional-data (added Mar 8, 2026 — Phase 141)
  '<rootDir>/packages/regional-data',
  // @ims/chemical-register (added Mar 8, 2026 — Phase 142)
  '<rootDir>/packages/chemical-register',
  // @ims/administrator-training (added Mar 8, 2026 — Phase 143)
  '<rootDir>/packages/administrator-training',
  // @ims/end-user-training (added Mar 8, 2026 — Phase 143)
  '<rootDir>/packages/end-user-training',
  // @ims/module-owner-training (added Mar 8, 2026 — Phase 143)
  '<rootDir>/packages/module-owner-training',
  // @ims/train-the-trainer (added Mar 8, 2026 — Phase 146)
  '<rootDir>/packages/train-the-trainer',

  // 12 algorithm/utility packages (added Mar 8, 2026 — Phase 149)
  '<rootDir>/packages/b-plus-tree',
  '<rootDir>/packages/b-tree',
  '<rootDir>/packages/cache-replacement',
  '<rootDir>/packages/fft',
  '<rootDir>/packages/finger-tree',
  '<rootDir>/packages/i18n-utils',
  '<rootDir>/packages/markov-chain',
  '<rootDir>/packages/neural-net',
  '<rootDir>/packages/persistent-ds',
  '<rootDir>/packages/rope-structure',
  '<rootDir>/packages/spatial-index',
  '<rootDir>/packages/time-series',
  ],


  // Global settings
  forceExit: true,
  detectOpenHandles: false,
  maxWorkers: '66%',
  workerIdleMemoryLimit: '1GB',
  testTimeout: 60000,

  // Coverage thresholds (enforced when --coverage is passed)
  coverageThreshold: {
    global: {
      statements: 70,
      branches: 60,
      functions: 65,
      lines: 70,
    },
    // Security-critical packages require higher coverage
    './packages/auth/src/**': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './packages/rbac/src/**': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
    './packages/validation/src/**': {
      statements: 85,
      branches: 80,
      functions: 85,
      lines: 85,
    },
  },

  // Coverage (applied when --coverage is passed)
  coverageReporters: ['text', 'lcov'],
  coverageDirectory: '<rootDir>/coverage',
  collectCoverageFrom: [
    '**/*.{ts,tsx}',
    '!**/*.d.ts',
    '!**/node_modules/**',
    '!**/.next/**',
    '!**/dist/**',
    '!**/generated/**',
  ],
};
