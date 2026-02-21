import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { count: jest.fn() }, compAction: { count: jest.fn() } },
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
    mockPrisma.compComplaint.count.mockResolvedValue(10);
    mockPrisma.compAction.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.totalComplaints).toBe(10);
    expect(res.body.data.totalActions).toBe(5);
  });

  it('should return 500 on error', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns zero counts when no complaints or actions exist', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalComplaints).toBe(0);
    expect(res.body.data.totalActions).toBe(0);
  });

  it('response data has correct keys', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(1);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalComplaints');
    expect(res.body.data).toHaveProperty('totalActions');
  });

  it('runs both count queries per request', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(3);
    mockPrisma.compAction.count.mockResolvedValue(1);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
  });

  it('complaints and actions are reported independently', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(50);
    mockPrisma.compAction.count.mockResolvedValue(7);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalComplaints).toBe(50);
    expect(res.body.data.totalActions).toBe(7);
  });

  it('totalComplaints is a number', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(12);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalComplaints).toBe('number');
  });

  it('totalActions reflects the mock count', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(33);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalActions).toBe(33);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Complaints Dashboard — extended', () => {
  it('works with large count values', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(9999);
    mockPrisma.compAction.count.mockResolvedValue(2500);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalComplaints).toBe(9999);
  });

  it('both totalComplaints and totalActions are numbers', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(5);
    mockPrisma.compAction.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalComplaints).toBe('number');
    expect(typeof res.body.data.totalActions).toBe('number');
  });

  it('success is false on 500', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
