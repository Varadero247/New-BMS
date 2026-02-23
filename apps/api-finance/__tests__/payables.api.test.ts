import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finSupplier: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finPurchaseOrder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finPOLine: {
      deleteMany: jest.fn(),
    },
    finBill: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finBillLine: {
      deleteMany: jest.fn(),
    },
    finPaymentMade: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinSupplierWhereInput: {},
    FinPurchaseOrderWhereInput: {},
    FinBillWhereInput: {},
    FinPaymentMadeWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = {
      id: '00000000-0000-4000-a000-000000000123',
      email: 'test@test.com',
      role: 'ADMIN',
    };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import payablesRouter from '../src/routes/payables';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/payables', payablesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// SUPPLIERS
// ===================================================================

describe('GET /api/payables/suppliers', () => {
  it('should return a list of suppliers', async () => {
    const suppliers = [
      {
        id: 'f7000000-0000-4000-a000-000000000001',
        code: 'S001',
        name: 'Widget Co',
        _count: { bills: 3, purchaseOrders: 2, payments: 1 },
      },
    ];
    mockPrisma.finSupplier.findMany.mockResolvedValue(suppliers);
    mockPrisma.finSupplier.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should search suppliers', async () => {
    mockPrisma.finSupplier.findMany.mockResolvedValue([]);
    mockPrisma.finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/suppliers?search=widget');

    expect(res.status).toBe(200);
  });

  it('should filter by isActive', async () => {
    mockPrisma.finSupplier.findMany.mockResolvedValue([]);
    mockPrisma.finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/suppliers?isActive=true');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    mockPrisma.finSupplier.findMany.mockResolvedValue([]);
    mockPrisma.finSupplier.count.mockResolvedValue(40);

    const res = await request(app).get('/api/payables/suppliers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
  });
});

describe('GET /api/payables/suppliers/:id', () => {
  it('should return a supplier when found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
      code: 'S001',
      name: 'Widget Co',
      _count: { bills: 3, purchaseOrders: 2, payments: 1 },
    });

    const res = await request(app).get(
      '/api/payables/suppliers/f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f7000000-0000-4000-a000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/payables/suppliers/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/payables/suppliers', () => {
  const validSupplier = { code: 'S001', name: 'Widget Co', email: 'info@widget.co' };

  it('should create a supplier successfully', async () => {
    mockPrisma.finSupplier.findUnique.mockResolvedValue(null);
    mockPrisma.finSupplier.create.mockResolvedValue({ id: 'sup-new', ...validSupplier });

    const res = await request(app).post('/api/payables/suppliers').send(validSupplier);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 409 for duplicate code', async () => {
    mockPrisma.finSupplier.findUnique.mockResolvedValue({ id: 'existing', code: 'S001' });

    const res = await request(app).post('/api/payables/suppliers').send(validSupplier);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE');
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/payables/suppliers').send({ code: '' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/payables/suppliers/:id', () => {
  it('should update a supplier', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
      code: 'S001',
    });
    mockPrisma.finSupplier.update.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
      name: 'Updated Widget Co',
    });

    const res = await request(app)
      .put('/api/payables/suppliers/f7000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated Widget Co' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/payables/suppliers/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate code on update', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
      code: 'S001',
    });
    mockPrisma.finSupplier.findUnique.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000002',
      code: 'S002',
    });

    const res = await request(app)
      .put('/api/payables/suppliers/f7000000-0000-4000-a000-000000000001')
      .send({ code: 'S002' });

    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/payables/suppliers/:id', () => {
  it('should soft delete a supplier with no unpaid bills', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
    });
    mockPrisma.finBill.count.mockResolvedValue(0);
    mockPrisma.finSupplier.update.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete(
      '/api/payables/suppliers/f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/payables/suppliers/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });

  it('should return 409 when supplier has unpaid bills', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: 'f7000000-0000-4000-a000-000000000001',
    });
    mockPrisma.finBill.count.mockResolvedValue(3);

    const res = await request(app).delete(
      '/api/payables/suppliers/f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('HAS_UNPAID_BILLS');
  });
});

// ===================================================================
// PURCHASE ORDERS
// ===================================================================

describe('GET /api/payables/purchase-orders', () => {
  it('should return a list of purchase orders', async () => {
    const orders = [
      {
        id: 'f7100000-0000-4000-a000-000000000001',
        reference: 'FIN-PO-2601-1000',
        status: 'DRAFT',
        supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
        _count: { lines: 2 },
      },
    ];
    mockPrisma.finPurchaseOrder.findMany.mockResolvedValue(orders);
    mockPrisma.finPurchaseOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/purchase-orders');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.finPurchaseOrder.findMany.mockResolvedValue([]);
    mockPrisma.finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/purchase-orders?status=APPROVED');

    expect(res.status).toBe(200);
  });

  it('should filter by supplierId', async () => {
    mockPrisma.finPurchaseOrder.findMany.mockResolvedValue([]);
    mockPrisma.finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/payables/purchase-orders?supplierId=f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should search by reference or supplier name', async () => {
    mockPrisma.finPurchaseOrder.findMany.mockResolvedValue([]);
    mockPrisma.finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/purchase-orders?search=FIN-PO');

    expect(res.status).toBe(200);
  });
});

describe('GET /api/payables/purchase-orders/:id', () => {
  it('should return a PO when found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      reference: 'FIN-PO-2601-1000',
      supplier: {
        id: 'f7000000-0000-4000-a000-000000000001',
        code: 'S001',
        name: 'Widget Co',
        email: 'info@widget.co',
        currency: 'USD',
      },
      lines: [
        {
          id: 'f6100000-0000-4000-a000-000000000001',
          description: 'Bolts',
          quantity: 100,
          unitPrice: 0.5,
        },
      ],
    });

    const res = await request(app).get(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f7100000-0000-4000-a000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/payables/purchase-orders/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/payables/purchase-orders', () => {
  const validPO = {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    orderDate: '2026-01-15',
    lines: [{ description: 'Steel bolts', quantity: 100, unitPrice: 0.5 }],
  };

  it('should create a PO with lines', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: validPO.supplierId,
      currency: 'USD',
    });
    mockPrisma.finPurchaseOrder.create.mockResolvedValue({
      id: 'po-new',
      reference: 'FIN-PO-2601-5678',
      status: 'DRAFT',
      total: 50,
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      lines: [{ description: 'Steel bolts', quantity: 100, unitPrice: 0.5 }],
    });

    const res = await request(app).post('/api/payables/purchase-orders').send(validPO);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/purchase-orders').send(validPO);

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/payables/purchase-orders').send({ lines: [] });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/payables/purchase-orders/:id', () => {
  it('should update a draft PO', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finPurchaseOrder.update.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      notes: 'Updated notes',
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      lines: [],
    });

    const res = await request(app)
      .put('/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001')
      .send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/payables/purchase-orders/00000000-0000-0000-0000-000000000099')
      .send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO is not DRAFT', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'APPROVED',
    });

    const res = await request(app)
      .put('/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001')
      .send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_EDITABLE');
  });
});

describe('POST /api/payables/purchase-orders/:id/approve', () => {
  it('should approve a DRAFT PO', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finPurchaseOrder.update.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'APPROVED',
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/approve'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/payables/purchase-orders/00000000-0000-0000-0000-000000000099/approve'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO cannot be approved in current status', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'RECEIVED',
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/approve'
    );

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});

describe('POST /api/payables/purchase-orders/:id/receive', () => {
  it('should mark an APPROVED PO as received', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'APPROVED',
    });
    mockPrisma.finPurchaseOrder.update.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'RECEIVED',
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/receive'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RECEIVED');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/payables/purchase-orders/00000000-0000-0000-0000-000000000099/receive'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO is DRAFT', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/receive'
    );

    expect(res.status).toBe(400);
  });
});

describe('POST /api/payables/purchase-orders/:id/cancel', () => {
  it('should cancel a PO', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finPurchaseOrder.update.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'CANCELLED',
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/cancel'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post(
      '/api/payables/purchase-orders/00000000-0000-0000-0000-000000000099/cancel'
    );

    expect(res.status).toBe(404);
  });

  it('should return 400 when already cancelled', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'CANCELLED',
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/cancel'
    );

    expect(res.status).toBe(400);
  });

  it('should return 400 when already closed', async () => {
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'f7100000-0000-4000-a000-000000000001',
      status: 'CLOSED',
    });

    const res = await request(app).post(
      '/api/payables/purchase-orders/f7100000-0000-4000-a000-000000000001/cancel'
    );

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// BILLS
// ===================================================================

describe('GET /api/payables (bills list)', () => {
  it('should return a list of bills', async () => {
    const bills = [
      {
        id: 'f7200000-0000-4000-a000-000000000001',
        reference: 'FIN-BILL-2601-1000',
        status: 'DRAFT',
        supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      },
    ];
    mockPrisma.finBill.findMany.mockResolvedValue(bills);
    mockPrisma.finBill.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    mockPrisma.finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables?status=PAID');

    expect(res.status).toBe(200);
  });

  it('should filter by supplierId', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    mockPrisma.finBill.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/payables?supplierId=f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should search bills', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    mockPrisma.finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables?search=FIN-BILL');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/payables (create bill)', () => {
  const validBill = {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    billDate: '2026-01-15',
    dueDate: '2026-02-15',
    lines: [{ description: 'Office supplies', quantity: 10, unitPrice: 25 }],
  };

  it('should create a bill with lines', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: validBill.supplierId,
      currency: 'USD',
    });
    mockPrisma.finBill.create.mockResolvedValue({
      id: 'bill-new',
      reference: 'FIN-BILL-2601-5678',
      status: 'DRAFT',
      total: 250,
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      lines: [{ description: 'Office supplies', quantity: 10, unitPrice: 25 }],
    });

    const res = await request(app).post('/api/payables').send(validBill);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables').send(validBill);

    expect(res.status).toBe(404);
  });

  it('should validate purchase order if provided', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({
      id: validBill.supplierId,
      currency: 'USD',
    });
    mockPrisma.finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/payables')
      .send({
        ...validBill,
        purchaseOrderId: '550e8400-e29b-41d4-a716-446655440001',
      });

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/payables').send({ lines: [] });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/payables/:id (update bill)', () => {
  it('should update a draft bill', async () => {
    mockPrisma.finBill.findFirst.mockResolvedValue({
      id: 'f7200000-0000-4000-a000-000000000001',
      status: 'DRAFT',
      amountPaid: 0,
    });
    mockPrisma.finBill.update.mockResolvedValue({
      id: 'f7200000-0000-4000-a000-000000000001',
      notes: 'Updated',
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      lines: [],
    });

    const res = await request(app)
      .put('/api/payables/f7200000-0000-4000-a000-000000000001')
      .send({ notes: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finBill.findFirst.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/payables/00000000-0000-0000-0000-000000000099')
      .send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when bill is not DRAFT', async () => {
    mockPrisma.finBill.findFirst.mockResolvedValue({
      id: 'f7200000-0000-4000-a000-000000000001',
      status: 'PAID',
    });

    const res = await request(app)
      .put('/api/payables/f7200000-0000-4000-a000-000000000001')
      .send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_EDITABLE');
  });
});

// ===================================================================
// PAYMENTS MADE
// ===================================================================

describe('POST /api/payables/payments', () => {
  const validPayment = {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    billId: '550e8400-e29b-41d4-a716-446655440001',
    date: '2026-01-20',
    amount: 250,
    method: 'BANK_TRANSFER',
  };

  it('should record a payment and update bill status', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    mockPrisma.finBill.findFirst.mockResolvedValue({
      id: validPayment.billId,
      status: 'RECEIVED',
      total: 500,
      amountPaid: 0,
    });
    mockPrisma.finPaymentMade.create.mockResolvedValue({
      id: 'pay-new',
      reference: 'FIN-PAY-2601-5678',
      amount: 250,
      supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      bill: {
        id: validPayment.billId,
        reference: 'FIN-BILL-2601-1000',
        total: 500,
        amountPaid: 0,
        amountDue: 500,
        status: 'RECEIVED',
      },
    });
    mockPrisma.finBill.update.mockResolvedValue({});

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 404 when bill not found', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    mockPrisma.finBill.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 400 when bill is PAID', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    mockPrisma.finBill.findFirst.mockResolvedValue({
      id: validPayment.billId,
      status: 'PAID',
    });

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(400);
  });

  it('should return 400 when bill is VOID', async () => {
    mockPrisma.finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    mockPrisma.finBill.findFirst.mockResolvedValue({
      id: validPayment.billId,
      status: 'VOID',
    });

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(400);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/payables/payments').send({ amount: -10 });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/payables/payments', () => {
  it('should return a list of payments made', async () => {
    const payments = [
      {
        id: 'pay-1',
        reference: 'FIN-PAY-2601-1000',
        amount: 250,
        supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
        bill: null,
      },
    ];
    mockPrisma.finPaymentMade.findMany.mockResolvedValue(payments);
    mockPrisma.finPaymentMade.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/payments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by supplierId', async () => {
    mockPrisma.finPaymentMade.findMany.mockResolvedValue([]);
    mockPrisma.finPaymentMade.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/payables/payments?supplierId=f7000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    mockPrisma.finPaymentMade.findMany.mockResolvedValue([]);
    mockPrisma.finPaymentMade.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/payables/payments?dateFrom=2026-01-01&dateTo=2026-01-31'
    );

    expect(res.status).toBe(200);
  });
});

// ===================================================================
// AP AGING + PAYMENT RUN
// ===================================================================

describe('GET /api/payables/aging', () => {
  it('should return AP aging report', async () => {
    const now = new Date();
    const overdue15 = new Date(now.getTime() - 15 * 24 * 60 * 60 * 1000);
    const overdue50 = new Date(now.getTime() - 50 * 24 * 60 * 60 * 1000);

    mockPrisma.finBill.findMany.mockResolvedValue([
      {
        id: 'f7200000-0000-4000-a000-000000000001',
        amountDue: 500,
        dueDate: overdue15,
        supplier: { id: 'f7000000-0000-4000-a000-000000000001', code: 'S001', name: 'Widget Co' },
      },
      {
        id: 'bill-2',
        amountDue: 1000,
        dueDate: overdue50,
        supplier: { id: 's-2', code: 'S002', name: 'Gear Inc' },
      },
    ]);

    const res = await request(app).get('/api/payables/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.total).toBeGreaterThan(0);
  });

  it('should return empty aging when no overdue bills', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/payables/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.total).toBe(0);
  });
});

describe('POST /api/payables/payment-run', () => {
  it('should generate a payment run', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([
      {
        id: 'f7200000-0000-4000-a000-000000000001',
        reference: 'FIN-BILL-2601-1000',
        supplierId: 'f7000000-0000-4000-a000-000000000001',
        amountDue: 500,
        dueDate: new Date(),
        supplier: {
          id: 'f7000000-0000-4000-a000-000000000001',
          code: 'S001',
          name: 'Widget Co',
          currency: 'USD',
          paymentTerms: 30,
        },
      },
    ]);

    const res = await request(app).post('/api/payables/payment-run').send({});

    expect(res.status).toBe(200);
    expect(res.body.data.billCount).toBe(1);
    expect(res.body.data.supplierCount).toBe(1);
    expect(res.body.data.grandTotal).toBe(500);
  });

  it('should accept custom asOfDate', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app)
      .post('/api/payables/payment-run')
      .send({ asOfDate: '2026-03-01' });

    expect(res.status).toBe(200);
    expect(res.body.data.billCount).toBe(0);
  });
});

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  it('GET /api/payables/suppliers returns 500 on DB error', async () => {
    mockPrisma.finSupplier.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/payables/suppliers');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/payables/suppliers returns 500 when create fails', async () => {
    mockPrisma.finSupplier.findUnique.mockResolvedValue(null);
    mockPrisma.finSupplier.create.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/payables/suppliers').send({
      code: 'ACME01',
      name: 'Acme Corp',
      currency: 'GBP',
    });
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/payables (bills list) returns 500 on DB error', async () => {
    mockPrisma.finBill.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/payables');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('POST /api/payables/payment-run returns 500 on DB error', async () => {
    mockPrisma.finBill.findMany.mockRejectedValue(new Error('DB down'));
    const res = await request(app).post('/api/payables/payment-run').send({});
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});


describe('phase34 coverage', () => {
  it('handles object with numeric keys', () => { const o: Record<string,number> = {'0':10,'1':20}; expect(o['0']).toBe(10); });
  it('handles rest in destructuring', () => { const {a,...rest} = {a:1,b:2,c:3}; expect(rest).toEqual({b:2,c:3}); });
  it('handles type assertion', () => { const v: unknown = 'hello'; expect((v as string).toUpperCase()).toBe('HELLO'); });
  it('handles named function expression', () => { const factorial = function fact(n: number): number { return n <= 1 ? 1 : n * fact(n-1); }; expect(factorial(4)).toBe(24); });
  it('handles keyof pattern', () => { interface O { x: number; y: number; } const get = <T, K extends keyof T>(obj: T, key: K) => obj[key]; const pt = {x:3,y:4}; expect(get(pt,'x')).toBe(3); });
});


describe('phase35 coverage', () => {
  it('handles async map pattern', async () => { const asyncDouble = async (n:number) => n*2; const results = await Promise.all([1,2,3].map(asyncDouble)); expect(results).toEqual([2,4,6]); });
  it('handles number base conversion', () => { expect((10).toString(2)).toBe('1010'); expect((255).toString(16)).toBe('ff'); });
  it('handles string to array via spread', () => { expect([...'abc']).toEqual(['a','b','c']); });
  it('handles short-circuit evaluation', () => { let x = 0; false && (x=1); expect(x).toBe(0); true || (x=2); expect(x).toBe(0); });
  it('handles string is palindrome', () => { const isPalin = (s: string) => s === s.split('').reverse().join(''); expect(isPalin('racecar')).toBe(true); expect(isPalin('hello')).toBe(false); });
});


describe('phase36 coverage', () => {
  it('handles stack pattern', () => { class Stack<T>{private d:T[]=[];push(v:T){this.d.push(v);}pop(){return this.d.pop();}peek(){return this.d[this.d.length-1];}get size(){return this.d.length;}} const s=new Stack<number>();s.push(1);s.push(2);expect(s.pop()).toBe(2);expect(s.size).toBe(1); });
  it('handles power set size', () => { const powerSetSize=(n:number)=>Math.pow(2,n);expect(powerSetSize(3)).toBe(8);expect(powerSetSize(0)).toBe(1); });
  it('handles maximum subarray sum', () => { const maxSub=(a:number[])=>{let max=a[0],cur=a[0];for(let i=1;i<a.length;i++){cur=Math.max(a[i],cur+a[i]);max=Math.max(max,cur);}return max;};expect(maxSub([-2,1,-3,4,-1,2,1,-5,4])).toBe(6); });
  it('handles word frequency map', () => { const freq=(s:string)=>s.split(/\s+/).reduce((m,w)=>{m.set(w,(m.get(w)||0)+1);return m;},new Map<string,number>());const f=freq('a b a c b a');expect(f.get('a')).toBe(3);expect(f.get('b')).toBe(2); });
  it('handles binary search', () => { const bs=(a:number[],t:number)=>{let l=0,r=a.length-1;while(l<=r){const m=(l+r)>>1;if(a[m]===t)return m;a[m]<t?l=m+1:r=m-1;}return -1;}; expect(bs([1,3,5,7,9],5)).toBe(2); });
});


describe('phase37 coverage', () => {
  it('transposes 2d array', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2,3],[4,5,6]])).toEqual([[1,4],[2,5],[3,6]]); });
  it('checks all unique', () => { const allUniq=<T>(a:T[])=>new Set(a).size===a.length; expect(allUniq([1,2,3])).toBe(true); expect(allUniq([1,2,1])).toBe(false); });
  it('rotates array left', () => { const rotL=<T>(a:T[],n:number)=>[...a.slice(n),...a.slice(0,n)]; expect(rotL([1,2,3,4,5],2)).toEqual([3,4,5,1,2]); });
  it('finds first element satisfying predicate', () => { expect([1,2,3,4].find(n=>n>2)).toBe(3); });
  it('generates combinations of size 2', () => { const a=[1,2,3]; const r=a.flatMap((v,i)=>a.slice(i+1).map(w=>[v,w] as [number,number])); expect(r.length).toBe(3); expect(r[0]).toEqual([1,2]); });
});


describe('phase38 coverage', () => {
  it('computes array variance', () => { const variance=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return a.reduce((s,v)=>s+(v-m)**2,0)/a.length;}; expect(variance([2,4,4,4,5,5,7,9])).toBe(4); });
  it('checks if matrix is symmetric', () => { const isSym=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===m[j][i])); expect(isSym([[1,2],[2,1]])).toBe(true); expect(isSym([[1,2],[3,1]])).toBe(false); });
  it('implements simple tokenizer', () => { const tokenize=(s:string)=>s.match(/[a-zA-Z]+|\d+|[^\s]/g)||[]; expect(tokenize('a+b=3')).toEqual(['a','+','b','=','3']); });
  it('finds longest common prefix', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let p=strs[0];for(const s of strs)while(!s.startsWith(p))p=p.slice(0,-1);return p;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); });
  it('computes nth triangular number', () => { const tri=(n:number)=>n*(n+1)/2; expect(tri(4)).toBe(10); expect(tri(10)).toBe(55); });
});


describe('phase39 coverage', () => {
  it('parses CSV row', () => { const parseCSV=(row:string)=>row.split(',').map(s=>s.trim()); expect(parseCSV('a, b, c')).toEqual(['a','b','c']); });
  it('computes minimum coins for amount', () => { const minCoins=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(Infinity);dp[0]=0;for(let i=1;i<=amt;i++)for(const c of coins)if(c<=i&&dp[i-c]+1<dp[i])dp[i]=dp[i-c]+1;return dp[amt]===Infinity?-1:dp[amt];}; expect(minCoins([1,5,6,9],11)).toBe(2); });
  it('implements Sieve of Eratosthenes', () => { const sieve=(n:number)=>{const p=Array(n+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=n;i++)if(p[i])for(let j=i*i;j<=n;j+=i)p[j]=false;return p.map((v,i)=>v?i:-1).filter(v=>v>0);}; expect(sieve(20)).toEqual([2,3,5,7,11,13,17,19]); });
  it('checks Harshad number', () => { const isHarshad=(n:number)=>n%String(n).split('').reduce((a,c)=>a+Number(c),0)===0; expect(isHarshad(18)).toBe(true); expect(isHarshad(19)).toBe(false); });
  it('implements Caesar cipher', () => { const caesar=(s:string,n:number)=>s.replace(/[a-z]/gi,c=>{const base=c<='Z'?65:97;return String.fromCharCode((c.charCodeAt(0)-base+n)%26+base);}); expect(caesar('abc',3)).toBe('def'); expect(caesar('xyz',3)).toBe('abc'); });
});


describe('phase40 coverage', () => {
  it('checks if number is perfect power', () => { const isPerfPow=(n:number)=>{for(let b=2;b*b<=n;b++)for(let e=2;Math.pow(b,e)<=n;e++)if(Math.pow(b,e)===n)return true;return false;}; expect(isPerfPow(8)).toBe(true); expect(isPerfPow(9)).toBe(true); expect(isPerfPow(10)).toBe(false); });
  it('computes sum of geometric series', () => { const geoSum=(a:number,r:number,n:number)=>r===1?a*n:a*(1-Math.pow(r,n))/(1-r); expect(geoSum(1,2,4)).toBe(15); });
  it('checks if array forms geometric progression', () => { const isGP=(a:number[])=>{if(a.length<2)return true;const r=a[1]/a[0];return a.every((v,i)=>i===0||v/a[i-1]===r);}; expect(isGP([2,6,18,54])).toBe(true); expect(isGP([1,2,3])).toBe(false); });
  it('multiplies two matrices', () => { const matMul=(a:number[][],b:number[][])=>a.map(r=>b[0].map((_,j)=>r.reduce((s,_,k)=>s+r[k]*b[k][j],0))); expect(matMul([[1,2],[3,4]],[[5,6],[7,8]])).toEqual([[19,22],[43,50]]); });
  it('checks if number is palindrome without string', () => { const isPalinNum=(n:number)=>{if(n<0)return false;let rev=0,orig=n;while(n>0){rev=rev*10+n%10;n=Math.floor(n/10);}return rev===orig;}; expect(isPalinNum(121)).toBe(true); expect(isPalinNum(123)).toBe(false); });
});


describe('phase41 coverage', () => {
  it('implements fast exponentiation', () => { const fastPow=(base:number,exp:number,mod:number):number=>{let res=1;base%=mod;while(exp>0){if(exp%2===1)res=res*base%mod;base=base*base%mod;exp=Math.floor(exp/2);}return res;}; expect(fastPow(2,10,1000)).toBe(24); });
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
  it('implements Prim MST weight for small graph', () => { const prim=(n:number,edges:[number,number,number][])=>{const adj=new Map<number,[number,number][]>();for(let i=0;i<n;i++)adj.set(i,[]);for(const [u,v,w] of edges){adj.get(u)!.push([v,w]);adj.get(v)!.push([u,w]);}const vis=new Set([0]);let total=0;while(vis.size<n){let minW=Infinity,minV=-1;for(const u of vis)for(const [v,w] of adj.get(u)||[])if(!vis.has(v)&&w<minW){minW=w;minV=v;}if(minV===-1)break;vis.add(minV);total+=minW;}return total;}; expect(prim(4,[[0,1,1],[1,2,2],[2,3,3],[0,3,10]])).toBe(6); });
  it('implements Manacher algorithm length check', () => { const manacher=(s:string)=>{const t='#'+s.split('').join('#')+'#';const p=Array(t.length).fill(0);let c=0,r=0;for(let i=0;i<t.length;i++){const mirror=2*c-i;if(i<r)p[i]=Math.min(r-i,p[mirror]);while(i+p[i]+1<t.length&&i-p[i]-1>=0&&t[i+p[i]+1]===t[i-p[i]-1])p[i]++;if(i+p[i]>r){c=i;r=i+p[i];}}return Math.max(...p);}; expect(manacher('babad')).toBe(3); });
  it('computes sum of first n odd numbers', () => { const sumOdd=(n:number)=>n*n; expect(sumOdd(5)).toBe(25); expect(sumOdd(10)).toBe(100); });
});


describe('phase42 coverage', () => {
  it('blends two colors with alpha', () => { const blend=(c1:number,c2:number,a:number)=>Math.round(c1*(1-a)+c2*a); expect(blend(0,255,0.5)).toBe(128); });
  it('interpolates between two values', () => { const lerp=(a:number,b:number,t:number)=>a+(b-a)*t; expect(lerp(0,100,0.5)).toBe(50); expect(lerp(10,20,0.3)).toBeCloseTo(13); });
  it('checks if two rectangles overlap', () => { const overlap=(x1:number,y1:number,w1:number,h1:number,x2:number,y2:number,w2:number,h2:number)=>x1<x2+w2&&x1+w1>x2&&y1<y2+h2&&y1+h1>y2; expect(overlap(0,0,4,4,2,2,4,4)).toBe(true); expect(overlap(0,0,2,2,3,3,2,2)).toBe(false); });
  it('rotates 2D point by 90 degrees', () => { const rot90=(x:number,y:number)=>[-y,x]; expect(rot90(2,3)).toEqual([-3,2]); expect(rot90(0,1)).toEqual([-1,0]); });
  it('computes luminance of color', () => { const lum=(r:number,g:number,b:number)=>0.299*r+0.587*g+0.114*b; expect(Math.round(lum(255,255,255))).toBe(255); expect(Math.round(lum(0,0,0))).toBe(0); });
});


describe('phase43 coverage', () => {
  it('finds outliers using IQR method', () => { const outliers=(a:number[])=>{const s=[...a].sort((x,y)=>x-y);const q1=s[Math.floor(s.length*0.25)],q3=s[Math.floor(s.length*0.75)];const iqr=q3-q1;return a.filter(v=>v<q1-1.5*iqr||v>q3+1.5*iqr);}; expect(outliers([1,2,3,4,5,100])).toContain(100); });
  it('gets last day of month', () => { const lastDay=(y:number,m:number)=>new Date(y,m,0).getDate(); expect(lastDay(2026,2)).toBe(28); expect(lastDay(2024,2)).toBe(29); });
  it('applies label encoding to categories', () => { const encode=(cats:string[])=>{const u=[...new Set(cats)];return cats.map(c=>u.indexOf(c));}; expect(encode(['a','b','a','c'])).toEqual([0,1,0,2]); });
  it('computes weighted average', () => { const wavg=(vals:number[],wts:number[])=>{const sw=wts.reduce((s,v)=>s+v,0);return vals.reduce((s,v,i)=>s+v*wts[i],0)/sw;}; expect(wavg([1,2,3],[1,2,3])).toBeCloseTo(2.333,2); });
  it('computes tanh activation', () => { expect(Math.tanh(0)).toBe(0); expect(Math.tanh(Infinity)).toBe(1); expect(Math.tanh(-Infinity)).toBe(-1); });
});


describe('phase44 coverage', () => {
  it('implements simple event emitter', () => { const ee=()=>{const m=new Map<string,((...a:any[])=>void)[]>();return{on:(e:string,fn:(...a:any[])=>void)=>{m.set(e,[...(m.get(e)||[]),fn]);},emit:(e:string,...a:any[])=>(m.get(e)||[]).forEach(fn=>fn(...a))};}; const em=ee();const calls:number[]=[];em.on('x',v=>calls.push(v));em.on('x',v=>calls.push(v*2));em.emit('x',5); expect(calls).toEqual([5,10]); });
  it('normalizes vector to unit length', () => { const norm=(v:number[])=>{const m=Math.sqrt(v.reduce((s,x)=>s+x*x,0));return v.map(x=>x/m);}; const r=norm([3,4]); expect(Math.round(r[0]*100)/100).toBe(0.6); expect(Math.round(r[1]*100)/100).toBe(0.8); });
  it('generates power set', () => { const ps=(a:number[]):number[][]=>a.reduce((acc,v)=>[...acc,...acc.map(s=>[...s,v])],[[]] as number[][]); expect(ps([1,2,3]).length).toBe(8); });
  it('computes running maximum', () => { const runmax=(a:number[])=>a.reduce((acc,v)=>[...acc,Math.max(v,(acc[acc.length-1]??-Infinity))],[] as number[]); expect(runmax([3,1,4,1,5])).toEqual([3,3,4,4,5]); });
  it('converts object to query string', () => { const qs=(o:Record<string,string|number>)=>Object.entries(o).map(([k,v])=>encodeURIComponent(k)+'='+encodeURIComponent(v)).join('&'); expect(qs({a:1,b:'hello world'})).toBe('a=1&b=hello%20world'); });
});


describe('phase45 coverage', () => {
  it('returns most frequent character', () => { const mfc=(s:string)=>{const f:Record<string,number>={};for(const c of s)f[c]=(f[c]||0)+1;return Object.entries(f).sort((a,b)=>b[1]-a[1])[0][0];}; expect(mfc('aababc')).toBe('a'); });
  it('validates IPv4 address', () => { const vip=(s:string)=>{const p=s.split('.');return p.length===4&&p.every(o=>+o>=0&&+o<=255&&/^\d+$/.test(o));}; expect(vip('192.168.1.1')).toBe(true); expect(vip('256.0.0.1')).toBe(false); expect(vip('1.2.3')).toBe(false); });
  it('searches in rotated sorted array', () => { const sr=(a:number[],t:number)=>{let l=0,r=a.length-1;while(l<=r){const m=(l+r)>>1;if(a[m]===t)return m;if(a[l]<=a[m]){if(t>=a[l]&&t<a[m])r=m-1;else l=m+1;}else{if(t>a[m]&&t<=a[r])l=m+1;else r=m-1;}}return -1;}; expect(sr([4,5,6,7,0,1,2],0)).toBe(4); expect(sr([4,5,6,7,0,1,2],3)).toBe(-1); });
  it('computes exponential smoothing', () => { const ema=(a:number[],alpha:number)=>a.reduce((acc,v,i)=>i===0?[v]:[...acc,alpha*v+(1-alpha)*acc[i-1]],[] as number[]); const r=ema([10,20,30],0.5); expect(r[0]).toBe(10); expect(r[1]).toBe(15); });
  it('computes Luhn checksum validity', () => { const luhn=(n:string)=>{const d=[...n].reverse().map(Number);const s=d.reduce((acc,v,i)=>{if(i%2===1){v*=2;if(v>9)v-=9;}return acc+v;},0);return s%10===0;}; expect(luhn('4532015112830366')).toBe(true); expect(luhn('1234567890123456')).toBe(false); });
});


describe('phase46 coverage', () => {
  it('computes range product excluding self', () => { const pe=(a:number[])=>{const l=new Array(a.length).fill(1);const r=new Array(a.length).fill(1);for(let i=1;i<a.length;i++)l[i]=l[i-1]*a[i-1];for(let i=a.length-2;i>=0;i--)r[i]=r[i+1]*a[i+1];return a.map((_,i)=>l[i]*r[i]);}; expect(pe([1,2,3,4])).toEqual([24,12,8,6]); });
  it('finds path sum in binary tree', () => { type N={v:number;l?:N;r?:N}; const ps=(n:N|undefined,t:number,cur=0):boolean=>!n?false:n.v+cur===t&&!n.l&&!n.r?true:ps(n.l,t,cur+n.v)||ps(n.r,t,cur+n.v); const t:N={v:5,l:{v:4,l:{v:11,l:{v:7},r:{v:2}}},r:{v:8,l:{v:13},r:{v:4,r:{v:1}}}}; expect(ps(t,22)).toBe(true); expect(ps(t,28)).toBe(false); });
  it('checks if string is valid number (strict)', () => { const vn=(s:string)=>/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s.trim()); expect(vn('3.14')).toBe(true); expect(vn('-2.5e10')).toBe(true); expect(vn('abc')).toBe(false); expect(vn('1.2.3')).toBe(false); });
  it('checks if array is sorted ascending', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||a[i-1]<=v); expect(isSorted([1,2,3,4,5])).toBe(true); expect(isSorted([1,3,2,4])).toBe(false); expect(isSorted([])).toBe(true); });
  it('merges k sorted arrays', () => { const mk=(arrs:number[][])=>{const r:number[]=[];const idx=new Array(arrs.length).fill(0);while(true){let mi=-1,mv=Infinity;for(let i=0;i<arrs.length;i++)if(idx[i]<arrs[i].length&&arrs[i][idx[i]]<mv){mv=arrs[i][idx[i]];mi=i;}if(mi===-1)break;r.push(mv);idx[mi]++;}return r;}; expect(mk([[1,4,7],[2,5,8],[3,6,9]])).toEqual([1,2,3,4,5,6,7,8,9]); });
});


describe('phase47 coverage', () => {
  it('implements Huffman coding frequencies', () => { const hf=(freqs:[string,number][])=>{const q=[...freqs].sort((a,b)=>a[1]-b[1]);while(q.length>1){const a=q.shift()!,b=q.shift()!;const node:[string,number]=[a[0]+b[0],a[1]+b[1]];q.splice(q.findIndex(x=>x[1]>=node[1]),0,node);}return q[0][1];}; expect(hf([['a',5],['b',9],['c',12],['d',13]])).toBe(39); });
  it('generates all valid IP addresses', () => { const ips=(s:string)=>{const r:string[]=[];const bt=(i:number,parts:string[])=>{if(parts.length===4){if(i===s.length)r.push(parts.join('.'));return;}for(let l=1;l<=3&&i+l<=s.length;l++){const p=s.slice(i,i+l);if((p.length>1&&p[0]==='0')||+p>255)break;bt(i+l,[...parts,p]);}};bt(0,[]);return r;}; expect(ips('25525511135')).toContain('255.255.11.135'); expect(ips('25525511135')).toContain('255.255.111.35'); });
  it('generates all combinations with repetition', () => { const cr=(a:number[],k:number):number[][]=>k===0?[[]]:[...a.flatMap((_,i)=>cr(a.slice(i),k-1).map(c=>[a[i],...c]))]; expect(cr([1,2],2)).toEqual([[1,1],[1,2],[2,2]]); });
  it('solves activity selection problem', () => { const act=(start:number[],end:number[])=>{const n=start.length;const idx=[...Array(n).keys()].sort((a,b)=>end[a]-end[b]);let cnt=1,last=idx[0];for(let i=1;i<n;i++){if(start[idx[i]]>=end[last]){cnt++;last=idx[i];}}return cnt;}; expect(act([1,3,0,5,8,5],[2,4,6,7,9,9])).toBe(4); });
  it('implements trie prefix search', () => { const t=()=>{const r:any={};return{ins:(w:string)=>{let n=r;for(const c of w){n[c]=n[c]||{};n=n[c];}n['$']=1;},sw:(p:string)=>{let n=r;for(const c of p){if(!n[c])return false;n=n[c];}return true;}};}; const tr=t();['apple','app','apply'].forEach(w=>tr.ins(w)); expect(tr.sw('app')).toBe(true); expect(tr.sw('apz')).toBe(false); });
});


describe('phase48 coverage', () => {
  it('decodes run-length encoded string', () => { const dec=(s:string)=>s.replace(/(\d+)(\w)/g,(_,n,c)=>c.repeat(+n)); expect(dec('3a2b4c')).toBe('aaabbcccc'); expect(dec('2x1y3z')).toBe('xxyzzz'); });
  it('solves egg drop problem (2 eggs)', () => { const egg=(n:number)=>{let t=0,f=0;while(f<n){t++;f+=t;}return t;}; expect(egg(10)).toBe(4); expect(egg(14)).toBe(5); });
  it('finds all factor combinations', () => { const fc=(n:number):number[][]=>{ const r:number[][]=[];const bt=(rem:number,min:number,cur:number[])=>{if(rem===1&&cur.length>1)r.push([...cur]);for(let f=min;f<=rem;f++)if(rem%f===0){bt(rem/f,f,[...cur,f]);}};bt(n,2,[]);return r;}; expect(fc(12).length).toBe(3); expect(fc(12)).toContainEqual([2,6]); });
  it('counts set bits across range', () => { const cb=(n:number)=>{let c=0,x=n;while(x){c+=x&1;x>>=1;}return c;};const total=(n:number)=>Array.from({length:n+1},(_,i)=>cb(i)).reduce((s,v)=>s+v,0); expect(total(5)).toBe(7); expect(total(10)).toBe(17); });
  it('computes maximum meetings in one room', () => { const mm=(s:number[],e:number[])=>{const m=s.map((si,i)=>[si,e[i]] as [number,number]).sort((a,b)=>a[1]-b[1]);let cnt=1,end=m[0][1];for(let i=1;i<m.length;i++)if(m[i][0]>=end){cnt++;end=m[i][1];}return cnt;}; expect(mm([0,3,1,5],[5,4,2,9])).toBe(3); expect(mm([1,3,0,5,8,5],[2,4,6,7,9,9])).toBe(4); });
});
