import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    cashFlowForecast: {
      findMany: jest.fn(),
    },
    companyCashPosition: {
      findFirst: jest.fn(),
    },
  },
  Prisma: {},
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/cashflow';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/cashflow', router);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/cashflow — List cash flow forecasts
// ===================================================================
describe('GET /api/cashflow', () => {
  it('should return a list of cash flow forecasts', async () => {
    const forecasts = [
      { id: 'cf-1', weekStart: new Date('2026-01-05'), inflow: 50000, outflow: 30000 },
      { id: 'cf-2', weekStart: new Date('2026-01-12'), inflow: 60000, outflow: 40000 },
    ];
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue(forecasts);

    const res = await request(app).get('/api/cashflow');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forecasts).toHaveLength(2);
    expect(res.body.data.total).toBe(2);
  });

  it('should return an empty list when no forecasts exist', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/cashflow');

    expect(res.status).toBe(200);
    expect(res.body.data.forecasts).toHaveLength(0);
    expect(res.body.data.total).toBe(0);
  });

  it('should handle server errors', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/cashflow');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('response data has forecasts and total keys', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([
      { id: 'cf-3', weekStart: new Date(), inflow: 10000, outflow: 5000 },
    ]);
    const res = await request(app).get('/api/cashflow');
    expect(res.body.data).toHaveProperty('forecasts');
    expect(res.body.data).toHaveProperty('total');
  });

  it('findMany is called once per request', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(mockPrisma.cashFlowForecast.findMany).toHaveBeenCalledTimes(1);
  });
});

// ===================================================================
// GET /api/cashflow/position — Latest cash position
// ===================================================================
describe('GET /api/cashflow/position', () => {
  it('should return the latest cash position', async () => {
    const position = { id: 'pos-1', date: new Date(), balance: 250000, currency: 'USD' };
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(position);

    const res = await request(app).get('/api/cashflow/position');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position.id).toBe('pos-1');
  });

  it('should return 404 when no cash position data exists', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(null);

    const res = await request(app).get('/api/cashflow/position');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('should handle server errors', async () => {
    mockPrisma.companyCashPosition.findFirst.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/cashflow/position');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('position response includes balance and currency fields', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-2',
      date: new Date(),
      balance: 500000,
      currency: 'GBP',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(200);
    expect(res.body.data.position.balance).toBe(500000);
    expect(res.body.data.position.currency).toBe('GBP');
  });

  it('findFirst is called once per position request', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-3',
      date: new Date(),
      balance: 0,
      currency: 'EUR',
    });
    await request(app).get('/api/cashflow/position');
    expect(mockPrisma.companyCashPosition.findFirst).toHaveBeenCalledTimes(1);
  });
});

describe('Cashflow — extended', () => {
  it('GET /api/cashflow success is false on 500', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/cashflow');
    expect(res.body.success).toBe(false);
  });

  it('GET /api/cashflow total is a number', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(typeof res.body.data.total).toBe('number');
  });

  it('GET /api/cashflow forecasts is an array', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(Array.isArray(res.body.data.forecasts)).toBe(true);
  });

  it('GET /api/cashflow/position success is false on 500', async () => {
    mockPrisma.companyCashPosition.findFirst.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/cashflow/position');
    expect(res.body.success).toBe(false);
  });

  it('GET /api/cashflow/position returns data.position object', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-4',
      date: new Date(),
      balance: 100,
      currency: 'USD',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.body.data.position).toBeDefined();
    expect(typeof res.body.data.position).toBe('object');
  });
});

// ===================================================================
// Additional edge cases: empty lists, pagination, auth, enums, missing fields
// ===================================================================
describe('Cashflow — additional edge cases', () => {
  it('GET /api/cashflow returns success:true with empty forecasts array', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forecasts).toEqual([]);
    expect(res.body.data.total).toBe(0);
  });

  it('GET /api/cashflow returns correct total for 13 weekly forecasts', async () => {
    const forecasts = Array.from({ length: 13 }, (_, i) => ({
      id: 'cf-wk-' + (i + 1),
      weekNumber: i + 1,
      weekStart: new Date(2026, 0, 5 + i * 7),
      inflow: 50000,
      outflow: 30000,
      openingBalance: 10000 + i * 1000,
      closingBalance: 30000 + i * 1000,
    }));
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue(forecasts);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(13);
    expect(res.body.data.forecasts).toHaveLength(13);
  });

  it('GET /api/cashflow/position returns INTERNAL_ERROR code on DB failure', async () => {
    mockPrisma.companyCashPosition.findFirst.mockRejectedValue(new Error('connection lost'));
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('authenticate middleware is invoked on every cashflow request', async () => {
    const authMod = require('@ims/auth');
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(authMod.authenticate).toHaveBeenCalled();
  });

  it('GET /api/cashflow/position NOT_FOUND includes success:false and error.code', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});

describe('cashflow.api — extended edge cases', () => {
  it('GET /api/cashflow findMany is called with take: 260', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(mockPrisma.cashFlowForecast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ take: 260 })
    );
  });

  it('GET /api/cashflow findMany is called with orderBy: { weekStart: "asc" }', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(mockPrisma.cashFlowForecast.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { weekStart: 'asc' } })
    );
  });

  it('GET /api/cashflow/position findFirst ordered by date desc', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-order',
      date: new Date(),
      balance: 100,
      currency: 'USD',
    });
    await request(app).get('/api/cashflow/position');
    expect(mockPrisma.companyCashPosition.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: { date: 'desc' } })
    );
  });

  it('GET /api/cashflow with single forecast returns total=1', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([
      { id: 'cf-only', weekStart: new Date(), inflow: 10000, outflow: 5000 },
    ]);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(1);
    expect(res.body.data.forecasts).toHaveLength(1);
  });

  it('GET /api/cashflow error response has success:false', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('timeout'));
    const res = await request(app).get('/api/cashflow');
    expect(res.body.success).toBe(false);
    expect(res.body.error).toBeDefined();
  });

  it('GET /api/cashflow/position success:true when position exists', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-ok',
      date: new Date(),
      balance: 99999,
      currency: 'USD',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.position.id).toBe('pos-ok');
  });

  it('GET /api/cashflow data structure always has forecasts and total keys', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(res.body.data).toHaveProperty('forecasts');
    expect(res.body.data).toHaveProperty('total');
  });

  it('GET /api/cashflow/position 404 response has error.message field', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toBeDefined();
    expect(typeof res.body.error.message).toBe('string');
  });
});

describe('cashflow.api — final coverage', () => {
  it('GET /api/cashflow returns success:true on empty result', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(res.body.success).toBe(true);
  });

  it('GET /api/cashflow result forecasts have correct length for 5 items', async () => {
    const items = Array.from({ length: 5 }, (_, i) => ({
      id: `cf-final-${i}`,
      weekStart: new Date(),
      inflow: 1000 * (i + 1),
      outflow: 500 * (i + 1),
    }));
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue(items);
    const res = await request(app).get('/api/cashflow');
    expect(res.body.data.forecasts).toHaveLength(5);
    expect(res.body.data.total).toBe(5);
  });

  it('GET /api/cashflow/position findFirst receives orderBy argument', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-x',
      date: new Date(),
      balance: 1,
      currency: 'USD',
    });
    await request(app).get('/api/cashflow/position');
    expect(mockPrisma.companyCashPosition.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({ orderBy: expect.anything() })
    );
  });

  it('GET /api/cashflow 500 response body has error property', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/cashflow');
    expect(res.body).toHaveProperty('error');
  });

  it('GET /api/cashflow findMany called once per request (idempotent)', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(mockPrisma.cashFlowForecast.findMany).toHaveBeenCalledTimes(1);
  });

  it('GET /api/cashflow/position 200 response body has data.position.id', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-id-check',
      date: new Date(),
      balance: 999,
      currency: 'USD',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(200);
    expect(res.body.data.position.id).toBe('pos-id-check');
  });

  it('GET /api/cashflow/position findFirst not called for /api/cashflow route', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    await request(app).get('/api/cashflow');
    expect(mockPrisma.companyCashPosition.findFirst).not.toHaveBeenCalled();
  });
});

describe('cashflow.api — extra coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/cashflow returns forecasts array that matches mocked data length', async () => {
    const items = [
      { id: 'cf-x1', weekStart: new Date(), inflow: 9000, outflow: 3000 },
      { id: 'cf-x2', weekStart: new Date(), inflow: 8000, outflow: 2500 },
      { id: 'cf-x3', weekStart: new Date(), inflow: 7000, outflow: 2000 },
    ];
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue(items);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.data.forecasts).toHaveLength(3);
    expect(res.body.data.total).toBe(3);
  });

  it('GET /api/cashflow/position data.position has id field', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'pos-extra-1',
      date: new Date(),
      balance: 150000,
      currency: 'USD',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(200);
    expect(res.body.data.position.id).toBe('pos-extra-1');
  });

  it('GET /api/cashflow error.code is INTERNAL_ERROR on 500', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('db fail'));
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('GET /api/cashflow/position success property is present in 404 response', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('success');
  });

  it('GET /api/cashflow success property is present in response body', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/cashflow');
    expect(res.body).toHaveProperty('success');
    expect(res.body.success).toBe(true);
  });
});

describe('cashflow.api.test.ts — phase28 coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /api/cashflow returns 200 and success:true with two forecasts', async () => {
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue([
      { id: 'ph28-cf-1', weekStart: new Date(), inflow: 5000, outflow: 2000 },
      { id: 'ph28-cf-2', weekStart: new Date(), inflow: 6000, outflow: 2500 },
    ]);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.forecasts).toHaveLength(2);
  });

  it('GET /api/cashflow/position returns data.position.balance as a number', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue({
      id: 'ph28-pos-1',
      date: new Date(),
      balance: 75000,
      currency: 'USD',
    });
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.position.balance).toBe('number');
  });

  it('GET /api/cashflow error body contains error.code INTERNAL_ERROR on DB failure', async () => {
    mockPrisma.cashFlowForecast.findMany.mockRejectedValue(new Error('network error'));
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
    expect(res.body.success).toBe(false);
  });

  it('GET /api/cashflow/position 404 response has success:false and error.code NOT_FOUND', async () => {
    mockPrisma.companyCashPosition.findFirst.mockResolvedValue(null);
    const res = await request(app).get('/api/cashflow/position');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });

  it('GET /api/cashflow data.total equals number of returned forecasts', async () => {
    const items = Array.from({ length: 7 }, (_, i) => ({
      id: `ph28-w${i}`,
      weekStart: new Date(),
      inflow: 1000,
      outflow: 500,
    }));
    mockPrisma.cashFlowForecast.findMany.mockResolvedValue(items);
    const res = await request(app).get('/api/cashflow');
    expect(res.status).toBe(200);
    expect(res.body.data.total).toBe(7);
    expect(res.body.data.forecasts).toHaveLength(7);
  });
});
