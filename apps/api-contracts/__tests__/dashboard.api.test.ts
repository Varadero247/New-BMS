import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { contContract: { count: jest.fn() }, contNotice: { count: jest.fn() } },
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
  it('should return contract dashboard stats', async () => {
    mockPrisma.contContract.count.mockResolvedValue(42);
    mockPrisma.contNotice.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.totalContracts).toBe(42);
    expect(res.body.data.upcomingNotices).toBe(5);
  });

  it('should return 500 on db error', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('DB failure'));
    mockPrisma.contNotice.count.mockRejectedValue(new Error('DB failure'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns zero counts when no contracts or notices exist', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBe(0);
    expect(res.body.data.upcomingNotices).toBe(0);
  });

  it('response data contains exactly the expected keys', async () => {
    mockPrisma.contContract.count.mockResolvedValue(1);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalContracts');
    expect(res.body.data).toHaveProperty('upcomingNotices');
  });

  it('runs both count queries per request', async () => {
    mockPrisma.contContract.count.mockResolvedValue(5);
    mockPrisma.contNotice.count.mockResolvedValue(2);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.contContract.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.contNotice.count).toHaveBeenCalledTimes(1);
  });

  it('returns separate values for contracts and notices', async () => {
    mockPrisma.contContract.count.mockResolvedValue(100);
    mockPrisma.contNotice.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalContracts).toBe(100);
    expect(res.body.data.upcomingNotices).toBe(3);
    expect(res.body.data.totalContracts).not.toBe(res.body.data.upcomingNotices);
  });

  it('totalContracts is a number', async () => {
    mockPrisma.contContract.count.mockResolvedValue(7);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalContracts).toBe('number');
  });

  it('upcomingNotices reflects the mock count', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(11);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.upcomingNotices).toBe(11);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('Contracts Dashboard — extended', () => {
  it('totalContracts and upcomingNotices are both numbers', async () => {
    mockPrisma.contContract.count.mockResolvedValue(20);
    mockPrisma.contNotice.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalContracts).toBe('number');
    expect(typeof res.body.data.upcomingNotices).toBe('number');
  });

  it('contContract.count is called once per request', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.contContract.count).toHaveBeenCalledTimes(1);
  });

  it('success is false on 500', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('fail'));
    mockPrisma.contNotice.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Contracts Dashboard — extra', () => {
  it('upcomingNotices is a number', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(4);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.upcomingNotices).toBe('number');
  });

  it('error code is INTERNAL_ERROR on failure', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('db error'));
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('contNotice.count is called once per request', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.contNotice.count).toHaveBeenCalledTimes(1);
  });
});

// ─── additional coverage ─────────────────────────────────────────────────────

describe('contracts dashboard route — additional coverage', () => {
  it('auth enforcement: unauthenticated request receives 401', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    });
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it('GET /stats returns 200 with success true when both counts are zero', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalContracts).toBe(0);
    expect(res.body.data.upcomingNotices).toBe(0);
  });

  it('GET /stats returns 500 and error code INTERNAL_ERROR when contContract.count throws', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('DB unavailable'));
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /stats data contains only the expected shape', async () => {
    mockPrisma.contContract.count.mockResolvedValue(8);
    mockPrisma.contNotice.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data)).toContain('totalContracts');
    expect(Object.keys(res.body.data)).toContain('upcomingNotices');
  });

  it('GET /stats totalContracts and upcomingNotices can differ', async () => {
    mockPrisma.contContract.count.mockResolvedValue(200);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalContracts).not.toBe(res.body.data.upcomingNotices);
  });
});
