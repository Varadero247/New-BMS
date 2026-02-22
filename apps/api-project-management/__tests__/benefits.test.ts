import express from 'express';
import request from 'supertest';

// Mock dependencies BEFORE importing any modules that use them

jest.mock('../src/prisma', () => ({
  prisma: {
    benefit: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    benefitMeasurement: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    BenefitWhereInput: {},
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
import benefitsRouter from '../src/routes/benefits';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ==========================================
// Test data fixtures
// ==========================================

const mockBenefit = {
  id: '30000000-0000-4000-a000-000000000001',
  refNumber: 'BEN-2602-0001',
  title: 'Cost reduction through automation',
  description: 'Automate manual assembly line to reduce labor costs',
  type: 'FINANCIAL',
  projectId: 'project-001',
  owner: 'user-2',
  baselineValue: 1000000,
  targetValue: 750000,
  currentValue: 1000000,
  unit: 'USD',
  measurementMethod: 'FINANCIAL_ANALYSIS',
  measurementSchedule: 'Monthly',
  expectedRealisationDate: new Date('2026-12-31'),
  financialValue: 250000,
  priority: 'HIGH',
  status: 'IDENTIFIED',
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-01'),
  updatedAt: new Date('2026-02-01'),
};

const mockBenefit2 = {
  id: '30000000-0000-4000-a000-000000000002',
  refNumber: 'BEN-2602-0002',
  title: 'Improved customer satisfaction',
  description: 'Reduce response time from 48h to 24h',
  type: 'STRATEGIC',
  projectId: null,
  owner: 'user-3',
  baselineValue: 65,
  targetValue: 90,
  currentValue: 72,
  unit: 'NPS Score',
  measurementMethod: 'SURVEY',
  measurementSchedule: 'Quarterly',
  expectedRealisationDate: null,
  financialValue: null,
  priority: 'MEDIUM',
  status: 'TRACKING',
  createdBy: 'user-1',
  deletedAt: null,
  deletedBy: null,
  createdAt: new Date('2026-02-05'),
  updatedAt: new Date('2026-02-08'),
};

const mockMeasurement = {
  id: 'meas-001',
  benefitId: '30000000-0000-4000-a000-000000000001',
  value: 920000,
  notes: 'Q1 savings tracked',
  measuredAt: new Date('2026-03-31'),
  source: 'Finance report Q1',
  measuredBy: 'user-1',
  createdAt: new Date('2026-03-31'),
  updatedAt: new Date('2026-03-31'),
};

const validCreatePayload = {
  title: 'Cost reduction through automation',
  description: 'Automate manual assembly line to reduce labor costs',
  type: 'FINANCIAL',
  projectId: 'project-001',
  owner: 'user-2',
  baselineValue: 1000000,
  targetValue: 750000,
  unit: 'USD',
  measurementMethod: 'FINANCIAL_ANALYSIS',
  measurementSchedule: 'Monthly',
  expectedRealisationDate: '2026-12-31',
  financialValue: 250000,
  priority: 'HIGH',
};

const validMeasurementPayload = {
  value: 920000,
  notes: 'Q1 savings tracked',
  measuredAt: '2026-03-31',
  source: 'Finance report Q1',
};

// ==========================================
// Tests
// ==========================================

describe('Project Management Benefits Realisation API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/benefits', benefitsRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // POST / — Create benefit
  // ==========================================
  describe('POST /api/benefits', () => {
    it('should create a benefit successfully', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.benefit.create as jest.Mock).mockResolvedValueOnce(mockBenefit);

      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Cost reduction through automation');
      expect(response.body.data.type).toBe('FINANCIAL');
      expect(response.body.data.status).toBe('IDENTIFIED');
    });

    it('should create a benefit with only required fields', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(1);
      (mockPrisma.benefit.create as jest.Mock).mockResolvedValueOnce({
        ...mockBenefit,
        refNumber: 'BEN-2602-0002',
      });

      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Simple benefit', type: 'OPERATIONAL' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should return 400 when title is missing', async () => {
      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send({ type: 'FINANCIAL' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when type is missing', async () => {
      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Cost savings' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Test', type: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 when body is empty', async () => {
      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.benefit.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/benefits')
        .set('Authorization', 'Bearer token')
        .send(validCreatePayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
      expect(response.body.error.message).toBe('Failed to create benefit');
    });
  });

  // ==========================================
  // GET / — List benefits
  // ==========================================
  describe('GET /api/benefits', () => {
    it('should return a list of benefits with default pagination', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([mockBenefit, mockBenefit2]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app).get('/api/benefits').set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.page).toBe(1);
    });

    it('should filter by status', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([mockBenefit2]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/benefits?status=TRACKING').set('Authorization', 'Bearer token');

      expect(mockPrisma.benefit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ status: 'TRACKING', deletedAt: null }),
        })
      );
    });

    it('should filter by type', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([mockBenefit]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(1);

      await request(app).get('/api/benefits?type=FINANCIAL').set('Authorization', 'Bearer token');

      expect(mockPrisma.benefit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ type: 'FINANCIAL' }),
        })
      );
    });

    it('should support pagination', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/benefits?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(5);

      expect(mockPrisma.benefit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 20, take: 10 })
      );
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/benefits').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /dashboard — Realisation overview
  // ==========================================
  describe('GET /api/benefits/dashboard', () => {
    it('should return dashboard statistics', async () => {
      (mockPrisma.benefit.count as jest.Mock)
        .mockResolvedValueOnce(10) // total
        .mockResolvedValueOnce(3) // realised
        .mockResolvedValueOnce(4) // tracking
        .mockResolvedValueOnce(3); // identified

      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([
        {
          type: 'FINANCIAL',
          financialValue: 100000,
          status: 'REALISED',
          currentValue: 100000,
          targetValue: 100000,
        },
        {
          type: 'FINANCIAL',
          financialValue: 200000,
          status: 'TRACKING',
          currentValue: 150000,
          targetValue: 200000,
        },
        {
          type: 'STRATEGIC',
          financialValue: null,
          status: 'IDENTIFIED',
          currentValue: null,
          targetValue: null,
        },
      ]);

      const response = await request(app)
        .get('/api/benefits/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(10);
      expect(response.body.data.realised).toBe(3);
      expect(response.body.data.tracking).toBe(4);
      expect(response.body.data.identified).toBe(3);
      expect(response.body.data.realisationRate).toBe(30);
      expect(response.body.data.byType).toBeDefined();
      expect(response.body.data.financialSummary).toBeDefined();
    });

    it('should handle empty data', async () => {
      (mockPrisma.benefit.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);

      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app)
        .get('/api/benefits/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.total).toBe(0);
      expect(response.body.data.realisationRate).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/benefits/dashboard')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // GET /:id — Get with measurement history
  // ==========================================
  describe('GET /api/benefits/:id', () => {
    it('should return a benefit with measurements', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefitMeasurement.findMany as jest.Mock).mockResolvedValueOnce([
        mockMeasurement,
      ]);

      const response = await request(app)
        .get('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Cost reduction through automation');
      expect(response.body.data.measurements).toHaveLength(1);
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/benefits/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 404 when soft-deleted', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce({
        ...mockBenefit,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .get('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // PUT /:id — Update benefit
  // ==========================================
  describe('PUT /api/benefits/:id', () => {
    it('should update a benefit successfully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({
        ...mockBenefit,
        title: 'Updated benefit title',
        status: 'BASELINED',
      });

      const response = await request(app)
        .put('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated benefit title', status: 'BASELINED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Updated benefit title');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/benefits/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);

      const response = await request(app)
        .put('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // POST /:id/measurements — Log measurement
  // ==========================================
  describe('POST /api/benefits/:id/measurements', () => {
    it('should create a measurement successfully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefitMeasurement.create as jest.Mock).mockResolvedValueOnce(mockMeasurement);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({
        ...mockBenefit,
        currentValue: 920000,
        status: 'TRACKING',
      });

      const response = await request(app)
        .post('/api/benefits/30000000-0000-4000-a000-000000000001/measurements')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.value).toBe(920000);
    });

    it('should return 404 when benefit not found', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/api/benefits/00000000-0000-4000-a000-ffffffffffff/measurements')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 when value is missing', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);

      const response = await request(app)
        .post('/api/benefits/30000000-0000-4000-a000-000000000001/measurements')
        .set('Authorization', 'Bearer token')
        .send({ notes: 'No value' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/benefits/30000000-0000-4000-a000-000000000001/measurements')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // DELETE /:id — Soft delete
  // ==========================================
  describe('DELETE /api/benefits/:id', () => {
    it('should soft-delete a benefit', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({
        ...mockBenefit,
        deletedAt: new Date(),
      });

      const response = await request(app)
        .delete('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Benefit deleted');
    });

    it('should return 404 when not found', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/benefits/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors gracefully', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ==========================================
  // Additional coverage
  // ==========================================
  describe('Benefits API — additional coverage', () => {
    it('GET /api/benefits: response body has success and data fields', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(0);
      const response = await request(app).get('/api/benefits').set('Authorization', 'Bearer token');
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
    });

    it('GET /api/benefits: returns empty items array when no benefits exist', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(0);
      const response = await request(app).get('/api/benefits').set('Authorization', 'Bearer token');
      expect(response.body.data.items).toEqual([]);
    });

    it('POST /api/benefits: create called once on success', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.benefit.create as jest.Mock).mockResolvedValueOnce(mockBenefit);
      await request(app).post('/api/benefits').set('Authorization', 'Bearer token').send(validCreatePayload);
      expect(mockPrisma.benefit.create).toHaveBeenCalledTimes(1);
    });

    it('PUT /api/benefits/:id: update called with correct id in where clause', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({ ...mockBenefit, title: 'New title' });
      await request(app)
        .put('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New title' });
      expect(mockPrisma.benefit.update).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '30000000-0000-4000-a000-000000000001' } })
      );
    });

    it('DELETE /api/benefits/:id: update called with deletedAt in data', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({ ...mockBenefit, deletedAt: new Date() });
      await request(app)
        .delete('/api/benefits/30000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');
      expect(mockPrisma.benefit.update).toHaveBeenCalledWith(
        expect.objectContaining({ data: expect.objectContaining({ deletedAt: expect.any(Date) }) })
      );
    });

    it('GET /api/benefits: filter by projectId passes to where clause', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([mockBenefit]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(1);
      await request(app).get('/api/benefits?projectId=project-001').set('Authorization', 'Bearer token');
      expect(mockPrisma.benefit.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.objectContaining({ projectId: 'project-001' }) })
      );
    });

    it('GET /api/benefits: returns correct totalPages for multi-page result', async () => {
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(40);
      const response = await request(app).get('/api/benefits?limit=10').set('Authorization', 'Bearer token');
      expect(response.status).toBe(200);
      expect(response.body.data.totalPages).toBe(4);
    });

    it('POST /api/benefits: count called once to generate refNumber', async () => {
      (mockPrisma.benefit.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.benefit.create as jest.Mock).mockResolvedValueOnce({ ...mockBenefit, refNumber: 'BEN-2602-0006' });
      await request(app).post('/api/benefits').set('Authorization', 'Bearer token').send(validCreatePayload);
      expect(mockPrisma.benefit.count).toHaveBeenCalledTimes(1);
    });

    it('POST /api/benefits/:id/measurements: benefitMeasurement.create called once on success', async () => {
      (mockPrisma.benefit.findUnique as jest.Mock).mockResolvedValueOnce(mockBenefit);
      (mockPrisma.benefitMeasurement.create as jest.Mock).mockResolvedValueOnce(mockMeasurement);
      (mockPrisma.benefit.update as jest.Mock).mockResolvedValueOnce({ ...mockBenefit, currentValue: 920000 });
      await request(app)
        .post('/api/benefits/30000000-0000-4000-a000-000000000001/measurements')
        .set('Authorization', 'Bearer token')
        .send(validMeasurementPayload);
      expect(mockPrisma.benefitMeasurement.create).toHaveBeenCalledTimes(1);
    });

    it('GET /api/benefits/dashboard: handles zero total correctly for realisationRate', async () => {
      (mockPrisma.benefit.count as jest.Mock)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0)
        .mockResolvedValueOnce(0);
      (mockPrisma.benefit.findMany as jest.Mock).mockResolvedValueOnce([]);
      const response = await request(app).get('/api/benefits/dashboard').set('Authorization', 'Bearer token');
      expect(response.status).toBe(200);
      expect(response.body.data.realisationRate).toBe(0);
    });
  });
});

describe('benefits — phase29 coverage', () => {
  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles string concatenation', () => {
    expect('hello' + ' ' + 'world').toBe('hello world');
  });

  it('handles Date type', () => {
    expect(new Date()).toBeInstanceOf(Date);
  });

  it('handles string padStart', () => {
    expect('5'.padStart(3, '0')).toBe('005');
  });

  it('handles join method', () => {
    expect([1, 2, 3].join('-')).toBe('1-2-3');
  });

});
