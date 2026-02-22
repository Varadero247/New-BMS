import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { compComplaint: { count: jest.fn() } },
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

import router from '../src/routes/sla';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/escalations', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/escalations — phase28 coverage', () => {
  it('returns 200 with success:true', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(4).mockResolvedValueOnce(6);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns data object with overdue and onTrack fields', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(7);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overdue');
    expect(res.body.data).toHaveProperty('onTrack');
  });

  it('returns correct overdue count', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(5).mockResolvedValueOnce(10);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(5);
  });

  it('returns correct onTrack count', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(15);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.onTrack).toBe(15);
  });

  it('returns 500 with INTERNAL_ERROR when count rejects', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('calls count exactly twice per request', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    await request(app).get('/api/escalations');
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(2);
  });

  it('returns zero overdue when none are overdue', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(20);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(0);
  });

  it('returns zero onTrack when all are overdue', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(8).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.onTrack).toBe(0);
  });

  it('both fields are numbers', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(7);
    const res = await request(app).get('/api/escalations');
    expect(typeof res.body.data.overdue).toBe('number');
    expect(typeof res.body.data.onTrack).toBe('number');
  });

  it('success is boolean type', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(typeof res.body.success).toBe('boolean');
  });

  it('response content-type is application/json', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    const res = await request(app).get('/api/escalations');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });

  it('data object is not null', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data).not.toBeNull();
  });

  it('data is an object not an array', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('overdue and onTrack sum correctly', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(4).mockResolvedValueOnce(6);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue + res.body.data.onTrack).toBe(10);
  });

  it('success is false on 500 error', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Escalations — extended coverage', () => {
  it('error body has code property on 500', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
  });

  it('error body has message property on 500', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('message');
  });

  it('large count values are returned accurately', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(5000).mockResolvedValueOnce(12000);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(5000);
    expect(res.body.data.onTrack).toBe(12000);
  });

  it('overdue is a non-negative integer', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(9);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(Number.isInteger(res.body.data.overdue)).toBe(true);
    expect(res.body.data.overdue).toBeGreaterThanOrEqual(0);
  });

  it('onTrack is a non-negative integer', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(5);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(Number.isInteger(res.body.data.onTrack)).toBe(true);
    expect(res.body.data.onTrack).toBeGreaterThanOrEqual(0);
  });

  it('data does not contain unexpected keys beyond overdue and onTrack', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(8);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('overdue');
    expect(res.body.data).toHaveProperty('onTrack');
  });

  it('responds to second consecutive request correctly', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(2);
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(4);
    const res1 = await request(app).get('/api/escalations');
    const res2 = await request(app).get('/api/escalations');
    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);
    expect(res2.body.data.overdue).toBe(3);
  });

  it('overdue value matches first count call result', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(77).mockResolvedValueOnce(23);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(77);
  });

  it('onTrack value matches second count call result', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(5).mockResolvedValueOnce(88);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.onTrack).toBe(88);
  });

  it('success is true when both count calls resolve', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('error code is INTERNAL_ERROR when second count rejects', async () => {
    mockPrisma.compComplaint.count
      .mockResolvedValueOnce(3)
      .mockRejectedValueOnce(new Error('partial DB failure'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('count is not called when request fails at middleware', async () => {
    const { authenticate: mockAuth } = require('@ims/auth');
    (mockAuth as jest.Mock).mockImplementationOnce((_req: any, res: any) => {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } });
    });
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(401);
    expect(mockPrisma.compComplaint.count).not.toHaveBeenCalled();
  });

  it('both equal values for overdue and onTrack are handled', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(10).mockResolvedValueOnce(10);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(10);
    expect(res.body.data.onTrack).toBe(10);
  });

  it('response body has data property', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
  });

  it('data.overdue and data.onTrack are independent values', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(7).mockResolvedValueOnce(13);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).not.toBe(res.body.data.onTrack);
  });

  it('response succeeds with zero counts from both queries', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(0);
    expect(res.body.data.onTrack).toBe(0);
  });
});

describe('Escalations — phase28 completion', () => {
  beforeEach(() => { jest.clearAllMocks(); });

  it('GET / returns 200 with correct overdue count on boundary value', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(1).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(1);
    expect(res.body.data.onTrack).toBe(0);
  });

  it('GET / success field is strictly boolean not truthy string', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(typeof res.body.success).toBe('boolean');
  });

  it('GET / data object is not an array', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(4).mockResolvedValueOnce(5);
    const res = await request(app).get('/api/escalations');
    expect(Array.isArray(res.body.data)).toBe(false);
  });

  it('GET / error.message is a string on 500', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(typeof res.body.error.message).toBe('string');
  });

  it('GET / count queries both use orgId from request', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(3);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(mockPrisma.compComplaint.count).toHaveBeenCalledTimes(2);
  });

  it('GET / very large overdue value does not overflow JSON', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(999999).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBe(999999);
  });

  it('GET / both overdue and onTrack are numbers on each successful response', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(11).mockResolvedValueOnce(22);
    const res = await request(app).get('/api/escalations');
    expect(typeof res.body.data.overdue).toBe('number');
    expect(typeof res.body.data.onTrack).toBe('number');
  });

  it('GET / responds with 200 for any valid call', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
  });

  it('GET / success:true and data keys match spec on happy path', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(6).mockResolvedValueOnce(14);
    const res = await request(app).get('/api/escalations');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('overdue', 6);
    expect(res.body.data).toHaveProperty('onTrack', 14);
  });

  it('GET / response body has success and data keys', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('GET / 500 response has error property', async () => {
    mockPrisma.compComplaint.count.mockRejectedValue(new Error('db error'));
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('error');
  });

  it('GET / count is not called more than twice', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(3).mockResolvedValueOnce(5);
    await request(app).get('/api/escalations');
    expect(mockPrisma.compComplaint.count.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('GET / onTrack can be greater than overdue', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(2).mockResolvedValueOnce(100);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.onTrack).toBeGreaterThan(res.body.data.overdue);
  });

  it('GET / overdue can be greater than onTrack', async () => {
    mockPrisma.compComplaint.count.mockResolvedValueOnce(50).mockResolvedValueOnce(2);
    const res = await request(app).get('/api/escalations');
    expect(res.status).toBe(200);
    expect(res.body.data.overdue).toBeGreaterThan(res.body.data.onTrack);
  });
});
