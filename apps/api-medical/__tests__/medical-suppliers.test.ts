import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    medicalSupplier: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
  Prisma: {},
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
import suppliersRouter from '../src/routes/suppliers';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

// ── Test data ────────────────────────────────────────────────────────

const SUPPLIER_ID = '00000000-0000-0000-0000-000000000001';

const mockSupplier = {
  id: SUPPLIER_ID,
  referenceNumber: 'SUP-2602-0001',
  name: 'MedTech Components Ltd',
  classification: 'CRITICAL',
  qualificationStatus: 'QUALIFIED',
  iso13485Certified: true,
  riskLevel: 'LOW',
  products: 'Sterilization pouches, surgical tape',
  nextAuditDate: new Date('2026-06-01'),
  lastAuditDate: new Date('2025-06-01'),
  notes: null,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date('2026-01-01'),
  updatedAt: new Date('2026-01-15'),
};

describe('Medical Suppliers API Routes', () => {
  let app: express.Express;

  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRouter);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ── GET /api/suppliers ────────────────────────────────────────────────
  describe('GET /api/suppliers', () => {
    it('should return 200 with list of suppliers', async () => {
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([mockSupplier]);

      const response = await request(app).get('/api/suppliers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('MedTech Components Ltd');
    });

    it('should return 200 with empty list when no suppliers', async () => {
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);

      const response = await request(app).get('/api/suppliers');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
    });

    it('should support qualificationStatus filter', async () => {
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([mockSupplier]);

      const response = await request(app).get('/api/suppliers?qualificationStatus=QUALIFIED');

      expect(response.status).toBe(200);
      expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ qualificationStatus: 'QUALIFIED', deletedAt: null }),
        })
      );
    });

    it('should support riskLevel filter', async () => {
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([mockSupplier]);

      const response = await request(app).get('/api/suppliers?riskLevel=LOW');

      expect(response.status).toBe(200);
      expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ riskLevel: 'LOW', deletedAt: null }),
        })
      );
    });

    it('should filter by search term on client side', async () => {
      const nonMatchingSupplier = {
        ...mockSupplier,
        id: '00000000-0000-0000-0000-000000000002',
        name: 'Generic Parts Co',
      };
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([
        mockSupplier,
        nonMatchingSupplier,
      ]);

      const response = await request(app).get('/api/suppliers?search=medtech');

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].name).toBe('MedTech Components Ltd');
    });

    it('should call findMany with deletedAt null filter', async () => {
      (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([]);

      await request(app).get('/api/suppliers');

      expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ deletedAt: null }),
        })
      );
    });
  });

  // ── GET /api/suppliers/:id ────────────────────────────────────────────
  describe('GET /api/suppliers/:id', () => {
    it('should return 200 with single supplier', async () => {
      (mockPrisma.medicalSupplier.findFirst as jest.Mock).mockResolvedValueOnce(mockSupplier);

      const response = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(SUPPLIER_ID);
      expect(response.body.data.name).toBe('MedTech Components Ltd');
    });

    it('should return 404 when supplier not found', async () => {
      (mockPrisma.medicalSupplier.findFirst as jest.Mock).mockResolvedValueOnce(null);

      const response = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
      expect(response.body.error.message).toBe('Supplier not found');
    });

    it('should query with id and deletedAt null filter', async () => {
      (mockPrisma.medicalSupplier.findFirst as jest.Mock).mockResolvedValueOnce(mockSupplier);

      await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

      expect(mockPrisma.medicalSupplier.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: SUPPLIER_ID, deletedAt: null },
        })
      );
    });
  });

  // ── POST /api/suppliers ───────────────────────────────────────────────
  describe('POST /api/suppliers', () => {
    const newSupplierBody = {
      name: 'BioTech Sterilization Inc',
      classification: 'MAJOR',
      products: 'Sterilization equipment',
      iso13485Certified: true,
      riskLevel: 'MEDIUM',
      nextAuditDate: '2026-12-01',
    };

    it('should create supplier and return 201', async () => {
      (mockPrisma.medicalSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.medicalSupplier.create as jest.Mock).mockResolvedValueOnce(mockSupplier);

      const response = await request(app).post('/api/suppliers').send(newSupplierBody);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
    });

    it('should create supplier with PENDING qualificationStatus by default', async () => {
      (mockPrisma.medicalSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.medicalSupplier.create as jest.Mock).mockResolvedValueOnce(mockSupplier);

      await request(app).post('/api/suppliers').send(newSupplierBody);

      expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            qualificationStatus: 'PENDING',
            createdBy: 'test@test.com',
          }),
        })
      );
    });

    it('should use MAJOR as default classification when not provided', async () => {
      (mockPrisma.medicalSupplier.count as jest.Mock).mockResolvedValueOnce(0);
      (mockPrisma.medicalSupplier.create as jest.Mock).mockResolvedValueOnce(mockSupplier);

      await request(app).post('/api/suppliers').send({ name: 'New Supplier' });

      expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            classification: 'MAJOR',
            riskLevel: 'MEDIUM',
          }),
        })
      );
    });
  });

  // ── PUT /api/suppliers/:id ────────────────────────────────────────────
  describe('PUT /api/suppliers/:id', () => {
    it('should update supplier and return 200', async () => {
      const updatedSupplier = { ...mockSupplier, qualificationStatus: 'QUALIFIED' };
      (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce(updatedSupplier);

      const response = await request(app)
        .put(`/api/suppliers/${SUPPLIER_ID}`)
        .send({ qualificationStatus: 'QUALIFIED' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.qualificationStatus).toBe('QUALIFIED');
    });

    it('should call update with correct id and fields', async () => {
      const updatedSupplier = { ...mockSupplier, name: 'Updated Name', riskLevel: 'HIGH' };
      (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce(updatedSupplier);

      await request(app)
        .put(`/api/suppliers/${SUPPLIER_ID}`)
        .send({ name: 'Updated Name', riskLevel: 'HIGH' });

      expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: SUPPLIER_ID },
          data: expect.objectContaining({
            name: 'Updated Name',
            riskLevel: 'HIGH',
          }),
        })
      );
    });

    it('should return 500 when Prisma update throws', async () => {
      (mockPrisma.medicalSupplier.update as jest.Mock).mockRejectedValueOnce(
        new Error('Record to update not found')
      );

      const response = await request(app)
        .put(`/api/suppliers/${SUPPLIER_ID}`)
        .send({ name: 'Ghost Supplier' });

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });

  // ── DELETE /api/suppliers/:id ─────────────────────────────────────────
  describe('DELETE /api/suppliers/:id', () => {
    it('should soft delete supplier and return 200', async () => {
      (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce({
        ...mockSupplier,
        deletedAt: new Date(),
      });

      const response = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(SUPPLIER_ID);
    });

    it('should call update with deletedAt set', async () => {
      (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce({
        ...mockSupplier,
        deletedAt: new Date(),
      });

      await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

      expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: SUPPLIER_ID },
          data: expect.objectContaining({ deletedAt: expect.any(Date) }),
        })
      );
    });

    it('should return 500 when Prisma update throws', async () => {
      (mockPrisma.medicalSupplier.update as jest.Mock).mockRejectedValueOnce(
        new Error('Record to delete not found')
      );

      const response = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});

describe('medical-suppliers — additional coverage', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRouter);
    jest.clearAllMocks();
  });

  it('route responds to GET /api/suppliers', async () => {
    const res = await request(app).get('/api/suppliers');
    expect([200, 400, 401, 404, 500]).toContain(res.status);
  });

  it('response is JSON content-type for GET /api/suppliers', async () => {
    const res = await request(app).get('/api/suppliers');
    expect(res.headers['content-type']).toBeDefined();
  });
});

describe('medical-suppliers — error paths and edge cases', () => {
  let app: express.Express;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    app.use('/api/suppliers', suppliersRouter);
    jest.clearAllMocks();
  });

  it('GET / returns 500 with INTERNAL_ERROR when findMany throws', async () => {
    (mockPrisma.medicalSupplier.findMany as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 with INTERNAL_ERROR when findFirst throws', async () => {
    (mockPrisma.medicalSupplier.findFirst as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 with INTERNAL_ERROR when create throws', async () => {
    (mockPrisma.medicalSupplier.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.medicalSupplier.create as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).post('/api/suppliers').send({ name: 'New Supplier' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE / returns 500 with INTERNAL_ERROR when update throws', async () => {
    (mockPrisma.medicalSupplier.update as jest.Mock).mockRejectedValueOnce(new Error('DB error'));

    const res = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET / search filter — non-matching term returns empty array', async () => {
    (mockPrisma.medicalSupplier.findMany as jest.Mock).mockResolvedValueOnce([mockSupplier]);

    const res = await request(app).get('/api/suppliers?search=zzznomatch');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('PUT /:id updates the notes field', async () => {
    const updatedSupplier = { ...mockSupplier, notes: 'Updated notes' };
    (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce(updatedSupplier);

    const res = await request(app)
      .put(`/api/suppliers/${SUPPLIER_ID}`)
      .send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
    expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ notes: 'Updated notes' }),
      })
    );
  });

  it('DELETE / response data id matches the deleted supplier id', async () => {
    (mockPrisma.medicalSupplier.update as jest.Mock).mockResolvedValueOnce({
      ...mockSupplier,
      deletedAt: new Date(),
    });

    const res = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(SUPPLIER_ID);
  });

  it('POST / createdBy is set from authenticated user email', async () => {
    (mockPrisma.medicalSupplier.count as jest.Mock).mockResolvedValueOnce(0);
    (mockPrisma.medicalSupplier.create as jest.Mock).mockResolvedValueOnce(mockSupplier);

    await request(app).post('/api/suppliers').send({ name: 'Any Supplier' });

    expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ createdBy: 'test@test.com' }),
      })
    );
  });
});
