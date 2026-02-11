import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectStatusReport: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '../src/prisma';
import reportsRouter from '../src/routes/reports';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const mockReport = {
  id: 'rpt-001',
  projectId: 'proj-001',
  reportPeriod: 'Week 10 - March 2025',
  reportType: 'WEEKLY',
  reportDate: '2025-03-10T00:00:00.000Z',
  executiveSummary: 'Project is on track with minor delays in testing phase.',
  progressSummary: 'Completed 4 out of 6 planned user stories.',
  milestonesAchieved: 'API development complete',
  upcomingMilestones: 'Frontend integration',
  overallStatus: 'GREEN',
  scheduleStatus: 'AMBER',
  budgetStatus: 'GREEN',
  scopeStatus: 'GREEN',
  qualityStatus: 'GREEN',
  riskStatus: 'AMBER',
  keyIssues: 'Test environment intermittent failures',
  keyRisks: 'Third-party API dependency',
  accomplishments: 'Delivered core authentication module',
  nextPeriodPlans: 'Begin frontend integration testing',
  progressPercentage: 65,
  budgetConsumed: 45000,
  scheduleVariance: -2,
  costVariance: 5000,
  createdBy: 'user-123',
  createdAt: '2025-03-10T09:00:00.000Z',
  updatedAt: '2025-03-10T09:00:00.000Z',
};

describe('Reports API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/reports', reportsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ---- GET / ----

  describe('GET /api/reports', () => {
    it('should list reports for a given projectId', async () => {
      (mockPrisma.projectStatusReport.findMany as jest.Mock).mockResolvedValue([mockReport]);
      (mockPrisma.projectStatusReport.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/reports').query({ projectId: 'proj-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].id).toBe('rpt-001');
      expect(res.body.meta).toBeDefined();
      expect(res.body.meta.total).toBe(1);
      expect(mockPrisma.projectStatusReport.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { projectId: 'proj-001' },
          orderBy: { reportDate: 'desc' },
        }),
      );
    });

    it('should return 400 when projectId is missing', async () => {
      const res = await request(app).get('/api/reports');

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.message).toContain('projectId');
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectStatusReport.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));
      (mockPrisma.projectStatusReport.count as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/reports').query({ projectId: 'proj-001' });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- GET /:id ----

  describe('GET /api/reports/:id', () => {
    it('should return a single report by id', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockResolvedValue(mockReport);

      const res = await request(app).get('/api/reports/rpt-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rpt-001');
      expect(res.body.data.overallStatus).toBe('GREEN');
      expect(res.body.data.executiveSummary).toBeDefined();
      expect(mockPrisma.projectStatusReport.findUnique).toHaveBeenCalledWith({
        where: { id: 'rpt-001' },
      });
    });

    it('should return 404 when report does not exist', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get('/api/reports/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/reports/rpt-001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- POST / ----

  describe('POST /api/reports', () => {
    it('should create a new status report', async () => {
      const createPayload = {
        projectId: 'proj-001',
        reportPeriod: 'Week 11 - March 2025',
        executiveSummary: 'Progressing well on frontend integration.',
        overallStatus: 'GREEN',
        scheduleStatus: 'GREEN',
        budgetStatus: 'GREEN',
        scopeStatus: 'AMBER',
        qualityStatus: 'GREEN',
        riskStatus: 'GREEN',
        progressPercentage: 72,
      };

      const createdReport = {
        id: 'rpt-002',
        ...createPayload,
        reportType: 'WEEKLY',
        reportDate: '2025-03-17T09:00:00.000Z',
        createdBy: 'user-123',
        createdAt: '2025-03-17T09:00:00.000Z',
        updatedAt: '2025-03-17T09:00:00.000Z',
      };

      (mockPrisma.projectStatusReport.create as jest.Mock).mockResolvedValue(createdReport);

      const res = await request(app).post('/api/reports').send(createPayload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rpt-002');
      expect(res.body.data.reportType).toBe('WEEKLY');
      expect(res.body.data.createdBy).toBe('user-123');
      expect(mockPrisma.projectStatusReport.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'proj-001',
          reportPeriod: 'Week 11 - March 2025',
          reportType: 'WEEKLY',
          reportDate: expect.any(Date),
          overallStatus: 'GREEN',
          scheduleStatus: 'GREEN',
          budgetStatus: 'GREEN',
          scopeStatus: 'AMBER',
          qualityStatus: 'GREEN',
          riskStatus: 'GREEN',
          createdBy: 'user-123',
        }),
      });
    });

    it('should return 400 when RAG statuses are missing', async () => {
      const res = await request(app).post('/api/reports').send({
        projectId: 'proj-001',
        reportPeriod: 'Week 11',
        executiveSummary: 'Summary here',
        overallStatus: 'GREEN',
        // missing scheduleStatus, budgetStatus, scopeStatus, qualityStatus, riskStatus
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
      expect(res.body.error.details).toBeDefined();
    });

    it('should return 400 for invalid RAG status values', async () => {
      const res = await request(app).post('/api/reports').send({
        projectId: 'proj-001',
        reportPeriod: 'Week 11',
        executiveSummary: 'Summary here',
        overallStatus: 'INVALID',
        scheduleStatus: 'GREEN',
        budgetStatus: 'GREEN',
        scopeStatus: 'GREEN',
        qualityStatus: 'GREEN',
        riskStatus: 'GREEN',
      });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectStatusReport.create as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/reports').send({
        projectId: 'proj-001',
        reportPeriod: 'Week 11',
        executiveSummary: 'Summary here',
        overallStatus: 'GREEN',
        scheduleStatus: 'GREEN',
        budgetStatus: 'GREEN',
        scopeStatus: 'GREEN',
        qualityStatus: 'GREEN',
        riskStatus: 'GREEN',
      });

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ---- DELETE /:id ----

  describe('DELETE /api/reports/:id', () => {
    it('should delete an existing report', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (mockPrisma.projectStatusReport.delete as jest.Mock).mockResolvedValue(mockReport);

      const res = await request(app).delete('/api/reports/rpt-001');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.message).toBe('Report deleted successfully');
      expect(mockPrisma.projectStatusReport.delete).toHaveBeenCalledWith({ where: { id: 'rpt-001' } });
    });

    it('should return 404 when report does not exist', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).delete('/api/reports/nonexistent');

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('NOT_FOUND');
      expect(mockPrisma.projectStatusReport.delete).not.toHaveBeenCalled();
    });

    it('should return 500 on internal error', async () => {
      (mockPrisma.projectStatusReport.findUnique as jest.Mock).mockResolvedValue(mockReport);
      (mockPrisma.projectStatusReport.delete as jest.Mock).mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete('/api/reports/rpt-001');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
