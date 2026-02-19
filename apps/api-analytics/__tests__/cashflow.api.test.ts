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
});
