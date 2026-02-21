import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    suppSupplier: { count: jest.fn() },
    suppScorecard: { count: jest.fn() },
    suppDocument: { count: jest.fn() },
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
    mockPrisma.suppSupplier.count.mockResolvedValue(10);
    mockPrisma.suppScorecard.count.mockResolvedValue(5);
    mockPrisma.suppDocument.count.mockResolvedValue(20);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(10);
    expect(res.body.data.totalScorecards).toBe(5);
    expect(res.body.data.totalDocuments).toBe(20);
  });

  it('should return zeros when no data', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(0);
    mockPrisma.suppScorecard.count.mockResolvedValue(0);
    mockPrisma.suppDocument.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalSuppliers).toBe(0);
  });

  it('should return 500 on DB error', async () => {
    mockPrisma.suppSupplier.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all three expected data keys', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(1);
    mockPrisma.suppScorecard.count.mockResolvedValue(1);
    mockPrisma.suppDocument.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalSuppliers');
    expect(res.body.data).toHaveProperty('totalScorecards');
    expect(res.body.data).toHaveProperty('totalDocuments');
  });

  it('all three count queries run per request', async () => {
    mockPrisma.suppSupplier.count.mockResolvedValue(15);
    mockPrisma.suppScorecard.count.mockResolvedValue(8);
    mockPrisma.suppDocument.count.mockResolvedValue(30);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.suppSupplier.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppScorecard.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.suppDocument.count).toHaveBeenCalledTimes(1);
  });
});
