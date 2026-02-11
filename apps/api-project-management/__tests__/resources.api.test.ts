import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectResource: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '../src/prisma';
import resourcesRoutes from '../src/routes/resources';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Resources API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/resources', resourcesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockResource = {
    id: 'resource-1',
    projectId: 'project-1',
    resourceType: 'HUMAN',
    resourceName: 'John Doe',
    resourceRole: 'Engineer',
    responsibility: 'RESPONSIBLE',
    allocationPercentage: 100,
    allocatedFrom: new Date('2025-01-01'),
    allocatedTo: new Date('2025-06-30'),
    actualHours: 80,
    plannedHours: 160,
    utilization: 50,
    status: 'ASSIGNED',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('GET /api/resources', () => {
    it('should return list of resources for a given projectId', async () => {
      (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([mockResource]);
      (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/resources?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('resource-1');
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      });
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .get('/api/resources')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('projectId query parameter is required');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/resources?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/resources', () => {
    const createPayload = {
      projectId: 'project-1',
      resourceType: 'HUMAN',
      resourceName: 'Jane Smith',
      allocatedFrom: '2025-01-01',
      allocatedTo: '2025-06-30',
    };

    it('should create a resource successfully', async () => {
      const createdResource = {
        id: 'resource-2',
        ...createPayload,
        responsibility: 'RESPONSIBLE',
        allocationPercentage: 100,
        status: 'ASSIGNED',
        allocatedFrom: new Date('2025-01-01'),
        allocatedTo: new Date('2025-06-30'),
      };

      (mockPrisma.projectResource.create as jest.Mock).mockResolvedValueOnce(createdResource);

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('resource-2');
      expect(response.body.data.resourceName).toBe('Jane Smith');
      expect(mockPrisma.projectResource.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          projectId: 'project-1',
          resourceType: 'HUMAN',
          resourceName: 'Jane Smith',
          responsibility: 'RESPONSIBLE',
          allocationPercentage: 100,
          status: 'ASSIGNED',
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'project-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid resourceType enum', async () => {
      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          resourceType: 'INVALID_TYPE',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/resources')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/resources/:id', () => {
    it('should update a resource successfully', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
      (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({
        ...mockResource,
        resourceName: 'Updated Name',
      });

      const response = await request(app)
        .put('/api/resources/resource-1')
        .set('Authorization', 'Bearer token')
        .send({ resourceName: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resourceName).toBe('Updated Name');
    });

    it('should return 404 when resource does not exist', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/resources/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ resourceName: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-calculate utilization when actualHours changes', async () => {
      const existingResource = { ...mockResource, actualHours: 80, plannedHours: 160 };
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(existingResource);
      (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        actualHours: 120,
        utilization: 75,
      });

      const response = await request(app)
        .put('/api/resources/resource-1')
        .set('Authorization', 'Bearer token')
        .send({ actualHours: 120 });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
        where: { id: 'resource-1' },
        data: expect.objectContaining({
          utilization: 75,
        }),
      });
    });

    it('should auto-calculate utilization when plannedHours changes', async () => {
      const existingResource = { ...mockResource, actualHours: 80, plannedHours: 160 };
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(existingResource);
      (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({
        ...existingResource,
        plannedHours: 200,
        utilization: 40,
      });

      const response = await request(app)
        .put('/api/resources/resource-1')
        .set('Authorization', 'Bearer token')
        .send({ plannedHours: 200 });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
        where: { id: 'resource-1' },
        data: expect.objectContaining({
          utilization: 40,
        }),
      });
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/resources/resource-1')
        .set('Authorization', 'Bearer token')
        .send({ resourceName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/resources/:id', () => {
    it('should delete a resource successfully', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
      (mockPrisma.projectResource.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/resources/resource-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectResource.delete).toHaveBeenCalledWith({
        where: { id: 'resource-1' },
      });
    });

    it('should return 404 when resource does not exist', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/resources/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/resources/resource-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
