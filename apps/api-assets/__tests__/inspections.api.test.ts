import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetInspection: {
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

import router from '../src/routes/inspections';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/inspections', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/inspections', () => {
  it('should return inspections list', async () => {
    mockPrisma.assetInspection.findMany.mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', referenceNumber: 'AIN-2026-0001' },
    ]);
    mockPrisma.assetInspection.count.mockResolvedValue(1);
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status filter', async () => {
    mockPrisma.assetInspection.findMany.mockResolvedValue([]);
    mockPrisma.assetInspection.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inspections?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search filter', async () => {
    mockPrisma.assetInspection.findMany.mockResolvedValue([]);
    mockPrisma.assetInspection.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inspections?search=crane');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    mockPrisma.assetInspection.findMany.mockRejectedValue(new Error('DB error'));
    mockPrisma.assetInspection.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/inspections/:id', () => {
  it('should return an inspection by id', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'AIN-2026-0001',
    });
    const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/inspections/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/inspections', () => {
  it('should create an inspection', async () => {
    mockPrisma.assetInspection.count.mockResolvedValue(0);
    mockPrisma.assetInspection.create.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      referenceNumber: 'AIN-2026-0001',
    });
    const res = await request(app).post('/api/inspections').send({
      assetId: 'asset-1',
      condition: 'GOOD',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on validation error (missing assetId)', async () => {
    const res = await request(app).post('/api/inspections').send({
      condition: 'GOOD',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid condition enum', async () => {
    const res = await request(app).post('/api/inspections').send({
      assetId: 'asset-1',
      condition: 'INVALID_CONDITION',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    mockPrisma.assetInspection.count.mockResolvedValue(0);
    mockPrisma.assetInspection.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/inspections').send({
      assetId: 'asset-1',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/inspections/:id', () => {
  it('should update an inspection', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetInspection.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      condition: 'EXCELLENT',
    });
    const res = await request(app)
      .put('/api/inspections/00000000-0000-0000-0000-000000000001')
      .send({ condition: 'EXCELLENT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app)
      .put('/api/inspections/00000000-0000-0000-0000-000000000099')
      .send({ condition: 'GOOD' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on validation error (invalid condition)', async () => {
    const res = await request(app)
      .put('/api/inspections/00000000-0000-0000-0000-000000000001')
      .send({ condition: 'BAD_CONDITION' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetInspection.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app)
      .put('/api/inspections/00000000-0000-0000-0000-000000000001')
      .send({ condition: 'GOOD' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/inspections/:id', () => {
  it('should soft delete an inspection', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetInspection.update.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    const res = await request(app).delete('/api/inspections/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if not found', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/inspections/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on delete error', async () => {
    mockPrisma.assetInspection.findFirst.mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
    });
    mockPrisma.assetInspection.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/inspections/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
