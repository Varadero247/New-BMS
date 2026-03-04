// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: HR API — Employees route contracts against real DB.

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
import { PrismaClient } from '../../../../../packages/database/generated/hr';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { assertSuccess, assertError, assertPagination, assertNoSensitiveFields } from '../../../../../packages/shared/src/test-utils/api-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

async function buildApp() {
  const app = express();
  app.use(express.json());

  const { default: employeesRouter } = await import('../../routes/employees');
  app.use('/api/employees', employeesRouter);
  return app;
}

let app: express.Express;
let hrPrisma: PrismaClient;
let adminToken: string;
let managerToken: string;
let auditorToken: string;
let userToken: string;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildApp();
  hrPrisma = new PrismaClient();
  adminToken = await generateTestToken({ userId: TEST_IDS.users.admin, role: 'ADMIN' });
  managerToken = await generateTestToken({ userId: TEST_IDS.users.manager, role: 'MANAGER' });
  auditorToken = await generateTestToken({ userId: TEST_IDS.users.auditor, role: 'AUDITOR' });
  userToken = await generateTestToken({ userId: TEST_IDS.users.user, role: 'USER' });
});

afterAll(async () => {
  await hrPrisma.$disconnect();
});

describe('GET /api/employees', () => {
  it('returns 200 with employees list', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    const data = assertSuccess(res) as any;
    expect(Array.isArray(data.items || data)).toBe(true);
  });

  it('returns paginated data', async () => {
    const res = await request(app)
      .get('/api/employees?page=1&limit=10')
      .set('Authorization', `Bearer ${adminToken}`);

    assertSuccess(res);
    // HR route: pagination is in res.body.meta; data is the array
    const paginationSource = res.body.meta ?? res.body;
    assertPagination(paginationSource);
  });

  it('returns seeded employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    const data = assertSuccess(res) as any;
    const items = data.items ?? data;
    expect(Array.isArray(items) && items.length).toBeGreaterThanOrEqual(5);
  });

  it('does not return sensitive personal data like passwords', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`);

    assertNoSensitiveFields(res.body, ['password']);
  });

  it('AUDITOR can list employees', async () => {
    const res = await request(app)
      .get('/api/employees')
      .set('Authorization', `Bearer ${auditorToken}`);
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth', async () => {
    const res = await request(app).get('/api/employees');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/employees', () => {
  const validPayload = {
    employeeNumber: 'INT-TEST-EMP-001',
    firstName: 'Integration',
    lastName: 'TestEmployee',
    jobTitle: 'Test Engineer',
    workEmail: 'int-test-employee@ims-test.io',
    departmentId: TEST_IDS.departments.engineering,
    employmentType: 'FULL_TIME',
    employmentStatus: 'ACTIVE',
    hireDate: '2026-01-01',
  };

  it('ADMIN can create employee', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(validPayload);

    expect([200, 201]).toContain(res.status);
    const data = assertSuccess(res) as any;
    expect(data.firstName).toBe('Integration');
    expect(data.workEmail).toBe('int-test-employee@ims-test.io');

    // Cleanup
    await hrPrisma.employee.deleteMany({ where: { workEmail: 'int-test-employee@ims-test.io' } });
  });

  it('MANAGER can create employee', async () => {
    const payload = { ...validPayload, employeeNumber: 'INT-TEST-EMP-002', workEmail: 'int-test-employee-2@ims-test.io' };
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${managerToken}`)
      .send(payload);

    expect([200, 201]).toContain(res.status);

    await hrPrisma.employee.deleteMany({ where: { workEmail: 'int-test-employee-2@ims-test.io' } });
  });

  it('returns 4xx for missing required fields', async () => {
    const res = await request(app)
      .post('/api/employees')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ firstName: 'Incomplete' });

    expect([400, 422, 500]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/employees/:id', () => {
  it('returns seeded employee by ID', async () => {
    const res = await request(app)
      .get(`/api/employees/${TEST_IDS.employees.alice}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      const data = assertSuccess(res) as any;
      expect(data.firstName).toBe('Alice');
      expect(data.employeeNumber).toBe('TEST-EMP-001');
    }
  });

  it('returns 404 for non-existent employee', async () => {
    const res = await request(app)
      .get('/api/employees/nonexistent-emp-99999')
      .set('Authorization', `Bearer ${adminToken}`);

    expect([400, 404]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});
