import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finSupplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finPurchaseOrder: {
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinSupplierWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/suppliers';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/suppliers', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/suppliers
// ===================================================================

describe('GET /api/suppliers', () => {
  it('should return a list of suppliers', async () => {
    const suppliers = [
      { id: 'supp-1', code: 'SUPP-ACME-1234', name: 'Acme Supplies Ltd', _count: { purchaseOrders: 5, bills: 3 } },
      { id: 'supp-2', code: 'SUPP-BETA-5678', name: 'Beta Wholesalers', _count: { purchaseOrders: 2, bills: 1 } },
    ];
    (prisma as any).finSupplier.findMany.mockResolvedValue(suppliers);
    (prisma as any).finSupplier.count.mockResolvedValue(2);

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.pagination.total).toBe(2);
  });

  it('should search suppliers by name, code, email, contactPerson', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/suppliers?search=acme');

    expect(res.status).toBe(200);
    expect((prisma as any).finSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'acme' }) }),
          ]),
        }),
      })
    );
  });

  it('should filter by isActive', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/suppliers?isActive=false');

    expect(res.status).toBe(200);
    expect((prisma as any).finSupplier.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ isActive: false }),
      })
    );
  });

  it('should filter by country', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/suppliers?country=DE');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(50);

    const res = await request(app).get('/api/suppliers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(5);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finSupplier.findMany.mockRejectedValue(new Error('DB connection failed'));

    const res = await request(app).get('/api/suppliers');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/suppliers/:id
// ===================================================================

describe('GET /api/suppliers/:id', () => {
  it('should return a supplier with purchase order summary', async () => {
    const supplier = {
      id: 'supp-1',
      code: 'SUPP-ACME-1234',
      name: 'Acme Supplies Ltd',
      deletedAt: null,
      purchaseOrders: [
        { id: 'po-1', reference: 'FIN-PO-001', orderDate: '2026-01-15', expectedDate: '2026-02-15', status: 'SENT', total: 5000 },
      ],
      _count: { purchaseOrders: 1, bills: 0 },
    };
    (prisma as any).finSupplier.findFirst.mockResolvedValue(supplier);

    const res = await request(app).get('/api/suppliers/supp-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('supp-1');
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/suppliers/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Supplier not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finSupplier.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/suppliers/supp-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/suppliers
// ===================================================================

describe('POST /api/suppliers', () => {
  const validSupplier = {
    name: 'Acme Supplies Ltd',
    email: 'accounts@acme.com',
    phone: '+44 20 1234 5678',
    country: 'GB',
    currency: 'GBP',
    paymentTerms: 30,
  };

  it('should create a supplier successfully', async () => {
    (prisma as any).finSupplier.create.mockResolvedValue({
      id: 'supp-new',
      code: 'SUPP-ACMES-1234',
      ...validSupplier,
    });

    const res = await request(app).post('/api/suppliers').send(validSupplier);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('supp-new');
  });

  it('should return 400 for validation error (missing name)', async () => {
    const res = await request(app).post('/api/suppliers').send({
      email: 'accounts@acme.com',
      country: 'GB',
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid email format', async () => {
    const res = await request(app).post('/api/suppliers').send({
      ...validSupplier,
      email: 'not-an-email',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid country code (not 2 chars)', async () => {
    const res = await request(app).post('/api/suppliers').send({
      ...validSupplier,
      country: 'GBR',
    });

    expect(res.status).toBe(400);
  });

  it('should return 409 on duplicate supplier code', async () => {
    const err = Object.assign(new Error('Unique violation'), { code: 'P2002' });
    (prisma as any).finSupplier.create.mockRejectedValue(err);

    const res = await request(app).post('/api/suppliers').send(validSupplier);

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Supplier code must be unique');
  });

  it('should return 500 on unexpected error', async () => {
    (prisma as any).finSupplier.create.mockRejectedValue(new Error('Unexpected DB error'));

    const res = await request(app).post('/api/suppliers').send(validSupplier);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/suppliers/:id
// ===================================================================

describe('PUT /api/suppliers/:id', () => {
  it('should update a supplier successfully', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finSupplier.update.mockResolvedValue({
      id: 'supp-1',
      name: 'Updated Acme Supplies',
    });

    const res = await request(app).put('/api/suppliers/supp-1').send({ name: 'Updated Acme Supplies' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should update isActive flag', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finSupplier.update.mockResolvedValue({ id: 'supp-1', isActive: false });

    const res = await request(app).put('/api/suppliers/supp-1').send({ isActive: false });

    expect(res.status).toBe(200);
  });

  it('should update payment terms', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finSupplier.update.mockResolvedValue({ id: 'supp-1', paymentTerms: 60 });

    const res = await request(app).put('/api/suppliers/supp-1').send({ paymentTerms: 60 });

    expect(res.status).toBe(200);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/suppliers/nonexistent').send({ name: 'Updated' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for validation error (invalid email)', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });

    const res = await request(app).put('/api/suppliers/supp-1').send({ email: 'not-valid' });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finSupplier.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/suppliers/supp-1').send({ name: 'Test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/suppliers/:id
// ===================================================================

describe('DELETE /api/suppliers/:id', () => {
  it('should soft delete a supplier with no purchase orders', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);
    (prisma as any).finSupplier.update.mockResolvedValue({ id: 'supp-1' });

    const res = await request(app).delete('/api/suppliers/supp-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/suppliers/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 when supplier has existing purchase orders', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(4);

    const res = await request(app).delete('/api/suppliers/supp-1');

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('purchase order(s) exist');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'supp-1', deletedAt: null });
    (prisma as any).finPurchaseOrder.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/suppliers/supp-1');

    expect(res.status).toBe(500);
  });
});
