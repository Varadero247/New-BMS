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
import nonconformancesRoutes from '../src/routes/nonconformances';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
        title: 'Product Defect',
        description: 'Defect found in batch 123',
        standard: 'ISO_9001',
        type: 'PRODUCT_DEFECT',
        severity: 'MAJOR',
        status: 'OPEN',
        dateOccurred: new Date('2024-01-15'),
        reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe' },
      },
      {
        id: 'nc-2',
        title: 'Customer Complaint',
        description: 'Customer reported issue',
        standard: 'ISO_9001',
        type: 'CUSTOMER_COMPLAINT',
        severity: 'MODERATE',
        status: 'UNDER_INVESTIGATION',
        dateOccurred: new Date('2024-01-14'),
        reporter: { id: 'user-2', firstName: 'Jane', lastName: 'Smith' },
      },
    ];

    it('should return list of non-conformances with pagination', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce(mockNCs as any);
      mockPrisma.incident.count.mockResolvedValueOnce(2);

      const response = await request(app)
        .get('/api/nonconformances')
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
      mockPrisma.incident.findMany.mockResolvedValueOnce([mockNCs[0]] as any);
      mockPrisma.incident.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/nonconformances?page=3&limit=10')
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
        .get('/api/nonconformances?status=CLOSED')
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
        .get('/api/nonconformances?type=CUSTOMER_COMPLAINT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'CUSTOMER_COMPLAINT',
          }),
        })
      );
    });

    it('should filter by severity', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([]);
      mockPrisma.incident.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/nonconformances?severity=CRITICAL')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            severity: 'CRITICAL',
          }),
        })
      );
    });

    it('should only return ISO_9001 standard records', async () => {
      mockPrisma.incident.findMany.mockResolvedValueOnce([]);
      mockPrisma.incident.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/nonconformances')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            standard: 'ISO_9001',
          }),
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findMany.mockRejectedValueOnce(new Error('DB error'));

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
      title: 'Product Defect',
      description: 'Defect found in batch 123',
      standard: 'ISO_9001',
      type: 'PRODUCT_DEFECT',
      status: 'OPEN',
      reporter: { id: 'user-1', firstName: 'John', lastName: 'Doe', email: 'john@test.com' },
      investigator: null,
      actions: [],
      fiveWhyAnalysis: null,
      fishboneAnalysis: null,
    };

    it('should return single NC with related data', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(mockNC as any);

      const response = await request(app)
        .get('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('nc-1');
    });

    it('should include actions and analysis data', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(mockNC as any);

      await request(app)
        .get('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findFirst).toHaveBeenCalledWith({
        where: { id: 'nc-1', standard: 'ISO_9001' },
        include: expect.objectContaining({
          actions: true,
          fiveWhyAnalysis: true,
          fishboneAnalysis: true,
        }),
      });
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

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
      type: 'PRODUCT_DEFECT',
      severity: 'MAJOR',
      dateOccurred: '2024-01-15T10:00:00Z',
      location: 'Production Line A',
    };

    it('should create a NC successfully', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        ...createPayload,
        standard: 'ISO_9001',
        referenceNumber: 'NC-2401-1234',
        status: 'OPEN',
        reporterId: 'user-123',
      } as any);

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should set reporterId from authenticated user', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        reporterId: 'user-123',
      } as any);

      await request(app)
        .post('/api/nonconformances')
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
        id: 'new-nc-123',
        referenceNumber: 'NC-2401-1234',
      } as any);

      await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.incident.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^NC-\d{4}-\d{4}$/),
        }),
      });
    });

    it('should set initial status to OPEN', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        status: 'OPEN',
      } as any);

      await request(app)
        .post('/api/nonconformances')
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

    it('should return 400 for invalid type', async () => {
      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, type: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept quality-specific optional fields', async () => {
      mockPrisma.incident.create.mockResolvedValueOnce({
        id: 'new-nc-123',
        productAffected: 'Widget A',
        customerImpact: 'Delayed shipment',
        costOfNonConformance: 5000,
      } as any);

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send({
          ...createPayload,
          productAffected: 'Widget A',
          customerImpact: 'Delayed shipment',
          costOfNonConformance: 5000,
        });

      expect(response.status).toBe(201);
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/nonconformances')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PATCH /api/nonconformances/:id', () => {
    const existingNC = {
      id: 'nc-1',
      title: 'Existing NC',
      standard: 'ISO_9001',
      status: 'OPEN',
      closedAt: null,
    };

    it('should update NC successfully', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingNC as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        ...existingNC,
        title: 'Updated Title',
      } as any);

      const response = await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .patch('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should set closedAt when status is CLOSED', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingNC as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'nc-1',
        status: 'CLOSED',
        closedAt: new Date(),
      } as any);

      await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'CLOSED' });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'nc-1' },
        data: expect.objectContaining({
          closedAt: expect.any(Date),
        }),
      });
    });

    it('should allow updating quality-specific fields', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingNC as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'nc-1',
        productAffected: 'Widget B',
        customerImpact: 'Customer notified',
        costOfNonConformance: 10000,
      } as any);

      await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({
          productAffected: 'Widget B',
          customerImpact: 'Customer notified',
          costOfNonConformance: 10000,
        });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'nc-1' },
        data: expect.objectContaining({
          productAffected: 'Widget B',
          customerImpact: 'Customer notified',
          costOfNonConformance: 10000,
        }),
      });
    });

    it('should allow updating root cause analysis', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingNC as any);
      mockPrisma.incident.update.mockResolvedValueOnce({
        id: 'nc-1',
        immediateCause: 'Material defect',
        rootCauses: 'Supplier quality issue',
      } as any);

      await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({
          immediateCause: 'Material defect',
          rootCauses: 'Supplier quality issue',
        });

      expect(mockPrisma.incident.update).toHaveBeenCalledWith({
        where: { id: 'nc-1' },
        data: expect.objectContaining({
          immediateCause: 'Material defect',
          rootCauses: 'Supplier quality issue',
        }),
      });
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(existingNC as any);

      const response = await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .patch('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/nonconformances/:id', () => {
    it('should delete NC successfully', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce({ id: 'nc-1' } as any);
      mockPrisma.incident.delete.mockResolvedValueOnce({} as any);

      const response = await request(app)
        .delete('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockPrisma.incident.delete).toHaveBeenCalledWith({
        where: { id: 'nc-1' },
      });
    });

    it('should return 404 for non-existent NC', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/nonconformances/non-existent')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should only delete NCs for ISO_9001 standard', async () => {
      mockPrisma.incident.findFirst.mockResolvedValueOnce(null);

      await request(app)
        .delete('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.incident.findFirst).toHaveBeenCalledWith({
        where: { id: 'nc-1', standard: 'ISO_9001' },
      });
    });

    it('should handle database errors', async () => {
      mockPrisma.incident.findFirst.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/nonconformances/nc-1')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
