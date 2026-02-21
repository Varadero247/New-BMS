import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    designProject: {
      findMany: jest.fn(),
    },
    designHistoryFile: {
      create: jest.fn(),
    },
  },
  Prisma: {},
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
import dhfRouter from '../src/routes/dhf';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Test data ────────────────────────────────────────────────────────

const PROJECT_ID = '00000000-0000-0000-0000-000000000001';
const FILE_ID = '00000000-0000-0000-0000-000000000002';

const mockHistoryFile = {
  id: FILE_ID,
  projectId: PROJECT_ID,
  title: 'Design Input Specification',
  category: 'DESIGN_INPUT',
  documentRef: 'DHF-001',
  version: '1.0',
  uploadedBy: 'engineer@test.com',
  deletedAt: null,
  createdAt: new Date('2026-01-10'),
  updatedAt: new Date('2026-01-10'),
};

const mockProject = {
  id: PROJECT_ID,
  deviceName: 'Pulse Oximeter Pro',
  currentStage: 'DESIGN_INPUT',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-15'),
  historyFiles: [mockHistoryFile],
};

describe('DHF (Design History File) API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /api/dhf ─────────────────────────────────────────────────────
  describe('GET /api/dhf', () => {
    it('should return 200 with design projects including historyFiles', async () => {
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

      const response = await request(app).get('/api/dhf');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe(PROJECT_ID);
      expect(response.body.data[0].product).toBe('Pulse Oximeter Pro');
      expect(response.body.data[0].documents).toHaveLength(1);
    });

    it('should return 200 with empty array when no projects', async () => {
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app).get('/api/dhf');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should map project fields to expected shape', async () => {
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

      const response = await request(app).get('/api/dhf');

      const project = response.body.data[0];
      expect(project).toHaveProperty('id', PROJECT_ID);
      expect(project).toHaveProperty('product', 'Pulse Oximeter Pro');
      expect(project).toHaveProperty('phase', 'design_input');
      expect(project).toHaveProperty('completeness', 10);
      expect(project).toHaveProperty('documents');
    });

    it('should map document fields correctly within a project', async () => {
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

      const response = await request(app).get('/api/dhf');

      const doc = response.body.data[0].documents[0];
      expect(doc).toHaveProperty('id', FILE_ID);
      expect(doc).toHaveProperty('docNumber', 'DHF-001');
      expect(doc).toHaveProperty('title', 'Design Input Specification');
      expect(doc).toHaveProperty('version', '1.0');
      expect(doc).toHaveProperty('status', 'approved');
      expect(doc).toHaveProperty('author', 'engineer@test.com');
    });

    it('should cap completeness at 100 for projects with many files', async () => {
      const projectWithManyFiles = {
        ...mockProject,
        historyFiles: new Array(15).fill(null).map((_, i) => ({
          ...mockHistoryFile,
          id: `file-${i}`,
        })),
      };
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([projectWithManyFiles]);

      const response = await request(app).get('/api/dhf');

      expect(response.body.data[0].completeness).toBe(100);
    });

    it('should return 200 with multiple projects', async () => {
      const secondProject = {
        ...mockProject,
        id: '00000000-0000-0000-0000-000000000003',
        deviceName: 'Blood Glucose Monitor',
        historyFiles: [],
      };
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject, secondProject]);

      const response = await request(app).get('/api/dhf');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(2);
    });

    it('should call findMany with deletedAt null filter', async () => {
      (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/dhf');

      expect(mockPrisma.designProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { deletedAt: null },
        })
      );
    });
  });

  // ── POST /api/dhf ─────────────────────────────────────────────────────
  describe('POST /api/dhf', () => {
    it('should create new DHF entry and return 201', async () => {
      (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

      const response = await request(app)
        .post('/api/dhf')
        .send({
          projectId: PROJECT_ID,
          title: 'Design Input Specification',
          category: 'DESIGN_INPUT',
          documentRef: 'DHF-001',
          version: '1.0',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(FILE_ID);
      expect(response.body.data.title).toBe('Design Input Specification');
    });

    it('should return 400 if projectId is missing', async () => {
      const response = await request(app)
        .post('/api/dhf')
        .send({ title: 'Some Document' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 if title is missing', async () => {
      const response = await request(app)
        .post('/api/dhf')
        .send({ projectId: PROJECT_ID });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should associate DHF with the given projectId', async () => {
      (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

      await request(app)
        .post('/api/dhf')
        .send({
          projectId: PROJECT_ID,
          title: 'Design Verification Plan',
        });

      expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: PROJECT_ID,
            title: 'Design Verification Plan',
          }),
        })
      );
    });

    it('should use default category DESIGN_INPUT and version 1.0 when not provided', async () => {
      (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

      await request(app)
        .post('/api/dhf')
        .send({ projectId: PROJECT_ID, title: 'Uncategorized Document' });

      expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            category: 'DESIGN_INPUT',
            version: '1.0',
          }),
        })
      );
    });
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  let app500: express.Express;

  beforeAll(() => {
    app500 = express();
    app500.use(express.json());
    app500.use('/api/dhf', dhfRouter);
  });

  it('GET / returns 500 on DB error', async () => {
    mockPrisma.designProject.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app500).get('/api/dhf');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.designHistoryFile.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app500).post('/api/dhf').send({ projectId: PROJECT_ID, title: 'Design Input Specification', category: 'DESIGN_INPUT', documentRef: 'DHF-001', version: '1.0' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
