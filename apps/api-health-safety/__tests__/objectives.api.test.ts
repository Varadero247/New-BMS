import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    ohsObjective: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    objectiveMilestone: {
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-123'),
}));

import { prisma } from '../src/prisma';
import objectivesRoutes from '../src/routes/objectives';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Objectives API', () => {
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
        id: 'obj-1',
        referenceNumber: 'OBJ-001',
        title: 'Reduce incidents by 20%',
        category: 'INCIDENT_REDUCTION',
        status: 'ACTIVE',
        progressPercent: 30,
        milestones: [],
      },
    ];

    it('should return list with milestones included', async () => {
      (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce(mockObjectives);
      (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(mockPrisma.ohsObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { milestones: { orderBy: { sortOrder: 'asc' } } },
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?category=TRAINING')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.ohsObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'TRAINING' }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/objectives?status=ACHIEVED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.ohsObjective.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'ACHIEVED' }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.ohsObjective.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/objectives')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/objectives/:id', () => {
    it('should return single objective with milestones', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'obj-1',
        title: 'Reduce incidents',
        milestones: [{ id: 'ms-1', title: 'Phase 1', completed: false }],
      });

      const response = await request(app)
        .get('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.milestones).toHaveLength(1);
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/objectives', () => {
    const createPayload = {
      title: 'Reduce incidents by 20%',
      category: 'INCIDENT_REDUCTION',
      targetDate: '2026-12-31',
      milestones: [
        { title: 'Baseline assessment', dueDate: '2026-03-31' },
        { title: 'Training rollout', dueDate: '2026-06-30' },
      ],
    };

    it('should create objective with milestones and auto ref#', async () => {
      (mockPrisma.ohsObjective.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.ohsObjective.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'OBJ-001',
        ...createPayload,
        status: 'ACTIVE',
        milestones: [
          { id: 'ms-1', title: 'Baseline assessment', completed: false },
          { id: 'ms-2', title: 'Training rollout', completed: false },
        ],
      });

      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.ohsObjective.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            referenceNumber: 'OBJ-001',
            status: 'ACTIVE',
            milestones: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ title: 'Baseline assessment', sortOrder: 0 }),
                expect.objectContaining({ title: 'Training rollout', sortOrder: 1 }),
              ]),
            }),
          }),
          include: { milestones: { orderBy: { sortOrder: 'asc' } } },
        })
      );
    });

    it('should increment ref# from last record', async () => {
      (mockPrisma.ohsObjective.findFirst as jest.Mock).mockResolvedValueOnce({
        referenceNumber: 'OBJ-003',
      });
      (mockPrisma.ohsObjective.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'OBJ-004',
      });

      await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.ohsObjective.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ referenceNumber: 'OBJ-004' }),
        })
      );
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ category: 'TRAINING', targetDate: '2026-12-31' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/objectives')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', category: 'INVALID', targetDate: '2026-12-31' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/objectives/:id', () => {
    const existing = {
      id: 'obj-1',
      title: 'Existing',
      status: 'ACTIVE',
      milestones: [
        { id: 'ms-1', completed: true },
        { id: 'ms-2', completed: false },
        { id: 'ms-3', completed: false },
      ],
    };

    it('should update objective and recalculate progress', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        title: 'Updated',
        progressPercent: 33,
      });

      const response = await request(app)
        .patch('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ progressPercent: 33 }),
        })
      );
    });

    it('should set 100% and completedDate when status ACHIEVED', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        status: 'ACHIEVED',
        progressPercent: 100,
      });

      await request(app)
        .patch('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'ACHIEVED' });

      expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            progressPercent: 100,
            completedDate: expect.any(Date),
          }),
        })
      );
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/objectives/:id', () => {
    it('should delete objective (cascades milestones)', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'obj-1' });
      (mockPrisma.ohsObjective.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/objectives/obj-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/objectives/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/objectives/:id/milestones', () => {
    it('should add milestone to objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'obj-1',
        milestones: [{ id: 'ms-1' }, { id: 'ms-2' }],
      });
      (mockPrisma.objectiveMilestone.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        title: 'New milestone',
        sortOrder: 2,
      });

      const response = await request(app)
        .post('/api/objectives/obj-1/milestones')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New milestone', dueDate: '2026-06-30' });

      expect(response.status).toBe(201);
      expect(mockPrisma.objectiveMilestone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          objectiveId: 'obj-1',
          title: 'New milestone',
          sortOrder: 2,
        }),
      });
    });

    it('should return 404 if objective not found', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/objectives/non-existent/milestones')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New', dueDate: '2026-06-30' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/objectives/:id/milestones/:mid', () => {
    it('should toggle milestone completed and recalculate progress', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        objectiveId: 'obj-1',
        completed: false,
      });
      (mockPrisma.objectiveMilestone.update as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        completed: true,
        completedDate: new Date(),
      });
      (mockPrisma.objectiveMilestone.findMany as jest.Mock).mockResolvedValueOnce([
        { completed: true },
        { completed: false },
      ]);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .patch('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(mockPrisma.objectiveMilestone.update).toHaveBeenCalledWith({
        where: { id: 'ms-1' },
        data: expect.objectContaining({
          completed: true,
          completedDate: expect.any(Date),
        }),
      });
      expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith({
        where: { id: 'obj-1' },
        data: { progressPercent: 50 },
      });
    });

    it('should clear completedDate when uncompleting', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        objectiveId: 'obj-1',
        completed: true,
      });
      (mockPrisma.objectiveMilestone.update as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        completed: false,
      });
      (mockPrisma.objectiveMilestone.findMany as jest.Mock).mockResolvedValueOnce([
        { completed: false },
        { completed: false },
      ]);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});

      await request(app)
        .patch('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ completed: false });

      expect(mockPrisma.objectiveMilestone.update).toHaveBeenCalledWith({
        where: { id: 'ms-1' },
        data: expect.objectContaining({
          completed: false,
          completedDate: null,
        }),
      });
    });

    it('should return 404 if milestone not found or wrong objective', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'ms-1',
        objectiveId: 'obj-OTHER',
      });

      const response = await request(app)
        .patch('/api/objectives/obj-1/milestones/ms-1')
        .set('Authorization', 'Bearer token')
        .send({ completed: true });

      expect(response.status).toBe(404);
    });
  });
});
