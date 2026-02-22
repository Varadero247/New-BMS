import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envAction: {
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

jest.mock('uuid', () => ({
  v4: jest.fn(() => '30000000-0000-4000-a000-000000000123'),
}));

import { prisma } from '../src/prisma';
import actionsRoutes from '../src/routes/actions';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Actions API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/actions', actionsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/actions', () => {
    const mockActions = [
      {
        id: '13000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-ACT-2026-001',
        title: 'Install air filtration system',
        actionType: 'CORRECTIVE',
        priority: 'HIGH',
        source: 'AUDIT',
        status: 'OPEN',
        assignedTo: 'John Smith',
        dueDate: '2026-06-30T00:00:00.000Z',
      },
      {
        id: '13000000-0000-4000-a000-000000000002',
        referenceNumber: 'ENV-ACT-2026-002',
        title: 'Update waste disposal procedures',
        actionType: 'PREVENTIVE',
        priority: 'MEDIUM',
        source: 'INSPECTION',
        status: 'IN_PROGRESS',
        assignedTo: 'Jane Doe',
        dueDate: '2026-04-15T00:00:00.000Z',
      },
    ];

    it('should return list of actions with pagination', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce(mockActions);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/actions').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 50,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([mockActions[0]]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/actions?page=4&limit=25')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(4);
      expect(response.body.meta.limit).toBe(25);
      expect(response.body.meta.totalPages).toBe(4);
    });

    it('should filter by status', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/actions?status=OPEN').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
          }),
        })
      );
    });

    it('should filter by priority', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/actions?priority=HIGH').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            priority: 'HIGH',
          }),
        })
      );
    });

    it('should filter by actionType', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/actions?actionType=CORRECTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            actionType: 'CORRECTIVE',
          }),
        })
      );
    });

    it('should filter by source', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/actions?source=AUDIT').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            source: 'AUDIT',
          }),
        })
      );
    });

    it('should support search across title, description, referenceNumber, assignedTo', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/actions?search=filtration').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'filtration', mode: 'insensitive' } },
              { description: { contains: 'filtration', mode: 'insensitive' } },
              { referenceNumber: { contains: 'filtration', mode: 'insensitive' } },
              { assignedTo: { contains: 'filtration', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should order by dueDate ascending', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce(mockActions);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/actions').set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dueDate: 'asc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/actions').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/actions/:id', () => {
    const mockAction = {
      id: '13000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-ACT-2026-001',
      title: 'Install air filtration system',
      actionType: 'CORRECTIVE',
      priority: 'HIGH',
    };

    it('should return single action', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(mockAction);

      const response = await request(app)
        .get('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('13000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff action', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/actions/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/actions', () => {
    const createPayload = {
      title: 'Install air filtration system',
      actionType: 'CORRECTIVE',
      priority: 'HIGH',
      source: 'AUDIT',
      description: 'Install new HEPA filtration in production area',
      assignedTo: 'John Smith',
      dueDate: '2026-06-30',
    };

    it('should create an action successfully', async () => {
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envAction.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-ACT-2026-001',
        ...createPayload,
        status: 'OPEN',
        percentComplete: 0,
      });

      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should generate reference number on create', async () => {
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.envAction.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-ACT-2026-004',
        ...createPayload,
      });

      await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.envAction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('ENV-ACT-'),
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, title: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing actionType', async () => {
      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, actionType: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing priority', async () => {
      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, priority: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing assignedTo', async () => {
      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, assignedTo: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envAction.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/actions')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/actions/:id', () => {
    const existingAction = {
      id: '13000000-0000-4000-a000-000000000001',
      title: 'Install air filtration system',
      actionType: 'CORRECTIVE',
      priority: 'HIGH',
      status: 'OPEN',
    };

    it('should update action successfully', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(existingAction);
      (mockPrisma.envAction.update as jest.Mock).mockResolvedValueOnce({
        ...existingAction,
        status: 'IN_PROGRESS',
      });

      const response = await request(app)
        .put('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'IN_PROGRESS' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff action', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/actions/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-set completionDate when status changes to COMPLETED', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(existingAction);
      (mockPrisma.envAction.update as jest.Mock).mockResolvedValueOnce({
        ...existingAction,
        status: 'COMPLETED',
        completionDate: new Date(),
      });

      await request(app)
        .put('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(mockPrisma.envAction.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'COMPLETED',
            completionDate: expect.any(Date),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/actions/:id', () => {
    it('should delete action successfully', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '13000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.envAction.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envAction.update).toHaveBeenCalledWith({
        where: { id: '13000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date), updatedBy: '20000000-0000-4000-a000-000000000123' },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff action', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/actions/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envAction.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/actions/13000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/actions — additional coverage', () => {
    it('should return correct totalPages for large dataset', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(200);

      const response = await request(app)
        .get('/api/actions?page=1&limit=50')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.totalPages).toBe(4);
      expect(response.body.meta.total).toBe(200);
    });

    it('should filter by both status and priority simultaneously', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/actions?status=OPEN&priority=HIGH')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envAction.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OPEN',
            priority: 'HIGH',
          }),
        })
      );
    });

    it('response data items should contain referenceNumber field', async () => {
      (mockPrisma.envAction.findMany as jest.Mock).mockResolvedValueOnce([
        {
          id: '13000000-0000-4000-a000-000000000001',
          referenceNumber: 'ENV-ACT-2026-001',
          title: 'Test Action',
          actionType: 'CORRECTIVE',
          priority: 'HIGH',
          source: 'AUDIT',
          status: 'OPEN',
        },
      ]);
      (mockPrisma.envAction.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/actions')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data[0].referenceNumber).toBe('ENV-ACT-2026-001');
    });
  });
});
