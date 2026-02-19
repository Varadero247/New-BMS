import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ptwPermit: { count: jest.fn() },
    ptwMethodStatement: { count: jest.fn() },
    ptwToolboxTalk: { count: jest.fn() },
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
  it('should return dashboard stats with counts', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(10);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(5);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPermits).toBe(10);
    expect(res.body.data.totalMethodStatements).toBe(5);
    expect(res.body.data.totalToolboxTalks).toBe(3);
  });

  it('should return zeros when no records exist', async () => {
    mockPrisma.ptwPermit.count.mockResolvedValue(0);
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPermits).toBe(0);
    expect(res.body.data.totalMethodStatements).toBe(0);
    expect(res.body.data.totalToolboxTalks).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.ptwPermit.count.mockRejectedValue(new Error('DB failure'));
    mockPrisma.ptwMethodStatement.count.mockResolvedValue(0);
    mockPrisma.ptwToolboxTalk.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should return 404 for unknown dashboard routes', async () => {
    const res = await request(app).get('/api/dashboard/00000000-0000-0000-0000-000000000099');
    expect(res.status).toBe(404);
  });
});
