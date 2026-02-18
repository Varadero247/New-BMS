jest.mock('../src/prisma', () => ({
  prisma: {
    companyCashPosition: { findFirst: jest.fn() },
    monthlySnapshot: { findMany: jest.fn() },
    plannedExpense: { findMany: jest.fn() },
    cashFlowForecast: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/auth', () => ({
  authenticate: (_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', email: 'a@b.com' };
    next();
  },
}));

import { runCashFlowForecastJob } from '../src/jobs/cashflow-forecast.job';
import { prisma } from '../src/prisma';
import express from 'express';
import request from 'supertest';
import cashflowRouter from '../src/routes/cashflow';

beforeEach(() => {
  jest.clearAllMocks();
});

// -----------------------------------------------------------------------
// Cash Flow Forecast Job Tests
// -----------------------------------------------------------------------
describe('runCashFlowForecastJob', () => {
  it('creates 13 weekly forecast records', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-1' });

    const result = await runCashFlowForecastJob();

    expect(result.weeksCreated).toBe(13);
    expect(prisma.cashFlowForecast.create).toHaveBeenCalledTimes(13);
  });

  it('uses cash position for opening balance when available', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 50000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-2' });

    await runCashFlowForecastJob();

    const firstCreate = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    expect(firstCreate.data.openingBalance).toBe(50000);
  });

  it('uses default opening balance when no cash position', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-3' });

    await runCashFlowForecastJob();

    const firstCreate = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    expect(firstCreate.data.openingBalance).toBe(30000); // default
  });

  it('calculates closing balance from opening + inflows - outflows', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 10000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-4' });

    await runCashFlowForecastJob();

    const firstCreate = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    const expected =
      firstCreate.data.openingBalance + firstCreate.data.inflows - firstCreate.data.outflows;
    expect(firstCreate.data.closingBalance).toBeCloseTo(expected, 2);
  });

  it('week 2 opening equals week 1 closing', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 20000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-5' });

    await runCashFlowForecastJob();

    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    const week1Closing = calls[0][0].data.closingBalance;
    const week2Opening = calls[1][0].data.openingBalance;
    expect(week2Opening).toBeCloseTo(week1Closing, 2);
  });

  it('clears existing forecasts before regenerating', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 5 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-6' });

    await runCashFlowForecastJob();

    expect(prisma.cashFlowForecast.deleteMany).toHaveBeenCalled();
    expect(prisma.cashFlowForecast.create).toHaveBeenCalled();
    // deleteMany is called first (order verified by mock call sequence)
    const deleteMockOrder = (prisma.cashFlowForecast.deleteMany as jest.Mock).mock
      .invocationCallOrder[0];
    const createMockOrder = (prisma.cashFlowForecast.create as jest.Mock).mock
      .invocationCallOrder[0];
    expect(deleteMockOrder).toBeLessThan(createMockOrder);
  });

  it('uses snapshot MRR for revenue estimate', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { mrr: 8660, monthNumber: 5 },
    ]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-7' });

    await runCashFlowForecastJob();

    const firstCreate = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    // 8660 / 4.33 = ~2000
    expect(firstCreate.data.inflows).toBeGreaterThan(1900);
    expect(firstCreate.data.inflows).toBeLessThan(2100);
  });

  it('uses planned expenses for outflow calculation', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([
      { amount: 1000, frequency: 'MONTHLY', isActive: true },
      { amount: 2600, frequency: 'QUARTERLY', isActive: true },
    ]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-8' });

    await runCashFlowForecastJob();

    const firstCreate = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    // 1000/4.33 + 2600/13 = ~231 + 200 = ~431
    expect(firstCreate.data.outflows).toBeGreaterThan(400);
    expect(firstCreate.data.outflows).toBeLessThan(500);
  });

  it('assigns incrementing week numbers', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-9' });

    await runCashFlowForecastJob();

    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    expect(calls[0][0].data.weekNumber).toBe(1);
    expect(calls[6][0].data.weekNumber).toBe(7);
    expect(calls[12][0].data.weekNumber).toBe(13);
  });
});

// -----------------------------------------------------------------------
// Cashflow Route Tests
// -----------------------------------------------------------------------
describe('GET /cashflow', () => {
  const app = express();
  app.use(express.json());
  app.use('/', cashflowRouter);

  it('lists forecasts ordered by weekStart', async () => {
    const mockForecasts = [
      { id: 'cf-a', weekNumber: 1, weekStart: '2026-02-16', openingBalance: 30000 },
      { id: 'cf-b', weekNumber: 2, weekStart: '2026-02-23', openingBalance: 31000 },
    ];
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue(mockForecasts);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forecasts).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
  });

  it('returns empty array when no forecasts exist', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.data.forecasts).toHaveLength(0);
  });
});

describe('GET /cashflow/position', () => {
  const app = express();
  app.use(express.json());
  app.use('/', cashflowRouter);

  it('returns latest cash position', async () => {
    const mockPosition = {
      id: 'pos-1',
      bankBalance: 45000,
      receivables: 5000,
      payables: 3000,
      runway: 12,
    };
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(mockPosition);

    const res = await request(app).get('/position');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position.bankBalance).toBe(45000);
  });

  it('returns 404 when no cash position exists', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);

    const res = await request(app).get('/position');

    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
  });
});
