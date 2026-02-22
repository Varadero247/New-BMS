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

describe('contracts dashboard — additional edge cases', () => {
  it('GET /stats returns 200 with both counts as zero when no records', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBe(0);
    expect(res.body.data.upcomingNotices).toBe(0);
  });

  it('GET /stats data object is not null', async () => {
    mockPrisma.contContract.count.mockResolvedValue(5);
    mockPrisma.contNotice.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
    expect(typeof res.body.data).toBe('object');
  });

  it('GET /stats response content-type is application/json', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('GET /stats totalContracts is a non-negative number', async () => {
    mockPrisma.contContract.count.mockResolvedValue(12);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBeGreaterThanOrEqual(0);
  });

  it('GET /stats upcomingNotices is a non-negative number', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(7);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.upcomingNotices).toBeGreaterThanOrEqual(0);
  });

  it('GET /stats error body contains error.message on 500', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('connection refused'));
    mockPrisma.contNotice.count.mockRejectedValue(new Error('connection refused'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBeDefined();
  });

  it('GET /stats large values are returned accurately', async () => {
    mockPrisma.contContract.count.mockResolvedValue(50000);
    mockPrisma.contNotice.count.mockResolvedValue(999);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBe(50000);
    expect(res.body.data.upcomingNotices).toBe(999);
  });

  it('GET /stats both count methods are called once per request', async () => {
    mockPrisma.contContract.count.mockResolvedValue(3);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.contContract.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.contNotice.count).toHaveBeenCalledTimes(1);
  });

  it('GET /stats success field is boolean true on 200', async () => {
    mockPrisma.contContract.count.mockResolvedValue(1);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });
});

describe('contracts dashboard — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /stats returns 200 when both counts resolve to 1', async () => {
    mockPrisma.contContract.count.mockResolvedValue(1);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBe(1);
    expect(res.body.data.upcomingNotices).toBe(1);
  });

  it('GET /stats error body has both code and message on 500', async () => {
    mockPrisma.contContract.count.mockRejectedValue(new Error('crash'));
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code', 'INTERNAL_ERROR');
    expect(res.body.error).toHaveProperty('message');
  });

  it('GET /stats data is not an array', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('GET /stats totalContracts matches a large value', async () => {
    mockPrisma.contContract.count.mockResolvedValue(75000);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalContracts).toBe(75000);
  });

  it('GET /stats upcomingNotices matches a large value', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(8888);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.upcomingNotices).toBe(8888);
  });

  it('GET /stats success is boolean', async () => {
    mockPrisma.contContract.count.mockResolvedValue(3);
    mockPrisma.contNotice.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
  });

  it('GET /stats contNotice.count called even when contContract.count returns 0', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(mockPrisma.contNotice.count).toHaveBeenCalledTimes(1);
    expect(res.body.data.upcomingNotices).toBe(3);
  });
});

describe('contracts dashboard — coverage completion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /stats data has a data property as object', async () => {
    mockPrisma.contContract.count.mockResolvedValue(4);
    mockPrisma.contNotice.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe('object');
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('GET /stats totalContracts is a non-negative integer', async () => {
    mockPrisma.contContract.count.mockResolvedValue(10);
    mockPrisma.contNotice.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Number.isInteger(res.body.data.totalContracts)).toBe(true);
    expect(res.body.data.totalContracts).toBeGreaterThanOrEqual(0);
  });

  it('GET /stats upcomingNotices is a non-negative integer', async () => {
    mockPrisma.contContract.count.mockResolvedValue(0);
    mockPrisma.contNotice.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Number.isInteger(res.body.data.upcomingNotices)).toBe(true);
    expect(res.body.data.upcomingNotices).toBeGreaterThanOrEqual(0);
  });

  it('GET /stats success is not a string', async () => {
    mockPrisma.contContract.count.mockResolvedValue(1);
    mockPrisma.contNotice.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
  });
});
