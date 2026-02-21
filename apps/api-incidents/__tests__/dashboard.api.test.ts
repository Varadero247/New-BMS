import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { incIncident: { count: jest.fn() } },
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
  it('should return stats with totalIncidents', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(42);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalIncidents', 42);
    expect(mockPrisma.incIncident.count).toHaveBeenCalledWith({
      where: { orgId: 'org-1', deletedAt: null },
    });
  });

  it('should return 500 on database error', async () => {
    mockPrisma.incIncident.count.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns zero when no incidents exist', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncidents).toBe(0);
  });

  it('count is called exactly once per request', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(5);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.incIncident.count).toHaveBeenCalledTimes(1);
  });

  it('response data contains totalIncidents key', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalIncidents');
    expect(typeof res.body.data.totalIncidents).toBe('number');
  });

  it('count query includes orgId in where clause', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.incIncident.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ orgId: 'org-1' }) })
    );
  });

  it('totalIncidents reflects various mock values', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(99);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncidents).toBe(99);
  });

  it('success is true on 200 response', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('GET /api/dashboard/stats — extended', () => {
  it('error response does not include data field', async () => {
    mockPrisma.incIncident.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.data).toBeUndefined();
  });

  it('response body has success property on success', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body).toHaveProperty('success');
  });

  it('count query includes deletedAt: null in where clause', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.incIncident.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ deletedAt: null }) })
    );
  });

  it('returns 200 with large count values', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(5000);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncidents).toBe(5000);
  });

  it('totalIncidents is not null on success', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(7);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalIncidents).not.toBeNull();
  });

  it('error code present on 500', async () => {
    mockPrisma.incIncident.count.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
  });

  it('success false when error is thrown', async () => {
    mockPrisma.incIncident.count.mockRejectedValue(new Error('err'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toBe(false);
  });
});

describe('GET /api/dashboard/stats — additional coverage', () => {
  it('returns 200 with JSON content-type header', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(10);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('makes exactly two count calls across two requests', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(4);
    await request(app).get('/api/dashboard/stats');
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.incIncident.count).toHaveBeenCalledTimes(2);
  });

  it('where clause uses deletedAt: null to exclude soft-deleted records', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(3);
    await request(app).get('/api/dashboard/stats');
    const callArg = (mockPrisma.incIncident.count as jest.Mock).mock.calls[0][0];
    expect(callArg.where.deletedAt).toBeNull();
  });

  it('totalIncidents is a number type not a string', async () => {
    mockPrisma.incIncident.count.mockResolvedValue(8);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalIncidents).toBe('number');
  });

  it('error body contains both code and message fields', async () => {
    mockPrisma.incIncident.count.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error).toHaveProperty('code');
    expect(res.body.error).toHaveProperty('message');
  });
});
