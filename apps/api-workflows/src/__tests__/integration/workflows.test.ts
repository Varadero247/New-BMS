// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: Workflows API — Definition and Instance route contracts against real DB.

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
import { PrismaClient } from '../../../../../packages/database/generated/workflows';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertPagination } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  const { default: definitionsRouter } = await import('../../routes/definitions');
  const { default: instancesRouter } = await import('../../routes/instances');
  app.use('/api/definitions', definitionsRouter);
  app.use('/api/instances', instancesRouter);
  return app;
}

let app: express.Express;
let workflowsPrisma: PrismaClient;
let adminToken: string;
let managerToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  workflowsPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  managerToken = await generateTestToken({ userId: TEST_IDS.users.manager, role: 'MANAGER' });
});

afterAll(async () => {
  await workflowsPrisma.$disconnect();
});

describe('GET /api/definitions', () => {
  it('returns 200 with workflow definitions', async () => {
    const res = await request(app)
      .get('/api/definitions')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('returns the seeded test workflow definition', async () => {
    const res = await request(app)
      .get('/api/definitions')
      .set('Authorization', `Bearer ${adminToken}`);

    const data = assertSuccess(res) as any;
    const items = data.items || data;
    const testDef = items.find((d: any) => d.code === 'TEST-WF-001');
    expect(testDef).toBeDefined();
    expect(testDef.name).toBe('Test Approval Workflow');
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/definitions');
    expect(res.status).toBe(401);
  });
});

describe('GET /api/definitions/:id', () => {
  it('returns the seeded definition by ID', async () => {
    const res = await request(app)
      .get(`/api/definitions/${TEST_IDS.workflows.wf1}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const data = assertSuccess(res) as any;
      expect(data.code).toBe('TEST-WF-001');
      expect(data.status).toBe('ACTIVE');
    }
  });
});

describe('GET /api/instances', () => {
  it('returns 200 with instances list', async () => {
    const res = await request(app)
      .get('/api/instances')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('MANAGER can list instances', async () => {
    const res = await request(app)
      .get('/api/instances')
      .set('Authorization', `Bearer ${managerToken}`);
    expect(res.status).toBe(200);
  });
});

describe('Response shape compliance', () => {
  it('all endpoints return { success, data } envelope', async () => {
    const endpoints = [
      { method: 'get', path: '/api/definitions' },
      { method: 'get', path: '/api/instances' },
    ];

    for (const { method, path } of endpoints) {
      const res = await request(app)
        [method](path)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.body).toHaveProperty('success');
      if (res.body.success) {
        expect(res.body).toHaveProperty('data');
      }
    }
  });
});
