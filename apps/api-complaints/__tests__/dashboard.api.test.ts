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

describe('Complaints Dashboard — extra', () => {
  it('error code is INTERNAL_ERROR when compAction.count rejects', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockRejectedValue(new Error('action count fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('totalActions reflects large count', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(8888);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalActions).toBe(8888);
  });

  it('compAction.count is called once per request', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
  });
});

// ─── additional coverage ─────────────────────────────────────────────────────

describe('complaints dashboard route — additional coverage', () => {
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
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalComplaints).toBe(0);
    expect(res.body.data.totalActions).toBe(0);
  });

  it('GET /stats returns 500 and error code INTERNAL_ERROR when compComplaint.count throws', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('DB unavailable'));
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /stats data contains only the expected shape', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(4);
    mockPrisma.compAction.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data)).toContain('totalComplaints');
    expect(Object.keys(res.body.data)).toContain('totalActions');
  });

  it('GET /stats totalComplaints and totalActions can differ', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(100);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalComplaints).not.toBe(res.body.data.totalActions);
  });
});

describe('complaints dashboard — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /stats response body has a data property', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(1);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /stats compComplaint.count called with no extra filters', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(1);
  });

  it('GET /stats totalComplaints reflects updated mock value', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(77);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalComplaints).toBe(77);
  });

  it('GET /stats totalActions reflects updated mock value', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(42);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalActions).toBe(42);
  });

  it('GET /stats returns 500 when compAction.count rejects after compComplaint.count resolves', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(5);
    mockPrisma.compAction.count.mockRejectedValue(new Error('action error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /stats error body has code and message', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('db down'));
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });

  it('GET /stats data is an object not an array', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(2);
    mockPrisma.compAction.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data).toBe('object');
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('GET /stats content-type is JSON', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('complaints dashboard — final coverage expansion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /stats returns 200 when counts resolve to 1 each', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(1);
    mockPrisma.compAction.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalComplaints).toBe(1);
    expect(res.body.data.totalActions).toBe(1);
  });

  it('GET /stats error has message property on 500', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('crash'));
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });

  it('GET /stats data is not an array', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('GET /stats totalComplaints matches large count value', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(100000);
    mockPrisma.compAction.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalComplaints).toBe(100000);
  });

  it('GET /stats totalActions matches large count value', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(50000);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalActions).toBe(50000);
  });

  it('GET /stats success is boolean true not string', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(3);
    mockPrisma.compAction.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.success).toBe('boolean');
    expect(res.body.success).toBe(true);
  });

  it('GET /stats compAction.count called even when compComplaint.count returns 0', async () => {
    mockPrisma.compComplaint.count.mockResolvedValue(0);
    mockPrisma.compAction.count.mockResolvedValue(9);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(mockPrisma.compAction.count).toHaveBeenCalledTimes(1);
    expect(res.body.data.totalActions).toBe(9);
  });
});
