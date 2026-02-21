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

import router from '../src/routes/heat-map';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/heat-map', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/heat-map', () => {
  it('should return heat map data with risks', async () => {
    const mockRisks = [
      { id: '1', title: 'Risk A', likelihood: 3, consequence: 4, inherentScore: 12 },
      { id: '2', title: 'Risk B', likelihood: 2, consequence: 2, inherentScore: 4 },
    ];
    mockPrisma.riskRegister.findMany.mockResolvedValue(mockRisks);
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.risks).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
  });

  it('should return empty heat map when no open risks exist', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.risks).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.riskRegister.findMany.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/heat-map');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('total matches the number of risks returned', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { id: '1', title: 'R1', likelihood: 5, consequence: 5, inherentScore: 25 },
      { id: '2', title: 'R2', likelihood: 1, consequence: 1, inherentScore: 1 },
      { id: '3', title: 'R3', likelihood: 3, consequence: 3, inherentScore: 9 },
    ]);
    const res = await request(app).get('/api/heat-map');
    expect(res.body.data.total).toBe(3);
    expect(res.body.data.risks).toHaveLength(3);
  });

  it('each risk entry has id, title, likelihood, consequence, inherentScore', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([
      { id: 'r-1', title: 'Cyber breach', likelihood: 4, consequence: 5, inherentScore: 20 },
    ]);
    const res = await request(app).get('/api/heat-map');
    const risk = res.body.data.risks[0];
    expect(risk).toHaveProperty('id', 'r-1');
    expect(risk).toHaveProperty('title', 'Cyber breach');
    expect(risk).toHaveProperty('likelihood', 4);
    expect(risk).toHaveProperty('consequence', 5);
    expect(risk).toHaveProperty('inherentScore', 20);
  });

  it('findMany is called once per request', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    await request(app).get('/api/heat-map');
    expect(mockPrisma.riskRegister.findMany).toHaveBeenCalledTimes(1);
  });

  it('response has risks and total keys', async () => {
    mockPrisma.riskRegister.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/heat-map');
    expect(res.body.data).toHaveProperty('risks');
    expect(res.body.data).toHaveProperty('total');
  });
});
