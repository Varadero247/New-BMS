import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    softwareProject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    soupItem: {
      create: jest.fn(),
    },
    softwarePhaseDoc: {
      upsert: jest.fn(),
    },
    softwareAnomaly: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    SoftwareProjectWhereInput: {},
    SoftwareAnomalyWhereInput: {},
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
import softwareRouter from '../src/routes/software';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockProject = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'SW-2602-0001',
  title: 'Blood Glucose Monitor Firmware',
  description: 'Embedded firmware for Class B glucose monitor',
  safetyClass: 'CLASS_B',
  currentPhase: 'PLANNING',
  status: 'ACTIVE',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockSoupItem = {
  id: '30000000-0000-4000-a000-000000000001',
  projectId: mockProject.id,
  title: 'FreeRTOS',
  vendor: 'Amazon Web Services',
  version: '10.5.1',
  intendedUse: 'Real-time task scheduling',
  knownAnomalies: 'None known',
  riskAcceptable: true,
  verifiedDate: new Date('2026-01-10'),
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockPhaseDoc = {
  id: '40000000-0000-4000-a000-000000000001',
  projectId: mockProject.id,
  phase: 'REQUIREMENTS',
  documentRef: 'SRS-001',
  content: 'Software requirements specification',
  status: 'IN_PROGRESS',
  reviewedBy: null,
  reviewedDate: null,
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-01-15'),
};

const mockAnomaly = {
  id: '50000000-0000-4000-a000-000000000001',
  projectId: mockProject.id,
  refNumber: 'SW-ANM-2602-0001',
  title: 'Memory leak in sensor polling',
  description: 'Heap usage grows over 24h continuous operation',
  severity: 'MAJOR',
  status: 'OPEN',
  resolution: null,
  createdBy: 'user-1',
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

// ==========================================
// App setup
// ==========================================

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use('/api/software', softwareRouter);
  return app;
}

// ==========================================
// Tests
// ==========================================

describe('Software Validation Routes (IEC 62304)', () => {
  let app: express.Express;

  beforeAll(() => {
    app = buildApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ------------------------------------------
  // POST /api/software/projects
  // ------------------------------------------
  describe('POST /api/software/projects', () => {
    it('should create a new software project', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockResolvedValue({ ...mockProject });

      const res = await request(app).post('/api/software/projects').send({
        title: 'Blood Glucose Monitor Firmware',
        safetyClass: 'CLASS_B',
        description: 'Embedded firmware for Class B glucose monitor',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Blood Glucose Monitor Firmware');
      expect(mockPrisma.softwareProject.create).toHaveBeenCalledTimes(1);
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/software/projects')
        .send({ safetyClass: 'CLASS_B' });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when safetyClass is missing', async () => {
      const res = await request(app)
        .post('/api/software/projects')
        .send({ title: 'Blood Glucose Monitor Firmware' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid safetyClass', async () => {
      const res = await request(app)
        .post('/api/software/projects')
        .send({ title: 'Test', safetyClass: 'CLASS_D' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareProject.create as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app)
        .post('/api/software/projects')
        .send({ title: 'Test Project', safetyClass: 'CLASS_A' });

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ------------------------------------------
  // GET /api/software/projects
  // ------------------------------------------
  describe('GET /api/software/projects', () => {
    it('should list projects with pagination', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([mockProject]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/software/projects');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
      expect(res.body.meta.page).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get('/api/software/projects?status=COMPLETED');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should filter by safetyClass', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([mockProject]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/software/projects?safetyClass=CLASS_B');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by currentPhase', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockResolvedValue([mockProject]);
      (mockPrisma.softwareProject.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get('/api/software/projects?currentPhase=PLANNING');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.softwareProject.findMany as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app).get('/api/software/projects');

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ------------------------------------------
  // GET /api/software/projects/:id
  // ------------------------------------------
  describe('GET /api/software/projects/:id', () => {
    it('should get a project with SOUP items, anomalies, and phases', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        ...mockProject,
        soupItems: [mockSoupItem],
        anomalies: [mockAnomaly],
        phases: [mockPhaseDoc],
      });

      const res = await request(app).get(`/api/software/projects/${mockProject.id}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Blood Glucose Monitor Firmware');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when project is soft-deleted', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue({
        ...mockProject,
        deletedAt: new Date(),
      });

      const res = await request(app).get(`/api/software/projects/${mockProject.id}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ------------------------------------------
  // POST /api/software/projects/:id/soup
  // ------------------------------------------
  describe('POST /api/software/projects/:id/soup', () => {
    it('should add a SOUP item', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.soupItem.create as jest.Mock).mockResolvedValue(mockSoupItem);

      const res = await request(app).post(`/api/software/projects/${mockProject.id}/soup`).send({
        title: 'FreeRTOS',
        version: '10.5.1',
        vendor: 'Amazon Web Services',
        intendedUse: 'Real-time task scheduling',
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('FreeRTOS');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000099/soup')
        .send({ title: 'FreeRTOS', version: '10.5.1' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when title is missing', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/soup`)
        .send({ version: '10.5.1' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when version is missing', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/soup`)
        .send({ title: 'FreeRTOS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ------------------------------------------
  // PUT /api/software/projects/:id/phase/:phase
  // ------------------------------------------
  describe('PUT /api/software/projects/:id/phase/:phase', () => {
    it('should upsert a phase document', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwarePhaseDoc.upsert as jest.Mock).mockResolvedValue(mockPhaseDoc);

      const res = await request(app)
        .put(`/api/software/projects/${mockProject.id}/phase/REQUIREMENTS`)
        .send({
          documentRef: 'SRS-001',
          content: 'Software requirements specification',
          status: 'IN_PROGRESS',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.phase).toBe('REQUIREMENTS');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .put('/api/software/projects/00000000-0000-0000-0000-000000000099/phase/REQUIREMENTS')
        .send({ documentRef: 'SRS-001' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid phase value', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .put(`/api/software/projects/${mockProject.id}/phase/INVALID_PHASE`)
        .send({ documentRef: 'SRS-001' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid doc status', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .put(`/api/software/projects/${mockProject.id}/phase/REQUIREMENTS`)
        .send({ status: 'INVALID_STATUS' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept all valid phases', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwarePhaseDoc.upsert as jest.Mock).mockResolvedValue({
        ...mockPhaseDoc,
        phase: 'SYSTEM_TESTING',
      });

      const res = await request(app)
        .put(`/api/software/projects/${mockProject.id}/phase/SYSTEM_TESTING`)
        .send({ documentRef: 'STS-001' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // ------------------------------------------
  // POST /api/software/projects/:id/anomalies
  // ------------------------------------------
  describe('POST /api/software/projects/:id/anomalies', () => {
    it('should create an anomaly', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareAnomaly.create as jest.Mock).mockResolvedValue(mockAnomaly);

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/anomalies`)
        .send({
          title: 'Memory leak in sensor polling',
          description: 'Heap usage grows over 24h continuous operation',
          severity: 'MAJOR',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Memory leak in sensor polling');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app)
        .post('/api/software/projects/00000000-0000-0000-0000-000000000099/anomalies')
        .send({ title: 'Bug', description: 'A bug' });

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when title is missing', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/anomalies`)
        .send({ description: 'A bug' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/anomalies`)
        .send({ title: 'Bug Title' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);
      (mockPrisma.softwareAnomaly.create as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app)
        .post(`/api/software/projects/${mockProject.id}/anomalies`)
        .send({ title: 'Bug', description: 'A bug' });

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ------------------------------------------
  // GET /api/software/projects/:id/anomalies
  // ------------------------------------------
  describe('GET /api/software/projects/:id/anomalies', () => {
    it('should list anomalies for a project', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockResolvedValue([mockAnomaly]);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(`/api/software/projects/${mockProject.id}/anomalies`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta.total).toBe(1);
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(null);

      const res = await request(app).get(
        '/api/software/projects/00000000-0000-0000-0000-000000000099/anomalies'
      );

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should filter anomalies by severity', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockResolvedValue([mockAnomaly]);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(1);

      const res = await request(app).get(
        `/api/software/projects/${mockProject.id}/anomalies?severity=MAJOR`
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter anomalies by status', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockResolvedValue([]);
      (mockPrisma.softwareAnomaly.count as jest.Mock).mockResolvedValue(0);

      const res = await request(app).get(
        `/api/software/projects/${mockProject.id}/anomalies?status=CLOSED`
      );

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });

    it('should return 500 on database error', async () => {
      (mockPrisma.softwareProject.findUnique as jest.Mock).mockResolvedValue(mockProject);
      (mockPrisma.softwareAnomaly.findMany as jest.Mock).mockRejectedValue(new Error('DB failure'));

      const res = await request(app).get(`/api/software/projects/${mockProject.id}/anomalies`);

      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
