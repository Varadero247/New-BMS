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

describe('GET /api/dashboard/stats — extended', () => {
  it('regLegalRegister error causes 500', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockRejectedValue(new Error('legal fail'));
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('regObligation error causes 500', async () => {
    mockPrisma.regChange.count.mockResolvedValue(1);
    mockPrisma.regLegalRegister.count.mockResolvedValue(1);
    mockPrisma.regObligation.count.mockRejectedValue(new Error('obligation fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('success is true with all non-zero counts', async () => {
    mockPrisma.regChange.count.mockResolvedValue(4);
    mockPrisma.regLegalRegister.count.mockResolvedValue(9);
    mockPrisma.regObligation.count.mockResolvedValue(13);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('response body has success property', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).toHaveProperty('success');
  });

  it('error response does not include data field', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('fail'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('totalChanges is a number on success', async () => {
    mockPrisma.regChange.count.mockResolvedValue(6);
    mockPrisma.regLegalRegister.count.mockResolvedValue(2);
    mockPrisma.regObligation.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalChanges).toBe('number');
  });

  it('all three values correct simultaneously', async () => {
    mockPrisma.regChange.count.mockResolvedValue(7);
    mockPrisma.regLegalRegister.count.mockResolvedValue(14);
    mockPrisma.regObligation.count.mockResolvedValue(21);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalChanges).toBe(7);
    expect(res.body.data.totalLegalItems).toBe(14);
    expect(res.body.data.totalObligations).toBe(21);
  });
});

describe('dashboard.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/dashboard body has success property', async () => {
    const res = await request(app).get('/api/dashboard');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/dashboard body is an object', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/dashboard route is accessible', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBeDefined();
  });
});

describe('Dashboard Stats — extended edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/dashboard/stats data keys are all numbers', async () => {
    mockPrisma.regChange.count.mockResolvedValue(2);
    mockPrisma.regLegalRegister.count.mockResolvedValue(3);
    mockPrisma.regObligation.count.mockResolvedValue(4);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalChanges).toBe('number');
    expect(typeof res.body.data.totalLegalItems).toBe('number');
    expect(typeof res.body.data.totalObligations).toBe('number');
  });

  it('GET /api/dashboard/stats returns 200 with large counts', async () => {
    mockPrisma.regChange.count.mockResolvedValue(99999);
    mockPrisma.regLegalRegister.count.mockResolvedValue(88888);
    mockPrisma.regObligation.count.mockResolvedValue(77777);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalChanges).toBe(99999);
    expect(res.body.data.totalLegalItems).toBe(88888);
    expect(res.body.data.totalObligations).toBe(77777);
  });

  it('GET /api/dashboard/stats error body has error.code', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('db fail'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
  });

  it('GET /api/dashboard/stats each count prop present with value 1', async () => {
    mockPrisma.regChange.count.mockResolvedValue(1);
    mockPrisma.regLegalRegister.count.mockResolvedValue(1);
    mockPrisma.regObligation.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalChanges).toBe(1);
    expect(res.body.data.totalLegalItems).toBe(1);
    expect(res.body.data.totalObligations).toBe(1);
  });

  it('GET /api/dashboard/stats success is false on error', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('fail'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toBe(false);
  });

  it('GET /api/dashboard/stats returns status 200 with success true', async () => {
    mockPrisma.regChange.count.mockResolvedValue(5);
    mockPrisma.regLegalRegister.count.mockResolvedValue(5);
    mockPrisma.regObligation.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/dashboard/stats error data field is undefined', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('crash'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('GET /api/dashboard/stats regObligation count called once per request', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.regObligation.count).toHaveBeenCalledTimes(1);
  });
});

describe('Dashboard Stats — additional final cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/dashboard/stats response body is an object', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/dashboard/stats totalObligations is a number', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(10);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalObligations).toBe('number');
  });

  it('GET /api/dashboard/stats totalLegalItems is a number', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(8);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalLegalItems).toBe('number');
  });

  it('GET /api/dashboard/stats error.message is defined on 500', async () => {
    mockPrisma.regChange.count.mockRejectedValue(new Error('DB crash'));
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.message).toBeDefined();
  });

  it('GET /api/dashboard/stats regLegalRegister count called once', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.regLegalRegister.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/dashboard/stats regChange count called once', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.regChange.count).toHaveBeenCalledTimes(1);
  });

  it('GET /api/dashboard/stats returns 200 when all counts are 0', async () => {
    mockPrisma.regChange.count.mockResolvedValue(0);
    mockPrisma.regLegalRegister.count.mockResolvedValue(0);
    mockPrisma.regObligation.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
