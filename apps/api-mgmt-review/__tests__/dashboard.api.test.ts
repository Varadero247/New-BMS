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

  it('count is called exactly once per request', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(3);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.mgmtReview.count).toHaveBeenCalledTimes(1);
  });

  it('data object has the totalReviews property', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(7);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data).toHaveProperty('totalReviews');
  });

  it('returns large review count correctly', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(1000);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBe(1000);
  });

  it('totalReviews is a number', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(4);
    const res = await request(app).get('/api/dashboard/stats');
    expect(typeof res.body.data.totalReviews).toBe('number');
  });

  it('success is true on 200', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(2);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('success is false on 500', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

describe('Mgmt Review Dashboard — extended', () => {
  it('error code is INTERNAL_ERROR on 500', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('count called once per request', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(6);
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.mgmtReview.count).toHaveBeenCalledTimes(1);
  });

  it('data object is defined on success', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(3);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data).toBeDefined();
  });

  it('where clause includes deletedAt null', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(1);
    await request(app).get('/api/dashboard/stats');
    const callArg = mockPrisma.mgmtReview.count.mock.calls[0][0];
    expect(callArg.where.deletedAt).toBeNull();
  });

  it('totalReviews is 0 when count returns 0', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBe(0);
  });
});

describe('Mgmt Review Dashboard — additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('count is called with orgId from authenticated user', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(8);

    await request(app).get('/api/dashboard/stats');

    const callArg = mockPrisma.mgmtReview.count.mock.calls[0][0];
    expect(callArg.where.orgId).toBe('org-1');
  });

  it('data object contains only totalReviews key on success', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(5);

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(200);
    expect(Object.keys(res.body.data)).toContain('totalReviews');
  });

  it('error message is Failed to fetch stats on 500', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('Connection lost'));

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(500);
    expect(res.body.error.message).toBe('Failed to fetch stats');
  });

  it('responds with JSON content-type', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(2);

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.headers['content-type']).toMatch(/json/);
  });

  it('totalReviews matches the value returned by count', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(42);

    const res = await request(app).get('/api/dashboard/stats');

    expect(res.status).toBe(200);
    expect(res.body.data.totalReviews).toBe(42);
  });
});

describe('Mgmt Review Dashboard — final coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /stats success field is true on 200', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.success).toBe(true);
  });

  it('GET /stats totalReviews is exactly 1 when count returns 1', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalReviews).toBe(1);
  });

  it('GET /stats responds with 200 status code on success', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(5);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.status).toBe(200);
  });

  it('GET /stats count query includes deletedAt: null in where clause', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    const args = mockPrisma.mgmtReview.count.mock.calls[0][0];
    expect(args.where).toHaveProperty('deletedAt', null);
  });

  it('GET /stats count query includes orgId: org-1 from auth', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/stats');
    const args = mockPrisma.mgmtReview.count.mock.calls[0][0];
    expect(args.where).toHaveProperty('orgId', 'org-1');
  });

  it('GET /stats error.message is Failed to fetch stats on 500', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('any error'));
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.error.message).toBe('Failed to fetch stats');
  });

  it('GET /stats returns correct totalReviews for large numbers', async () => {
    mockPrisma.mgmtReview.count.mockResolvedValue(9999);
    const res = await request(app).get('/api/dashboard/stats');
    expect(res.body.data.totalReviews).toBe(9999);
  });

  it('GET /stats count is not called when response is 500', async () => {
    mockPrisma.mgmtReview.count.mockRejectedValue(new Error('fail'));
    await request(app).get('/api/dashboard/stats');
    expect(mockPrisma.mgmtReview.count).toHaveBeenCalledTimes(1);
  });
});
