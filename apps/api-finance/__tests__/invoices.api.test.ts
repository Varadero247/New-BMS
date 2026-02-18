import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finCustomer: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finInvoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    finInvoiceLine: {
      deleteMany: jest.fn(),
    },
    finPayment: {
      findMany: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    finCreditNote: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
    },
    $transaction: jest.fn(),
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
    FinCustomerWhereInput: {},
    FinInvoiceWhereInput: {},
    FinPaymentWhereInput: {},
    FinCreditNoteWhereInput: {},
  },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-4000-a000-000000000123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import invoicesRouter from '../src/routes/invoices';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/invoices', invoicesRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// CUSTOMER ENDPOINTS
// ===================================================================

describe('GET /api/invoices/customers', () => {
  it('should return a list of customers', async () => {
    const customers = [
      { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme Corp', _count: { invoices: 5 } },
      { id: 'f4000000-0000-4000-a000-000000000002', code: 'C002', name: 'Beta Inc', _count: { invoices: 2 } },
    ];
    (prisma as any).finCustomer.findMany.mockResolvedValue(customers);
    (prisma as any).finCustomer.count.mockResolvedValue(2);

    const res = await request(app).get('/api/invoices/customers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('should search customers', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices/customers?search=acme');

    expect(res.status).toBe(200);
    expect((prisma as any).finCustomer.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            expect.objectContaining({ name: expect.objectContaining({ contains: 'acme' }) }),
          ]),
        }),
      })
    );
  });

  it('should handle pagination', async () => {
    (prisma as any).finCustomer.findMany.mockResolvedValue([]);
    (prisma as any).finCustomer.count.mockResolvedValue(50);

    const res = await request(app).get('/api/invoices/customers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('should return 500 on error', async () => {
    (prisma as any).finCustomer.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/invoices/customers');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/invoices/customers/:id', () => {
  it('should return a customer when found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      code: 'C001',
      name: 'Acme Corp',
      deletedAt: null,
      _count: { invoices: 5, payments: 3, creditNotes: 1 },
    });

    const res = await request(app).get('/api/invoices/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f4000000-0000-4000-a000-000000000001');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/customers/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 404 when deleted', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).get('/api/invoices/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/invoices/customers', () => {
  const validCustomer = { code: 'C001', name: 'Acme Corp', email: 'acme@test.com' };

  it('should create a customer successfully', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);
    (prisma as any).finCustomer.create.mockResolvedValue({ id: 'cust-new', ...validCustomer });

    const res = await request(app).post('/api/invoices/customers').send(validCustomer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for duplicate code', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({ id: 'existing', code: 'C001' });

    const res = await request(app).post('/api/invoices/customers').send(validCustomer);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('DUPLICATE_CODE');
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/invoices/customers').send({ code: '' });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/invoices/customers/:id', () => {
  it('should update a customer', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({ id: 'f4000000-0000-4000-a000-000000000001', deletedAt: null });
    (prisma as any).finCustomer.update.mockResolvedValue({ id: 'f4000000-0000-4000-a000-000000000001', name: 'Updated Corp' });

    const res = await request(app).put('/api/invoices/customers/f4000000-0000-4000-a000-000000000001').send({ name: 'Updated Corp' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/customers/00000000-0000-0000-0000-000000000099').send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/invoices/customers/:id', () => {
  it('should soft delete a customer with no unpaid invoices', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
      invoices: [],
    });
    (prisma as any).finCustomer.update.mockResolvedValue({ id: 'f4000000-0000-4000-a000-000000000001' });

    const res = await request(app).delete('/api/invoices/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).delete('/api/invoices/customers/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });

  it('should return 409 when customer has unpaid invoices', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
      invoices: [{ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' }],
    });

    const res = await request(app).delete('/api/invoices/customers/f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('HAS_UNPAID_INVOICES');
  });
});

// ===================================================================
// INVOICE ENDPOINTS
// ===================================================================

describe('GET /api/invoices', () => {
  it('should return a list of invoices', async () => {
    const invoices = [
      { id: 'f6000000-0000-4000-a000-000000000001', reference: 'FIN-INV-2601-1234', status: 'DRAFT', customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' }, _count: { lines: 3 } },
    ];
    (prisma as any).finInvoice.findMany.mockResolvedValue(invoices);
    (prisma as any).finInvoice.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    (prisma as any).finInvoice.findMany.mockResolvedValue([]);
    (prisma as any).finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?status=PAID');

    expect(res.status).toBe(200);
  });

  it('should filter by customerId', async () => {
    (prisma as any).finInvoice.findMany.mockResolvedValue([]);
    (prisma as any).finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?customerId=f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finInvoice.findMany.mockResolvedValue([]);
    (prisma as any).finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should search by reference or customer name', async () => {
    (prisma as any).finInvoice.findMany.mockResolvedValue([]);
    (prisma as any).finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?search=FIN-INV');

    expect(res.status).toBe(200);
  });
});

describe('GET /api/invoices/:id', () => {
  it('should return an invoice with lines and payments', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      reference: 'FIN-INV-2601-1234',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', name: 'Acme' },
      lines: [{ id: 'f6100000-0000-4000-a000-000000000001', description: 'Item 1', quantity: 2, unitPrice: 50 }],
      payments: [],
    });

    const res = await request(app).get('/api/invoices/f6000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f6000000-0000-4000-a000-000000000001');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/invoices', () => {
  const validInvoice = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    lines: [
      { description: 'Consulting services', quantity: 10, unitPrice: 150 },
    ],
  };

  it('should create an invoice with lines', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validInvoice.customerId,
      deletedAt: null,
      currency: 'USD',
    });
    (prisma as any).finInvoice.create.mockResolvedValue({
      id: 'inv-new',
      reference: 'FIN-INV-2601-5678',
      status: 'DRAFT',
      subtotal: 1500,
      total: 1500,
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [{ description: 'Consulting services', quantity: 10, unitPrice: 150, lineTotal: 1500 }],
    });

    const res = await request(app).post('/api/invoices').send(validInvoice);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subtotal).toBe(1500);
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices').send(validInvoice);

    expect(res.status).toBe(404);
  });

  it('should return 404 when customer is deleted', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validInvoice.customerId,
      deletedAt: new Date(),
    });

    const res = await request(app).post('/api/invoices').send(validInvoice);

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error (no lines)', async () => {
    const res = await request(app).post('/api/invoices').send({
      customerId: '550e8400-e29b-41d4-a716-446655440000',
      issueDate: '2026-01-15',
      dueDate: '2026-02-15',
      lines: [],
    });

    expect(res.status).toBe(400);
  });

  it('should return 400 for missing required fields', async () => {
    const res = await request(app).post('/api/invoices').send({});

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/invoices/:id', () => {
  it('should update a draft invoice', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'DRAFT' });
    (prisma as any).finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      notes: 'Updated notes',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [],
    });

    const res = await request(app).put('/api/invoices/f6000000-0000-4000-a000-000000000001').send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).put('/api/invoices/00000000-0000-0000-0000-000000000099').send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice is not DRAFT', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' });

    const res = await request(app).put('/api/invoices/f6000000-0000-4000-a000-000000000001').send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_DRAFT');
  });

  it('should recalculate totals when lines are updated', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'DRAFT' });
    (prisma as any).finInvoiceLine.deleteMany.mockResolvedValue({ count: 1 });
    (prisma as any).finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      subtotal: 500,
      total: 500,
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
    });

    const res = await request(app).put('/api/invoices/f6000000-0000-4000-a000-000000000001').send({
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
    });

    expect(res.status).toBe(200);
  });
});

describe('POST /api/invoices/:id/send', () => {
  it('should mark a draft invoice as SENT', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'DRAFT' });
    (prisma as any).finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
    });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/send');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice is not DRAFT', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/send');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});

describe('POST /api/invoices/:id/void', () => {
  it('should void a SENT invoice', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' });
    (prisma as any).finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'VOID',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
    });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/void').send({ reason: 'Duplicate invoice' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VOID');
  });

  it('should return 404 when not found', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/00000000-0000-0000-0000-000000000099/void').send({ reason: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when already VOID', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'VOID' });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/void').send({ reason: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_VOID');
  });

  it('should return 400 when PAID', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'PAID' });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/void').send({ reason: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CANNOT_VOID_PAID');
  });

  it('should return 400 when reason is missing', async () => {
    (prisma as any).finInvoice.findUnique.mockResolvedValue({ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/void').send({});

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// PAYMENT ENDPOINTS
// ===================================================================

describe('GET /api/invoices/payments', () => {
  it('should return a list of payments', async () => {
    const payments = [
      { id: 'f6200000-0000-4000-a000-000000000001', reference: 'FIN-PMT-2601-1000', amount: 500, customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' }, invoice: null },
    ];
    (prisma as any).finPayment.findMany.mockResolvedValue(payments);
    (prisma as any).finPayment.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices/payments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    (prisma as any).finPayment.findMany.mockResolvedValue([]);
    (prisma as any).finPayment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices/payments?customerId=f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    (prisma as any).finPayment.findMany.mockResolvedValue([]);
    (prisma as any).finPayment.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices/payments?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/invoices/payments', () => {
  const validPayment = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    invoiceId: '550e8400-e29b-41d4-a716-446655440001',
    date: '2026-01-20',
    amount: 500,
    method: 'BANK_TRANSFER',
  };

  it('should record a payment and update invoice status', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: validPayment.customerId,
      status: 'SENT',
      total: 1000,
      amountPaid: 0,
    });
    (prisma as any).$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finPayment: {
          create: jest.fn().mockResolvedValue({
            id: 'pmt-new',
            reference: 'FIN-PMT-2601-5678',
            amount: 500,
            customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
            invoice: { id: validPayment.invoiceId, reference: 'FIN-INV-2601-1234' },
          }),
        },
        finInvoice: { update: jest.fn().mockResolvedValue({}) },
      };
      return fn(tx);
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 404 when invoice not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice belongs to different customer', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: 'different-customer',
      status: 'SENT',
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISMATCH');
  });

  it('should return 400 when invoice is VOID', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: validPayment.customerId,
      status: 'VOID',
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });

  it('should return 400 when invoice is PAID', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: validPayment.customerId,
      status: 'PAID',
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(400);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/invoices/payments').send({ amount: -5 });

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// AGING REPORT
// ===================================================================

describe('GET /api/invoices/aging', () => {
  it('should return AR aging report with buckets', async () => {
    const now = new Date();
    const overdue45 = new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000);
    const overdue10 = new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000);

    (prisma as any).finInvoice.findMany.mockResolvedValue([
      { id: 'f6000000-0000-4000-a000-000000000001', reference: 'INV-001', amountDue: 1000, dueDate: overdue10, customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' } },
      { id: 'f6000000-0000-4000-a000-000000000002', reference: 'INV-002', amountDue: 2000, dueDate: overdue45, customer: { id: 'f4000000-0000-4000-a000-000000000002', code: 'C002', name: 'Beta' } },
    ]);

    const res = await request(app).get('/api/invoices/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.buckets).toBeDefined();
    expect(res.body.data.grandTotal).toBeGreaterThan(0);
  });

  it('should return empty buckets when no overdue invoices', async () => {
    (prisma as any).finInvoice.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/invoices/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.grandTotal).toBe(0);
  });
});

// ===================================================================
// CREDIT NOTES
// ===================================================================

describe('GET /api/invoices/credit-notes', () => {
  it('should return a list of credit notes', async () => {
    const creditNotes = [
      { id: 'f6300000-0000-4000-a000-000000000001', reference: 'FIN-CN-2601-1000', amount: 200, customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' }, invoice: null },
    ];
    (prisma as any).finCreditNote.findMany.mockResolvedValue(creditNotes);
    (prisma as any).finCreditNote.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices/credit-notes');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    (prisma as any).finCreditNote.findMany.mockResolvedValue([]);
    (prisma as any).finCreditNote.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices/credit-notes?customerId=f4000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
  });
});

describe('POST /api/invoices/credit-notes', () => {
  const validCreditNote = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    date: '2026-01-20',
    amount: 200,
    reason: 'Overcharge on invoice',
  };

  it('should create a credit note successfully', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    (prisma as any).finCreditNote.create.mockResolvedValue({
      id: 'cn-new',
      reference: 'FIN-CN-2601-5678',
      ...validCreditNote,
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
    });

    const res = await request(app).post('/api/invoices/credit-notes').send(validCreditNote);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when customer not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/credit-notes').send(validCreditNote);

    expect(res.status).toBe(404);
  });

  it('should validate invoice belongs to customer when invoiceId provided', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      customerId: 'different-customer',
    });

    const res = await request(app).post('/api/invoices/credit-notes').send({
      ...validCreditNote,
      invoiceId: '550e8400-e29b-41d4-a716-446655440001',
    });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISMATCH');
  });

  it('should return 404 when invoiceId provided but not found', async () => {
    (prisma as any).finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    (prisma as any).finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/credit-notes').send({
      ...validCreditNote,
      invoiceId: '550e8400-e29b-41d4-a716-446655440001',
    });

    expect(res.status).toBe(404);
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/invoices/credit-notes').send({});

    expect(res.status).toBe(400);
  });
});
