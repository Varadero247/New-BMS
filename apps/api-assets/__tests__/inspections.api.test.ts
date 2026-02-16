import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { assetInspection: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/inspections';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/inspections', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/inspections', () => {
  it('should return inspections list', async () => {
    (prisma as any).assetInspection.findMany.mockResolvedValue([{ id: '1', referenceNumber: 'AIN-2026-0001' }]);
    (prisma as any).assetInspection.count.mockResolvedValue(1);
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status filter', async () => {
    (prisma as any).assetInspection.findMany.mockResolvedValue([]);
    (prisma as any).assetInspection.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inspections?status=COMPLETED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search filter', async () => {
    (prisma as any).assetInspection.findMany.mockResolvedValue([]);
    (prisma as any).assetInspection.count.mockResolvedValue(0);
    const res = await request(app).get('/api/inspections?search=crane');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    (prisma as any).assetInspection.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).assetInspection.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/inspections');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/inspections/:id', () => {
  it('should return an inspection by id', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue({ id: '1', referenceNumber: 'AIN-2026-0001' });
    const res = await request(app).get('/api/inspections/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/inspections/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/inspections', () => {
  it('should create an inspection', async () => {
    (prisma as any).assetInspection.count.mockResolvedValue(0);
    (prisma as any).assetInspection.create.mockResolvedValue({ id: '1', referenceNumber: 'AIN-2026-0001' });
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

  it('should return 400 on create error', async () => {
    (prisma as any).assetInspection.count.mockResolvedValue(0);
    (prisma as any).assetInspection.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/inspections').send({
      assetId: 'asset-1',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/inspections/:id', () => {
  it('should update an inspection', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetInspection.update.mockResolvedValue({ id: '1', condition: 'EXCELLENT' });
    const res = await request(app).put('/api/inspections/1').send({ condition: 'EXCELLENT' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/inspections/nope').send({ condition: 'GOOD' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on validation error (invalid condition)', async () => {
    const res = await request(app).put('/api/inspections/1').send({ condition: 'BAD_CONDITION' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetInspection.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/inspections/1').send({ condition: 'GOOD' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/inspections/:id', () => {
  it('should soft delete an inspection', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetInspection.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/inspections/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/inspections/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).assetInspection.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetInspection.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/inspections/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
