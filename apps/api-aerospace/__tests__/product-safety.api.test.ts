import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    aeroProductSafetyItem: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    aeroSafetyReview: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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

jest.mock('@ims/service-auth', () => ({
  scopeToUser: (_req: any, _res: any, next: any) => next(),
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import router from '../src/routes/product-safety';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/product-safety', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Aerospace Product Safety API', () => {
  // =============================================
  // GET / - List product safety items
  // =============================================
  describe('GET /api/product-safety', () => {
    it('should return paginated list of product safety items', async () => {
      mockPrisma.aeroProductSafetyItem.findMany.mockResolvedValueOnce([
        {
          id: '00000000-0000-0000-0000-000000000001',
          refNumber: 'AERO-PSI-2026-001',
          title: 'Main Landing Gear',
          category: 'CRITICAL_SAFETY_ITEM',
          riskLevel: 'CRITICAL',
        },
      ]);
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(1);

      const res = await request(app)
        .get('/api/product-safety')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.meta).toMatchObject({ page: 1, limit: 20, total: 1, totalPages: 1 });
    });

    it('should filter by category', async () => {
      mockPrisma.aeroProductSafetyItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/product-safety?category=FLIGHT_SAFETY_PART')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroProductSafetyItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ category: 'FLIGHT_SAFETY_PART' }),
        })
      );
    });

    it('should filter by riskLevel', async () => {
      mockPrisma.aeroProductSafetyItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/product-safety?riskLevel=CATASTROPHIC')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroProductSafetyItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ riskLevel: 'CATASTROPHIC' }) })
      );
    });

    it('should filter by complianceStatus', async () => {
      mockPrisma.aeroProductSafetyItem.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/product-safety?complianceStatus=COMPLIANT')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.aeroProductSafetyItem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ complianceStatus: 'COMPLIANT' }),
        })
      );
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroProductSafetyItem.findMany.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .get('/api/product-safety')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // GET /:id
  // =============================================
  describe('GET /api/product-safety/:id', () => {
    it('should return a single product safety item', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        refNumber: 'AERO-PSI-2026-001',
        title: 'Main Landing Gear',
        deletedAt: null,
      });

      const res = await request(app)
        .get('/api/product-safety/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('00000000-0000-0000-0000-000000000001');
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .get('/api/product-safety/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: new Date(),
      });

      const res = await request(app)
        .get('/api/product-safety/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // POST / - Create product safety item
  // =============================================
  describe('POST /api/product-safety', () => {
    const validPayload = {
      title: 'Ejection Seat Actuator',
      description: 'Primary ejection seat pyrotechnic actuator',
      category: 'CRITICAL_SAFETY_ITEM',
    };

    it('should create a product safety item successfully', async () => {
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroProductSafetyItem.create.mockResolvedValueOnce({
        id: 'ps-new',
        refNumber: 'AERO-PSI-2026-001',
        ...validPayload,
        status: 'ACTIVE',
      });

      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send({ description: 'desc', category: 'CRITICAL_SAFETY_ITEM' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when description is missing', async () => {
      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', category: 'CRITICAL_SAFETY_ITEM' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when category is missing', async () => {
      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', description: 'desc' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category enum', async () => {
      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, category: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroProductSafetyItem.count.mockResolvedValueOnce(0);
      mockPrisma.aeroProductSafetyItem.create.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .post('/api/product-safety')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // =============================================
  // PUT /:id - Update product safety item
  // =============================================
  describe('PUT /api/product-safety/:id', () => {
    const existing = {
      id: '00000000-0000-0000-0000-000000000001',
      lastReviewDate: null,
      nextReviewDate: null,
      deletedAt: null,
    };

    it('should update a product safety item', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce(existing);
      mockPrisma.aeroProductSafetyItem.update.mockResolvedValueOnce({
        ...existing,
        complianceStatus: 'COMPLIANT',
      });

      const res = await request(app)
        .put('/api/product-safety/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/product-safety/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid complianceStatus', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce(existing);

      const res = await request(app)
        .put('/api/product-safety/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // DELETE /:id
  // =============================================
  describe('DELETE /api/product-safety/:id', () => {
    it('should soft-delete a product safety item', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce({
        id: '00000000-0000-0000-0000-000000000001',
        deletedAt: null,
      });
      mockPrisma.aeroProductSafetyItem.update.mockResolvedValueOnce({});

      const res = await request(app)
        .delete('/api/product-safety/00000000-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(204);
    });

    it('should return 404 when not found', async () => {
      mockPrisma.aeroProductSafetyItem.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .delete('/api/product-safety/00000000-0000-0000-0000-000000000099')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });
  });

  // =============================================
  // GET /reviews
  // =============================================
  describe('GET /api/product-safety/reviews', () => {
    it('should list safety reviews', async () => {
      mockPrisma.aeroSafetyReview.findMany.mockResolvedValueOnce([]);
      mockPrisma.aeroSafetyReview.count.mockResolvedValueOnce(0);
      const res = await request(app)
        .get('/api/product-safety/reviews')
        .set('Authorization', 'Bearer token');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  // =============================================
  // POST /reviews
  // =============================================
  describe('POST /api/product-safety/reviews', () => {
    const validPayload = {
      title: 'System Safety Assessment',
      reviewType: 'SYSTEM_SAFETY',
      scheduledDate: '2026-03-15',
    };

    it('should create a safety review successfully', async () => {
      mockPrisma.aeroSafetyReview.count.mockResolvedValueOnce(0);
      mockPrisma.aeroSafetyReview.create.mockResolvedValueOnce({
        id: 'sr-new',
        refNumber: 'AERO-PSR-2026-001',
        ...validPayload,
        status: 'PLANNED',
      });

      const res = await request(app)
        .post('/api/product-safety/reviews')
        .set('Authorization', 'Bearer token')
        .send(validPayload);
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('PLANNED');
    });

    it('should return 400 when title is missing', async () => {
      const res = await request(app)
        .post('/api/product-safety/reviews')
        .set('Authorization', 'Bearer token')
        .send({ reviewType: 'SYSTEM_SAFETY', scheduledDate: '2026-03-15' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when scheduledDate is missing', async () => {
      const res = await request(app)
        .post('/api/product-safety/reviews')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', reviewType: 'SYSTEM_SAFETY' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid reviewType', async () => {
      const res = await request(app)
        .post('/api/product-safety/reviews')
        .set('Authorization', 'Bearer token')
        .send({ ...validPayload, reviewType: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // =============================================
  // PUT /reviews/:id/complete
  // =============================================
  describe('PUT /api/product-safety/reviews/:id/complete', () => {
    const existingReview = {
      id: '00000000-0000-0000-0000-000000000001',
      status: 'PLANNED',
      notes: null,
      deletedAt: null,
    };

    it('should complete a safety review', async () => {
      mockPrisma.aeroSafetyReview.findUnique.mockResolvedValueOnce(existingReview);
      mockPrisma.aeroSafetyReview.update.mockResolvedValueOnce({
        ...existingReview,
        status: 'COMPLETED',
        result: 'APPROVED',
      });

      const res = await request(app)
        .put('/api/product-safety/reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'APPROVED' });
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 404 when review not found', async () => {
      mockPrisma.aeroSafetyReview.findUnique.mockResolvedValueOnce(null);

      const res = await request(app)
        .put('/api/product-safety/reviews/00000000-0000-0000-0000-000000000099/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'APPROVED' });
      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when result is missing', async () => {
      mockPrisma.aeroSafetyReview.findUnique.mockResolvedValueOnce(existingReview);

      const res = await request(app)
        .put('/api/product-safety/reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({});
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid result enum', async () => {
      mockPrisma.aeroSafetyReview.findUnique.mockResolvedValueOnce(existingReview);

      const res = await request(app)
        .put('/api/product-safety/reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'INVALID' });
      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 500 on db error', async () => {
      mockPrisma.aeroSafetyReview.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const res = await request(app)
        .put('/api/product-safety/reviews/00000000-0000-0000-0000-000000000001/complete')
        .set('Authorization', 'Bearer token')
        .send({ result: 'APPROVED' });
      expect(res.status).toBe(500);
      expect(res.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
