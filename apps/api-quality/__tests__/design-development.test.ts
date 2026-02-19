import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    qualDesignProject: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    qualDesignStageDoc: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    DesignDevelopmentWhereInput: {},
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
  validateIdParam: () => (_req: any, _res: any, next: any, _val: any) => next(),
}));

import { prisma } from '../src/prisma';
import designDevelopmentRouter from '../src/routes/design-development';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockProject = {
  id: '20000000-0000-4000-a000-000000000001',
  refNumber: 'DD-2602-0001',
  title: 'Widget Redesign v3',
  description: 'Complete redesign of widget product line',
  productName: 'Widget Pro',
  projectManager: 'user-2',
  priority: 'HIGH',
  status: 'ACTIVE',
  currentStage: 'PLANNING',
  plannedStartDate: new Date('2026-03-01'),
  plannedEndDate: new Date('2026-09-01'),
  requirements: 'Must meet ISO 9001 clause 8.3 requirements',
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  completedAt: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockProject2 = {
  id: '20000000-0000-4000-a000-000000000002',
  refNumber: 'DD-2602-0002',
  title: 'Sensor Module Development',
  description: 'New sensor module for IoT platform',
  productName: 'IoT Sensor v1',
  projectManager: 'user-3',
  priority: 'MEDIUM',
  status: 'DRAFT',
  currentStage: 'INPUTS',
  plannedStartDate: null,
  plannedEndDate: null,
  requirements: null,
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  completedAt: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-05'),
};

const mockStage = {
  id: 'stage-001',
  projectId: '20000000-0000-4000-a000-000000000001',
  stage: 'PLANNING',
  status: 'IN_PROGRESS',
  deliverables: null,
  notes: null,
  attachments: null,
  submittedBy: null,
  submittedAt: null,
  approvedBy: null,
  approvedAt: null,
  approvalNotes: null,
  createdBy: 'user-1',
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockStageSubmitted = {
  ...mockStage,
  id: 'stage-002',
  status: 'SUBMITTED',
  deliverables: 'Design plan document v1',
  submittedBy: 'user-1',
  submittedAt: new Date('2026-02-10'),
};

const validCreatePayload = {
  title: 'Widget Redesign v3',
  description: 'Complete redesign of widget product line',
  productName: 'Widget Pro',
  projectManager: 'user-2',
  priority: 'HIGH',
  plannedStartDate: '2026-03-01',
  plannedEndDate: '2026-09-01',
  requirements: 'Must meet ISO 9001 clause 8.3 requirements',
};

// ==========================================
// Tests
// ==========================================

describe('Quality Design & Development API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/design-development', designDevelopmentRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / — Create design project
  // ==========================================
  describe('POST /api/design-development', () => {
    it('should create a design project successfully', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.$transaction as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Widget Redesign v3');
      expect(response.body.data.productName).toBe('Widget Pro');
      expect(response.body.data.status).toBe('ACTIVE');
    });

    it('should create a project with only required fields', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.$transaction as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        refNumber: 'DD-2602-0002',
        description: undefined,
        projectManager: undefined,
      });

      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Minimal Project', productName: 'Product A' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send({ productName: 'Widget Pro' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when productName is missing', async () => {
      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Widget Redesign' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when title is empty string', async () => {
      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send({ title: '', productName: 'Widget Pro' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.$transaction as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/design-development')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create design project');
    });
  });

  // ==========================================
  // GET / — List design projects
  // ==========================================
  describe('GET /api/design-development', () => {
    it('should return a list of projects with default pagination', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValueOnce([
        mockProject,
        mockProject2,
      ]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/design-development')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support custom pagination', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(30);

      const response = await request(app)
        .get('/api/design-development?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(3);

      expect(mockPrisma.qualDesignProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 10, take: 10 })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValueOnce([mockProject]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/design-development?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDesignProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACTIVE', deletedAt: null }),
        })
      );
    });

    it('should filter by stage', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualDesignProject.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/design-development?stage=PLANNING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualDesignProject.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ currentStage: 'PLANNING' }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/design-development')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /:id — Get project with stages
  // ==========================================
  describe('GET /api/design-development/:id', () => {
    it('should return a project with stages', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findMany as jest.Mock).mockResolvedValueOnce([mockStage]);

      const response = await request(app)
        .get('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Widget Redesign v3');
      expect(response.body.data.stages).toHaveLength(1);
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/design-development/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id — Update project
  // ==========================================
  describe('PUT /api/design-development/:id', () => {
    it('should update a project successfully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        title: 'Updated Title',
        priority: 'CRITICAL',
      });

      const response = await request(app)
        .put('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title', priority: 'CRITICAL' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should update status to ON_HOLD', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        status: 'ON_HOLD',
      });

      const response = await request(app)
        .put('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'ON_HOLD' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('ON_HOLD');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/design-development/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid priority', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);

      const response = await request(app)
        .put('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ priority: 'EXTREME' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/stages/:stage/submit — Submit stage
  // ==========================================
  describe('POST /api/design-development/:id/stages/:stage/submit', () => {
    it('should submit a stage for review', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValueOnce(mockStage);
      (mockPrisma.qualDesignStageDoc.update as jest.Mock).mockResolvedValueOnce({
        ...mockStage,
        status: 'SUBMITTED',
        deliverables: 'Design plan v1',
        submittedBy: 'user-1',
        submittedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/submit')
        .set('Authorization', 'Bearer token')
        .send({ deliverables: 'Design plan v1', notes: 'Ready for review' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SUBMITTED');
    });

    it('should return 400 for invalid stage name', async () => {
      const response = await request(app)
        .post(
          '/api/design-development/20000000-0000-4000-a000-000000000001/stages/INVALID_STAGE/submit'
        )
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STAGE');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/design-development/00000000-0000-4000-a000-ffffffffffff/stages/PLANNING/submit')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when stage is already approved', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValueOnce({
        ...mockStage,
        status: 'APPROVED',
      });

      const response = await request(app)
        .post('/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/submit')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('ALREADY_APPROVED');
    });

    it('should return 404 when stage record not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/submit')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/submit')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/stages/:stage/approve — Approve stage gate
  // ==========================================
  describe('POST /api/design-development/:id/stages/:stage/approve', () => {
    it('should approve a submitted stage', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValueOnce(mockStageSubmitted);
      (mockPrisma.$transaction as jest.Mock).mockResolvedValueOnce({
        ...mockStageSubmitted,
        status: 'APPROVED',
        approvedBy: 'user-1',
        approvedAt: new Date(),
      });

      const response = await request(app)
        .post(
          '/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/approve'
        )
        .set('Authorization', 'Bearer token')
        .send({ approvalNotes: 'Looks good' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('APPROVED');
    });

    it('should return 400 for invalid stage name', async () => {
      const response = await request(app)
        .post(
          '/api/design-development/20000000-0000-4000-a000-000000000001/stages/00000000-0000-0000-0000-000000000099/approve'
        )
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_STAGE');
    });

    it('should return 400 when stage is not submitted', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignStageDoc.findFirst as jest.Mock).mockResolvedValueOnce(mockStage); // IN_PROGRESS

      const response = await request(app)
        .post(
          '/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/approve'
        )
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('NOT_SUBMITTED');
    });

    it('should return 404 when project not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post(
          '/api/design-development/00000000-0000-4000-a000-ffffffffffff/stages/PLANNING/approve'
        )
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post(
          '/api/design-development/20000000-0000-4000-a000-000000000001/stages/PLANNING/approve'
        )
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // DELETE /:id — Soft delete
  // ==========================================
  describe('DELETE /api/design-development/:id', () => {
    it('should soft-delete a project', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(mockProject);
      (mockPrisma.qualDesignProject.update as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
        deletedBy: 'user-1',
      });

      const response = await request(app)
        .delete('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Design project deleted');

      expect(mockPrisma.qualDesignProject.update).toHaveBeenCalledWith({
        where: { id: '20000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          deletedAt: expect.any(Date),
          deletedBy: 'user-1',
        }),
      });
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/design-development/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when already deleted', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockProject,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.qualDesignProject.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/design-development/20000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
