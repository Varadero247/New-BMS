import express from 'express';
import request from 'supertest';

// Mock dependencies
jest.mock('../src/prisma', () => ({
  prisma: {
    qualLegal: {
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

describe('Quality Legal Obligations API Routes', () => {
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
    const mockLegalItems = [
      {
        id: '18000000-0000-4000-a000-000000000001',
        referenceNumber: 'QMS-LEG-2026-001',
        title: 'ISO 9001:2015 Certification',
        obligationType: 'CERTIFICATION_REQUIREMENT',
        complianceStatus: 'COMPLIANT',
        status: 'ACTIVE',
        description: 'Maintain ISO 9001 certification',
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'leg-2',
        referenceNumber: 'QMS-LEG-2026-002',
        title: 'Customer Contract Quality Requirements',
        obligationType: 'CUSTOMER_CONTRACT',
        complianceStatus: 'PARTIALLY_COMPLIANT',
        status: 'ACTIVE',
        description: 'Meet contractual quality standards',
        createdAt: new Date('2024-01-14'),
      },
    ];

    it('should return list of legal obligations with pagination', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce(mockLegalItems);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(2);

      const response = await request(app).get('/api/legal').set('Authorization', 'Bearer token');

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
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([mockLegalItems[0]]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(50);

      const response = await request(app)
        .get('/api/legal?page=3&limit=10')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.page).toBe(3);
      expect(response.body.data.limit).toBe(10);
      expect(response.body.data.totalPages).toBe(5);
    });

    it('should filter by obligationType', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?obligationType=REGULATORY')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            obligationType: 'REGULATORY',
          }),
        })
      );
    });

    it('should filter by complianceStatus', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

      await request(app)
        .get('/api/legal?complianceStatus=NON_COMPLIANT')
        .set('Authorization', 'Bearer token');

      expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            complianceStatus: 'NON_COMPLIANT',
          }),
        })
      );
    });

    it('should filter by status', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

      await request(app).get('/api/legal?status=EXPIRED').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: 'EXPIRED',
          }),
        })
      );
    });

    it('should support search filter', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

      await request(app).get('/api/legal?search=ISO').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            title: { contains: 'ISO', mode: 'insensitive' },
          }),
        })
      );
    });

    it('should order by createdAt descending', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce(mockLegalItems);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(2);

      await request(app).get('/api/legal').set('Authorization', 'Bearer token');

      expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { createdAt: 'desc' },
        })
      );
    });

    it('should handle database errors', async () => {
      mockPrisma.qualLegal.findMany.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app).get('/api/legal').set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('GET /api/legal/:id', () => {
    const mockLegal = {
      id: '18000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-LEG-2026-001',
      title: 'ISO 9001:2015 Certification',
      obligationType: 'CERTIFICATION_REQUIREMENT',
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      description: 'Maintain ISO 9001 certification',
    };

    it('should return single legal obligation', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(mockLegal);

      const response = await request(app)
        .get('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('18000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualLegal.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('POST /api/legal', () => {
    const createPayload = {
      title: 'New Regulatory Requirement',
      obligationType: 'REGULATORY',
      description: 'New government regulation on product safety',
    };

    it('should create a legal obligation successfully', async () => {
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);
      mockPrisma.qualLegal.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        ...createPayload,
        referenceNumber: 'QMS-LEG-2026-001',
        complianceStatus: 'NOT_ASSESSED',
        status: 'ACTIVE',
        reviewFrequency: 'ANNUALLY',
      });

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(createPayload.title);
    });

    it('should generate a reference number', async () => {
      mockPrisma.qualLegal.count.mockResolvedValueOnce(4);
      mockPrisma.qualLegal.create.mockResolvedValueOnce({
        id: '30000000-0000-4000-a000-000000000123',
        referenceNumber: 'QMS-LEG-2026-005',
      });

      await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(mockPrisma.qualLegal.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          referenceNumber: expect.stringMatching(/^QMS-LEG-\d{4}-\d{3}$/),
        }),
      });
    });

    it('should return 400 for missing title', async () => {
      const { title, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for missing description', async () => {
      const { description, ...payload } = createPayload;

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(payload);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid obligationType', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({ ...createPayload, obligationType: 'INVALID_TYPE' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);
      mockPrisma.qualLegal.create.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send(createPayload);

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('PUT /api/legal/:id', () => {
    const existingLegal = {
      id: '18000000-0000-4000-a000-000000000001',
      title: 'Existing Legal Obligation',
      status: 'ACTIVE',
      complianceStatus: 'NOT_ASSESSED',
    };

    it('should update legal obligation successfully', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(existingLegal);
      mockPrisma.qualLegal.update.mockResolvedValueOnce({
        ...existingLegal,
        title: 'Updated Title',
      });

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid complianceStatus', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(existingLegal);

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ complianceStatus: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(existingLegal);

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid reviewFrequency', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(existingLegal);

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ reviewFrequency: 'INVALID_FREQUENCY' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualLegal.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/legal/:id', () => {
    it('should delete legal obligation successfully', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce({
        id: '18000000-0000-4000-a000-000000000001',
      });
      mockPrisma.qualLegal.delete.mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualLegal.update).toHaveBeenCalledWith({
        where: { id: '18000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff legal obligation', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/legal/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualLegal.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('Additional coverage: pagination, response shape, and 500 paths', () => {
    it('should compute totalPages correctly for large datasets', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(60);

      const response = await request(app)
        .get('/api/legal?page=1&limit=20')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.data.totalPages).toBe(3);
    });

    it('GET /api/legal: response has success:true and items array', async () => {
      mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
      mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

      const response = await request(app)
        .get('/api/legal')
        .set('Authorization', 'Bearer token');

      expect(response.body).toHaveProperty('success', true);
      expect(Array.isArray(response.body.data.items)).toBe(true);
    });

    it('PUT /api/legal/:id: returns 500 when update throws', async () => {
      mockPrisma.qualLegal.findUnique.mockResolvedValueOnce({
        id: '18000000-0000-4000-a000-000000000001',
        title: 'Legal Obligation',
        status: 'ACTIVE',
        complianceStatus: 'NOT_ASSESSED',
      });
      mockPrisma.qualLegal.update.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/legal/18000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'New Title' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });

    it('POST /api/legal: returns 400 for missing obligationType', async () => {
      const response = await request(app)
        .post('/api/legal')
        .set('Authorization', 'Bearer token')
        .send({
          title: 'Legal Requirement Without Type',
          description: 'Some description',
        });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});

describe('Quality Legal Obligations API — extended edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/legal', legalRoutes);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('DELETE /api/legal/:id — 500 on update error after findUnique', async () => {
    mockPrisma.qualLegal.findUnique.mockResolvedValueOnce({
      id: '18000000-0000-4000-a000-000000000001',
    });
    mockPrisma.qualLegal.update.mockRejectedValueOnce(new Error('DB write fail'));

    const response = await request(app)
      .delete('/api/legal/18000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(500);
    expect(response.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/legal/:id — returns referenceNumber in response', async () => {
    mockPrisma.qualLegal.findUnique.mockResolvedValueOnce({
      id: '18000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-LEG-2026-001',
      title: 'ISO 9001:2015 Certification',
      obligationType: 'CERTIFICATION_REQUIREMENT',
      complianceStatus: 'COMPLIANT',
      status: 'ACTIVE',
      description: 'Maintain ISO 9001 certification',
    });

    const response = await request(app)
      .get('/api/legal/18000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(response.status).toBe(200);
    expect(response.body.data.referenceNumber).toBe('QMS-LEG-2026-001');
  });

  it('POST /api/legal — count is called to generate sequential reference number', async () => {
    mockPrisma.qualLegal.count.mockResolvedValueOnce(3);
    mockPrisma.qualLegal.create.mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-LEG-2026-004',
      title: 'New Reg',
      obligationType: 'REGULATORY',
      description: 'desc',
    });

    await request(app)
      .post('/api/legal')
      .set('Authorization', 'Bearer token')
      .send({ title: 'New Reg', obligationType: 'REGULATORY', description: 'desc' });

    expect(mockPrisma.qualLegal.count).toHaveBeenCalled();
  });

  it('PUT /api/legal/:id — update passes correct id in where clause', async () => {
    mockPrisma.qualLegal.findUnique.mockResolvedValueOnce({
      id: '18000000-0000-4000-a000-000000000001',
      title: 'Legal Obligation',
      status: 'ACTIVE',
      complianceStatus: 'NOT_ASSESSED',
    });
    mockPrisma.qualLegal.update.mockResolvedValueOnce({
      id: '18000000-0000-4000-a000-000000000001',
      title: 'Updated Title',
    });

    await request(app)
      .put('/api/legal/18000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated Title' });

    expect(mockPrisma.qualLegal.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '18000000-0000-4000-a000-000000000001' },
      })
    );
  });

  it('GET /api/legal — orderBy createdAt desc is applied', async () => {
    mockPrisma.qualLegal.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualLegal.count.mockResolvedValueOnce(0);

    await request(app).get('/api/legal').set('Authorization', 'Bearer token');

    expect(mockPrisma.qualLegal.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { createdAt: 'desc' } })
    );
  });
});
