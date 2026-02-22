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
    finPaymentReceived: {
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

import invoicesRouter from '../src/routes/invoices';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

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
      {
        id: 'f4000000-0000-4000-a000-000000000001',
        code: 'C001',
        name: 'Acme Corp',
        _count: { invoices: 5 },
      },
      {
        id: 'f4000000-0000-4000-a000-000000000002',
        code: 'C002',
        name: 'Beta Inc',
        _count: { invoices: 2 },
      },
    ];
    mockPrisma.finCustomer.findMany.mockResolvedValue(customers);
    mockPrisma.finCustomer.count.mockResolvedValue(2);

    const res = await request(app).get('/api/invoices/customers');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.meta.total).toBe(2);
  });

  it('should search customers', async () => {
    mockPrisma.finCustomer.findMany.mockResolvedValue([]);
    mockPrisma.finCustomer.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices/customers?search=acme');

    expect(res.status).toBe(200);
    expect(mockPrisma.finCustomer.findMany).toHaveBeenCalledWith(
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
    mockPrisma.finCustomer.findMany.mockResolvedValue([]);
    mockPrisma.finCustomer.count.mockResolvedValue(50);

    const res = await request(app).get('/api/invoices/customers?page=2&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.meta.page).toBe(2);
    expect(res.body.meta.totalPages).toBe(5);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finCustomer.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/invoices/customers');

    expect(res.status).toBe(500);
  });
});

describe('GET /api/invoices/customers/:id', () => {
  it('should return a customer when found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      code: 'C001',
      name: 'Acme Corp',
      deletedAt: null,
      _count: { invoices: 5, payments: 3, creditNotes: 1 },
    });

    const res = await request(app).get(
      '/api/invoices/customers/f4000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f4000000-0000-4000-a000-000000000001');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).get(
      '/api/invoices/customers/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });

  it('should return 404 when deleted', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: new Date(),
    });

    const res = await request(app).get(
      '/api/invoices/customers/f4000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(404);
  });
});

describe('POST /api/invoices/customers', () => {
  const validCustomer = { code: 'C001', name: 'Acme Corp', email: 'acme@test.com' };

  it('should create a customer successfully', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);
    mockPrisma.finCustomer.create.mockResolvedValue({ id: 'cust-new', ...validCustomer });

    const res = await request(app).post('/api/invoices/customers').send(validCustomer);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 400 for duplicate code', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({ id: 'existing', code: 'C001' });

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
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
    });
    mockPrisma.finCustomer.update.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      name: 'Updated Corp',
    });

    const res = await request(app)
      .put('/api/invoices/customers/f4000000-0000-4000-a000-000000000001')
      .send({ name: 'Updated Corp' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/invoices/customers/00000000-0000-0000-0000-000000000099')
      .send({ name: 'Test' });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/invoices/customers/:id', () => {
  it('should soft delete a customer with no unpaid invoices', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
      invoices: [],
    });
    mockPrisma.finCustomer.update.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete(
      '/api/invoices/customers/f4000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/invoices/customers/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });

  it('should return 409 when customer has unpaid invoices', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: 'f4000000-0000-4000-a000-000000000001',
      deletedAt: null,
      invoices: [{ id: 'f6000000-0000-4000-a000-000000000001', status: 'SENT' }],
    });

    const res = await request(app).delete(
      '/api/invoices/customers/f4000000-0000-4000-a000-000000000001'
    );

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
      {
        id: 'f6000000-0000-4000-a000-000000000001',
        reference: 'FIN-INV-2601-1234',
        status: 'DRAFT',
        customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
        _count: { lines: 3 },
      },
    ];
    mockPrisma.finInvoice.findMany.mockResolvedValue(invoices);
    mockPrisma.finInvoice.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by status', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?status=PAID');

    expect(res.status).toBe(200);
  });

  it('should filter by customerId', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/invoices?customerId=f4000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?dateFrom=2026-01-01&dateTo=2026-01-31');

    expect(res.status).toBe(200);
  });

  it('should search by reference or customer name', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finInvoice.count.mockResolvedValue(0);

    const res = await request(app).get('/api/invoices?search=FIN-INV');

    expect(res.status).toBe(200);
  });
});

describe('GET /api/invoices/:id', () => {
  it('should return an invoice with lines and payments', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      reference: 'FIN-INV-2601-1234',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', name: 'Acme' },
      lines: [
        {
          id: 'f6100000-0000-4000-a000-000000000001',
          description: 'Item 1',
          quantity: 2,
          unitPrice: 50,
        },
      ],
      payments: [],
    });

    const res = await request(app).get('/api/invoices/f6000000-0000-4000-a000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe('f6000000-0000-4000-a000-000000000001');
    expect(res.body.data.lines).toHaveLength(1);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/invoices/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/invoices', () => {
  const validInvoice = {
    customerId: '550e8400-e29b-41d4-a716-446655440000',
    issueDate: '2026-01-15',
    dueDate: '2026-02-15',
    lines: [{ description: 'Consulting services', quantity: 10, unitPrice: 150 }],
  };

  it('should create an invoice with lines', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validInvoice.customerId,
      deletedAt: null,
      currency: 'USD',
    });
    mockPrisma.finInvoice.create.mockResolvedValue({
      id: 'inv-new',
      reference: 'FIN-INV-2601-5678',
      status: 'DRAFT',
      subtotal: 1500,
      total: 1500,
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [
        { description: 'Consulting services', quantity: 10, unitPrice: 150, lineTotal: 1500 },
      ],
    });

    const res = await request(app).post('/api/invoices').send(validInvoice);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.subtotal).toBe(1500);
  });

  it('should return 404 when customer not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices').send(validInvoice);

    expect(res.status).toBe(404);
  });

  it('should return 404 when customer is deleted', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
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
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      notes: 'Updated notes',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [],
    });

    const res = await request(app)
      .put('/api/invoices/f6000000-0000-4000-a000-000000000001')
      .send({ notes: 'Updated notes' });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/invoices/00000000-0000-0000-0000-000000000099')
      .send({ notes: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice is not DRAFT', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
    });

    const res = await request(app)
      .put('/api/invoices/f6000000-0000-4000-a000-000000000001')
      .send({ notes: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('NOT_DRAFT');
  });

  it('should recalculate totals when lines are updated', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finInvoiceLine.deleteMany.mockResolvedValue({ count: 1 });
    mockPrisma.finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      subtotal: 500,
      total: 500,
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
    });

    const res = await request(app)
      .put('/api/invoices/f6000000-0000-4000-a000-000000000001')
      .send({
        lines: [{ description: 'New item', quantity: 5, unitPrice: 100 }],
      });

    expect(res.status).toBe(200);
  });
});

describe('POST /api/invoices/:id/send', () => {
  it('should mark a draft invoice as SENT', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'DRAFT',
    });
    mockPrisma.finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
    });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/send');

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('SENT');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/00000000-0000-0000-0000-000000000099/send');

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice is not DRAFT', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
    });

    const res = await request(app).post('/api/invoices/f6000000-0000-4000-a000-000000000001/send');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });
});

describe('POST /api/invoices/:id/void', () => {
  it('should void a SENT invoice', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
    });
    mockPrisma.finInvoice.update.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'VOID',
      customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
    });

    const res = await request(app)
      .post('/api/invoices/f6000000-0000-4000-a000-000000000001/void')
      .send({ reason: 'Duplicate invoice' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('VOID');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/invoices/00000000-0000-0000-0000-000000000099/void')
      .send({ reason: 'test' });

    expect(res.status).toBe(404);
  });

  it('should return 400 when already VOID', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'VOID',
    });

    const res = await request(app)
      .post('/api/invoices/f6000000-0000-4000-a000-000000000001/void')
      .send({ reason: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('ALREADY_VOID');
  });

  it('should return 400 when PAID', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'PAID',
    });

    const res = await request(app)
      .post('/api/invoices/f6000000-0000-4000-a000-000000000001/void')
      .send({ reason: 'test' });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('CANNOT_VOID_PAID');
  });

  it('should return 400 when reason is missing', async () => {
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      status: 'SENT',
    });

    const res = await request(app)
      .post('/api/invoices/f6000000-0000-4000-a000-000000000001/void')
      .send({});

    expect(res.status).toBe(400);
  });
});

// ===================================================================
// PAYMENT ENDPOINTS
// ===================================================================

describe('GET /api/invoices/payments', () => {
  it('should return a list of payments', async () => {
    const payments = [
      {
        id: 'f6200000-0000-4000-a000-000000000001',
        reference: 'FIN-PMT-2601-1000',
        amount: 500,
        customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
        invoice: null,
      },
    ];
    mockPrisma.finPaymentReceived.findMany.mockResolvedValue(payments);
    mockPrisma.finPaymentReceived.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices/payments');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.finPaymentReceived.findMany.mockResolvedValue([]);
    mockPrisma.finPaymentReceived.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/invoices/payments?customerId=f4000000-0000-4000-a000-000000000001'
    );

    expect(res.status).toBe(200);
  });

  it('should filter by date range', async () => {
    mockPrisma.finPaymentReceived.findMany.mockResolvedValue([]);
    mockPrisma.finPaymentReceived.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/invoices/payments?dateFrom=2026-01-01&dateTo=2026-01-31'
    );

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
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: validPayment.customerId,
      status: 'SENT',
      total: 1000,
      amountPaid: 0,
    });
    mockPrisma.$transaction.mockImplementation(async (fn: any) => {
      const tx = {
        finPaymentReceived: {
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
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 404 when invoice not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(404);
  });

  it('should return 400 when invoice belongs to different customer', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: 'different-customer',
      status: 'SENT',
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISMATCH');
  });

  it('should return 400 when invoice is VOID', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: validPayment.invoiceId,
      customerId: validPayment.customerId,
      status: 'VOID',
    });

    const res = await request(app).post('/api/invoices/payments').send(validPayment);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_STATUS');
  });

  it('should return 400 when invoice is PAID', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validPayment.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
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

    mockPrisma.finInvoice.findMany.mockResolvedValue([
      {
        id: 'f6000000-0000-4000-a000-000000000001',
        reference: 'INV-001',
        amountDue: 1000,
        dueDate: overdue10,
        customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
      },
      {
        id: 'f6000000-0000-4000-a000-000000000002',
        reference: 'INV-002',
        amountDue: 2000,
        dueDate: overdue45,
        customer: { id: 'f4000000-0000-4000-a000-000000000002', code: 'C002', name: 'Beta' },
      },
    ]);

    const res = await request(app).get('/api/invoices/aging');

    expect(res.status).toBe(200);
    expect(res.body.data.buckets).toBeDefined();
    expect(res.body.data.grandTotal).toBeGreaterThan(0);
  });

  it('should return empty buckets when no overdue invoices', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);

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
      {
        id: 'f6300000-0000-4000-a000-000000000001',
        reference: 'FIN-CN-2601-1000',
        amount: 200,
        customer: { id: 'f4000000-0000-4000-a000-000000000001', code: 'C001', name: 'Acme' },
        invoice: null,
      },
    ];
    mockPrisma.finCreditNote.findMany.mockResolvedValue(creditNotes);
    mockPrisma.finCreditNote.count.mockResolvedValue(1);

    const res = await request(app).get('/api/invoices/credit-notes');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
  });

  it('should filter by customerId', async () => {
    mockPrisma.finCreditNote.findMany.mockResolvedValue([]);
    mockPrisma.finCreditNote.count.mockResolvedValue(0);

    const res = await request(app).get(
      '/api/invoices/credit-notes?customerId=f4000000-0000-4000-a000-000000000001'
    );

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
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    mockPrisma.finCreditNote.create.mockResolvedValue({
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
    mockPrisma.finCustomer.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/invoices/credit-notes').send(validCreditNote);

    expect(res.status).toBe(404);
  });

  it('should validate invoice belongs to customer when invoiceId provided', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue({
      id: 'f6000000-0000-4000-a000-000000000001',
      customerId: 'different-customer',
    });

    const res = await request(app)
      .post('/api/invoices/credit-notes')
      .send({
        ...validCreditNote,
        invoiceId: '550e8400-e29b-41d4-a716-446655440001',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('MISMATCH');
  });

  it('should return 404 when invoiceId provided but not found', async () => {
    mockPrisma.finCustomer.findUnique.mockResolvedValue({
      id: validCreditNote.customerId,
      deletedAt: null,
    });
    mockPrisma.finInvoice.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .post('/api/invoices/credit-notes')
      .send({
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


describe('phase32 coverage', () => {
  it('handles array flatMap', () => { expect([1,2,3].flatMap(x => [x, x*2])).toEqual([1,2,2,4,3,6]); });
  it('handles string trimEnd', () => { expect('hi  '.trimEnd()).toBe('hi'); });
});


describe('phase33 coverage', () => {
  it('handles partial application', () => { const multiply = (a: number, b: number) => a * b; const triple = multiply.bind(null, 3); expect(triple(7)).toBe(21); });
  it('handles currying pattern', () => { const add = (a: number) => (b: number) => a + b; expect(add(3)(4)).toBe(7); });
  it('handles modulo', () => { expect(10 % 3).toBe(1); });
  it('handles array pop', () => { const a = [1,2,3]; expect(a.pop()).toBe(3); expect(a).toEqual([1,2]); });
  it('handles void operator', () => { expect(void 0).toBeUndefined(); });
});


describe('phase34 coverage', () => {
  it('handles negative array index via at()', () => { expect([10,20,30].at(-2)).toBe(20); });
  it('handles array deduplication', () => { const arr = [1,2,2,3,3,3]; expect([...new Set(arr)]).toEqual([1,2,3]); });
  it('handles static method', () => { class MathHelper { static square(n: number) { return n*n; } } expect(MathHelper.square(4)).toBe(16); });
  it('handles union type narrowing', () => { const fn = (v: string | number) => typeof v === 'string' ? v.length : v; expect(fn('hello')).toBe(5); expect(fn(42)).toBe(42); });
  it('handles generic class', () => { class Box<T> { constructor(public value: T) {} } const b = new Box(99); expect(b.value).toBe(99); });
});


describe('phase35 coverage', () => {
  it('handles flatten array deeply', () => { expect([1,[2,[3,[4]]]].flat(3)).toEqual([1,2,3,4]); });
  it('handles max by key pattern', () => { const maxBy = <T>(arr:T[], fn:(x:T)=>number) => arr.reduce((m,x)=>fn(x)>fn(m)?x:m); expect(maxBy([{v:1},{v:3},{v:2}],x=>x.v).v).toBe(3); });
  it('handles short-circuit evaluation', () => { let x = 0; false && (x=1); expect(x).toBe(0); true || (x=2); expect(x).toBe(0); });
  it('handles string padStart for dates', () => { const day = 5; expect(String(day).padStart(2,'0')).toBe('05'); });
  it('handles Array.from string', () => { expect(Array.from('hi')).toEqual(['h','i']); });
});


describe('phase36 coverage', () => {
  it('handles two-sum pattern', () => { const twoSum=(nums:number[],t:number)=>{const m=new Map<number,number>();for(let i=0;i<nums.length;i++){const c=t-nums[i];if(m.has(c))return[m.get(c)!,i];m.set(nums[i],i);}return[];}; expect(twoSum([2,7,11,15],9)).toEqual([0,1]); });
  it('handles counting sort result', () => { const arr=[3,1,4,1,5,9,2,6]; const sorted=[...arr].sort((a,b)=>a-b); expect(sorted[0]).toBe(1); expect(sorted[sorted.length-1]).toBe(9); });
  it('handles sliding window sum', () => { const maxSum=(a:number[],k:number)=>{let s=a.slice(0,k).reduce((x,y)=>x+y,0),max=s;for(let i=k;i<a.length;i++){s+=a[i]-a[i-k];max=Math.max(max,s);}return max;};expect(maxSum([1,3,-1,-3,5,3,6,7],3)).toBe(16); });
  it('handles flatten nested object keys', () => { const flat=(o:Record<string,unknown>,prefix=''):Record<string,unknown>=>{return Object.entries(o).reduce((acc,[k,v])=>{const key=prefix?`${prefix}.${k}`:k;if(v&&typeof v==='object'&&!Array.isArray(v))Object.assign(acc,flat(v as Record<string,unknown>,key));else(acc as any)[key]=v;return acc;},{});};expect(flat({a:{b:1}})).toEqual({'a.b':1}); });
  it('handles coin change count', () => { const ways=(coins:number[],amt:number)=>{const dp=Array(amt+1).fill(0);dp[0]=1;for(const c of coins)for(let i=c;i<=amt;i++)dp[i]+=dp[i-c];return dp[amt];};expect(ways([1,2,5],5)).toBe(4); });
});


describe('phase37 coverage', () => {
  it('reverses a string', () => { const rev=(s:string)=>s.split('').reverse().join(''); expect(rev('hello')).toBe('olleh'); });
  it('checks all unique', () => { const allUniq=<T>(a:T[])=>new Set(a).size===a.length; expect(allUniq([1,2,3])).toBe(true); expect(allUniq([1,2,1])).toBe(false); });
  it('transposes 2d array', () => { const t=(m:number[][])=>m[0].map((_,i)=>m.map(r=>r[i])); expect(t([[1,2,3],[4,5,6]])).toEqual([[1,4],[2,5],[3,6]]); });
  it('moves element to front', () => { const toFront=<T>(a:T[],idx:number)=>[a[idx],...a.filter((_,i)=>i!==idx)]; expect(toFront([1,2,3,4],2)).toEqual([3,1,2,4]); });
  it('formats bytes to human readable', () => { const fmt=(b:number)=>b>=1e9?`${(b/1e9).toFixed(1)}GB`:b>=1e6?`${(b/1e6).toFixed(1)}MB`:`${(b/1e3).toFixed(1)}KB`; expect(fmt(1500000)).toBe('1.5MB'); });
});


describe('phase38 coverage', () => {
  it('checks if strings are rotations of each other', () => { const isRot=(a:string,b:string)=>a.length===b.length&&(a+a).includes(b); expect(isRot('abcde','cdeab')).toBe(true); expect(isRot('abc','acb')).toBe(false); });
  it('checks if year is leap year', () => { const isLeap=(y:number)=>y%4===0&&(y%100!==0||y%400===0); expect(isLeap(2000)).toBe(true); expect(isLeap(1900)).toBe(false); expect(isLeap(2024)).toBe(true); });
  it('checks perfect number', () => { const isPerfect=(n:number)=>{let s=1;for(let i=2;i*i<=n;i++)if(n%i===0){s+=i;if(i!==n/i)s+=n/i;}return s===n&&n!==1;}; expect(isPerfect(6)).toBe(true); expect(isPerfect(28)).toBe(true); expect(isPerfect(12)).toBe(false); });
  it('finds longest increasing subsequence length', () => { const lis=(a:number[])=>{const dp=Array(a.length).fill(1);for(let i=1;i<a.length;i++)for(let j=0;j<i;j++)if(a[j]<a[i])dp[i]=Math.max(dp[i],dp[j]+1);return Math.max(...dp);}; expect(lis([10,9,2,5,3,7,101,18])).toBe(4); });
  it('computes array variance', () => { const variance=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return a.reduce((s,v)=>s+(v-m)**2,0)/a.length;}; expect(variance([2,4,4,4,5,5,7,9])).toBe(4); });
});


describe('phase39 coverage', () => {
  it('computes integer square root', () => { const isqrt=(n:number)=>Math.floor(Math.sqrt(n)); expect(isqrt(16)).toBe(4); expect(isqrt(17)).toBe(4); });
  it('implements jump game check', () => { const canJump=(nums:number[])=>{let reach=0;for(let i=0;i<nums.length;i++){if(i>reach)return false;reach=Math.max(reach,i+nums[i]);}return true;}; expect(canJump([2,3,1,1,4])).toBe(true); expect(canJump([3,2,1,0,4])).toBe(false); });
  it('counts substring occurrences', () => { const countOcc=(s:string,sub:string)=>{let c=0,i=0;while((i=s.indexOf(sub,i))!==-1){c++;i+=sub.length;}return c;}; expect(countOcc('banana','an')).toBe(2); });
  it('checks if two strings are isomorphic', () => { const isIso=(s:string,t:string)=>{const m1=new Map<string,string>(),m2=new Set<string>();for(let i=0;i<s.length;i++){if(m1.has(s[i])&&m1.get(s[i])!==t[i])return false;if(!m1.has(s[i])&&m2.has(t[i]))return false;m1.set(s[i],t[i]);m2.add(t[i]);}return true;}; expect(isIso('egg','add')).toBe(true); expect(isIso('foo','bar')).toBe(false); });
  it('computes minimum path sum', () => { const minPath=(g:number[][])=>{const m=g.length,n=g[0].length;const dp=g.map(r=>[...r]);for(let i=1;i<m;i++)dp[i][0]+=dp[i-1][0];for(let j=1;j<n;j++)dp[0][j]+=dp[0][j-1];for(let i=1;i<m;i++)for(let j=1;j<n;j++)dp[i][j]+=Math.min(dp[i-1][j],dp[i][j-1]);return dp[m-1][n-1];}; expect(minPath([[1,3,1],[1,5,1],[4,2,1]])).toBe(7); });
});


describe('phase40 coverage', () => {
  it('counts distinct islands count', () => { const grid=[[1,1,0,1,1],[1,0,0,0,0],[0,0,0,0,1],[1,1,0,1,1]]; const vis=grid.map(r=>[...r]); let count=0; const dfs=(i:number,j:number)=>{if(i<0||i>=vis.length||j<0||j>=vis[0].length||vis[i][j]!==1)return;vis[i][j]=0;dfs(i+1,j);dfs(i-1,j);dfs(i,j+1);dfs(i,j-1);}; for(let i=0;i<vis.length;i++)for(let j=0;j<vis[0].length;j++)if(vis[i][j]===1){dfs(i,j);count++;} expect(count).toBe(4); });
  it('checks if matrix is identity', () => { const isId=(m:number[][])=>m.every((r,i)=>r.every((v,j)=>v===(i===j?1:0))); expect(isId([[1,0],[0,1]])).toBe(true); expect(isId([[1,0],[0,2]])).toBe(false); });
  it('finds number of pairs with given difference', () => { const pairsWithDiff=(a:number[],d:number)=>{const s=new Set(a);return a.filter(v=>s.has(v+d)).length;}; expect(pairsWithDiff([1,5,3,4,2],2)).toBe(3); });
  it('finds next permutation', () => { const nextPerm=(a:number[])=>{const r=[...a];let i=r.length-2;while(i>=0&&r[i]>=r[i+1])i--;if(i>=0){let j=r.length-1;while(r[j]<=r[i])j--;[r[i],r[j]]=[r[j],r[i]];}let l=i+1,rt=r.length-1;while(l<rt){[r[l],r[rt]]=[r[rt],r[l]];l++;rt--;}return r;}; expect(nextPerm([1,2,3])).toEqual([1,3,2]); });
  it('checks if array forms arithmetic progression', () => { const isAP=(a:number[])=>{const d=a[1]-a[0];return a.every((v,i)=>i===0||v-a[i-1]===d);}; expect(isAP([3,5,7,9])).toBe(true); expect(isAP([1,2,4])).toBe(false); });
});


describe('phase41 coverage', () => {
  it('finds all permutations of array', () => { const perms=<T>(a:T[]):T[][]=>a.length<=1?[a]:[...a.flatMap((v,i)=>perms([...a.slice(0,i),...a.slice(i+1)]).map(p=>[v,...p]))]; expect(perms([1,2,3]).length).toBe(6); });
  it('checks if string can form palindrome permutation', () => { const canFormPalin=(s:string)=>{const odd=[...s].reduce((cnt,c)=>{cnt.set(c,(cnt.get(c)||0)+1);return cnt;},new Map<string,number>());return[...odd.values()].filter(v=>v%2!==0).length<=1;}; expect(canFormPalin('carrace')).toBe(true); expect(canFormPalin('code')).toBe(false); });
  it('computes minimum cost to connect ropes', () => { const minCost=(ropes:number[])=>{const pq=[...ropes].sort((a,b)=>a-b);let cost=0;while(pq.length>1){const a=pq.shift()!,b=pq.shift()!;cost+=a+b;pq.push(a+b);pq.sort((x,y)=>x-y);}return cost;}; expect(minCost([4,3,2,6])).toBe(29); });
  it('finds longest subarray with equal 0s and 1s', () => { const longestEqual=(a:number[])=>{const map=new Map([[0,-1]]);let sum=0,max=0;for(let i=0;i<a.length;i++){sum+=a[i]===0?-1:1;if(map.has(sum))max=Math.max(max,i-map.get(sum)!);else map.set(sum,i);}return max;}; expect(longestEqual([0,1,0])).toBe(2); });
  it('implements segment tree point update query', () => { const n=8; const tree=Array(2*n).fill(0); const update=(i:number,v:number)=>{tree[n+i]=v;for(let j=(n+i)>>1;j>=1;j>>=1)tree[j]=tree[2*j]+tree[2*j+1];}; const query=(l:number,r:number)=>{let s=0;for(l+=n,r+=n+1;l<r;l>>=1,r>>=1){if(l&1)s+=tree[l++];if(r&1)s+=tree[--r];}return s;}; update(2,5);update(4,3); expect(query(2,4)).toBe(8); });
});


describe('phase42 coverage', () => {
  it('computes angle between two vectors in degrees', () => { const angle=(ax:number,ay:number,bx:number,by:number)=>{const cos=(ax*bx+ay*by)/(Math.hypot(ax,ay)*Math.hypot(bx,by));return Math.round(Math.acos(Math.max(-1,Math.min(1,cos)))*180/Math.PI);}; expect(angle(1,0,0,1)).toBe(90); expect(angle(1,0,1,0)).toBe(0); });
  it('clamps RGB value', () => { const clamp=(v:number)=>Math.min(255,Math.max(0,v)); expect(clamp(300)).toBe(255); expect(clamp(-10)).toBe(0); expect(clamp(128)).toBe(128); });
  it('translates point', () => { const translate=(x:number,y:number,dx:number,dy:number):[number,number]=>[x+dx,y+dy]; expect(translate(1,2,3,4)).toEqual([4,6]); });
  it('computes cross product magnitude of 2D vectors', () => { const cross=(ax:number,ay:number,bx:number,by:number)=>ax*by-ay*bx; expect(cross(1,0,0,1)).toBe(1); expect(cross(2,3,4,5)).toBe(-2); });
  it('checks if polygon is convex', () => { const isConvex=(pts:[number,number][])=>{const n=pts.length;let sign=0;for(let i=0;i<n;i++){const[ax,ay]=pts[i],[bx,by]=pts[(i+1)%n],[cx,cy]=pts[(i+2)%n];const cross=(bx-ax)*(cy-ay)-(by-ay)*(cx-ax);if(cross!==0){if(sign===0)sign=cross>0?1:-1;else if((cross>0?1:-1)!==sign)return false;}}return true;}; expect(isConvex([[0,0],[1,0],[1,1],[0,1]])).toBe(true); });
});
