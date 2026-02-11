import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
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
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '@ims/database';
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
        id: 'def-1',
        code: 'APPROVAL_FLOW',
        name: 'Approval Workflow',
        status: 'ACTIVE',
        triggerType: 'MANUAL',
        version: 1,
        template: { name: 'Standard Approval', category: 'APPROVAL' },
        _count: { instances: 10 },
      },
      {
        id: 'def-2',
        code: 'ONBOARDING',
        name: 'Employee Onboarding',
        status: 'DRAFT',
        triggerType: 'EVENT',
        version: 2,
        template: null,
        _count: { instances: 0 },
      },
    ];

    it('should return list of workflow definitions', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce(mockDefinitions as any);

      const response = await request(app).get('/api/definitions');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by status', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?status=ACTIVE');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should filter by templateId', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?templateId=tmpl-1');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            templateId: 'tmpl-1',
          }),
        })
      );
    });

    it('should filter by createdBy', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce([]);

      await request(app).get('/api/definitions?createdBy=user-1');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            createdBy: 'user-1',
          }),
        })
      );
    });

    it('should include template and instance count', async () => {
      mockPrisma.workflowDefinition.findMany.mockResolvedValueOnce(mockDefinitions as any);

      await request(app).get('/api/definitions');

      expect(mockPrisma.workflowDefinition.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            template: expect.any(Object),
            _count: expect.any(Object),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/definitions');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/definitions/:id', () => {
    const mockDefinition = {
      id: 'def-1',
      code: 'APPROVAL_FLOW',
      name: 'Approval Workflow',
      nodes: [{ id: 'start', type: 'start' }],
      edges: [],
      template: { name: 'Standard Approval' },
      instances: [{ id: 'inst-1' }],
    };

    it('should return single definition with instances', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(mockDefinition as any);

      const response = await request(app).get('/api/definitions/def-1');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('def-1');
      expect(response.body.data.instances).toHaveLength(1);
    });

    it('should return 404 for non-existent definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app).get('/api/definitions/non-existent');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/definitions/def-1');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/definitions', () => {
    const createPayload = {
      code: 'NEW_WORKFLOW',
      name: 'New Workflow',
      triggerType: 'MANUAL',
      nodes: [{ id: 'start', type: 'start' }],
      edges: [],
    };

    it('should create a workflow definition successfully', async () => {
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: 'new-def-123',
        ...createPayload,
        status: 'DRAFT',
        version: 1,
        template: null,
      } as any);

      const response = await request(app)
        .post('/api/definitions')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.code).toBe('NEW_WORKFLOW');
    });

    it('should set initial status to DRAFT and version to 1', async () => {
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: 'new-def-123',
        status: 'DRAFT',
        version: 1,
      } as any);

      await request(app)
        .post('/api/definitions')
        .send(createPayload);

      expect(mockPrisma.workflowDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
          version: 1,
        }),
        include: expect.any(Object),
      });
    });

    it('should return 400 for missing code', async () => {
      const { code, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/definitions')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const { name, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/definitions')
        .send(payload);

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

    it('should accept optional templateId', async () => {
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: 'new-def-123',
        templateId: '11111111-1111-1111-1111-111111111111',
      } as any);

      const response = await request(app)
        .post('/api/definitions')
        .send({ ...createPayload, templateId: '11111111-1111-1111-1111-111111111111' });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/definitions')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id', () => {
    const existingDefinition = {
      id: 'def-1',
      code: 'APPROVAL_FLOW',
      name: 'Approval Workflow',
      version: 1,
    };

    it('should update definition and increment version', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(existingDefinition as any);
      mockPrisma.workflowDefinition.update.mockResolvedValueOnce({
        ...existingDefinition,
        name: 'Updated Workflow',
        version: 2,
      } as any);

      const response = await request(app)
        .put('/api/definitions/def-1')
        .send({ name: 'Updated Workflow' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: 'def-1' },
        data: expect.objectContaining({
          name: 'Updated Workflow',
          version: 2,
        }),
      });
    });

    it('should return 404 for non-existent definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/definitions/non-existent')
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow updating nodes and edges', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(existingDefinition as any);
      mockPrisma.workflowDefinition.update.mockResolvedValueOnce({} as any);

      await request(app)
        .put('/api/definitions/def-1')
        .send({
          nodes: [{ id: 'new-node' }],
          edges: [{ source: 'a', target: 'b' }],
        });

      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: 'def-1' },
        data: expect.objectContaining({
          nodes: [{ id: 'new-node' }],
          edges: [{ source: 'a', target: 'b' }],
        }),
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/definitions/def-1')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id/activate', () => {
    it('should activate definition and set published version', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce({
        id: 'def-1',
        version: 3,
        status: 'DRAFT',
      } as any);
      mockPrisma.workflowDefinition.update.mockResolvedValueOnce({
        id: 'def-1',
        status: 'ACTIVE',
        publishedVersion: 3,
      } as any);

      const response = await request(app)
        .put('/api/definitions/def-1/activate');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: 'def-1' },
        data: {
          status: 'ACTIVE',
          publishedVersion: 3,
        },
      });
    });

    it('should return 404 for non-existent definition', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/definitions/non-existent/activate');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/definitions/def-1/activate');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/definitions/:id/archive', () => {
    it('should archive definition', async () => {
      mockPrisma.workflowDefinition.update.mockResolvedValueOnce({
        id: 'def-1',
        status: 'ARCHIVED',
      } as any);

      const response = await request(app)
        .put('/api/definitions/def-1/archive');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowDefinition.update).toHaveBeenCalledWith({
        where: { id: 'def-1' },
        data: { status: 'ARCHIVED' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/definitions/def-1/archive');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/definitions/:id/clone', () => {
    const sourceDefinition = {
      id: 'def-1',
      code: 'ORIGINAL',
      name: 'Original Workflow',
      description: 'Description',
      triggerType: 'MANUAL',
      triggerConfig: null,
      nodes: [{ id: 'start' }],
      edges: [],
      variables: null,
      defaultSLA: 24,
      escalationRules: null,
      notificationConfig: null,
      templateId: 'tmpl-1',
    };

    it('should clone definition with new code', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(sourceDefinition as any);
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: 'clone-123',
        code: expect.stringContaining('ORIGINAL-COPY'),
        name: 'Original Workflow (Copy)',
        status: 'DRAFT',
        version: 1,
      } as any);

      const response = await request(app)
        .post('/api/definitions/def-1/clone');

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should set cloned definition to DRAFT with version 1', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(sourceDefinition as any);
      mockPrisma.workflowDefinition.create.mockResolvedValueOnce({
        id: 'clone-123',
        status: 'DRAFT',
        version: 1,
      } as any);

      await request(app).post('/api/definitions/def-1/clone');

      expect(mockPrisma.workflowDefinition.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
          version: 1,
        }),
      });
    });

    it('should return 404 for non-existent source', async () => {
      mockPrisma.workflowDefinition.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/definitions/non-existent/clone');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.workflowDefinition.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/definitions/def-1/clone');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
