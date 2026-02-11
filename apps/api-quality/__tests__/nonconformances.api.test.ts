import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    qualNonConformance: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));

import { prisma } from '../src/prisma';
import nonconformancesRoutes from '../src/routes/nonconformances';

const mockPrisma = prisma as any;

describe('Quality Nonconformances API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nonconformances', nonconformancesRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/nonconformances', () => {
    const mockNCs = [
      {
        id: 'nc-1',
        referenceNumber: 'QMS-NC-2026-001',
        title: 'Product Defect',
        description: 'Defect found in batch 123',
        ncType: 'PRODUCT_DEFECT',
        source: 'INSPECTION',
        severity: 'MAJOR',
        status: 'REPORTED',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'nc-2',
        referenceNumber: 'QMS-NC-2026-002',
        title: 'Customer Complaint',
        description: 'Customer reported issue',
        ncType: 'CUSTOMER_COMPLAINT',
        source: 'CUSTOMER_FEEDBACK',
        severity: 'MODERATE',
        status: 'UNDER_REVIEW',
        createdAt: new Date('2024-01-14'),
      },
    ];

    it('should return list of non-conformances with pagination', async () => {
      mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce(mockNCs);
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/nonconformances')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.items).toHaveLength(2);
      expect(response.body.data).toMatchObject({
        page: 1,
        limit: 20,
        total: 2,
        totalPages: 1,
      });
    });

    it('should support pagination parameters', async () => {
      mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([mockNCs[0]]);
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/nonconformances?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(5);
    });

    it('should filter by status', async () => {
      mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/nonconformances?status=CLOSED')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'CLOSED',
          }),
        })
      );
    });

    it('should filter by ncType', async () => {
      mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/nonconformances?ncType=CUSTOMER_COMPLAINT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ncType: 'CUSTOMER_COMPLAINT',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/nonconformances?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'CRITICAL',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/nonconformances')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/nonconformances/:id', () => {
    const mockNC = {
      id: 'nc-1',
      referenceNumber: 'QMS-NC-2026-001',
      title: 'Product Defect',
      description: 'Defect found in batch 123',
      ncType: 'PRODUCT_DEFECT',
      status: 'REPORTED',
    };

    it('should return single NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(mockNC);

      const response = await request(app)
        .get('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('nc-1');
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/nonconformances', () => {
    const createPayload = {
      title: 'New Non-Conformance',
      description: 'Description of the issue',
      ncType: 'PRODUCT_DEFECT',
      source: 'INSPECTION',
      severity: 'MAJOR',
      reportedBy: 'John Doe',
      department: 'Production',
    };

    it('should create a NC successfully', async () => {
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
      mockPrisma.qualNonConformance.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        ...createPayload,
        referenceNumber: 'QMS-NC-2026-001',
        status: 'REPORTED',
      });

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should generate a reference number', async () => {
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(3);
      mockPrisma.qualNonConformance.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        referenceNumber: 'QMS-NC-2026-004',
      });

      await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualNonConformance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^QMS-NC-\d{4}-\d{3}$/),
        }),
      });
    });

    it('should set initial status to REPORTED', async () => {
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
      mockPrisma.qualNonConformance.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        status: 'REPORTED',
      });

      await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualNonConformance.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          status: 'REPORTED',
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const { title, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const { description, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid ncType', async () => {
      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, ncType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
      mockPrisma.qualNonConformance.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/nonconformances/:id', () => {
    const existingNC = {
      id: 'nc-1',
      title: 'Existing NC',
      status: 'REPORTED',
      closureDate: null,
    };

    it('should update NC successfully', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(existingNC);
      mockPrisma.qualNonConformance.update.mockResolvedValueOnce({
        ...existingNC,
        title: 'Updated Title',
      });

      const response = await request(app)
        .put('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(existingNC);

      const response = await request(app)
        .put('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/nonconformances/:id', () => {
    it('should delete NC successfully', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({ id: 'nc-1' });
      mockPrisma.qualNonConformance.delete.mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.qualNonConformance.delete).toHaveBeenCalledWith({
        where: { id: 'nc-1' },
      });
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
