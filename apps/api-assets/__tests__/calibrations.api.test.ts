import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { assetCalibration: { findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() } },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/calibrations';
import { prisma } from '../src/prisma';
const app = express(); app.use(express.json()); app.use('/api/calibrations', router);
beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/calibrations', () => {
  it('should return calibrations list', async () => {
    (prisma as any).assetCalibration.findMany.mockResolvedValue([{ id: '1', referenceNumber: 'ACL-2026-0001' }]);
    (prisma as any).assetCalibration.count.mockResolvedValue(1);
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should support status filter', async () => {
    (prisma as any).assetCalibration.findMany.mockResolvedValue([]);
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?status=PASSED');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should support search filter', async () => {
    (prisma as any).assetCalibration.findMany.mockResolvedValue([]);
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/calibrations?search=torque');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 500 on error', async () => {
    (prisma as any).assetCalibration.findMany.mockRejectedValue(new Error('DB error'));
    (prisma as any).assetCalibration.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/calibrations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/calibrations/:id', () => {
  it('should return a calibration by id', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue({ id: '1', referenceNumber: 'ACL-2026-0001' });
    const res = await request(app).get('/api/calibrations/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('1');
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/calibrations/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('POST /api/calibrations', () => {
  it('should create a calibration', async () => {
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    (prisma as any).assetCalibration.create.mockResolvedValue({ id: '1', referenceNumber: 'ACL-2026-0001' });
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
      status: 'SCHEDULED',
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 on validation error (missing assetId)', async () => {
    const res = await request(app).post('/api/calibrations').send({
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 400 on invalid status enum', async () => {
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
      status: 'INVALID_STATUS',
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on create error', async () => {
    (prisma as any).assetCalibration.count.mockResolvedValue(0);
    (prisma as any).assetCalibration.create.mockRejectedValue(new Error('DB error'));
    const res = await request(app).post('/api/calibrations').send({
      assetId: 'asset-1',
      scheduledDate: '2026-03-01',
    });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('PUT /api/calibrations/:id', () => {
  it('should update a calibration', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetCalibration.update.mockResolvedValue({ id: '1', status: 'PASSED' });
    const res = await request(app).put('/api/calibrations/1').send({ status: 'PASSED' });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app).put('/api/calibrations/nope').send({ status: 'PASSED' });
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 on validation error (invalid status)', async () => {
    const res = await request(app).put('/api/calibrations/1').send({ status: 'BAD_STATUS' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('should return 500 on update error', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetCalibration.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).put('/api/calibrations/1').send({ status: 'PASSED' });
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('DELETE /api/calibrations/:id', () => {
  it('should soft delete a calibration', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetCalibration.update.mockResolvedValue({ id: '1' });
    const res = await request(app).delete('/api/calibrations/1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.message).toMatch(/deleted/i);
  });

  it('should return 404 if not found', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue(null);
    const res = await request(app).delete('/api/calibrations/nope');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 500 on delete error', async () => {
    (prisma as any).assetCalibration.findFirst.mockResolvedValue({ id: '1' });
    (prisma as any).assetCalibration.update.mockRejectedValue(new Error('DB error'));
    const res = await request(app).delete('/api/calibrations/1');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
