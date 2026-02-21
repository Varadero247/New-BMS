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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/dashboard', router);
beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard/stats', () => {
  it('should return audit dashboard stats', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(10);
    mockPrisma.audFinding.count.mockResolvedValue(25);
    mockPrisma.audChecklist.count.mockResolvedValue(8);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAudits).toBe(10);
    expect(res.body.data.totalFindings).toBe(25);
    expect(res.body.data.totalChecklists).toBe(8);
  });

  it('should return zeros when no records exist', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalAudits).toBe(0);
    expect(res.body.data.totalFindings).toBe(0);
    expect(res.body.data.totalChecklists).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.audAudit.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response has all three expected data keys', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(1);
    mockPrisma.audFinding.count.mockResolvedValue(1);
    mockPrisma.audChecklist.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalAudits');
    expect(res.body.data).toHaveProperty('totalFindings');
    expect(res.body.data).toHaveProperty('totalChecklists');
  });

  it('all three count queries run once per request', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(5);
    mockPrisma.audFinding.count.mockResolvedValue(12);
    mockPrisma.audChecklist.count.mockResolvedValue(3);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.audAudit.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.audFinding.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.audChecklist.count).toHaveBeenCalledTimes(1);
  });

  it('returns independent counts for each model', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(7);
    mockPrisma.audFinding.count.mockResolvedValue(42);
    mockPrisma.audChecklist.count.mockResolvedValue(15);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalAudits).toBe(7);
    expect(res.body.data.totalFindings).toBe(42);
    expect(res.body.data.totalChecklists).toBe(15);
  });

  it('totalAudits is a number', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(3);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalAudits).toBe('number');
  });

  it('totalFindings reflects mock count', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    mockPrisma.audFinding.count.mockResolvedValue(99);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalFindings).toBe(99);
  });

  it('success flag is false on 500', async () => {
    mockPrisma.audAudit.count.mockRejectedValue(new Error('fail'));
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Audits Dashboard — extended', () => {
  it('works with large count values', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(1000);
    mockPrisma.audFinding.count.mockResolvedValue(5000);
    mockPrisma.audChecklist.count.mockResolvedValue(250);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalAudits).toBe(1000);
    expect(res.body.data.totalFindings).toBe(5000);
  });

  it('totalChecklists is a number', async () => {
    mockPrisma.audAudit.count.mockResolvedValue(0);
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(8);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.totalChecklists).toBe('number');
  });

  it('success is false on 500 response', async () => {
    mockPrisma.audAudit.count.mockRejectedValue(new Error('fail'));
    mockPrisma.audFinding.count.mockResolvedValue(0);
    mockPrisma.audChecklist.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
