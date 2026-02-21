import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    riskRegister: { findFirst: jest.fn(), update: jest.fn() },
    riskControl: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
    },
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

import router from '../src/routes/controls';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/risks', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('POST /api/risks/:id/controls', () => {
  it('should create a control', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockResolvedValue({ id: 'c1', controlType: 'PREVENTIVE' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'ADEQUATE' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test control' });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if risk not found', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test' });
    expect(res.status).toBe(404);
  });

  it('should validate control type', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'INVALID', description: 'Test' });
    expect(res.status).toBe(400);
  });
});

describe('GET /api/risks/:id/controls', () => {
  it('should return controls', async () => {
    mockPrisma.riskControl.findMany.mockResolvedValue([{ id: 'c1' }]);
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });
});

describe('PUT /api/risks/:riskId/controls/:id', () => {
  it('should update control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', effectiveness: 'STRONG' });
    mockPrisma.riskControl.findMany.mockResolvedValue([{ effectiveness: 'STRONG' }]);
    mockPrisma.riskRegister.update.mockResolvedValue({});
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });

  it('should return 404 if control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/risks/:riskId/controls/:id', () => {
  it('should soft delete control', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', isActive: false });
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(200);
  });
});

describe('POST /api/risks/:riskId/controls/:id/test', () => {
  it('should record test result', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockResolvedValue({ id: 'c1', lastTestedDate: new Date() });
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed', effectiveness: 'STRONG' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed' });
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/risks/:riskId/controls/:id — not-found', () => {
  it('returns 404 when control not found', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue(null);
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('POST /:id/controls returns 500 when create fails', async () => {
    mockPrisma.riskRegister.findFirst.mockResolvedValue({ id: 'r1' });
    mockPrisma.riskControl.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post('/api/risks/00000000-0000-0000-0000-000000000001/controls')
      .send({ controlType: 'PREVENTIVE', description: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id/controls returns 500 on DB error', async () => {
    mockPrisma.riskControl.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/risks/00000000-0000-0000-0000-000000000001/controls');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:riskId/controls/:id returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .put(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
      )
      .send({ effectiveness: 'STRONG' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:riskId/controls/:id returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete(
      '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002'
    );
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /:riskId/controls/:id/test returns 500 when update fails', async () => {
    mockPrisma.riskControl.findFirst.mockResolvedValue({ id: 'c1' });
    mockPrisma.riskControl.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app)
      .post(
        '/api/risks/00000000-0000-0000-0000-000000000001/controls/00000000-0000-0000-0000-000000000002/test'
      )
      .send({ testingNotes: 'Passed' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
