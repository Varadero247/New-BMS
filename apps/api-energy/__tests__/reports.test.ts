import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    energyReading: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
    },
    energyMeter: {
      count: jest.fn(),
    },
    energyTarget: {
      findMany: jest.fn(),
    },
    energyProject: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    energyAlert: {
      count: jest.fn(),
    },
    energySeu: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    energyBill: {
      aggregate: jest.fn(),
      count: jest.fn(),
    },
    energyAudit: {
      findMany: jest.fn(),
    },
    energyEnpi: {
      findMany: jest.fn(),
    },
  },
  Prisma: { Decimal: jest.fn((v: any) => v) },
}));

jest.mock('@ims/auth', () => ({
  authenticate: jest.fn((req: any, _res: any, next: any) => {
    req.user = { id: 'user-123', email: 'test@test.com', role: 'ADMIN' };
    next();
  }),
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import reportsRouter from '../src/routes/reports';
import { prisma } from '../src/prisma';

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

describe('GET /api/reports/dashboard', () => {
  it('should return energy dashboard KPIs', async () => {
    (prisma.energyReading.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { value: 15000, cost: 3000 } })  // monthly
      .mockResolvedValueOnce({ _sum: { value: 100000, cost: 20000 } }); // yearly
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(5);
    (prisma.energyTarget.findMany as jest.Mock).mockResolvedValue([
      { status: 'ON_TRACK' },
      { status: 'AT_RISK' },
      { status: 'ACHIEVED' },
    ]);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(3);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(2);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(4);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(1);

    const res = await request(app).get('/api/reports/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.monthlyConsumption).toBe(15000);
    expect(res.body.data.monthlyCost).toBe(3000);
    expect(res.body.data.yearlyConsumption).toBe(100000);
    expect(res.body.data.activeMeters).toBe(5);
    expect(res.body.data.totalTargets).toBe(3);
    expect(res.body.data.onTrackTargets).toBe(2);
    expect(res.body.data.activeProjects).toBe(3);
    expect(res.body.data.unresolvedAlerts).toBe(2);
    expect(res.body.data.significantEnergyUses).toBe(4);
    expect(res.body.data.pendingBills).toBe(1);
  });

  it('should handle null aggregation results', async () => {
    (prisma.energyReading.aggregate as jest.Mock)
      .mockResolvedValueOnce({ _sum: { value: null, cost: null } })
      .mockResolvedValueOnce({ _sum: { value: null, cost: null } });
    (prisma.energyMeter.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyTarget.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyProject.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyAlert.count as jest.Mock).mockResolvedValue(0);
    (prisma.energySeu.count as jest.Mock).mockResolvedValue(0);
    (prisma.energyBill.count as jest.Mock).mockResolvedValue(0);

    const res = await request(app).get('/api/reports/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.monthlyConsumption).toBe(0);
    expect(res.body.data.monthlyCost).toBe(0);
  });

  it('should handle errors', async () => {
    (prisma.energyReading.aggregate as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/dashboard');
    expect(res.status).toBe(500);
  });
});

describe('GET /api/reports/esos', () => {
  it('should return ESOS report data', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockResolvedValue([
      { id: '1', type: 'EXTERNAL', title: 'ESOS Audit' },
    ]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([
      { name: 'HVAC', facility: 'HQ', annualConsumption: 100000, consumptionPercentage: 40, unit: 'kWh', status: 'ANALYZED' },
    ]);
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([
      { title: 'LED Upgrade', type: 'EFFICIENCY', estimatedSavings: 15000, investmentCost: 25000, paybackMonths: 20, status: 'PROPOSED' },
    ]);

    const res = await request(app).get('/api/reports/esos');

    expect(res.status).toBe(200);
    expect(res.body.data.qualifyingAudits).toBe(1);
    expect(res.body.data.significantEnergyUses).toHaveLength(1);
    expect(res.body.data.savingsOpportunities).toHaveLength(1);
    expect(res.body.data.totalConsumption).toBe(100000);
  });

  it('should handle empty data', async () => {
    (prisma.energyAudit.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energySeu.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyProject.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/esos');

    expect(res.status).toBe(200);
    expect(res.body.data.qualifyingAudits).toBe(0);
    expect(res.body.data.totalConsumption).toBe(0);
  });
});

describe('GET /api/reports/secr', () => {
  it('should return SECR report data', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { value: 5000, cost: 1000, meter: { type: 'ELECTRICITY', unit: 'kWh' } },
      { value: 3000, cost: 500, meter: { type: 'GAS', unit: 'kWh' } },
    ]);
    (prisma.energyBill.aggregate as jest.Mock).mockResolvedValue({
      _sum: { cost: 1500, consumption: 8000 },
    });
    (prisma.energyEnpi.findMany as jest.Mock).mockResolvedValue([
      { name: 'Intensity', unit: 'kWh/m2', baselineValue: 150, currentValue: 120, targetValue: 100 },
    ]);

    const res = await request(app).get('/api/reports/secr?year=2025');

    expect(res.status).toBe(200);
    expect(res.body.data.reportYear).toBe(2025);
    expect(res.body.data.totalEnergyConsumption).toBe(8000);
    expect(res.body.data.consumptionByType).toHaveLength(2);
    expect(res.body.data.intensityMetrics).toHaveLength(1);
  });

  it('should default to current year if no year provided', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.energyBill.aggregate as jest.Mock).mockResolvedValue({ _sum: { cost: null, consumption: null } });
    (prisma.energyEnpi.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/secr');

    expect(res.status).toBe(200);
    expect(res.body.data.reportYear).toBe(new Date().getFullYear());
  });
});

describe('GET /api/reports/consumption', () => {
  it('should return consumption grouped by type', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { value: 5000, cost: 1000, meter: { type: 'ELECTRICITY', facility: 'HQ', unit: 'kWh', name: 'M1' } },
      { value: 3000, cost: 500, meter: { type: 'GAS', facility: 'HQ', unit: 'kWh', name: 'M2' } },
      { value: 2000, cost: 400, meter: { type: 'ELECTRICITY', facility: 'Factory', unit: 'kWh', name: 'M3' } },
    ]);

    const res = await request(app).get('/api/reports/consumption');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(10000);
    expect(res.body.data.totalCost).toBe(1900);
    expect(res.body.data.breakdown).toHaveLength(2);
  });

  it('should group by facility', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([
      { value: 5000, cost: 1000, meter: { type: 'ELECTRICITY', facility: 'HQ', unit: 'kWh', name: 'M1' } },
      { value: 3000, cost: 500, meter: { type: 'GAS', facility: 'Factory', unit: 'kWh', name: 'M2' } },
    ]);

    const res = await request(app).get('/api/reports/consumption?groupBy=facility');

    expect(res.status).toBe(200);
    expect(res.body.data.groupBy).toBe('facility');
    expect(res.body.data.breakdown).toHaveLength(2);
  });

  it('should handle empty results', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockResolvedValue([]);

    const res = await request(app).get('/api/reports/consumption');

    expect(res.status).toBe(200);
    expect(res.body.data.totalConsumption).toBe(0);
    expect(res.body.data.breakdown).toHaveLength(0);
  });

  it('should handle errors', async () => {
    (prisma.energyReading.findMany as jest.Mock).mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/consumption');
    expect(res.status).toBe(500);
  });
});
