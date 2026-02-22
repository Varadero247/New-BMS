import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    chemRegister: { count: jest.fn() },
    chemCoshh: { count: jest.fn(), groupBy: jest.fn() },
    chemSds: { count: jest.fn() },
    chemMonitoring: { count: jest.fn() },
    chemInventory: { count: jest.fn() },
    chemIncident: { count: jest.fn(), findMany: jest.fn() },
    chemIncompatAlert: { count: jest.fn() },
  },
  Prisma: {},
}));
jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((_req: any, _res: any, next: any) => {
    _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' };
    next();
  }),
}));
jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import router from '../src/routes/analytics';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/analytics', router);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/analytics/dashboard', () => {
  it('should return all dashboard metrics', async () => {
    // Setup mocks in order of Promise.all calls
    mockPrisma.chemRegister.count
      .mockResolvedValueOnce(50) // totalChemicals
      .mockResolvedValueOnce(5); // cmrCount
    mockPrisma.chemCoshh.count
      .mockResolvedValueOnce(3) // highRiskCoshh
      .mockResolvedValueOnce(8); // coshhDueReview
    mockPrisma.chemSds.count.mockResolvedValueOnce(2); // sdsOverdue
    mockPrisma.chemMonitoring.count.mockResolvedValueOnce(1); // welExceedances
    mockPrisma.chemInventory.count.mockResolvedValueOnce(4); // expiringStock
    mockPrisma.chemIncident.count.mockResolvedValueOnce(10); // openIncidents
    mockPrisma.chemIncompatAlert.count.mockResolvedValueOnce(2); // incompatAlerts
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'VERY_LOW', _count: 5 },
      { residualRiskLevel: 'LOW', _count: 10 },
      { residualRiskLevel: 'MEDIUM', _count: 8 },
      { residualRiskLevel: 'HIGH', _count: 3 },
      { residualRiskLevel: 'VERY_HIGH', _count: 2 },
      { residualRiskLevel: 'UNACCEPTABLE', _count: 1 },
    ]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([
      { id: 'inc-1', dateTime: '2026-02-10T00:00:00.000Z', chemical: { productName: 'Acetone' } },
    ]);

    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    const data = res.body.data;
    expect(data.totalChemicals).toBe(50);
    expect(data.cmrCount).toBe(5);
    expect(data.highRiskCount).toBe(3);
    expect(data.sdsOverdueCount).toBe(2);
    expect(data.coshhDueReviewCount).toBe(8);
    expect(data.welExceedanceCount).toBe(1);
    expect(data.expiringStockCount).toBe(4);
    expect(data.openIncidents).toBe(10);
    expect(data.incompatibilityAlerts).toBe(2);
    expect(data.riskLevelBreakdown).toBeDefined();
    expect(data.riskLevelBreakdown.HIGH).toBe(3);
    expect(data.riskLevelBreakdown.MEDIUM).toBe(8);
    expect(data.recentIncidents).toHaveLength(1);
  });

  it('should return zeros when database is empty', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalChemicals).toBe(0);
    expect(res.body.data.riskLevelBreakdown).toEqual({});
    expect(res.body.data.recentIncidents).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.chemRegister.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('riskLevelBreakdown is an object', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.riskLevelBreakdown).toBe('object');
  });

  it('recentIncidents is an array', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentIncidents)).toBe(true);
  });

  it('groupBy called once for risk breakdown', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/analytics/dashboard');
    expect(mockPrisma.chemCoshh.groupBy).toHaveBeenCalledTimes(1);
  });

  it('VERY_HIGH risk count appears in breakdown', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(1);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'VERY_HIGH', _count: 7 },
    ]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.riskLevelBreakdown.VERY_HIGH).toBe(7);
  });
});

describe('GET /api/analytics/dashboard — extended', () => {
  it('success flag is true when all counts are non-zero', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(5);
    mockPrisma.chemCoshh.count.mockResolvedValue(2);
    mockPrisma.chemSds.count.mockResolvedValue(1);
    mockPrisma.chemMonitoring.count.mockResolvedValue(1);
    mockPrisma.chemInventory.count.mockResolvedValue(3);
    mockPrisma.chemIncident.count.mockResolvedValue(4);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(1);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('cmrCount reflects the mock value', async () => {
    mockPrisma.chemRegister.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(3);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.cmrCount).toBe(3);
  });

  it('openIncidents reflects mock chemIncident count', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(9);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.openIncidents).toBe(9);
  });

  it('incompatibilityAlerts reflects mock chemIncompatAlert count', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(6);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.incompatibilityAlerts).toBe(6);
  });

  it('UNACCEPTABLE risk count appears in breakdown', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'UNACCEPTABLE', _count: 2 },
    ]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.riskLevelBreakdown.UNACCEPTABLE).toBe(2);
  });

  it('recentIncidents contains multiple incidents', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([
      { id: 'i1', dateTime: '2026-01-01T00:00:00Z', chemical: { productName: 'Acid' } },
      { id: 'i2', dateTime: '2026-01-02T00:00:00Z', chemical: { productName: 'Base' } },
    ]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.recentIncidents).toHaveLength(2);
  });

  it('welExceedanceCount reflects mock chemMonitoring count', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(5);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.welExceedanceCount).toBe(5);
  });

  it('expiringStockCount reflects mock chemInventory count', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(11);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.expiringStockCount).toBe(11);
  });
});
describe('GET /api/analytics/dashboard — additional coverage', () => {
  it('enforces authentication — authenticate middleware is called', async () => {
    const { authenticate } = require('@ims/auth');
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    await request(app).get('/api/analytics/dashboard');
    expect(authenticate).toHaveBeenCalled();
  });

  it('empty database — all counts zero and lists empty', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.totalChemicals).toBe(0);
    expect(res.body.data.openIncidents).toBe(0);
    expect(res.body.data.recentIncidents).toHaveLength(0);
    expect(res.body.data.riskLevelBreakdown).toEqual({});
  });

  it('unknown query params are ignored and 200 is still returned', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(1);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard?foo=bar&baz=123');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 when chemCoshh.groupBy rejects', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(5);
    mockPrisma.chemCoshh.count.mockResolvedValue(1);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockRejectedValue(new Error('groupBy failed'));
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('all five risk levels present in breakdown when groupBy returns them all', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(20);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'VERY_LOW', _count: 4 },
      { residualRiskLevel: 'LOW', _count: 6 },
      { residualRiskLevel: 'MEDIUM', _count: 5 },
      { residualRiskLevel: 'HIGH', _count: 3 },
      { residualRiskLevel: 'VERY_HIGH', _count: 2 },
    ]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    const breakdown = res.body.data.riskLevelBreakdown;
    expect(breakdown.VERY_LOW).toBe(4);
    expect(breakdown.LOW).toBe(6);
    expect(breakdown.MEDIUM).toBe(5);
    expect(breakdown.HIGH).toBe(3);
    expect(breakdown.VERY_HIGH).toBe(2);
  });
});

describe('GET /api/analytics/dashboard — edge cases and field validation', () => {
  const setupZeroMocks = () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
  };

  it('response body contains success: true on 200', async () => {
    setupZeroMocks();
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success', true);
  });

  it('response body has a data property on success', async () => {
    setupZeroMocks();
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(typeof res.body.data).toBe('object');
  });

  it('error body contains success: false on 500', async () => {
    mockPrisma.chemRegister.count.mockRejectedValue(new Error('fail'));
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty('success', false);
    expect(res.body.error).toHaveProperty('code', 'INTERNAL_ERROR');
  });

  it('coshhDueReviewCount reflects the second chemCoshh.count call', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count
      .mockResolvedValueOnce(0) // highRiskCoshh
      .mockResolvedValueOnce(13); // coshhDueReview
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.coshhDueReviewCount).toBe(13);
  });

  it('sdsOverdueCount reflects chemSds.count mock', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(7);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.sdsOverdueCount).toBe(7);
  });

  it('highRiskCount reflects first chemCoshh.count call', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count
      .mockResolvedValueOnce(9) // highRiskCoshh
      .mockResolvedValueOnce(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockResolvedValue([]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.highRiskCount).toBe(9);
  });

  it('recentIncidents item has expected shape fields', async () => {
    setupZeroMocks();
    mockPrisma.chemIncident.findMany.mockResolvedValue([
      { id: 'inc-x', dateTime: '2026-03-01T00:00:00Z', chemical: { productName: 'Chlorine' } },
    ]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    const inc = res.body.data.recentIncidents[0];
    expect(inc).toHaveProperty('id', 'inc-x');
  });

  it('returns 500 when chemIncident.findMany rejects', async () => {
    mockPrisma.chemRegister.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.count.mockResolvedValue(0);
    mockPrisma.chemSds.count.mockResolvedValue(0);
    mockPrisma.chemMonitoring.count.mockResolvedValue(0);
    mockPrisma.chemInventory.count.mockResolvedValue(0);
    mockPrisma.chemIncident.count.mockResolvedValue(0);
    mockPrisma.chemIncompatAlert.count.mockResolvedValue(0);
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([]);
    mockPrisma.chemIncident.findMany.mockRejectedValue(new Error('findMany fail'));
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('LOW risk count appears in breakdown', async () => {
    setupZeroMocks();
    mockPrisma.chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'LOW', _count: 14 },
    ]);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.riskLevelBreakdown.LOW).toBe(14);
  });
});
