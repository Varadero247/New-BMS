import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    softwareProject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    soupItem: { create: jest.fn() },
    softwareAnomaly: { findMany: jest.fn(), create: jest.fn(), count: jest.fn() },
    softwarePhaseDoc: { upsert: jest.fn() },
  },
  Prisma: { SoftwareProjectWhereInput: {}, SoftwareAnomalyWhereInput: {} },
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
import softwareRouter from '../src/routes/software';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const app = express();
app.use(express.json());
app.use('/api/software', softwareRouter);

describe('Software Validation Routes (IEC 62304)', () => {
  beforeEach(() => jest.clearAllMocks());

  describe('POST /api/software/projects', () => {
    const validBody = {
      title: 'Infusion Pump Firmware',
      safetyClass: 'CLASS_C',
    };

    it('should create a software project', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'SW-2602-0001',
        ...validBody,
        status: 'ACTIVE',
      });

      const res = await request(app).post('/api/software/projects').send(validBody);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for missing title', async () => {
      const res = await request(app)
        .post('/api/software/projects')
        .send({ safetyClass: 'CLASS_A' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing safetyClass', async () => {
      const res = await request(app).post('/api/software/projects').send({ title: 'Test' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for invalid safetyClass', async () => {
      const res = await request(app).post('/api/software/projects').send({
        title: 'Test',
        safetyClass: 'INVALID',
      });
      expect(res.status).toBe(400);
    });

    it('should accept CLASS_A', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({ id: 'sw-2' });

      const res = await request(app).post('/api/software/projects').send({
        title: 'Dashboard',
        safetyClass: 'CLASS_A',
      });
      expect(res.status).toBe(201);
    });

    it('should accept CLASS_B', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({ id: 'sw-3' });

      const res = await request(app).post('/api/software/projects').send({
        title: 'Monitor',
        safetyClass: 'CLASS_B',
      });
      expect(res.status).toBe(201);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({ id: 'sw-4' });

      const res = await request(app)
        .post('/api/software/projects')
        .send({
          ...validBody,
          description: 'Firmware for infusion control',
          currentPhase: 'REQUIREMENTS',
          status: 'ACTIVE',
        });
      expect(res.status).toBe(201);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).post('/api/software/projects').send(validBody);
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/software/projects', () => {
    it('should list software projects', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([
        { id: '00000000-0000-0000-0000-000000000001' },
      ]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/software/projects');
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should support pagination', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(50);

      const res = await request(app).get('/api/software/projects?page=2&limit=10');
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });

    it('should return 500 on error', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockRejectedValue(new Error('DB'));
      (mockPrisma.softwareProject.count as jest.Mock).mockRejectedValue(new Error('DB'));

      const res = await request(app).get('/api/software/projects');
      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/software/projects/:id', () => {
    it('should get project with SOUP items and anomalies', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
        soupItems: [],
        anomalies: [],
        phases: [],
      });

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(200);
    });

    it('should return 404 if not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000099'
      );
      expect(res.status).toBe(404);
    });

    it('should return 404 for soft-deleted', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000001'
      );
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/software/projects/:id/soup', () => {
    it('should add a SOUP item', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.soupItem.create as jest.Mock).mockResolvedValue({ id: 'soup-1' });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/soup')
        .send({
          title: 'React',
          version: '18.2.0',
        });
      expect(res.status).toBe(201);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000099/soup')
        .send({
          title: 'React',
          version: '18.2.0',
        });
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing title', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/soup')
        .send({ version: '1.0' });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing version', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/soup')
        .send({ title: 'React' });
      expect(res.status).toBe(400);
    });

    it('should accept optional fields', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.soupItem.create as jest.Mock).mockResolvedValue({ id: 'soup-2' });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/soup')
        .send({
          title: 'OpenSSL',
          version: '3.0.0',
          vendor: 'OpenSSL Project',
          intendedUse: 'TLS encryption',
          knownAnomalies: 'None',
          riskAcceptable: true,
        });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/software/projects/:id/phase/:phase', () => {
    it('should update a phase document', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.softwarePhaseDoc.upsert as jest.Mock).mockResolvedValue({
        phase: 'REQUIREMENTS',
        status: 'IN_PROGRESS',
      });

      const res = await request(app)
        .put('/api/software/projects/00000000-0000-0000-0000-000000000001/phase/REQUIREMENTS')
        .send({
          content: 'Requirements spec v1',
          status: 'IN_PROGRESS',
        });
      expect(res.status).toBe(200);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/software/projects/00000000-0000-0000-0000-000000000099/phase/REQUIREMENTS')
        .send({});
      expect(res.status).toBe(404);
    });

    it('should return 400 for invalid phase', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .put('/api/software/projects/00000000-0000-0000-0000-000000000001/phase/INVALID_PHASE')
        .send({});
      expect(res.status).toBe(400);
    });
  });

  describe('POST /api/software/projects/:id/anomalies', () => {
    const validAnomaly = {
      title: 'Alarm not triggering',
      description: 'Low battery alarm fails to trigger below 10%',
    };

    it('should report an anomaly', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareAnomaly.create as jest.Mock).mockResolvedValue({
        id: 'anm-1',
        refNumber: 'SW-ANM-2602-0001',
        severity: 'MINOR',
      });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies')
        .send(validAnomaly);
      expect(res.status).toBe(201);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000099/anomalies')
        .send(validAnomaly);
      expect(res.status).toBe(404);
    });

    it('should return 400 for missing title', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies')
        .send({
          description: 'Some desc',
        });
      expect(res.status).toBe(400);
    });

    it('should return 400 for missing description', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies')
        .send({
          title: 'Some title',
        });
      expect(res.status).toBe(400);
    });

    it('should accept CRITICAL severity', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareAnomaly.create as jest.Mock).mockResolvedValue({ id: 'anm-2' });

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies')
        .send({
          ...validAnomaly,
          severity: 'CRITICAL',
        });
      expect(res.status).toBe(201);
    });
  });

  describe('GET /api/software/projects/:id/anomalies', () => {
    it('should list anomalies for a project', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockResolvedValue([{ id: 'anm-1' }]);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies'
      );
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
    });

    it('should return 404 if project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000099/anomalies'
      );
      expect(res.status).toBe(404);
    });

    it('should support pagination', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(30);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies?page=2&limit=10'
      );
      expect(res.status).toBe(200);
      expect(res.body.meta.page).toBe(2);
    });
  });
});

describe('Software Validation — final coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('GET /api/software/projects filters by safetyClass', async () => {
    (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/software/projects?safetyClass=CLASS_C');

    expect(res.status).toBe(200);
    expect(mockPrisma.softwareProject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ safetyClass: 'CLASS_C' }) })
    );
  });

  it('GET /api/software/projects filters by status', async () => {
    (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/software/projects?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(mockPrisma.softwareProject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('POST /api/software/projects count is called before create to generate refNumber', async () => {
    (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(2);
    (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({ id: 'sw-count-test' });

    await request(app).post('/api/software/projects').send({ title: 'Count Test', safetyClass: 'CLASS_A' });

    expect(mockPrisma.softwareProject.count).toHaveBeenCalledTimes(1);
    expect(mockPrisma.softwareProject.create).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/software/projects/:id/phase/DETAILED_DESIGN updates successfully', async () => {
    (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.softwarePhaseDoc.upsert as jest.Mock).mockResolvedValue({
      phase: 'DETAILED_DESIGN',
      status: 'IN_PROGRESS',
    });

    const res = await request(app)
      .put('/api/software/projects/00000000-0000-0000-0000-000000000001/phase/DETAILED_DESIGN')
      .send({ content: 'Detailed design document', status: 'IN_PROGRESS' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST /api/software/projects/:id/anomalies MAJOR severity is accepted', async () => {
    (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
      id: '00000000-0000-0000-0000-000000000001',
      deletedAt: null,
    });
    (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);
    (mockPrisma.softwareAnomaly.create as jest.Mock).mockResolvedValue({ id: 'anm-major' });

    const res = await request(app)
      .post('/api/software/projects/00000000-0000-0000-0000-000000000001/anomalies')
      .send({ title: 'Critical Alarm Failure', description: 'Alarm does not activate', severity: 'MAJOR' });

    expect(res.status).toBe(201);
  });

  it('GET /api/software/projects meta.total matches count', async () => {
    (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([]);
    (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(17);

    const res = await request(app).get('/api/software/projects');

    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(17);
  });
});
