import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finInvoice: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    finBill: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    finBankAccount: {
      aggregate: jest.fn(),
    },
    finBudget: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    finAccount: {
      findUnique: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
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

import reportsRouter from '../src/routes/reports';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// DASHBOARD KPIs
// ===================================================================

describe('GET /api/reports/dashboard', () => {
  it('should return dashboard KPIs', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 50000 } }) // revenue
      .mockResolvedValueOnce({ _sum: { amountDue: 15000 } }); // AR
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 30000 } }) // expenses
      .mockResolvedValueOnce({ _sum: { amountDue: 10000 } }); // AP
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({
      _sum: { currentBalance: 100000 },
    });
    mockPrisma.finInvoice.count.mockResolvedValue(3); // overdue invoices
    mockPrisma.finBill.count.mockResolvedValue(2); // overdue bills

    const res = await request(app).get('/api/reports/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe(50000);
    expect(res.body.data.expenses).toBe(30000);
    expect(res.body.data.profit).toBe(20000);
    expect(res.body.data.cashPosition).toBe(100000);
    expect(res.body.data.accountsReceivable).toBe(15000);
    expect(res.body.data.accountsPayable).toBe(10000);
    expect(res.body.data.overdueInvoices).toBe(3);
    expect(res.body.data.overdueBills).toBe(2);
    expect(res.body.data.period).toBeDefined();
  });

  it('should handle null aggregation results', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: null } })
      .mockResolvedValueOnce({ _sum: { amountDue: null } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: null } })
      .mockResolvedValueOnce({ _sum: { amountDue: null } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: null } });
    mockPrisma.finInvoice.count.mockResolvedValue(0);
    mockPrisma.finBill.count.mockResolvedValue(0);

    const res = await request(app).get('/api/reports/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe(0);
    expect(res.body.data.expenses).toBe(0);
    expect(res.body.data.cashPosition).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finInvoice.aggregate.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/dashboard');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// BUDGETS CRUD
// ===================================================================

describe('GET /api/reports/budgets', () => {
  it('should return a list of budgets', async () => {
    const budgets = [
      {
        id: 'f3000000-0000-4000-a000-000000000001',
        name: 'Marketing Q1',
        fiscalYear: 2026,
        budgetAmount: 10000,
        account: {
          id: 'f2000000-0000-4000-a000-000000000001',
          code: '5100',
          name: 'Marketing',
          type: 'EXPENSE',
        },
      },
    ];
    mockPrisma.finBudget.findMany.mockResolvedValue(budgets);
    mockPrisma.finBudget.count.mockResolvedValue(1);

    const res = await request(app).get('/api/reports/budgets');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(1);
    expect(res.body.pagination).toBeDefined();
  });

  it('should filter by fiscalYear', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/reports/budgets?fiscalYear=2026');

    expect(res.status).toBe(200);
  });

  it('should filter by accountId', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/reports/budgets?accountId=acc-1');

    expect(res.status).toBe(200);
  });

  it('should handle pagination', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(100);

    const res = await request(app).get('/api/reports/budgets?page=3&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.page).toBe(3);
    expect(res.body.pagination.totalPages).toBe(10);
  });
});

describe('GET /api/reports/budgets/:id', () => {
  it('should return a budget when found', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue({
      id: 'f3000000-0000-4000-a000-000000000001',
      name: 'Marketing Q1',
      budgetAmount: 10000,
      actualAmount: 7500,
      variance: 2500,
      account: { id: 'f2000000-0000-4000-a000-000000000001', code: '5100', name: 'Marketing' },
    });

    const res = await request(app).get('/api/reports/budgets/00000000-0000-0000-0000-000000000001');

    expect(res.status).toBe(200);
    expect(res.body.data.budgetAmount).toBe(10000);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue(null);

    const res = await request(app).get('/api/reports/budgets/00000000-0000-0000-0000-000000000099');

    expect(res.status).toBe(404);
  });
});

describe('POST /api/reports/budgets', () => {
  const validBudget = {
    name: 'Marketing Q1',
    accountId: '550e8400-e29b-41d4-a716-446655440000',
    fiscalYear: 2026,
    month: 1,
    budgetAmount: 10000,
  };

  it('should create a budget', async () => {
    mockPrisma.finAccount.findUnique.mockResolvedValue({
      id: validBudget.accountId,
      code: '5100',
      name: 'Marketing',
    });
    mockPrisma.finBudget.create.mockResolvedValue({
      id: 'bud-new',
      ...validBudget,
      account: { id: validBudget.accountId, code: '5100', name: 'Marketing', type: 'EXPENSE' },
    });

    const res = await request(app).post('/api/reports/budgets').send(validBudget);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
  });

  it('should return 404 when account not found', async () => {
    mockPrisma.finAccount.findUnique.mockResolvedValue(null);

    const res = await request(app).post('/api/reports/budgets').send(validBudget);

    expect(res.status).toBe(404);
  });

  it('should return 409 for duplicate budget (P2002)', async () => {
    mockPrisma.finAccount.findUnique.mockResolvedValue({ id: validBudget.accountId });
    const err = Object.assign(new Error('Unique constraint'), { code: 'P2002' });
    mockPrisma.finBudget.create.mockRejectedValue(err);

    const res = await request(app).post('/api/reports/budgets').send(validBudget);

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('DUPLICATE');
  });

  it('should return 400 for validation error', async () => {
    const res = await request(app).post('/api/reports/budgets').send({ name: '' });

    expect(res.status).toBe(400);
  });

  it('should return 400 for invalid fiscalYear', async () => {
    const res = await request(app)
      .post('/api/reports/budgets')
      .send({ ...validBudget, fiscalYear: 1999 });

    expect(res.status).toBe(400);
  });
});

describe('PUT /api/reports/budgets/:id', () => {
  it('should update a budget', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue({
      id: 'f3000000-0000-4000-a000-000000000001',
      actualAmount: 5000,
    });
    mockPrisma.finBudget.update.mockResolvedValue({
      id: 'f3000000-0000-4000-a000-000000000001',
      budgetAmount: 15000,
      variance: 10000,
      account: {
        id: 'f2000000-0000-4000-a000-000000000001',
        code: '5100',
        name: 'Marketing',
        type: 'EXPENSE',
      },
    });

    const res = await request(app)
      .put('/api/reports/budgets/00000000-0000-0000-0000-000000000001')
      .send({ budgetAmount: 15000 });

    expect(res.status).toBe(200);
    expect(res.body.data.budgetAmount).toBe(15000);
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue(null);

    const res = await request(app)
      .put('/api/reports/budgets/00000000-0000-0000-0000-000000000099')
      .send({ budgetAmount: 5000 });

    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/reports/budgets/:id', () => {
  it('should soft delete a budget', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue({
      id: 'f3000000-0000-4000-a000-000000000001',
    });
    mockPrisma.finBudget.update.mockResolvedValue({
      id: 'f3000000-0000-4000-a000-000000000001',
    });

    const res = await request(app).delete(
      '/api/reports/budgets/00000000-0000-0000-0000-000000000001'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.message).toContain('deleted');
  });

  it('should return 404 when not found', async () => {
    mockPrisma.finBudget.findUnique.mockResolvedValue(null);

    const res = await request(app).delete(
      '/api/reports/budgets/00000000-0000-0000-0000-000000000099'
    );

    expect(res.status).toBe(404);
  });
});

// ===================================================================
// BUDGET vs ACTUAL REPORT
// ===================================================================

describe('GET /api/reports/budget-vs-actual', () => {
  it('should return budget vs actual grouped by account', async () => {
    const budgets = [
      {
        id: 'f3000000-0000-4000-a000-000000000001',
        accountId: 'f2000000-0000-4000-a000-000000000001',
        month: 1,
        quarter: 1,
        budgetAmount: 10000,
        actualAmount: 8000,
        variance: 2000,
        account: {
          id: 'f2000000-0000-4000-a000-000000000001',
          code: '5100',
          name: 'Marketing',
          type: 'EXPENSE',
        },
      },
      {
        id: 'f3000000-0000-4000-a000-000000000002',
        accountId: 'f2000000-0000-4000-a000-000000000001',
        month: 2,
        quarter: 1,
        budgetAmount: 10000,
        actualAmount: 12000,
        variance: -2000,
        account: {
          id: 'f2000000-0000-4000-a000-000000000001',
          code: '5100',
          name: 'Marketing',
          type: 'EXPENSE',
        },
      },
    ];
    mockPrisma.finBudget.findMany.mockResolvedValue(budgets);

    const res = await request(app).get('/api/reports/budget-vs-actual?fiscalYear=2026');

    expect(res.status).toBe(200);
    expect(res.body.data.fiscalYear).toBe(2026);
    expect(res.body.data.accounts).toHaveLength(1);
    expect(res.body.data.accounts[0].months).toHaveLength(2);
    expect(res.body.data.accounts[0].totalBudget).toBe(20000);
    expect(res.body.data.accounts[0].totalActual).toBe(20000);
  });

  it('should use current year when fiscalYear not provided', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/budget-vs-actual');

    expect(res.status).toBe(200);
    expect(res.body.data.fiscalYear).toBe(new Date().getFullYear());
  });

  it('should return empty when no budgets exist', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/budget-vs-actual?fiscalYear=2026');

    expect(res.status).toBe(200);
    expect(res.body.data.accounts).toHaveLength(0);
  });
});

// ===================================================================
// REVENUE BREAKDOWN
// ===================================================================

describe('GET /api/reports/revenue-breakdown', () => {
  it('should return revenue grouped by customer', async () => {
    const invoices = [
      {
        id: 'f6000000-0000-4000-a000-000000000001',
        customerId: 'f4000000-0000-4000-a000-000000000001',
        amountPaid: 5000,
        customer: { id: 'f4000000-0000-4000-a000-000000000001', name: 'Acme Corp', code: 'C001' },
      },
      {
        id: 'f6000000-0000-4000-a000-000000000002',
        customerId: 'f4000000-0000-4000-a000-000000000001',
        amountPaid: 3000,
        customer: { id: 'f4000000-0000-4000-a000-000000000001', name: 'Acme Corp', code: 'C001' },
      },
      {
        id: 'f6000000-0000-4000-a000-000000000003',
        customerId: 'f4000000-0000-4000-a000-000000000002',
        amountPaid: 7000,
        customer: { id: 'f4000000-0000-4000-a000-000000000002', name: 'Beta Inc', code: 'C002' },
      },
    ];
    mockPrisma.finInvoice.findMany.mockResolvedValue(invoices);

    const res = await request(app).get('/api/reports/revenue-breakdown');

    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(15000);
    expect(res.body.data.invoiceCount).toBe(3);
    expect(res.body.data.byCustomer).toHaveLength(2);
    // Sorted by total desc: Beta (7000) first, Acme (8000) first
    expect(res.body.data.byCustomer[0].total).toBe(8000);
  });

  it('should filter by date range', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/reports/revenue-breakdown?dateFrom=2026-01-01&dateTo=2026-03-31'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finInvoice.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/revenue-breakdown');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// EXPENSE BREAKDOWN
// ===================================================================

describe('GET /api/reports/expense-breakdown', () => {
  it('should return expenses grouped by supplier', async () => {
    const bills = [
      {
        id: 'f7200000-0000-4000-a000-000000000001',
        supplierId: 'f7000000-0000-4000-a000-000000000001',
        amountPaid: 3000,
        supplier: { id: 'f7000000-0000-4000-a000-000000000001', name: 'Widget Co', code: 'S001' },
      },
      {
        id: 'f7200000-0000-4000-a000-000000000002',
        supplierId: 'f7000000-0000-4000-a000-000000000002',
        amountPaid: 5000,
        supplier: { id: 'f7000000-0000-4000-a000-000000000002', name: 'Gear Inc', code: 'S002' },
      },
    ];
    mockPrisma.finBill.findMany.mockResolvedValue(bills);

    const res = await request(app).get('/api/reports/expense-breakdown');

    expect(res.status).toBe(200);
    expect(res.body.data.totalExpenses).toBe(8000);
    expect(res.body.data.billCount).toBe(2);
    expect(res.body.data.bySupplier).toHaveLength(2);
  });

  it('should filter by date range', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get(
      '/api/reports/expense-breakdown?dateFrom=2026-01-01&dateTo=2026-03-31'
    );

    expect(res.status).toBe(200);
    expect(res.body.data.totalExpenses).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finBill.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/expense-breakdown');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// CASH FORECAST
// ===================================================================

describe('GET /api/reports/cash-forecast', () => {
  it('should return cash forecast with projected cash', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 50000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { dueDate: new Date('2026-02-15'), amountDue: 10000 },
      { dueDate: new Date('2026-03-01'), amountDue: 5000 },
    ]);
    mockPrisma.finBill.findMany.mockResolvedValue([
      { dueDate: new Date('2026-02-20'), amountDue: 8000 },
    ]);

    const res = await request(app).get('/api/reports/cash-forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.currentCash).toBe(50000);
    expect(res.body.data.totalExpectedInflows).toBe(15000);
    expect(res.body.data.totalExpectedOutflows).toBe(8000);
    expect(res.body.data.projectedCash).toBe(57000);
    expect(res.body.data.forecastMonths).toBe(3);
  });

  it('should accept custom months parameter', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 50000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/cash-forecast?months=6');

    expect(res.status).toBe(200);
    expect(res.body.data.forecastMonths).toBe(6);
  });

  it('should cap months at 12', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 50000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/cash-forecast?months=24');

    expect(res.status).toBe(200);
    expect(res.body.data.forecastMonths).toBe(12);
  });

  it('should handle null bank account balance', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: null } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/cash-forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.currentCash).toBe(0);
    expect(res.body.data.projectedCash).toBe(0);
  });

  it('should return 500 on error', async () => {
    mockPrisma.finBankAccount.aggregate.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/cash-forecast');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// ADDITIONAL COVERAGE
// ===================================================================

describe('GET /api/reports/budgets — additional', () => {
  it('should filter by status when provided', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);

    const res = await request(app).get('/api/reports/budgets?status=ACTIVE');

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.finBudget.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/budgets');

    expect(res.status).toBe(500);
  });

  it('should return correct totalPages in pagination', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(55);

    const res = await request(app).get('/api/reports/budgets?page=1&limit=10');

    expect(res.status).toBe(200);
    expect(res.body.pagination.totalPages).toBe(6);
  });
});
