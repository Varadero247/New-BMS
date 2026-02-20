import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    ppapProject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    ppapElement: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    ppapSubmission: {
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    PpapProjectWhereInput: {},
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
import ppapRoutes from '../src/routes/ppap';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockProject = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'PPAP-2602-0001',
  partNumber: 'BP-2026-100',
  partName: 'Brake Pad Assembly',
  customer: 'AutoMotive Corp',
  submissionLevel: 3,
  status: 'DRAFT',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-01-20'),
  updatedAt: new Date('2026-02-01'),
};

const mockProject2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'PPAP-2602-0002',
  partNumber: 'SC-2026-200',
  partName: 'Steering Column Bracket',
  customer: 'Parts Inc',
  submissionLevel: 1,
  status: 'SUBMITTED',
  createdBy: 'user-1',
  deletedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-05'),
};

const mockElements = [
  {
    id: 'elem-001',
    projectId: mockProject.id,
    elementNumber: 1,
    elementName: 'Design Records',
    status: 'COMPLETED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: new Date('2026-01-25'),
  },
  {
    id: 'elem-002',
    projectId: mockProject.id,
    elementNumber: 2,
    elementName: 'Authorized Engineering Change Documents',
    status: 'COMPLETED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: new Date('2026-01-26'),
  },
  {
    id: 'elem-003',
    projectId: mockProject.id,
    elementNumber: 3,
    elementName: 'Customer Engineering Approval',
    status: 'IN_PROGRESS',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-004',
    projectId: mockProject.id,
    elementNumber: 4,
    elementName: 'DFMEA',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-005',
    projectId: mockProject.id,
    elementNumber: 5,
    elementName: 'Process Flow Diagram',
    status: 'NOT_APPLICABLE',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-006',
    projectId: mockProject.id,
    elementNumber: 6,
    elementName: 'PFMEA',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-007',
    projectId: mockProject.id,
    elementNumber: 7,
    elementName: 'Control Plan',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-008',
    projectId: mockProject.id,
    elementNumber: 8,
    elementName: 'Measurement System Analysis',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-009',
    projectId: mockProject.id,
    elementNumber: 9,
    elementName: 'Dimensional Results',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-010',
    projectId: mockProject.id,
    elementNumber: 10,
    elementName: 'Material/Performance Test Results',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-011',
    projectId: mockProject.id,
    elementNumber: 11,
    elementName: 'Initial Process Studies',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-012',
    projectId: mockProject.id,
    elementNumber: 12,
    elementName: 'Qualified Lab Documentation',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-013',
    projectId: mockProject.id,
    elementNumber: 13,
    elementName: 'Appearance Approval Report',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-014',
    projectId: mockProject.id,
    elementNumber: 14,
    elementName: 'Sample Production Parts',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-015',
    projectId: mockProject.id,
    elementNumber: 15,
    elementName: 'Master Sample',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-016',
    projectId: mockProject.id,
    elementNumber: 16,
    elementName: 'Checking Aids',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-017',
    projectId: mockProject.id,
    elementNumber: 17,
    elementName: 'Customer-Specific Requirements',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
  {
    id: 'elem-018',
    projectId: mockProject.id,
    elementNumber: 18,
    elementName: 'Part Submission Warrant',
    status: 'NOT_STARTED',
    documentRef: null,
    notes: null,
    reviewedBy: null,
    completedDate: null,
  },
];

const mockSubmission = {
  id: 'sub-001',
  projectId: mockProject.id,
  pswNumber: 'PSW-2602-0001',
  submissionLevel: 3,
  customerNotes: 'Initial submission for review',
  submittedBy: 'user-1',
  submittedDate: new Date('2026-02-10'),
  status: 'SUBMITTED',
  createdAt: new Date('2026-02-10'),
  updatedAt: new Date('2026-02-10'),
};

const mockProjectWithDetails = {
  ...mockProject,
  elements: mockElements,
  submissions: [mockSubmission],
};

const validCreatePayload = {
  partNumber: 'BP-2026-100',
  partName: 'Brake Pad Assembly',
  customer: 'AutoMotive Corp',
  submissionLevel: 3,
};

// ==========================================
// Tests
// ==========================================

describe('Automotive PPAP API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/ppap', ppapRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / - Create PPAP Project
  // ==========================================
  describe('POST /api/ppap', () => {
    it('should create a PPAP project with all 18 elements via transaction', async () => {
      const mockTx = {
        ppapProject: {
          create: jest.fn().mockResolvedValue({ id: 'new-ppap-id', ...mockProject }),
          findUnique: jest.fn().mockResolvedValue(mockProjectWithDetails),
        },
        ppapElement: {
          create: jest.fn().mockResolvedValue({ id: 'elem-new' }),
        },
      };

      // Mock count for ref number generation
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      // $transaction calls the callback with tx and returns its result
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Verify project was created with correct data
      expect(mockTx.ppapProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          partNumber: 'BP-2026-100',
          partName: 'Brake Pad Assembly',
          customer: 'AutoMotive Corp',
          submissionLevel: 3,
          status: 'DRAFT',
          createdBy: 'user-1',
        }),
      });

      // Verify all 18 PPAP elements were created
      expect(mockTx.ppapElement.create).toHaveBeenCalledTimes(18);

      // Verify element 1 (Design Records)
      expect(mockTx.ppapElement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          elementNumber: 1,
          elementName: 'Design Records',
          status: 'NOT_STARTED',
        }),
      });

      // Verify element 18 (Part Submission Warrant)
      expect(mockTx.ppapElement.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          elementNumber: 18,
          elementName: 'Part Submission Warrant',
          status: 'NOT_STARTED',
        }),
      });

      // Verify the final findUnique to return project with elements
      // The id comes from the create mock result (mockProject.id)
      expect(mockTx.ppapProject.findUnique).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        include: {
          elements: { orderBy: { elementNumber: 'asc' } },
          submissions: true,
        },
      });
    });

    it('should default submissionLevel to 3 when not provided', async () => {
      const mockTx = {
        ppapProject: {
          create: jest.fn().mockResolvedValue({ id: 'new-ppap-id', ...mockProject }),
          findUnique: jest.fn().mockResolvedValue(mockProjectWithDetails),
        },
        ppapElement: {
          create: jest.fn().mockResolvedValue({ id: 'elem-new' }),
        },
      };

      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'BP-2026-100',
          partName: 'Brake Pad Assembly',
          customer: 'AutoMotive Corp',
          // submissionLevel omitted
        });

      expect(response.status).toBe(201);
      expect(mockTx.ppapProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionLevel: 3,
        }),
      });
    });

    it('should generate a unique PPAP reference number', async () => {
      const mockTx = {
        ppapProject: {
          create: jest.fn().mockResolvedValue({ id: 'new-ppap-id', ...mockProject }),
          findUnique: jest.fn().mockResolvedValue(mockProjectWithDetails),
        },
        ppapElement: {
          create: jest.fn().mockResolvedValue({ id: 'elem-new' }),
        },
      };

      // Simulate 5 existing projects with same prefix
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.$transaction as jest.Mock).mockImplementation(async (cb: any) => cb(mockTx));

      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);

      // The ref number should include the incremented count (6th project = 0006)
      expect(mockTx.ppapProject.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: expect.stringMatching(/^PPAP-\d{4}-0006$/),
        }),
      });
    });

    it('should return 400 for missing partNumber', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({
          partName: 'Brake Pad Assembly',
          customer: 'AutoMotive Corp',
          // missing partNumber
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.fields).toBeDefined();
    });

    it('should return 400 for missing partName', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'BP-2026-100',
          customer: 'AutoMotive Corp',
          // missing partName
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing customer', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({
          partNumber: 'BP-2026-100',
          partName: 'Brake Pad Assembly',
          // missing customer
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty partNumber', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, partNumber: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid submissionLevel (0)', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, submissionLevel: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid submissionLevel (6)', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({ ...validCreatePayload, submissionLevel: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for completely empty body', async () => {
      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors during creation', async () => {
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('Transaction failed'));

      const response = await request(app)
        .post('/api/ppap')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create PPAP project');
    });
  });

  // ==========================================
  // GET / - List PPAP Projects
  // ==========================================
  describe('GET /api/ppap', () => {
    it('should return a list of projects with default pagination', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([
        mockProject,
        mockProject2,
      ]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/ppap').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support custom pagination parameters', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/ppap?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.total).toBe(50);
      expect(response.body.meta.totalPages).toBe(5);

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 20,
          take: 10,
        })
      );
    });

    it('should cap the limit at 100', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/ppap?limit=500')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.limit).toBe(100);
      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          take: 100,
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject2]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/ppap?status=SUBMITTED').set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'SUBMITTED',
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by customer (case-insensitive contains)', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/ppap?customer=automotive').set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            customer: { contains: 'automotive', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should filter by partNumber (case-insensitive contains)', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/ppap?partNumber=BP-2026').set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            partNumber: { contains: 'BP-2026', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should combine multiple filters', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/ppap?status=DRAFT&customer=automotive&partNumber=BP')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'DRAFT',
            customer: { contains: 'automotive', mode: 'insensitive' },
            partNumber: { contains: 'BP', mode: 'insensitive' },
            deletedAt: null,
          }),
        })
      );
    });

    it('should default page to 1 when invalid', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/ppap?page=abc')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(1);
    });

    it('should order by updatedAt desc then createdAt desc', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/ppap').set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
        })
      );
    });

    it('should return empty data array when no projects exist', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ppapProject.count as jest.Mock).mockResolvedValueOnce(0);

      const response = await request(app).get('/api/ppap').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
      expect(response.body.meta.totalPages).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app).get('/api/ppap').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to list PPAP projects');
    });
  });

  // ==========================================
  // GET /:id - Get PPAP Project with Details
  // ==========================================
  describe('GET /api/ppap/:id', () => {
    it('should return a project with elements and submissions', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(
        mockProjectWithDetails
      );

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockProject.id);
      expect(response.body.data.elements).toBeDefined();
      expect(response.body.data.elements).toHaveLength(18);
      expect(response.body.data.submissions).toBeDefined();
      expect(response.body.data.submissions).toHaveLength(1);

      expect(mockPrisma.ppapProject.findUnique).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        include: {
          elements: { orderBy: { elementNumber: 'asc' } },
          submissions: { orderBy: { createdAt: 'desc' } },
        },
      });
    });

    it('should return 404 when project is not found', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/ppap/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to get PPAP project');
    });
  });

  // ==========================================
  // PUT /:id/elements/:elementNumber - Update Element
  // ==========================================
  describe('PUT /api/ppap/:id/elements/:elementNumber', () => {
    it('should update an element status successfully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[3]); // Element 4 (DFMEA)
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[3],
        status: 'IN_PROGRESS',
        notes: 'Working on DFMEA',
      });

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/4`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS', notes: 'Working on DFMEA' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('IN_PROGRESS');
      expect(response.body.data.notes).toBe('Working on DFMEA');
    });

    it('should auto-set completedDate when status becomes COMPLETED', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[3]);
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[3],
        status: 'COMPLETED',
        completedDate: new Date(),
      });

      await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/4`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(mockPrisma.ppapElement.update).toHaveBeenCalledWith({
        where: { id: mockElements[3].id },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedDate: expect.any(Date),
        }),
      });
    });

    it('should not set completedDate when status is not COMPLETED', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[3]);
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[3],
        status: 'IN_PROGRESS',
      });

      await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/4`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(mockPrisma.ppapElement.update).toHaveBeenCalledWith({
        where: { id: mockElements[3].id },
        data: {
          status: 'IN_PROGRESS',
        },
      });
    });

    it('should update documentRef and reviewedBy fields', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[0]);
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[0],
        documentRef: 'DOC-001-REV-A',
        reviewedBy: 'John Smith',
      });

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/1`)
        .set('Authorization', 'Bearer token')
        .send({ documentRef: 'DOC-001-REV-A', reviewedBy: 'John Smith' });

      expect(response.status).toBe(200);
      expect(mockPrisma.ppapElement.update).toHaveBeenCalledWith({
        where: { id: mockElements[0].id },
        data: {
          documentRef: 'DOC-001-REV-A',
          reviewedBy: 'John Smith',
        },
      });
    });

    it('should update element to NOT_APPLICABLE status', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[12]); // Element 13 (AAR)
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[12],
        status: 'NOT_APPLICABLE',
      });

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/13`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'NOT_APPLICABLE' });

      expect(response.status).toBe(200);
      expect(mockPrisma.ppapElement.update).toHaveBeenCalledWith({
        where: { id: mockElements[12].id },
        data: {
          status: 'NOT_APPLICABLE',
        },
      });
    });

    it('should return 400 for element number 0', async () => {
      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/0`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Element number must be between 1 and 18');
    });

    it('should return 400 for element number 19', async () => {
      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/19`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Element number must be between 1 and 18');
    });

    it('should return 400 for non-numeric element number', async () => {
      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/abc`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('Element number must be between 1 and 18');
    });

    it('should return 404 when project does not exist', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/ppap/00000000-0000-4000-a000-ffffffffffff/elements/1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 404 when project is soft-deleted', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/1`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 404 when element is not found', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/5`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP element not found');
    });

    it('should look up element by projectId and elementNumber', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[6]); // Element 7
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[6],
        status: 'IN_PROGRESS',
      });

      await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/7`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(mockPrisma.ppapElement.findFirst).toHaveBeenCalledWith({
        where: { projectId: mockProject.id, elementNumber: 7 },
      });
    });

    it('should return 400 for invalid status enum value', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/1`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept REJECTED status', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapElement.findFirst as jest.Mock).mockResolvedValueOnce(mockElements[0]);
      (mockPrisma.ppapElement.update as jest.Mock).mockResolvedValueOnce({
        ...mockElements[0],
        status: 'REJECTED',
      });

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/1`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'REJECTED' });

      expect(response.status).toBe(200);
      expect(mockPrisma.ppapElement.update).toHaveBeenCalledWith({
        where: { id: mockElements[0].id },
        data: { status: 'REJECTED' },
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put(`/api/ppap/${mockProject.id}/elements/1`)
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to update PPAP element');
    });
  });

  // ==========================================
  // POST /:id/psw - Submit Part Submission Warrant
  // ==========================================
  describe('POST /api/ppap/:id/psw', () => {
    it('should create a PSW submission successfully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapSubmission.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.ppapSubmission.create as jest.Mock).mockResolvedValueOnce(mockSubmission);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        status: 'SUBMITTED',
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({ customerNotes: 'Initial submission for review' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();

      // Verify submission was created with correct data
      expect(mockPrisma.ppapSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: mockProject.id,
          pswNumber: expect.stringMatching(/^PSW-\d{4}-\d{4}$/),
          submissionLevel: 3, // from project.submissionLevel
          customerNotes: 'Initial submission for review',
          submittedBy: 'user-1',
          submittedDate: expect.any(Date),
          status: 'SUBMITTED',
        }),
      });

      // Verify project status was updated to SUBMITTED
      expect(mockPrisma.ppapProject.update).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        data: { status: 'SUBMITTED' },
      });
    });

    it('should use custom submissionLevel when provided', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapSubmission.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.ppapSubmission.create as jest.Mock).mockResolvedValueOnce({
        ...mockSubmission,
        submissionLevel: 5,
      });
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({ submissionLevel: 5, customerNotes: 'Level 5 submission' });

      expect(response.status).toBe(201);
      expect(mockPrisma.ppapSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionLevel: 5,
        }),
      });
    });

    it('should fall back to project submissionLevel when not provided', async () => {
      const projectWithLevel2 = { ...mockProject, submissionLevel: 2 };
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectWithLevel2);
      (mockPrisma.ppapSubmission.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.ppapSubmission.create as jest.Mock).mockResolvedValueOnce({
        ...mockSubmission,
        submissionLevel: 2,
      });
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({});

      await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(mockPrisma.ppapSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          submissionLevel: 2,
        }),
      });
    });

    it('should generate a unique PSW number', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapSubmission.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.ppapSubmission.create as jest.Mock).mockResolvedValueOnce(mockSubmission);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({});

      await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(mockPrisma.ppapSubmission.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          pswNumber: expect.stringMatching(/^PSW-\d{4}-0004$/),
        }),
      });
    });

    it('should accept empty body (all PSW fields are optional)', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapSubmission.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.ppapSubmission.create as jest.Mock).mockResolvedValueOnce(mockSubmission);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(201);
    });

    it('should return 404 when project does not exist', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/ppap/00000000-0000-4000-a000-ffffffffffff/psw')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 404 when project is soft-deleted', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 400 for invalid submissionLevel (0)', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({ submissionLevel: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid submissionLevel (6)', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({ submissionLevel: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/psw`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to submit PSW');
    });
  });

  // ==========================================
  // GET /:id/readiness - PPAP Readiness Check
  // ==========================================
  describe('GET /api/ppap/:id/readiness', () => {
    it('should return readiness data with correct completion counts', async () => {
      // mockElements has: 2 COMPLETED, 1 IN_PROGRESS, 1 NOT_APPLICABLE, 14 NOT_STARTED
      const projectWithElements = {
        ...mockProject,
        elements: mockElements,
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectWithElements);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const data = response.body.data;
      expect(data.totalElements).toBe(18);
      expect(data.completed).toBe(2); // Elements 1 and 2 are COMPLETED
      expect(data.notApplicable).toBe(1); // Element 5 is NOT_APPLICABLE
      expect(data.ready).toBe(3); // 2 COMPLETED + 1 NOT_APPLICABLE
      expect(data.percentage).toBe(17); // Math.round(3/18 * 100) = 17
      expect(data.missingElements).toHaveLength(15); // 18 - 3 = 15 missing
    });

    it('should list missing elements with number and name', async () => {
      const projectWithElements = {
        ...mockProject,
        elements: mockElements,
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectWithElements);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      const missing = response.body.data.missingElements;
      // Element 3 (IN_PROGRESS) should be in missing list
      expect(missing).toContain('3. Customer Engineering Approval');
      // Element 4 (NOT_STARTED) should be in missing list
      expect(missing).toContain('4. DFMEA');
      // Element 1 (COMPLETED) should NOT be in missing list
      expect(missing).not.toContain('1. Design Records');
      // Element 5 (NOT_APPLICABLE) should NOT be in missing list
      expect(missing).not.toContain('5. Process Flow Diagram');
    });

    it('should return 100% when all elements are completed', async () => {
      const allCompleted = mockElements.map((e) => ({ ...e, status: 'COMPLETED' }));
      const projectAllDone = {
        ...mockProject,
        elements: allCompleted,
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectAllDone);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.percentage).toBe(100);
      expect(response.body.data.completed).toBe(18);
      expect(response.body.data.ready).toBe(18);
      expect(response.body.data.missingElements).toHaveLength(0);
    });

    it('should treat NOT_APPLICABLE as ready', async () => {
      const allNA = mockElements.map((e) => ({ ...e, status: 'NOT_APPLICABLE' }));
      const projectAllNA = {
        ...mockProject,
        elements: allNA,
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectAllNA);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.percentage).toBe(100);
      expect(response.body.data.completed).toBe(0);
      expect(response.body.data.notApplicable).toBe(18);
      expect(response.body.data.ready).toBe(18);
    });

    it('should return 0% when no elements are completed', async () => {
      const allNotStarted = mockElements.map((e) => ({ ...e, status: 'NOT_STARTED' }));
      const projectNoneStarted = {
        ...mockProject,
        elements: allNotStarted,
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectNoneStarted);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.percentage).toBe(0);
      expect(response.body.data.ready).toBe(0);
      expect(response.body.data.missingElements).toHaveLength(18);
    });

    it('should handle project with no elements (0%)', async () => {
      const projectNoElements = {
        ...mockProject,
        elements: [],
      };

      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(projectNoElements);

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.totalElements).toBe(0);
      expect(response.body.data.percentage).toBe(0);
      expect(response.body.data.missingElements).toHaveLength(0);
    });

    it('should return 404 when project does not exist', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/ppap/00000000-0000-4000-a000-ffffffffffff/readiness')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 404 when project is soft-deleted', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
        elements: [],
      });

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include the elements include clause with proper ordering', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        elements: [],
      });

      await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.ppapProject.findUnique).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        include: {
          elements: { orderBy: { elementNumber: 'asc' } },
        },
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get(`/api/ppap/${mockProject.id}/readiness`)
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to check PPAP readiness');
    });
  });

  // ==========================================
  // POST /:id/submit-level - Set Submission Level
  // ==========================================
  describe('POST /api/ppap/:id/submit-level', () => {
    it('should set submission level successfully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        submissionLevel: 5,
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 5 });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.submissionLevel).toBe(5);

      expect(mockPrisma.ppapProject.update).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        data: { submissionLevel: 5 },
      });
    });

    it('should accept level 1 (minimum)', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        submissionLevel: 1,
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 1 });

      expect(response.status).toBe(200);
      expect(mockPrisma.ppapProject.update).toHaveBeenCalledWith({
        where: { id: mockProject.id },
        data: { submissionLevel: 1 },
      });
    });

    it('should accept level 5 (maximum)', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.ppapProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        submissionLevel: 5,
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 5 });

      expect(response.status).toBe(200);
    });

    it('should return 400 for level 0', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 0 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for level 6', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 6 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for non-integer level', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 2.5 });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing level field', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for string level', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 'three' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when project does not exist', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/ppap/00000000-0000-4000-a000-ffffffffffff/submit-level')
        .set('Authorization', 'Bearer token')
        .send({ level: 3 });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('PPAP project not found');
    });

    it('should return 404 when project is soft-deleted', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 3 });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.ppapProject.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post(`/api/ppap/${mockProject.id}/submit-level`)
        .set('Authorization', 'Bearer token')
        .send({ level: 3 });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to set submission level');
    });
  });
});
