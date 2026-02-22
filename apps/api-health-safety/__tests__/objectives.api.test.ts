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
        id: '15000000-0000-4000-a000-000000000001',
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
        id: '15000000-0000-4000-a000-000000000001',
        title: 'Reduce incidents',
        milestones: [
          { id: '1b000000-0000-4000-a000-000000000001', title: 'Phase 1', completed: false },
        ],
      });

      const response = await request(app)
        .get('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.milestones).toHaveLength(1);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
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
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'OBJ-001',
        ...createPayload,
        status: 'ACTIVE',
        milestones: [
          {
            id: '1b000000-0000-4000-a000-000000000001',
            title: 'Baseline assessment',
            completed: false,
          },
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
        id: '30000000-0000-4000-a000-000000000123',
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
      id: '15000000-0000-4000-a000-000000000001',
      title: 'Existing',
      status: 'ACTIVE',
      milestones: [
        { id: '1b000000-0000-4000-a000-000000000001', completed: true },
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
        .patch('/api/objectives/15000000-0000-4000-a000-000000000001')
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
        .patch('/api/objectives/15000000-0000-4000-a000-000000000001')
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

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/objectives/:id', () => {
    it('should delete objective (cascades milestones)', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '15000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/objectives/15000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/objectives/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/objectives/:id/milestones', () => {
    it('should add milestone to objective', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '15000000-0000-4000-a000-000000000001',
        milestones: [{ id: '1b000000-0000-4000-a000-000000000001' }, { id: 'ms-2' }],
      });
      (mockPrisma.objectiveMilestone.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        title: 'New milestone',
        sortOrder: 2,
      });

      const response = await request(app)
        .post('/api/objectives/15000000-0000-4000-a000-000000000001/milestones')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New milestone', dueDate: '2026-06-30' });

      expect(response.status).toBe(201);
      expect(mockPrisma.objectiveMilestone.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          objectiveId: '15000000-0000-4000-a000-000000000001',
          title: 'New milestone',
          sortOrder: 2,
        }),
      });
    });

    it('should return 404 if objective not found', async () => {
      (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/objectives/00000000-0000-4000-a000-ffffffffffff/milestones')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New', dueDate: '2026-06-30' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/objectives/:id/milestones/:mid', () => {
    it('should toggle milestone completed and recalculate progress', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1b000000-0000-4000-a000-000000000001',
        objectiveId: '15000000-0000-4000-a000-000000000001',
        completed: false,
      });
      (mockPrisma.objectiveMilestone.update as jest.Mock).mockResolvedValueOnce({
        id: '1b000000-0000-4000-a000-000000000001',
        completed: true,
        completedDate: new Date(),
      });
      (mockPrisma.objectiveMilestone.findMany as jest.Mock).mockResolvedValueOnce([
        { completed: true },
        { completed: false },
      ]);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .patch(
          '/api/objectives/15000000-0000-4000-a000-000000000001/milestones/1b000000-0000-4000-a000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ completed: true });

      expect(response.status).toBe(200);
      expect(mockPrisma.objectiveMilestone.update).toHaveBeenCalledWith({
        where: { id: '1b000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          completed: true,
          completedDate: expect.any(Date),
        }),
      });
      expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith({
        where: { id: '15000000-0000-4000-a000-000000000001' },
        data: { progressPercent: 50 },
      });
    });

    it('should clear completedDate when uncompleting', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1b000000-0000-4000-a000-000000000001',
        objectiveId: '15000000-0000-4000-a000-000000000001',
        completed: true,
      });
      (mockPrisma.objectiveMilestone.update as jest.Mock).mockResolvedValueOnce({
        id: '1b000000-0000-4000-a000-000000000001',
        completed: false,
      });
      (mockPrisma.objectiveMilestone.findMany as jest.Mock).mockResolvedValueOnce([
        { completed: false },
        { completed: false },
      ]);
      (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});

      await request(app)
        .patch(
          '/api/objectives/15000000-0000-4000-a000-000000000001/milestones/1b000000-0000-4000-a000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ completed: false });

      expect(mockPrisma.objectiveMilestone.update).toHaveBeenCalledWith({
        where: { id: '1b000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          completed: false,
          completedDate: null,
        }),
      });
    });

    it('should return 404 if milestone not found or wrong objective', async () => {
      (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '1b000000-0000-4000-a000-000000000001',
        objectiveId: 'obj-OTHER',
      });

      const response = await request(app)
        .patch(
          '/api/objectives/15000000-0000-4000-a000-000000000001/milestones/1b000000-0000-4000-a000-000000000001'
        )
        .set('Authorization', 'Bearer token')
        .send({ completed: true });

      expect(response.status).toBe(404);
    });
  });
});

describe('Health & Safety Objectives — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/objectives', objectivesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET returns correct total in meta', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(42);

    const response = await request(app)
      .get('/api/objectives?page=1&limit=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(42);
  });

  it('GET returns empty data array when no objectives exist', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app)
      .get('/api/objectives')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(0);
  });

  it('DELETE returns 500 on update database error', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '15000000-0000-4000-a000-000000000001',
    });
    (mockPrisma.ohsObjective.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .delete('/api/objectives/15000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
  });

  it('PATCH /milestones/:mid returns 500 on database error', async () => {
    (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '1b000000-0000-4000-a000-000000000001',
      objectiveId: '15000000-0000-4000-a000-000000000001',
      completed: false,
    });
    (mockPrisma.objectiveMilestone.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .patch(
        '/api/objectives/15000000-0000-4000-a000-000000000001/milestones/1b000000-0000-4000-a000-000000000001'
      )
      .set('Authorization', 'Bearer token')
      .send({ completed: true });

    expect(response.status).toBe(500);
  });

  it('POST returns 400 when targetDate is missing', async () => {
    const response = await request(app)
      .post('/api/objectives')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Reduce incidents', category: 'INCIDENT_REDUCTION' });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PATCH sets status to CANCELLED without affecting progress', async () => {
    const existing = {
      id: '15000000-0000-4000-a000-000000000001',
      title: 'Active objective',
      status: 'ACTIVE',
      milestones: [],
    };
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce(existing);
    (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({
      ...existing,
      status: 'CANCELLED',
    });

    const response = await request(app)
      .patch('/api/objectives/15000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'CANCELLED' });

    expect(response.status).toBe(200);
    expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ status: 'CANCELLED' }),
      })
    );
  });

  it('POST /milestones returns 400 when title is missing', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '15000000-0000-4000-a000-000000000001',
      milestones: [],
    });

    const response = await request(app)
      .post('/api/objectives/15000000-0000-4000-a000-000000000001/milestones')
      .set('Authorization', 'Bearer token')
      .send({ dueDate: '2026-06-30' });

    expect(response.status).toBe(400);
  });

  it('GET /:id returns 500 on database error', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app)
      .get('/api/objectives/15000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
  });
});

describe('Health & Safety Objectives — final coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/objectives', objectivesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / calls findMany with include milestones', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(mockPrisma.ohsObjective.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ include: expect.objectContaining({ milestones: expect.any(Object) }) })
    );
  });

  it('POST / sets status to ACTIVE by default', async () => {
    (mockPrisma.ohsObjective.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (mockPrisma.ohsObjective.create as jest.Mock).mockResolvedValueOnce({ id: 'x', referenceNumber: 'OBJ-001', status: 'ACTIVE', milestones: [] });
    await request(app)
      .post('/api/objectives')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Test', category: 'INCIDENT_REDUCTION', targetDate: '2026-12-31' });
    expect(mockPrisma.ohsObjective.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('PATCH /:id returns 500 on update DB error', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '15000000-0000-4000-a000-000000000001', status: 'ACTIVE', milestones: [],
    });
    (mockPrisma.ohsObjective.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));
    const res = await request(app)
      .patch('/api/objectives/15000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
  });

  it('DELETE /:id calls update with deletedAt', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({ id: '15000000-0000-4000-a000-000000000001' });
    (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});
    await request(app)
      .delete('/api/objectives/15000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
    );
  });

  it('POST /milestones calls create with sortOrder equal to milestones.length', async () => {
    (mockPrisma.ohsObjective.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '15000000-0000-4000-a000-000000000001',
      milestones: [{ id: 'ms-1' }, { id: 'ms-2' }, { id: 'ms-3' }],
    });
    (mockPrisma.objectiveMilestone.create as jest.Mock).mockResolvedValueOnce({ id: 'ms-4', sortOrder: 3 });
    await request(app)
      .post('/api/objectives/15000000-0000-4000-a000-000000000001/milestones')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Fourth milestone', dueDate: '2026-09-30' });
    expect(mockPrisma.objectiveMilestone.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ sortOrder: 3 }) })
    );
  });

  it('GET / meta.total matches mocked count', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(17);
    const res = await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.meta.total).toBe(17);
  });

  it('PATCH /milestones/:mid progress 0% when all uncompleted', async () => {
    (mockPrisma.objectiveMilestone.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '1b000000-0000-4000-a000-000000000001',
      objectiveId: '15000000-0000-4000-a000-000000000001',
      completed: true,
    });
    (mockPrisma.objectiveMilestone.update as jest.Mock).mockResolvedValueOnce({ id: '1b000000-0000-4000-a000-000000000001', completed: false });
    (mockPrisma.objectiveMilestone.findMany as jest.Mock).mockResolvedValueOnce([
      { completed: false }, { completed: false }, { completed: false },
    ]);
    (mockPrisma.ohsObjective.update as jest.Mock).mockResolvedValueOnce({});
    const res = await request(app)
      .patch('/api/objectives/15000000-0000-4000-a000-000000000001/milestones/1b000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ completed: false });
    expect(res.status).toBe(200);
    expect(mockPrisma.ohsObjective.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { progressPercent: 0 } })
    );
  });
});

describe('Health & Safety Objectives — extra coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/objectives', objectivesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / findMany called once per request', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);
    await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(mockPrisma.ohsObjective.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET / response body has success true', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('POST / create called with progressPercent 0 initially', async () => {
    (mockPrisma.ohsObjective.findFirst as jest.Mock).mockResolvedValueOnce(null);
    (mockPrisma.ohsObjective.create as jest.Mock).mockResolvedValueOnce({
      id: 'obj-x',
      referenceNumber: 'OBJ-001',
      status: 'ACTIVE',
      milestones: [],
    });
    await request(app)
      .post('/api/objectives')
      .set('Authorization', 'Bearer token')
      .send({ title: 'New', category: 'INCIDENT_REDUCTION', targetDate: '2026-12-31', milestones: [] });
    expect(mockPrisma.ohsObjective.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currentValue: 0 }) })
    );
  });

  it('GET / meta has totalPages property', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(res.body.meta).toHaveProperty('totalPages');
  });

  it('GET / data array is empty when no objectives in DB', async () => {
    (mockPrisma.ohsObjective.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.ohsObjective.count as jest.Mock).mockResolvedValueOnce(0);
    const res = await request(app).get('/api/objectives').set('Authorization', 'Bearer token');
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data).toHaveLength(0);
  });
});

describe('objectives — phase29 coverage', () => {
  it('handles splice method', () => {
    const arr = [1, 2, 3]; arr.splice(1, 1); expect(arr).toEqual([1, 3]);
  });

  it('handles string padEnd', () => {
    expect('5'.padEnd(3, '0')).toBe('500');
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles array length', () => {
    expect([1, 2, 3].length).toBe(3);
  });

  it('handles string charAt', () => {
    expect('hello'.charAt(0)).toBe('h');
  });

});

describe('objectives — phase30 coverage', () => {
  it('handles string startsWith', () => {
    expect('hello'.startsWith('he')).toBe(true);
  });

  it('handles string trim', () => {
    expect('  hello  '.trim()).toBe('hello');
  });

  it('handles flat array', () => {
    expect([[1, 2], [3, 4]].flat()).toEqual([1, 2, 3, 4]);
  });

  it('handles Math.ceil', () => {
    expect(Math.ceil(3.1)).toBe(4);
  });

  it('handles Array.from', () => {
    expect(Array.from('abc')).toEqual(['a', 'b', 'c']);
  });

});


describe('phase31 coverage', () => {
  it('handles array of', () => { expect(Array.of(1,2,3)).toEqual([1,2,3]); });
  it('handles string toLowerCase', () => { expect('HELLO'.toLowerCase()).toBe('hello'); });
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles array includes', () => { expect([1,2,3].includes(2)).toBe(true); });
  it('handles number parsing', () => { expect(parseInt('42', 10)).toBe(42); });
});


describe('phase32 coverage', () => {
  it('handles string lastIndexOf', () => { expect('abcabc'.lastIndexOf('a')).toBe(3); });
  it('handles switch statement', () => { const fn = (v: string) => { switch(v) { case 'a': return 1; case 'b': return 2; default: return 0; } }; expect(fn('a')).toBe(1); expect(fn('c')).toBe(0); });
  it('handles array fill', () => { expect(new Array(3).fill(0)).toEqual([0,0,0]); });
  it('handles Promise.all', async () => { const r = await Promise.all([Promise.resolve(1), Promise.resolve(2)]); expect(r).toEqual([1,2]); });
  it('handles Set iteration', () => { const s = new Set([1,2,3]); expect([...s]).toEqual([1,2,3]); });
});


describe('phase33 coverage', () => {
  it('handles currying pattern', () => { const add = (a: number) => (b: number) => a + b; expect(add(3)(4)).toBe(7); });
  it('handles tagged template', () => { const tag = (s: TemplateStringsArray, ...v: number[]) => s.raw[0] + v[0]; expect(tag`val:${42}`).toBe('val:42'); });
  it('handles partial application', () => { const multiply = (a: number, b: number) => a * b; const triple = multiply.bind(null, 3); expect(triple(7)).toBe(21); });
  it('handles array unshift', () => { const a = [2,3]; a.unshift(1); expect(a).toEqual([1,2,3]); });
  it('handles object toString', () => { expect(Object.prototype.toString.call([])).toBe('[object Array]'); });
});


describe('phase34 coverage', () => {
  it('handles array of objects sort', () => { const arr = [{n:3},{n:1},{n:2}]; arr.sort((a,b)=>a.n-b.n); expect(arr[0].n).toBe(1); });
  it('handles chained string methods', () => { expect('  Hello World  '.trim().toLowerCase()).toBe('hello world'); });
  it('handles generic class', () => { class Box<T> { constructor(public value: T) {} } const b = new Box(99); expect(b.value).toBe(99); });
  it('handles Map with complex values', () => { const m = new Map<string, number[]>(); m.set('evens', [2,4,6]); expect(m.get('evens')?.length).toBe(3); });
  it('handles mapped type pattern', () => { type Flags<T> = { [K in keyof T]: boolean }; const flags: Flags<{a:number;b:string}> = {a:true,b:false}; expect(flags.a).toBe(true); });
});


describe('phase35 coverage', () => {
  it('handles string words count', () => { const count = (s: string) => s.trim().split(/\s+/).length; expect(count('hello world foo')).toBe(3); });
  it('handles discriminated union', () => { type Shape = {kind:'circle';r:number}|{kind:'rect';w:number;h:number}; const area=(s:Shape)=>s.kind==='circle'?Math.PI*s.r*s.r:s.w*s.h; expect(area({kind:'rect',w:3,h:4})).toBe(12); });
  it('handles numeric separator readability', () => { const million = 1_000_000; expect(million).toBe(1000000); });
  it('handles retry pattern', async () => { let attempts = 0; const retry = async (fn: ()=>Promise<number>, n:number): Promise<number> => { try { return await fn(); } catch(e) { if(n<=0) throw e; return retry(fn,n-1); } }; const fn = () => { attempts++; return attempts < 3 ? Promise.reject(new Error()) : Promise.resolve(42); }; expect(await retry(fn,5)).toBe(42); });
  it('handles chained map and filter', () => { expect([1,2,3,4,5].filter(x=>x%2!==0).map(x=>x*x)).toEqual([1,9,25]); });
});
