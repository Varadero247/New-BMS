import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    regChange: { count: jest.fn() },
    regLegalRegister: { count: jest.fn() },
    regObligation: { count: jest.fn() },
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
  it('should return dashboard stats with all counts', async () => {
    mockPrisma.regChange.count.mockResolvedValue(10);
    mockPrisma.regLegalRegister.count.mockResolvedValue(5);
    mockPrisma.regObligation.count.mockResolvedValue(8);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalChanges).toBe(10);
    expect(res.body.data.totalLegalItems).toBe(5);
    expect(res.body.data.totalObligations).toBe(8);
  });

  it('should return zero counts when no data exists', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalChanges).toBe(0);
    expect(res.body.data.totalLegalItems).toBe(0);
    expect(res.body.data.totalObligations).toBe(0);
  });

  it('should return 500 when database query fails', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all three expected data keys', async () => {
    mockPrisma.regChange.count.mockResolvedValue(1);
    mockPrisma.regLegalRegister.count.mockResolvedValue(1);
    mockPrisma.regObligation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalChanges');
    expect(res.body.data).toHaveProperty('totalLegalItems');
    expect(res.body.data).toHaveProperty('totalObligations');
  });

  it('each count query runs once per request', async () => {
    mockPrisma.regChange.count.mockResolvedValue(3);
    mockPrisma.regLegalRegister.count.mockResolvedValue(2);
    mockPrisma.regObligation.count.mockResolvedValue(7);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.regChange.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.regLegalRegister.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.regObligation.count).toHaveBeenCalledTimes(1);
  });

  it('totalChanges is a number', async () => {
    mockPrisma.regChange.count.mockResolvedValue(3);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalChanges).toBe('number');
  });

  it('totalLegalItems reflects the mock count', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(15);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalLegalItems).toBe(15);
  });

  it('totalObligations reflects the mock count', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(22);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalObligations).toBe(22);
  });
});
