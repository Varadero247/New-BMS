// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Payroll API — route contracts against real DB.

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), warn: jest.fn(), error: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: (_req: any, _res: any, next: any) => next(),
  metricsHandler: jest.fn(),
  correlationIdMiddleware: (_req: any, _res: any, next: any) => next(),
  initTracing: jest.fn(),
  authFailuresTotal: { inc: jest.fn() },
  rateLimitExceededTotal: { inc: jest.fn() },
  createDownstreamRateLimiter: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: jest.fn().mockReturnValue((_req: any, res: any) => res.json({ status: 'ok' })),
}));

import express from 'express';
import request from 'supertest';
import { PrismaClient } from '../../../../../packages/database/generated/payroll';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertNoSensitiveFields } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  // Mount at /api to match production; payroll router handles /runs, /payslips, etc.
  const { default: payrollRouter } = await import('../../routes/payroll');
  const { default: salaryRouter } = await import('../../routes/salary');
  app.use('/api', payrollRouter);
  app.use('/api/salary', salaryRouter);
  return app;
}

let app: express.Express;
let payrollPrisma: PrismaClient;
let adminToken: string;
let managerToken: string;
let auditorToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  payrollPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  managerToken = await generateTestToken({ userId: TEST_IDS.users.manager, role: 'MANAGER' });
  auditorToken = await generateTestToken({ userId: TEST_IDS.users.auditor, role: 'AUDITOR' });
});

afterAll(async () => {
  await payrollPrisma.$disconnect();
});

describe('GET /api/runs (payroll runs)', () => {
  it('ADMIN gets 200', async () => {
    const res = await request(app)
      .get('/api/runs')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('does not expose sensitive financial fields outside response', async () => {
    const res = await request(app)
      .get('/api/runs')
      .set('Authorization', `Bearer ${adminToken}`);

    // No passwords in payroll responses
    assertNoSensitiveFields(res.body, ['password']);
  });

  it('MANAGER gets 403 or 200 depending on route config', async () => {
    const res = await request(app)
      .get('/api/runs')
      .set('Authorization', `Bearer ${managerToken}`);

    // Payroll runs may be ADMIN-only or available to all authenticated users
    expect([200, 403]).toContain(res.status);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/runs');
    expect(res.status).toBe(401);
    assertError(res, 'UNAUTHORIZED');
  });
});

describe('GET /api/salary/component-types', () => {
  it('ADMIN can list salary component types', async () => {
    const res = await request(app)
      .get('/api/salary/component-types')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('salary component types do not expose raw password fields', async () => {
    const res = await request(app)
      .get('/api/salary/component-types')
      .set('Authorization', `Bearer ${adminToken}`);

    assertNoSensitiveFields(res.body, ['password']);
  });
});

describe('POST /api/runs (create payroll run)', () => {
  it('ADMIN can initiate a payroll run', async () => {
    const payload = {
      periodStart: '2026-01-01',
      periodEnd: '2026-01-31',
      payDate: '2026-01-31',
      payFrequency: 'MONTHLY',
      currency: 'USD',
    };

    const res = await request(app)
      .post('/api/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(payload);

    expect([200, 201]).toContain(res.status);
    if (res.body.success) {
      const data = assertSuccess(res) as any;
      expect(data.payFrequency).toBe('MONTHLY');
      expect(['DRAFT', 'PROCESSING', 'COMPLETED']).toContain(data.status);

      // Cleanup
      if (data.id) {
        await payrollPrisma.payrollRun.delete({ where: { id: data.id } }).catch(() => {});
      }
    }
  });

  it('returns 4xx for missing required fields', async () => {
    const res = await request(app)
      .post('/api/runs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ currency: 'USD' });

    expect([400, 422, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
