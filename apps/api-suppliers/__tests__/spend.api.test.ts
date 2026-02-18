import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppSpend: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

import router from '../src/routes/spend';
import { prisma } from '../src/prisma';
const app = express();
app.use(express.json());
app.use('/api/spend', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/spend', () => {
  it('should return spend list', async () => {
    (prisma as any).suppSpend.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', amount: 5000, period: '2026-Q1' },
    ]);
    (prisma as any).suppSpend.count.mockResolvedValue(1);
    const res = await request(app).get('/api/spend');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should support status filter', async () => {
    (prisma as any).suppSpend.findMany.mockResolvedValue([]);
    (prisma as any).suppSpend.count.mockResolvedValue(0);
    const res = await request(app).get('/api/spend?status=APPROVED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on DB error', async () => {
    (prisma as any).suppSpend.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/spend');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('GET /api/spend/:id', () => {
  it('should return a spend record by id', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      amount: 5000,
    });
    const res = await request(app).get('/api/spend/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/spend/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/spend', () => {
  it('should create a spend record', async () => {
    (prisma as any).suppSpend.count.mockResolvedValue(0);
    (prisma as any).suppSpend.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      supplierId: 'sup-1',
      period: '2026-Q1',
      amount: 5000,
    });
    const res = await request(app).post('/api/spend').send({
      supplierId: 'sup-1',
      period: '2026-Q1',
      amount: 5000,
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on missing required fields', async () => {
    const res = await request(app).post('/api/spend').send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on negative amount', async () => {
    const res = await request(app).post('/api/spend').send({
      supplierId: 'sup-1',
      period: '2026-Q1',
      amount: -100,
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('PUT /api/spend/:id', () => {
  it('should update a spend record', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      amount: 5000,
    });
    (prisma as any).suppSpend.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      amount: 8000,
    });
    const res = await request(app)
      .put('/api/spend/00000000-0000-0000-0000-000000000001')
      .send({ amount: 8000 });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if spend not found on update', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/spend/00000000-0000-0000-0000-000000000099')
      .send({ amount: 8000 });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('DELETE /api/spend/:id', () => {
  it('should soft delete a spend record', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    (prisma as any).suppSpend.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/spend/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toBe('spend deleted successfully');
  });

  it('should return 404 if spend not found on delete', async () => {
    (prisma as any).suppSpend.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/spend/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
