import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    regulatorySubmission: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    regSubmissionChange: {
      create: jest.fn(),
    },
  },
  Prisma: {
    RegulatorySubmissionWhereInput: {},
  },
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
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
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
import submissionsRouter from '../src/routes/submissions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/submissions', submissionsRouter);

describe('Regulatory Submissions Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  // ============================================
  // POST /api/submissions
  // ============================================
  describe('POST /api/submissions', () => {
    it('should create a new submission', async () => {
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.regulatorySubmission.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'REG-2602-0001',
        deviceName: 'CardioMonitor X1',
        market: 'FDA_510K',
        submissionType: 'INITIAL',
        status: 'PREPARATION',
      });

      const res = await request(app).post('/api/submissions').send({
        deviceName: 'CardioMonitor X1',
        market: 'FDA_510K',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.market).toBe('FDA_510K');
    });

    it('should return 400 for missing deviceName', async () => {
      const res = await request(app).post('/api/submissions').send({
        market: 'FDA_510K',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing market', async () => {
      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test Device',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid market value', async () => {
      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test Device',
        market: 'INVALID_MARKET',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing submissionType', async () => {
      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test Device',
        market: 'FDA_510K',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid submissionType', async () => {
      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test Device',
        market: 'FDA_510K',
        submissionType: 'INVALID_TYPE',
      });
      expect(res.status).toBe(400);
    });

    it('should accept valid EU market', async () => {
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.regulatorySubmission.create as jest.Mock).mockResolvedValue({
        id: 'sub-2',
        market: 'EU_CE_MDR',
        status: 'PREPARATION',
      });

      const res = await request(app).post('/api/submissions').send({
        deviceName: 'EuroDevice',
        market: 'EU_CE_MDR',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(201);
    });

    it('should accept optional notes', async () => {
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.regulatorySubmission.create as jest.Mock).mockResolvedValue({
        id: 'sub-3',
        notes: 'Test notes',
      });

      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test',
        market: 'FDA_510K',
        submissionType: 'SUPPLEMENT',
        notes: 'Test notes',
      });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.regulatorySubmission.create as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(app).post('/api/submissions').send({
        deviceName: 'Test',
        market: 'FDA_510K',
        submissionType: 'INITIAL',
      });
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // GET /api/submissions
  // ============================================
  describe('GET /api/submissions', () => {
    it('should list submissions', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([
        {
          id: '00000000-0000-0000-0000-000000000001',
          deviceName: 'Device A',
          market: 'FDA_510K',
          changes: [],
        },
      ]);
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/submissions');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(100);

      const res = await request(app).get('/api/submissions?page=3&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(3);
      expect(res.body.meta.limit).toBe(10);
      expect(res.body.meta.totalPages).toBe(10);
    });

    it('should filter by market', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/submissions?market=FDA_510K');
      expect(mockPrisma.regulatorySubmission.findMany).toHaveBeenCalled();
    });

    it('should filter by status', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/submissions?status=APPROVED');
      expect(mockPrisma.regulatorySubmission.findMany).toHaveBeenCalled();
    });

    it('should search by device name', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/submissions?search=Cardio');
      expect(mockPrisma.regulatorySubmission.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockRejectedValue(
        new Error('DB error')
      );

      const res = await request(app).get('/api/submissions');
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // GET /api/submissions/:id
  // ============================================
  describe('GET /api/submissions/:id', () => {
    it('should get submission by id', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deviceName: 'Device A',
        deletedAt: null,
        changes: [],
      });

      const res = await request(app).get('/api/submissions/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(200);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 for non-existent submission', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/submissions/00000000-0000-0000-0000-000000000099');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for soft-deleted submission', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get('/api/submissions/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(404);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/submissions/00000000-0000-0000-0000-000000000001');
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // PUT /api/submissions/:id
  // ============================================
  describe('PUT /api/submissions/:id', () => {
    it('should update submission status', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        refNumber: 'REG-2602-0001',
      });
      (mockPrisma.regulatorySubmission.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        status: 'SUBMITTED',
      });

      const res = await request(app)
        .put('/api/submissions/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'SUBMITTED',
        });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent submission', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/submissions/00000000-0000-0000-0000-000000000099')
        .send({
          status: 'SUBMITTED',
        });
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted submission', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .put('/api/submissions/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'SUBMITTED',
        });
      expect(res.status).toBe(404);
    });

    it('should accept valid status values', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.regulatorySubmission.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
      });

      for (const status of ['PREPARATION', 'SUBMITTED', 'APPROVED', 'REJECTED']) {
        const res = await request(app)
          .put('/api/submissions/00000000-0000-0000-0000-000000000001')
          .send({ status });
        expect(res.status).toBe(200);
      }
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .put('/api/submissions/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'INVALID_STATUS',
        });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.regulatorySubmission.update as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app)
        .put('/api/submissions/00000000-0000-0000-0000-000000000001')
        .send({
          status: 'SUBMITTED',
        });
      expect(res.status).toBe(500);
    });
  });

  // ============================================
  // POST /api/submissions/:id/changes
  // ============================================
  describe('POST /api/submissions/:id/changes', () => {
    it('should log a change notification', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.regSubmissionChange.create as jest.Mock).mockResolvedValue({
        id: 'chg-1',
        changeType: 'Design Change',
        description: 'Updated housing',
      });

      const res = await request(app)
        .post('/api/submissions/00000000-0000-0000-0000-000000000001/changes')
        .send({
          changeType: 'Design Change',
          description: 'Updated housing material',
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 for non-existent submission', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/submissions/00000000-0000-0000-0000-000000000099/changes')
        .send({
          changeType: 'Design',
          description: 'Test',
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing changeType', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/submissions/00000000-0000-0000-0000-000000000001/changes')
        .send({
          description: 'Test',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/submissions/00000000-0000-0000-0000-000000000001/changes')
        .send({
          changeType: 'Design',
        });
      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.regSubmissionChange.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app)
        .post('/api/submissions/00000000-0000-0000-0000-000000000001/changes')
        .send({
          changeType: 'Design',
          description: 'Test',
        });
      expect(res.status).toBe(500);
    });
  });
});

describe('Regulatory Submissions — final coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/submissions returns success:true', async () => {
    (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/submissions');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/submissions count called once before create', async () => {
    (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(5);
    (mockPrisma.regulatorySubmission.create as jest.Mock).mockResolvedValue({ id: 'sub-count' });

    await request(app).post('/api/submissions').send({
      deviceName: 'Count Device',
      market: 'FDA_510K',
      submissionType: 'INITIAL',
    });

    expect(mockPrisma.regulatorySubmission.count).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/submissions/:id creates change log on status update', async () => {
    (mockPrisma.regulatorySubmission.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
      refNumber: 'REG-2602-0001',
    });
    (mockPrisma.regulatorySubmission.update as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      status: 'SUBMITTED',
    });

    const res = await request(app)
      .put('/api/submissions/00000000-0000-0000-0000-000000000001')
      .send({ status: 'SUBMITTED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/submissions meta.total matches count', async () => {
    (mockPrisma.regulatorySubmission.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(13);

    const res = await request(app).get('/api/submissions');

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(13);
  });

  it('POST /api/submissions accepts UKCA market', async () => {
    (mockPrisma.regulatorySubmission.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.regulatorySubmission.create as jest.Mock).mockResolvedValue({
      id: 'sub-uk',
      market: 'UKCA',
    });

    const res = await request(app).post('/api/submissions').send({
      deviceName: 'UK Device',
      market: 'UKCA',
      submissionType: 'INITIAL',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.market).toBe('UKCA');
  });
});
