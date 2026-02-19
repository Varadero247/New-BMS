import express from 'express';
import request from 'supertest';

// Mock dependencies - use ../prisma (not @ims/database)
jest.mock('../src/prisma', () => ({
  prisma: {
    qualSupplier: {
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
import suppliersRoutes from '../src/routes/suppliers';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Quality Suppliers API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ============================================
  // GET /api/suppliers — List suppliers
  // ============================================
  describe('GET /api/suppliers', () => {
    const mockSuppliers = [
      {
        id: '25000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-SUP-2026-001',
        supplierName: 'Acme Materials Ltd',
        category: 'MATERIALS',
        approvedStatus: 'APPROVED',
        overallRating: 'PREFERRED',
        overallImsScore: 92,
        riskLevel: 'LOW',
      },
      {
        id: 'sup-2',
        referenceNumber: 'QMS-SUP-2026-002',
        supplierName: 'Beta Services Co',
        category: 'SERVICES',
        approvedStatus: 'CONDITIONALLY_APPROVED',
        overallRating: 'APPROVED',
        overallImsScore: 78,
        riskLevel: 'LOW',
      },
    ];

    it('should return list of suppliers with pagination', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce(mockSuppliers);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/suppliers')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data.page).toBe(1);
      expect(response.body.data.limit).toBe(20);
      expect(response.body.data.total).toBe(2);
      expect(response.body.data.totalPages).toBe(1);
    });

    it('should support pagination parameters', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce([mockSuppliers[0]]);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/suppliers?page=5&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(5);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(5);
    });

    it('should filter by approvedStatus', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?approvedStatus=APPROVED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            approvedStatus: 'APPROVED',
          }),
        })
      );
    });

    it('should filter by category', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?category=MATERIALS')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            category: 'MATERIALS',
          }),
        })
      );
    });

    it('should filter by overallRating', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app)
        .get('/api/suppliers?overallRating=PREFERRED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            overallRating: 'PREFERRED',
          }),
        })
      );
    });

    it('should filter by search (case-insensitive supplierName search)', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);

      await request(app).get('/api/suppliers?search=acme').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            supplierName: { contains: 'acme', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockResolvedValueOnce(mockSuppliers);
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(2);

      await request(app).get('/api/suppliers').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualSupplier.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/suppliers')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // GET /api/suppliers/:id — Get single supplier
  // ============================================
  describe('GET /api/suppliers/:id', () => {
    const mockSupplier = {
      id: '25000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-SUP-2026-001',
      supplierName: 'Acme Materials Ltd',
      category: 'MATERIALS',
      approvedStatus: 'APPROVED',
      qualityScore: 90,
      hsAuditScore: 85,
      envAuditScore: 80,
      overallImsScore: 86,
      overallRating: 'APPROVED',
      riskLevel: 'LOW',
    };

    it('should return single supplier', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(mockSupplier);

      const response = await request(app)
        .get('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('25000000-0000-4000-a000-000000000001');
      expect(response.body.data.supplierName).toBe('Acme Materials Ltd');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff supplier', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/suppliers/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .get('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // POST /api/suppliers — Create supplier
  // ============================================
  describe('POST /api/suppliers', () => {
    const createPayload = {
      supplierName: 'New Supplier Inc',
      category: 'EQUIPMENT',
    };

    it('should create a supplier successfully', async () => {
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualSupplier.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-SUP-2026-001',
        ...createPayload,
        approvedStatus: 'PENDING_EVALUATION',
        qualityScore: 0,
        hsAuditScore: 0,
        envAuditScore: 0,
        overallImsScore: 0,
        overallRating: 'DISQUALIFIED',
        riskLevel: 'CRITICAL',
      });

      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.supplierName).toBe('New Supplier Inc');
      expect(response.body.data.referenceNumber).toBe('QMS-SUP-2026-001');
    });

    it('should auto-calculate IMS score and ratings', async () => {
      const payloadWithScores = {
        supplierName: 'Quality Corp',
        category: 'MATERIALS',
        qualityScore: 90,
        hsAuditScore: 80,
        envAuditScore: 70,
      };

      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualSupplier.create as jest.Mock).mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...payloadWithScores,
        overallImsScore: 83, // 90*0.5 + 80*0.3 + 70*0.2 = 45+24+14 = 83
        overallRating: 'APPROVED',
        riskLevel: 'LOW',
      });

      await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(payloadWithScores);

      expect(mockPrisma.qualSupplier.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          overallImsScore: 83,
          overallRating: 'APPROVED',
          riskLevel: 'LOW',
        }),
      });
    });

    it('should return 400 for missing supplierName', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ category: 'MATERIALS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing category', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ supplierName: 'Test Supplier' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid category', async () => {
      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send({ supplierName: 'Test', category: 'INVALID_CATEGORY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.qualSupplier.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/suppliers')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // PUT /api/suppliers/:id — Update supplier
  // ============================================
  describe('PUT /api/suppliers/:id', () => {
    const existingSupplier = {
      id: '25000000-0000-4000-a000-000000000001',
      supplierName: 'Existing Supplier',
      category: 'MATERIALS',
      qualityScore: 80,
      hsAuditScore: 70,
      envAuditScore: 60,
      overallImsScore: 73,
      overallRating: 'CONDITIONAL',
      riskLevel: 'MEDIUM',
    };

    it('should update supplier successfully', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(existingSupplier);
      (mockPrisma.qualSupplier.update as jest.Mock).mockResolvedValueOnce({
        ...existingSupplier,
        supplierName: 'Updated Supplier',
      });

      const response = await request(app)
        .put('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ supplierName: 'Updated Supplier' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.supplierName).toBe('Updated Supplier');
    });

    it('should recalculate IMS score when quality scores change', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(existingSupplier);
      (mockPrisma.qualSupplier.update as jest.Mock).mockResolvedValueOnce({
        ...existingSupplier,
        qualityScore: 95,
        overallImsScore: 81, // 95*0.5 + 70*0.3 + 60*0.2 = 47.5+21+12 = 80.5 -> 81
        overallRating: 'APPROVED',
        riskLevel: 'LOW',
      });

      await request(app)
        .put('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ qualityScore: 95 });

      expect(mockPrisma.qualSupplier.update).toHaveBeenCalledWith({
        where: { id: '25000000-0000-4000-a000-000000000001' },
        data: expect.objectContaining({
          overallImsScore: 81,
          overallRating: 'APPROVED',
          riskLevel: 'LOW',
        }),
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff supplier', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/suppliers/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ supplierName: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid approvedStatus', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(existingSupplier);

      const response = await request(app)
        .put('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ approvedStatus: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .put('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ supplierName: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  // ============================================
  // DELETE /api/suppliers/:id — Delete supplier
  // ============================================
  describe('DELETE /api/suppliers/:id', () => {
    it('should delete supplier successfully', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce({
        id: '25000000-0000-4000-a000-000000000001',
      });
      (mockPrisma.qualSupplier.update as jest.Mock).mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualSupplier.update).toHaveBeenCalledWith({
        where: { id: '25000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff supplier', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/suppliers/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      (mockPrisma.qualSupplier.findUnique as jest.Mock).mockRejectedValueOnce(
        new Error('DB error')
      );

      const response = await request(app)
        .delete('/api/suppliers/25000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
