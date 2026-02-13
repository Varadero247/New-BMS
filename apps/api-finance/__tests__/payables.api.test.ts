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
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import payablesRouter from '../src/routes/payables';
import { prisma } from '../src/prisma';

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
      { id: 'sup-1', code: 'S001', name: 'Widget Co', _count: { bills: 3, purchaseOrders: 2, payments: 1 } },
    ];
    (prisma as any).finSupplier.findMany.mockResolvedValue(suppliers);
    (prisma as any).finSupplier.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/suppliers');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should search suppliers', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/suppliers?search=widget');

    expect(res.status).toBe(200);
  });

  it('should filter by isActive', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/suppliers?isActive=true');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    (prisma as any).finSupplier.findMany.mockResolvedValue([]);
    (prisma as any).finSupplier.count.mockResolvedValue(40);

    const res = await request(app).get('/api/payables/suppliers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(2);
  });
});

describe('GET /api/payables/suppliers/:id', () => {
  it('should return a supplier when found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({
      id: 'sup-1',
      code: 'S001',
      name: 'Widget Co',
      _count: { bills: 3, purchaseOrders: 2, payments: 1 },
    });

    const res = await request(app).get('/api/payables/suppliers/sup-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('sup-1');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/payables/suppliers/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/payables/suppliers', () => {
  const validSupplier = { code: 'S001', name: 'Widget Co', email: 'info@widget.co' };

  it('should create a supplier successfully', async () => {
    (prisma as any).finSupplier.findUnique.mockResolvedValue(null);
    (prisma as any).finSupplier.create.mockResolvedValue({ id: 'sup-new', ...validSupplier });

    const res = await request(app).post('/api/payables/suppliers').send(validSupplier);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 409 for duplicate code', async () => {
    (prisma as any).finSupplier.findUnique.mockResolvedValue({ id: 'existing', code: 'S001' });

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
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'sup-1', code: 'S001' });
    (prisma as any).finSupplier.update.mockResolvedValue({ id: 'sup-1', name: 'Updated Widget Co' });

    const res = await request(app).put('/api/payables/suppliers/sup-1').send({ name: 'Updated Widget Co' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/payables/suppliers/nonexistent').send({ name: 'Test' });

    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate code on update', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'sup-1', code: 'S001' });
    (prisma as any).finSupplier.findUnique.mockResolvedValue({ id: 'sup-2', code: 'S002' });

    const res = await request(app).put('/api/payables/suppliers/sup-1').send({ code: 'S002' });

    expect(res.status).toBe(409);
  });
});

describe('DELETE /api/payables/suppliers/:id', () => {
  it('should soft delete a supplier with no unpaid bills', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'sup-1' });
    (prisma as any).finBill.count.mockResolvedValue(0);
    (prisma as any).finSupplier.update.mockResolvedValue({ id: 'sup-1' });

    const res = await request(app).delete('/api/payables/suppliers/sup-1');

    expect(res.status).toBe(200);
    expect(res.body.data.deleted).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).delete('/api/payables/suppliers/nonexistent');

    expect(res.status).toBe(404);
  });

  it('should return 409 when supplier has unpaid bills', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: 'sup-1' });
    (prisma as any).finBill.count.mockResolvedValue(3);

    const res = await request(app).delete('/api/payables/suppliers/sup-1');

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
      { id: 'po-1', reference: 'FIN-PO-2601-1000', status: 'DRAFT', supplier: { id: 's-1', code: 'S001', name: 'Widget Co' }, _count: { lines: 2 } },
    ];
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue(orders);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/purchase-orders');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/purchase-orders?status=APPROVED');

    expect(res.status).toBe(200);
  });

  it('should filter by supplierId', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/purchase-orders?supplierId=sup-1');

    expect(res.status).toBe(200);
  });

  it('should search by reference or supplier name', async () => {
    (prisma as any).finPurchaseOrder.findMany.mockResolvedValue([]);
    (prisma as any).finPurchaseOrder.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/purchase-orders?search=FIN-PO');

    expect(res.status).toBe(200);
  });
});

describe('GET /api/payables/purchase-orders/:id', () => {
  it('should return a PO when found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({
      id: 'po-1',
      reference: 'FIN-PO-2601-1000',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co', email: 'info@widget.co', currency: 'USD' },
      lines: [{ id: 'line-1', description: 'Bolts', quantity: 100, unitPrice: 0.5 }],
    });

    const res = await request(app).get('/api/payables/purchase-orders/po-1');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('po-1');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/payables/purchase-orders/nonexistent');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/payables/purchase-orders', () => {
  const validPO = {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    orderDate: '2026-01-15',
    lines: [
      { description: 'Steel bolts', quantity: 100, unitPrice: 0.5 },
    ],
  };

  it('should create a PO with lines', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validPO.supplierId, currency: 'USD' });
    (prisma as any).finPurchaseOrder.create.mockResolvedValue({
      id: 'po-new',
      reference: 'FIN-PO-2601-5678',
      status: 'DRAFT',
      total: 50,
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
      lines: [{ description: 'Steel bolts', quantity: 100, unitPrice: 0.5 }],
    });

    const res = await request(app).post('/api/payables/purchase-orders').send(validPO);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

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
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      notes: 'Updated notes',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
      lines: [],
    });

    const res = await request(app).put('/api/payables/purchase-orders/po-1').send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/payables/purchase-orders/nonexistent').send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO is not DRAFT', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'APPROVED' });

    const res = await request(app).put('/api/payables/purchase-orders/po-1').send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_EDITABLE');
  });
});

describe('POST /api/payables/purchase-orders/:id/approve', () => {
  it('should approve a DRAFT PO', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: 'APPROVED',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/approve');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('APPROVED');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/purchase-orders/nonexistent/approve');

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO cannot be approved in current status', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'RECEIVED' });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/approve');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});

describe('POST /api/payables/purchase-orders/:id/receive', () => {
  it('should mark an APPROVED PO as received', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'APPROVED' });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: 'RECEIVED',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/receive');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('RECEIVED');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/purchase-orders/nonexistent/receive');

    expect(res.status).toBe(404);
  });

  it('should return 400 when PO is DRAFT', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/receive');

    expect(res.status).toBe(400);
  });
});

describe('POST /api/payables/purchase-orders/:id/cancel', () => {
  it('should cancel a PO', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'DRAFT' });
    (prisma as any).finPurchaseOrder.update.mockResolvedValue({
      id: 'po-1',
      status: 'CANCELLED',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
    });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/cancel');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('CANCELLED');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/purchase-orders/nonexistent/cancel');

    expect(res.status).toBe(404);
  });

  it('should return 400 when already cancelled', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'CANCELLED' });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/cancel');

    expect(res.status).toBe(400);
  });

  it('should return 400 when already closed', async () => {
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue({ id: 'po-1', status: 'CLOSED' });

    const res = await request(app).post('/api/payables/purchase-orders/po-1/cancel');

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// BILLS
// ===================================================================

describe('GET /api/payables (bills list)', () => {
  it('should return a list of bills', async () => {
    const bills = [
      { id: 'bill-1', reference: 'FIN-BILL-2601-1000', status: 'DRAFT', supplier: { id: 's-1', code: 'S001', name: 'Widget Co' } },
    ];
    (prisma as any).finBill.findMany.mockResolvedValue(bills);
    (prisma as any).finBill.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([]);
    (prisma as any).finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables?status=PAID');

    expect(res.status).toBe(200);
  });

  it('should filter by supplierId', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([]);
    (prisma as any).finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables?supplierId=sup-1');

    expect(res.status).toBe(200);
  });

  it('should search bills', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([]);
    (prisma as any).finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables?search=FIN-BILL');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/payables (create bill)', () => {
  const validBill = {
    supplierId: '550e8400-e29b-41d4-a716-446655440000',
    billDate: '2026-01-15',
    dueDate: '2026-02-15',
    lines: [
      { description: 'Office supplies', quantity: 10, unitPrice: 25 },
    ],
  };

  it('should create a bill with lines', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validBill.supplierId, currency: 'USD' });
    (prisma as any).finBill.create.mockResolvedValue({
      id: 'bill-new',
      reference: 'FIN-BILL-2601-5678',
      status: 'DRAFT',
      total: 250,
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
      lines: [{ description: 'Office supplies', quantity: 10, unitPrice: 25 }],
    });

    const res = await request(app).post('/api/payables').send(validBill);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables').send(validBill);

    expect(res.status).toBe(404);
  });

  it('should validate purchase order if provided', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validBill.supplierId, currency: 'USD' });
    (prisma as any).finPurchaseOrder.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables').send({
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
    (prisma as any).finBill.findFirst.mockResolvedValue({ id: 'bill-1', status: 'DRAFT', amountPaid: 0 });
    (prisma as any).finBill.update.mockResolvedValue({
      id: 'bill-1',
      notes: 'Updated',
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
      lines: [],
    });

    const res = await request(app).put('/api/payables/bill-1').send({ notes: 'Updated' });

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finBill.findFirst.mockResolvedValue(null);

    const res = await request(app).put('/api/payables/nonexistent').send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when bill is not DRAFT', async () => {
    (prisma as any).finBill.findFirst.mockResolvedValue({ id: 'bill-1', status: 'PAID' });

    const res = await request(app).put('/api/payables/bill-1').send({ notes: 'test' });

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
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    (prisma as any).finBill.findFirst.mockResolvedValue({
      id: validPayment.billId,
      status: 'RECEIVED',
      total: 500,
      amountPaid: 0,
    });
    (prisma as any).finPaymentMade.create.mockResolvedValue({
      id: 'pay-new',
      reference: 'FIN-PAY-2601-5678',
      amount: 250,
      supplier: { id: 's-1', code: 'S001', name: 'Widget Co' },
      bill: { id: validPayment.billId, reference: 'FIN-BILL-2601-1000', total: 500, amountPaid: 0, amountDue: 500, status: 'RECEIVED' },
    });
    (prisma as any).finBill.update.mockResolvedValue({});

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when supplier not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 404 when bill not found', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    (prisma as any).finBill.findFirst.mockResolvedValue(null);

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 400 when bill is PAID', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    (prisma as any).finBill.findFirst.mockResolvedValue({
      id: validPayment.billId,
      status: 'PAID',
    });

    const res = await request(app).post('/api/payables/payments').send(validPayment);

    expect(res.status).toBe(400);
  });

  it('should return 400 when bill is VOID', async () => {
    (prisma as any).finSupplier.findFirst.mockResolvedValue({ id: validPayment.supplierId });
    (prisma as any).finBill.findFirst.mockResolvedValue({
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
      { id: 'pay-1', reference: 'FIN-PAY-2601-1000', amount: 250, supplier: { id: 's-1', code: 'S001', name: 'Widget Co' }, bill: null },
    ];
    (prisma as any).finPaymentMade.findMany.mockResolvedValue(payments);
    (prisma as any).finPaymentMade.count.mockResolvedValue(1);

    const res = await request(app).get('/api/payables/payments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by supplierId', async () => {
    (prisma as any).finPaymentMade.findMany.mockResolvedValue([]);
    (prisma as any).finPaymentMade.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/payments?supplierId=sup-1');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finPaymentMade.findMany.mockResolvedValue([]);
    (prisma as any).finPaymentMade.count.mockResolvedValue(0);

    const res = await request(app).get('/api/payables/payments?dateFrom=2026-01-01&dateTo=2026-01-31');

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

    (prisma as any).finBill.findMany.mockResolvedValue([
      { id: 'bill-1', amountDue: 500, dueDate: overdue15, supplier: { id: 's-1', code: 'S001', name: 'Widget Co' } },
      { id: 'bill-2', amountDue: 1000, dueDate: overdue50, supplier: { id: 's-2', code: 'S002', name: 'Gear Inc' } },
    ]);

    const res = await request(app).get('/api/payables/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary.total).toBeGreaterThan(0);
  });

  it('should return empty aging when no overdue bills', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/payables/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.total).toBe(0);
  });
});

describe('POST /api/payables/payment-run', () => {
  it('should generate a payment run', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([
      {
        id: 'bill-1',
        reference: 'FIN-BILL-2601-1000',
        supplierId: 's-1',
        amountDue: 500,
        dueDate: new Date(),
        supplier: { id: 's-1', code: 'S001', name: 'Widget Co', currency: 'USD', paymentTerms: 30 },
      },
    ]);

    const res = await request(app).post('/api/payables/payment-run').send({});

    expect(res.status).toBe(200);
    expect(res.body.data.billCount).toBe(1);
    expect(res.body.data.supplierCount).toBe(1);
    expect(res.body.data.grandTotal).toBe(500);
  });

  it('should accept custom asOfDate', async () => {
    (prisma as any).finBill.findMany.mockResolvedValue([]);

    const res = await request(app).post('/api/payables/payment-run').send({ asOfDate: '2026-03-01' });

    expect(res.status).toBe(200);
    expect(res.body.data.billCount).toBe(0);
  });
});
