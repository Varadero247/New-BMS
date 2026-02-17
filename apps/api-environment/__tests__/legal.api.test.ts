import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    envLegal: {
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
import legalRoutes from '../src/routes/legal';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Environment Legal Obligations API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/legal', legalRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/legal', () => {
    const mockObligations = [
      {
        id: '14000000-0000-4000-a000-000000000001',
        referenceNumber: 'ENV-LEG-2026-001',
        obligationType: 'LEGISLATION',
        title: 'Environmental Protection Act',
        jurisdiction: 'NATIONAL',
        complianceStatus: 'COMPLIANT',
        status: 'ACTIVE',
      },
      {
        id: 'legal-2',
        referenceNumber: 'ENV-LEG-2026-002',
        obligationType: 'PERMIT',
        title: 'Emissions Permit',
        jurisdiction: 'LOCAL',
        complianceStatus: 'PARTIALLY_COMPLIANT',
        status: 'ACTIVE',
      },
    ];

    it('should return list of legal obligations with pagination', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce(mockObligations);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/legal')
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
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([mockObligations[0]]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(100);

      const response = await request(app)
        .get('/api/legal?page=2&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(10);
      expect(response.body.meta.totalPages).toBe(10);
    });

    it('should filter by complianceStatus', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?complianceStatus=COMPLIANT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            complianceStatus: 'COMPLIANT',
          }),
        })
      );
    });

    it('should filter by obligationType', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?obligationType=LEGISLATION')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            obligationType: 'LEGISLATION',
          }),
        })
      );
    });

    it('should filter by jurisdiction', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?jurisdiction=NATIONAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            jurisdiction: 'NATIONAL',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?status=ACTIVE')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'ACTIVE',
          }),
        })
      );
    });

    it('should support search across title, description, referenceNumber, legislationReference', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?search=protection')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: expect.arrayContaining([
              { title: { contains: 'protection', mode: 'insensitive' } },
              { description: { contains: 'protection', mode: 'insensitive' } },
              { referenceNumber: { contains: 'protection', mode: 'insensitive' } },
              { legislationReference: { contains: 'protection', mode: 'insensitive' } },
            ]),
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockResolvedValueOnce(mockObligations);
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app)
        .get('/api/legal')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.envLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envLegal.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/legal')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/legal/:id', () => {
    const mockObligation = {
      id: '14000000-0000-4000-a000-000000000001',
      referenceNumber: 'ENV-LEG-2026-001',
      obligationType: 'LEGISLATION',
      title: 'Environmental Protection Act',
      jurisdiction: 'NATIONAL',
    };

    it('should return single legal obligation', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(mockObligation);

      const response = await request(app)
        .get('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('14000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/legal', () => {
    const createPayload = {
      obligationType: 'LEGISLATION',
      title: 'Environmental Protection Act 2026',
      jurisdiction: 'NATIONAL',
      regulatoryBody: 'Environmental Agency',
      legislationReference: 'EPA 2026 Section 4',
      description: 'Comprehensive environmental protection legislation',
      applicableActivities: 'All manufacturing activities',
      responsiblePerson: 'Jane Smith',
    };

    it('should create a legal obligation successfully', async () => {
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envLegal.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-LEG-2026-001',
        ...createPayload,
        complianceStatus: 'NOT_ASSESSED',
        status: 'ACTIVE',
      });

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should generate reference number on create', async () => {
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(5);
      (mockPrisma.envLegal.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'ENV-LEG-2026-006',
        ...createPayload,
      });

      await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.envLegal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringContaining('ENV-LEG-'),
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, title: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing obligationType', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, obligationType: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing jurisdiction', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, jurisdiction: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing legislationReference', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, legislationReference: undefined });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envLegal.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.envLegal.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/legal/:id', () => {
    const existingObligation = {
      id: '14000000-0000-4000-a000-000000000001',
      obligationType: 'LEGISLATION',
      title: 'Environmental Protection Act',
      complianceStatus: 'NOT_ASSESSED',
      status: 'ACTIVE',
    };

    it('should update legal obligation successfully', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(existingObligation);
      (mockPrisma.envLegal.update as jest.Mock).mockResolvedValueOnce({
        ...existingObligation,
        complianceStatus: 'COMPLIANT',
      });

      const response = await request(app)
        .put('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'COMPLIANT' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should convert date strings to Date objects', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(existingObligation);
      (mockPrisma.envLegal.update as jest.Mock).mockResolvedValueOnce({
        ...existingObligation,
        effectiveDate: new Date('2026-03-01'),
      });

      await request(app)
        .put('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ effectiveDate: '2026-03-01' });

      expect(mockPrisma.envLegal.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            effectiveDate: expect.any(Date),
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/legal/:id', () => {
    it('should delete legal obligation successfully', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce({ id: '14000000-0000-4000-a000-000000000001' });
      (mockPrisma.envLegal.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.envLegal.update).toHaveBeenCalledWith({
        where: { id: '14000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.envLegal.findUnique as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/legal/14000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
