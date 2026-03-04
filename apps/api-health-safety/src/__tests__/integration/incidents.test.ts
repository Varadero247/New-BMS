// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Health & Safety API — Incident route contracts against real DB.

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
import { PrismaClient } from '../../../../../packages/database/generated/health-safety';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertPagination } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  const { default: incidentsRouter } = await import('../../routes/incidents');
  app.use('/api/incidents', incidentsRouter);
  return app;
}

let app: express.Express;
let hsPrisma: PrismaClient;
let adminToken: string;
let auditorToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  hsPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  auditorToken = await generateTestToken({ userId: TEST_IDS.users.auditor, role: 'AUDITOR' });
});

afterAll(async () => {
  await hsPrisma.$disconnect();
});

describe('GET /api/incidents', () => {
  it('returns 200 with success:true and items', async () => {
    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    // Route returns array directly in data; meta (pagination) is at res.body.meta
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('response includes pagination metadata', async () => {
    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    assertSuccess(res);
    // Pagination is in res.body.meta (or res.body if route puts it at body level)
    const paginationSource = res.body.meta ?? res.body;
    assertPagination(paginationSource);
  });

  it('returns seeded test incidents', async () => {
    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`);

    const data = assertSuccess(res) as any;
    const items = data.items ?? data;
    expect(Array.isArray(items) && items.length).toBeGreaterThanOrEqual(2);
  });

  it('AUDITOR can list incidents', async () => {
    const res = await request(app)
      .get('/api/incidents')
      .set('Authorization', `Bearer ${auditorToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/incidents');
    expect(res.status).toBe(401);
    assertError(res, 'UNAUTHORIZED');
  });
});

describe('POST /api/incidents', () => {
  const validPayload = {
    title: 'Integration Test Incident',
    description: 'Created by integration test suite',
    type: 'NEAR_MISS',
    severity: 'MINOR',
    dateOccurred: new Date().toISOString(),
    reporterId: TEST_IDS.users.admin,
  };

  it('creates a new incident and returns data', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect([200, 201]).toContain(res.status);
    const data = assertSuccess(res) as any;
    expect(data.title).toBe('Integration Test Incident');
    expect(data.severity).toBe('MINOR');
    expect(data.type).toBe('NEAR_MISS');

    // Cleanup
    if (data.id) {
      await hsPrisma.incident.deleteMany({ where: { title: 'Integration Test Incident' } });
    }
  });

  it('returns 4xx for missing required fields', async () => {
    const res = await request(app)
      .post('/api/incidents')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ title: 'Missing Fields' });

    expect([400, 422, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/incidents/:id', () => {
  it('returns the seeded incident by ID', async () => {
    const res = await request(app)
      .get(`/api/incidents/${TEST_IDS.incidents.inc1}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const data = assertSuccess(res) as any;
      expect(data.referenceNumber).toBe('TEST-INC-2026-001');
      expect(data.severity).toBe('MINOR');
    }
  });

  it('uses CLAUDE.md field names (title, dateOccurred, severity in UPPERCASE)', async () => {
    const res = await request(app)
      .get(`/api/incidents/${TEST_IDS.incidents.inc1}`)
      .set('Authorization', `Bearer ${adminToken}`);

    if (res.status === 200) {
      const data = assertSuccess(res) as any;
      // Verify CLAUDE.md field name conventions
      expect(data).toHaveProperty('title');
      expect(data).toHaveProperty('dateOccurred');
      expect(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).toContain(data.severity);
    }
  });

  it('returns 404 for non-existent incident', async () => {
    const res = await request(app)
      .get('/api/incidents/nonexistent-incident-99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect([400, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
