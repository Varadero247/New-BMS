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
});
