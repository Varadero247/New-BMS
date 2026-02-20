import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    hSCommunication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    HsCommunicationWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
  metricsMiddleware: () => (_req: any, _res: any, next: any) => next(),
  metricsHandler: (_req: any, res: any) => res.json({}),
  correlationIdMiddleware: () => (_req: any, _res: any, next: any) => next(),
  createHealthCheck: () => (_req: any, res: any) => res.json({ status: 'ok' }),
}));

jest.mock('@ims/validation', () => ({
  sanitizeMiddleware: () => (_req: any, _res: any, next: any) => next(),
  sanitizeQueryMiddleware: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any, _val: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import communicationsRouter from '../src/routes/communications';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockCommunication = {
  id: '40000000-0000-4000-a000-000000000001',
  refNumber: 'HS-COMM-2602-0001',
  subject: 'Monthly Safety Briefing',
  type: 'TOOLBOX_TALK',
  direction: 'INTERNAL',
  content: 'Topics: PPE usage, fire evacuation, near-miss reporting',
  recipients: 'All site personnel',
  sender: 'test@test.com',
  relatedIncidentId: null,
  scheduledDate: new Date('2026-03-01'),
  attendees: 'Site A team',
  location: 'Conference Room B',
  priority: 'MEDIUM',
  status: 'DRAFT',
  response: null,
  respondedBy: null,
  respondedAt: null,
  outcome: null,
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockCommunication2 = {
  id: '40000000-0000-4000-a000-000000000002',
  refNumber: 'HS-COMM-2602-0002',
  subject: 'Regulatory update from OSHA',
  type: 'REGULATORY',
  direction: 'EXTERNAL',
  content: 'New fall protection requirements effective Q2 2026',
  recipients: 'Safety Manager, Site Supervisor',
  sender: 'osha@compliance.gov',
  relatedIncidentId: null,
  scheduledDate: null,
  attendees: null,
  location: null,
  priority: 'HIGH',
  status: 'ACKNOWLEDGED',
  response: null,
  respondedBy: null,
  respondedAt: null,
  outcome: null,
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-06'),
};

const validCreatePayload = {
  subject: 'Monthly Safety Briefing',
  type: 'TOOLBOX_TALK',
  direction: 'INTERNAL',
  content: 'Topics: PPE usage, fire evacuation, near-miss reporting',
  recipients: 'All site personnel',
  scheduledDate: '2026-03-01',
  attendees: 'Site A team',
  location: 'Conference Room B',
  priority: 'MEDIUM',
};

// ==========================================
// Tests
// ==========================================

describe('Health & Safety Communications API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/communications', communicationsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / — Create communication
  // ==========================================
  describe('POST /api/communications', () => {
    it('should create a communication successfully', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hSCommunication.create as jest.Mock).mockResolvedValueOnce(mockCommunication);

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Monthly Safety Briefing');
      expect(response.body.data.type).toBe('TOOLBOX_TALK');
      expect(response.body.data.direction).toBe('INTERNAL');
      expect(response.body.data.status).toBe('DRAFT');
    });

    it('should create a communication with only required fields', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.hSCommunication.create as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        refNumber: 'HS-COMM-2602-0002',
      });

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          subject: 'Quick update',
          type: 'MANAGEMENT_NOTIFICATION',
          direction: 'INTERNAL',
          content: 'Brief update on safety metrics',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when subject is missing', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          type: 'TOOLBOX_TALK',
          direction: 'INTERNAL',
          content: 'Some content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when type is invalid', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          subject: 'Test',
          type: 'INVALID_TYPE',
          direction: 'INTERNAL',
          content: 'Some content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when direction is invalid', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          subject: 'Test',
          type: 'TOOLBOX_TALK',
          direction: 'SIDEWAYS',
          content: 'Some content',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when content is missing', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          subject: 'Test',
          type: 'TOOLBOX_TALK',
          direction: 'INTERNAL',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hSCommunication.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create communication');
    });
  });

  // ==========================================
  // GET / — List communications
  // ==========================================
  describe('GET /api/communications', () => {
    it('should return a list with default pagination', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        mockCommunication,
        mockCommunication2,
      ]);
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/communications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter by direction', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([mockCommunication]);
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/communications?direction=INTERNAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ direction: 'INTERNAL', deletedAt: null }),
        })
      );
    });

    it('should filter by type', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        mockCommunication2,
      ]);
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/communications?type=REGULATORY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'REGULATORY' }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/communications?status=SENT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.hSCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'SENT' }),
        })
      );
    });

    it('should support pagination', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/communications?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);

      expect(mockPrisma.hSCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/communications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /participation — Worker participation
  // ==========================================
  describe('GET /api/communications/participation', () => {
    it('should return participation summary', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        {
          type: 'WORKER_CONSULTATION',
          direction: 'INTERNAL',
          status: 'CLOSED',
          createdAt: new Date(),
        },
        { type: 'TOOLBOX_TALK', direction: 'INTERNAL', status: 'CLOSED', createdAt: new Date() },
        {
          type: 'COMMITTEE_MEETING',
          direction: 'INTERNAL',
          status: 'CLOSED',
          createdAt: new Date(),
        },
        {
          type: 'REGULATORY',
          direction: 'EXTERNAL',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(),
        },
        {
          type: 'MANAGEMENT_NOTIFICATION',
          direction: 'INTERNAL',
          status: 'SENT',
          createdAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get('/api/communications/participation')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(5);
      expect(response.body.data.workerConsultations).toBe(1);
      expect(response.body.data.toolboxTalks).toBe(1);
      expect(response.body.data.committeeMeetings).toBe(1);
      expect(response.body.data.participationScore).toBe(60);
      expect(response.body.data.byType).toBeDefined();
      expect(response.body.data.byDirection).toBeDefined();
    });

    it('should handle empty data', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.hSCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/communications/participation')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.participationScore).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.hSCommunication.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/communications/participation')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /:id — Get detail
  // ==========================================
  describe('GET /api/communications/:id', () => {
    it('should return a communication by ID', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);

      const response = await request(app)
        .get('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Monthly Safety Briefing');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });
  });

  // ==========================================
  // PUT /:id — Update/respond
  // ==========================================
  describe('PUT /api/communications/:id', () => {
    it('should update a communication', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);
      (mockPrisma.hSCommunication.update as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        status: 'SENT',
        subject: 'Updated briefing',
      });

      const response = await request(app)
        .put('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SENT', subject: 'Updated briefing' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('SENT');
    });

    it('should add a response with respondedBy and respondedAt', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCommunication2
      );
      (mockPrisma.hSCommunication.update as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication2,
        response: 'We acknowledge the new requirements',
        respondedBy: 'user-1',
        respondedAt: new Date(),
        status: 'RESPONDED',
      });

      const response = await request(app)
        .put('/api/communications/40000000-0000-4000-a000-000000000002')
        .set('Authorization', 'Bearer token')
        .send({ response: 'We acknowledge the new requirements', status: 'RESPONDED' });

      expect(response.status).toBe(200);
      expect(response.body.data.response).toBe('We acknowledge the new requirements');

      expect(mockPrisma.hSCommunication.update).toHaveBeenCalledWith({
        where: { id: '40000000-0000-4000-a000-000000000002' },
        data: expect.objectContaining({
          response: 'We acknowledge the new requirements',
          respondedBy: 'user-1',
          respondedAt: expect.any(Date),
          status: 'RESPONDED',
        }),
      });
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SENT' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);

      const response = await request(app)
        .put('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SENT' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // DELETE /:id — Soft delete
  // ==========================================
  describe('DELETE /api/communications/:id', () => {
    it('should soft-delete a communication', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);
      (mockPrisma.hSCommunication.update as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Communication deleted');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.hSCommunication.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/communications/40000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
