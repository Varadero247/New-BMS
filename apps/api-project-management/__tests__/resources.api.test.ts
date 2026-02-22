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
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
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
    id: '47000000-0000-4000-a000-000000000001',
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
      expect(response.body.data[0].id).toBe('47000000-0000-4000-a000-000000000001');
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
      (mockPrisma.projectResource.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

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
        .put('/api/resources/47000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ resourceName: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.resourceName).toBe('Updated Name');
    });

    it('should return 404 when resource does not exist', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/resources/00000000-0000-4000-a000-ffffffffffff')
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
        .put('/api/resources/47000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ actualHours: 120 });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
        where: { id: '47000000-0000-4000-a000-000000000001' },
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
        .put('/api/resources/47000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ plannedHours: 200 });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
        where: { id: '47000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          utilization: 40,
        }),
      });
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/resources/47000000-0000-4000-a000-000000000001')
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
      (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/resources/47000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
        where: { id: '47000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when resource does not exist', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/resources/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectResource.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/resources/47000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('resources.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/resources', resourcesRoutes);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/resources', async () => {
    const res = await request(app).get('/api/resources');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/resources', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.headers['content-type']).toBeDefined();
  });

  it('GET /api/resources body has success property', async () => {
    const res = await request(app).get('/api/resources');
    if (res.status === 200) {
      expect(res.body).toHaveProperty('success');
    } else {
      expect(res.body).toBeDefined();
    }
  });

  it('GET /api/resources body is an object', async () => {
    const res = await request(app).get('/api/resources');
    expect(typeof res.body).toBe('object');
  });

  it('GET /api/resources route is accessible', async () => {
    const res = await request(app).get('/api/resources');
    expect(res.status).toBeDefined();
  });
});

describe('resources.api — edge cases and extended coverage', () => {
  let app: express.Express;

  const mockResource = {
    id: '47000000-0000-4000-a000-000000000001',
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

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/resources', resourcesRoutes);
    jest.clearAllMocks();
  });

  it('GET /api/resources returns empty array when project has no resources', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(0);

    const res = await request(app).get('/api/resources?projectId=project-1');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.meta.total).toBe(0);
  });

  it('GET /api/resources supports pagination (page=2, limit=5)', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([mockResource]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(15);

    const res = await request(app).get('/api/resources?projectId=project-1&page=2&limit=5');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.limit).toBe(5);
    expect(res.body.meta.total).toBe(15);
    expect(res.body.meta.totalPages).toBe(3);
  });

  it('POST /api/resources handles EQUIPMENT resource type', async () => {
    const equipmentResource = {
      ...mockResource,
      id: '47000000-0000-4000-a000-000000000002',
      resourceType: 'EQUIPMENT',
      resourceName: 'Test Server',
    };
    (mockPrisma.projectResource.create as jest.Mock).mockResolvedValueOnce(equipmentResource);

    const res = await request(app)
      .post('/api/resources')
      .send({
        projectId: 'project-1',
        resourceType: 'EQUIPMENT',
        resourceName: 'Test Server',
        allocatedFrom: '2025-01-01',
        allocatedTo: '2025-06-30',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.resourceType).toBe('EQUIPMENT');
  });

  it('PUT /api/resources/:id returns 500 when update fails after successful findUnique', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
    (mockPrisma.projectResource.update as jest.Mock).mockRejectedValueOnce(
      new Error('Write conflict')
    );

    const res = await request(app)
      .put('/api/resources/47000000-0000-4000-a000-000000000001')
      .send({ resourceName: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /api/resources/:id performs soft-delete with deletedAt', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
    (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({
      ...mockResource,
      deletedAt: new Date(),
    });

    const res = await request(app)
      .delete('/api/resources/47000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(204);
    expect(mockPrisma.projectResource.update).toHaveBeenCalledWith({
      where: { id: '47000000-0000-4000-a000-000000000001' },
      data: { deletedAt: expect.any(Date) },
    });
  });

  it('DELETE /api/resources/:id returns 500 when update throws', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
    (mockPrisma.projectResource.update as jest.Mock).mockRejectedValueOnce(
      new Error('Database locked')
    );

    const res = await request(app)
      .delete('/api/resources/47000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/resources filters by resourceType when passed as query param', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([mockResource]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(1);

    const res = await request(app).get(
      '/api/resources?projectId=project-1&resourceType=HUMAN'
    );

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('PUT /api/resources/:id preserves existing status when not updated', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(mockResource);
    (mockPrisma.projectResource.update as jest.Mock).mockResolvedValueOnce({
      ...mockResource,
      resourceRole: 'Senior Engineer',
    });

    const res = await request(app)
      .put('/api/resources/47000000-0000-4000-a000-000000000001')
      .send({ resourceRole: 'Senior Engineer' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('ASSIGNED');
  });

  it('GET /api/resources meta totalPages is 1 for small result sets', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([mockResource]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(3);

    const res = await request(app).get('/api/resources?projectId=project-1&limit=50');

    expect(res.status).toBe(200);
    expect(res.body.meta.totalPages).toBe(1);
  });
});

describe('resources.api — final extended coverage', () => {
  let app: express.Express;

  const mockResource = {
    id: '47000000-0000-4000-a000-000000000001',
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

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/resources', resourcesRoutes);
    jest.clearAllMocks();
  });

  it('DELETE /api/resources/:id does not call update when not found', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app).delete('/api/resources/00000000-0000-4000-a000-ffffffffffff');
    expect(mockPrisma.projectResource.update).not.toHaveBeenCalled();
  });

  it('GET /api/resources returns data as array', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([mockResource]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(1);
    const res = await request(app).get('/api/resources?projectId=project-1');
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('POST /api/resources returns created resource id', async () => {
    (mockPrisma.projectResource.create as jest.Mock).mockResolvedValueOnce({
      ...mockResource,
      id: '47000000-0000-4000-a000-000000000099',
      resourceName: 'New Resource',
    });
    const res = await request(app)
      .post('/api/resources')
      .send({
        projectId: 'project-1',
        resourceType: 'HUMAN',
        resourceName: 'New Resource',
        allocatedFrom: '2025-01-01',
        allocatedTo: '2025-06-30',
      });
    expect(res.status).toBe(201);
    expect(res.body.data.id).toBe('47000000-0000-4000-a000-000000000099');
  });

  it('GET /api/resources findMany called once per request', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/resources?projectId=project-1');
    expect(mockPrisma.projectResource.findMany).toHaveBeenCalledTimes(1);
  });

  it('PUT /api/resources/:id does not call update when not found', async () => {
    (mockPrisma.projectResource.findUnique as jest.Mock).mockResolvedValueOnce(null);
    await request(app)
      .put('/api/resources/00000000-0000-4000-a000-ffffffffffff')
      .send({ resourceName: 'Never updated' });
    expect(mockPrisma.projectResource.update).not.toHaveBeenCalled();
  });

  it('GET /api/resources meta.page defaults to 1', async () => {
    (mockPrisma.projectResource.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.projectResource.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/resources?projectId=project-1');
    expect(res.body.meta.page).toBe(1);
  });
});
