# Testing Guide — Nexara IMS

## Overview

~8,037 Jest unit tests across 325+ suites, plus 9 integration test scripts (~465+ assertions).

---

## Running Tests

```bash
# All tests
pnpm test

# Single package
pnpm --filter @ims/auth test

# Single API service
pnpm --filter @ims/api-health-safety test

# With coverage
pnpm --filter @ims/api-gateway test -- --coverage

# Watch mode
pnpm --filter @ims/api-gateway test -- --watch
```

---

## Test Pattern (API Services)

All API services follow this pattern:

```typescript
// __tests__/risks.test.ts

jest.mock('../src/prisma', () => ({
  prisma: {
    risk: { findMany: jest.fn(), create: jest.fn(), findUnique: jest.fn() }
  }
}));

jest.mock('@ims/auth', () => ({
  authenticateToken: (req: any, res: any, next: any) => {
    req.user = {
      id: '00000000-0000-0000-0000-000000000001',
      role: 'ADMIN',
      organisationId: 'org-1'
    };
    next();
  }
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'ok' }),
}));

import request from 'supertest';
import app from '../src/index';

describe('GET /api/risks', () => {
  it('returns risks list', async () => {
    const { prisma } = require('../src/prisma');
    prisma.risk.findMany.mockResolvedValue([{ id: '...', title: 'Test' }]);

    const res = await request(app).get('/api/risks');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

**Important:** Use proper UUIDs in test data. Zod's `z.string().uuid()` rejects non-UUID strings like `'met-1'`. Use `'00000000-0000-0000-0000-000000000001'`.

---

## Integration Test Scripts

```bash
./scripts/test-all-modules.sh        # All 9 modules (~465+ assertions)
./scripts/test-hs-modules.sh         # Health & Safety (~70)
./scripts/test-env-modules.sh        # Environment (~60)
./scripts/test-quality-modules.sh    # Quality (~80)
./scripts/test-hr-modules.sh         # HR (~50)
./scripts/test-payroll-modules.sh    # Payroll (~40)
./scripts/test-inventory-modules.sh  # Inventory (~40)
./scripts/test-workflows-modules.sh  # Workflows (~40)
./scripts/test-pm-modules.sh         # Project Management (~45)
./scripts/test-finance-modules.sh    # Finance (~40)
```

---

## Manual Testing with curl

```bash
# Login and capture token
TOKEN=$(curl -s -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@ims.local","password":"admin123"}' | jq -r '.data.accessToken')

echo $TOKEN

# Get current user
curl -s http://localhost:4000/api/auth/me \
  -H "Authorization: Bearer $TOKEN" | jq

# Health check
curl -s http://localhost:4000/health | jq

# Create a risk (Health & Safety)
curl -s -X POST http://localhost:4000/api/health-safety/risks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Risk","description":"Test description","severity":"HIGH","likelihood":"MEDIUM"}' | jq

# List incidents
curl -s http://localhost:4000/api/health-safety/incidents \
  -H "Authorization: Bearer $TOKEN" | jq

# Access without token (should 401)
curl -s http://localhost:4000/api/auth/me | jq
```

---

## Manual Testing Checklist

- [ ] Login with `admin@ims.local` / `admin123`
- [ ] Login with `manager@ims.local` / `admin123`
- [ ] Access protected route without token (expect 401)
- [ ] Access route with wrong role (expect 403)
- [ ] Create a risk entry
- [ ] Create an incident
- [ ] List and filter records
- [ ] Health check all services (`./scripts/check-services.sh`)

---

## Test Coverage Summary

| Area | Tests |
|------|-------|
| 27 API services | ~6,889 |
| 23 shared packages | ~1,148 |
| **Total** | **~8,037** |

All services have route-level unit test coverage + RBAC middleware tests.

---

## CI Testing

```bash
pnpm turbo build --filter='!@ims/mobile' && pnpm test
```
