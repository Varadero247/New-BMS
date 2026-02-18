import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envObjective: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    envMilestone: {
      findUnique: jest.fn(),
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import objectivesRoutes from '../src/routes/objectives';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Objectives API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/objectives', objectivesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/objectives', () => {
    const mockObjectives = [
      {
        id: '15000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-OBJ-2026-001',
        title: 'Reduce carbon emissions',
        objectiveStatement: 'Achieve 30% reduction in CO2 by 2027',
        category: 'EMISSIONS',
        status: 'IN_PROGRESS',
        owner: 'John Smith',
        milestones: [{ id: '1b000000-0000-4000-a000-000000000001', title: 'Phase 1', completed: false }],
      },
      {
        id: '15000000-0000-4000-a000-000000000002',
        referenceNumber: 'ENV-OBJ-2026-002',
        title: 'Waste reduction',
        objectiveStatement: 'Reduce waste to landfill by 50%',
        category: 'WASTE',
        status: 'NOT_STARTED',
        owner: 'Jane Doe',
        milestones: [],
      },
    ];

    it('should return list of objectives with pagination and milestones', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce(mockObjectives);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].milestones).toBeDefined();
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should include milestones in findMany query', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { milestones: true },
        })
      );
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce([mockObjectives[0]]);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/objectives?page=5&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(5);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by status', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?status=IN_PROGRESS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'IN_PROGRESS',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?category=EMISSIONS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'EMISSIONS',
          }),
        })
      );
    });

    it('should support search across title, objectiveStatement, referenceNumber, owner', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?search=carbon')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'carbon', mode: 'insensitive' } },
              { objectiveStatement: { contains: 'carbon', mode: 'insensitive' } },
              { referenceNumber: { contains: 'carbon', mode: 'insensitive' } },
              { owner: { contains: 'carbon', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockResolvedValueOnce(mockObjectives);
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envObjective.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/objectives/:id', () => {
    const mockObjective = {
      id: '15000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-OBJ-2026-001',
      title: 'Reduce carbon emissions',
      objectiveStatement: 'Achieve 30% reduction',
      milestones: [{ id: '1b000000-0000-4000-a000-000000000001', title: 'Phase 1' }],
    };

    it('should return single objective with milestones', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(mockObjective);

      const response = await request(app)
        .get('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('15000000-0000-4000-a000-000000000001');
      expect(response.body.data.milestones).toBeDefined();
    });

    it('should include milestones in findUnique query', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(mockObjective);

      await request(app)
        .get('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envObjective.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { milestones: true },
        })
      );
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/objectives', () => {
    const createPayload = {
      title: 'Reduce carbon emissions by 30%',
      objectiveStatement: 'Achieve a 30% reduction in CO2 emissions by end of 2027',
      category: 'EMISSIONS',
      targetDate: '2027-12-31',
      owner: 'John Smith',
    };

    it('should create an objective successfully', async () => {
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envObjective.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-OBJ-2026-001',
        ...createPayload,
        status: 'NOT_STARTED',
        milestones: [],
      });

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should create objective with milestones', async () => {
      const payloadWithMilestones = {
        ...createPayload,
        milestones: [
          { title: 'Phase 1 Complete', dueDate: '2026-06-30' },
          { title: 'Phase 2 Complete', dueDate: '2027-06-30' },
        ],
      };

      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envObjective.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-OBJ-2026-001',
        ...createPayload,
        milestones: [
          { id: '1b000000-0000-4000-a000-000000000001', title: 'Phase 1 Complete', sortOrder: 0 },
          { id: 'ms-2', title: 'Phase 2 Complete', sortOrder: 1 },
        ],
      });

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(payloadWithMilestones);

      expect(response.status).toBe(201);
      expect(mockPrisma.envObjective.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            milestones: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ title: 'Phase 1 Complete', sortOrder: 0 }),
                expect.objectContaining({ title: 'Phase 2 Complete', sortOrder: 1 }),
              ]),
            }),
          }),
          include: { milestones: true },
        })
      );
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ objectiveStatement: 'Statement', category: 'EMISSIONS', targetDate: '2027-12-31', owner: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing objectiveStatement', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Title', category: 'EMISSIONS', targetDate: '2027-12-31', owner: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Title', objectiveStatement: 'Statement', targetDate: '2027-12-31', owner: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing targetDate', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Title', objectiveStatement: 'Statement', category: 'EMISSIONS', owner: 'John' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envObjective.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envObjective.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/objectives/:id', () => {
    const existingObjective = {
      id: '15000000-0000-4000-a000-000000000001',
      title: 'Reduce carbon emissions',
      objectiveStatement: 'Achieve 30% reduction',
      category: 'EMISSIONS',
      status: 'NOT_STARTED',
    };

    it('should update objective successfully', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);
      (mockPrisma.envObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existingObjective,
        status: 'IN_PROGRESS',
        milestones: [],
      });

      const response = await request(app)
        .put('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should include milestones in update response', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);
      (mockPrisma.envObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existingObjective,
        milestones: [],
      });

      await request(app)
        .put('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated title' });

      expect(mockPrisma.envObjective.update).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { milestones: true },
        })
      );
    });

    it('should strip milestones from update data', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(existingObjective);
      (mockPrisma.envObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existingObjective,
        milestones: [],
      });

      await request(app)
        .put('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated', milestones: [{ title: 'New MS', dueDate: '2027-01-01' }] });

      const callData = (mockPrisma.envObjective.update as jest.Mock).mock.calls[0][0].data;
      expect(callData.milestones).toBeUndefined();
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/objectives/:id', () => {
    it('should delete objective successfully', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: '15000000-0000-4000-a000-000000000001' });
      (mockPrisma.envObjective.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envObjective.update).toHaveBeenCalledWith({
        where: { id: '15000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date), updatedBy: '20000000-0000-4000-a000-000000000123' },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
