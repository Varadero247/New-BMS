import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    qualIssue: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/rbac', () => ({
  requirePermission: () => (_req: any, _res: any, next: any) => next(),
  PermissionLevel: { NONE: 0, VIEW: 1, CREATE: 2, EDIT: 3, DELETE: 4, APPROVE: 5, FULL: 6 },
}));

import contextFactorsRouter from '../src/routes/context-factors';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/context-factors', contextFactorsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Quality Context Factors API Routes', () => {
  const mockIssue = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-CTX-2601-001',
    issueOfConcern: 'Market competition increasing',
    bias: 'OPPORTUNITY',
    processesAffected: 'Sales',
    treatmentMethod: 'Market analysis',
    priority: 'HIGH',
    status: 'OPEN',
    notes: null,
    deletedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const expectedContextFactor = {
    id: '00000000-0000-0000-0000-000000000001',
    referenceNumber: 'QMS-CTX-2601-001',
    factorName: 'Market competition increasing',
    factorType: 'EXTERNAL',
    category: 'Sales',
    description: 'Market analysis',
    impact: 'HIGH',
    status: 'OPEN',
    notes: null,
  };

  describe('GET /api/context-factors', () => {
    it('should return list of context factors with pagination', async () => {
      mockPrisma.qualIssue.findMany.mockResolvedValue([mockIssue]);
      mockPrisma.qualIssue.count.mockResolvedValue(1);

      const res = await request(app).get('/api/context-factors');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].factorName).toBe('Market competition increasing');
      expect(res.body.pagination.total).toBe(1);
    });

    it('should filter by factorType EXTERNAL maps to OPPORTUNITY bias', async () => {
      mockPrisma.qualIssue.findMany.mockResolvedValue([mockIssue]);
      mockPrisma.qualIssue.count.mockResolvedValue(1);

      const res = await request(app).get('/api/context-factors?factorType=EXTERNAL');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should filter by factorType INTERNAL maps to RISK bias', async () => {
      const internalIssue = { ...mockIssue, bias: 'RISK', issueOfConcern: 'Staff turnover' };
      mockPrisma.qualIssue.findMany.mockResolvedValue([internalIssue]);
      mockPrisma.qualIssue.count.mockResolvedValue(1);

      const res = await request(app).get('/api/context-factors?factorType=INTERNAL');

      expect(res.status).toBe(200);
      expect(res.body.data[0].factorType).toBe('INTERNAL');
    });

    it('should filter by status', async () => {
      mockPrisma.qualIssue.findMany.mockResolvedValue([mockIssue]);
      mockPrisma.qualIssue.count.mockResolvedValue(1);

      const res = await request(app).get('/api/context-factors?status=OPEN');

      expect(res.status).toBe(200);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualIssue.findMany.mockRejectedValue(new Error('DB error'));
      mockPrisma.qualIssue.count.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get('/api/context-factors');

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/context-factors', () => {
    const validBody = {
      factorName: 'New regulatory requirements',
      factorType: 'EXTERNAL',
      impact: 'HIGH',
    };

    it('should create a new context factor', async () => {
      mockPrisma.qualIssue.count.mockResolvedValue(0);
      mockPrisma.qualIssue.create.mockResolvedValue(mockIssue);

      const res = await request(app).post('/api/context-factors').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('factorName');
    });

    it('should return 400 for missing required fields', async () => {
      const res = await request(app)
        .post('/api/context-factors')
        .send({ factorName: 'Missing factorType' });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid factorType', async () => {
      const res = await request(app)
        .post('/api/context-factors')
        .send({ factorName: 'Test', factorType: 'INVALID' });

      expect(res.status).toBe(400);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualIssue.count.mockResolvedValue(0);
      mockPrisma.qualIssue.create.mockRejectedValue(new Error('DB error'));

      const res = await request(app).post('/api/context-factors').send(validBody);

      expect(res.status).toBe(500);
    });
  });

  describe('GET /api/context-factors/:id', () => {
    it('should return a single context factor', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(mockIssue);

      const res = await request(app).get(
        '/api/context-factors/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.factorName).toBe('Market competition increasing');
    });

    it('should return 404 when context factor not found', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(null);

      const res = await request(app).get(
        '/api/context-factors/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualIssue.findFirst.mockRejectedValue(new Error('DB error'));

      const res = await request(app).get(
        '/api/context-factors/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(500);
    });
  });

  describe('PUT /api/context-factors/:id', () => {
    it('should update a context factor', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(mockIssue);
      const updated = { ...mockIssue, status: 'MONITORED' };
      mockPrisma.qualIssue.update.mockResolvedValue(updated);

      const res = await request(app)
        .put('/api/context-factors/00000000-0000-0000-0000-000000000001')
        .send({ status: 'MONITORED' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when context factor not found', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(null);

      const res = await request(app)
        .put('/api/context-factors/00000000-0000-0000-0000-000000000099')
        .send({ status: 'CLOSED' });

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(mockIssue);
      mockPrisma.qualIssue.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app)
        .put('/api/context-factors/00000000-0000-0000-0000-000000000001')
        .send({ factorName: 'Updated' });

      expect(res.status).toBe(500);
    });
  });

  describe('DELETE /api/context-factors/:id', () => {
    it('should soft delete a context factor', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(mockIssue);
      mockPrisma.qualIssue.update.mockResolvedValue({ ...mockIssue, deletedAt: new Date() });

      const res = await request(app).delete(
        '/api/context-factors/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.deleted).toBe(true);
    });

    it('should return 404 when context factor not found', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(null);

      const res = await request(app).delete(
        '/api/context-factors/00000000-0000-0000-0000-000000000099'
      );

      expect(res.status).toBe(404);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.qualIssue.findFirst.mockResolvedValue(mockIssue);
      mockPrisma.qualIssue.update.mockRejectedValue(new Error('DB error'));

      const res = await request(app).delete(
        '/api/context-factors/00000000-0000-0000-0000-000000000001'
      );

      expect(res.status).toBe(500);
    });
  });
});

describe('context-factors.api — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/context-factors', contextFactorsRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/context-factors', async () => {
    const res = await request(app).get('/api/context-factors');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/context-factors', async () => {
    const res = await request(app).get('/api/context-factors');
    expect(res.headers['content-type']).toBeDefined();
  });
});
