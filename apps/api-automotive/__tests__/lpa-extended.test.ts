import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    lpaSchedule: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), count: jest.fn() },
    lpaQuestion: { create: jest.fn() },
    lpaAudit: { findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn(), count: jest.fn() },
    lpaResponse: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    $transaction: jest.fn(),
  },
  Prisma: { LpaScheduleWhereInput: {}, LpaAuditWhereInput: {} },
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
}));

import { prisma } from '../src/prisma';
import lpaRouter from '../src/routes/lpa';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/lpa', lpaRouter);

describe('LPA Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/lpa/schedules', () => {
    const validBody = {
      processArea: 'Assembly Line 1',
      layer: 1,
      frequency: 'DAILY',
      questions: [{ questionText: 'Are all tools calibrated?' }],
    };

    it('should create an LPA schedule', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          lpaSchedule: {
            create: jest.fn().mockResolvedValue({ id: 'sch-1', ...validBody }),
            findUnique: jest.fn().mockResolvedValue({ id: 'sch-1', questions: [{ questionText: 'Are all tools calibrated?', sortOrder: 1 }] }),
          },
          lpaQuestion: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app).post('/api/lpa/schedules').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing processArea', async () => {
      const { processArea, ...noArea } = validBody;
      const res = await request(app).post('/api/lpa/schedules').send(noArea);
      expect(res.status).toBe(400);
    });

    it('should return 400 for layer 0', async () => {
      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, layer: 0 });
      expect(res.status).toBe(400);
    });

    it('should return 400 for layer 5', async () => {
      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, layer: 5 });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid frequency', async () => {
      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, frequency: 'INVALID' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty questions array', async () => {
      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, questions: [] });
      expect(res.status).toBe(400);
    });

    it('should accept WEEKLY frequency', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          lpaSchedule: {
            create: jest.fn().mockResolvedValue({ id: 'sch-2' }),
            findUnique: jest.fn().mockResolvedValue({ id: 'sch-2', questions: [] }),
          },
          lpaQuestion: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, frequency: 'WEEKLY' });
      expect(res.status).toBe(201);
    });

    it('should accept MONTHLY frequency', async () => {
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          lpaSchedule: {
            create: jest.fn().mockResolvedValue({ id: 'sch-3' }),
            findUnique: jest.fn().mockResolvedValue({ id: 'sch-3', questions: [] }),
          },
          lpaQuestion: { create: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app).post('/api/lpa/schedules').send({ ...validBody, frequency: 'MONTHLY' });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.$transaction as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/lpa/schedules').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/lpa/schedules', () => {
    it('should list LPA schedules', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([{ id: 'sch-1' }]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/lpa/schedules');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaSchedule.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/lpa/schedules?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.lpaSchedule.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.lpaSchedule.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/lpa/schedules');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/lpa/audits', () => {
    it('should create an LPA audit', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue({
        id: 'sch-1', active: true, layer: 1, processArea: 'Assembly',
        questions: [{ id: 'q1', questionText: 'Test?' }],
      });
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.lpaAudit.create as jest.Mock).mockResolvedValue({ id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS' });

      const res = await request(app).post('/api/lpa/audits').send({
        scheduleId: 'sch-1', auditor: 'John Smith',
      });
      expect(res.status).toBe(201);
    });

    it('should return 404 if schedule not found', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/lpa/audits').send({
        scheduleId: 'fake', auditor: 'John',
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 if schedule is inactive', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue({
        id: 'sch-1', active: false, questions: [{ id: 'q1' }],
      });

      const res = await request(app).post('/api/lpa/audits').send({
        scheduleId: 'sch-1', auditor: 'John',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 if schedule has no questions', async () => {
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue({
        id: 'sch-1', active: true, questions: [],
      });

      const res = await request(app).post('/api/lpa/audits').send({
        scheduleId: 'sch-1', auditor: 'John',
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing auditor', async () => {
      const res = await request(app).post('/api/lpa/audits').send({ scheduleId: 'sch-1' });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/lpa/audits', () => {
    it('should list LPA audits', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockResolvedValue([{ id: '00000000-0000-0000-0000-000000000001' }]);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/lpa/audits');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.lpaAudit.count as jest.Mock).mockResolvedValue(40);

      const res = await request(app).get('/api/lpa/audits?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.lpaAudit.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.lpaAudit.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/lpa/audits');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/lpa/audits/:id/respond', () => {
    it('should submit question responses', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS', scheduleId: 'sch-1',
      });
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue({
        id: 'sch-1', questions: [{ id: 'q1', questionText: 'Test?' }],
      });
      (mockPrisma.lpaResponse.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => {
        return cb({
          lpaResponse: {
            create: jest.fn().mockResolvedValue({ id: 'resp-1', result: 'PASS' }),
            findMany: jest.fn().mockResolvedValue([{ result: 'PASS' }]),
          },
          lpaAudit: { update: jest.fn().mockResolvedValue({}) },
        });
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/respond').send({
        responses: [{ questionId: 'q1', result: 'PASS', notes: 'All good' }],
      });
      expect(res.status).toBe(201);
    });

    it('should return 404 if audit not found', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000099/respond').send({
        responses: [{ questionId: 'q1', result: 'PASS' }],
      });
      expect(res.status).toBe(404);
    });

    it('should return 400 if audit not in progress', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED',
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/respond').send({
        responses: [{ questionId: 'q1', result: 'PASS' }],
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for empty responses array', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS',
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/respond').send({
        responses: [],
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid result value', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS',
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/respond').send({
        responses: [{ questionId: 'q1', result: 'INVALID' }],
      });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid questionId', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS', scheduleId: 'sch-1',
      });
      (mockPrisma.lpaSchedule.findUnique as jest.Mock).mockResolvedValue({
        id: 'sch-1', questions: [{ id: 'q1' }],
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/respond').send({
        responses: [{ questionId: 'wrong-id', result: 'PASS' }],
      });
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/lpa/audits/:id/complete', () => {
    it('should complete an LPA audit with score', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'IN_PROGRESS', totalQuestions: 5,
        responses: [
          { result: 'PASS' }, { result: 'PASS' }, { result: 'PASS' },
          { result: 'FAIL' }, { result: 'NOT_APPLICABLE' },
        ],
      });
      (mockPrisma.lpaAudit.update as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED', score: 75,
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/complete').send({});
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 if audit not found', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000099/complete').send({});
      expect(res.status).toBe(404);
    });

    it('should return 400 if audit not in progress', async () => {
      (mockPrisma.lpaAudit.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001', status: 'COMPLETED', responses: [],
      });

      const res = await request(app).post('/api/lpa/audits/00000000-0000-0000-0000-000000000001/complete').send({});
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/lpa/dashboard', () => {
    it('should return dashboard stats', async () => {
      (mockPrisma.lpaAudit.count as jest.Mock)
        .mockResolvedValueOnce(100)   // totalAudits
        .mockResolvedValueOnce(80);   // completedAudits
      (mockPrisma.lpaAudit.findMany as jest.Mock)
        .mockResolvedValueOnce([{ layer: 1, score: 95 }, { layer: 2, score: 88 }])  // completedByLayer
        .mockResolvedValueOnce([{ processArea: 'Assembly', passCount: 8, failCount: 2, naCount: 0, totalQuestions: 10 }]);  // completedByArea

      const res = await request(app).get('/api/lpa/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalAudits).toBe(100);
      expect(res.body.data.completedAudits).toBe(80);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.lpaAudit.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/lpa/dashboard');
      expect(res.status).toBe(500);
    });
  });
});
