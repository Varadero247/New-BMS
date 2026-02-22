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
app.use('/api/forecasts', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

function setupCashForecastMocks(
  currentBalance = 50000,
  inflows: { dueDate: Date; amountDue: number }[] = [],
  outflows: { dueDate: Date; amountDue: number }[] = []
) {
  mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance } });
  mockPrisma.finInvoice.findMany.mockResolvedValue(inflows as any);
  mockPrisma.finBill.findMany.mockResolvedValue(outflows as any);
}

// ===================================================================
// Cash Forecast
// ===================================================================

describe('GET /api/forecasts/cash-forecast — basic', () => {
  it('returns 200 with success:true', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns currentCash from bank account aggregate', async () => {
    setupCashForecastMocks(75000);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.currentCash).toBe(75000);
  });

  it('defaults forecastMonths to 3 when not specified', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.forecastMonths).toBe(3);
  });

  it('accepts months=6 and returns forecastMonths=6', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast?months=6');
    expect(res.body.data.forecastMonths).toBe(6);
  });

  it('accepts months=1 and returns forecastMonths=1', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast?months=1');
    expect(res.body.data.forecastMonths).toBe(1);
  });

  it('caps months at 12 when exceeding maximum', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast?months=50');
    expect(res.body.data.forecastMonths).toBe(12);
  });

  it('returns 500 on bank account aggregate error', async () => {
    mockPrisma.finBankAccount.aggregate.mockRejectedValue(new Error('DB down'));
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('handles null bank balance as 0', async () => {
    mockPrisma.finBankAccount.aggregate.mockResolvedValue({ _sum: { currentBalance: null } });
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    mockPrisma.finBill.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.currentCash).toBe(0);
  });

  it('returns content-type JSON', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.headers['content-type']).toMatch(/json/);
  });
});

describe('GET /api/forecasts/cash-forecast — inflows and outflows', () => {
  it('totalExpectedInflows sums all inflow amounts', async () => {
    setupCashForecastMocks(0, [
      { dueDate: new Date(), amountDue: 5000 },
      { dueDate: new Date(), amountDue: 3000 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.totalExpectedInflows).toBe(8000);
  });

  it('totalExpectedOutflows sums all outflow amounts', async () => {
    setupCashForecastMocks(0, [], [
      { dueDate: new Date(), amountDue: 2000 },
      { dueDate: new Date(), amountDue: 1500 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.totalExpectedOutflows).toBe(3500);
  });

  it('projectedCash = currentCash + inflows - outflows', async () => {
    setupCashForecastMocks(50000, [
      { dueDate: new Date(), amountDue: 10000 },
    ], [
      { dueDate: new Date(), amountDue: 7000 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.projectedCash).toBe(53000);
  });

  it('projectedCash equals currentCash when no inflows or outflows', async () => {
    setupCashForecastMocks(20000, [], []);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.projectedCash).toBe(20000);
  });

  it('inflows array is returned in response', async () => {
    setupCashForecastMocks(0, [{ dueDate: new Date('2026-03-01'), amountDue: 1000 }]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(Array.isArray(res.body.data.inflows)).toBe(true);
    expect(res.body.data.inflows).toHaveLength(1);
  });

  it('outflows array is returned in response', async () => {
    setupCashForecastMocks(0, [], [{ dueDate: new Date('2026-03-15'), amountDue: 500 }]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(Array.isArray(res.body.data.outflows)).toBe(true);
    expect(res.body.data.outflows).toHaveLength(1);
  });

  it('inflows items have dueDate and amount fields', async () => {
    setupCashForecastMocks(0, [{ dueDate: new Date('2026-04-01'), amountDue: 2500 }]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.inflows[0]).toHaveProperty('dueDate');
    expect(res.body.data.inflows[0]).toHaveProperty('amount');
  });

  it('outflows items have dueDate and amount fields', async () => {
    setupCashForecastMocks(0, [], [{ dueDate: new Date('2026-04-15'), amountDue: 800 }]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.outflows[0]).toHaveProperty('dueDate');
    expect(res.body.data.outflows[0]).toHaveProperty('amount');
  });

  it('returns empty inflows and outflows when none exist', async () => {
    setupCashForecastMocks(30000, [], []);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.inflows).toHaveLength(0);
    expect(res.body.data.outflows).toHaveLength(0);
  });

  it('totalExpectedInflows is 0 when no inflows', async () => {
    setupCashForecastMocks(10000, [], []);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.totalExpectedInflows).toBe(0);
  });

  it('totalExpectedOutflows is 0 when no outflows', async () => {
    setupCashForecastMocks(10000, [], []);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.totalExpectedOutflows).toBe(0);
  });
});

// ===================================================================
// Budget vs Actual (related forecast report)
// ===================================================================

describe('GET /api/forecasts/budget-vs-actual', () => {
  it('returns 200 with fiscalYear in data', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/budget-vs-actual?fiscalYear=2026');
    expect(res.status).toBe(200);
    expect(res.body.data.fiscalYear).toBe(2026);
  });

  it('returns empty accounts array when no budgets', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/budget-vs-actual?fiscalYear=2026');
    expect(res.body.data.accounts).toHaveLength(0);
  });

  it('defaults to current year when no fiscalYear param provided', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/budget-vs-actual');
    expect(res.body.data.fiscalYear).toBe(new Date().getFullYear());
  });

  it('returns 500 on DB error', async () => {
    mockPrisma.finBudget.findMany.mockRejectedValue(new Error('DB fail'));
    const res = await request(app).get('/api/forecasts/budget-vs-actual');
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// Revenue Breakdown (related forecast)
// ===================================================================

describe('GET /api/forecasts/revenue-breakdown', () => {
  it('returns totalRevenue of 0 when no invoices', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/revenue-breakdown');
    expect(res.status).toBe(200);
    expect(res.body.data.totalRevenue).toBe(0);
  });

  it('returns byCustomer as array', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/revenue-breakdown');
    expect(Array.isArray(res.body.data.byCustomer)).toBe(true);
  });

  it('returns 500 on invoice DB error', async () => {
    mockPrisma.finInvoice.findMany.mockRejectedValue(new Error('Invoice fail'));
    const res = await request(app).get('/api/forecasts/revenue-breakdown');
    expect(res.status).toBe(500);
  });
});

// ===================================================================
// Phase28 additional coverage
// ===================================================================

describe('forecasts.api — phase28 coverage', () => {
  it('GET /cash-forecast aggregate called once per request', async () => {
    setupCashForecastMocks();
    await request(app).get('/api/forecasts/cash-forecast');
    expect(mockPrisma.finBankAccount.aggregate).toHaveBeenCalledTimes(1);
  });

  it('GET /cash-forecast projectedCash can be negative', async () => {
    setupCashForecastMocks(1000, [], [
      { dueDate: new Date(), amountDue: 5000 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.projectedCash).toBe(-4000);
  });

  it('GET /cash-forecast response has success:true', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.success).toBe(true);
  });

  it('GET /cash-forecast inflows findMany called once', async () => {
    setupCashForecastMocks();
    await request(app).get('/api/forecasts/cash-forecast');
    expect(mockPrisma.finInvoice.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /cash-forecast outflows finBill.findMany called once', async () => {
    setupCashForecastMocks();
    await request(app).get('/api/forecasts/cash-forecast');
    expect(mockPrisma.finBill.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('forecasts.api — phase28 additional coverage part 2', () => {
  it('GET /cash-forecast totalExpectedInflows + totalExpectedOutflows are numeric', async () => {
    setupCashForecastMocks(20000, [
      { dueDate: new Date(), amountDue: 1000 },
    ], [
      { dueDate: new Date(), amountDue: 500 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(typeof res.body.data.totalExpectedInflows).toBe('number');
    expect(typeof res.body.data.totalExpectedOutflows).toBe('number');
  });

  it('GET /cash-forecast with months=12 returns forecastMonths=12', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast?months=12');
    expect(res.body.data.forecastMonths).toBe(12);
  });

  it('GET /budget-vs-actual findMany called with fiscalYear filter', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    await request(app).get('/api/forecasts/budget-vs-actual?fiscalYear=2026');
    expect(mockPrisma.finBudget.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ fiscalYear: 2026 }) })
    );
  });

  it('GET /budget-vs-actual returns accounts array', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/budget-vs-actual');
    expect(Array.isArray(res.body.data.accounts)).toBe(true);
  });

  it('GET /cash-forecast inflows array items have amount field', async () => {
    setupCashForecastMocks(0, [
      { dueDate: new Date('2026-05-01'), amountDue: 3500 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.inflows[0].amount).toBe(3500);
  });

  it('GET /cash-forecast outflows array items have amount field', async () => {
    setupCashForecastMocks(0, [], [
      { dueDate: new Date('2026-05-15'), amountDue: 1750 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.outflows[0].amount).toBe(1750);
  });

  it('GET /cash-forecast projectedCash equals currentCash when no inflows and no outflows', async () => {
    setupCashForecastMocks(99000, [], []);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.projectedCash).toBe(99000);
  });

  it('GET /revenue-breakdown invokes finInvoice.findMany once', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    await request(app).get('/api/forecasts/revenue-breakdown');
    expect(mockPrisma.finInvoice.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /budget-vs-actual with 2 budgets for same account returns single account entry', async () => {
    mockPrisma.finBudget.findMany.mockResolvedValue([
      { id: 'fb1', accountId: 'fa1', month: 1, quarter: 1, budgetAmount: 5000, actualAmount: 4500, variance: 500, account: { id: 'fa1', code: '4000', name: 'Sales', type: 'REVENUE' } },
      { id: 'fb2', accountId: 'fa1', month: 2, quarter: 1, budgetAmount: 5000, actualAmount: 5200, variance: -200, account: { id: 'fa1', code: '4000', name: 'Sales', type: 'REVENUE' } },
    ]);
    const res = await request(app).get('/api/forecasts/budget-vs-actual?fiscalYear=2026');
    expect(res.body.data.accounts).toHaveLength(1);
    expect(res.body.data.accounts[0].months).toHaveLength(2);
  });

  it('GET /revenue-breakdown data has success:true', async () => {
    mockPrisma.finInvoice.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/forecasts/revenue-breakdown');
    expect(res.body.success).toBe(true);
  });

  it('GET /cash-forecast multiple inflows are summed correctly', async () => {
    setupCashForecastMocks(0, [
      { dueDate: new Date(), amountDue: 2000 },
      { dueDate: new Date(), amountDue: 3000 },
      { dueDate: new Date(), amountDue: 1000 },
    ]);
    const res = await request(app).get('/api/forecasts/cash-forecast');
    expect(res.body.data.totalExpectedInflows).toBe(6000);
  });

  it('GET /budget-vs-actual 500 on DB error has success:false', async () => {
    mockPrisma.finBudget.findMany.mockRejectedValue(new Error('crash'));
    const res = await request(app).get('/api/forecasts/budget-vs-actual');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /cash-forecast months=2 sets forecastMonths=2', async () => {
    setupCashForecastMocks();
    const res = await request(app).get('/api/forecasts/cash-forecast?months=2');
    expect(res.body.data.forecastMonths).toBe(2);
  });
});
