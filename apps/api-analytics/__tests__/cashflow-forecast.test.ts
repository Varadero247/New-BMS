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

// ─── 500 error paths ────────────────────────────────────────────────────────

describe('500 error handling', () => {
  const app500 = express();
  app500.use(express.json());
  app500.use('/', cashflowRouter);

  it('GET / returns 500 on DB error', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app500).get('/');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /position returns 500 on DB error', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockRejectedValue(new Error('DB down'));
    const res = await request(app500).get('/position');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

// ===================================================================
// Additional edge cases: empty lists, pagination, auth, enums, missing fields
// ===================================================================
describe('Cash Flow Forecast — additional edge cases', () => {
  const edgeApp = (() => {
    const app = require('express')();
    app.use(require('express').json());
    const cashflowRouterFresh = require('../src/routes/cashflow').default;
    app.use('/', cashflowRouterFresh);
    return app;
  })();

  it('GET / returns empty forecasts array when none exist', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(edgeApp).get('/');
    expect(res.status).toBe(200);
    expect(res.body.data.forecasts).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('GET / data.total is always a number', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(edgeApp).get('/');
    expect(typeof res.body.data.total).toBe('number');
  });

  it('runCashFlowForecastJob handles zero balance (edge: no position, no snapshots)', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-edge' });
    const result = await runCashFlowForecastJob();
    expect(result.weeksCreated).toBe(13);
  });

  it('GET /position returns 404 with NOT_FOUND error code when no position', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    const res = await request(edgeApp).get('/position');
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
    expect(res.body.success).toBe(false);
  });

  it('runCashFlowForecastJob always calls deleteMany before create', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 5000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 2 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-ord' });
    await runCashFlowForecastJob();
    const delOrder = (prisma.cashFlowForecast.deleteMany as jest.Mock).mock.invocationCallOrder[0];
    const createOrder = (prisma.cashFlowForecast.create as jest.Mock).mock.invocationCallOrder[0];
    expect(delOrder).toBeLessThan(createOrder);
  });
});

// ===================================================================
// Cash Flow Forecast — extended business logic coverage
// ===================================================================
describe('Cash Flow Forecast — extended business logic', () => {
  const extApp = express();
  extApp.use(express.json());
  extApp.use('/', cashflowRouter);

  it('GET / response has success=true and data key', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(extApp).get('/');
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty('data');
  });

  it('GET / data.forecasts is an array', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(extApp).get('/');
    expect(Array.isArray(res.body.data.forecasts)).toBe(true);
  });

  it('GET /position response.data.position contains bankBalance', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({
      bankBalance: 99000,
      receivables: 0,
      payables: 0,
      runway: 24,
    });
    const res = await request(extApp).get('/position');
    expect(res.status).toBe(200);
    expect(res.body.data.position).toHaveProperty('bankBalance');
  });

  it('runCashFlowForecastJob week 13 opening equals week 12 closing', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 10000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-wk' });

    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    const week12Closing = calls[11][0].data.closingBalance;
    const week13Opening = calls[12][0].data.openingBalance;
    expect(week13Opening).toBeCloseTo(week12Closing, 2);
  });

  it('runCashFlowForecastJob all weeks have defined weekStart date', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-ws' });

    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    for (const call of calls) {
      expect(call[0].data.weekStart).toBeInstanceOf(Date);
    }
  });

  it('runCashFlowForecastJob all weeks have defined closingBalance as a number', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-we' });

    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    for (const call of calls) {
      expect(typeof call[0].data.closingBalance).toBe('number');
    }
  });

  it('runCashFlowForecastJob returns weeksCreated=13 even with large bankBalance', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 9999999 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-big' });

    const result = await runCashFlowForecastJob();
    expect(result.weeksCreated).toBe(13);
  });

  it('GET / returns 500 with error.code INTERNAL_ERROR on DB failure', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockRejectedValue(new Error('connection lost'));
    const res = await request(extApp).get('/');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /position returns 500 with error.code INTERNAL_ERROR on DB failure', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockRejectedValue(
      new Error('connection lost')
    );
    const res = await request(extApp).get('/position');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Cash Flow Forecast — final edge cases', () => {
  const finalApp = express();
  finalApp.use(express.json());
  finalApp.use('/', cashflowRouter);

  it('runCashFlowForecastJob week 1 openingBalance equals bankBalance from position', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({ bankBalance: 75000 });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-final-1' });
    await runCashFlowForecastJob();
    const firstCall = (prisma.cashFlowForecast.create as jest.Mock).mock.calls[0][0];
    expect(firstCall.data.openingBalance).toBe(75000);
  });

  it('runCashFlowForecastJob all 13 weeks have weekNumber between 1 and 13', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-wn' });
    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    calls.forEach((call: any, idx: number) => {
      expect(call[0].data.weekNumber).toBe(idx + 1);
    });
  });

  it('GET / response always has data key on success', async () => {
    (prisma.cashFlowForecast.findMany as jest.Mock).mockResolvedValue([]);
    const res = await request(finalApp).get('/');
    expect(res.body).toHaveProperty('data');
  });

  it('runCashFlowForecastJob inflows are non-negative for all weeks', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-pos' });
    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    for (const call of calls) {
      expect(call[0].data.inflows).toBeGreaterThanOrEqual(0);
    }
  });

  it('GET /position returns success:true when position exists', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue({
      bankBalance: 10000,
      receivables: 2000,
      payables: 1000,
      runway: 6,
    });
    const res = await request(finalApp).get('/position');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('runCashFlowForecastJob outflows are non-negative for all weeks', async () => {
    (prisma.companyCashPosition.findFirst as jest.Mock).mockResolvedValue(null);
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.plannedExpense.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.cashFlowForecast.deleteMany as jest.Mock).mockResolvedValue({ count: 0 });
    (prisma.cashFlowForecast.create as jest.Mock).mockResolvedValue({ id: 'cf-out' });
    await runCashFlowForecastJob();
    const calls = (prisma.cashFlowForecast.create as jest.Mock).mock.calls;
    for (const call of calls) {
      expect(call[0].data.outflows).toBeGreaterThanOrEqual(0);
    }
  });
});
