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

      const response = await request(app).get('/api/events').set('Authorization', 'Bearer token');

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

      await request(app).get('/api/events?status=REPORTED').set('Authorization', 'Bearer token');

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

      await request(app).get('/api/events?eventType=SPILL').set('Authorization', 'Bearer token');

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

      await request(app).get('/api/events?severity=MAJOR').set('Authorization', 'Bearer token');

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

      await request(app).get('/api/events?search=warehouse').set('Authorization', 'Bearer token');

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

      await request(app).get('/api/events').set('Authorization', 'Bearer token');

      expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dateOfEvent: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envEvent.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/events').set('Authorization', 'Bearer token');

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
        .send({
          severity: 'MAJOR',
          dateOfEvent: '2026-01-15',
          location: 'A',
          department: 'Ops',
          reportedBy: 'John',
          description: 'A valid description here',
        });

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
      (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '17000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/events/17000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envEvent.update).toHaveBeenCalledWith({
        where: { id: '17000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date), updatedBy: '20000000-0000-4000-a000-000000000123' },
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

describe('Environment Events API — additional coverage', () => {
  let app2: express.Express;

  beforeAll(() => {
    app2 = express();
    app2.use(express.json());
    app2.use('/api/events', eventsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns correct totalPages for large dataset', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(200);

    const response = await request(app2)
      .get('/api/events?page=1&limit=50')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.totalPages).toBe(4);
  });

  it('GET / returns success:true in response envelope', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app2)
      .get('/api/events')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('POST / returns 400 for missing reportedBy field', async () => {
    const response = await request(app2)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'SPILL',
        severity: 'MAJOR',
        dateOfEvent: '2026-01-15',
        location: 'Warehouse B',
        department: 'Operations',
        description: 'Chemical spill in warehouse area near dock',
        // reportedBy intentionally omitted
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT /:id returns 500 on update DB error', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      status: 'REPORTED',
    });
    (mockPrisma.envEvent.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app2)
      .put('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ description: 'Updated description for the event' });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 on update DB error', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
    });
    (mockPrisma.envEvent.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app2)
      .delete('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 for missing location field', async () => {
    const response = await request(app2)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'SPILL',
        severity: 'MAJOR',
        dateOfEvent: '2026-01-15',
        department: 'Operations',
        reportedBy: 'John Doe',
        description: 'Chemical spill in warehouse area near dock',
        // location intentionally omitted
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('POST / count call includes correct year in reference number', async () => {
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(4);
    (mockPrisma.envEvent.create as jest.Mock).mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'ENV-EVT-2026-005',
      eventType: 'EMISSION',
      severity: 'MINOR',
    });

    await request(app2)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'EMISSION',
        severity: 'MINOR',
        dateOfEvent: '2026-02-01',
        location: 'Plant A',
        department: 'Operations',
        reportedBy: 'Jane Doe',
        description: 'Excessive stack emissions detected at Plant A',
      });

    const createCall = (mockPrisma.envEvent.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.referenceNumber).toMatch(/ENV-EVT-\d{4}-\d{3}/);
  });

  it('GET / filters by dateFrom query param without error', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(app2)
      .get('/api/events?dateFrom=2026-01-01')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
  });

  it('DELETE /:id returns 500 on DB error during findUnique', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app2)
      .delete('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 400 for missing department field', async () => {
    const response = await request(app2)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'SPILL',
        severity: 'MAJOR',
        dateOfEvent: '2026-01-15',
        location: 'Warehouse B',
        reportedBy: 'John Doe',
        description: 'Chemical spill in warehouse area near dock',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id returns success:true for existing event', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-EVT-2026-001',
      eventType: 'SPILL',
    });

    const response = await request(app2)
      .get('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });
});

describe('Environment Events API — boundary coverage', () => {
  let app3: express.Express;

  beforeAll(() => {
    app3 = express();
    app3.use(express.json());
    app3.use('/api/events', eventsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/events filters by eventType=EMISSION', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app3)
      .get('/api/events?eventType=EMISSION')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ eventType: 'EMISSION' }),
      })
    );
  });

  it('PUT /api/events/:id returns success:true on update', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      status: 'REPORTED',
    });
    (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      status: 'INVESTIGATING',
    });

    const response = await request(app3)
      .put('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'INVESTIGATING' });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('DELETE /api/events/:id returns 204 on success', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
    });
    (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({});

    const response = await request(app3)
      .delete('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(204);
  });

  it('GET /api/events meta total reflects Prisma count result', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(99);

    const response = await request(app3)
      .get('/api/events')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.total).toBe(99);
  });

  it('POST /api/events returns 400 for missing dateOfEvent field', async () => {
    const response = await request(app3)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'SPILL',
        severity: 'MAJOR',
        location: 'Warehouse B',
        department: 'Operations',
        reportedBy: 'John Doe',
        description: 'Chemical spill in the main warehouse area near loading dock',
        // dateOfEvent missing
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });
});

describe('Environment Events API — phase28 coverage', () => {
  let appP28: express.Express;

  beforeAll(() => {
    appP28 = express();
    appP28.use(express.json());
    appP28.use('/api/events', eventsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / filters by severity=MINOR in where clause', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

    await request(appP28)
      .get('/api/events?severity=MINOR')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envEvent.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'MINOR' }),
      })
    );
  });

  it('GET / meta.page reflects the page query parameter', async () => {
    (mockPrisma.envEvent.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envEvent.count as jest.Mock).mockResolvedValueOnce(0);

    const response = await request(appP28)
      .get('/api/events?page=4&limit=10')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.meta.page).toBe(4);
  });

  it('POST / returns 400 when description is an empty string', async () => {
    const response = await request(appP28)
      .post('/api/events')
      .set('Authorization', 'Bearer token')
      .send({
        eventType: 'SPILL',
        severity: 'MAJOR',
        dateOfEvent: '2026-01-15',
        location: 'Warehouse B',
        department: 'Operations',
        reportedBy: 'John Doe',
        description: '',
      });

    expect(response.status).toBe(400);
    expect(response.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('GET /:id findUnique is called with correct id', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      eventType: 'SPILL',
      severity: 'MAJOR',
    });

    await request(appP28)
      .get('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envEvent.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '17000000-0000-4000-a000-000000000001' },
      })
    );
  });

  it('PUT /:id calls update with the new status value in data', async () => {
    (mockPrisma.envEvent.findUnique as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      status: 'REPORTED',
    });
    (mockPrisma.envEvent.update as jest.Mock).mockResolvedValueOnce({
      id: '17000000-0000-4000-a000-000000000001',
      status: 'INVESTIGATING',
    });

    await request(appP28)
      .put('/api/events/17000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'INVESTIGATING' });

    expect(mockPrisma.envEvent.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          status: 'INVESTIGATING',
        }),
      })
    );
  });
});
