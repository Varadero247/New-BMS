import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finPurchaseOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finSupplier: {
      findFirst: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinPurchaseOrderWhereInput: {},
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

import router from '../src/routes/purchase-orders';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/purchase-orders', router);

const SUPPLIER_UUID = '550e8400-e29b-41d4-a716-446655440020';

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/purchase-orders
// ===================================================================

describe('GET /api/purchase-orders', () => {
  it('should return a list of purchase orders', async () => {
    const orders = [
      {
        id: 'po-1',
        reference: 'FIN-PO-2601-1234',
        status: 'DRAFT',
        supplier: { id: SUPPLIER_UUID, code: 'SUPP-ACME-1234', name: 'Acme Supplies' },
        _count: { lines: 3 },
      },
    ];
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue(orders);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/purchase-orders');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination.total).toBe(1);
  });

  it('should filter by supplierId', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get(`/api/purchase-orders?supplierId=${SUPPLIER_UUID}`);

    expect(res.status).toBe(200);
    expect((prisma as any).finPurchaseOrder.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ supplierId: SUPPLIER_UUID }),
      })
    );
  });

  it('should filter by status', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/purchase-orders?status=SENT');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/purchase-orders?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(75);

    const res = await request(app).get('/api/purchase-orders?page=2&limit=25');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
    expect(res.body.pagination.totalPages).toBe(3);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/purchase-orders');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});

// ===================================================================
// GET /api/purchase-orders/:id
// ===================================================================

describe('GET /api/purchase-orders/:id', () => {
  it('should return a purchase order with lines', async () => {
    const order = {
      id: 'po-1',
      reference: 'FIN-PO-2601-1234',
      status: 'DRAFT',
      supplier: { id: SUPPLIER_UUID, code: 'SUPP-ACME-1234', name: 'Acme Supplies' },
      lines: [
        { id: 'line-1', description: 'Office Chairs', quantity: 10, unitPrice: 200, amount: 2000, sortOrder: 0 },
      ],
    };
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(order);

    const res = await request(app).get('/api/purchase-orders/po-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('po-1');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('should return 404 when purchase order not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/purchase-orders/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBe('Purchase order not found');
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/purchase-orders/po-1');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// POST /api/purchase-orders
// ===================================================================

describe('POST /api/purchase-orders', () => {
  const validOrder = {
    supplierId: SUPPLIER_UUID,
    orderDate: '2026-01-15',
    currency: 'GBP',
    lines: [
      { description: 'Office Chairs', quantity: 10, unitPrice: 200 },
      { description: 'Office Desks', quantity: 5, unitPrice: 500 },
    ],
  };

  it('should create a purchase order successfully', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({
      id: SUPPLIER_UUID,
      code: 'SUPP-ACME-1234',
      name: 'Acme Supplies',
      isActive: true,
    });
    (prisma as any).finPurchaseOrder.create.mockResolvedValue({
      id: 'po-new',
      reference: 'FIN-PO-2601-5678',
      status: 'DRAFT',
      subtotal: 4500,
      total: 4500,
      supplier: { id: SUPPLIER_UUID, code: 'SUPP-ACME-1234', name: 'Acme Supplies' },
      lines: validOrder.lines.map((l, i) => ({ id: `line-${i}`, ...l, amount: l.quantity * l.unitPrice })),
    });

    const res = await request(app).post('/api/purchase-orders').send(validOrder);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe('po-new');
  });

  it('should return 400 when supplier not found or inactive', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/purchase-orders').send(validOrder);

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Supplier not found or inactive');
  });

  it('should return 400 for validation error (no lines)', async () => {
    const res = await request(app).post('/api/purchase-orders').send({
      supplierId: SUPPLIER_UUID,
      orderDate: '2026-01-15',
      lines: [],
    });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 for invalid supplierId (not UUID)', async () => {
    const res = await request(app).post('/api/purchase-orders').send({
      ...validOrder,
      supplierId: 'not-a-uuid',
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/purchase-orders').send({});

    expect(res.status).toBe(400);
  });

  it('should return 500 on unexpected database error', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: SUPPLIER_UUID, isActive: true });
    (prisma as any).finPurchaseOrder.create.mockRejectedValue(new Error('DB error'));

    const res = await request(app).post('/api/purchase-orders').send(validOrder);

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// PUT /api/purchase-orders/:id
// ===================================================================

describe('PUT /api/purchase-orders/:id', () => {
  it('should update a purchase order header', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT', deletedAt: null });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: 'SENT',
      notes: 'Please deliver by end of month',
      supplier: { id: SUPPLIER_UUID, code: 'SUPP-ACME-1234', name: 'Acme Supplies' },
      lines: [],
    });

    const res = await request(app).put('/api/purchase-orders/po-1').send({ status: 'SENT', notes: 'Please deliver by end of month' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when purchase order not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/purchase-orders/nonexistent').send({ notes: 'test' });

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 400 when trying to update a RECEIVED order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'RECEIVED', deletedAt: null });

    const res = await request(app).put('/api/purchase-orders/po-1').send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error).toContain('RECEIVED');
  });

  it('should return 400 when trying to update a CANCELLED order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'CANCELLED', deletedAt: null });

    const res = await request(app).put('/api/purchase-orders/po-1').send({ notes: 'test' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for validation error (invalid status)', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT', deletedAt: null });

    const res = await request(app).put('/api/purchase-orders/po-1').send({ status: 'INVALID_STATUS' });

    expect(res.status).toBe(400);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT', deletedAt: null });
    (prisma as any).finPurchaseOrder.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).put('/api/purchase-orders/po-1').send({ notes: 'test' });

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// DELETE /api/purchase-orders/:id
// ===================================================================

describe('DELETE /api/purchase-orders/:id', () => {
  it('should soft delete a DRAFT purchase order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT', deletedAt: null });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({ id: 'po-1' });

    const res = await request(app).delete('/api/purchase-orders/po-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should soft delete a CANCELLED purchase order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'CANCELLED', deletedAt: null });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({ id: 'po-1' });

    const res = await request(app).delete('/api/purchase-orders/po-1');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when purchase order not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/purchase-orders/nonexistent');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });

  it('should return 409 when trying to delete a SENT order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'SENT', deletedAt: null });

    const res = await request(app).delete('/api/purchase-orders/po-1');

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('SENT');
  });

  it('should return 409 when trying to delete a RECEIVED order', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'RECEIVED', deletedAt: null });

    const res = await request(app).delete('/api/purchase-orders/po-1');

    expect(res.status).toBe(409);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT', deletedAt: null });
    (prisma as any).finPurchaseOrder.update.mockRejectedValue(new Error('DB error'));

    const res = await request(app).delete('/api/purchase-orders/po-1');

    expect(res.status).toBe(500);
  });
});
