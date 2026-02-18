import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    lpaSchedule: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    lpaQuestion: {
      create: jest.fn(),
    },
    lpaAudit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    lpaResponse: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    LpaScheduleWhereInput: {},
    LpaAuditWhereInput: {},
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
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
import lpaRoutes from '../src/routes/lpa';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockQuestion1 = {
  id: 'q-001',
  scheduleId: 'sched-001',
  questionText: 'Is the operator following the work instruction?',
  category: 'Process Control',
  sortOrder: 1,
  active: true,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

const mockQuestion2 = {
  id: 'q-002',
  scheduleId: 'sched-001',
  questionText: 'Are the correct tools and gauges being used?',
  category: 'Tooling',
  sortOrder: 2,
  active: true,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

const mockQuestion3 = {
  id: 'q-003',
  scheduleId: 'sched-001',
  questionText: 'Is the area clean and organized (5S)?',
  category: 'Workplace',
  sortOrder: 3,
  active: true,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

const mockSchedule = {
  id: 'sched-001',
  processArea: 'Assembly Line 1',
  layer: 1,
  frequency: 'DAILY',
  active: true,
  createdBy: 'user-1',
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-15'),
};

const mockScheduleWithQuestions = {
  ...mockSchedule,
  questions: [mockQuestion1, mockQuestion2, mockQuestion3],
  _count: { audits: 5 },
};

const mockInactiveSchedule = {
  ...mockSchedule,
  id: 'sched-inactive',
  active: false,
  questions: [mockQuestion1],
};

const mockEmptySchedule = {
  ...mockSchedule,
  id: 'sched-empty',
  active: true,
  questions: [],
};

const mockAudit = {
  id: 'audit-001',
  refNumber: 'LPA-2602-0001',
  scheduleId: 'sched-001',
  auditor: 'John Smith',
  layer: 1,
  processArea: 'Assembly Line 1',
  status: 'IN_PROGRESS',
  totalQuestions: 3,
  passCount: 0,
  failCount: 0,
  naCount: 0,
  score: null,
  notes: null,
  completedAt: null,
  createdBy: 'user-1',
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const mockCompletedAudit = {
  ...mockAudit,
  id: 'audit-002',
  refNumber: 'LPA-2602-0002',
  status: 'COMPLETED',
  passCount: 2,
  failCount: 1,
  naCount: 0,
  score: 66.67,
  completedAt: new Date('2026-02-11'),
};

const mockResponse1 = {
  id: 'resp-001',
  auditId: 'audit-001',
  questionId: 'q-001',
  questionText: 'Is the operator following the work instruction?',
  result: 'PASS',
  notes: null,
  capaRef: null,
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const mockResponse2 = {
  id: 'resp-002',
  auditId: 'audit-001',
  questionId: 'q-002',
  questionText: 'Are the correct tools and gauges being used?',
  result: 'FAIL',
  notes: 'Wrong gauge found at station 3',
  capaRef: 'CAPA-LPA-2602-0001',
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const mockResponse3 = {
  id: 'resp-003',
  auditId: 'audit-001',
  questionId: 'q-003',
  questionText: 'Is the area clean and organized (5S)?',
  result: 'PASS',
  notes: null,
  capaRef: null,
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const validSchedulePayload = {
  processArea: 'Assembly Line 1',
  layer: 1,
  frequency: 'DAILY',
  questions: [
    {
      questionText: 'Is the operator following the work instruction?',
      category: 'Process Control',
    },
    { questionText: 'Are the correct tools and gauges being used?', category: 'Tooling' },
  ],
};

const validAuditPayload = {
  scheduleId: 'sched-001',
  auditor: 'John Smith',
};

const validRespondPayload = {
  responses: [
    { questionId: 'q-001', result: 'PASS' as const },
    { questionId: 'q-002', result: 'FAIL' as const, notes: 'Wrong gauge found at station 3' },
  ],
};

// ==========================================
// Tests
// ==========================================

describe('Automotive LPA API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/lpa', lpaRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST /schedules - Create LPA schedule
  // ==========================================
  describe('POST /api/lpa/schedules', () => {
    it('should create an LPA schedule with questions via transaction', async () => {
      const mockTx = {
        lpaSchedule: {
          create: jest.fn().mockResolvedValue({ id: 'sched-new', ...mockSchedule }),
          findUnique: jest.fn().mockResolvedValue(mockScheduleWithQuestions),
        },
        lpaQuestion: {
          create: jest.fn().mockResolvedValue({ id: 'q-new' }),
        },
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send(validSchedulePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockTx.lpaSchedule.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          processArea: 'Assembly Line 1',
          layer: 1,
          frequency: 'DAILY',
          createdBy: 'user-1',
        }),
      });
      expect(mockTx.lpaQuestion.create).toHaveBeenCalledTimes(2);
    });

    it('should return 400 when processArea is empty', async () => {
      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send({ ...validSchedulePayload, processArea: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when layer is out of range (>4)', async () => {
      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send({ ...validSchedulePayload, layer: 5 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when layer is less than 1', async () => {
      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send({ ...validSchedulePayload, layer: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when questions array is empty', async () => {
      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send({ ...validSchedulePayload, questions: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 with invalid frequency value', async () => {
      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send({ ...validSchedulePayload, frequency: 'ANNUALLY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('Transaction failed'));

      const response = await request(app)
        .post('/api/lpa/schedules')
        .set('Authorization', 'Bearer token')
        .send(validSchedulePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /schedules - List LPA schedules
  // ==========================================
  describe('GET /api/lpa/schedules', () => {
    it('should return paginated list of schedules', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([mockScheduleWithQuestions]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/lpa/schedules')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta).toEqual({
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
      });
    });

    it('should filter by layer', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/lpa/schedules?layer=2').set('Authorization', 'Bearer token');

      expect(mockPrisma.lpaSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ layer: 2 }),
        })
      );
    });

    it('should filter by frequency', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/lpa/schedules?frequency=WEEKLY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.lpaSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ frequency: 'WEEKLY' }),
        })
      );
    });

    it('should filter by active status', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/lpa/schedules?active=true').set('Authorization', 'Bearer token');

      expect(mockPrisma.lpaSchedule.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ active: true }),
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/lpa/schedules')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /audits - Create LPA audit
  // ==========================================
  describe('POST /api/lpa/audits', () => {
    it('should create an LPA audit from an active schedule', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(mockScheduleWithQuestions);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lpaAudit.create as jest.Mock).mockResolvedValue(mockAudit);

      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send(validAuditPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(mockPrisma.lpaAudit.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          scheduleId: 'sched-001',
          auditor: 'John Smith',
          layer: 1,
          processArea: 'Assembly Line 1',
          status: 'IN_PROGRESS',
          totalQuestions: 3,
        }),
      });
    });

    it('should return 404 when schedule does not exist', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send({ scheduleId: 'nonexistent', auditor: 'John Smith' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when schedule is inactive', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(mockInactiveSchedule);

      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send({ scheduleId: 'sched-inactive', auditor: 'John Smith' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('SCHEDULE_INACTIVE');
    });

    it('should return 400 when schedule has no active questions', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(mockEmptySchedule);

      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send({ scheduleId: 'sched-empty', auditor: 'John Smith' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NO_QUESTIONS');
    });

    it('should return 400 when scheduleId is missing', async () => {
      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send({ auditor: 'John Smith' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when auditor is missing', async () => {
      const response = await request(app)
        .post('/api/lpa/audits')
        .set('Authorization', 'Bearer token')
        .send({ scheduleId: 'sched-001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // GET /audits - List LPA audits
  // ==========================================
  describe('GET /api/lpa/audits', () => {
    it('should return paginated list of audits', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockResolvedValue([
        { ...mockAudit, responses: [] },
      ]);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(1);

      const response = await request(app)
        .get('/api/lpa/audits')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.total).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/lpa/audits?status=COMPLETED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.lpaAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'COMPLETED' }),
        })
      );
    });

    it('should filter by layer and processArea', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(0);

      await request(app)
        .get('/api/lpa/audits?layer=2&processArea=Welding')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.lpaAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            layer: 2,
            processArea: { contains: 'Welding', mode: 'insensitive' },
          }),
        })
      );
    });
  });

  // ==========================================
  // POST /audits/:id/respond - Submit responses
  // ==========================================
  describe('POST /api/lpa/audits/:id/respond', () => {
    it('should submit audit responses and update counts', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(mockAudit);
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(mockScheduleWithQuestions);
      (mockPrisma.lpaResponse.count as jest.Mock).mockResolvedValue(0);

      const mockTx = {
        lpaResponse: {
          create: jest
            .fn()
            .mockResolvedValueOnce(mockResponse1)
            .mockResolvedValueOnce(mockResponse2),
          findMany: jest.fn().mockResolvedValue([mockResponse1, mockResponse2]),
        },
        lpaAudit: {
          update: jest.fn().mockResolvedValue({ ...mockAudit, passCount: 1, failCount: 1 }),
        },
      };

      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/respond`)
        .set('Authorization', 'Bearer token')
        .send(validRespondPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/lpa/audits/00000000-0000-0000-0000-000000000099/respond')
        .set('Authorization', 'Bearer token')
        .send(validRespondPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when audit is not in progress', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(mockCompletedAudit);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockCompletedAudit.id}/respond`)
        .set('Authorization', 'Bearer token')
        .send(validRespondPayload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('AUDIT_NOT_IN_PROGRESS');
    });

    it('should return 400 when responses array is empty', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(mockAudit);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/respond`)
        .set('Authorization', 'Bearer token')
        .send({ responses: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when result value is invalid', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(mockAudit);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/respond`)
        .set('Authorization', 'Bearer token')
        .send({
          responses: [{ questionId: 'q-001', result: 'MAYBE' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when questionId does not belong to schedule', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(mockAudit);
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(mockScheduleWithQuestions);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/respond`)
        .set('Authorization', 'Bearer token')
        .send({
          responses: [{ questionId: 'invalid-question-id', result: 'PASS' }],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_QUESTION');
    });
  });

  // ==========================================
  // POST /audits/:id/complete - Complete audit
  // ==========================================
  describe('POST /api/lpa/audits/:id/complete', () => {
    it('should complete an audit and calculate the score', async () => {
      const auditWithResponses = {
        ...mockAudit,
        responses: [mockResponse1, mockResponse2, mockResponse3],
      };
      const updatedAudit = {
        ...mockAudit,
        status: 'COMPLETED',
        passCount: 2,
        failCount: 1,
        naCount: 0,
        score: 66.67,
        completedAt: new Date(),
        responses: [mockResponse1, mockResponse2, mockResponse3],
      };

      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(auditWithResponses);
      (mockPrisma.lpaAudit.update as jest.Mock).mockResolvedValue(updatedAudit);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/complete`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('COMPLETED');
      expect(response.body.data.score).toBe(66.67);
      expect(mockPrisma.lpaAudit.update).toHaveBeenCalledWith({
        where: { id: mockAudit.id },
        data: expect.objectContaining({
          status: 'COMPLETED',
          passCount: 2,
          failCount: 1,
          naCount: 0,
          score: 66.67,
        }),
        include: { responses: true },
      });
    });

    it('should complete an audit with optional notes', async () => {
      const auditWithResponses = {
        ...mockAudit,
        responses: [mockResponse1, mockResponse3],
      };
      const updatedAudit = {
        ...auditWithResponses,
        status: 'COMPLETED',
        passCount: 2,
        failCount: 0,
        naCount: 0,
        score: 66.67,
        notes: 'All items passed',
        completedAt: new Date(),
      };

      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(auditWithResponses);
      (mockPrisma.lpaAudit.update as jest.Mock).mockResolvedValue(updatedAudit);

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/complete`)
        .set('Authorization', 'Bearer token')
        .send({ notes: 'All items passed' });

      expect(response.status).toBe(200);
      expect(mockPrisma.lpaAudit.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            notes: 'All items passed',
          }),
        })
      );
    });

    it('should return 404 when audit not found', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(null);

      const response = await request(app)
        .post('/api/lpa/audits/00000000-0000-0000-0000-000000000099/complete')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when audit is already completed', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        ...mockCompletedAudit,
        responses: [mockResponse1],
      });

      const response = await request(app)
        .post(`/api/lpa/audits/${mockCompletedAudit.id}/complete`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('AUDIT_NOT_IN_PROGRESS');
    });

    it('should return 500 on database error', async () => {
      const auditWithResponses = { ...mockAudit, responses: [mockResponse1] };
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(auditWithResponses);
      (mockPrisma.lpaAudit.update as jest.Mock).mockRejectedValue(new Error('Update failed'));

      const response = await request(app)
        .post(`/api/lpa/audits/${mockAudit.id}/complete`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /dashboard - LPA performance dashboard
  // ==========================================
  describe('GET /api/lpa/dashboard', () => {
    it('should return dashboard with audit stats, scores by layer, and fail rates', async () => {
      // Total and completed counts
      (mockPrisma.lpaAudit.count as jest.Mock)
        .mockResolvedValueOnce(10) // totalAudits
        .mockResolvedValueOnce(8); // completedAudits

      // Completed by layer (for avgScoreByLayer)
      (mockPrisma.lpaAudit.findMany as jest.Mock)
        .mockResolvedValueOnce([
          { layer: 1, score: 90 },
          { layer: 1, score: 80 },
          { layer: 2, score: 70 },
        ])
        // Completed by area (for failRateByProcessArea)
        .mockResolvedValueOnce([
          {
            processArea: 'Assembly Line 1',
            passCount: 8,
            failCount: 2,
            naCount: 0,
            totalQuestions: 10,
          },
          { processArea: 'Paint Shop', passCount: 5, failCount: 5, naCount: 0, totalQuestions: 10 },
        ]);

      const response = await request(app)
        .get('/api/lpa/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalAudits).toBe(10);
      expect(response.body.data.completedAudits).toBe(8);
      expect(response.body.data.avgScoreByLayer).toBeDefined();
      expect(response.body.data.failRateByProcessArea).toBeDefined();
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.lpaAudit.count as jest.Mock).mockRejectedValue(new Error('DB timeout'));

      const response = await request(app)
        .get('/api/lpa/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
