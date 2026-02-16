import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    femPremises: {
      count: jest.fn(),
    },
    femFireRiskAssessment: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    femEmergencyIncident: {
      count: jest.fn(),
      findMany: jest.fn(),
      groupBy: jest.fn(),
    },
    femFireWarden: {
      count: jest.fn(),
    },
    femPeep: {
      count: jest.fn(),
    },
    femEmergencyEquipment: {
      count: jest.fn(),
    },
    femBusinessContinuityPlan: {
      count: jest.fn(),
    },
    $queryRaw: jest.fn(),
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

const app = express();
app.use(express.json());
app.use('/api/analytics', router);

beforeEach(() => { jest.clearAllMocks(); });

const mockPremises = prisma.femPremises as any;
const mockFra = prisma.femFireRiskAssessment as any;
const mockIncident = prisma.femEmergencyIncident as any;
const mockWarden = prisma.femFireWarden as any;
const mockPeep = prisma.femPeep as any;
const mockEquipment = prisma.femEmergencyEquipment as any;
const mockBcp = prisma.femBusinessContinuityPlan as any;

function setupAnalyticsMocks(overrides: Partial<{
  activePremises: number;
  fraOverdue: number;
  activeIncidents: number;
  incidentsLast30: number;
  wardenExpiring: number;
  peepDue: number;
  equipmentDue: number;
  bcpCount: number;
  bcpNotTested: number;
  recentIncidents: any[];
  riskBreakdown: any[];
  incidentBreakdown: any[];
  premisesNoDrill: number;
}> = {}) {
  const defaults = {
    activePremises: 5,
    fraOverdue: 2,
    activeIncidents: 1,
    incidentsLast30: 3,
    wardenExpiring: 4,
    peepDue: 2,
    equipmentDue: 6,
    bcpCount: 3,
    bcpNotTested: 1,
    recentIncidents: [{ id: 'inc-1', incidentNumber: 'INC-2026-0001', emergencyType: 'FIRE', premises: { name: 'HQ' } }],
    riskBreakdown: [{ overallRiskLevel: 'LOW', _count: 3 }, { overallRiskLevel: 'MEDIUM', _count: 2 }],
    incidentBreakdown: [{ emergencyType: 'FIRE', _count: 2 }, { emergencyType: 'FLOOD', _count: 1 }],
    premisesNoDrill: 2,
  };
  const merged = { ...defaults, ...overrides };

  mockPremises.count
    .mockResolvedValueOnce(merged.activePremises)
    .mockResolvedValueOnce(merged.premisesNoDrill);
  mockFra.count.mockResolvedValue(merged.fraOverdue);
  mockFra.groupBy.mockResolvedValue(merged.riskBreakdown);
  mockIncident.count
    .mockResolvedValueOnce(merged.activeIncidents)
    .mockResolvedValueOnce(merged.incidentsLast30);
  mockIncident.findMany.mockResolvedValue(merged.recentIncidents);
  mockIncident.groupBy.mockResolvedValue(merged.incidentBreakdown);
  mockWarden.count.mockResolvedValue(merged.wardenExpiring);
  mockPeep.count.mockResolvedValue(merged.peepDue);
  mockEquipment.count.mockResolvedValue(merged.equipmentDue);
  mockBcp.count
    .mockResolvedValueOnce(merged.bcpCount)
    .mockResolvedValueOnce(merged.bcpNotTested);
}

describe('GET /api/analytics/dashboard', () => {
  it('returns full analytics dashboard data', async () => {
    setupAnalyticsMocks();

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.activePremises).toBe(5);
    expect(res.body.data.fraOverdueCount).toBe(2);
    expect(res.body.data.activeIncidents).toBe(1);
  });

  it('includes incidentsLast30Days in response', async () => {
    setupAnalyticsMocks({ incidentsLast30: 7 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.incidentsLast30Days).toBe(7);
  });

  it('includes warden training expiring count', async () => {
    setupAnalyticsMocks({ wardenExpiring: 8 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.wardenTrainingExpiring).toBe(8);
  });

  it('includes PEEP review due count', async () => {
    setupAnalyticsMocks({ peepDue: 3 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.peepReviewDue).toBe(3);
  });

  it('includes equipment service due count', async () => {
    setupAnalyticsMocks({ equipmentDue: 10 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.equipmentServiceDue).toBe(10);
  });

  it('includes BCP count and not-tested count', async () => {
    setupAnalyticsMocks({ bcpCount: 5, bcpNotTested: 2 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.bcpCount).toBe(5);
    expect(res.body.data.bcpNotTestedCount).toBe(2);
  });

  it('includes riskLevelBreakdown as object map', async () => {
    setupAnalyticsMocks({
      riskBreakdown: [
        { overallRiskLevel: 'LOW', _count: 5 },
        { overallRiskLevel: 'HIGH', _count: 2 },
      ],
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.riskLevelBreakdown).toBeDefined();
    expect(res.body.data.riskLevelBreakdown.LOW).toBe(5);
    expect(res.body.data.riskLevelBreakdown.HIGH).toBe(2);
  });

  it('includes incidentTypeBreakdown as object map', async () => {
    setupAnalyticsMocks({
      incidentBreakdown: [
        { emergencyType: 'FIRE', _count: 3 },
        { emergencyType: 'FLOOD', _count: 1 },
      ],
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.incidentTypeBreakdown.FIRE).toBe(3);
    expect(res.body.data.incidentTypeBreakdown.FLOOD).toBe(1);
  });

  it('includes recent incidents list', async () => {
    const recent = [
      { id: 'inc-1', incidentNumber: 'INC-2026-0001', emergencyType: 'FIRE', premises: { name: 'HQ' } },
      { id: 'inc-2', incidentNumber: 'INC-2026-0002', emergencyType: 'FLOOD', premises: { name: 'Branch' } },
    ];
    setupAnalyticsMocks({ recentIncidents: recent });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.recentIncidents).toHaveLength(2);
  });

  it('includes drillsDueSoon count', async () => {
    setupAnalyticsMocks({ premisesNoDrill: 4 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.drillsDueSoon).toBe(4);
  });

  it('includes criticalAlerts array with active incidents alert', async () => {
    setupAnalyticsMocks({ activeIncidents: 2, fraOverdue: 0, wardenExpiring: 0, equipmentDue: 0, premisesNoDrill: 0 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.criticalAlerts)).toBe(true);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('active emergency'))).toBe(true);
  });

  it('includes criticalAlerts for overdue FRAs', async () => {
    setupAnalyticsMocks({ activeIncidents: 0, fraOverdue: 3, wardenExpiring: 0, equipmentDue: 0, premisesNoDrill: 0 });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('fire risk assessment'))).toBe(true);
  });

  it('returns empty criticalAlerts when all metrics are zero', async () => {
    setupAnalyticsMocks({
      activeIncidents: 0,
      fraOverdue: 0,
      wardenExpiring: 0,
      equipmentDue: 0,
      premisesNoDrill: 0,
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts).toHaveLength(0);
  });

  it('returns 500 on database error', async () => {
    mockPremises.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('FETCH_ERROR');
  });
});
