import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    docDocument: { count: jest.fn() },
    docVersion: { count: jest.fn() },
    docApproval: { count: jest.fn() },
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
  it('should return stats with counts', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(10);
    mockPrisma.docVersion.count.mockResolvedValue(25);
    mockPrisma.docApproval.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDocuments).toBe(10);
    expect(res.body.data.totalVersions).toBe(25);
    expect(res.body.data.pendingApprovals).toBe(3);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.docDocument.count.mockRejectedValue(new Error('DB error'));
    mockPrisma.docVersion.count.mockResolvedValue(0);
    mockPrisma.docApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('should return zero counts when no documents exist', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(0);
    mockPrisma.docVersion.count.mockResolvedValue(0);
    mockPrisma.docApproval.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDocuments).toBe(0);
  });

  it('response has all three expected data keys', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(1);
    mockPrisma.docVersion.count.mockResolvedValue(1);
    mockPrisma.docApproval.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalDocuments');
    expect(res.body.data).toHaveProperty('totalVersions');
    expect(res.body.data).toHaveProperty('pendingApprovals');
  });

  it('all three count queries run per request', async () => {
    mockPrisma.docDocument.count.mockResolvedValue(5);
    mockPrisma.docVersion.count.mockResolvedValue(12);
    mockPrisma.docApproval.count.mockResolvedValue(2);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.docDocument.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.docVersion.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.docApproval.count).toHaveBeenCalledTimes(1);
  });
});
