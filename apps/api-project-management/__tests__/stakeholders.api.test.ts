import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    projectStakeholder: {
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
import stakeholdersRoutes from '../src/routes/stakeholders';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Stakeholders API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/stakeholders', stakeholdersRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockStakeholder = {
    id: 'stakeholder-1',
    projectId: 'project-1',
    stakeholderName: 'Alice Johnson',
    stakeholderRole: 'Project Sponsor',
    stakeholderType: 'SPONSOR',
    powerLevel: 5,
    interestLevel: 5,
    stakeholderCategory: 'MANAGE_CLOSELY',
    status: 'ACTIVE',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('GET /api/stakeholders', () => {
    it('should return list of stakeholders for a given projectId', async () => {
      (mockPrisma.projectStakeholder.findMany as jest.Mock).mockResolvedValueOnce([mockStakeholder]);
      (mockPrisma.projectStakeholder.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/stakeholders?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].id).toBe('stakeholder-1');
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 1,
        totalPages: 1,
      });
    });

    it('should return 400 when projectId is missing', async () => {
      const response = await request(app)
        .get('/api/stakeholders')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.message).toBe('projectId query parameter is required');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectStakeholder.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/stakeholders?projectId=project-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/stakeholders', () => {
    const createPayload = {
      projectId: 'project-1',
      stakeholderName: 'Bob Williams',
      stakeholderRole: 'Department Head',
      stakeholderType: 'INTERNAL',
      powerLevel: 5,
      interestLevel: 5,
    };

    it('should create a stakeholder with MANAGE_CLOSELY category (high power, high interest)', async () => {
      const createdStakeholder = {
        id: 'stakeholder-2',
        ...createPayload,
        stakeholderCategory: 'MANAGE_CLOSELY',
        currentEngagement: 'NEUTRAL',
        desiredEngagement: 'SUPPORTIVE',
        communicationFrequency: 'MONTHLY',
        status: 'ACTIVE',
      };

      (mockPrisma.projectStakeholder.create as jest.Mock).mockResolvedValueOnce(createdStakeholder);

      const response = await request(app)
        .post('/api/stakeholders')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stakeholderCategory).toBe('MANAGE_CLOSELY');
      expect(mockPrisma.projectStakeholder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stakeholderCategory: 'MANAGE_CLOSELY',
        }),
      });
    });

    it('should create a stakeholder with MONITOR category (low power, low interest)', async () => {
      const lowPayload = {
        ...createPayload,
        powerLevel: 2,
        interestLevel: 2,
      };
      const createdStakeholder = {
        id: 'stakeholder-3',
        ...lowPayload,
        stakeholderCategory: 'MONITOR',
        currentEngagement: 'NEUTRAL',
        desiredEngagement: 'SUPPORTIVE',
        communicationFrequency: 'MONTHLY',
        status: 'ACTIVE',
      };

      (mockPrisma.projectStakeholder.create as jest.Mock).mockResolvedValueOnce(createdStakeholder);

      const response = await request(app)
        .post('/api/stakeholders')
        .set('Authorization', 'Bearer token')
        .send(lowPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stakeholderCategory).toBe('MONITOR');
      expect(mockPrisma.projectStakeholder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stakeholderCategory: 'MONITOR',
        }),
      });
    });

    it('should create a stakeholder with KEEP_SATISFIED category (high power, low interest)', async () => {
      const payload = {
        ...createPayload,
        powerLevel: 5,
        interestLevel: 2,
      };
      const createdStakeholder = {
        id: 'stakeholder-4',
        ...payload,
        stakeholderCategory: 'KEEP_SATISFIED',
        status: 'ACTIVE',
      };

      (mockPrisma.projectStakeholder.create as jest.Mock).mockResolvedValueOnce(createdStakeholder);

      const response = await request(app)
        .post('/api/stakeholders')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(201);
      expect(response.body.data.stakeholderCategory).toBe('KEEP_SATISFIED');
      expect(mockPrisma.projectStakeholder.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          stakeholderCategory: 'KEEP_SATISFIED',
        }),
      });
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/stakeholders')
        .set('Authorization', 'Bearer token')
        .send({ projectId: 'project-1' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectStakeholder.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/stakeholders')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/stakeholders/:id', () => {
    it('should update a stakeholder successfully', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockResolvedValueOnce(mockStakeholder);
      (mockPrisma.projectStakeholder.update as jest.Mock).mockResolvedValueOnce({
        ...mockStakeholder,
        stakeholderName: 'Updated Name',
      });

      const response = await request(app)
        .put('/api/stakeholders/stakeholder-1')
        .set('Authorization', 'Bearer token')
        .send({ stakeholderName: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.stakeholderName).toBe('Updated Name');
    });

    it('should return 404 when stakeholder does not exist', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/stakeholders/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ stakeholderName: 'Updated Name' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should recalculate stakeholderCategory when powerLevel changes', async () => {
      const existingStakeholder = {
        ...mockStakeholder,
        powerLevel: 5,
        interestLevel: 5,
        stakeholderCategory: 'MANAGE_CLOSELY',
      };
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockResolvedValueOnce(existingStakeholder);
      (mockPrisma.projectStakeholder.update as jest.Mock).mockResolvedValueOnce({
        ...existingStakeholder,
        powerLevel: 2,
        stakeholderCategory: 'KEEP_INFORMED',
      });

      const response = await request(app)
        .put('/api/stakeholders/stakeholder-1')
        .set('Authorization', 'Bearer token')
        .send({ powerLevel: 2 });

      expect(response.status).toBe(200);
      expect(mockPrisma.projectStakeholder.update).toHaveBeenCalledWith({
        where: { id: 'stakeholder-1' },
        data: expect.objectContaining({
          stakeholderCategory: 'KEEP_INFORMED',
        }),
      });
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/stakeholders/stakeholder-1')
        .set('Authorization', 'Bearer token')
        .send({ stakeholderName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/stakeholders/:id', () => {
    it('should delete a stakeholder successfully', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockResolvedValueOnce(mockStakeholder);
      (mockPrisma.projectStakeholder.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/stakeholders/stakeholder-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.projectStakeholder.delete).toHaveBeenCalledWith({
        where: { id: 'stakeholder-1' },
      });
    });

    it('should return 404 when stakeholder does not exist', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/stakeholders/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors with 500', async () => {
      (mockPrisma.projectStakeholder.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/stakeholders/stakeholder-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
