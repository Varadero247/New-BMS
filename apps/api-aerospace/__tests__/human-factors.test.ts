import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    humanFactorIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    fatigueAssessment: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    HumanFactorIncidentWhereInput: {},
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
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import humanFactorsRouter from '../src/routes/human-factors';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockIncident = {
  id: 'hf-00000000-0000-4000-a000-000000000001',
  refNumber: 'HF-2602-0001',
  title: 'Distraction During Engine Change',
  description: 'Technician was distracted by phone call during critical torque step',
  category: 'DISTRACTION',
  severity: 'HIGH',
  location: 'Hangar 3, Bay 2',
  shift: 'Day',
  personnelInvolved: ['tech-1', 'tech-2'],
  rootCause: 'Personal mobile phone not secured in locker',
  correctiveAction: 'Mandatory phone locker policy implemented',
  capaRef: 'CAPA-2026-045',
  status: 'REPORTED',
  reportedBy: 'test@test.com',
  incidentDate: new Date('2026-02-10T08:30:00Z'),
  deletedAt: null,
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const mockIncident2 = {
  id: 'hf-00000000-0000-4000-a000-000000000002',
  refNumber: 'HF-2602-0002',
  title: 'Fatigue-Related Documentation Error',
  description: 'Logbook entry made incorrectly after 10-hour shift',
  category: 'FATIGUE',
  severity: 'MEDIUM',
  location: 'Line Maintenance',
  shift: 'Night',
  personnelInvolved: ['tech-3'],
  rootCause: 'Extended shift without adequate rest',
  correctiveAction: null,
  capaRef: null,
  status: 'REPORTED',
  reportedBy: 'test@test.com',
  incidentDate: new Date('2026-02-11T22:00:00Z'),
  deletedAt: null,
  createdAt: new Date('2026-02-11'),
  updatedAt: new Date('2026-02-11'),
};

const mockFatigueAssessment = {
  id: 'fa-00000000-0000-4000-a000-000000000001',
  personnelId: 'tech-1',
  personnelName: 'John Smith',
  assessmentDate: new Date('2026-02-12T06:00:00Z'),
  hoursWorked: 10,
  restHours: 8,
  fatigueScore: 6,
  riskLevel: 'MODERATE',
  mitigations: 'Assigned to non-critical tasks for remainder of shift',
  fitForDuty: true,
  notes: 'Reported feeling tired after double shift',
  createdBy: 'test@test.com',
  createdAt: new Date('2026-02-12'),
  updatedAt: new Date('2026-02-12'),
};

const validIncidentPayload = {
  title: 'Distraction During Engine Change',
  description: 'Technician was distracted by phone call during critical torque step',
  category: 'DISTRACTION',
  severity: 'HIGH',
  location: 'Hangar 3, Bay 2',
  shift: 'Day',
  personnelInvolved: ['tech-1', 'tech-2'],
  rootCause: 'Personal mobile phone not secured in locker',
  correctiveAction: 'Mandatory phone locker policy implemented',
  incidentDate: '2026-02-10T08:30:00Z',
};

const validFatiguePayload = {
  personnelId: 'tech-1',
  personnelName: 'John Smith',
  assessmentDate: '2026-02-12T06:00:00Z',
  hoursWorked: 10,
  restHours: 8,
  fatigueScore: 6,
  riskLevel: 'MODERATE',
  mitigations: 'Assigned to non-critical tasks for remainder of shift',
  fitForDuty: true,
  notes: 'Reported feeling tired after double shift',
};

// ==========================================
// Tests
// ==========================================

describe('Aerospace Human Factors API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/human-factors', humanFactorsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST /incidents — Report HF Incident
  // ==========================================
  describe('POST /api/human-factors/incidents', () => {
    it('should create a human factor incident successfully', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValueOnce({
        ...mockIncident,
        refNumber: 'HF-2602-0001',
      });

      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send(validIncidentPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.refNumber).toBe('HF-2602-0001');
      expect(response.body.data.category).toBe('DISTRACTION');
      expect(mockPrisma.humanFactorIncident.create).toHaveBeenCalledTimes(1);
    });

    it('should create an incident with minimal required fields', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValueOnce({
        ...mockIncident,
        refNumber: 'HF-2602-0002',
        severity: 'LOW',
        location: null,
        shift: null,
        personnelInvolved: [],
      });

      const minimalPayload = {
        title: 'Minor communication gap',
        description: 'Handover briefing was incomplete',
        category: 'LACK_OF_COMMUNICATION',
        incidentDate: '2026-02-11T14:00:00Z',
      };

      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send(minimalPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...validIncidentPayload, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...validIncidentPayload, description: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when category is invalid', async () => {
      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...validIncidentPayload, category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when incidentDate is not a valid ISO datetime', async () => {
      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...validIncidentPayload, incidentDate: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send(validIncidentPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /incidents — List HF Incidents
  // ==========================================
  describe('GET /api/human-factors/incidents', () => {
    it('should list incidents with pagination metadata', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([
        mockIncident,
        mockIncident2,
      ]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toBeDefined();
      expect(response.body.meta.total).toBe(2);
      expect(response.body.meta.page).toBe(1);
    });

    it('should filter by category query parameter', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([mockIncident]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/human-factors/incidents?category=DISTRACTION')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'DISTRACTION' }),
        })
      );
    });

    it('should filter by severity query parameter', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/human-factors/incidents?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ severity: 'CRITICAL' }),
        })
      );
    });

    it('should support search query parameter', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/human-factors/incidents?search=engine')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({ title: { contains: 'engine', mode: 'insensitive' } }),
            ]),
          }),
        })
      );
    });

    it('should support pagination with page and limit', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/human-factors/incidents?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
      expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /fatigue — Log Fatigue Assessment
  // ==========================================
  describe('POST /api/human-factors/fatigue', () => {
    it('should create a fatigue assessment successfully', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockResolvedValueOnce(
        mockFatigueAssessment
      );

      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send(validFatiguePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.personnelId).toBe('tech-1');
      expect(response.body.data.fatigueScore).toBe(6);
      expect(response.body.data.riskLevel).toBe('MODERATE');
      expect(mockPrisma.fatigueAssessment.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when personnelId is missing', async () => {
      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, personnelId: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when fatigueScore exceeds maximum of 10', async () => {
      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, fatigueScore: 11 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when fatigueScore is below minimum of 1', async () => {
      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, fatigueScore: 0 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when riskLevel is invalid', async () => {
      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, riskLevel: 'EXTREME' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when assessmentDate is invalid', async () => {
      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, assessmentDate: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send(validFatiguePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /dirty-dozen — Dirty Dozen Trending
  // ==========================================
  describe('GET /api/human-factors/dirty-dozen', () => {
    it('should return dirty dozen trending data with all 12 categories', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([
        { category: 'DISTRACTION', incidentDate: new Date('2026-02-05') },
        { category: 'FATIGUE', incidentDate: new Date('2026-02-08') },
        { category: 'DISTRACTION', incidentDate: new Date('2026-01-15') },
      ]);

      const response = await request(app)
        .get('/api/human-factors/dirty-dozen')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.trending).toBeDefined();
      expect(response.body.data.totals).toBeDefined();
      expect(response.body.data.period).toBeDefined();
      // Should have all 12 Dirty Dozen categories
      expect(Object.keys(response.body.data.totals)).toHaveLength(12);
      expect(response.body.data.totals.DISTRACTION).toBe(2);
      expect(response.body.data.totals.FATIGUE).toBe(1);
      expect(response.body.data.totals.COMPLACENCY).toBe(0);
    });

    it('should return zero counts when no incidents exist', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/human-factors/dirty-dozen')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const totals = response.body.data.totals;
      const allZero = Object.values(totals).every((v: any) => v === 0);
      expect(allZero).toBe(true);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/human-factors/dirty-dozen')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /dashboard — HF Overview Dashboard
  // ==========================================
  describe('GET /api/human-factors/dashboard', () => {
    it('should return full dashboard data with incident and fatigue stats', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock)
        .mockResolvedValueOnce(25) // totalIncidents
        .mockResolvedValueOnce(8) // openIncidents
        .mockResolvedValueOnce(5); // recentIncidents

      (mockPrisma.humanFactorIncident.groupBy as jest.Mock)
        .mockResolvedValueOnce([
          // bySeverity
          { severity: 'LOW', _count: { id: 10 } },
          { severity: 'MEDIUM', _count: { id: 8 } },
          { severity: 'HIGH', _count: { id: 5 } },
          { severity: 'CRITICAL', _count: { id: 2 } },
        ])
        .mockResolvedValueOnce([
          // byCategory (top 5)
          { category: 'DISTRACTION', _count: { id: 7 } },
          { category: 'FATIGUE', _count: { id: 5 } },
          { category: 'COMPLACENCY', _count: { id: 4 } },
          { category: 'PRESSURE', _count: { id: 3 } },
          { category: 'STRESS', _count: { id: 2 } },
        ]);

      (mockPrisma.fatigueAssessment.findMany as jest.Mock).mockResolvedValueOnce([
        { fatigueScore: 3, riskLevel: 'LOW', fitForDuty: true },
        { fatigueScore: 6, riskLevel: 'MODERATE', fitForDuty: true },
        { fatigueScore: 8, riskLevel: 'HIGH', fitForDuty: false },
        { fatigueScore: 9, riskLevel: 'CRITICAL', fitForDuty: false },
      ]);

      const response = await request(app)
        .get('/api/human-factors/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      const data = response.body.data;
      expect(data.totalIncidents).toBe(25);
      expect(data.openIncidents).toBe(8);
      expect(data.recentIncidents).toBe(5);
      expect(data.bySeverity).toHaveLength(4);
      expect(data.topCategories).toHaveLength(5);
      // Fatigue stats
      expect(data.fatigueStats.totalAssessments).toBe(4);
      expect(data.fatigueStats.averageScore).toBe(6.5);
      expect(data.fatigueStats.highRiskCount).toBe(2);
      expect(data.fatigueStats.notFitForDuty).toBe(2);
      expect(data.fatigueStats.byRiskLevel.LOW).toBe(1);
      expect(data.fatigueStats.byRiskLevel.MODERATE).toBe(1);
      expect(data.fatigueStats.byRiskLevel.HIGH).toBe(1);
      expect(data.fatigueStats.byRiskLevel.CRITICAL).toBe(1);
    });

    it('should handle empty dashboard with zero stats', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      (mockPrisma.humanFactorIncident.groupBy as jest.Mock)
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      (mockPrisma.fatigueAssessment.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/human-factors/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalIncidents).toBe(0);
      expect(response.body.data.fatigueStats.totalAssessments).toBe(0);
      expect(response.body.data.fatigueStats.averageScore).toBe(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/human-factors/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

// ── additional coverage ───────────────────────────────────────────────────
describe('Aerospace Human Factors — additional edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/human-factors', humanFactorsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/human-factors/incidents — additional filters', () => {
    it('should filter by status query parameter', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([mockIncident]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/human-factors/incidents?status=REPORTED')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return empty data array when no incidents match', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/human-factors/incidents?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.meta.total).toBe(0);
    });
  });

  describe('POST /api/human-factors/incidents — additional validation', () => {
    it('should return 400 when severity is invalid', async () => {
      const response = await request(app)
        .post('/api/human-factors/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...validIncidentPayload, severity: 'SUPER_HIGH' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('POST /api/human-factors/fatigue — additional coverage', () => {
    it('should accept fitForDuty as false and persist correctly', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockResolvedValueOnce({
        ...mockFatigueAssessment,
        fitForDuty: false,
        fatigueScore: 9,
        riskLevel: 'CRITICAL',
      });

      const response = await request(app)
        .post('/api/human-factors/fatigue')
        .set('Authorization', 'Bearer token')
        .send({ ...validFatiguePayload, fitForDuty: false, fatigueScore: 9, riskLevel: 'CRITICAL' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.fitForDuty).toBe(false);
    });
  });
});

describe('Aerospace Human Factors — extended coverage 2', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/human-factors', humanFactorsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/human-factors/incidents returns correct totalPages for multi-page result', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(50);

    const response = await request(app)
      .get('/api/human-factors/incidents?page=1&limit=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.totalPages).toBe(5);
    expect(response.body.meta.total).toBe(50);
  });

  it('GET /api/human-factors/incidents response shape has success:true and meta', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app)
      .get('/api/human-factors/incidents')
      .set('Authorization', 'Bearer token');

    expect(response.body.success).toBe(true);
    expect(response.body).toHaveProperty('data');
    expect(response.body).toHaveProperty('meta');
  });

  it('GET /api/human-factors/incidents returns empty data array when none match', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app)
      .get('/api/human-factors/incidents?category=AWARENESS')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
    expect(response.body.meta.total).toBe(0);
  });

  it('POST /api/human-factors/incidents returns 400 for INVALID_CATEGORY', async () => {
    const response = await request(app)
      .post('/api/human-factors/incidents')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Test',
        description: 'Test description',
        category: 'INVALID_CATEGORY',
        incidentDate: '2026-01-15T10:00:00Z',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/human-factors/dashboard returns success:false on error', async () => {
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockRejectedValueOnce(new Error('DB'));

    const response = await request(app)
      .get('/api/human-factors/dashboard')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.success).toBe(false);
  });

  it('GET /api/human-factors/dirty-dozen returns totals object with FATIGUE key', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValueOnce([
      { category: 'FATIGUE', incidentDate: new Date('2026-01-10') },
      { category: 'FATIGUE', incidentDate: new Date('2026-02-01') },
    ]);

    const response = await request(app)
      .get('/api/human-factors/dirty-dozen')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data.totals.FATIGUE).toBe(2);
  });
});
