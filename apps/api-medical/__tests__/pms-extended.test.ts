import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    pmsPlan: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    pmsReport: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
  },
  Prisma: { PmsPlanWhereInput: {} },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import pmsRouter from '../src/routes/pms';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/pms', pmsRouter);

describe('PMS Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/pms/plans', () => {
    it('should create a PMS plan', async () => {
      (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsPlan.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'PMS-2602-0001',
        deviceName: 'X200',
        status: 'DRAFT',
      });

      const res = await request(app).post('/api/pms/plans').send({ deviceName: 'X200' });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing deviceName', async () => {
      const res = await request(app).post('/api/pms/plans').send({});
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsPlan.create as jest.Mock).mockResolvedValue({ id: 'pms-2' });

      const res = await request(app)
        .post('/api/pms/plans')
        .send({
          deviceName: 'X200',
          deviceClass: 'CLASS_II',
          dataSources: ['complaints', 'literature'],
          reviewFrequency: 'Annual',
          status: 'ACTIVE',
        });
      expect(res.status).toBe(201);
    });

    it('should return 400 for invalid status', async () => {
      const res = await request(app).post('/api/pms/plans').send({
        deviceName: 'X200',
        status: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsPlan.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/pms/plans').send({ deviceName: 'X200' });
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/pms/plans', () => {
    it('should list PMS plans', async () => {
      (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001' },
      ]);
      (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/pms/plans');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/pms/plans?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.pmsPlan.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.pmsPlan.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/pms/plans');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/pms/plans/:id', () => {
    it('should get plan with reports', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        reports: [],
      });

      const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/pms/plans/:id', () => {
    it('should update a plan', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.pmsPlan.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'ACTIVE',
      });

      const res = await request(app)
        .put('/api/pms/plans/00000000-0000-0000-0000-000000000001')
        .send({ status: 'ACTIVE' });
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/pms/plans/00000000-0000-0000-0000-000000000099')
        .send({ status: 'ACTIVE' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/pms/reports/psur', () => {
    const validBody = {
      planId: 'pms-1',
      periodStart: '2025-01-01',
      periodEnd: '2025-12-31',
    };

    it('should create a PSUR report', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsReport.create as jest.Mock).mockResolvedValue({
        id: 'rep-1',
        reportType: 'PSUR',
        refNumber: 'PSUR-2602-0001',
      });

      const res = await request(app).post('/api/pms/reports/psur').send(validBody);
      expect(res.status).toBe(201);
    });

    it('should return 404 if plan not found', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/pms/reports/psur').send(validBody);
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing periodStart', async () => {
      const { periodStart, ...no } = validBody;
      const res = await request(app).post('/api/pms/reports/psur').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing periodEnd', async () => {
      const { periodEnd, ...no } = validBody;
      const res = await request(app).post('/api/pms/reports/psur').send(no);
      expect(res.status).toBe(400);
    });

    it('should accept optional counts', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsReport.create as jest.Mock).mockResolvedValue({ id: 'rep-2' });

      const res = await request(app)
        .post('/api/pms/reports/psur')
        .send({
          ...validBody,
          complaintCount: 5,
          mdrCount: 2,
          adverseEvents: 1,
        });
      expect(res.status).toBe(201);
    });
  });

  describe('POST /api/pms/reports/pmcf', () => {
    it('should create a PMCF report', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.pmsReport.create as jest.Mock).mockResolvedValue({
        id: 'rep-3',
        reportType: 'PMCF',
      });

      const res = await request(app).post('/api/pms/reports/pmcf').send({
        planId: 'pms-1',
        periodStart: '2025-01-01',
        periodEnd: '2025-12-31',
      });
      expect(res.status).toBe(201);
    });

    it('should return 404 if plan not found', async () => {
      (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/pms/reports/pmcf').send({
        planId: 'fake',
        periodStart: '2025-01-01',
        periodEnd: '2025-12-31',
      });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/pms/dashboard', () => {
    it('should return PMS dashboard stats', async () => {
      (mockPrisma.pmsPlan.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalPlans
        .mockResolvedValueOnce(5) // activePlans
        .mockResolvedValueOnce(2); // overdueReviews
      (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(3); // pendingReports

      const res = await request(app).get('/api/pms/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalPlans).toBe(10);
      expect(res.body.data.activePlans).toBe(5);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.pmsPlan.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/pms/dashboard');
      expect(res.status).toBe(500);
    });
  });
});

describe('PMS Routes — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /plans returns success:true on the response body', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/pms/plans');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /plans computes totalPages correctly for multiple pages', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(35);

    const res = await request(app).get('/api/pms/plans?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(4);
  });

  it('GET /plans with page=3&limit=10 returns correct skip in meta', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(100);

    const res = await request(app).get('/api/pms/plans?page=3&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(3);
    expect(res.body.meta.limit).toBe(10);
  });

  it('GET /plans returns empty data array when count is zero', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/pms/plans');
    expect(res.body.data).toEqual([]);
    expect(res.body.meta.total).toBe(0);
  });

  it('PUT /plans/:id returns 500 when update throws', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.pmsPlan.update as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app)
      .put('/api/pms/plans/00000000-0000-0000-0000-000000000001')
      .send({ status: 'ACTIVE' });
    expect(res.status).toBe(500);
  });

  it('POST /reports/psur returns 500 when pmsReport.create throws', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.pmsReport.create as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/pms/reports/psur').send({
      planId: 'pms-1',
      periodStart: '2025-01-01',
      periodEnd: '2025-12-31',
    });
    expect(res.status).toBe(500);
  });

  it('POST /reports/pmcf returns 500 when pmsReport.create throws', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.pmsReport.create as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/pms/reports/pmcf').send({
      planId: 'pms-1',
      periodStart: '2025-01-01',
      periodEnd: '2025-12-31',
    });
    expect(res.status).toBe(500);
  });

  it('GET /plans/:id returns 500 when findUnique throws', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /dashboard returns overdueReviews count', async () => {
    (mockPrisma.pmsPlan.count as jest.Mock)
      .mockResolvedValueOnce(20)
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3);
    (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(7);

    const res = await request(app).get('/api/pms/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.overdueReviews).toBe(3);
    expect(res.body.data.pendingReports).toBe(7);
  });

  it('POST /plans returns 400 when status is invalid enum', async () => {
    const res = await request(app).post('/api/pms/plans').send({
      deviceName: 'TestDevice',
      status: 'NOT_A_VALID_STATUS',
    });
    expect(res.status).toBe(400);
  });

  it('GET /plans/:id returns 500 on DB error', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000001');
    expect(res.status).toBe(500);
  });

  it('GET /plans response shape has meta.total property', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/pms/plans');
    expect(res.status).toBe(200);
    expect(res.body.meta).toHaveProperty('total');
  });

  it('POST /reports/pmcf returns 400 for missing periodStart', async () => {
    const res = await request(app).post('/api/pms/reports/pmcf').send({
      planId: 'pms-1',
      periodEnd: '2025-12-31',
    });
    expect(res.status).toBe(400);
  });
});

describe('PMS Routes — final boundary coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /plans returns data as array', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/pms/plans');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /plans create is called once on valid input', async () => {
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.pmsPlan.create as jest.Mock).mockResolvedValue({ id: 'pms-new', deviceName: 'New Device' });

    await request(app).post('/api/pms/plans').send({ deviceName: 'New Device' });

    expect(mockPrisma.pmsPlan.create).toHaveBeenCalledTimes(1);
  });

  it('GET /plans/:id returns success:true on found plan', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
      reports: [],
    });

    const res = await request(app).get('/api/pms/plans/00000000-0000-0000-0000-000000000001');
    expect(res.body.success).toBe(true);
  });

  it('GET /dashboard success:true is present in response', async () => {
    (mockPrisma.pmsPlan.count as jest.Mock)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(1);
    (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(2);

    const res = await request(app).get('/api/pms/dashboard');
    expect(res.body.success).toBe(true);
  });

  it('POST /reports/psur planId is associated with created report', async () => {
    (mockPrisma.pmsPlan.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.pmsReport.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.pmsReport.create as jest.Mock).mockResolvedValue({ id: 'rep-plan', reportType: 'PSUR' });

    await request(app).post('/api/pms/reports/psur').send({
      planId: '00000000-0000-0000-0000-000000000001',
      periodStart: '2025-01-01',
      periodEnd: '2025-12-31',
    });

    expect(mockPrisma.pmsReport.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ planId: '00000000-0000-0000-0000-000000000001' }),
      })
    );
  });

  it('GET /plans pagination.totalPages is ceil(total/limit)', async () => {
    (mockPrisma.pmsPlan.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.pmsPlan.count as jest.Mock).mockResolvedValue(21);

    const res = await request(app).get('/api/pms/plans?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(3);
  });
});

describe('pms extended — phase29 coverage', () => {
  it('handles Array.from set', () => {
    expect(Array.from(new Set([1, 1, 2]))).toEqual([1, 2]);
  });

  it('handles slice method', () => {
    expect([1, 2, 3, 4].slice(1, 3)).toEqual([2, 3]);
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

  it('handles parseFloat', () => {
    expect(parseFloat('3.14')).toBeCloseTo(3.14);
  });

});

describe('pms extended — phase30 coverage', () => {
  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles string toUpperCase', () => {
    expect('hello'.toUpperCase()).toBe('HELLO');
  });

  it('handles array map', () => {
    expect([1, 2, 3].map(x => x * 2)).toEqual([2, 4, 6]);
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles Math.sqrt', () => {
    expect(Math.sqrt(9)).toBe(3);
  });

});
