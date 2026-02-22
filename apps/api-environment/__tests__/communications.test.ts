import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    envCommunication: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    EnvCommunicationWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000099',
      email: 'test@test.com',
      role: 'ADMIN',
    };
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
  id: '50000000-0000-4000-a000-000000000001',
  refNumber: 'ENV-COMM-2602-0001',
  subject: 'Waste Management Community Update',
  type: 'EXTERNAL_STAKEHOLDER',
  direction: 'EXTERNAL',
  content: 'Annual update on waste reduction targets and progress',
  recipients: 'Local community board, EPA regional office',
  sender: 'test@test.com',
  relatedAspectId: 'env00000-0000-4000-a000-000000000001',
  scheduledDate: new Date('2026-04-15'),
  attendees: null,
  location: null,
  priority: 'MEDIUM',
  status: 'DRAFT',
  response: null,
  respondedBy: null,
  respondedAt: null,
  outcome: null,
  createdBy: '00000000-0000-4000-a000-000000000099',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockCommunication2 = {
  id: '50000000-0000-4000-a000-000000000002',
  refNumber: 'ENV-COMM-2602-0002',
  subject: 'Environmental awareness training reminder',
  type: 'WORKER_CONSULTATION',
  direction: 'INTERNAL',
  content: 'Reminder for annual environmental awareness training',
  recipients: 'All departments',
  sender: 'test@test.com',
  relatedAspectId: null,
  scheduledDate: new Date('2026-03-15'),
  attendees: 'All employees',
  location: 'Training Room A',
  priority: 'LOW',
  status: 'SENT',
  response: null,
  respondedBy: null,
  respondedAt: null,
  outcome: null,
  createdBy: '00000000-0000-4000-a000-000000000099',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-06'),
};

const validCreatePayload = {
  subject: 'Waste Management Community Update',
  type: 'EXTERNAL_STAKEHOLDER',
  direction: 'EXTERNAL',
  content: 'Annual update on waste reduction targets and progress',
  recipients: 'Local community board, EPA regional office',
  scheduledDate: '2026-04-15',
  priority: 'MEDIUM',
};

// ==========================================
// Tests
// ==========================================

describe('Environment Communications API Routes', () => {
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
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envCommunication.create as jest.Mock).mockResolvedValueOnce(mockCommunication);

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.subject).toBe('Waste Management Community Update');
      expect(response.body.data.type).toBe('EXTERNAL_STAKEHOLDER');
      expect(response.body.data.direction).toBe('EXTERNAL');
      expect(response.body.data.refNumber).toContain('ENV-COMM');
    });

    it('should create with only required fields', async () => {
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.envCommunication.create as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication2,
      });

      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          subject: 'Quick env update',
          type: 'MANAGEMENT_NOTIFICATION',
          direction: 'INTERNAL',
          content: 'Brief environmental metric update',
        });

      expect(response.status).toBe(201);
    });

    it('should return 400 when subject is missing', async () => {
      const response = await request(app)
        .post('/api/communications')
        .set('Authorization', 'Bearer token')
        .send({
          type: 'TOOLBOX_TALK',
          direction: 'INTERNAL',
          content: 'Content',
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
          content: 'Content',
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
          direction: 'BOTH',
          content: 'Content',
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
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envCommunication.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

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
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        mockCommunication,
        mockCommunication2,
      ]);
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/communications')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
    });

    it('should filter by direction', async () => {
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        mockCommunication,
      ]);
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/communications?direction=EXTERNAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ direction: 'EXTERNAL', deletedAt: null }),
        })
      );
    });

    it('should filter by type', async () => {
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/communications?type=REGULATORY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'REGULATORY' }),
        })
      );
    });

    it('should support pagination', async () => {
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(40);

      const response = await request(app)
        .get('/api/communications?page=2&limit=15')
        .set('Authorization', 'Bearer token');

      expect(response.body.data.page).toBe(2);
      expect(response.body.data.limit).toBe(15);

      expect(mockPrisma.envCommunication.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 15, take: 15 })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.envCommunication.findMany as jest.Mock).mockRejectedValueOnce(
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
  // GET /participation — Summary
  // ==========================================
  describe('GET /api/communications/participation', () => {
    it('should return participation summary', async () => {
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(4);
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([
        {
          type: 'WORKER_CONSULTATION',
          direction: 'INTERNAL',
          status: 'CLOSED',
          createdAt: new Date(),
        },
        { type: 'TOOLBOX_TALK', direction: 'INTERNAL', status: 'CLOSED', createdAt: new Date() },
        {
          type: 'EXTERNAL_STAKEHOLDER',
          direction: 'EXTERNAL',
          status: 'SENT',
          createdAt: new Date(),
        },
        {
          type: 'REGULATORY',
          direction: 'EXTERNAL',
          status: 'ACKNOWLEDGED',
          createdAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get('/api/communications/participation')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(4);
      expect(response.body.data.workerConsultations).toBe(1);
      expect(response.body.data.toolboxTalks).toBe(1);
      expect(response.body.data.participationScore).toBe(50);
    });

    it('should handle empty data', async () => {
      (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/communications/participation')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.participationScore).toBe(0);
    });
  });

  // ==========================================
  // GET /:id — Get detail
  // ==========================================
  describe('GET /api/communications/:id', () => {
    it('should return a communication by ID', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCommunication
      );

      const response = await request(app)
        .get('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.subject).toBe('Waste Management Community Update');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });
  });

  // ==========================================
  // PUT /:id — Update
  // ==========================================
  describe('PUT /api/communications/:id', () => {
    it('should update a communication', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCommunication
      );
      (mockPrisma.envCommunication.update as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        status: 'SENT',
      });

      const response = await request(app)
        .put('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SENT' });

      expect(response.status).toBe(200);
      expect(response.body.data.status).toBe('SENT');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ status: 'SENT' });

      expect(response.status).toBe(404);
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCommunication
      );

      const response = await request(app)
        .put('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // ==========================================
  // DELETE /:id — Soft delete
  // ==========================================
  describe('DELETE /api/communications/:id', () => {
    it('should soft-delete a communication', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(
        mockCommunication
      );
      (mockPrisma.envCommunication.update as jest.Mock).mockResolvedValueOnce({
        ...mockCommunication,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.message).toBe('Communication deleted');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/communications/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.envCommunication.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/communications/50000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

describe('Environment Communications API — additional coverage', () => {
  let app2: express.Express;

  beforeAll(() => {
    app2 = express();
    app2.use(express.json());
    app2.use('/api/communications', communicationsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / returns totalPages in pagination metadata', async () => {
    (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([mockCommunication]);
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(45);

    const response = await request(app2)
      .get('/api/communications?page=1&limit=15')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data.totalPages).toBe(3);
  });

  it('GET / filters by status=SENT', async () => {
    (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([mockCommunication2]);
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(1);

    await request(app2)
      .get('/api/communications?status=SENT')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envCommunication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'SENT' }),
      })
    );
  });

  it('GET / filters by status=DRAFT', async () => {
    (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([mockCommunication]);
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(1);

    await request(app2)
      .get('/api/communications?status=DRAFT')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envCommunication.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: 'DRAFT' }),
      })
    );
  });

  it('PUT /:id returns 500 on update DB error', async () => {
    (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);
    (mockPrisma.envCommunication.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app2)
      .put('/api/communications/50000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'SENT' });

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /participation returns 500 on DB error', async () => {
    (mockPrisma.envCommunication.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const response = await request(app2)
      .get('/api/communications/participation')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    (mockPrisma.envCommunication.findUnique as jest.Mock).mockRejectedValueOnce(
      new Error('DB error')
    );

    const response = await request(app2)
      .get('/api/communications/50000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns success:true on create', async () => {
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.envCommunication.create as jest.Mock).mockResolvedValueOnce(mockCommunication);

    const response = await request(app2)
      .post('/api/communications')
      .set('Authorization', 'Bearer token')
      .send({
        subject: 'Another Update',
        type: 'EXTERNAL_STAKEHOLDER',
        direction: 'EXTERNAL',
        content: 'Detailed external update for stakeholders',
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
  });

  it('GET / filters by priority=HIGH', async () => {
    (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([]);
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(0);

    await request(app2)
      .get('/api/communications?priority=HIGH')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.envCommunication.findMany).toHaveBeenCalled();
  });

  it('GET /:id returns success:true for existing communication', async () => {
    (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(mockCommunication);

    const response = await request(app2)
      .get('/api/communications/50000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  it('DELETE /:id returns 404 for already deleted item', async () => {
    (mockPrisma.envCommunication.findUnique as jest.Mock).mockResolvedValueOnce(null);

    const response = await request(app2)
      .delete('/api/communications/00000000-0000-4000-a000-ffffffffffff')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('NOT_FOUND');
  });

  it('GET / returns data.total count', async () => {
    (mockPrisma.envCommunication.findMany as jest.Mock).mockResolvedValueOnce([mockCommunication, mockCommunication2]);
    (mockPrisma.envCommunication.count as jest.Mock).mockResolvedValueOnce(2);

    const response = await request(app2)
      .get('/api/communications')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data.total).toBe(2);
  });
});
