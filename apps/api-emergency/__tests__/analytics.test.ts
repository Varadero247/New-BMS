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

beforeEach(() => {
  jest.clearAllMocks();
});

const mockPremises = jest.mocked(prisma.femPremises);
const mockFra = jest.mocked(prisma.femFireRiskAssessment);
const mockIncident = jest.mocked(prisma.femEmergencyIncident);
const mockWarden = jest.mocked(prisma.femFireWarden);
const mockPeep = jest.mocked(prisma.femPeep);
const mockEquipment = jest.mocked(prisma.femEmergencyEquipment);
const mockBcp = jest.mocked(prisma.femBusinessContinuityPlan);

function setupAnalyticsMocks(
  overrides: Partial<{
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
  }> = {}
) {
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
    recentIncidents: [
      {
        id: 'inc-1',
        incidentNumber: 'INC-2026-0001',
        emergencyType: 'FIRE',
        premises: { name: 'HQ' },
      },
    ],
    riskBreakdown: [
      { overallRiskLevel: 'LOW', _count: 3 },
      { overallRiskLevel: 'MEDIUM', _count: 2 },
    ],
    incidentBreakdown: [
      { emergencyType: 'FIRE', _count: 2 },
      { emergencyType: 'FLOOD', _count: 1 },
    ],
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
  mockBcp.count.mockResolvedValueOnce(merged.bcpCount).mockResolvedValueOnce(merged.bcpNotTested);
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
      {
        id: 'inc-1',
        incidentNumber: 'INC-2026-0001',
        emergencyType: 'FIRE',
        premises: { name: 'HQ' },
      },
      {
        id: 'inc-2',
        incidentNumber: 'INC-2026-0002',
        emergencyType: 'FLOOD',
        premises: { name: 'Branch' },
      },
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
    setupAnalyticsMocks({
      activeIncidents: 2,
      fraOverdue: 0,
      wardenExpiring: 0,
      equipmentDue: 0,
      premisesNoDrill: 0,
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.criticalAlerts)).toBe(true);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('active emergency'))).toBe(
      true
    );
  });

  it('includes criticalAlerts for overdue FRAs', async () => {
    setupAnalyticsMocks({
      activeIncidents: 0,
      fraOverdue: 3,
      wardenExpiring: 0,
      equipmentDue: 0,
      premisesNoDrill: 0,
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(
      res.body.data.criticalAlerts.some((a: string) => a.includes('fire risk assessment'))
    ).toBe(true);
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
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Emergency Analytics — extended', () => {
  it('dashboard returns success:true when all metrics are healthy', async () => {
    setupAnalyticsMocks({
      activePremises: 10,
      fraOverdue: 0,
      activeIncidents: 0,
      incidentsLast30: 0,
      wardenExpiring: 0,
      peepDue: 0,
      equipmentDue: 0,
      bcpCount: 4,
      bcpNotTested: 0,
      premisesNoDrill: 0,
      recentIncidents: [],
      riskBreakdown: [],
      incidentBreakdown: [],
    });

    const res = await request(app).get('/api/analytics/dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.criticalAlerts).toHaveLength(0);
  });
});
describe('GET /api/analytics/dashboard — additional coverage', () => {
  it('enforces authentication — authenticate middleware is called', async () => {
    const { authenticate } = require('@ims/auth');
    setupAnalyticsMocks();
    await request(app).get('/api/analytics/dashboard');
    expect(authenticate).toHaveBeenCalled();
  });

  it('returns empty recentIncidents and zero metrics when database is empty', async () => {
    setupAnalyticsMocks({
      activePremises: 0,
      fraOverdue: 0,
      activeIncidents: 0,
      incidentsLast30: 0,
      wardenExpiring: 0,
      peepDue: 0,
      equipmentDue: 0,
      bcpCount: 0,
      bcpNotTested: 0,
      premisesNoDrill: 0,
      recentIncidents: [],
      riskBreakdown: [],
      incidentBreakdown: [],
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.activePremises).toBe(0);
    expect(res.body.data.recentIncidents).toHaveLength(0);
    expect(res.body.data.riskLevelBreakdown).toEqual({});
    expect(res.body.data.incidentTypeBreakdown).toEqual({});
  });

  it('unknown query params do not break the dashboard endpoint', async () => {
    setupAnalyticsMocks();
    const res = await request(app).get('/api/analytics/dashboard?unknown=abc');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('returns 500 with INTERNAL_ERROR when femFireWarden.count rejects', async () => {
    mockPremises.count.mockResolvedValueOnce(5).mockResolvedValueOnce(0);
    mockFra.count.mockResolvedValue(0);
    mockFra.groupBy.mockResolvedValue([]);
    mockIncident.count.mockResolvedValueOnce(0).mockResolvedValueOnce(0);
    mockIncident.findMany.mockResolvedValue([]);
    mockIncident.groupBy.mockResolvedValue([]);
    mockWarden.count.mockRejectedValue(new Error('warden DB error'));
    mockPeep.count.mockResolvedValue(0);
    mockEquipment.count.mockResolvedValue(0);
    mockBcp.count.mockResolvedValue(0);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });

  it('criticalAlerts contains warden expiry alert when wardenExpiring > 0', async () => {
    setupAnalyticsMocks({
      activeIncidents: 0,
      fraOverdue: 0,
      wardenExpiring: 5,
      equipmentDue: 0,
      premisesNoDrill: 0,
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('warden'))).toBe(true);
  });
});

// ─── Analytics — extended metrics and alert coverage ─────────────────────────

describe('Emergency Analytics — extended metrics and alert coverage', () => {
  it('criticalAlerts contains equipment alert when equipmentDue > 0', async () => {
    setupAnalyticsMocks({
      activeIncidents: 0,
      fraOverdue: 0,
      wardenExpiring: 0,
      equipmentDue: 3,
      premisesNoDrill: 0,
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('equipment'))).toBe(true);
  });

  it('criticalAlerts contains drills alert when premisesNoDrill > 0', async () => {
    setupAnalyticsMocks({
      activeIncidents: 0,
      fraOverdue: 0,
      wardenExpiring: 0,
      equipmentDue: 0,
      premisesNoDrill: 2,
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts.some((a: string) => a.includes('drill'))).toBe(true);
  });

  it('response contains all expected top-level data keys', async () => {
    setupAnalyticsMocks();
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    const data = res.body.data;
    expect(data).toHaveProperty('activePremises');
    expect(data).toHaveProperty('fraOverdueCount');
    expect(data).toHaveProperty('activeIncidents');
    expect(data).toHaveProperty('incidentsLast30Days');
    expect(data).toHaveProperty('wardenTrainingExpiring');
    expect(data).toHaveProperty('peepReviewDue');
    expect(data).toHaveProperty('equipmentServiceDue');
    expect(data).toHaveProperty('bcpCount');
    expect(data).toHaveProperty('bcpNotTestedCount');
    expect(data).toHaveProperty('riskLevelBreakdown');
    expect(data).toHaveProperty('incidentTypeBreakdown');
    expect(data).toHaveProperty('recentIncidents');
    expect(data).toHaveProperty('drillsDueSoon');
    expect(data).toHaveProperty('criticalAlerts');
  });

  it('riskLevelBreakdown is an object (not array)', async () => {
    setupAnalyticsMocks({
      riskBreakdown: [{ overallRiskLevel: 'HIGH', _count: 3 }],
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.riskLevelBreakdown).toBe('object');
    expect(Array.isArray(res.body.data.riskLevelBreakdown)).toBe(false);
  });

  it('incidentTypeBreakdown is an object (not array)', async () => {
    setupAnalyticsMocks({
      incidentBreakdown: [{ emergencyType: 'FIRE', _count: 2 }],
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.incidentTypeBreakdown).toBe('object');
    expect(Array.isArray(res.body.data.incidentTypeBreakdown)).toBe(false);
  });

  it('recentIncidents is an array', async () => {
    setupAnalyticsMocks({ recentIncidents: [] });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.recentIncidents)).toBe(true);
  });

  it('criticalAlerts is an array', async () => {
    setupAnalyticsMocks({ activeIncidents: 0, fraOverdue: 0, wardenExpiring: 0, equipmentDue: 0, premisesNoDrill: 0 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data.criticalAlerts)).toBe(true);
  });

  it('returns 500 with INTERNAL_ERROR when femEmergencyIncident.count rejects', async () => {
    mockPremises.count.mockResolvedValueOnce(5).mockResolvedValueOnce(0);
    mockFra.count.mockResolvedValue(0);
    mockFra.groupBy.mockResolvedValue([]);
    mockIncident.count.mockRejectedValue(new Error('incident DB error'));
    mockIncident.findMany.mockResolvedValue([]);
    mockIncident.groupBy.mockResolvedValue([]);
    mockWarden.count.mockResolvedValue(0);
    mockPeep.count.mockResolvedValue(0);
    mockEquipment.count.mockResolvedValue(0);
    mockBcp.count.mockResolvedValue(0);
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(500);
    expect(res.body.error.code).toBe('INTERNAL_ERROR');
  });
});

describe('Emergency Analytics — data type and value boundary coverage', () => {
  it('activePremises is a number in response data', async () => {
    setupAnalyticsMocks({ activePremises: 7 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.activePremises).toBe('number');
  });

  it('fraOverdueCount is a number in response data', async () => {
    setupAnalyticsMocks({ fraOverdue: 4 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.fraOverdueCount).toBe('number');
    expect(res.body.data.fraOverdueCount).toBe(4);
  });

  it('response body has success:true on all successful calls', async () => {
    setupAnalyticsMocks();
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.body.success).toBe(true);
  });

  it('multiple criticalAlerts can be present simultaneously', async () => {
    setupAnalyticsMocks({
      activeIncidents: 1,
      fraOverdue: 2,
      wardenExpiring: 3,
      equipmentDue: 4,
      premisesNoDrill: 5,
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.criticalAlerts.length).toBeGreaterThan(1);
  });

  it('bcpCount and bcpNotTestedCount are both numbers', async () => {
    setupAnalyticsMocks({ bcpCount: 10, bcpNotTested: 3 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.bcpCount).toBe('number');
    expect(typeof res.body.data.bcpNotTestedCount).toBe('number');
  });

  it('drillsDueSoon equals premisesNoDrill value from mock', async () => {
    setupAnalyticsMocks({ premisesNoDrill: 9 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.drillsDueSoon).toBe(9);
  });

  it('incidentTypeBreakdown EVACUATON key maps correctly from groupBy mock', async () => {
    setupAnalyticsMocks({
      incidentBreakdown: [{ emergencyType: 'EVACUATION', _count: 7 }],
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.incidentTypeBreakdown.EVACUATION).toBe(7);
  });

  it('response content-type is application/json', async () => {
    setupAnalyticsMocks();
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.headers['content-type']).toMatch(/application\/json/);
  });
});

describe('Emergency Analytics — final boundary coverage', () => {
  it('peepReviewDue is a number in response', async () => {
    setupAnalyticsMocks({ peepDue: 5 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.peepReviewDue).toBe('number');
    expect(res.body.data.peepReviewDue).toBe(5);
  });

  it('wardenTrainingExpiring is a number in response', async () => {
    setupAnalyticsMocks({ wardenExpiring: 2 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.wardenTrainingExpiring).toBe('number');
  });

  it('recentIncidents returns correct emergencyType field', async () => {
    setupAnalyticsMocks({
      recentIncidents: [
        { id: 'inc-x', incidentNumber: 'INC-2026-0099', emergencyType: 'CHEMICAL', premises: { name: 'Lab' } },
      ],
    });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(res.body.data.recentIncidents[0].emergencyType).toBe('CHEMICAL');
  });

  it('incidentsLast30Days is a number in response', async () => {
    setupAnalyticsMocks({ incidentsLast30: 4 });
    const res = await request(app).get('/api/analytics/dashboard');
    expect(res.status).toBe(200);
    expect(typeof res.body.data.incidentsLast30Days).toBe('number');
  });
});
