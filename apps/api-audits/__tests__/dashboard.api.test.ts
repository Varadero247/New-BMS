import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    audAudit: { count: jest.fn() },
    audFinding: { count: jest.fn() },
    audChecklist: { count: jest.fn() },
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
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return audit dashboard stats', async () => {
    (prisma as any).audAudit.count.mockResolvedValue(10);
    (prisma as any).audFinding.count.mockResolvedValue(25);
    (prisma as any).audChecklist.count.mockResolvedValue(8);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAudits).toBe(10);
    expect(res.body.data.totalFindings).toBe(25);
    expect(res.body.data.totalChecklists).toBe(8);
  });

  it('should return zeros when no records exist', async () => {
    (prisma as any).audAudit.count.mockResolvedValue(0);
    (prisma as any).audFinding.count.mockResolvedValue(0);
    (prisma as any).audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAudits).toBe(0);
    expect(res.body.data.totalFindings).toBe(0);
    expect(res.body.data.totalChecklists).toBe(0);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).audAudit.count.mockRejectedValue(new Error('DB error'));
    (prisma as any).audFinding.count.mockResolvedValue(0);
    (prisma as any).audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
