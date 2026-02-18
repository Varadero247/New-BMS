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
jest.mock('@ims/auth', () => ({ authenticate: jest.fn((_req: any, _res: any, next: any) => { _req.user = { id: 'user-1', orgId: 'org-1', role: 'ADMIN' }; next(); }) }));
jest.mock('@ims/monitoring', () => ({ createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }) }));

import router from '../src/routes/analytics';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/analytics', router);

beforeEach(() => { jest.clearAllMocks(); });

describe('GET /api/analytics/dashboard', () => {
  it('should return all dashboard metrics', async () => {
    // Setup mocks in order of Promise.all calls
    (prisma as any).chemRegister.count
      .mockResolvedValueOnce(50)   // totalChemicals
      .mockResolvedValueOnce(5);   // cmrCount
    (prisma as any).chemCoshh.count
      .mockResolvedValueOnce(3)    // highRiskCoshh
      .mockResolvedValueOnce(8);   // coshhDueReview
    (prisma as any).chemSds.count
      .mockResolvedValueOnce(2);   // sdsOverdue
    (prisma as any).chemMonitoring.count
      .mockResolvedValueOnce(1);   // welExceedances
    (prisma as any).chemInventory.count
      .mockResolvedValueOnce(4);   // expiringStock
    (prisma as any).chemIncident.count
      .mockResolvedValueOnce(10);  // openIncidents
    (prisma as any).chemIncompatAlert.count
      .mockResolvedValueOnce(2);   // incompatAlerts
    (prisma as any).chemCoshh.groupBy.mockResolvedValue([
      { residualRiskLevel: 'VERY_LOW', _count: 5 },
      { residualRiskLevel: 'LOW', _count: 10 },
      { residualRiskLevel: 'MEDIUM', _count: 8 },
      { residualRiskLevel: 'HIGH', _count: 3 },
      { residualRiskLevel: 'VERY_HIGH', _count: 2 },
      { residualRiskLevel: 'UNACCEPTABLE', _count: 1 },
    ]);
    (prisma as any).chemIncident.findMany.mockResolvedValue([
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
    (prisma as any).chemRegister.count.mockResolvedValue(0);
    (prisma as any).chemCoshh.count.mockResolvedValue(0);
    (prisma as any).chemSds.count.mockResolvedValue(0);
    (prisma as any).chemMonitoring.count.mockResolvedValue(0);
    (prisma as any).chemInventory.count.mockResolvedValue(0);
    (prisma as any).chemIncident.count.mockResolvedValue(0);
    (prisma as any).chemIncompatAlert.count.mockResolvedValue(0);
    (prisma as any).chemCoshh.groupBy.mockResolvedValue([]);
    (prisma as any).chemIncident.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalChemicals).toBe(0);
    expect(res.body.data.riskLevelBreakdown).toEqual({});
    expect(res.body.data.recentIncidents).toEqual([]);
  });

  it('should return 500 on database error', async () => {
    (prisma as any).chemRegister.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});
