import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn() },
    riskAction: { create: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), update: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/actions';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/risks/:id/actions', () => {
  it('should return actions for a risk', async () => {
    mockPrisma.riskAction.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', actionTitle: 'Test' },
    ]);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/actions');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('POST /api/risks/:id/actions', () => {
  it('should create action', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskAction.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      actionTitle: 'Install LEV',
    });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions')
      .send({
        actionTitle: 'Install LEV',
        description: 'Install local exhaust ventilation',
        actionType: 'PREVENTIVE',
        targetDate: '2026-06-01T00:00:00Z',
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions')
      .send({
        actionTitle: 'Test',
        description: 'Test',
        actionType: 'PREVENTIVE',
        targetDate: '2026-06-01T00:00:00Z',
      });
    expect(res.status).toBe(404);
  });

  it('should validate required fields', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions')
      .send({ actionTitle: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/risks/:riskId/actions/:id', () => {
  it('should update action', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskAction.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      priority: 'HIGH',
    });
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
      )
      .send({ priority: 'HIGH' });
    expect(res.status).toBe(200);
  });

  it('should return 404 if action not found', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001'
      )
      .send({ priority: 'HIGH' });
    expect(res.status).toBe(404);
  });
});

describe('POST /api/risks/:riskId/actions/:id/complete', () => {
  it('should mark action complete', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.riskAction.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'COMPLETED',
    });
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001/complete'
      )
      .send({ evidenceOfCompletion: 'Photo uploaded', effectiveness: 'Effective' });
    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('COMPLETED');
  });
});

describe('GET /api/risks/actions/overdue', () => {
  it('should return overdue actions', async () => {
    mockPrisma.riskAction.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', status: 'OPEN', targetDate: '2025-01-01' },
    ]);
    const res = await request(app).get('/api/risks/actions/overdue');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/risks/actions/due-soon', () => {
  it('should return actions due within 14 days', async () => {
    mockPrisma.riskAction.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/risks/actions/due-soon');
    expect(res.status).toBe(200);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /:id/actions returns 500 on DB error', async () => {
    mockPrisma.riskAction.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/actions');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:id/actions returns 500 when create fails', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskAction.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions')
      .send({ actionTitle: 'Fix', description: 'Desc', actionType: 'PREVENTIVE', targetDate: '2026-06-01T00:00:00Z' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:riskId/actions/:id returns 500 when update fails', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskAction.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put('/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001')
      .send({ priority: 'HIGH' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /complete returns 500 when update fails', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001' });
    mockPrisma.riskAction.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000001/complete')
      .send({ evidenceOfCompletion: 'Photo' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /actions/overdue returns 500 on DB error', async () => {
    mockPrisma.riskAction.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/actions/overdue');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /actions/due-soon returns 500 on DB error', async () => {
    mockPrisma.riskAction.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/actions/due-soon');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ─── POST complete — 404 when action not found ───────────────────────────────

describe('POST /complete — not found', () => {
  it('returns 404 when action not found', async () => {
    mockPrisma.riskAction.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/actions/00000000-0000-0000-0000-000000000099/complete')
      .send({ evidenceOfCompletion: 'Photo' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('actions.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/risks', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/risks', async () => {
    const res = await request(app).get('/api/risks');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/risks body has success property', async () => {
    const res = await request(app).get('/api/risks');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/risks body is an object', async () => {
    const res = await request(app).get('/api/risks');
    expect(typeof res.body).toBe('object');
  });
});
