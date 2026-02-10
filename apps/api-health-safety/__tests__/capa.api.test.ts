import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    capa: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    capaAction: {
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
import capaRoutes from '../src/routes/capa';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety CAPA API', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/capa', capaRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/capa', () => {
    const mockCapas = [
      {
        id: 'capa-1',
        referenceNumber: 'CAPA-001',
        title: 'Fix guarding on press',
        capaType: 'CORRECTIVE',
        source: 'INCIDENT',
        priority: 'HIGH',
        status: 'OPEN',
        actions: [],
      },
    ];

    it('should return list with actions included', async () => {
      (mockPrisma.capa.findMany as jest.Mock).mockResolvedValueOnce(mockCapas);
      (mockPrisma.capa.count as jest.Mock).mockResolvedValueOnce(1);

      const response = await request(app)
        .get('/api/capa')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(mockPrisma.capa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { actions: { orderBy: { sortOrder: 'asc' } } },
        })
      );
    });

    it('should filter by priority', async () => {
      (mockPrisma.capa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.capa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/capa?priority=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.capa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ priority: 'CRITICAL' }),
        })
      );
    });

    it('should filter by capaType', async () => {
      (mockPrisma.capa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.capa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/capa?capaType=PREVENTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.capa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ capaType: 'PREVENTIVE' }),
        })
      );
    });

    it('should filter by source', async () => {
      (mockPrisma.capa.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.capa.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/capa?source=AUDIT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.capa.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ source: 'AUDIT' }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.capa.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/capa')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/capa/:id', () => {
    it('should return single CAPA with actions', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'capa-1',
        title: 'Fix guarding',
        actions: [{ id: 'action-1', title: 'Install guard' }],
      });

      const response = await request(app)
        .get('/api/capa/capa-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.actions).toHaveLength(1);
    });

    it('should return 404 for non-existent CAPA', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/capa/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('POST /api/capa', () => {
    const createPayload = {
      title: 'Fix machine guarding',
      capaType: 'CORRECTIVE',
      source: 'INCIDENT',
      priority: 'HIGH',
      problemStatement: 'Machine guard was removed',
      actions: [
        { title: 'Install new guard', type: 'CORRECTIVE', owner: 'John' },
        { title: 'Training on lockout', type: 'PREVENTIVE', owner: 'Jane' },
      ],
    };

    it('should create CAPA with actions and auto ref#', async () => {
      (mockPrisma.capa.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.capa.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        referenceNumber: 'CAPA-001',
        ...createPayload,
        status: 'OPEN',
        actions: [
          { id: 'a1', title: 'Install new guard' },
          { id: 'a2', title: 'Training on lockout' },
        ],
      });

      const response = await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.capa.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            referenceNumber: 'CAPA-001',
            status: 'OPEN',
            createdBy: 'user-123',
            actions: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({ title: 'Install new guard', sortOrder: 0 }),
                expect.objectContaining({ title: 'Training on lockout', sortOrder: 1 }),
              ]),
            }),
          }),
        })
      );
    });

    it('should auto-set target date from HIGH priority (14 days)', async () => {
      (mockPrisma.capa.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.capa.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        priority: 'HIGH',
      });

      await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', capaType: 'CORRECTIVE', source: 'INCIDENT', priority: 'HIGH' });

      const createCall = (mockPrisma.capa.create as jest.Mock).mock.calls[0][0];
      const targetDate = createCall.data.targetCompletionDate;
      const daysDiff = Math.round((targetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBeGreaterThanOrEqual(13);
      expect(daysDiff).toBeLessThanOrEqual(15);
    });

    it('should auto-set target date from CRITICAL priority (7 days)', async () => {
      (mockPrisma.capa.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.capa.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        priority: 'CRITICAL',
      });

      await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', capaType: 'CORRECTIVE', source: 'INCIDENT', priority: 'CRITICAL' });

      const createCall = (mockPrisma.capa.create as jest.Mock).mock.calls[0][0];
      const targetDate = createCall.data.targetCompletionDate;
      const daysDiff = Math.round((targetDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
      expect(daysDiff).toBeGreaterThanOrEqual(6);
      expect(daysDiff).toBeLessThanOrEqual(8);
    });

    it('should default priority to MEDIUM (30 days) when not specified', async () => {
      (mockPrisma.capa.findFirst as jest.Mock).mockResolvedValueOnce(null);
      (mockPrisma.capa.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        priority: 'MEDIUM',
      });

      await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', capaType: 'CORRECTIVE', source: 'INCIDENT' });

      expect(mockPrisma.capa.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ priority: 'MEDIUM' }),
        })
      );
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send({ title: 'No type or source' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid capaType', async () => {
      const response = await request(app)
        .post('/api/capa')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', capaType: 'INVALID', source: 'INCIDENT' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/capa/:id', () => {
    const existing = {
      id: 'capa-1',
      title: 'Existing CAPA',
      status: 'OPEN',
    };

    it('should update CAPA', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.capa.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        title: 'Updated',
      });

      const response = await request(app)
        .patch('/api/capa/capa-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should set closedDate and closedBy when status CLOSED', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(existing);
      (mockPrisma.capa.update as jest.Mock).mockResolvedValueOnce({
        ...existing,
        status: 'CLOSED',
        closedDate: new Date(),
        closedBy: 'user-123',
      });

      await request(app)
        .patch('/api/capa/capa-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED', closureNotes: 'Verified effective', effectivenessRating: 'EFFECTIVE' });

      expect(mockPrisma.capa.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            closedDate: expect.any(Date),
            closedBy: 'user-123',
          }),
        })
      );
    });

    it('should return 404 for non-existent CAPA', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/capa/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/capa/:id', () => {
    it('should delete CAPA (cascades actions)', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce({ id: 'capa-1' });
      (mockPrisma.capa.delete as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/capa/capa-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent CAPA', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/capa/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  describe('POST /api/capa/:id/actions', () => {
    it('should add action to CAPA', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'capa-1',
        actions: [{ id: 'a1' }],
      });
      (mockPrisma.capaAction.create as jest.Mock).mockResolvedValueOnce({
        id: 'mock-uuid-123',
        title: 'New action',
        sortOrder: 1,
      });

      const response = await request(app)
        .post('/api/capa/capa-1/actions')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New action', type: 'CORRECTIVE' });

      expect(response.status).toBe(201);
      expect(mockPrisma.capaAction.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          capaId: 'capa-1',
          title: 'New action',
          type: 'CORRECTIVE',
          sortOrder: 1,
        }),
      });
    });

    it('should return 404 if CAPA not found', async () => {
      (mockPrisma.capa.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/capa/non-existent/actions')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Action', type: 'CORRECTIVE' });

      expect(response.status).toBe(404);
    });
  });

  describe('PATCH /api/capa/:id/actions/:aid', () => {
    it('should update action and set completedAt on COMPLETED', async () => {
      (mockPrisma.capaAction.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'action-1',
        capaId: 'capa-1',
      });
      (mockPrisma.capaAction.update as jest.Mock).mockResolvedValueOnce({
        id: 'action-1',
        status: 'COMPLETED',
        completedAt: new Date(),
      });

      const response = await request(app)
        .patch('/api/capa/capa-1/actions/action-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(mockPrisma.capaAction.update).toHaveBeenCalledWith({
        where: { id: 'action-1' },
        data: expect.objectContaining({
          status: 'COMPLETED',
          completedAt: expect.any(Date),
        }),
      });
    });

    it('should return 404 if action not found or wrong CAPA', async () => {
      (mockPrisma.capaAction.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'action-1',
        capaId: 'capa-OTHER',
      });

      const response = await request(app)
        .patch('/api/capa/capa-1/actions/action-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'COMPLETED' });

      expect(response.status).toBe(404);
    });
  });
});
