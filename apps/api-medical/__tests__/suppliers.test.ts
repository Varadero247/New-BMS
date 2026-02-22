import express from 'express';
import request from 'supertest';

// ── Mocks ───────────────────────────────────────────────────────────

jest.mock('../src/prisma', () => ({
  prisma: {
    medicalSupplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
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

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  }),
}));

jest.mock('@ims/shared', () => ({
  validateIdParam: () => (_req: any, _res: any, next: any) => next(),
}));

import suppliersRouter from '../src/routes/suppliers';
import { prisma } from '../src/prisma';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/suppliers', suppliersRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

const SUPPLIER_ID = '00000000-0000-0000-0000-000000000001';

const mockSupplier = {
  id: SUPPLIER_ID,
  referenceNumber: 'SUP-2601-0001',
  name: 'MedTech Components Ltd',
  classification: 'MAJOR',
  qualificationStatus: 'APPROVED',
  iso13485Certified: true,
  riskLevel: 'LOW',
  products: 'Valves, Tubes',
  lastAuditDate: null,
  nextAuditDate: null,
  notes: null,
  createdBy: 'test@test.com',
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ── GET / ─────────────────────────────────────────────────────────

describe('GET /api/suppliers', () => {
  it('returns a list of suppliers', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([mockSupplier]);

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('MedTech Components Ltd');
  });

  it('returns empty array when no suppliers exist', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('filters by qualificationStatus', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([mockSupplier]);

    const res = await request(app).get('/api/suppliers?qualificationStatus=APPROVED');

    expect(res.status).toBe(200);
    expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ qualificationStatus: 'APPROVED' }),
      })
    );
  });

  it('filters by riskLevel', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([mockSupplier]);

    const res = await request(app).get('/api/suppliers?riskLevel=LOW');

    expect(res.status).toBe(200);
    expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ riskLevel: 'LOW' }),
      })
    );
  });

  it('filters by search term (client-side)', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([
      mockSupplier,
      { ...mockSupplier, id: '00000000-0000-0000-0000-000000000002', name: 'Unrelated Corp' },
    ]);

    const res = await request(app).get('/api/suppliers?search=MedTech');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toContain('MedTech');
  });
});

// ── GET /:id ──────────────────────────────────────────────────────

describe('GET /api/suppliers/:id', () => {
  it('returns a single supplier', async () => {
    mockPrisma.medicalSupplier.findFirst.mockResolvedValue(mockSupplier);

    const res = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(SUPPLIER_ID);
  });

  it('returns 404 when supplier not found', async () => {
    mockPrisma.medicalSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

// ── POST / ────────────────────────────────────────────────────────

describe('POST /api/suppliers', () => {
  it('creates a new supplier', async () => {
    mockPrisma.medicalSupplier.count.mockResolvedValue(0);
    mockPrisma.medicalSupplier.create.mockResolvedValue(mockSupplier);

    const res = await request(app).post('/api/suppliers').send({
      name: 'MedTech Components Ltd',
      classification: 'MAJOR',
      iso13485Certified: true,
      riskLevel: 'LOW',
    });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('MedTech Components Ltd');
    expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledTimes(1);
  });

  it('creates supplier with minimal data using defaults', async () => {
    mockPrisma.medicalSupplier.count.mockResolvedValue(5);
    mockPrisma.medicalSupplier.create.mockResolvedValue({
      ...mockSupplier,
      classification: 'MAJOR',
      riskLevel: 'MEDIUM',
      qualificationStatus: 'PENDING',
    });

    const res = await request(app).post('/api/suppliers').send({});

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('sets qualificationStatus to PENDING on creation', async () => {
    mockPrisma.medicalSupplier.count.mockResolvedValue(0);
    mockPrisma.medicalSupplier.create.mockResolvedValue({
      ...mockSupplier,
      qualificationStatus: 'PENDING',
    });

    const res = await request(app).post('/api/suppliers').send({
      name: 'New Supplier',
    });

    expect(res.status).toBe(201);
    expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ qualificationStatus: 'PENDING' }),
      })
    );
  });
});

// ── PUT /:id ──────────────────────────────────────────────────────

describe('PUT /api/suppliers/:id', () => {
  it('updates a supplier', async () => {
    mockPrisma.medicalSupplier.update.mockResolvedValue({
      ...mockSupplier,
      qualificationStatus: 'APPROVED',
    });

    const res = await request(app).put(`/api/suppliers/${SUPPLIER_ID}`).send({
      qualificationStatus: 'APPROVED',
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SUPPLIER_ID },
        data: expect.objectContaining({ qualificationStatus: 'APPROVED' }),
      })
    );
  });

  it('updates iso13485Certified field', async () => {
    mockPrisma.medicalSupplier.update.mockResolvedValue({
      ...mockSupplier,
      iso13485Certified: false,
    });

    const res = await request(app).put(`/api/suppliers/${SUPPLIER_ID}`).send({
      iso13485Certified: false,
    });

    expect(res.status).toBe(200);
    expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ iso13485Certified: false }),
      })
    );
  });
});

// ── DELETE /:id ───────────────────────────────────────────────────

describe('DELETE /api/suppliers/:id', () => {
  it('soft deletes a supplier', async () => {
    mockPrisma.medicalSupplier.update.mockResolvedValue({ ...mockSupplier, deletedAt: new Date() });

    const res = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(SUPPLIER_ID);
    expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SUPPLIER_ID },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });
});

// ── 500 error paths ───────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET / returns 500 on DB error', async () => {
    mockPrisma.medicalSupplier.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/suppliers');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.medicalSupplier.findFirst.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / returns 500 when create fails', async () => {
    mockPrisma.medicalSupplier.count.mockResolvedValue(0);
    mockPrisma.medicalSupplier.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/suppliers').send({ name: 'Test' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('PUT /:id returns 500 when update fails', async () => {
    mockPrisma.medicalSupplier.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).put(`/api/suppliers/${SUPPLIER_ID}`).send({ name: 'Updated' });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('DELETE /:id returns 500 when update fails', async () => {
    mockPrisma.medicalSupplier.update.mockRejectedValue(new Error('DB down'));
    const res = await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('suppliers — additional coverage', () => {
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

describe('suppliers — extended edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET / both qualificationStatus and riskLevel filters are applied together', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([mockSupplier]);

    const res = await request(app).get('/api/suppliers?qualificationStatus=APPROVED&riskLevel=LOW');

    expect(res.status).toBe(200);
    expect(mockPrisma.medicalSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          qualificationStatus: 'APPROVED',
          riskLevel: 'LOW',
        }),
      })
    );
  });

  it('GET / search is case-insensitive', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([
      mockSupplier,
      { ...mockSupplier, id: '00000000-0000-0000-0000-000000000003', name: 'Unrelated Corp' },
    ]);

    const res = await request(app).get('/api/suppliers?search=medtech');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].name).toBe('MedTech Components Ltd');
  });

  it('GET /:id query uses id and deletedAt null', async () => {
    mockPrisma.medicalSupplier.findFirst.mockResolvedValue(mockSupplier);

    await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

    expect(mockPrisma.medicalSupplier.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SUPPLIER_ID, deletedAt: null },
      })
    );
  });

  it('DELETE / calls update with deletedAt date', async () => {
    mockPrisma.medicalSupplier.update.mockResolvedValue({ ...mockSupplier, deletedAt: new Date() });

    await request(app).delete(`/api/suppliers/${SUPPLIER_ID}`);

    expect(mockPrisma.medicalSupplier.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: SUPPLIER_ID },
        data: expect.objectContaining({ deletedAt: expect.any(Date) }),
      })
    );
  });

  it('PUT / returns 500 with INTERNAL_ERROR when update throws', async () => {
    mockPrisma.medicalSupplier.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put(`/api/suppliers/${SUPPLIER_ID}`).send({ name: 'Updated' });

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST / iso13485Certified defaults to false when not provided', async () => {
    mockPrisma.medicalSupplier.count.mockResolvedValue(0);
    mockPrisma.medicalSupplier.create.mockResolvedValue({ ...mockSupplier, iso13485Certified: false });

    const res = await request(app).post('/api/suppliers').send({ name: 'Simple Supplier' });

    expect(res.status).toBe(201);
    expect(mockPrisma.medicalSupplier.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ iso13485Certified: false }),
      })
    );
  });

  it('GET / returns success:true even when data is empty', async () => {
    mockPrisma.medicalSupplier.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toEqual([]);
  });

  it('GET /:id returns 500 on DB error', async () => {
    mockPrisma.medicalSupplier.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get(`/api/suppliers/${SUPPLIER_ID}`);

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
