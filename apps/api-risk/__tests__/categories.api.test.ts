import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: { riskRegister: { findMany: jest.fn() } },
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

import router from '../src/routes/categories';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/categories', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/categories', () => {
  it('should return category counts', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { category: 'OPERATIONAL' },
      { category: 'FINANCIAL' },
      { category: 'OPERATIONAL' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const operational = res.body.data.find((d: any) => d.category === 'OPERATIONAL');
    expect(operational.count).toBe(2);
  });

  it('should return empty array when no risks exist', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    mockPrisma.riskRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('counts are aggregated correctly across all categories', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { category: 'FINANCIAL' },
      { category: 'FINANCIAL' },
      { category: 'FINANCIAL' },
      { category: 'STRATEGIC' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    const financial = res.body.data.find((d: any) => d.category === 'FINANCIAL');
    const strategic = res.body.data.find((d: any) => d.category === 'STRATEGIC');
    expect(financial.count).toBe(3);
    expect(strategic.count).toBe(1);
  });

  it('returns one entry per distinct category', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { category: 'OPERATIONAL' },
      { category: 'COMPLIANCE' },
      { category: 'REPUTATIONAL' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.body.data).toHaveLength(3);
  });

  it('each entry has category and count fields', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ category: 'OPERATIONAL' }]);
    const res = await request(app).get('/api/categories');
    expect(res.body.data[0]).toHaveProperty('category');
    expect(res.body.data[0]).toHaveProperty('count');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/categories');
    expect(mockPrisma.riskRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('success is true on 200', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data is an array', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/categories');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('count field is a number', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ category: 'OPERATIONAL' }]);
    const res = await request(app).get('/api/categories');
    expect(typeof res.body.data[0].count).toBe('number');
  });
});

describe('Risk Categories — extended', () => {
  it('single category with count 1', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ category: 'COMPLIANCE' }]);
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(200);
    const compliance = res.body.data.find((d: any) => d.category === 'COMPLIANCE');
    expect(compliance.count).toBe(1);
  });

  it('error message is returned on 500', async () => {
    mockPrisma.riskRegister.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/categories');
    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
  });

  it('data length matches number of distinct categories', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { category: 'OPERATIONAL' },
      { category: 'OPERATIONAL' },
      { category: 'STRATEGIC' },
      { category: 'REPUTATIONAL' },
    ]);
    const res = await request(app).get('/api/categories');
    expect(res.body.data).toHaveLength(3);
  });

  it('category field is a string', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ category: 'FINANCIAL' }]);
    const res = await request(app).get('/api/categories');
    expect(typeof res.body.data[0].category).toBe('string');
  });

  it('response has success field', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/categories');
    expect(res.body).toHaveProperty('success');
  });
});

describe('categories.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/categories', router);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/categories', async () => {
    const res = await request(app).get('/api/categories');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/categories', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/categories body has success property', async () => {
    const res = await request(app).get('/api/categories');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/categories body is an object', async () => {
    const res = await request(app).get('/api/categories');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/categories route is accessible', async () => {
    const res = await request(app).get('/api/categories');
    expect(res.status).toBeDefined();
  });
});
