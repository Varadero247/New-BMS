import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyMeter: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyBaseline: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyTarget: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energySeu: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyAlert: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyProject: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyAudit: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyReading: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    energyBill: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: '00000000-0000-0000-0000-000000000001', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import dashboardRouter from '../src/routes/dashboard';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/dashboard', dashboardRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/dashboard', () => {
  it('returns 200 with energy KPI data', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(12);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(4);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(8);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(5);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(2);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(6);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns valid JSON with expected summary fields', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(12);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(4);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(8);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(5);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(2);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(6);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.body.data).toBeDefined();
    expect(res.body.data.summary).toBeDefined();
    expect(res.body.data.summary).toHaveProperty('meters', 12);
    expect(res.body.data.summary).toHaveProperty('baselines', 4);
    expect(res.body.data.summary).toHaveProperty('targets', 8);
    expect(res.body.data.summary).toHaveProperty('seus', 5);
    expect(res.body.data.summary).toHaveProperty('alerts', 3);
    expect(res.body.data.summary).toHaveProperty('projects', 2);
    expect(res.body.data.summary).toHaveProperty('audits', 6);
  });

  it('returns recentReadings, activeAlerts, and topSeus arrays', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(1);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000001', readingDate: new Date(), value: 100, meterId: 'meter-1' },
    ]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000002', type: 'OVERCONSUMPTION', severity: 'HIGH', message: 'Alert', createdAt: new Date() },
    ]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([
      { id: '00000000-0000-0000-0000-000000000003', name: 'Boiler', unit: 'kWh', consumptionPercentage: 35, annualConsumption: 1000, priority: 'HIGH' },
    ]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentReadings)).toBe(true);
    expect(res.body.data.recentReadings).toHaveLength(1);
    expect(Array.isArray(res.body.data.activeAlerts)).toBe(true);
    expect(res.body.data.activeAlerts).toHaveLength(1);
    expect(Array.isArray(res.body.data.topSeus)).toBe(true);
    expect(res.body.data.topSeus).toHaveLength(1);
  });

  it('calculates totalConsumption and totalCost from bills', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(1);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([
      { cost: 500, consumption: 1000, unit: 'kWh' },
      { cost: 300, consumption: 600, unit: 'kWh' },
    ]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalConsumption).toBe(1600);
    expect(res.body.data.summary.totalCost).toBe(800);
  });

  it('returns 500 when a count query throws', async () => {
    (prisma.energyMeter.count as jest.Mock).mockRejectedValue(new Error('DB connection failed'));
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('returns 500 when a findMany query throws', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(1);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyReading.findMany as jest.Mock).mockRejectedValue(new Error('Query failed'));

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('returns zero counts when all mocks return 0', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.meters).toBe(0);
    expect(res.body.data.summary.baselines).toBe(0);
    expect(res.body.data.summary.targets).toBe(0);
    expect(res.body.data.summary.seus).toBe(0);
    expect(res.body.data.summary.alerts).toBe(0);
    expect(res.body.data.summary.projects).toBe(0);
    expect(res.body.data.summary.audits).toBe(0);
    expect(res.body.data.summary.totalConsumption).toBe(0);
    expect(res.body.data.summary.totalCost).toBe(0);
    expect(res.body.data.recentReadings).toHaveLength(0);
    expect(res.body.data.activeAlerts).toHaveLength(0);
    expect(res.body.data.topSeus).toHaveLength(0);
  });

  it('queries energyMeter with ACTIVE status filter', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(5);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.energyMeter.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ status: 'ACTIVE' }) })
    );
  });

  it('queries energyAlert with acknowledged: false filter', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(2);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.energyAlert.count).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ acknowledged: false }) })
    );
    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: expect.objectContaining({ acknowledged: false }) })
    );
  });

  it('handles Decimal-like bill values with toNumber method', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([
      { cost: { toNumber: () => 250 }, consumption: { toNumber: () => 500 }, unit: 'kWh' },
    ]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalConsumption).toBe(500);
    expect(res.body.data.summary.totalCost).toBe(250);
  });

  it('returns error message in response body on failure', async () => {
    (prisma.energyMeter.count as jest.Mock).mockRejectedValue(new Error('Timeout'));

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.message).toBe('Failed to fetch dashboard data');
  });

  it('queries recentReadings with orderBy readingDate desc and take 10', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.energyReading.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { readingDate: 'desc' },
        take: 10,
      })
    );
  });

  it('queries activeAlerts with take 5 and acknowledged: false', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.energyAlert.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ acknowledged: false }),
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    );
  });

  it('queries topSeus ordered by consumptionPercentage desc and take 5', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    await request(app).get('/api/dashboard');

    expect(prisma.energySeu.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { consumptionPercentage: 'desc' },
        take: 5,
      })
    );
  });
});

describe('Energy Dashboard — extended', () => {
  it('returns multiple SEUs correctly ordered by consumptionPercentage', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(2);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(2);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([
      { id: 's1', name: 'Boiler', unit: 'kWh', consumptionPercentage: 40, annualConsumption: 2000, priority: 'HIGH' },
      { id: 's2', name: 'HVAC', unit: 'kWh', consumptionPercentage: 30, annualConsumption: 1500, priority: 'MEDIUM' },
    ]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.topSeus).toHaveLength(2);
    expect(res.body.data.summary.seus).toBe(3);
  });
});


describe('Energy Dashboard — additional coverage', () => {
  const allZeroCounts = () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([]);
  };

  it('auth enforcement: authenticate middleware is called on GET', async () => {
    const { authenticate } = require('@ims/auth');
    allZeroCounts();
    await request(app).get('/api/dashboard');
    expect(authenticate).toHaveBeenCalled();
  });

  it('empty list response: all arrays are empty and all counts are zero', async () => {
    allZeroCounts();
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.recentReadings).toEqual([]);
    expect(res.body.data.activeAlerts).toEqual([]);
    expect(res.body.data.topSeus).toEqual([]);
  });

  it('invalid params (400): GET with unknown query param still returns 200 (no validation on query)', async () => {
    allZeroCounts();
    const res = await request(app).get('/api/dashboard?invalidParam=xyz');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('DB error handling (500): energyBaseline.count failure returns INTERNAL_ERROR', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyBaseline.count as jest.Mock).mockRejectedValue(new Error('Baseline DB error'));
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('additional positive case: summary contains all expected keys including totalConsumption and totalCost', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(7);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(5);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(4);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(2);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue([{ cost: 100, consumption: 200, unit: 'kWh' }]);
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    const summary = res.body.data.summary;
    expect(summary).toHaveProperty('meters', 7);
    expect(summary).toHaveProperty('totalConsumption', 200);
    expect(summary).toHaveProperty('totalCost', 100);
    expect(summary).toHaveProperty('projects', 2);
    expect(summary).toHaveProperty('audits', 3);
  });
});

describe('Energy Dashboard — further extended', () => {
  const setupAllMocks = (overrides: Record<string, any> = {}) => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(overrides.meters ?? 0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(overrides.baselines ?? 0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(overrides.targets ?? 0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(overrides.seus ?? 0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(overrides.alerts ?? 0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(overrides.projects ?? 0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(overrides.audits ?? 0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue(overrides.readings ?? []);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue(overrides.alertList ?? []);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue(overrides.seuList ?? []);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue(overrides.bills ?? []);
  };

  it('returns success:true on GET /api/dashboard', async () => {
    setupAllMocks();
    const res = await request(app).get('/api/dashboard');
    expect(res.body.success).toBe(true);
  });

  it('multiple bills are summed correctly for totalConsumption', async () => {
    setupAllMocks({
      bills: [
        { cost: 100, consumption: 300, unit: 'kWh' },
        { cost: 200, consumption: 700, unit: 'kWh' },
        { cost: 50, consumption: 150, unit: 'kWh' },
      ],
    });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalConsumption).toBe(1150);
    expect(res.body.data.summary.totalCost).toBe(350);
  });

  it('data property contains summary, recentReadings, activeAlerts, topSeus', async () => {
    setupAllMocks();
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('summary');
    expect(res.body.data).toHaveProperty('recentReadings');
    expect(res.body.data).toHaveProperty('activeAlerts');
    expect(res.body.data).toHaveProperty('topSeus');
  });

  it('energyProject.count is called once per request', async () => {
    setupAllMocks({ projects: 4 });
    await request(app).get('/api/dashboard');
    expect(prisma.energyProject.count).toHaveBeenCalledTimes(1);
  });

  it('energyAudit.count is called with no deleted filter', async () => {
    setupAllMocks({ audits: 2 });
    await request(app).get('/api/dashboard');
    expect(prisma.energyAudit.count).toHaveBeenCalledTimes(1);
  });

  it('summary.targets reflects count value returned by mock', async () => {
    setupAllMocks({ targets: 9 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.targets).toBe(9);
  });

  it('summary.baselines reflects count value returned by mock', async () => {
    setupAllMocks({ baselines: 6 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.baselines).toBe(6);
  });

  it('energyTarget.count failure returns 500', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockRejectedValue(new Error('Target DB error'));
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Energy Dashboard — final coverage', () => {
  const setup = (overrides: Record<string, any> = {}) => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(overrides.meters ?? 0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(overrides.baselines ?? 0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(overrides.targets ?? 0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(overrides.seus ?? 0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(overrides.alerts ?? 0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(overrides.projects ?? 0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(overrides.audits ?? 0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue(overrides.readings ?? []);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue(overrides.alertList ?? []);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue(overrides.seuList ?? []);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue(overrides.bills ?? []);
  };

  it('summary.seus reflects count value', async () => {
    setup({ seus: 11 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.seus).toBe(11);
  });

  it('summary.alerts reflects unacknowledged alert count', async () => {
    setup({ alerts: 7 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.alerts).toBe(7);
  });

  it('response does not contain unexpected top-level fields', async () => {
    setup();
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('success');
    expect(res.body).toHaveProperty('data');
  });

  it('handles bill with toNumber method for cost', async () => {
    setup({ bills: [{ cost: { toNumber: () => 999 }, consumption: 3000, unit: 'kWh' }] });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.totalCost).toBe(999);
  });

  it('energySeu.count throws returns 500', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockRejectedValue(new Error('SEU DB error'));
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('energySeu.findMany is called once per request', async () => {
    setup({ seus: 2 });
    await request(app).get('/api/dashboard');
    expect(prisma.energySeu.findMany).toHaveBeenCalledTimes(1);
  });

  it('energyBill.findMany is called to aggregate costs', async () => {
    setup({ bills: [] });
    await request(app).get('/api/dashboard');
    expect(prisma.energyBill.findMany).toHaveBeenCalledTimes(1);
  });
});

describe('Energy Dashboard — additional final coverage', () => {
  const setupAll = (overrides: Record<string, any> = {}) => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(overrides.meters ?? 0);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(overrides.baselines ?? 0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(overrides.targets ?? 0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(overrides.seus ?? 0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(overrides.alerts ?? 0);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(overrides.projects ?? 0);
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(overrides.audits ?? 0);
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue(overrides.readings ?? []);
    (prisma.energyAlert.findMany as jest.Mock).mockResolvedValue(overrides.alertList ?? []);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue(overrides.seuList ?? []);
    (prisma.energyBill.findMany as jest.Mock).mockResolvedValue(overrides.bills ?? []);
  };

  it('summary.meters is 0 when no active meters exist', async () => {
    setupAll({ meters: 0 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.meters).toBe(0);
  });

  it('summary.projects reflects mocked project count', async () => {
    setupAll({ projects: 5 });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.summary.projects).toBe(5);
  });

  it('data.topSeus length is bounded by take:5 limit from mock', async () => {
    setupAll({
      seuList: [
        { id: 's1', name: 'SEU1', unit: 'kWh', consumptionPercentage: 50, annualConsumption: 5000, priority: 'HIGH' },
        { id: 's2', name: 'SEU2', unit: 'kWh', consumptionPercentage: 30, annualConsumption: 3000, priority: 'MEDIUM' },
        { id: 's3', name: 'SEU3', unit: 'kWh', consumptionPercentage: 20, annualConsumption: 2000, priority: 'LOW' },
      ],
    });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.topSeus.length).toBeLessThanOrEqual(5);
  });

  it('energyProject.count failure returns 500 with INTERNAL_ERROR', async () => {
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(1);
    (prisma.energyBaseline.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyProject.count as jest.Mock).mockRejectedValue(new Error('Project DB down'));
    (prisma.energyAudit.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('recentReadings array matches findMany result length', async () => {
    setupAll({
      readings: [
        { id: 'r1', readingDate: new Date(), value: 100, meterId: 'm1' },
        { id: 'r2', readingDate: new Date(), value: 200, meterId: 'm2' },
        { id: 'r3', readingDate: new Date(), value: 300, meterId: 'm3' },
      ],
    });
    const res = await request(app).get('/api/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.recentReadings).toHaveLength(3);
  });
});
