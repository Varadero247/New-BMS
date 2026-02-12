import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    complianceEvent: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
  requireRole: jest.fn(() => (_req: any, _res: any, next: any) => next()),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { prisma } from '@ims/database';
import complianceCalendarRoutes from '../src/routes/compliance-calendar';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// Sample event data
const futureDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days out
const pastDate = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);    // 5 days ago
const soonDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);    // 3 days out

const mockEvent = {
  id: 'evt-1',
  title: 'Annual ISO 9001 Audit',
  description: 'Internal audit for quality management system',
  type: 'AUDIT',
  standard: 'ISO_9001_CAL',
  status: 'UPCOMING',
  dueDate: futureDate,
  completedAt: null,
  assigneeId: 'user-2',
  assignee: 'Jane Auditor',
  location: 'Main Office',
  notes: 'Prepare documentation',
  recurrence: 'ANNUALLY',
  createdBy: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null,
};

const mockOverdueEvent = {
  ...mockEvent,
  id: 'evt-2',
  title: 'Overdue CAPA Review',
  type: 'CAPA_DUE',
  standard: 'ISO_14001_CAL',
  status: 'OVERDUE',
  dueDate: pastDate,
};

const mockDueSoonEvent = {
  ...mockEvent,
  id: 'evt-3',
  title: 'Management Review',
  type: 'MANAGEMENT_REVIEW',
  standard: 'ISO_45001_CAL',
  status: 'DUE_SOON',
  dueDate: soonDate,
};

describe('Compliance Calendar API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/dashboard/compliance-calendar', complianceCalendarRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =========================================================================
  // GET /api/dashboard/compliance-calendar
  // =========================================================================
  describe('GET /api/dashboard/compliance-calendar', () => {
    it('should return all compliance events', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent, mockOverdueEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(2);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toHaveProperty('total', 2);
      expect(response.body.meta).toHaveProperty('page', 1);
    });

    it('should enrich events with daysUntilDue and color', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(1);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      const event = response.body.data[0];
      expect(event).toHaveProperty('daysUntilDue');
      expect(event).toHaveProperty('computedStatus');
      expect(event).toHaveProperty('color', '#3b82f6'); // ISO_9001_CAL = blue
    });

    it('should filter by standard', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(1);

      await request(app)
        .get('/api/dashboard/compliance-calendar?standard=ISO_9001_CAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            standard: 'ISO_9001_CAL',
          }),
        })
      );
    });

    it('should filter by multiple standards', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent, mockOverdueEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(2);

      await request(app)
        .get('/api/dashboard/compliance-calendar?standard=ISO_9001_CAL,ISO_14001_CAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            standard: { in: ['ISO_9001_CAL', 'ISO_14001_CAL'] },
          }),
        })
      );
    });

    it('should filter by type', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(1);

      await request(app)
        .get('/api/dashboard/compliance-calendar?type=AUDIT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'AUDIT',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockOverdueEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(1);

      await request(app)
        .get('/api/dashboard/compliance-calendar?status=OVERDUE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'OVERDUE',
          }),
        })
      );
    });

    it('should filter by date range', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(1);

      const startDate = '2026-01-01';
      const endDate = '2026-12-31';

      await request(app)
        .get(`/api/dashboard/compliance-calendar?startDate=${startDate}&endDate=${endDate}`)
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            dueDate: {
              gte: new Date(startDate),
              lte: new Date(endDate),
            },
          }),
        })
      );
    });

    it('should paginate results', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent] as any);
      mockPrisma.complianceEvent.count.mockResolvedValue(100);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.body.meta).toEqual({
        page: 2,
        limit: 10,
        total: 100,
        totalPages: 10,
      });

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        })
      );
    });

    it('should handle empty results', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);
      mockPrisma.complianceEvent.count.mockResolvedValue(0);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data).toEqual([]);
      expect(response.body.meta.total).toBe(0);
    });

    it('should handle database errors', async () => {
      mockPrisma.complianceEvent.findMany.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // GET /api/dashboard/compliance-calendar/upcoming
  // =========================================================================
  describe('GET /api/dashboard/compliance-calendar/upcoming', () => {
    it('should return upcoming events with default 30 days', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockEvent, mockDueSoonEvent] as any);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar/upcoming')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('events');
      expect(response.body.data).toHaveProperty('summary');
      expect(response.body.data.summary).toHaveProperty('total');
      expect(response.body.data.summary).toHaveProperty('dueSoon');
      expect(response.body.data.summary).toHaveProperty('byStandard');
      expect(response.body.data.summary).toHaveProperty('byType');
    });

    it('should accept custom days parameter', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([mockDueSoonEvent] as any);

      await request(app)
        .get('/api/dashboard/compliance-calendar/upcoming?days=7')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.complianceEvent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: { not: 'COMPLETED' },
          }),
        })
      );
    });

    it('should cap days at 365', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([]);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar/upcoming?days=999')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
    });

    it('should group events by standard and type in summary', async () => {
      mockPrisma.complianceEvent.findMany.mockResolvedValue([
        mockEvent, mockDueSoonEvent,
      ] as any);

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar/upcoming')
        .set('Authorization', 'Bearer token');

      const summary = response.body.data.summary;
      expect(summary.total).toBe(2);
      expect(summary.byStandard).toHaveProperty('ISO_9001_CAL');
      expect(summary.byStandard).toHaveProperty('ISO_45001_CAL');
    });

    it('should handle database errors', async () => {
      mockPrisma.complianceEvent.findMany.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .get('/api/dashboard/compliance-calendar/upcoming')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // POST /api/dashboard/compliance-calendar/events
  // =========================================================================
  describe('POST /api/dashboard/compliance-calendar/events', () => {
    const validBody = {
      title: 'New Audit Event',
      description: 'Annual quality audit',
      type: 'AUDIT',
      standard: 'ISO_9001_CAL',
      dueDate: futureDate.toISOString(),
      assignee: 'John Doe',
      location: 'HQ Building A',
    };

    it('should create a compliance event', async () => {
      const created = { ...mockEvent, ...validBody, id: 'evt-new' };
      mockPrisma.complianceEvent.create.mockResolvedValue(created as any);

      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', 'New Audit Event');
      expect(response.body.data).toHaveProperty('color');
      expect(response.body.data).toHaveProperty('daysUntilDue');
    });

    it('should set createdBy from authenticated user', async () => {
      mockPrisma.complianceEvent.create.mockResolvedValue(mockEvent as any);

      await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(mockPrisma.complianceEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            createdBy: 'user-1',
          }),
        })
      );
    });

    it('should compute initial status based on due date', async () => {
      mockPrisma.complianceEvent.create.mockResolvedValue(mockEvent as any);

      await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(mockPrisma.complianceEvent.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'UPCOMING',
          }),
        })
      );
    });

    it('should reject missing title', async () => {
      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, title: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject missing type', async () => {
      const { type, ...body } = validBody;

      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send(body);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid standard', async () => {
      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, standard: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject invalid date', async () => {
      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, dueDate: 'not-a-date' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional recurrence', async () => {
      mockPrisma.complianceEvent.create.mockResolvedValue({
        ...mockEvent,
        recurrence: 'QUARTERLY',
      } as any);

      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send({ ...validBody, recurrence: 'QUARTERLY' });

      expect(response.status).toBe(201);
    });

    it('should handle database errors on create', async () => {
      mockPrisma.complianceEvent.create.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .post('/api/dashboard/compliance-calendar/events')
        .set('Authorization', 'Bearer token')
        .send(validBody);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // PUT /api/dashboard/compliance-calendar/events/:id
  // =========================================================================
  describe('PUT /api/dashboard/compliance-calendar/events/:id', () => {
    it('should update an existing event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockResolvedValue({
        ...mockEvent,
        title: 'Updated Title',
      } as any);

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Title');
    });

    it('should return 404 for non-existent event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for soft-deleted event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue({
        ...mockEvent,
        deletedAt: new Date(),
      } as any);

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
    });

    it('should mark event as completed', async () => {
      const completedAt = new Date().toISOString();
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockResolvedValue({
        ...mockEvent,
        completedAt: new Date(completedAt),
        status: 'COMPLETED',
      } as any);

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ completedAt, status: 'COMPLETED' });

      expect(response.status).toBe(200);
      expect(response.body.data.computedStatus).toBe('COMPLETED');
    });

    it('should recompute status when due date changes', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockResolvedValue({
        ...mockEvent,
        dueDate: pastDate,
        status: 'OVERDUE',
      } as any);

      await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ dueDate: pastDate.toISOString() });

      expect(mockPrisma.complianceEvent.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            status: 'OVERDUE',
          }),
        })
      );
    });

    it('should handle validation errors on update', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ standard: 'INVALID_STANDARD' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors on update', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .put('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =========================================================================
  // DELETE /api/dashboard/compliance-calendar/events/:id
  // =========================================================================
  describe('DELETE /api/dashboard/compliance-calendar/events/:id', () => {
    it('should soft-delete an event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockResolvedValue({
        ...mockEvent,
        deletedAt: new Date(),
      } as any);

      const response = await request(app)
        .delete('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({ id: 'evt-1', deleted: true });
    });

    it('should return 404 for non-existent event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(null);

      const response = await request(app)
        .delete('/api/dashboard/compliance-calendar/events/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 for already deleted event', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue({
        ...mockEvent,
        deletedAt: new Date(),
      } as any);

      const response = await request(app)
        .delete('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });

    it('should handle database errors on delete', async () => {
      mockPrisma.complianceEvent.findUnique.mockResolvedValue(mockEvent as any);
      mockPrisma.complianceEvent.update.mockRejectedValue(new Error('DB error'));

      const response = await request(app)
        .delete('/api/dashboard/compliance-calendar/events/evt-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
