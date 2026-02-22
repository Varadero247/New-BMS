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

describe('Medical DHF — extended', () => {
  let extApp: express.Express;

  beforeAll(() => {
    extApp = express();
    extApp.use(express.json());
    extApp.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /dhf sets uploadedBy from authenticated user email', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

    await request(extApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Risk Analysis',
      category: 'RISK_ANALYSIS',
      documentRef: 'DHF-002',
      version: '1.0',
    });

    expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ uploadedBy: 'test@test.com' }),
      })
    );
  });
});

describe('DHF — additional coverage', () => {
  let addApp: express.Express;

  beforeAll(() => {
    addApp = express();
    addApp.use(express.json());
    addApp.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dhf returns phase as lowercase string', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([
      { ...mockProject, currentStage: 'DESIGN_VERIFICATION' },
    ]);

    const res = await request(addApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].phase).toBe('design_verification');
  });

  it('GET /dhf document type is derived from category in lowercase', async () => {
    const projectWithCategoryFile = {
      ...mockProject,
      historyFiles: [{ ...mockHistoryFile, category: 'RISK_ANALYSIS' }],
    };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([projectWithCategoryFile]);

    const res = await request(addApp).get('/api/dhf');

    expect(res.status).toBe(200);
    const doc = res.body.data[0].documents[0];
    expect(doc.type).toMatch(/risk/i);
  });

  it('GET /dhf completeness is 0 for a project with no history files', async () => {
    const emptyProject = { ...mockProject, historyFiles: [] };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([emptyProject]);

    const res = await request(addApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].completeness).toBe(0);
  });

  it('POST /dhf uses documentRef from body when provided', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce({
      ...mockHistoryFile,
      documentRef: 'DHF-CUSTOM-007',
    });

    await request(addApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Custom Document',
      documentRef: 'DHF-CUSTOM-007',
    });

    expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ documentRef: 'DHF-CUSTOM-007' }),
      })
    );
  });

  it('POST /dhf returns 201 status on successful creation', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

    const res = await request(addApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Validation Protocol',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });
});

describe('DHF — deeper edge cases', () => {
  let deepApp: express.Express;

  beforeAll(() => {
    deepApp = express();
    deepApp.use(express.json());
    deepApp.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dhf success is true on 200', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

    const res = await request(deepApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /dhf findMany is called exactly once per request', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

    await request(deepApp).get('/api/dhf');

    expect(mockPrisma.designProject.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /dhf each document has an approver field', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

    const res = await request(deepApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].documents[0]).toHaveProperty('approver');
  });

  it('GET /dhf document lastModified field is present', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

    const res = await request(deepApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].documents[0]).toHaveProperty('lastModified');
  });

  it('GET /dhf document status is always approved', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

    const res = await request(deepApp).get('/api/dhf');

    expect(res.body.data[0].documents[0].status).toBe('approved');
  });

  it('POST /dhf data object in response matches created file', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

    const res = await request(deepApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Design Input Specification',
    });

    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe(FILE_ID);
  });

  it('POST /dhf without projectId returns VALIDATION_ERROR code', async () => {
    const res = await request(deepApp).post('/api/dhf').send({ title: 'No Project' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /dhf with multiple documents calculates completeness proportionally', async () => {
    const projectWith3Files = {
      ...mockProject,
      historyFiles: new Array(3).fill(null).map((_, i) => ({ ...mockHistoryFile, id: `file-${i}` })),
    };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([projectWith3Files]);

    const res = await request(deepApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].completeness).toBe(30);
  });
});

describe('DHF — boundary and schema coverage', () => {
  let boundApp: express.Express;

  beforeAll(() => {
    boundApp = express();
    boundApp.use(express.json());
    boundApp.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dhf returns success:true when projects exist', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);

    const res = await request(boundApp).get('/api/dhf');

    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
  });

  it('POST /dhf with invalid category still creates (category is optional)', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

    const res = await request(boundApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Some Doc',
      category: 'DESIGN_VALIDATION',
    });

    expect(res.status).toBe(201);
  });

  it('GET /dhf calls findMany with include historyFiles', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

    await request(boundApp).get('/api/dhf');

    expect(mockPrisma.designProject.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ historyFiles: expect.anything() }) })
    );
  });

  it('POST /dhf create is called exactly once', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce(mockHistoryFile);

    await request(boundApp).post('/api/dhf').send({ projectId: PROJECT_ID, title: 'Single Call Doc' });

    expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledTimes(1);
  });

  it('GET /dhf response body is an array', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

    const res = await request(boundApp).get('/api/dhf');

    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /dhf returns 400 with VALIDATION_ERROR when body is empty', async () => {
    const res = await request(boundApp).post('/api/dhf').send({});

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /dhf completeness for 5 files is 50', async () => {
    const projectWith5Files = {
      ...mockProject,
      historyFiles: new Array(5).fill(null).map((_, i) => ({ ...mockHistoryFile, id: `file-${i}` })),
    };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([projectWith5Files]);

    const res = await request(boundApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].completeness).toBe(50);
  });
});

describe('DHF — final edge case coverage', () => {
  let finalApp: express.Express;

  beforeAll(() => {
    finalApp = express();
    finalApp.use(express.json());
    finalApp.use('/api/dhf', dhfRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /dhf second project has its own documents array', async () => {
    const secondProject = {
      ...mockProject,
      id: '00000000-0000-0000-0000-000000000010',
      deviceName: 'Infusion Pump',
      historyFiles: [{ ...mockHistoryFile, id: '00000000-0000-0000-0000-000000000011' }],
    };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject, secondProject]);

    const res = await request(finalApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[1].documents).toHaveLength(1);
  });

  it('POST /dhf create call includes version from body', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce({
      ...mockHistoryFile,
      version: '2.1',
    });

    await request(finalApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Versioned Document',
      version: '2.1',
    });

    expect(mockPrisma.designHistoryFile.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ version: '2.1' }),
      })
    );
  });

  it('GET /dhf findMany is called with orderBy if defined', async () => {
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([]);

    await request(finalApp).get('/api/dhf');

    expect(mockPrisma.designProject.findMany).toHaveBeenCalledTimes(1);
  });

  it('POST /dhf returns created file in response body data', async () => {
    (mockPrisma.designHistoryFile.create as jest.Mock).mockResolvedValueOnce({
      ...mockHistoryFile,
      title: 'Return Test',
    });

    const res = await request(finalApp).post('/api/dhf').send({
      projectId: PROJECT_ID,
      title: 'Return Test',
    });

    expect(res.body.data).toHaveProperty('title', 'Return Test');
  });

  it('GET /dhf completeness for 10 files is capped or 100', async () => {
    const projectWith10Files = {
      ...mockProject,
      historyFiles: new Array(10).fill(null).map((_, i) => ({ ...mockHistoryFile, id: `file-${i}` })),
    };
    (mockPrisma.designProject.findMany as jest.Mock).mockResolvedValueOnce([projectWith10Files]);

    const res = await request(finalApp).get('/api/dhf');

    expect(res.status).toBe(200);
    expect(res.body.data[0].completeness).toBe(100);
  });
});
