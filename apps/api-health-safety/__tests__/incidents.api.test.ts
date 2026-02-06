import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('@ims/database', () => ({
  prisma: {
    incident: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req, res, next) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '@ims/database';
import incidentsRoutes from '../src/routes/incidents';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Health & Safety Incidents API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/incidents', incidentsRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/incidents', () => {
    const mockIncidents = [
      {
        id: 'incident-1',
        title: 'Slip and fall',
        description: 'Employee slipped on wet floor',
        standard: 'ISO_45001',
        type: 'INJURY',
        severity: 'MINOR',
        status: 'OPEN',
        dateOccurred: new Date('2024-01-15'),
        reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
        investigator: null,
      },
      {
        id: 'incident-2',
        title: 'Near miss - forklift',
        description: 'Forklift almost hit pedestrian',
        standard: 'ISO_45001',
        type: 'NEAR_MISS',
        severity: 'MODERATE',
        status: 'UNDER_INVESTIGATION',
        dateOccurred: new Date('2024-01-14'),
        reporter: { id: 'user-2', firstName: 'Jane', lastName: 'Smith' },
        investigator: { id: 'user-3', firstName: 'Bob', lastName: 'Wilson' },
      },
    ];

    it('should return list of incidents with pagination', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce(mockIncidents as any);
      mockPrisma.incident.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should include reporter and investigator info', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce(mockIncidents as any);
      mockPrisma.incident.count.mockResolvedValueOnce(2);

      await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          include: expect.objectContaining({
            reporter: expect.any(Object),
            investigator: expect.any(Object),
          }),
        })
      );
    });

    it('should support pagination parameters', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([mockIncidents[0]] as any);
      mockPrisma.incident.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/incidents?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter by status', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([]);
      mockPrisma.incident.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/incidents?status=CLOSED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CLOSED',
          }),
        })
      );
    });

    it('should filter by type', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([]);
      mockPrisma.incident.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/incidents?type=NEAR_MISS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'NEAR_MISS',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([]);
      mockPrisma.incident.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/incidents?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'CRITICAL',
          }),
        })
      );
    });

    it('should order by dateOccurred descending', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce(mockIncidents as any);
      mockPrisma.incident.count.mockResolvedValueOnce(2);

      await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { dateOccurred: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/incidents')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/incidents/:id', () => {
    const mockIncident = {
      id: 'incident-1',
      title: 'Slip and fall',
      description: 'Employee slipped on wet floor',
      standard: 'ISO_45001',
      type: 'INJURY',
      status: 'OPEN',
      reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      investigator: null,
      actions: [],
      fiveWhyAnalysis: null,
      fishboneAnalysis: null,
    };

    it('should return single incident with related data', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(mockIncident as any);

      const response = await request(app)
        .get('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('incident-1');
    });

    it('should include actions and analysis data', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(mockIncident as any);

      await request(app)
        .get('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findFirst).toHaveBeenCalledWith({
        where: { id: 'incident-1', standard: 'ISO_45001' },
        include: expect.objectContaining({
          actions: true,
          fiveWhyAnalysis: true,
          fishboneAnalysis: true,
        }),
      });
    });

    it('should return 404 for non-existent incident', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/incidents/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/incidents', () => {
    const createPayload = {
      title: 'New Incident',
      description: 'Description of what happened',
      type: 'INJURY',
      severity: 'MINOR',
      dateOccurred: '2024-01-15T10:00:00Z',
      location: 'Warehouse A',
    };

    it('should create an incident successfully', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-incident-123',
        ...createPayload,
        standard: 'ISO_45001',
        referenceNumber: 'HS-2401-1234',
        status: 'OPEN',
        reporterId: 'user-123',
      } as any);

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should set reporterId from authenticated user', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-incident-123',
        reporterId: 'user-123',
      } as any);

      await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          reporterId: 'user-123',
        }),
      });
    });

    it('should generate a reference number', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-incident-123',
        referenceNumber: 'HS-2401-1234',
      } as any);

      await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^HS-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should set initial status to OPEN', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-incident-123',
        status: 'OPEN',
      } as any);

      await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'OPEN',
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const { title, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const { description, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, type: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing dateOccurred', async () => {
      const { dateOccurred, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept optional injury details', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-incident-123',
        injuryType: 'Laceration',
        bodyPart: 'Hand',
        daysLost: 3,
      } as any);

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          injuryType: 'Laceration',
          bodyPart: 'Hand',
          daysLost: 3,
        });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/incidents')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/incidents/:id', () => {
    const existingIncident = {
      id: 'incident-1',
      title: 'Existing Incident',
      standard: 'ISO_45001',
      status: 'OPEN',
      closedAt: null,
    };

    it('should update incident successfully', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        ...existingIncident,
        title: 'Updated Title',
      } as any);

      const response = await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent incident', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/incidents/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should allow assigning investigator', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'incident-1',
        investigatorId: 'investigator-123',
      } as any);

      await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ investigatorId: 'investigator-123' });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
        data: expect.objectContaining({
          investigatorId: 'investigator-123',
        }),
      });
    });

    it('should set closedAt when status is CLOSED', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'incident-1',
        status: 'CLOSED',
        closedAt: new Date(),
      } as any);

      await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
        data: expect.objectContaining({
          closedAt: expect.any(Date),
        }),
      });
    });

    it('should allow updating root cause analysis', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'incident-1',
        immediateCause: 'Wet floor',
        rootCauses: 'Inadequate cleaning schedule',
      } as any);

      await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({
          immediateCause: 'Wet floor',
          rootCauses: 'Inadequate cleaning schedule',
        });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
        data: expect.objectContaining({
          immediateCause: 'Wet floor',
          rootCauses: 'Inadequate cleaning schedule',
        }),
      });
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);

      const response = await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingIncident as any);

      const response = await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ type: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/incidents/:id', () => {
    it('should delete incident successfully', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce({ id: 'incident-1' } as any);
      mockPrisma.incident.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.incident.delete).toHaveBeenCalledWith({
        where: { id: 'incident-1' },
      });
    });

    it('should return 404 for non-existent incident', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/incidents/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should only delete incidents for ISO_45001 standard', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .delete('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findFirst).toHaveBeenCalledWith({
        where: { id: 'incident-1', standard: 'ISO_45001' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/incidents/incident-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
