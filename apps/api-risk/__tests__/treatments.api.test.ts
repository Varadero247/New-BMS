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

import router from '../src/routes/treatments';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/treatments', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/treatments', () => {
  it('should return treatment counts', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { treatment: 'MITIGATE' },
      { treatment: 'ACCEPT' },
      { treatment: 'MITIGATE' },
      { treatment: 'TRANSFER' },
    ]);
    const res = await request(app).get('/api/treatments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    const mitigate = res.body.data.find((d: any) => d.treatment === 'MITIGATE');
    expect(mitigate.count).toBe(2);
  });

  it('should return empty array when no risks exist', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/treatments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('should return 500 on error', async () => {
    mockPrisma.riskRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/treatments');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('correctly aggregates all four standard treatment types', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { treatment: 'MITIGATE' },
      { treatment: 'ACCEPT' },
      { treatment: 'TRANSFER' },
      { treatment: 'AVOID' },
      { treatment: 'ACCEPT' },
    ]);
    const res = await request(app).get('/api/treatments');
    const data: Array<{ treatment: string; count: number }> = res.body.data;
    expect(data.find((d) => d.treatment === 'MITIGATE')!.count).toBe(1);
    expect(data.find((d) => d.treatment === 'ACCEPT')!.count).toBe(2);
    expect(data.find((d) => d.treatment === 'TRANSFER')!.count).toBe(1);
    expect(data.find((d) => d.treatment === 'AVOID')!.count).toBe(1);
  });

  it('returns one entry per distinct treatment type', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { treatment: 'MITIGATE' },
      { treatment: 'MITIGATE' },
      { treatment: 'ACCEPT' },
    ]);
    const res = await request(app).get('/api/treatments');
    expect(res.body.data).toHaveLength(2);
  });

  it('each entry has treatment and count fields', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ treatment: 'AVOID' }]);
    const res = await request(app).get('/api/treatments');
    expect(res.body.data[0]).toHaveProperty('treatment');
    expect(res.body.data[0]).toHaveProperty('count');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/treatments');
    expect(mockPrisma.riskRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('success is true on 200', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/treatments');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('data is an array', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/treatments');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('count field is a number', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([{ treatment: 'MITIGATE' }]);
    const res = await request(app).get('/api/treatments');
    expect(typeof res.body.data[0].count).toBe('number');
  });
});
