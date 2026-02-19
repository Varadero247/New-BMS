import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    mgmtReview: {
      count: jest.fn(),
    },
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
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
  it('should return total review count', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(10);

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('totalReviews', 10);
    expect(mockPrisma.mgmtReview.count).toHaveBeenCalledWith({
      where: { orgId: 'org-1', deletedAt: null },
    });
  });

  it('should return 0 when there are no reviews', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalReviews).toBe(0);
  });

  it('should return 500 when count throws an error', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('Database error'));

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.error.message).toBe('Failed to fetch stats');
  });

  it('should use the orgId from the authenticated user', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(5);

    await request(app).get('/api/dashboard/stats');

    const countCall = mockPrisma.mgmtReview.count.mock.calls[0][0];
    expect(countCall.where.orgId).toBe('org-1');
    expect(countCall.where.deletedAt).toBeNull();
  });
});
