import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envEvent: {
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
import eventsRoutes from '../src/routes/events';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Events API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/events', eventsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/events', () => {
    const mockEvents = [
      {
        id: '17000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-EVT-2026-001',
        eventType: 'SPILL',
        severity: 'MAJOR',
        description: 'Chemical spill in warehouse area',
        location: 'Warehouse B',
        status: 'REPORTED',
        dateOfEvent: '2026-01-15T00:00:00.000Z',
      },
      {
        id: 'env40000-0000-4000-a000-000000000002',
        referenceNumber: 'ENV-EVT-2026-002',
        eventType: 'EMISSION',
        severity: 'MINOR',
        description: 'Excessive stack emissions detected',
        location: 'Plant A',
        status: 'INVESTIGATING',
        dateOfEvent: '2026-01-20T00:00:00.000Z',
      },
    ];

    it('should return list of events with pagination', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce(mockEvents);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', 'Bearer token');

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
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([mockEvents[0]]);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/events?page=3&limit=5')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(5);
      expect(response.body.meta.totalPages).toBe(20);
    });

    it('should filter by status', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/events?status=REPORTED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'REPORTED',
          }),
        })
      );
    });

    it('should filter by eventType', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/events?eventType=SPILL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            eventType: 'SPILL',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/events?severity=MAJOR')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'MAJOR',
          }),
        })
      );
    });

    it('should support search across description, location, referenceNumber, reportedBy', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/events?search=warehouse')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { description: { contains: 'warehouse', mode: 'insensitive' } },
              { location: { contains: 'warehouse', mode: 'insensitive' } },
              { referenceNumber: { contains: 'warehouse', mode: 'insensitive' } },
              { reportedBy: { contains: 'warehouse', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should order by dateOfEvent descending', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce(mockEvents);
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/events')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dateOfEvent: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/events')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/events/:id', () => {
    const mockEvent = {
      id: '17000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-EVT-2026-001',
      eventType: 'SPILL',
      severity: 'MAJOR',
      description: 'Chemical spill in warehouse area',
      location: 'Warehouse B',
    };

    it('should return single event', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(mockEvent);

      const response = await request(app)
        .get('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('17000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff event', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/events/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/events', () => {
    const createPayload = {
      eventType: 'SPILL',
      severity: 'MAJOR',
      dateOfEvent: '2026-01-15',
      location: 'Warehouse B',
      department: 'Operations',
      reportedBy: 'John Doe',
      description: 'Chemical spill in the main warehouse area near loading dock',
    };

    it('should create an event successfully', async () => {
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envEvent.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-EVT-2026-001',
        ...createPayload,
        status: 'REPORTED',
      });

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.eventType).toBe('SPILL');
    });

    it('should generate reference number on create', async () => {
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(2);
      (mockPrisma.envEvent.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-EVT-2026-003',
        ...createPayload,
      });

      await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.envEvent.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('ENV-EVT-'),
        }),
      });
    });

    it('should return 400 for missing eventType', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send({ severity: 'MAJOR', dateOfEvent: '2026-01-15', location: 'A', department: 'Ops', reportedBy: 'John', description: 'A valid description here' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for description shorter than 10 characters', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, description: 'Short' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send({ eventType: 'SPILL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envEvent.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/events')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/events/:id', () => {
    const existingEvent = {
      id: '17000000-0000-4000-a000-000000000001',
      eventType: 'SPILL',
      severity: 'MAJOR',
      description: 'Chemical spill',
      status: 'REPORTED',
    };

    it('should update event successfully', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(existingEvent);
      (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({
        ...existingEvent,
        description: 'Updated chemical spill description',
      });

      const response = await request(app)
        .put('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ description: 'Updated chemical spill description' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff event', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/events/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ description: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should auto-set closureDate when status changes to CLOSED', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(existingEvent);
      (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({
        ...existingEvent,
        status: 'CLOSED',
        closureDate: new Date(),
      });

      await request(app)
        .put('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(mockPrisma.envEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'CLOSED',
            closureDate: expect.any(Date),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ description: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/events/:id', () => {
    it('should delete event successfully', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({ id: '17000000-0000-4000-a000-000000000001' });
      (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envEvent.update).toHaveBeenCalledWith({
        where: { id: '17000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff event', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/events/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
