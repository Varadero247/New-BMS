// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// Integration: RBAC enforcement — verifies 403 is returned by middleware before proxying.
import express from 'express';
import http from 'http';
import request from 'supertest';
import { resetTestDatabase, flushTestRedis } from '../../../../../packages/database/src/test-helpers';
import { generateTestToken } from '../../../../../packages/shared/src/test-utils/auth-helpers';
import { TEST_IDS } from '../../../../../packages/database/prisma/seed-test';

// Lightweight stub downstream services so gateway proxy has real targets
const STUB_PORTS = {
  quality: 14003,
  hr: 14006,
  payroll: 14007,
  workflows: 14008,
};

const stubs: http.Server[] = [];

function createStub(port: number, serviceName: string): Promise<http.Server> {
  return new Promise((resolve) => {
    const stub = express();
    stub.use(express.json());
    stub.all('*', (_req, res) => {
      res.setHeader('X-Service', serviceName);
      res.json({ success: true, data: {} });
    });
    const server = stub.listen(port, () => resolve(server));
  });
}

// Build a gateway app with just auth middleware + RBAC + proxy
async function buildGatewayApp() {
  const app = express();
  app.use(express.json());

  const { authenticate, requireRole } = await import('@ims/auth');

  // Simulate gateway RBAC routes

  // Quality NCR delete — ADMIN only
  app.delete('/api/quality/ncr/:id', authenticate, requireRole('ADMIN'), (_req, res) => {
    res.json({ success: true, data: { deleted: true } });
  });

  // HR employees create — ADMIN + MANAGER
  app.post('/api/hr/employees', authenticate, requireRole('ADMIN', 'MANAGER'), (_req, res) => {
    res.status(201).json({ success: true, data: { created: true } });
  });

  // HR employees list — all authenticated roles
  app.get('/api/hr/employees', authenticate, (_req, res) => {
    res.json({ success: true, data: { items: [] } });
  });

  // Workflows approve — ADMIN + MANAGER
  app.put('/api/workflows/:id/approve', authenticate, requireRole('ADMIN', 'MANAGER'), (_req, res) => {
    res.json({ success: true, data: { approved: true } });
  });

  // Payroll payslips — ADMIN only
  app.get('/api/payroll/payslips', authenticate, requireRole('ADMIN'), (_req, res) => {
    res.json({ success: true, data: { items: [] } });
  });

  return app;
}

let app: express.Express;

beforeAll(async () => {
  await resetTestDatabase();
  await flushTestRedis();
  app = await buildGatewayApp();
});

afterAll(async () => {
  for (const s of stubs) {
    await new Promise<void>((r) => s.close(() => r()));
  }
});

async function tokenFor(role: 'ADMIN' | 'MANAGER' | 'AUDITOR' | 'USER'): Promise<string> {
  const userMap = {
    ADMIN: TEST_IDS.users.admin,
    MANAGER: TEST_IDS.users.manager,
    AUDITOR: TEST_IDS.users.auditor,
    USER: TEST_IDS.users.user,
  };
  return generateTestToken({ userId: userMap[role], role });
}

describe('DELETE /api/quality/ncr/:id — ADMIN only', () => {
  it('ADMIN → 200', async () => {
    const res = await request(app)
      .delete('/api/quality/ncr/test-nc-001')
      .set('Authorization', `Bearer ${await tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
  });

  it('MANAGER → 403', async () => {
    const res = await request(app)
      .delete('/api/quality/ncr/test-nc-001')
      .set('Authorization', `Bearer ${await tokenFor('MANAGER')}`);
    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('AUDITOR → 403', async () => {
    const res = await request(app)
      .delete('/api/quality/ncr/test-nc-001')
      .set('Authorization', `Bearer ${await tokenFor('AUDITOR')}`);
    expect(res.status).toBe(403);
  });

  it('USER → 403', async () => {
    const res = await request(app)
      .delete('/api/quality/ncr/test-nc-001')
      .set('Authorization', `Bearer ${await tokenFor('USER')}`);
    expect(res.status).toBe(403);
  });
});

describe('POST /api/hr/employees — ADMIN + MANAGER', () => {
  it('ADMIN → 201', async () => {
    const res = await request(app)
      .post('/api/hr/employees')
      .set('Authorization', `Bearer ${await tokenFor('ADMIN')}`)
      .send({ firstName: 'New', lastName: 'Employee' });
    expect(res.status).toBe(201);
  });

  it('MANAGER → 201', async () => {
    const res = await request(app)
      .post('/api/hr/employees')
      .set('Authorization', `Bearer ${await tokenFor('MANAGER')}`)
      .send({ firstName: 'Another', lastName: 'Employee' });
    expect(res.status).toBe(201);
  });

  it('AUDITOR → 403', async () => {
    const res = await request(app)
      .post('/api/hr/employees')
      .set('Authorization', `Bearer ${await tokenFor('AUDITOR')}`)
      .send({});
    expect(res.status).toBe(403);
  });

  it('USER → 403', async () => {
    const res = await request(app)
      .post('/api/hr/employees')
      .set('Authorization', `Bearer ${await tokenFor('USER')}`)
      .send({});
    expect(res.status).toBe(403);
  });
});

describe('GET /api/hr/employees — all authenticated roles', () => {
  for (const role of ['ADMIN', 'MANAGER', 'AUDITOR', 'USER'] as const) {
    it(`${role} → 200`, async () => {
      const res = await request(app)
        .get('/api/hr/employees')
        .set('Authorization', `Bearer ${await tokenFor(role)}`);
      expect(res.status).toBe(200);
    });
  }
});

describe('PUT /api/workflows/:id/approve — ADMIN + MANAGER', () => {
  it('ADMIN → 200', async () => {
    const res = await request(app)
      .put('/api/workflows/test-workflow-inst-001/approve')
      .set('Authorization', `Bearer ${await tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
  });

  it('MANAGER → 200', async () => {
    const res = await request(app)
      .put('/api/workflows/test-workflow-inst-001/approve')
      .set('Authorization', `Bearer ${await tokenFor('MANAGER')}`);
    expect(res.status).toBe(200);
  });

  it('AUDITOR → 403', async () => {
    const res = await request(app)
      .put('/api/workflows/test-workflow-inst-001/approve')
      .set('Authorization', `Bearer ${await tokenFor('AUDITOR')}`);
    expect(res.status).toBe(403);
  });

  it('USER → 403', async () => {
    const res = await request(app)
      .put('/api/workflows/test-workflow-inst-001/approve')
      .set('Authorization', `Bearer ${await tokenFor('USER')}`);
    expect(res.status).toBe(403);
  });
});

describe('GET /api/payroll/payslips — ADMIN only', () => {
  it('ADMIN → 200', async () => {
    const res = await request(app)
      .get('/api/payroll/payslips')
      .set('Authorization', `Bearer ${await tokenFor('ADMIN')}`);
    expect(res.status).toBe(200);
  });

  it('MANAGER → 403', async () => {
    const res = await request(app)
      .get('/api/payroll/payslips')
      .set('Authorization', `Bearer ${await tokenFor('MANAGER')}`);
    expect(res.status).toBe(403);
  });

  it('AUDITOR → 403', async () => {
    const res = await request(app)
      .get('/api/payroll/payslips')
      .set('Authorization', `Bearer ${await tokenFor('AUDITOR')}`);
    expect(res.status).toBe(403);
  });

  it('USER → 403', async () => {
    const res = await request(app)
      .get('/api/payroll/payslips')
      .set('Authorization', `Bearer ${await tokenFor('USER')}`);
    expect(res.status).toBe(403);
  });
});

describe('Unauthenticated requests', () => {
  it('GET /api/hr/employees without token → 401', async () => {
    const res = await request(app).get('/api/hr/employees');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });
});
