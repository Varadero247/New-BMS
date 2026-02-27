# Shared Packages Reference — Nexara IMS

---
> **CONFIDENTIAL — TRADE SECRET**
> This document is the property of Nexara DMCC and contains confidential and
> proprietary information. Unauthorised disclosure is prohibited.
> © 2026 Nexara DMCC. All rights reserved.
---


391 shared packages in `packages/`. All use `@ims/*` scope.

---

## Package Directory

### Core Infrastructure

| Package             | Purpose                            | Key Exports                                                                                           |
| ------------------- | ---------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `@ims/database`     | Prisma client + 200+ model schemas | `prisma`, domain-specific clients                                                                     |
| `@ims/types`        | Shared TypeScript types and enums  | Type definitions                                                                                      |
| `@ims/shared`       | Common utilities                   | Formatters, validators, constants                                                                     |
| `@ims/auth`         | JWT authentication middleware      | `authenticateToken`, `verifyToken`                                                                    |
| `@ims/service-auth` | Inter-service JWT auth             | `generateServiceToken`, `verifyServiceToken`                                                          |
| `@ims/monitoring`   | Logging, metrics, health checks    | `createLogger`, `metricsMiddleware`, `metricsHandler`, `correlationIdMiddleware`, `createHealthCheck` |
| `@ims/validation`   | Zod validation schemas             | Schema definitions for requests                                                                       |
| `@ims/secrets`      | Secrets management                 | `validateStartupSecrets`                                                                              |

### Access Control and Security

| Package            | Purpose                                          | Key Exports                           |
| ------------------ | ------------------------------------------------ | ------------------------------------- |
| `@ims/rbac`        | Role-based access control (39 roles, 17 modules) | `attachPermissions`, role definitions |
| `@ims/portal-auth` | Portal authentication (customer/supplier)        | Portal auth middleware                |
| `@ims/dpa`         | Data Processing Agreements                       | DPA management                        |
| `@ims/dsar`        | Data Subject Access Requests (GDPR)              | DSAR handling                         |
| `@ims/esig`        | Electronic signature capture                     | Signature verification                |

### Communication

| Package              | Purpose                                 | Key Exports                            |
| -------------------- | --------------------------------------- | -------------------------------------- |
| `@ims/email`         | Email sending via Nodemailer            | `sendEmail`, templates                 |
| `@ims/notifications` | WebSocket real-time notifications       | Notification bell component            |
| `@ims/webhooks`      | Outbound webhook delivery               | Webhook dispatcher                     |
| `@ims/event-bus`     | Cross-service event bus (Redis Streams) | `NEXARA_EVENTS`, publisher, subscriber |

### UI and Frontend

| Package       | Purpose                                                       | Key Exports                                                       |
| ------------- | ------------------------------------------------------------- | ----------------------------------------------------------------- |
| `@ims/ui`     | React component library (76 components, 76 Storybook stories) | `Modal`, `Button`, `Table`, `DataTable`, `SignatureCapture`, etc. |
| `@ims/charts` | Recharts wrapper components                                   | Chart configurations                                              |
| `@ims/i18n`   | Internationalisation                                          | `I18nProvider`, `useTranslation`                                  |
| `@ims/pwa`    | Progressive Web App utilities                                 | Service worker, offline sync                                      |
| `@ims/a11y`   | Accessibility testing (axe-core WCAG 2.2 AA)                  | Audit runner                                                      |

### Domain Engines

| Package                     | Purpose                               | Key Exports            |
| --------------------------- | ------------------------------------- | ---------------------- |
| `@ims/calculations`         | Risk scoring, compliance calculations | Scoring functions      |
| `@ims/tax-engine`           | Multi-jurisdiction tax calculation    | Tax calculators        |
| `@ims/finance-calculations` | Financial utilities                   | Depreciation, ratios   |
| `@ims/emission-factors`     | GHG emission factor database          | Emission data          |
| `@ims/oee-engine`           | Overall Equipment Effectiveness       | OEE calculations       |
| `@ims/spc-engine`           | Statistical Process Control           | Control charts, Cp/Cpk |
| `@ims/nlq`                  | Natural language query engine         | Query parser           |
| `@ims/readiness`            | Audit readiness scoring               | Readiness engine       |

### Compliance and Standards

| Package                      | Purpose                                | Key Exports        |
| ---------------------------- | -------------------------------------- | ------------------ |
| `@ims/iso-checklists`        | ISO clause checklists                  | Checklist data     |
| `@ims/standards-convergence` | Cross-standard mapping (Annex SL)      | Convergence engine |
| `@ims/regulatory-feed`       | Live regulatory change feed            | Feed processor     |
| `@ims/templates`             | 192 built-in document/report templates | Template renderer  |

### Data and Integration

| Package              | Purpose                              | Key Exports                |
| -------------------- | ------------------------------------ | -------------------------- |
| `@ims/csv-import`    | CSV parsing and import               | CSV parser                 |
| `@ims/file-upload`   | File upload handling (S3-compatible) | Upload middleware          |
| `@ims/pdf-generator` | PDF generation from templates        | PDF builder                |
| `@ims/cache`         | Redis cache utilities                | `get`, `set`, `invalidate` |
| `@ims/openapi`       | OpenAPI/Swagger spec generation      | Spec builder               |

### External Service Clients

| Package                | Purpose                | Key Exports     |
| ---------------------- | ---------------------- | --------------- |
| `@ims/hubspot-client`  | HubSpot CRM API        | HubSpot client  |
| `@ims/stripe-client`   | Stripe payment API     | Stripe client   |
| `@ims/intercom-client` | Intercom messaging API | Intercom client |

### Automation and Operations

| Package                  | Purpose                             | Key Exports      |
| ------------------------ | ----------------------------------- | ---------------- |
| `@ims/automation-rules`  | Rule engine for automated workflows | Rule evaluator   |
| `@ims/scheduled-reports` | Cron-based report generation        | Report scheduler |
| `@ims/feature-flags`     | Feature flag system                 | Flag evaluator   |
| `@ims/plan-guard`        | Subscription plan enforcement       | Plan checker     |
| `@ims/resilience`        | Circuit breakers, retry logic       | Circuit breaker  |

### Activity and Tracking

| Package          | Purpose                     | Key Exports      |
| ---------------- | --------------------------- | ---------------- |
| `@ims/audit`     | Audit trail middleware      | Audit logger     |
| `@ims/activity`  | Activity logging middleware | Activity tracker |
| `@ims/presence`  | Real-time user presence     | Presence tracker |
| `@ims/nps`       | NPS survey system           | Survey collector |
| `@ims/comments`  | Threaded comments           | Comment system   |
| `@ims/changelog` | Changelog management        | Changelog CRUD   |
| `@ims/tasks`     | Task management             | Task primitives  |
| `@ims/status`    | System status page data     | Status checker   |

### Testing and Performance

| Package            | Purpose                            | Key Exports      |
| ------------------ | ---------------------------------- | ---------------- |
| `@ims/testing`     | Shared test utilities and fixtures | Test helpers     |
| `@ims/performance` | k6 load tests, Lighthouse CI, WCAG | Test runners     |
| `@ims/benchmarks`  | Performance benchmarking           | Benchmark runner |

### Public SDK

| Package    | Purpose                              | Key Exports                    |
| ---------- | ------------------------------------ | ------------------------------ |
| `@ims/sdk` | Public SDK for external integrations | `NexaraClient`, `NexaraConfig` |

---

## Utility Package Library (Phases 74–93)

These 119 packages were added in Phases 74–93 to provide zero-dependency utility functions used across the platform. All have ≥1,000 Jest tests.

### Phase 74–81 — Core Utility Packages

| Package | Purpose | Tests |
|---------|---------|-------|
| `@ims/formula-engine` | Spreadsheet-like formula evaluation | 1,000+ |
| `@ims/alerting-engine` | Threshold-based alert evaluation | 1,000+ |
| `@ims/chart-utils` | Chart data transformation/normalisation | 1,000+ |
| `@ims/format-utils` | Number/date/string formatting | 1,000+ |
| `@ims/tree-utils` | Generic tree traversal, flatten, search | 1,000+ |
| `@ims/diff-utils` | Object/array/string diffing, patch, merge | 1,000+ |
| `@ims/graph-utils` | Directed/undirected graph algorithms | 1,000+ |
| `@ims/state-machine` | Finite state machine (transitions, guards) | 1,000+ |
| `@ims/event-utils` | Event filtering, aggregation, debounce | 1,000+ |
| `@ims/schema-builder` | Runtime schema construction and validation | 1,000+ |
| `@ims/parser-utils` | CSV/INI/KV/query-string/expression parsing | 1,199 |
| `@ims/sort-utils` | 10 sort algorithms, multi-key, binary search | 1,941 |
| `@ims/math-utils` | Number theory, statistics, vector ops | 1,929 |
| `@ims/codec-utils` | Base64/hex/URI/HTML, CRC32, SHA-256, HMAC | 1,070 |
| `@ims/promise-utils` | Async utilities: parallel, race, retry, timeout | 1,000+ |
| `@ims/queue-utils` | Queue, Stack, Deque, PriorityQueue, CircularBuffer | 1,502 |
| `@ims/random-utils` | Seeded PRNG, UUID, shuffle, distributions | 1,544 |
| `@ims/time-utils` | Business days, scheduling, date arithmetic | 1,280 |
| `@ims/xml-utils` | XML parser/builder, tree transform, xmlToJson | 1,025 |
| `@ims/path-utils` | POSIX paths, URL utilities, glob, segments | 1,226 |
| `@ims/collection-utils` | Set ops, Map utils, BiMap, MultiSet | 1,006 |
| `@ims/template-engine` | Handlebars-like compile-then-render engine | 1,314 |
| `@ims/markdown-utils` | Markdown→HTML, extract, analyse, transform | 1,002 |
| `@ims/stream-utils` | 20 async-generator utilities | 1,001 |
| `@ims/csv-utils` | RFC 4180 parser/stringifier, schema validation | 1,041 |
| `@ims/regex-utils` | 30 pre-built patterns, fluent builder | 1,007 |
| `@ims/binary-utils` | Bit ops, flags, buffer read/write, varint | 1,725 |
| `@ims/log-utils` | Structured logger, formatters, transports | 1,347 |
| `@ims/validator-utils` | Chainable Validator, FormValidator, 25+ helpers | 1,052 |
| `@ims/config-utils` | Env parsing, deep-merge, schema validation | 1,021 |
| `@ims/http-utils` | HTTP status codes, MIME types, URL building | 1,032 |
| `@ims/ip-utils` | IPv4/IPv6 parse, CIDR arithmetic, classification | 1,127 |
| `@ims/money-utils` | BigInt monetary arithmetic, 30 ISO currencies | 1,420 |
| `@ims/table-utils` | SQL-style array-of-objects operations | 1,234 |
| `@ims/fuzzy-utils` | Levenshtein, Jaro-Winkler, Soundex, BM25 | 1,157 |
| `@ims/html-utils` | HTML sanitise, entity encode/decode, extract | 1,077 |
| `@ims/phone-utils` | 41-country E.164 parse/format, detection | 1,020 |
| `@ims/jwt-utils` | HS256/384/512 sign/verify, builders, parsers | 1,590 |
| `@ims/semver-utils` | Full semver 2.0.0, ranges, coerce, diff | 1,460 |
| `@ims/search-utils` | Inverted index, Porter stemmer, BM25, TF-IDF | 1,095 |

### Phase 82–85 — Security & Reactive Utility Packages

| Package | Purpose | Tests |
|---------|---------|-------|
| `@ims/uuid-utils` | UUID v1/v4/v5/v7, parse, validate, namespace | 1,411 |
| `@ims/hash-utils` | djb2, FNV-1a, MurmurHash3, consistent hashing | 1,285 |
| `@ims/totp-utils` | RFC 6238 TOTP/HOTP, QR URI, backup codes | 1,375 |
| `@ims/crypto-utils` | AES-256-GCM, PBKDF2, ECDH, random bytes | 1,000+ |
| `@ims/slug-utils` | URL slug generation, transliteration, truncation | 1,250 |
| `@ims/tz-utils` | Timezone offset lookup, DST, conversion helpers | 1,238 |
| `@ims/mime-utils` | 200+ MIME type ↔ extension mappings | 1,222 |
| `@ims/locale-detect` | Accept-Language parsing, BCP-47 validation | 1,414 |
| `@ims/sanitize-utils` | XSS/SQL/shell sanitisers, HTML entities | 1,017 |
| `@ims/event-emitter` | Typed EventEmitter, wildcard, async, middleware | 1,483 |
| `@ims/observable` | Observable/Subject, pipe operators (map/filter…) | 1,530 |
| `@ims/retry-utils` | Exponential/linear back-off, jitter, budgets | 1,396 |
| `@ims/rate-limit-utils` | Token bucket, sliding/fixed window, leaky bucket | 2,250 |
| `@ims/feature-toggle` | Feature flag evaluation, % rollout, targeting | 1,560 |
| `@ims/stats-utils` | Descriptive stats, hypothesis tests, regression | 1,460 |
| `@ims/barcode-utils` | EAN/UPC/Code-39/128/ITF barcode validation | 1,555 |
| `@ims/qr-utils` | QR data encoding, vCard/WiFi payload builders | 1,175 |
| `@ims/cache-strategy` | LRU/LFU/TTL/write-through multi-level cache | 1,829 |
| `@ims/compression-utils` | RLE/LZ text compression, entropy measurement | 1,068 |

### Phase 86–87 — Functional Programming & Concurrent Patterns

| Package | Purpose | Tests |
|---------|---------|-------|
| `@ims/result-type` | Railway-oriented `Result<T,E>` / `Option<T>` monads | 1,000+ |
| `@ims/pipeline-utils` | Composable async pipeline with middleware | 1,000+ |
| `@ims/task-queue` | Priority task queue, concurrency, retry backoff | 1,000+ |
| `@ims/pattern-match` | Exhaustive structural pattern matching, ADTs | 1,000+ |
| `@ims/query-builder` | Fluent SQL-like in-memory query builder | 1,000+ |
| `@ims/dependency-graph` | Topological sort, cycle detection, parallelism | 1,000+ |
| `@ims/bloom-filter` | Probabilistic membership, counting filter | 1,000+ |
| `@ims/trie` | Prefix tree, Patricia trie, autocomplete | 1,000+ |
| `@ims/message-bus` | In-process pub/sub, dead-letter queue | 1,000+ |
| `@ims/circuit-breaker` | Closed/open/half-open state machine | 1,000+ |
| `@ims/health-check` | HTTP/TCP/database/custom health checks | 1,000+ |
| `@ims/lru-map` | O(1) LRU cache with TTL, size limits, stats | 1,000+ |

### Phase 88–90 — Fundamental & Advanced Data Structures

| Package | Purpose | Tests |
|---------|---------|-------|
| `@ims/finite-automata` | DFA/NFA construction, minimisation, regex-to-NFA | 1,128 |
| `@ims/sliding-window` | Fixed/variable window, deque-based max/min | 1,191 |
| `@ims/interval-tree` | Interval overlap/stabbing, augmented BST | 1,403 |
| `@ims/union-find` | Disjoint set union, path compression, rank | 1,196 |
| `@ims/segment-tree` | Range sum/min/max with lazy propagation | 1,089 |
| `@ims/skip-list` | Probabilistic ordered set, floor/ceiling | 1,343 |
| `@ims/avl-tree` | AVL tree with rotations, rank/select, ranges | ~1,662 |
| `@ims/heap-utils` | Min/max binary heap, d-ary heap, priority queue | 1,289 |
| `@ims/deque` | Double-ended queue, sliding window max/min | ~1,908 |
| `@ims/text-search` | KMP, Boyer-Moore, Rabin-Karp, Aho-Corasick | ~1,425 |
| `@ims/sorting-algorithms` | 15 sorting algorithms, comparator, stability | 1,225 |
| `@ims/graph-algorithms` | BFS/DFS, Dijkstra, Kruskal, Floyd-Warshall | 1,031 |
| `@ims/lfu-cache` | O(1) LFU cache with frequency buckets | 1,227 |
| `@ims/dynamic-programming` | Knapsack, LCS, edit distance, matrix chain | 1,116 |
| `@ims/number-theory` | GCD/LCM, primality, CRT, modular arithmetic | ~1,628 |
| `@ims/geometry-utils` | 2D/3D geometry, convex hull, polygon | 1,002 |
| `@ims/sparse-table` | Range min/max O(1) with static preprocessing | ~1,651 |
| `@ims/red-black-tree` | Self-balancing BST, O(log n) ops | 1,361 |

### Phase 91–93 — Mathematics, ML & Persistent Data Structures

| Package | Purpose | Tests |
|---------|---------|-------|
| `@ims/bitset` | Fixed/dynamic bitsets, Bloom filter, bit matrix | ~1,904 |
| `@ims/polynomial` | Polynomial arithmetic, GCD, roots, FFT mul | 1,137 |
| `@ims/combinatorics` | Permutations, combinations, Catalan, Bell | 1,021 |
| `@ims/linear-algebra` | Matrix ops, LU/QR/SVD decomposition | ~1,922 |
| `@ims/probability` | Distributions, Bayesian inference, Monte Carlo | 1,200 |
| `@ims/optimization` | Gradient descent, simulated annealing, simplex | 1,011 |
| `@ims/huffman` | Huffman encoding, canonical codes, LZ77 | 1,000+ |
| `@ims/quadtree` | Point quadtree, RegionQuadtree, spatial queries | 1,184 |
| `@ims/markov-chain` | Markov chain, HMM (Viterbi/forward), N-gram | ~1,380 |
| `@ims/time-series` | SMA/EMA, Holt-Winters, ARIMA, Kalman, CUSUM | 1,294 |
| `@ims/fft` | Cooley-Tukey FFT/IFFT, window functions, filters | 1,100+ |
| `@ims/neural-net` | Activations, backprop, Adam/SGD, metrics | ~1,400 |
| `@ims/rope-structure` | Rope, PieceTable, GapBuffer, ZipperList | 1,432 |
| `@ims/persistent-ds` | Persistent list/stack/queue/map/set | 1,462 |
| `@ims/treap` | Randomised BST, implicit key, order statistics | ~1,969 |
| `@ims/b-tree` | B-tree/B+-tree, range queries, bulk load | 1,737 |
| `@ims/cache-replacement` | LRU/LFU/ARC/CLOCK replacement policies | ~1,530 |
| `@ims/spatial-index` | KD-tree 2D/3D, R-tree, Grid, k-NN | 2,673+ |

---

## Creating a New Package

```
packages/my-package/
├── src/
│   └── index.ts
├── package.json
├── tsconfig.json
└── __tests__/
    └── my-package.test.ts
```

### package.json template

```json
{
  "name": "@ims/my-package",
  "version": "1.0.0",
  "main": "dist/index.js",
  "module": "dist/index.mjs",
  "types": "dist/index.d.ts",
  "scripts": {
    "dev": "tsup src/index.ts --format cjs,esm --watch --no-dts",
    "build": "tsup src/index.ts --format cjs,esm --dts --clean",
    "test": "jest"
  },
  "devDependencies": {
    "tsup": "^8.0.0",
    "typescript": "^5.0.0"
  }
}
```

### Adding to Consuming Apps

In the app's `package.json`:

```json
{
  "dependencies": {
    "@ims/my-package": "workspace:*"
  }
}
```

Then run `pnpm install` to link the workspace package.

### Import Example

```typescript
import { myFunction } from '@ims/my-package';
```
