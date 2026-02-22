import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    humanFactorIncident: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    fatigueAssessment: { findMany: jest.fn(), create: jest.fn() },
  },
  Prisma: { HumanFactorIncidentWhereInput: {} },
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
import hfRouter from '../src/routes/human-factors';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/human-factors', hfRouter);

describe('Human Factors Routes', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/human-factors/incidents', () => {
    const validBody = {
      title: 'Fatigue-related wiring error',
      description: 'Technician misrouted wiring harness due to fatigue',
      category: 'FATIGUE',
      incidentDate: '2026-02-10T10:00:00Z',
    };

    it('should report an HF incident', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({
        id: 'hf-1',
        refNumber: 'HF-2602-0001',
        ...validBody,
        status: 'REPORTED',
      });

      const res = await request(app).post('/api/human-factors/incidents').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const { title, ...no } = validBody;
      const res = await request(app).post('/api/human-factors/incidents').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      const { description, ...no } = validBody;
      const res = await request(app).post('/api/human-factors/incidents').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid category', async () => {
      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          category: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing incidentDate', async () => {
      const { incidentDate, ...no } = validBody;
      const res = await request(app).post('/api/human-factors/incidents').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid incidentDate format', async () => {
      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          incidentDate: 'not-a-date',
        });
      expect(res.status).toBe(400);
    });

    it('should accept COMPLACENCY category', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-2' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          category: 'COMPLACENCY',
        });
      expect(res.status).toBe(201);
    });

    it('should accept DISTRACTION category', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-3' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          category: 'DISTRACTION',
        });
      expect(res.status).toBe(201);
    });

    it('should accept PRESSURE category', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-4' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          category: 'PRESSURE',
        });
      expect(res.status).toBe(201);
    });

    it('should accept NORMS category', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-5' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          category: 'NORMS',
        });
      expect(res.status).toBe(201);
    });

    it('should accept optional severity', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-6' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          severity: 'HIGH',
        });
      expect(res.status).toBe(201);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-7' });

      const res = await request(app)
        .post('/api/human-factors/incidents')
        .send({
          ...validBody,
          location: 'Hangar B',
          shift: 'Night',
          personnelInvolved: ['John Doe', 'Jane Smith'],
          rootCause: 'Extended overtime',
          correctiveAction: 'Mandatory rest period',
        });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.humanFactorIncident.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/human-factors/incidents').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/human-factors/incidents', () => {
    it('should list HF incidents', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([{ id: 'hf-1' }]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/human-factors/incidents');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/human-factors/incidents?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should support search', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);

      await request(app).get('/api/human-factors/incidents?search=fatigue');
      expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalled();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/human-factors/incidents');
      expect(res.status).toBe(500);
    });
  });

  describe('POST /api/human-factors/fatigue', () => {
    const validBody = {
      personnelId: 'P-001',
      personnelName: 'John Doe',
      assessmentDate: '2026-02-10T08:00:00Z',
      hoursWorked: 12,
      restHours: 8,
      fatigueScore: 7,
      riskLevel: 'HIGH',
      fitForDuty: false,
    };

    it('should log a fatigue assessment', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockResolvedValue({
        id: 'fa-1',
        ...validBody,
      });

      const res = await request(app).post('/api/human-factors/fatigue').send(validBody);
      expect(res.status).toBe(201);
    });

    it('should return 400 for missing personnelId', async () => {
      const { personnelId, ...no } = validBody;
      const res = await request(app).post('/api/human-factors/fatigue').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing personnelName', async () => {
      const { personnelName, ...no } = validBody;
      const res = await request(app).post('/api/human-factors/fatigue').send(no);
      expect(res.status).toBe(400);
    });

    it('should return 400 for fatigueScore out of range (0)', async () => {
      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          fatigueScore: 0,
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for fatigueScore out of range (11)', async () => {
      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          fatigueScore: 11,
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid riskLevel', async () => {
      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          riskLevel: 'INVALID',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for negative hoursWorked', async () => {
      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          hoursWorked: -1,
        });
      expect(res.status).toBe(400);
    });

    it('should accept LOW riskLevel', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockResolvedValue({ id: 'fa-2' });

      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          riskLevel: 'LOW',
          fatigueScore: 2,
          fitForDuty: true,
        });
      expect(res.status).toBe(201);
    });

    it('should accept CRITICAL riskLevel', async () => {
      (mockPrisma.fatigueAssessment.create as jest.Mock).mockResolvedValue({ id: 'fa-3' });

      const res = await request(app)
        .post('/api/human-factors/fatigue')
        .send({
          ...validBody,
          riskLevel: 'CRITICAL',
          fatigueScore: 10,
        });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/human-factors/dirty-dozen', () => {
    it('should return dirty dozen trending', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([
        { category: 'FATIGUE', incidentDate: new Date('2026-01-15') },
        { category: 'COMPLACENCY', incidentDate: new Date('2026-01-20') },
      ]);

      const res = await request(app).get('/api/human-factors/dirty-dozen');
      expect(res.status).toBe(200);
      expect(res.body.data.trending).toBeDefined();
      expect(res.body.data.totals).toBeDefined();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/human-factors/dirty-dozen');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/human-factors/dashboard', () => {
    it('should return HF dashboard stats', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock)
        .mockResolvedValueOnce(50) // totalIncidents
        .mockResolvedValueOnce(10) // openIncidents
        .mockResolvedValueOnce(5); // recentIncidents
      (mockPrisma.humanFactorIncident.groupBy as jest.Mock)
        .mockResolvedValueOnce([{ severity: 'HIGH', _count: { id: 5 } }]) // bySeverity
        .mockResolvedValueOnce([{ category: 'FATIGUE', _count: { id: 10 } }]); // byCategory
      (mockPrisma.fatigueAssessment.findMany as jest.Mock).mockResolvedValue([
        { fatigueScore: 8, riskLevel: 'HIGH', fitForDuty: false },
        { fatigueScore: 3, riskLevel: 'LOW', fitForDuty: true },
      ]);

      const res = await request(app).get('/api/human-factors/dashboard');
      expect(res.status).toBe(200);
      expect(res.body.data.totalIncidents).toBe(50);
      expect(res.body.data.fatigueStats).toBeDefined();
    });

    it('should return 500 on error', async () => {
      (mockPrisma.humanFactorIncident.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/human-factors/dashboard');
      expect(res.status).toBe(500);
    });
  });
});

describe('Human Factors Extended — additional coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/human-factors/incidents returns correct totalPages for multi-page result', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(50);

    const res = await request(app).get('/api/human-factors/incidents?page=1&limit=10');
    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(5);
    expect(res.body.meta.total).toBe(50);
  });

  it('GET /api/human-factors/incidents response has success:true and meta', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/human-factors/incidents');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
    expect(res.body).toHaveProperty('meta');
  });

  it('POST /api/human-factors/incidents with all optional fields returns 201', async () => {
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.humanFactorIncident.create as jest.Mock).mockResolvedValue({ id: 'hf-opt' });

    const res = await request(app).post('/api/human-factors/incidents').send({
      title: 'Pressure-based incident',
      description: 'Management pressure led to shortcut',
      category: 'PRESSURE',
      incidentDate: '2026-01-20T08:00:00Z',
      severity: 'MEDIUM',
      location: 'Line 3',
      shift: 'Evening',
      personnelInvolved: ['tech-A'],
    });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/human-factors/fatigue returns 500 on db error', async () => {
    (mockPrisma.fatigueAssessment.create as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).post('/api/human-factors/fatigue').send({
      personnelId: 'P-002',
      personnelName: 'Jane Doe',
      assessmentDate: '2026-02-10T08:00:00Z',
      hoursWorked: 10,
      restHours: 7,
      fatigueScore: 6,
      riskLevel: 'MODERATE',
      fitForDuty: true,
    });
    expect(res.status).toBe(500);
  });

  it('GET /api/human-factors/dirty-dozen returns 500 on error', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockRejectedValue(new Error('DB'));

    const res = await request(app).get('/api/human-factors/dirty-dozen');
    expect(res.status).toBe(500);
  });

  it('GET /api/human-factors/incidents filters by category=STRESS', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/human-factors/incidents?category=STRESS');
    expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ category: 'STRESS' }) })
    );
  });

  it('GET /api/human-factors/incidents page 2 limit 5 computes skip=5', async () => {
    (mockPrisma.humanFactorIncident.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.humanFactorIncident.count as jest.Mock).mockResolvedValue(0);

    await request(app).get('/api/human-factors/incidents?page=2&limit=5');
    expect(mockPrisma.humanFactorIncident.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 5, take: 5 })
    );
  });

  it('POST /api/human-factors/incidents returns 400 for empty title string', async () => {
    const res = await request(app).post('/api/human-factors/incidents').send({
      title: '',
      description: 'Something happened',
      category: 'FATIGUE',
      incidentDate: '2026-01-15T10:00:00Z',
    });
    expect(res.status).toBe(400);
  });
});
