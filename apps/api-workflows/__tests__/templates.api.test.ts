import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    workflowTemplate: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
  metricsMiddleware: () => (req: any, res: any, next: any) => next(),
  metricsHandler: (req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (req: any, res: any, next: any) => next(),
  createHealthCheck: () => (req: any, res: any) => res.json({ status: 'healthy' }),
}));

import { prisma } from '../src/prisma';
import templatesRoutes from '../src/routes/templates';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Workflows Templates API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/templates', templatesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/templates', () => {
    const mockTemplates = [
      {
        id: '41000000-0000-4000-a000-000000000001',
        code: 'ONBOARDING',
        name: 'Employee Onboarding',
        category: 'ONBOARDING',
        isActive: true,
      },
      {
        id: 'tmpl-2',
        code: 'PURCHASE_APPROVAL',
        name: 'Purchase Approval',
        category: 'PROCUREMENT',
        isActive: true,
      },
    ];

    it('should return list of workflow templates', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce(mockTemplates);

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should filter by category', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?category=ONBOARDING');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'ONBOARDING',
          }),
        })
      );
    });

    it('should filter by industryType', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?industryType=MANUFACTURING');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            industryType: 'MANUFACTURING',
          }),
        })
      );
    });

    it('should filter by isActive', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates?isActive=true');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        })
      );
    });

    it('should order by name asc', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/templates');

      expect(mockPrisma.workflowTemplate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { name: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/templates');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/templates/categories/list', () => {
    it('should return template categories', async () => {
      (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockResolvedValueOnce([
        { category: 'ONBOARDING', _count: 5 },
        { category: 'PROCUREMENT', _count: 3 },
      ]);

      const response = await request(app).get('/api/templates/categories/list');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.groupBy as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/templates/categories/list');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/templates/:id', () => {
    const mockTemplate = {
      id: '41000000-0000-4000-a000-000000000001',
      code: 'ONBOARDING',
      name: 'Employee Onboarding',
      category: 'ONBOARDING',
    };

    it('should return single template', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce(mockTemplate);

      const response = await request(app).get('/api/templates/41000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('41000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff template', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get('/api/templates/00000000-0000-4000-a000-ffffffffffff');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/templates/41000000-0000-4000-a000-000000000001');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/templates', () => {
    const createPayload = {
      code: 'NEW_TEMPLATE',
      name: 'New Template',
      category: 'APPROVAL' as const,
      definitionTemplate: { steps: [], rules: {} },
    };

    it('should create a template successfully', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        isActive: true,
      });

      const response = await request(app)
        .post('/api/templates')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('New Template');
    });

    it('should return 400 for missing code', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ name: 'No Code', category: 'APPROVAL', definitionTemplate: {} });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ code: 'CODE', category: 'APPROVAL', definitionTemplate: {} });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/templates')
        .send({ ...createPayload, category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional fields', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        industryType: 'MANUFACTURING',
      });

      const response = await request(app)
        .post('/api/templates')
        .send({
          ...createPayload,
          industryType: 'MANUFACTURING',
        });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/templates')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template successfully', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        name: 'Updated Template',
      });

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated Template' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 for invalid category on update', async () => {
      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ category: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should allow updating isActive', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        isActive: false,
      });

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ isActive: false });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001')
        .send({ name: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/templates/:id/publish', () => {
    it('should publish template successfully', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockResolvedValueOnce({
        id: '41000000-0000-4000-a000-000000000001',
        isActive: true,
      });

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001/publish');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.workflowTemplate.update).toHaveBeenCalledWith({
        where: { id: '41000000-0000-4000-a000-000000000001' },
        data: {
          isActive: true,
        },
      });
    });

    it('should handle database errors', async () => {
      (mockPrisma.workflowTemplate.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/templates/41000000-0000-4000-a000-000000000001/publish');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
