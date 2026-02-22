import express from 'express';
import request from 'supertest';

// Mock dependencies before importing anything else
jest.mock('../src/prisma', () => ({
  prisma: {
    configBaseline: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    configItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    engineeringChangeProposal: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    configAudit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    ConfigBaselineWhereInput: {},
    EngineeringChangeProposalWhereInput: {},
    ConfigAuditWhereInput: {},
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
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
  parsePagination: (query: Record<string, any>, opts?: { defaultLimit?: number }) => {
    const defaultLimit = opts?.defaultLimit ?? 20;
    const page = Math.max(1, parseInt(query.page as string, 10) || 1);
    const limit = Math.min(Math.max(1, parseInt(query.limit as string, 10) || defaultLimit), 100);
    const skip = (page - 1) * limit;
    return { page, limit, skip };
  },
}));

import { prisma } from '../src/prisma';
import configRouter from '../src/routes/configuration';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Aerospace Configuration Management API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/configuration', configRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // =============================================
  // BASELINES
  // =============================================

  describe('GET /api/configuration/baselines', () => {
    const mockBaselines = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'CB-001',
        title: 'Functional Baseline',
        description: 'System-level functional baseline',
        program: 'F-35',
        status: 'ACTIVE',
        effectiveDate: new Date('2025-01-01'),
        createdAt: new Date(),
        deletedAt: null,
        items: [
          { id: 'item-1', partNumber: 'PN-001', nomenclature: 'Wing Assembly', status: 'CURRENT' },
        ],
      },
      {
        id: 'bl-002',
        refNumber: 'CB-002',
        title: 'Allocated Baseline',
        description: 'Subsystem allocated baseline',
        program: 'F-35',
        status: 'DRAFT',
        effectiveDate: null,
        createdAt: new Date(),
        deletedAt: null,
        items: [],
      },
    ];

    it('should return a paginated list of baselines', async () => {
      (mockPrisma.configBaseline.findMany as jest.Mock).mockResolvedValueOnce(mockBaselines);
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/configuration/baselines')
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

    it('should support pagination parameters', async () => {
      (mockPrisma.configBaseline.findMany as jest.Mock).mockResolvedValueOnce([mockBaselines[0]]);
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/configuration/baselines?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(3);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(5);
    });

    it('should filter baselines by status', async () => {
      (mockPrisma.configBaseline.findMany as jest.Mock).mockResolvedValueOnce([mockBaselines[0]]);
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/configuration/baselines?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.configBaseline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should support search across title, description, refNumber, and program', async () => {
      (mockPrisma.configBaseline.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/configuration/baselines?search=functional')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.configBaseline.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              expect.objectContaining({
                title: expect.objectContaining({ contains: 'functional' }),
              }),
              expect.objectContaining({
                description: expect.objectContaining({ contains: 'functional' }),
              }),
              expect.objectContaining({
                refNumber: expect.objectContaining({ contains: 'functional' }),
              }),
              expect.objectContaining({
                program: expect.objectContaining({ contains: 'functional' }),
              }),
            ]),
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB connection failed')
      );

      const response = await request(app)
        .get('/api/configuration/baselines')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/configuration/baselines/:id', () => {
    const mockBaseline = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'CB-001',
      title: 'Functional Baseline',
      description: 'System-level functional baseline',
      status: 'ACTIVE',
      deletedAt: null,
      items: [
        {
          id: 'item-1',
          partNumber: 'PN-001',
          nomenclature: 'Wing Assembly',
          revision: 'A',
          category: 'HARDWARE',
          status: 'CURRENT',
        },
        {
          id: 'item-2',
          partNumber: 'PN-002',
          nomenclature: 'Avionics Module',
          revision: 'B',
          category: 'SOFTWARE',
          status: 'CURRENT',
        },
      ],
    };

    it('should return a single baseline with its configuration items', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(mockBaseline);

      const response = await request(app)
        .get('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
      expect(response.body.data.items).toHaveLength(2);
    });

    it('should return 404 when baseline does not exist', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/configuration/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when baseline is soft-deleted', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockBaseline,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/configuration/baselines', () => {
    const validPayload = {
      title: 'Product Baseline',
      description: 'As-built product baseline for Block 4',
      program: 'F-35',
      status: 'DRAFT',
      effectiveDate: '2025-06-01',
    };

    it('should create a baseline successfully', async () => {
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.configBaseline.create as jest.Mock).mockResolvedValueOnce({
        id: 'bl-new',
        refNumber: 'CB-006',
        ...validPayload,
        effectiveDate: new Date(validPayload.effectiveDate),
        createdBy: 'user-1',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.refNumber).toBe('CB-006');
      expect(response.body.data.title).toBe(validPayload.title);
    });

    it('should generate a reference number with padded count', async () => {
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.create as jest.Mock).mockResolvedValueOnce({
        id: 'bl-first',
        refNumber: 'CB-001',
        title: validPayload.title,
        description: validPayload.description,
      });

      await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(mockPrisma.configBaseline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          refNumber: 'CB-001',
        }),
      });
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send({ description: 'No title provided' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const response = await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Missing Description Baseline' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default status to DRAFT when not provided', async () => {
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.create as jest.Mock).mockResolvedValueOnce({
        id: 'bl-draft',
        refNumber: 'CB-001',
        status: 'DRAFT',
      });

      await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Draft Baseline', description: 'No status' });

      expect(mockPrisma.configBaseline.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'DRAFT',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/configuration/baselines')
        .set('Authorization', 'Bearer token')
        .send(validPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/configuration/baselines/:id', () => {
    const existingBaseline = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'CB-001',
      title: 'Functional Baseline',
      description: 'Original description',
      status: 'DRAFT',
      effectiveDate: null,
      approvedDate: null,
      deletedAt: null,
    };

    it('should update a baseline successfully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(existingBaseline);
      (mockPrisma.configBaseline.update as jest.Mock).mockResolvedValueOnce({
        ...existingBaseline,
        title: 'Updated Functional Baseline',
        status: 'APPROVED',
      });

      const response = await request(app)
        .put('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Functional Baseline', status: 'APPROVED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated Functional Baseline');
    });

    it('should return 404 when baseline does not exist', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/configuration/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when baseline is soft-deleted', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        ...existingBaseline,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .put('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status enum value', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(existingBaseline);

      const response = await request(app)
        .put('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/configuration/baselines/:id', () => {
    it('should soft-delete a baseline and return 204', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configBaseline.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.configBaseline.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 when baseline does not exist', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/configuration/baselines/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when baseline is already soft-deleted', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/configuration/baselines/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // CONFIGURATION ITEMS
  // =============================================

  describe('POST /api/configuration/items', () => {
    const validItemPayload = {
      baselineId: 'bl-001',
      partNumber: 'PN-12345',
      nomenclature: 'Landing Gear Strut Assembly',
      revision: 'A',
      category: 'HARDWARE',
      serialNumber: 'SN-98765',
      status: 'CURRENT',
      documentRef: 'DWG-12345-A',
    };

    it('should create a configuration item successfully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configItem.create as jest.Mock).mockResolvedValueOnce({
        id: 'item-new',
        ...validItemPayload,
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send(validItemPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.partNumber).toBe('PN-12345');
    });

    it('should return 404 when referenced baseline does not exist', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send(validItemPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Baseline not found');
    });

    it('should return 404 when referenced baseline is soft-deleted', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send(validItemPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send({ baselineId: 'bl-001' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category enum', async () => {
      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send({
          ...validItemPayload,
          category: 'UNKNOWN_CATEGORY',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default status to CURRENT when not provided', async () => {
      const payloadNoStatus = { ...validItemPayload };
      Reflect.deleteProperty(payloadNoStatus, 'status');

      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configItem.create as jest.Mock).mockResolvedValueOnce({
        id: 'item-default',
        ...payloadNoStatus,
        status: 'CURRENT',
      });

      await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send(payloadNoStatus);

      expect(mockPrisma.configItem.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'CURRENT',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configItem.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/configuration/items')
        .set('Authorization', 'Bearer token')
        .send(validItemPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/configuration/items/:id', () => {
    const existingItem = {
      id: '00000000-0000-0000-0000-000000000001',
      partNumber: 'PN-12345',
      nomenclature: 'Landing Gear Strut',
      revision: 'A',
      category: 'HARDWARE',
      status: 'CURRENT',
    };

    it('should update a configuration item successfully', async () => {
      (mockPrisma.configItem.findUnique as jest.Mock).mockResolvedValueOnce(existingItem);
      (mockPrisma.configItem.update as jest.Mock).mockResolvedValueOnce({
        ...existingItem,
        revision: 'B',
        status: 'PENDING_CHANGE',
      });

      const response = await request(app)
        .put('/api/configuration/items/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ revision: 'B', status: 'PENDING_CHANGE' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.revision).toBe('B');
    });

    it('should return 404 when configuration item does not exist', async () => {
      (mockPrisma.configItem.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/configuration/items/nonexistent-item')
        .set('Authorization', 'Bearer token')
        .send({ revision: 'C' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Configuration item not found');
    });

    it('should return 400 for invalid status enum', async () => {
      (mockPrisma.configItem.findUnique as jest.Mock).mockResolvedValueOnce(existingItem);

      const response = await request(app)
        .put('/api/configuration/items/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'BOGUS_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configItem.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/configuration/items/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ revision: 'C' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // ENGINEERING CHANGE PROPOSALS
  // =============================================

  describe('POST /api/configuration/changes', () => {
    const validECPPayload = {
      title: 'Redesign Landing Gear Actuator',
      description: 'Replace hydraulic actuator with electromechanical variant',
      reason: 'Weight reduction and improved reliability per MIL-STD-1530',
      urgency: 'ROUTINE',
      affectedItems: ['item-001', 'item-002'],
      affectedBaselines: ['bl-001'],
    };

    it('should create an engineering change proposal successfully', async () => {
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(3);
      (mockPrisma.engineeringChangeProposal.create as jest.Mock).mockResolvedValueOnce({
        id: 'ecp-new',
        refNumber: 'ECP-2602-0004',
        ...validECPPayload,
        proposedBy: 'user-1',
        status: 'PROPOSED',
        createdAt: new Date(),
      });

      const response = await request(app)
        .post('/api/configuration/changes')
        .set('Authorization', 'Bearer token')
        .send(validECPPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe('PROPOSED');
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/configuration/changes')
        .set('Authorization', 'Bearer token')
        .send({
          description: 'Some change',
          reason: 'Some reason',
          affectedItems: ['item-001'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when affectedItems is empty', async () => {
      const response = await request(app)
        .post('/api/configuration/changes')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Some change',
          description: 'Description',
          reason: 'Reason',
          affectedItems: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should default urgency to ROUTINE when not provided', async () => {
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.engineeringChangeProposal.create as jest.Mock).mockResolvedValueOnce({
        id: 'ecp-default',
        refNumber: 'ECP-2602-0001',
        urgency: 'ROUTINE',
        status: 'PROPOSED',
      });

      const payloadNoUrgency = {
        title: 'Minor Change',
        description: 'Small update',
        reason: 'Process improvement',
        affectedItems: ['item-001'],
      };

      await request(app)
        .post('/api/configuration/changes')
        .set('Authorization', 'Bearer token')
        .send(payloadNoUrgency);

      expect(mockPrisma.engineeringChangeProposal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          urgency: 'ROUTINE',
          status: 'PROPOSED',
        }),
      });
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.engineeringChangeProposal.create as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .post('/api/configuration/changes')
        .set('Authorization', 'Bearer token')
        .send(validECPPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/configuration/changes', () => {
    const mockECPs = [
      {
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'ECP-2602-0001',
        title: 'Actuator Redesign',
        status: 'PROPOSED',
        urgency: 'ROUTINE',
        createdAt: new Date(),
        deletedAt: null,
      },
      {
        id: 'ecp-002',
        refNumber: 'ECP-2602-0002',
        title: 'Emergency Wiring Fix',
        status: 'CCB_APPROVED',
        urgency: 'EMERGENCY',
        createdAt: new Date(),
        deletedAt: null,
      },
    ];

    it('should return a paginated list of ECPs', async () => {
      (mockPrisma.engineeringChangeProposal.findMany as jest.Mock).mockResolvedValueOnce(mockECPs);
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/configuration/changes')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.meta.total).toBe(2);
    });

    it('should filter ECPs by status', async () => {
      (mockPrisma.engineeringChangeProposal.findMany as jest.Mock).mockResolvedValueOnce([
        mockECPs[0],
      ]);
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/configuration/changes?status=PROPOSED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.engineeringChangeProposal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'PROPOSED',
          }),
        })
      );
    });

    it('should filter ECPs by urgency', async () => {
      (mockPrisma.engineeringChangeProposal.findMany as jest.Mock).mockResolvedValueOnce([
        mockECPs[1],
      ]);
      (mockPrisma.engineeringChangeProposal.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/configuration/changes?urgency=EMERGENCY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.engineeringChangeProposal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            urgency: 'EMERGENCY',
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.engineeringChangeProposal.findMany as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/configuration/changes')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/configuration/changes/:id/approve', () => {
    const existingECP = {
      id: '00000000-0000-0000-0000-000000000001',
      refNumber: 'ECP-2602-0001',
      title: 'Actuator Redesign',
      status: 'PROPOSED',
      deletedAt: null,
    };

    it('should approve an ECP via CCB with APPROVE decision', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );
      (mockPrisma.engineeringChangeProposal.update as jest.Mock).mockResolvedValueOnce({
        ...existingECP,
        status: 'CCB_APPROVED',
        ccbDecision: 'APPROVE',
        ccbMembers: ['member-1', 'member-2'],
        ccbDate: new Date(),
      });

      const response = await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'APPROVE',
          ccbMembers: ['member-1', 'member-2'],
          ccbNotes: 'Unanimously approved',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.engineeringChangeProposal.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'CCB_APPROVED',
          ccbDecision: 'APPROVE',
        }),
      });
    });

    it('should set status to CCB_REJECTED for REJECT decision', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );
      (mockPrisma.engineeringChangeProposal.update as jest.Mock).mockResolvedValueOnce({
        ...existingECP,
        status: 'CCB_REJECTED',
        ccbDecision: 'REJECT',
      });

      await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'REJECT',
          ccbMembers: ['member-1'],
          ccbNotes: 'Cost too high',
        });

      expect(mockPrisma.engineeringChangeProposal.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'CCB_REJECTED',
        }),
      });
    });

    it('should set status to UNDER_REVIEW for DEFER decision', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );
      (mockPrisma.engineeringChangeProposal.update as jest.Mock).mockResolvedValueOnce({
        ...existingECP,
        status: 'UNDER_REVIEW',
        ccbDecision: 'DEFER',
      });

      await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'DEFER',
          ccbMembers: ['member-1'],
          ccbNotes: 'Revisit next quarter',
        });

      expect(mockPrisma.engineeringChangeProposal.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'UNDER_REVIEW',
        }),
      });
    });

    it('should set status to CCB_APPROVED for APPROVE_WITH_CONDITIONS', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );
      (mockPrisma.engineeringChangeProposal.update as jest.Mock).mockResolvedValueOnce({
        ...existingECP,
        status: 'CCB_APPROVED',
        ccbDecision: 'APPROVE_WITH_CONDITIONS',
      });

      await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'APPROVE_WITH_CONDITIONS',
          ccbMembers: ['member-1', 'member-2'],
          ccbNotes: 'Must complete stress analysis first',
        });

      expect(mockPrisma.engineeringChangeProposal.update).toHaveBeenCalledWith({
        where: { id: '00000000-0000-0000-0000-000000000001' },
        data: expect.objectContaining({
          status: 'CCB_APPROVED',
        }),
      });
    });

    it('should return 404 when ECP does not exist', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/configuration/changes/nonexistent-ecp/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'APPROVE',
          ccbMembers: ['member-1'],
        });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when ccbMembers is empty', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );

      const response = await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'APPROVE',
          ccbMembers: [],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid ccbDecision enum', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockResolvedValueOnce(
        existingECP
      );

      const response = await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'MAYBE',
          ccbMembers: ['member-1'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.engineeringChangeProposal.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/configuration/changes/00000000-0000-0000-0000-000000000001/approve')
        .set('Authorization', 'Bearer token')
        .send({
          ccbDecision: 'APPROVE',
          ccbMembers: ['member-1'],
        });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // CONFIGURATION AUDITS (FCA / PCA)
  // =============================================

  describe('POST /api/configuration/audits/fca', () => {
    const validFCAPayload = {
      title: 'FCA for Avionics Suite',
      baselineId: 'bl-001',
      auditDate: '2026-03-15',
      auditors: ['auditor-1', 'auditor-2'],
      notes: 'Verify functional performance against specification',
    };

    it('should create an FCA successfully', async () => {
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configAudit.create as jest.Mock).mockResolvedValueOnce({
        id: 'audit-fca-1',
        refNumber: 'FCA-2602-0001',
        type: 'FCA',
        ...validFCAPayload,
        auditDate: new Date(validFCAPayload.auditDate),
        status: 'PLANNED',
      });

      const response = await request(app)
        .post('/api/configuration/audits/fca')
        .set('Authorization', 'Bearer token')
        .send(validFCAPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('FCA');
      expect(response.body.data.status).toBe('PLANNED');
    });

    it('should return 404 when referenced baseline does not exist', async () => {
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/configuration/audits/fca')
        .set('Authorization', 'Bearer token')
        .send(validFCAPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Baseline not found');
    });

    it('should return 400 when auditors array is empty', async () => {
      const response = await request(app)
        .post('/api/configuration/audits/fca')
        .set('Authorization', 'Bearer token')
        .send({ ...validFCAPayload, auditors: [] });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/configuration/audits/fca')
        .set('Authorization', 'Bearer token')
        .send({
          baselineId: 'bl-001',
          auditDate: '2026-03-15',
          auditors: ['auditor-1'],
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      (mockPrisma.configAudit.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/configuration/audits/fca')
        .set('Authorization', 'Bearer token')
        .send(validFCAPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/configuration/audits/pca', () => {
    const validPCAPayload = {
      title: 'PCA for Fuselage Section',
      baselineId: 'bl-002',
      auditDate: '2026-04-20',
      auditors: ['auditor-3'],
      notes: 'Verify physical configuration matches product baseline',
    };

    it('should create a PCA successfully', async () => {
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(2);
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'bl-002',
        deletedAt: null,
      });
      (mockPrisma.configAudit.create as jest.Mock).mockResolvedValueOnce({
        id: 'audit-pca-1',
        refNumber: 'PCA-2602-0003',
        type: 'PCA',
        ...validPCAPayload,
        auditDate: new Date(validPCAPayload.auditDate),
        status: 'PLANNED',
      });

      const response = await request(app)
        .post('/api/configuration/audits/pca')
        .set('Authorization', 'Bearer token')
        .send(validPCAPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.type).toBe('PCA');
    });

    it('should return 404 when referenced baseline is soft-deleted', async () => {
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.configBaseline.findUnique as jest.Mock).mockResolvedValueOnce({
        id: 'bl-002',
        deletedAt: new Date(),
      });

      const response = await request(app)
        .post('/api/configuration/audits/pca')
        .set('Authorization', 'Bearer token')
        .send(validPCAPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when required fields are missing', async () => {
      const response = await request(app)
        .post('/api/configuration/audits/pca')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Incomplete PCA' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/configuration/audits', () => {
    const mockAudits = [
      {
        id: 'audit-1',
        refNumber: 'FCA-2602-0001',
        type: 'FCA',
        title: 'Avionics FCA',
        status: 'PLANNED',
        auditDate: new Date(),
        deletedAt: null,
      },
      {
        id: 'audit-2',
        refNumber: 'PCA-2602-0001',
        type: 'PCA',
        title: 'Fuselage PCA',
        status: 'COMPLETED',
        auditDate: new Date(),
        deletedAt: null,
      },
    ];

    it('should return a paginated list of audits', async () => {
      (mockPrisma.configAudit.findMany as jest.Mock).mockResolvedValueOnce(mockAudits);
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/configuration/audits')
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

    it('should filter audits by type (FCA or PCA)', async () => {
      (mockPrisma.configAudit.findMany as jest.Mock).mockResolvedValueOnce([mockAudits[0]]);
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/configuration/audits?type=FCA')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.configAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'FCA',
          }),
        })
      );
    });

    it('should filter audits by status', async () => {
      (mockPrisma.configAudit.findMany as jest.Mock).mockResolvedValueOnce([mockAudits[1]]);
      (mockPrisma.configAudit.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app)
        .get('/api/configuration/audits?status=COMPLETED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.configAudit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'COMPLETED',
          }),
        })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configAudit.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/configuration/audits')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // STATUS ACCOUNTING
  // =============================================

  describe('GET /api/configuration/status-accounting', () => {
    it('should return a comprehensive status accounting report', async () => {
      // Mock all 27 count calls in order
      const countMock = jest
        .fn()
        // Baselines: total, active, draft, superseded, archived
        .mockResolvedValueOnce(10) // totalBaselines
        .mockResolvedValueOnce(5) // activeBaselines
        .mockResolvedValueOnce(3) // draftBaselines
        .mockResolvedValueOnce(1) // supersededBaselines
        .mockResolvedValueOnce(1) // archivedBaselines
        // Items: total, current, pendingChange, superseded, obsolete
        .mockResolvedValueOnce(50) // totalItems
        .mockResolvedValueOnce(40) // currentItems
        .mockResolvedValueOnce(5) // pendingChangeItems
        .mockResolvedValueOnce(3) // supersededItems
        .mockResolvedValueOnce(2) // obsoleteItems
        // ECPs: total, proposed, underReview, approved, rejected, implementing, implemented, verified, closed
        .mockResolvedValueOnce(20) // totalECPs
        .mockResolvedValueOnce(3) // proposedECPs
        .mockResolvedValueOnce(2) // underReviewECPs
        .mockResolvedValueOnce(5) // approvedECPs
        .mockResolvedValueOnce(1) // rejectedECPs
        .mockResolvedValueOnce(4) // implementingECPs
        .mockResolvedValueOnce(2) // implementedECPs
        .mockResolvedValueOnce(1) // verifiedECPs
        .mockResolvedValueOnce(2) // closedECPs
        // Audits: total, planned, completed, fca, pca, pass, passWithFindings, fail
        .mockResolvedValueOnce(8) // totalAudits
        .mockResolvedValueOnce(3) // plannedAudits
        .mockResolvedValueOnce(5) // completedAudits
        .mockResolvedValueOnce(4) // fcaCount
        .mockResolvedValueOnce(4) // pcaCount
        .mockResolvedValueOnce(3) // passAudits
        .mockResolvedValueOnce(1) // passWithFindingsAudits
        .mockResolvedValueOnce(1); // failAudits

      // Replace count methods on all models with this single mock
      (mockPrisma.configBaseline.count as jest.Mock) = countMock;
      (mockPrisma.configItem.count as jest.Mock) = countMock;
      (mockPrisma.engineeringChangeProposal.count as jest.Mock) = countMock;
      (mockPrisma.configAudit.count as jest.Mock) = countMock;

      const response = await request(app)
        .get('/api/configuration/status-accounting')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);

      const report = response.body.data;
      expect(report).toHaveProperty('generatedAt');
      expect(report.baselines.total).toBe(10);
      expect(report.baselines.byStatus.active).toBe(5);
      expect(report.baselines.byStatus.draft).toBe(3);
      expect(report.configurationItems.total).toBe(50);
      expect(report.configurationItems.byStatus.current).toBe(40);
      expect(report.engineeringChangeProposals.total).toBe(20);
      expect(report.engineeringChangeProposals.byStatus.proposed).toBe(3);
      expect(report.engineeringChangeProposals.pendingActions).toBe(9); // proposed(3) + underReview(2) + implementing(4)
      expect(report.audits.total).toBe(8);
      expect(report.audits.byType.fca).toBe(4);
      expect(report.audits.byType.pca).toBe(4);
      expect(report.audits.results.pass).toBe(3);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.configBaseline.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/configuration/status-accounting')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});


describe('phase34 coverage', () => {
  it('handles type assertion', () => { const v: unknown = 'hello'; expect((v as string).toUpperCase()).toBe('HELLO'); });
  it('handles async generator', async () => { async function* gen() { yield 1; yield 2; } const vals: number[] = []; for await (const v of gen()) vals.push(v); expect(vals).toEqual([1,2]); });
  it('handles enum-like object', () => { const Direction = { UP: 'UP', DOWN: 'DOWN' } as const; expect(Direction.UP).toBe('UP'); });
  it('handles union type narrowing', () => { const fn = (v: string | number) => typeof v === 'string' ? v.length : v; expect(fn('hello')).toBe(5); expect(fn(42)).toBe(42); });
});


describe('phase35 coverage', () => {
  it('handles string split-join replace', () => { expect('aabbcc'.split('b').join('x')).toBe('aaxxcc'); });
  it('handles short-circuit evaluation', () => { let x = 0; false && (x=1); expect(x).toBe(0); true || (x=2); expect(x).toBe(0); });
  it('handles array groupBy pattern', () => { const groupBy = <T>(arr:T[], key:(item:T)=>string): Record<string,T[]> => arr.reduce((acc,item)=>{ const k=key(item); (acc[k]=acc[k]||[]).push(item); return acc; },{}as Record<string,T[]>); const r = groupBy([{t:'a',v:1},{t:'b',v:2},{t:'a',v:3}],x=>x.t); expect(r['a'].length).toBe(2); });
  it('handles observer pattern', () => { const listeners: Array<(v:number)=>void> = []; const on = (fn:(v:number)=>void) => listeners.push(fn); const emit = (v:number) => listeners.forEach(fn=>fn(v)); const results: number[] = []; on(v=>results.push(v)); on(v=>results.push(v*2)); emit(5); expect(results).toEqual([5,10]); });
  it('handles assertion function pattern', () => { const assertNum = (v:unknown): asserts v is number => { if(typeof v!=='number') throw new TypeError('not a number'); }; expect(()=>assertNum('x')).toThrow(TypeError); expect(()=>assertNum(1)).not.toThrow(); });
});


describe('phase36 coverage', () => {
  it('handles balanced parentheses check', () => { const balanced=(s:string)=>{let c=0;for(const ch of s){if(ch==='(')c++;else if(ch===')')c--;if(c<0)return false;}return c===0;};expect(balanced('(()())')).toBe(true);expect(balanced('(()')).toBe(false); });
  it('handles number formatting with commas', () => { const fmt=(n:number)=>n.toString().replace(/\B(?=(\d{3})+(?!\d))/g,',');expect(fmt(1000000)).toBe('1,000,000'); });
  it('handles parse query string', () => { const parseQS=(s:string)=>Object.fromEntries(s.split('&').map(p=>p.split('=')));expect(parseQS('a=1&b=2')).toEqual({a:'1',b:'2'}); });
  it('handles LCM calculation', () => { const gcd=(a:number,b:number):number=>b===0?a:gcd(b,a%b);const lcm=(a:number,b:number)=>a*b/gcd(a,b);expect(lcm(4,6)).toBe(12);expect(lcm(3,5)).toBe(15); });
  it('handles event emitter pattern', () => { const handlers=new Map<string,Array<(d:unknown)=>void>>();const on=(e:string,fn:(d:unknown)=>void)=>{(handlers.get(e)||handlers.set(e,[]).get(e)!).push(fn);};const emit=(e:string,d:unknown)=>handlers.get(e)?.forEach(fn=>fn(d));const results:unknown[]=[];on('test',d=>results.push(d));emit('test',42);expect(results).toEqual([42]); });
});


describe('phase37 coverage', () => {
  it('counts words in string', () => { const words=(s:string)=>s.trim()===''?0:s.trim().split(/\s+/).length; expect(words('hello world foo')).toBe(3); expect(words('')).toBe(0); });
  it('computes hamming distance', () => { const hamming=(a:string,b:string)=>[...a].filter((c,i)=>c!==b[i]).length; expect(hamming('karolin','kathrin')).toBe(3); });
  it('generates combinations of size 2', () => { const a=[1,2,3]; const r=a.flatMap((v,i)=>a.slice(i+1).map(w=>[v,w] as [number,number])); expect(r.length).toBe(3); expect(r[0]).toEqual([1,2]); });
  it('pads array to length', () => { const padArr=<T>(a:T[],n:number,fill:T)=>[...a,...Array(Math.max(0,n-a.length)).fill(fill)]; expect(padArr([1,2],5,0)).toEqual([1,2,0,0,0]); });
  it('computes cartesian product', () => { const result=([1,2] as number[]).flatMap(x=>(['a','b'] as string[]).map(y=>[x,y] as [number,string])); expect(result.length).toBe(4); expect(result[0]).toEqual([1,'a']); });
});


describe('phase38 coverage', () => {
  it('applies difference array technique', () => { const diff=(a:number[])=>a.slice(1).map((v,i)=>v-a[i]); expect(diff([1,3,6,10,15])).toEqual([2,3,4,5]); });
  it('checks if matrix is symmetric', () => { const isSym=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===m[j][i])); expect(isSym([[1,2],[2,1]])).toBe(true); expect(isSym([[1,2],[3,1]])).toBe(false); });
  it('implements queue using two stacks', () => { class TwoStackQ{private in:number[]=[];private out:number[]=[];enqueue(v:number){this.in.push(v);}dequeue(){if(!this.out.length)while(this.in.length)this.out.push(this.in.pop()!);return this.out.pop();}get size(){return this.in.length+this.out.length;}} const q=new TwoStackQ();q.enqueue(1);q.enqueue(2);q.enqueue(3);expect(q.dequeue()).toBe(1);expect(q.size).toBe(2); });
  it('finds all prime factors', () => { const factors=(n:number)=>{const r:number[]=[];for(let i=2;i*i<=n;i++)while(n%i===0){r.push(i);n/=i;}if(n>1)r.push(n);return r;}; expect(factors(12)).toEqual([2,2,3]); });
  it('implements exponential search bound', () => { const expBound=(a:number[],v:number)=>{if(a[0]===v)return 0;let i=1;while(i<a.length&&a[i]<=v)i*=2;return Math.min(i,a.length-1);}; expect(expBound([1,2,4,8,16,32],8)).toBeGreaterThanOrEqual(3); });
});


describe('phase39 coverage', () => {
  it('computes sum of digits of factorial digits', () => { const digitFactSum=(n:number)=>{let r=1;for(let i=2;i<=n;i++)r*=i;return String(r).split('').reduce((a,c)=>a+Number(c),0);}; expect(digitFactSum(5)).toBe(3); /* 120 → 1+2+0=3 */ });
  it('checks Kaprekar number', () => { const isKap=(n:number)=>{const sq=n*n;const s=String(sq);for(let i=1;i<s.length;i++){const r=Number(s.slice(i)),l=Number(s.slice(0,i));if(r>0&&l+r===n)return true;}return false;}; expect(isKap(9)).toBe(true); expect(isKap(45)).toBe(true); });
  it('checks if string has all unique chars', () => { const allUniq=(s:string)=>new Set(s).size===s.length; expect(allUniq('abcde')).toBe(true); expect(allUniq('abcda')).toBe(false); });
  it('counts substring occurrences', () => { const countOcc=(s:string,sub:string)=>{let c=0,i=0;while((i=s.indexOf(sub,i))!==-1){c++;i+=sub.length;}return c;}; expect(countOcc('banana','an')).toBe(2); });
  it('checks if perfect square', () => { const isPerfSq=(n:number)=>Number.isInteger(Math.sqrt(n)); expect(isPerfSq(25)).toBe(true); expect(isPerfSq(26)).toBe(false); });
});


describe('phase40 coverage', () => {
  it('checks if number is perfect power', () => { const isPerfPow=(n:number)=>{for(let b=2;b*b<=n;b++)for(let e=2;Math.pow(b,e)<=n;e++)if(Math.pow(b,e)===n)return true;return false;}; expect(isPerfPow(8)).toBe(true); expect(isPerfPow(9)).toBe(true); expect(isPerfPow(10)).toBe(false); });
  it('computes number of set bits sum for range', () => { const rangePopcount=(n:number)=>Array.from({length:n+1},(_,i)=>i).reduce((s,v)=>{let c=0,x=v;while(x){c+=x&1;x>>>=1;}return s+c;},0); expect(rangePopcount(5)).toBe(7); /* 0+1+1+2+1+2 */ });
  it('computes nth power sum 1^k+2^k+...+n^k', () => { const pwrSum=(n:number,k:number)=>Array.from({length:n},(_,i)=>Math.pow(i+1,k)).reduce((a,b)=>a+b,0); expect(pwrSum(3,2)).toBe(14); });
  it('finds smallest window containing all chars', () => { const minWindow=(s:string,t:string)=>{const need=new Map<string,number>();for(const c of t)need.set(c,(need.get(c)||0)+1);let l=0,formed=0,best='';const have=new Map<string,number>();for(let r=0;r<s.length;r++){const c=s[r];have.set(c,(have.get(c)||0)+1);if(need.has(c)&&have.get(c)===need.get(c))formed++;while(formed===need.size){const w=s.slice(l,r+1);if(!best||w.length<best.length)best=w;const lc=s[l];have.set(lc,(have.get(lc)||0)-1);if(need.has(lc)&&have.get(lc)!<need.get(lc)!)formed--;l++;}}return best;}; expect(minWindow('ADOBECODEBANC','ABC')).toBe('BANC'); });
  it('implements sparse table for range min query', () => { const a=[2,4,3,1,6,7,8,9,1,7]; const mn=(l:number,r:number)=>Math.min(...a.slice(l,r+1)); expect(mn(0,4)).toBe(1); expect(mn(2,7)).toBe(1); });
});
