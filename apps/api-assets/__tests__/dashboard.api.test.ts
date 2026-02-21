import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    assetRegister: { count: jest.fn() },
    assetWorkOrder: { count: jest.fn() },
    assetCalibration: { count: jest.fn() },
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

import router from '../src/routes/dashboard';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return dashboard stats', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(42);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(10);
    mockPrisma.assetCalibration.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAssets).toBe(42);
    expect(res.body.data.totalWorkOrders).toBe(10);
    expect(res.body.data.totalCalibrations).toBe(5);
  });

  it('should return zeros when no records exist', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAssets).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.assetRegister.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response data has all required keys', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(1);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(1);
    mockPrisma.assetCalibration.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('totalAssets');
    expect(res.body.data).toHaveProperty('totalWorkOrders');
    expect(res.body.data).toHaveProperty('totalCalibrations');
  });

  it('count is called once per model per request', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.assetRegister.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.assetWorkOrder.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.assetCalibration.count).toHaveBeenCalledTimes(1);
  });

  it('totalAssets reflects the mock count', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(99);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalAssets).toBe(99);
  });

  it('totalWorkOrders reflects the mock count', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(15);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalWorkOrders).toBe(15);
  });
});

describe('GET /api/dashboard/stats — extended', () => {
  it('totalCalibrations reflects the mock count', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(0);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(33);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalCalibrations).toBe(33);
  });

  it('success flag is true when all counts are large', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(1000);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(500);
    mockPrisma.assetCalibration.count.mockResolvedValue(200);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('assetWorkOrder error causes 500', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(5);
    mockPrisma.assetWorkOrder.count.mockRejectedValue(new Error('WO error'));
    mockPrisma.assetCalibration.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('assetCalibration error causes 500', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(5);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(3);
    mockPrisma.assetCalibration.count.mockRejectedValue(new Error('Cal error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('error response does not include data field', async () => {
    mockPrisma.assetRegister.count.mockRejectedValue(new Error('fail'));
    mockPrisma.assetWorkOrder.count.mockResolvedValue(0);
    mockPrisma.assetCalibration.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('response body contains success property', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(7);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(2);
    mockPrisma.assetCalibration.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).toHaveProperty('success');
  });

  it('all three fields are numbers in successful response', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(3);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(6);
    mockPrisma.assetCalibration.count.mockResolvedValue(9);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalAssets).toBe('number');
    expect(typeof res.body.data.totalWorkOrders).toBe('number');
    expect(typeof res.body.data.totalCalibrations).toBe('number');
  });

  it('returns 200 with single-digit counts', async () => {
    mockPrisma.assetRegister.count.mockResolvedValue(1);
    mockPrisma.assetWorkOrder.count.mockResolvedValue(2);
    mockPrisma.assetCalibration.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalAssets).toBe(1);
    expect(res.body.data.totalWorkOrders).toBe(2);
    expect(res.body.data.totalCalibrations).toBe(3);
  });
});
