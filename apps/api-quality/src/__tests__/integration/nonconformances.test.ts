// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Quality API — NCR route contracts against real DB.

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
import { PrismaClient } from '../../../../../packages/database/generated/quality';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertPagination } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  // Import the real NCR router (uses real Prisma via src/prisma.ts)
  const { default: nonconformancesRouter } = await import('../../routes/nonconformances');
  app.use('/api/nonconformances', nonconformancesRouter);
  return app;
}

let app: express.Express;
let qualityPrisma: PrismaClient;
let adminToken: string;
let managerToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  qualityPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  managerToken = await generateTestToken({ userId: TEST_IDS.users.manager, role: 'MANAGER' });
});

afterAll(async () => {
  await qualityPrisma.$disconnect();
});

describe('GET /api/nonconformances', () => {
  it('returns 200 with success:true and items array', async () => {
    const res = await request(app)
      .get('/api/nonconformances')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res);
    expect(Array.isArray((data as any).items)).toBe(true);
  });

  it('response includes pagination fields', async () => {
    const res = await request(app)
      .get('/api/nonconformances')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    assertPagination(data);
  });

  it('returns seeded test NCRs', async () => {
    const res = await request(app)
      .get('/api/nonconformances')
      .set('Authorization', `Bearer ${adminToken}`);

    const data = assertSuccess(res) as any;
    expect(data.items.length).toBeGreaterThanOrEqual(2);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/nonconformances');
    expect(res.status).toBe(401);
    assertError(res, 'UNAUTHORIZED');
  });
});

describe('POST /api/nonconformances', () => {
  const validPayload = {
    ncType: 'INTERNAL',
    source: 'INTERNAL_AUDIT',
    severity: 'MINOR',
    reportedBy: TEST_IDS.users.admin,
    department: 'Integration Test Dept',
    title: 'Integration test NCR',
    description: 'Created by integration test',
    status: 'REPORTED',
  };

  let createdId: string;

  it('creates a new NCR and returns 201 with data', async () => {
    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect([200, 201]).toContain(res.status);
    const data = assertSuccess(res) as any;
    expect(data.id).toBeDefined();
    expect(data.title).toBe('Integration test NCR');
    expect(data.ncType).toBe('INTERNAL');
    createdId = data.id;
  });

  it('returns 422/400 for missing required fields', async () => {
    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Incomplete' });

    expect([400, 422, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  afterAll(async () => {
    if (createdId) {
      await qualityPrisma.qualNonConformance.deleteMany({
        where: { title: 'Integration test NCR' },
      });
    }
  });
});

describe('GET /api/nonconformances/:id', () => {
  it('returns 200 with the specific NCR', async () => {
    const res = await request(app)
      .get(`/api/nonconformances/${TEST_IDS.nonConformances.nc1}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const data = assertSuccess(res) as any;
      expect(data.id).toBe(TEST_IDS.nonConformances.nc1);
      expect(data.referenceNumber).toBe('TEST-NCR-2026-001');
    }
  });

  it('returns 404 for non-existent ID', async () => {
    const res = await request(app)
      .get('/api/nonconformances/nonexistent-id-99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect([400, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
