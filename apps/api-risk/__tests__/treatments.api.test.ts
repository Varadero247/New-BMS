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
});
