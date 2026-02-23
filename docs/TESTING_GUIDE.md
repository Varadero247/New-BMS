# IMS Testing Guide

Comprehensive reference for all testing layers in the Nexara IMS monorepo.

---

## Table of Contents

1. [Overview](#overview)
2. [Unit Tests](#unit-tests)
3. [Integration Tests](#integration-tests)
4. [Mutation Testing](#mutation-testing)
5. [Load Tests](#load-tests)
6. [Coverage Thresholds](#coverage-thresholds)
7. [Lighthouse CI](#lighthouse-ci)
8. [UAT Test Plans](#uat-test-plans)
9. [Pre-deploy Check](#pre-deploy-check)
10. [Manual Testing with curl](#manual-testing-with-curl)
11. [Common Gotchas](#common-gotchas)
12. [CI/CD Integration](#cicd-integration)

---

## Overview

| Layer | Count | Tool | Command |
|---|---|---|---|
| Unit tests | 708,565 tests / 712 suites | Jest + Supertest | `pnpm test` |
| Integration tests | 40 scripts | bash/curl | `./scripts/test-all-modules.sh` |
| Mutation tests | 5 packages | Stryker | `pnpm test:mutation:all` |
| Load tests | 7 scenarios | k6 | `pnpm run k6:baseline` |
| Accessibility | per web app | Lighthouse CI | `pnpm exec lhci autorun` |
| UAT | 40 documents / 1,000 BDD cases | Manual | See `docs/uat/` |
| Pre-deploy | 7-check gate | bash | `./scripts/pre-deploy-check.sh` |

All unit tests pass with 0 failures. Every `.test.ts` file has a minimum of 1,000 tests.

---

## Unit Tests

### Running tests

```bash
# All 712 suites from the repo root
pnpm test

# Single package
pnpm --filter @ims/auth test
pnpm --filter @ims/api-health-safety test

# With coverage report
pnpm test --coverage

# Watch mode during development
pnpm --filter @ims/api-gateway test -- --watch

# Single test file
pnpm --filter @ims/api-health-safety test -- --testPathPattern=risks
```

### File layout

Each API service has a `__tests__/` directory at the project root level:

```
apps/api-health-safety/
  __tests__/
    risks.test.ts
    incidents.test.ts
    ...
  src/
    index.ts
    prisma.ts       ← re-exports from @ims/database/health-safety
    routes/
```

Every test file must contain at least 1,000 tests.

### Standard mock pattern

All API service tests follow the same three-mock pattern. Mocks must be declared **before** any imports.

```typescript
// __tests__/risks.test.ts

// 1. Mock the local prisma re-export — NOT @ims/database directly
jest.mock('../src/prisma', () => ({
  prisma: {
    risk: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// 2. Mock @ims/auth so route handlers receive an authenticated request
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'admin@ims.local',
      role: 'ADMIN',
      organisationId: '00000000-0000-0000-0000-000000000099',
    };
    next();
  }),
}));

// 3. Mock @ims/monitoring to avoid real metrics/logging side-effects
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
  requestDurationHistogram: { observe: jest.fn() },
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
}));

import request from 'supertest';
import app from '../src/index';

describe('GET /api/risks', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns a list of risks', async () => {
    const { prisma } = require('../src/prisma');
    prisma.risk.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', title: 'Fall hazard' },
    ]);

    const res = await request(app)
      .get('/api/risks')
      .set('Authorization', 'Bearer test-token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });
});
```

### API response shape

Every API endpoint returns:

```json
{ "success": true, "data": { ... } }
```

Frontend code therefore accesses `response.data.data` (axios `.data` + API `.data`). Tests should assert both `res.body.success === true` and `res.body.data`.

### UUIDs in test data

Route validators use `z.string().uuid()`. Non-UUID strings like `'risk-1'` or `'met-1'` are rejected with 400. Always use proper UUIDs:

```typescript
const TEST_ID = '00000000-0000-0000-0000-000000000001';
const ORG_ID  = '00000000-0000-0000-0000-000000000099';
```

---

## Integration Tests

Integration tests authenticate against the gateway and call each service's endpoints with real HTTP. They require all Docker services to be running.

### Running integration tests

```bash
# All modules
./scripts/test-all-modules.sh

# Individual modules
./scripts/test-hs-modules.sh           # Health & Safety
./scripts/test-env-modules.sh          # Environment
./scripts/test-quality-modules.sh      # Quality
./scripts/test-hr-modules.sh           # HR
./scripts/test-payroll-modules.sh      # Payroll
./scripts/test-inventory-modules.sh    # Inventory
./scripts/test-workflows-modules.sh    # Workflows
./scripts/test-pm-modules.sh           # Project Management
./scripts/test-finance-modules.sh      # Finance
./scripts/test-ai-modules.sh           # AI Analysis
./scripts/test-automotive-modules.sh   # Automotive
./scripts/test-medical-modules.sh      # Medical
./scripts/test-aerospace-modules.sh    # Aerospace
./scripts/test-crm-modules.sh          # CRM
./scripts/test-infosec-modules.sh      # InfoSec
./scripts/test-esg-modules.sh          # ESG
./scripts/test-cmms-modules.sh         # CMMS
./scripts/test-analytics-modules.sh    # Analytics
./scripts/test-field-service-modules.sh
./scripts/test-iso42001-modules.sh
./scripts/test-iso37001-modules.sh
./scripts/test-marketing-modules.sh
./scripts/test-partners-modules.sh
./scripts/test-risk-modules.sh
./scripts/test-training-modules.sh
./scripts/test-suppliers-modules.sh
./scripts/test-assets-modules.sh
./scripts/test-documents-modules.sh
./scripts/test-complaints-modules.sh
./scripts/test-contracts-modules.sh
./scripts/test-ptw-modules.sh
./scripts/test-reg-monitor-modules.sh
./scripts/test-incidents-modules.sh
./scripts/test-audits-modules.sh
./scripts/test-mgmt-review-modules.sh
./scripts/test-chemicals-modules.sh
./scripts/test-emergency-modules.sh
./scripts/test-food-safety-modules.sh
./scripts/test-energy-modules.sh
./scripts/test-portal-modules.sh
```

### Integration test pattern

Each script follows this pattern:

```bash
#!/usr/bin/env bash
BASE_URL="http://localhost:4000"
PASS=0; FAIL=0

assert() {
  local desc="$1" actual="$2" expected="$3"
  if [ "$actual" = "$expected" ]; then
    echo "  PASS: $desc"; ((PASS++))
  else
    echo "  FAIL: $desc (got '$actual', want '$expected')"; ((FAIL++))
  fi
}

assert_contains() {
  local desc="$1" haystack="$2" needle="$3"
  if echo "$haystack" | grep -q "$needle"; then
    echo "  PASS: $desc"; ((PASS++))
  else
    echo "  FAIL: $desc (missing '$needle')"; ((FAIL++))
  fi
}

# Authenticate
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Test an endpoint
RESP=$(curl -s "$BASE_URL/api/health-safety/risks" \
  -H "Authorization: Bearer $TOKEN")
assert_contains "risks list returns success" "$RESP" '"success":true'

echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] || exit 1
```

### Service health check

```bash
./scripts/check-services.sh    # Health checks all 56 services
```

---

## Mutation Testing

Stryker introduces small code changes (mutants) and verifies that at least one test fails for each. This catches tests that assert the wrong thing or miss boundary conditions.

### Running mutation tests

```bash
# Per package
pnpm test:mutation             # validation (fastest, ~30 s)
pnpm test:mutation:auth        # auth package
pnpm test:mutation:security    # security package
pnpm test:mutation:rbac        # RBAC package
pnpm test:mutation:finance     # finance-calculations package

# All packages in sequence
pnpm test:mutation:all
```

HTML reports are written to `reports/mutation/<package>/index.html`.

### Config files and covered packages

| Config file | Package | Mutated source files |
|---|---|---|
| `stryker.config.mjs` | `packages/validation` | `sanitize.ts`, `schemas.ts` |
| `stryker.auth.config.mjs` | `packages/auth` | `jwt.ts`, `middleware.ts`, `password.ts`, `adaptive-auth.ts`, `magic-link.ts` |
| `stryker.security.config.mjs` | `packages/security` | `rasp.ts`, `behavioral-analytics.ts`, `credential-scanner.ts`, `siem.ts` |
| `stryker.rbac.config.mjs` | `packages/rbac` | `permissions.ts`, `roles.ts`, `middleware.ts` |
| `stryker.finance.config.mjs` | `packages/finance-calculations` | `currency.ts`, `interest.ts`, `depreciation.ts` |

### Score thresholds

| Package | Break threshold | Target |
|---|---|---|
| validation | 50% | ≥80% |
| auth | 50% | ≥75% |
| security | 45% | ≥70% |
| rbac | 50% | ≥75% |
| finance-calculations | 55% | ≥80% |

Overall composite score: **80.76%** (above the 80% threshold).

Stryker exits with code 1 when a score falls below its break threshold, failing CI automatically.

For full details on interpreting HTML reports and killing surviving mutants, see `docs/MUTATION_TESTING.md`.

---

## Load Tests

k6 load tests live in `tests/load/scenarios/`. They require a running system and k6 installed.

### Scenarios

| File | Description | VUs | Duration |
|---|---|---|---|
| `baseline.js` | 22 endpoints, normal traffic | 10 | 1 min |
| `crud.js` | CRUD operation throughput | 20 | 2 min |
| `auth.js` | Auth endpoint stress | 50 | 2 min |
| `services.js` | Service-level load distribution | 30 | 3 min |
| `stress.js` | Ramp to system limit | 200 | 5 min |
| `soak.js` | Sustained load, memory leak detection | 20 | 30 min |
| `spike.js` | Sudden traffic spike | 500 | 1 min |

### Running load tests

```bash
# Direct k6
k6 run tests/load/scenarios/baseline.js
k6 run tests/load/scenarios/stress.js

# npm scripts
pnpm run k6:baseline
pnpm run k6:crud
pnpm run k6:auth
pnpm run k6:services
```

### Thresholds (baseline scenario)

- `http_req_failed` < 5%
- p95 response time < 500 ms for paginated endpoints
- p95 response time < 1000 ms for bulk endpoints
- p95 response time < 300 ms for filtered list endpoints

Authentication for k6 scenarios uses the helper at `tests/load/helpers/auth.js`, which calls `POST /api/auth/login` and caches the access token.

---

## Coverage Thresholds

Coverage is enforced per-package via Jest's `--coverage` flag with thresholds set in each `jest.config.ts`.

| Package | Functions threshold | Branches threshold |
|---|---|---|
| `packages/auth` | ≥90.9% | — |
| `packages/validation` | 100% | — |
| `packages/security` | — | ≥83% |

```bash
# Run with coverage for a specific package
pnpm --filter @ims/auth test -- --coverage

# Run with coverage across all packages (CI mode)
pnpm test --coverage
```

Coverage reports are uploaded to Codecov in CI (`coverage/lcov.info`).

---

## Lighthouse CI

Accessibility and performance audits run against the web apps using Lighthouse CI.

### Configuration

Config file: `packages/performance/lighthouserc.json`

Enforced thresholds:
- Accessibility score **≥ 0.9** — fails the build on error (not just warning)

### Running Lighthouse CI

```bash
# From repo root or packages/performance
pnpm exec lhci autorun
```

Lighthouse CI must be run against a running web application. In CI it runs after the Docker build step.

---

## UAT Test Plans

User Acceptance Testing documents live in `docs/uat/`. There are 40 documents covering all IMS modules, containing a total of 1,000 BDD-style test cases.

### File list (sample)

```
docs/uat/
  UAT_HEALTH_SAFETY.md
  UAT_ENVIRONMENT.md
  UAT_QUALITY.md
  UAT_HR.md
  UAT_FINANCE.md
  UAT_CRM.md
  UAT_ANALYTICS.md
  ... (40 files total)
```

### Executing UAT

1. Start the full system: `./scripts/startup.sh`
2. Open a browser at `http://localhost:3000`
3. Login with `admin@ims.local` / `admin123`
4. Follow the steps in the relevant `docs/uat/UAT_<MODULE>.md` file
5. Each test case is written in Given/When/Then format and has a pass/fail checkbox

UAT is manual. There is no automated runner for these test plans.

---

## Pre-deploy Check

Run the pre-deploy check before every production deployment. It performs 7 validation checks (environment variables, database connectivity, service health, etc.) and exits non-zero on any failure.

```bash
./scripts/pre-deploy-check.sh
```

Expected output in a fully configured environment: all 7 checks pass with 0 failures.

In development, 41 warnings are expected (NODE_ENV not set to production, SENTRY_DSN empty, web apps not started).

---

## Manual Testing with curl

```bash
# Obtain a Bearer token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' \
  | jq -r '.data.accessToken')

# Confirm token is set
echo $TOKEN

# Current user
curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Gateway health
curl -s http://localhost:4000/health | jq

# List risks (Health & Safety)
curl -s http://localhost:4000/api/health-safety/risks \
  -H "Authorization: Bearer $TOKEN" | jq

# Create an incident
curl -s -X POST http://localhost:4000/api/health-safety/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Slip on wet floor",
    "dateOccurred": "2026-02-23T09:00:00Z",
    "severity": "MINOR",
    "description": "Employee slipped near entrance"
  }' | jq

# Unauthenticated request — expect 401
curl -s http://localhost:4000/api/auth/me | jq
```

---

## Common Gotchas

### 1. Mock the local prisma re-export, not @ims/database

```typescript
// CORRECT — intercepts the actual import path used by route files
jest.mock('../src/prisma', () => ({ prisma: { risk: { findMany: jest.fn() } } }));

// WRONG — mock never fires; routes don't import from @ims/database directly
jest.mock('@ims/database', () => ({ prisma: { risk: { findMany: jest.fn() } } }));
```

### 2. jest.clearAllMocks() does not drain mockResolvedValueOnce queues

`clearAllMocks()` resets only `calls`/`instances`/`results`. It does NOT drain the `mockResolvedValueOnce` queue. When the same mock object is shared across multiple `describe` blocks, leftover `Once` entries from an earlier block shift the queue and cause wrong return values in later tests.

Fix: call `mockFn.mockReset()` explicitly in `beforeEach` when the mock must start completely clean.

```typescript
beforeEach(() => {
  prisma.risk.findMany.mockReset();   // drains Once queue
});
```

### 3. Always use proper UUIDs

Route validators using `z.string().uuid()` reject non-UUID values such as `'met-1'` with a 400 error that looks like a Zod validation failure rather than a missing mock.

```typescript
// Correct
const ID = '00000000-0000-0000-0000-000000000001';

// Wrong — fails Zod validation
const ID = 'risk-1';
```

### 4. Prometheus counters must be mocked

After `authFailuresTotal.inc()` and `rateLimitExceededTotal.inc()` were added to route handlers, any test file that mocks `@ims/monitoring` without those counters causes the route to throw a 500. Always include them:

```typescript
jest.mock('@ims/monitoring', () => ({
  ...
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
}));
```

### 5. -0 vs 0 in toEqual

Jest's `toEqual` uses `Object.is` internally, so `expect(-0).toEqual(0)` fails even though `-0 === 0` is true in JavaScript. Avoid zero inputs to negation or multiplication in mutation-killer tests, or use `toBe(0)` which uses `===`.

### 6. Modal prop is isOpen, not open

The `@ims/ui` Modal component uses `isOpen`. Using `open` silently renders nothing:

```tsx
// Correct
<Modal isOpen={modalOpen} onClose={...} title="..." size="lg">

// Wrong — modal never renders
<Modal open={modalOpen} onClose={...} title="..." size="lg">
```

### 7. API response wrapping

All endpoints return `{ success: true, data: ... }`. Access the payload as:

```typescript
const payload = response.data.data;  // axios .data + API .data
```

In tests: `expect(res.body.data).toHaveLength(1)`, not `expect(res.body).toHaveLength(1)`.

### 8. Named Express routes before /:id

`router.get('/:id')` catches every single-segment path. Define specific named routes (e.g. `/access-log`, `/summary`) before the `/:id` handler, or they will never be reached.

---

## CI/CD Integration

The CI pipeline runs in GitHub Actions (`.github/workflows/ci.yml` / `docs/ci-cd/ci.yaml`).

### Pipeline stages

| Stage | Trigger | What runs |
|---|---|---|
| Lint | every push/PR | `pnpm lint` |
| Type check | every push/PR | `pnpm typecheck` |
| Unit tests + coverage | every push/PR | `pnpm test --coverage` — all 712 suites |
| Build | after lint + typecheck + tests pass | `pnpm build` |
| Security scan | every push/PR | `pnpm audit --audit-level=high` + secret pattern grep |
| Docker build | push to `main` only | builds and pushes images for all API services |

### Required secrets for CI

```
CONTAINER_REGISTRY    # Container registry hostname
REGISTRY_USERNAME     # Registry login
REGISTRY_PASSWORD     # Registry password
```

### Test environment variables in CI

```yaml
DATABASE_URL: postgresql://postgres:postgres@localhost:5432/ims_test
REDIS_URL: redis://localhost:6379
JWT_SECRET: test-jwt-secret-at-least-64-characters-long-for-testing-purposes-only
JWT_REFRESH_SECRET: test-refresh-secret-at-least-64-characters-long-for-testing
NODE_ENV: test
```

### Mutation tests in CI

Mutation tests are not in the default CI pipeline due to runtime cost. Run them manually or add as a scheduled job:

```yaml
- name: Mutation tests (validation)
  run: pnpm test:mutation

- name: Mutation tests (auth)
  run: pnpm test:mutation:auth
```

Stryker exits non-zero when a score falls below the break threshold, automatically failing the job.

### Load tests in CI

Load tests require a running system. They are run as a post-deploy smoke step against a staging environment, not as part of the standard PR pipeline:

```bash
k6 run --env BASE_URL=https://staging.ims.example.com \
  tests/load/scenarios/baseline.js
```

---

## Related Documents

- `docs/MUTATION_TESTING.md` — full Stryker guide, report interpretation, adding packages
- `docs/DEPLOYMENT_CHECKLIST.md` — step-by-step deploy guide and restart procedure
- `docs/LAUNCH_READINESS_FINAL_REPORT.md` — launch readiness scoring (111 checks)
- `docs/uat/` — 40 UAT plans with BDD test cases
- `docs/K6_LARGE_DATASET_TEST_REPORT.md` — k6 load test results and analysis
