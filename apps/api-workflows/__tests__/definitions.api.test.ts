import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    workflowDefinition: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import definitionsRoutes from '../src/routes/definitions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflow Definitions API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/definitions', definitionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/definitions', () => {
    const mockDefinitions = [
      {
        id: '3b000000-0000-4000-a000-000000000001',
        code: 'APPROVAL_FLOW',
        name: 'Approval Workflow',
        status: 'ACTIVE',
        triggerType: 'MANUAL',
        version: 1,
        _count: { instances: 10 },
      },
      {
        id: 'def-2',
        code: 'ONBOARDING',
        name: 'Employee Onboarding',
        status: 'DRAFT',
        triggerType: 'EVENT',
        version: 2,
        _count: { instances: 0 },
      },
    ];

    it('should return list of workflow definitions', async () => {
      (mockPrisma.workflowDefinition.findMany as jest.Mock).mockResolvedValueOnce(mockDefinitions);

      const response = await request(app).get('/api/definitions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      (mockPrisma.workflowDefinition.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?status=ACTIVE');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?category=APPROVAL');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'APPROVAL',
          }),
        })
      );
    });

    it('should filter by createdById', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?createdById=20000000-0000-4000-a000-000000000001');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdById: '20000000-0000-4000-a000-000000000001',
          }),
        })
      );
    });

    it('should include instance count', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce(mockDefinitions);

      await request(app).get('/api/definitions');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            _count: expect.any(Object),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowDefinition.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/definitions');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/definitions/:id', () => {
    const mockDefinition = {
      id: '3b000000-0000-4000-a000-000000000001',
      code: 'APPROVAL_FLOW',
      name: 'Approval Workflow',
      steps: [{ id: 'start', type: 'start' }],
      rules: {},
      instances: [{ id: '3c000000-0000-4000-a000-000000000001' }],
    };

    it('should return single definition with instances', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(mockDefinition);

      const response = await request(app).get(
        '/api/definitions/3b000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('3b000000-0000-4000-a000-000000000001');
      expect(response.body.data.instances).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff definition', async () => {
      (mockPrisma.workflowDefinition.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(
        '/api/definitions/00000000-0000-4000-a000-ffffffffffff'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get(
        '/api/definitions/3b000000-0000-4000-a000-000000000001'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/definitions', () => {
    const createPayload = {
      code: 'NEW_WORKFLOW',
      name: 'New Workflow',
      category: 'APPROVAL',
      triggerType: 'MANUAL',
      steps: [{ id: 'start', type: 'start' }],
    };

    it('should create a workflow definition successfully', async () => {
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        status: 'DRAFT',
        version: 1,
      });

      const response = await request(app).post('/api/definitions').send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('NEW_WORKFLOW');
    });

    it('should set initial status to DRAFT and version to 1', async () => {
      (mockPrisma.workflowDefinition.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        status: 'DRAFT',
        version: 1,
      });

      await request(app).post('/api/definitions').send(createPayload);

      expect(mockPrisma.workflowDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
          version: 1,
        }),
      });
    });

    it('should return 400 for missing code', async () => {
      const { code, ...payload } = createPayload;

      const response = await request(app).post('/api/definitions').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const { name, ...payload } = createPayload;

      const response = await request(app).post('/api/definitions').send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid triggerType', async () => {
      const response = await request(app)
        .post('/api/definitions')
        .send({ ...createPayload, triggerType: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional defaultSlaHours', async () => {
      (mockPrisma.workflowDefinition.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        defaultSlaHours: 24,
      });

      const response = await request(app)
        .post('/api/definitions')
        .send({ ...createPayload, defaultSlaHours: 24 });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowDefinition.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).post('/api/definitions').send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id', () => {
    const existingDefinition = {
      id: '3b000000-0000-4000-a000-000000000001',
      code: 'APPROVAL_FLOW',
      name: 'Approval Workflow',
      version: 1,
    };

    it('should update definition and increment version', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(existingDefinition);
      (mockPrisma.workflowDefinition.update as jest.Mock).mockResolvedValueOnce({
        ...existingDefinition,
        name: 'Updated Workflow',
        version: 2,
      });

      const response = await request(app)
        .put('/api/definitions/3b000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated Workflow' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: '3b000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          name: 'Updated Workflow',
          version: 2,
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff definition', async () => {
      (mockPrisma.workflowDefinition.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/definitions/00000000-0000-4000-a000-ffffffffffff')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow updating steps and rules', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(existingDefinition);
      (mockPrisma.workflowDefinition.update as jest.Mock).mockResolvedValueOnce({});

      await request(app)
        .put('/api/definitions/3b000000-0000-4000-a000-000000000001')
        .send({
          steps: [{ id: 'new-node' }],
          rules: { source: 'a', target: 'b' },
        });

      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: '3b000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          steps: [{ id: 'new-node' }],
          rules: { source: 'a', target: 'b' },
        }),
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowDefinition.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/definitions/3b000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id/activate', () => {
    it('should activate definition and set publishedAt', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: '3b000000-0000-4000-a000-000000000001',
        version: 3,
        status: 'DRAFT',
      });
      (mockPrisma.workflowDefinition.update as jest.Mock).mockResolvedValueOnce({
        id: '3b000000-0000-4000-a000-000000000001',
        status: 'ACTIVE',
        publishedAt: new Date(),
      });

      const response = await request(app).put(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/activate'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: '3b000000-0000-4000-a000-000000000001' },
        data: {
          status: 'ACTIVE',
          publishedAt: expect.any(Date),
        },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff definition', async () => {
      (mockPrisma.workflowDefinition.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).put(
        '/api/definitions/00000000-0000-4000-a000-ffffffffffff/activate'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).put(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/activate'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id/archive', () => {
    it('should archive definition', async () => {
      mockPrisma.workflowDefinition.update.mockResolvedValueOnce({
        id: '3b000000-0000-4000-a000-000000000001',
        status: 'ARCHIVED',
      });

      const response = await request(app).put(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/archive'
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: '3b000000-0000-4000-a000-000000000001' },
        data: { status: 'ARCHIVED' },
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowDefinition.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).put(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/archive'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/definitions/:id/clone', () => {
    const sourceDefinition = {
      id: '3b000000-0000-4000-a000-000000000001',
      code: 'ORIGINAL',
      name: 'Original Workflow',
      description: 'Description',
      category: 'APPROVAL',
      triggerType: 'MANUAL',
      triggerConfig: null,
      steps: [{ id: 'start' }],
      rules: null,
      defaultSlaHours: 24,
      escalationConfig: null,
    };

    it('should clone definition with new code', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(sourceDefinition);
      (mockPrisma.workflowDefinition.create as jest.Mock).mockResolvedValueOnce({
        id: 'clone-123',
        code: expect.stringContaining('ORIGINAL-COPY'),
        name: 'Original Workflow (Copy)',
        status: 'DRAFT',
        version: 1,
      });

      const response = await request(app).post(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/clone'
      );

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should set cloned definition to DRAFT with version 1', async () => {
      (mockPrisma.workflowDefinition.findUnique as jest.Mock).mockResolvedValueOnce(sourceDefinition);
      (mockPrisma.workflowDefinition.create as jest.Mock).mockResolvedValueOnce({
        id: 'clone-123',
        status: 'DRAFT',
        version: 1,
      });

      await request(app).post('/api/definitions/3b000000-0000-4000-a000-000000000001/clone');

      expect(mockPrisma.workflowDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
          version: 1,
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff source', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).post(
        '/api/definitions/00000000-0000-4000-a000-ffffffffffff/clone'
      );

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).post(
        '/api/definitions/3b000000-0000-4000-a000-000000000001/clone'
      );

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
