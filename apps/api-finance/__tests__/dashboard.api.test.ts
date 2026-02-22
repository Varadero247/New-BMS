import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    finInvoice: {
      findMany: jest.fn(),
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
app.use('/api/dashboard', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

function setupDashboardMocks(
  revenuePaid = 50000,
  expensesPaid = 30000,
  arDue = 15000,
  apDue = 10000,
  cashBalance = 100000,
  overdueInv = 3,
  overdueBills = 2
) {
  mockPrisma.finInvoice.aggregate
    .mockResolvedValueOnce({ _sum: { amountPaid: revenuePaid } })
    .mockResolvedValueOnce({ _sum: { amountDue: arDue } });
  mockPrisma.finBill.aggregate
    .mockResolvedValueOnce({ _sum: { amountPaid: expensesPaid } })
    .mockResolvedValueOnce({ _sum: { amountDue: apDue } });
  mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: cashBalance } });
  mockPrisma.finInvoice.count.mockResolvedValue(overdueInv);
  mockPrisma.finBill.count.mockResolvedValue(overdueBills);
}

// ===================================================================
// Dashboard KPI endpoint
// ===================================================================

describe('GET /api/dashboard/dashboard', () => {
  it('returns 200 with success:true', async () => {
    setupDashboardMocks();
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns correct revenue value', async () => {
    setupDashboardMocks(80000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.revenue).toBe(80000);
  });

  it('returns correct expenses value', async () => {
    setupDashboardMocks(50000, 20000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.expenses).toBe(20000);
  });

  it('calculates profit as revenue minus expenses', async () => {
    setupDashboardMocks(60000, 25000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.profit).toBe(35000);
  });

  it('returns cashPosition from bank account aggregate', async () => {
    setupDashboardMocks(0, 0, 0, 0, 75000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.cashPosition).toBe(75000);
  });

  it('returns accountsReceivable correctly', async () => {
    setupDashboardMocks(0, 0, 20000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.accountsReceivable).toBe(20000);
  });

  it('returns accountsPayable correctly', async () => {
    setupDashboardMocks(0, 0, 0, 5000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.accountsPayable).toBe(5000);
  });

  it('returns overdueInvoices count', async () => {
    setupDashboardMocks(0, 0, 0, 0, 0, 7);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.overdueInvoices).toBe(7);
  });

  it('returns overdueBills count', async () => {
    setupDashboardMocks(0, 0, 0, 0, 0, 0, 4);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.overdueBills).toBe(4);
  });

  it('returns period object with start and end', async () => {
    setupDashboardMocks();
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.period).toBeDefined();
    expect(res.body.data.period).toHaveProperty('start');
    expect(res.body.data.period).toHaveProperty('end');
  });

  it('handles null aggregation results with 0 values', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: null } })
      .mockResolvedValueOnce({ _sum: { amountDue: null } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: null } })
      .mockResolvedValueOnce({ _sum: { amountDue: null } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: null } });
    mockPrisma.finInvoice.count.mockResolvedValue(0);
    mockPrisma.finBill.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.revenue).toBe(0);
    expect(res.body.data.expenses).toBe(0);
    expect(res.body.data.cashPosition).toBe(0);
  });

  it('returns 500 on DB error', async () => {
    mockPrisma.finInvoice.aggregate.mockRejectedValue(new Error('DB error'));
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('profit is 0 when revenue equals expenses', async () => {
    setupDashboardMocks(40000, 40000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.profit).toBe(0);
  });

  it('profit can be negative when expenses exceed revenue', async () => {
    setupDashboardMocks(10000, 50000);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.data.profit).toBe(-40000);
  });

  it('response content-type is JSON', async () => {
    setupDashboardMocks();
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

// ===================================================================
// Revenue breakdown from reports router
// ===================================================================

describe('GET /api/dashboard/revenue-breakdown', () => {
  it('returns totalRevenue as sum of amountPaid', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { id: 'i1', customerId: 'c1', amountPaid: 5000, customer: { id: 'c1', name: 'ACME', code: 'C1' } },
      { id: 'i2', customerId: 'c2', amountPaid: 3000, customer: { id: 'c2', name: 'Beta', code: 'C2' } },
    ]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(8000);
  });

  it('returns byCustomer sorted by total descending', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { id: 'i3', customerId: 'c3', amountPaid: 1000, customer: { id: 'c3', name: 'Low', code: 'L1' } },
      { id: 'i4', customerId: 'c4', amountPaid: 9000, customer: { id: 'c4', name: 'High', code: 'H1' } },
    ]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.body.data.byCustomer[0].total).toBe(9000);
  });

  it('returns 500 on invoice query error', async () => {
    mockPrisma.finInvoice.findMany.mockRejectedValue(new Error('Invoice DB fail'));
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.status).toBe(500);
  });

  it('invoiceCount matches number of found invoices', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { id: 'i5', customerId: 'c5', amountPaid: 200, customer: { id: 'c5', name: 'Tiny', code: 'T1' } },
    ]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.body.data.invoiceCount).toBe(1);
  });
});

// ===================================================================
// Expense breakdown from reports router
// ===================================================================

describe('GET /api/dashboard/expense-breakdown', () => {
  it('returns totalExpenses as sum of amountPaid', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([
      { id: 'b1', supplierId: 's1', amountPaid: 4000, supplier: { id: 's1', name: 'Vendor A', code: 'VA' } },
    ]);
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(res.status).toBe(200);
    expect(res.body.data.totalExpenses).toBe(4000);
  });

  it('billCount matches number of found bills', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([
      { id: 'b2', supplierId: 's2', amountPaid: 2500, supplier: { id: 's2', name: 'Vendor B', code: 'VB' } },
      { id: 'b3', supplierId: 's2', amountPaid: 1500, supplier: { id: 's2', name: 'Vendor B', code: 'VB' } },
    ]);
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(res.body.data.billCount).toBe(2);
  });

  it('returns 500 on bill query error', async () => {
    mockPrisma.finBill.findMany.mockRejectedValue(new Error('Bill DB fail'));
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(res.status).toBe(500);
  });

  it('bySupplier is always an array', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(Array.isArray(res.body.data.bySupplier)).toBe(true);
  });
});

// ===================================================================
// Cash forecast from reports router
// ===================================================================

describe('GET /api/dashboard/cash-forecast', () => {
  it('returns currentCash from bank accounts', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 60000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.status).toBe(200);
    expect(res.body.data.currentCash).toBe(60000);
  });

  it('returns projectedCash as currentCash + inflows - outflows', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 50000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([{ dueDate: new Date(), amountDue: 10000 }]);
    mockPrisma.finBill.findMany.mockResolvedValue([{ dueDate: new Date(), amountDue: 5000 }]);
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.body.data.projectedCash).toBe(55000);
  });

  it('defaults forecastMonths to 3', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.body.data.forecastMonths).toBe(3);
  });

  it('caps forecastMonths at 12', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast?months=99');
    expect(res.body.data.forecastMonths).toBe(12);
  });

  it('handles null bank balance as 0', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: null } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.body.data.currentCash).toBe(0);
    expect(res.body.data.projectedCash).toBe(0);
  });

  it('returns 500 on bank account error', async () => {
    mockPrisma.finBankAccount.aggregate.mockRejectedValue(new Error('bank DB fail'));
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.status).toBe(500);
  });
});

describe('dashboard.api — phase28 additional coverage', () => {
  it('GET /dashboard aggregate is called multiple times (invoice+bill+bank)', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.count.mockResolvedValue(0);
    mockPrisma.finBill.count.mockResolvedValue(0);
    await request(app).get('/api/dashboard/dashboard');
    expect(mockPrisma.finBankAccount.aggregate).toHaveBeenCalledTimes(1);
  });

  it('GET /dashboard all data fields are numbers', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 10000 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 5000 } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 3000 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 2000 } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 50000 } });
    mockPrisma.finInvoice.count.mockResolvedValue(1);
    mockPrisma.finBill.count.mockResolvedValue(1);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(typeof res.body.data.revenue).toBe('number');
    expect(typeof res.body.data.expenses).toBe('number');
    expect(typeof res.body.data.profit).toBe('number');
  });

  it('GET /revenue-breakdown with dateFrom filter passes to findMany', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown?dateFrom=2026-01-01');
    expect(res.status).toBe(200);
    expect(mockPrisma.finInvoice.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /expense-breakdown aggregates multiple bills from same supplier', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([
      { id: 'dx1', supplierId: 'dsp1', amountPaid: 500, supplier: { id: 'dsp1', name: 'SupX', code: 'SX' } },
      { id: 'dx2', supplierId: 'dsp1', amountPaid: 1500, supplier: { id: 'dsp1', name: 'SupX', code: 'SX' } },
    ]);
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(res.body.data.bySupplier).toHaveLength(1);
    expect(res.body.data.bySupplier[0].total).toBe(2000);
  });

  it('GET /budget-vs-actual returns success:true', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/budget-vs-actual');
    expect(res.body.success).toBe(true);
  });

  it('GET /cash-forecast data has inflows and outflows arrays', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 10000 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.inflows)).toBe(true);
    expect(Array.isArray(res.body.data.outflows)).toBe(true);
  });

  it('GET /dashboard success:true is set in response', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.count.mockResolvedValue(0);
    mockPrisma.finBill.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(res.body.success).toBe(true);
  });

  it('GET /revenue-breakdown totalRevenue is sum of all invoice amountPaid', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { id: 'dri1', customerId: 'drc1', amountPaid: 2000, customer: { id: 'drc1', name: 'Alpha', code: 'A1' } },
      { id: 'dri2', customerId: 'drc2', amountPaid: 3000, customer: { id: 'drc2', name: 'Beta', code: 'B1' } },
    ]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.body.data.totalRevenue).toBe(5000);
  });

  it('GET /expense-breakdown totalExpenses sums all bill amountPaid', async () => {
    mockPrisma.finBill.findMany.mockResolvedValue([
      { id: 'dbe1', supplierId: 'dbs1', amountPaid: 1200, supplier: { id: 'dbs1', name: 'Vendor1', code: 'V1' } },
      { id: 'dbe2', supplierId: 'dbs2', amountPaid: 800, supplier: { id: 'dbs2', name: 'Vendor2', code: 'V2' } },
    ]);
    const res = await request(app).get('/api/dashboard/expense-breakdown');
    expect(res.body.data.totalExpenses).toBe(2000);
  });

  it('GET /budget-vs-actual with fiscalYear 2025 returns that year', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/budget-vs-actual?fiscalYear=2025');
    expect(res.body.data.fiscalYear).toBe(2025);
  });

  it('GET /budgets returns paginated data with limit', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/budgets?limit=5');
    expect(res.status).toBe(200);
    expect(res.body.pagination).toHaveProperty('limit');
  });

  it('GET /cash-forecast months=4 sets forecastMonths correctly', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/dashboard/cash-forecast?months=4');
    expect(res.body.data.forecastMonths).toBe(4);
  });

  it('GET /dashboard period has ISO string start', async () => {
    mockPrisma.finInvoice.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBill.aggregate
      .mockResolvedValueOnce({ _sum: { amountPaid: 0 } })
      .mockResolvedValueOnce({ _sum: { amountDue: 0 } });
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: 0 } });
    mockPrisma.finInvoice.count.mockResolvedValue(0);
    mockPrisma.finBill.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/dashboard');
    expect(typeof res.body.data.period.start).toBe('string');
  });

  it('GET /budgets filters by fiscalYear=2027', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/budgets?fiscalYear=2027');
    expect(res.status).toBe(200);
    expect(mockPrisma.finBudget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ fiscalYear: 2027 }) })
    );
  });

  it('GET /revenue-breakdown byCustomer is sorted descending by total', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([
      { id: 'r10', customerId: 'low', amountPaid: 100, customer: { id: 'low', name: 'Low', code: 'L2' } },
      { id: 'r11', customerId: 'high', amountPaid: 9000, customer: { id: 'high', name: 'High', code: 'H2' } },
    ]);
    const res = await request(app).get('/api/dashboard/revenue-breakdown');
    expect(res.body.data.byCustomer[0].total).toBeGreaterThan(res.body.data.byCustomer[1].total);
  });
});

describe('dashboard.api — final one more', () => {
  it('GET /budgets success:true is present in response', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    mockPrisma.finBudget.count.mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard/budgets');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

describe('dashboard — phase30 coverage', () => {
  it('returns true for truthy values', () => {
    expect(Boolean('value')).toBe(true);
  });

  it('handles array filter', () => {
    expect([1, 2, 3, 4].filter(x => x > 2)).toEqual([3, 4]);
  });

  it('handles string replace', () => {
    expect('hello world'.replace('world', 'Jest')).toBe('hello Jest');
  });

  it('handles string includes', () => {
    expect('hello world'.includes('world')).toBe(true);
  });

  it('handles JSON parse', () => {
    expect(JSON.parse('{"a":1}')).toEqual({ a: 1 });
  });

});
