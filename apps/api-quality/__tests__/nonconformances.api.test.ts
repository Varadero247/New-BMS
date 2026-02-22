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
    req.user = { id: '20000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'USER' };
    next();
  }),
}));
jest.mock('@ims/service-auth', () => ({
  checkOwnership: () => (_req: any, _res: any, next: any) => next(),
  scopeToUser: (_req: any, _res: any, next: any) => next(),
}));

import { prisma } from '../src/prisma';
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
        id: '1c000000-0000-4000-a000-000000000001',
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
      id: '1c000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-NC-2026-001',
      title: 'Product Defect',
      description: 'Defect found in batch 123',
      ncType: 'PRODUCT_DEFECT',
      status: 'REPORTED',
    };

    it('should return single NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(mockNC);

      const response = await request(app)
        .get('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('1c000000-0000-4000-a000-000000000001');
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/api/nonconformances/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .get('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
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
        id: '30000000-0000-4000-a000-000000000123',
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
        id: '30000000-0000-4000-a000-000000000123',
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
        id: '30000000-0000-4000-a000-000000000123',
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
      id: '1c000000-0000-4000-a000-000000000001',
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
        .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated Title' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .put('/api/nonconformances/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 400 for invalid status', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(existingNC);

      const response = await request(app)
        .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ status: 'INVALID_STATUS' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token')
        .send({ title: 'Updated' });

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });

  describe('DELETE /api/nonconformances/:id', () => {
    it('should delete NC successfully', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
        id: '1c000000-0000-4000-a000-000000000001',
      });
      mockPrisma.qualNonConformance.delete.mockResolvedValueOnce({});

      const response = await request(app)
        .delete('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(204);
      expect(mockPrisma.qualNonConformance.update).toHaveBeenCalledWith({
        where: { id: '1c000000-0000-4000-a000-000000000001' },
        data: { deletedAt: expect.any(Date) },
      });
    });

    it('should return 404 for 00000000-0000-4000-a000-ffffffffffff NC', async () => {
      mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);

      const response = await request(app)
        .delete('/api/nonconformances/00000000-0000-4000-a000-ffffffffffff')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should handle database errors', async () => {
      mockPrisma.qualNonConformance.findUnique.mockRejectedValueOnce(new Error('DB error'));

      const response = await request(app)
        .delete('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
        .set('Authorization', 'Bearer token');

      expect(response.status).toBe(500);
      expect(response.body.error.code).toBe('INTERNAL_ERROR');
    });
  });
});

// ── Additional coverage ──────────────────────────────────────────────────────

describe('Quality Nonconformances — additional coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nonconformances', nonconformancesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET / totalPages calculated correctly for multi-page results', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(100);

    const res = await request(app)
      .get('/api/nonconformances?page=1&limit=10')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.data.totalPages).toBe(10);
  });

  it('GET / filters by ncType param (wired into where clause)', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/nonconformances?ncType=PRODUCT_DEFECT')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ ncType: 'PRODUCT_DEFECT' }),
      })
    );
  });

  it('POST / returns 400 for invalid severity enum', async () => {
    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'Test NC',
        description: 'desc',
        ncType: 'PRODUCT_DEFECT',
        source: 'INSPECTION',
        severity: 'CATASTROPHIC_INVALID',
        reportedBy: 'John',
        department: 'QA',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('PUT / returns 500 when update throws after find', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      title: 'Existing NC',
      status: 'REPORTED',
      closureDate: null,
    });
    mockPrisma.qualNonConformance.update.mockRejectedValueOnce(new Error('write fail'));

    const res = await request(app)
      .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id response contains referenceNumber field', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      referenceNumber: 'QMS-NC-2026-001',
      title: 'Product Defect',
      description: 'Defect found in batch 123',
      ncType: 'PRODUCT_DEFECT',
      status: 'REPORTED',
    });

    const res = await request(app)
      .get('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('referenceNumber');
  });

  it('GET / success:true with data.items array in response', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/nonconformances')
      .set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
  });

  it('POST / returns 500 when count throws during reference number generation', async () => {
    mockPrisma.qualNonConformance.count.mockRejectedValueOnce(new Error('count fail'));

    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'New NC',
        description: 'desc',
        ncType: 'PRODUCT_DEFECT',
        source: 'INSPECTION',
        severity: 'MAJOR',
        reportedBy: 'John',
        department: 'QA',
      });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Quality Nonconformances — further edge cases', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nonconformances', nonconformancesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/nonconformances — search filter applied to where clause', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/nonconformances?search=defect')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          title: { contains: 'defect', mode: 'insensitive' },
        }),
      })
    );
  });

  it('GET /api/nonconformances — severity filter applied to where clause', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    await request(app)
      .get('/api/nonconformances?severity=MAJOR')
      .set('Authorization', 'Bearer token');

    expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ severity: 'MAJOR' }),
      })
    );
  });

  it('PUT /api/nonconformances/:id — update passes correct id in where', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      title: 'Existing NC',
      status: 'REPORTED',
      closureDate: null,
    });
    mockPrisma.qualNonConformance.update.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      title: 'Updated NC',
    });

    await request(app)
      .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ title: 'Updated NC' });

    expect(mockPrisma.qualNonConformance.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: '1c000000-0000-4000-a000-000000000001' },
      })
    );
  });

  it('POST /api/nonconformances — sets reportedBy from payload', async () => {
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
    mockPrisma.qualNonConformance.create.mockResolvedValueOnce({
      id: '30000000-0000-4000-a000-000000000123',
      referenceNumber: 'QMS-NC-2026-001',
      title: 'New NC',
      description: 'desc',
      ncType: 'PRODUCT_DEFECT',
      source: 'INSPECTION',
      severity: 'MAJOR',
      reportedBy: 'QA Inspector',
      department: 'QA',
      status: 'REPORTED',
    });

    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'New NC',
        description: 'desc',
        ncType: 'PRODUCT_DEFECT',
        source: 'INSPECTION',
        severity: 'MAJOR',
        reportedBy: 'QA Inspector',
        department: 'QA',
      });

    expect(res.status).toBe(201);
    expect(mockPrisma.qualNonConformance.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ reportedBy: 'QA Inspector' }),
      })
    );
  });

  it('GET /api/nonconformances — response has success:true and data.items', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/nonconformances')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('items');
  });
});

describe('Quality Nonconformances — final coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nonconformances', nonconformancesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/nonconformances — response has correct page number', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);

    const res = await request(app)
      .get('/api/nonconformances?page=4&limit=10')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(200);
    expect(res.body.data.page).toBe(4);
    expect(res.body.data.limit).toBe(10);
  });

  it('POST /api/nonconformances — 400 for missing source field', async () => {
    const res = await request(app)
      .post('/api/nonconformances')
      .set('Authorization', 'Bearer token')
      .send({
        title: 'NC without source',
        description: 'desc',
        ncType: 'PRODUCT_DEFECT',
        severity: 'MAJOR',
        reportedBy: 'John',
        department: 'QA',
      });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/nonconformances/:id — 500 on update error after findUnique', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
    });
    mockPrisma.qualNonConformance.update.mockRejectedValueOnce(new Error('DB write error'));

    const res = await request(app)
      .delete('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /api/nonconformances/:id — accepts valid status CLOSED', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      title: 'Existing NC',
      status: 'UNDER_REVIEW',
      closureDate: null,
    });
    mockPrisma.qualNonConformance.update.mockResolvedValueOnce({
      id: '1c000000-0000-4000-a000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app)
      .put('/api/nonconformances/1c000000-0000-4000-a000-000000000001')
      .set('Authorization', 'Bearer token')
      .send({ status: 'CLOSED' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('GET /api/nonconformances data.items is array', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/nonconformances').set('Authorization', 'Bearer token');
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});


describe('Quality Nonconformances — phase28 coverage', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/nonconformances', nonconformancesRoutes);
  });

  beforeEach(() => jest.clearAllMocks());

  it('GET /api/nonconformances findMany called once per list request', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
    await request(app).get('/api/nonconformances').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualNonConformance.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/nonconformances count called once per list request', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
    await request(app).get('/api/nonconformances').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualNonConformance.count).toHaveBeenCalledTimes(1);
  });

  it('DELETE /api/nonconformances/:id does not call update when not found', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);
    await request(app).delete('/api/nonconformances/00000000-0000-4000-a000-ffffffffffff').set('Authorization', 'Bearer token');
    expect(mockPrisma.qualNonConformance.update).not.toHaveBeenCalled();
  });

  it('GET /api/nonconformances/:id returns NOT_FOUND code when not found', async () => {
    mockPrisma.qualNonConformance.findUnique.mockResolvedValueOnce(null);
    const res = await request(app).get('/api/nonconformances/00000000-0000-4000-a000-ffffffffffff').set('Authorization', 'Bearer token');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/nonconformances data.total is 0 when no records exist', async () => {
    mockPrisma.qualNonConformance.findMany.mockResolvedValueOnce([]);
    mockPrisma.qualNonConformance.count.mockResolvedValueOnce(0);
    const res = await request(app).get('/api/nonconformances').set('Authorization', 'Bearer token');
    expect(res.body.data.total).toBe(0);
  });
});
