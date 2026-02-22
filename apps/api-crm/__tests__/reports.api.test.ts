import express from 'express';
import request from 'supertest';

jest.mock('../src/prisma', () => ({
  prisma: {
    crmDeal: {
      count: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
    },
    crmPartner: {
      findMany: jest.fn(),
    },
    crmAccount: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
    crmReferral: {
      findMany: jest.fn(),
      aggregate: jest.fn(),
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
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

const app = express();
app.use(express.json());
app.use('/api/reports', reportsRouter);

beforeEach(() => {
  jest.clearAllMocks();
});

// ===================================================================
// GET /api/reports/sales-dashboard
// ===================================================================

describe('GET /api/reports/sales-dashboard', () => {
  it('should return overall sales metrics', async () => {
    mockPrisma.crmDeal.count
      .mockResolvedValueOnce(100) // totalDeals
      .mockResolvedValueOnce(40) // wonDeals
      .mockResolvedValueOnce(30) // lostDeals
      .mockResolvedValueOnce(30); // openDeals
    mockPrisma.crmDeal.aggregate
      .mockResolvedValueOnce({ _sum: { value: 5000000 } }) // totalValue
      .mockResolvedValueOnce({ _sum: { value: 2000000 } }); // wonValue

    const res = await request(app).get('/api/reports/sales-dashboard');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalDeals).toBe(100);
    expect(res.body.data.wonDeals).toBe(40);
    expect(res.body.data.lostDeals).toBe(30);
    expect(res.body.data.openDeals).toBe(30);
    expect(res.body.data.totalValue).toBe(5000000);
    expect(res.body.data.wonValue).toBe(2000000);
    expect(res.body.data.avgDealSize).toBe(50000);
    expect(res.body.data.conversionRate).toBe(40);
  });

  it('should handle zero deals', async () => {
    mockPrisma.crmDeal.count.mockResolvedValue(0);
    mockPrisma.crmDeal.aggregate.mockResolvedValue({ _sum: { value: null } });

    const res = await request(app).get('/api/reports/sales-dashboard');

    expect(res.status).toBe(200);
    expect(res.body.data.totalDeals).toBe(0);
    expect(res.body.data.avgDealSize).toBe(0);
    expect(res.body.data.conversionRate).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.count.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/sales-dashboard');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/reports/pipeline-velocity
// ===================================================================

describe('GET /api/reports/pipeline-velocity', () => {
  it('should return average deal age and velocity by stage', async () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
    const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000);

    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { createdAt: fiveDaysAgo, stageId: 'stage-1' },
      { createdAt: tenDaysAgo, stageId: 'stage-1' },
      { createdAt: fiveDaysAgo, stageId: 'stage-2' },
    ]);

    const res = await request(app).get('/api/reports/pipeline-velocity');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.avgDealAge).toBeGreaterThan(0);
    expect(res.body.data.velocityByStage).toBeDefined();
    expect(res.body.data.velocityByStage.length).toBeGreaterThanOrEqual(2);
  });

  it('should return zero avg when no open deals', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/pipeline-velocity');

    expect(res.status).toBe(200);
    expect(res.body.data.avgDealAge).toBe(0);
    expect(res.body.data.velocityByStage).toHaveLength(0);
  });

  it('should handle deals with no stageId', async () => {
    const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);

    mockPrisma.crmDeal.findMany.mockResolvedValue([{ createdAt: fiveDaysAgo, stageId: null }]);

    const res = await request(app).get('/api/reports/pipeline-velocity');

    expect(res.status).toBe(200);
    expect(res.body.data.velocityByStage).toEqual(
      expect.arrayContaining([expect.objectContaining({ stageId: 'unassigned' })])
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/pipeline-velocity');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/reports/win-loss
// ===================================================================

describe('GET /api/reports/win-loss', () => {
  it('should return win/loss rates by source and assignee', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { status: 'WON', source: 'INBOUND', assignedTo: 'user-1' },
      { status: 'WON', source: 'INBOUND', assignedTo: 'user-1' },
      { status: 'LOST', source: 'OUTBOUND', assignedTo: 'user-2' },
      { status: 'LOST', source: 'INBOUND', assignedTo: 'user-1' },
    ]);

    const res = await request(app).get('/api/reports/win-loss');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.winRate).toBe(50);
    expect(res.body.data.lossRate).toBe(50);
    expect(res.body.data.bySource).toBeDefined();
    expect(res.body.data.byAssignee).toBeDefined();
  });

  it('should handle zero closed deals', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/win-loss');

    expect(res.status).toBe(200);
    expect(res.body.data.winRate).toBe(0);
    expect(res.body.data.lossRate).toBe(0);
    expect(res.body.data.bySource).toHaveLength(0);
    expect(res.body.data.byAssignee).toHaveLength(0);
  });

  it('should group deals with no source as UNKNOWN', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { status: 'WON', source: null, assignedTo: 'user-1' },
    ]);

    const res = await request(app).get('/api/reports/win-loss');

    expect(res.status).toBe(200);
    expect(res.body.data.bySource).toEqual(
      expect.arrayContaining([expect.objectContaining({ source: 'UNKNOWN' })])
    );
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/win-loss');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/reports/forecast
// ===================================================================

describe('GET /api/reports/forecast', () => {
  it('should return revenue forecast grouped by month', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { value: 10000, probability: 50, expectedCloseDate: new Date('2026-03-15') },
      { value: 20000, probability: 80, expectedCloseDate: new Date('2026-03-20') },
      { value: 5000, probability: 30, expectedCloseDate: new Date('2026-04-10') },
    ]);

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalWeightedForecast).toBeGreaterThan(0);
    expect(res.body.data.forecast).toBeDefined();
    expect(res.body.data.forecast.length).toBeGreaterThanOrEqual(2);
  });

  it('should handle deals with no expectedCloseDate', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { value: 10000, probability: 50, expectedCloseDate: null },
    ]);

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.forecast).toEqual(
      expect.arrayContaining([expect.objectContaining({ month: 'unscheduled' })])
    );
  });

  it('should return zero forecast when no open deals', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.totalWeightedForecast).toBe(0);
    expect(res.body.data.forecast).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/reports/partner-performance
// ===================================================================

describe('GET /api/reports/partner-performance', () => {
  it('should return partner performance metrics', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([
      {
        id: 'p-1',
        tier: 'TIER_1_REFERRAL',
        totalReferrals: 5,
        totalCommissionPaid: 2500,
        account: { name: 'Partner Corp' },
        referrals: [
          { deal: { value: 10000, status: 'WON' } },
          { deal: { value: 5000, status: 'OPEN' } },
        ],
      },
    ]);

    const res = await request(app).get('/api/reports/partner-performance');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalPartnerSourcedRevenue).toBe(10000);
    expect(res.body.data.totalCommissions).toBe(2500);
    expect(res.body.data.topPartners).toHaveLength(1);
    expect(res.body.data.topPartners[0].wonReferrals).toBe(1);
  });

  it('should return zeros when no partners', async () => {
    mockPrisma.crmPartner.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/partner-performance');

    expect(res.status).toBe(200);
    expect(res.body.data.totalPartnerSourcedRevenue).toBe(0);
    expect(res.body.data.topPartners).toHaveLength(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmPartner.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/partner-performance');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// GET /api/reports/customer-health
// ===================================================================

describe('GET /api/reports/customer-health', () => {
  it('should return customer health metrics', async () => {
    const recentDate = new Date();
    const oldDate = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);

    mockPrisma.crmAccount.findMany.mockResolvedValue([
      {
        id: 'a-1',
        name: 'Active Corp',
        lifetimeRevenue: 50000,
        openComplaintCount: 0,
        openNCRCount: 0,
        lastInvoiceDate: recentDate,
      },
      {
        id: 'a-2',
        name: 'Troubled Corp',
        lifetimeRevenue: 10000,
        openComplaintCount: 3,
        openNCRCount: 2,
        lastInvoiceDate: oldDate,
      },
      {
        id: 'a-3',
        name: 'Inactive Corp',
        lifetimeRevenue: 5000,
        openComplaintCount: 0,
        openNCRCount: 0,
        lastInvoiceDate: null,
      },
    ]);

    const res = await request(app).get('/api/reports/customer-health');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.totalCustomerAccounts).toBe(3);
    expect(res.body.data.avgLifetimeRevenue).toBeGreaterThan(0);
    expect(res.body.data.accountsWithOpenComplaints).toBe(1);
    expect(res.body.data.accountsWithOpenNCRs).toBe(1);
    expect(res.body.data.inactiveAccounts).toBe(2); // oldDate + null
    expect(res.body.data.healthBreakdown).toHaveLength(3);
  });

  it('should handle zero customer accounts', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([]);

    const res = await request(app).get('/api/reports/customer-health');

    expect(res.status).toBe(200);
    expect(res.body.data.totalCustomerAccounts).toBe(0);
    expect(res.body.data.avgLifetimeRevenue).toBe(0);
    expect(res.body.data.inactiveAccounts).toBe(0);
  });

  it('should handle null lifetimeRevenue', async () => {
    mockPrisma.crmAccount.findMany.mockResolvedValue([
      {
        id: 'a-1',
        name: 'New Corp',
        lifetimeRevenue: null,
        openComplaintCount: 0,
        openNCRCount: 0,
        lastInvoiceDate: new Date(),
      },
    ]);

    const res = await request(app).get('/api/reports/customer-health');

    expect(res.status).toBe(200);
    expect(res.body.data.avgLifetimeRevenue).toBe(0);
  });

  it('should return 500 on database error', async () => {
    mockPrisma.crmAccount.findMany.mockRejectedValue(new Error('DB error'));

    const res = await request(app).get('/api/reports/customer-health');

    expect(res.status).toBe(500);
  });
});

// ===================================================================
// Extended coverage
// ===================================================================

describe('CRM Reports — extended coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /sales-dashboard returns success:true in response shape', async () => {
    mockPrisma.crmDeal.count
      .mockResolvedValueOnce(10)
      .mockResolvedValueOnce(5)
      .mockResolvedValueOnce(3)
      .mockResolvedValueOnce(2);
    mockPrisma.crmDeal.aggregate
      .mockResolvedValueOnce({ _sum: { value: 100000 } })
      .mockResolvedValueOnce({ _sum: { value: 50000 } });

    const res = await request(app).get('/api/reports/sales-dashboard');

    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('data');
  });

  it('GET /pipeline-velocity returns 500 on DB error and success:false', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('Connection lost'));

    const res = await request(app).get('/api/reports/pipeline-velocity');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /win-loss correctly classifies 100% win rate', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { status: 'WON', source: 'INBOUND', assignedTo: 'user-1' },
      { status: 'WON', source: 'INBOUND', assignedTo: 'user-1' },
    ]);

    const res = await request(app).get('/api/reports/win-loss');

    expect(res.status).toBe(200);
    expect(res.body.data.winRate).toBe(100);
    expect(res.body.data.lossRate).toBe(0);
  });

  it('GET /forecast returns 500 on DB error and success:false', async () => {
    mockPrisma.crmDeal.findMany.mockRejectedValue(new Error('Timeout'));

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /partner-performance returns 500 on DB error and success:false', async () => {
    mockPrisma.crmPartner.findMany.mockRejectedValue(new Error('Network failure'));

    const res = await request(app).get('/api/reports/partner-performance');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });

  it('GET /forecast correctly weights deal value by probability', async () => {
    mockPrisma.crmDeal.findMany.mockResolvedValue([
      { value: 10000, probability: 100, expectedCloseDate: new Date('2026-06-15') },
    ]);

    const res = await request(app).get('/api/reports/forecast');

    expect(res.status).toBe(200);
    expect(res.body.data.totalWeightedForecast).toBe(10000);
  });

  it('GET /customer-health returns 500 and success:false on DB error', async () => {
    mockPrisma.crmAccount.findMany.mockRejectedValue(new Error('DB crash'));

    const res = await request(app).get('/api/reports/customer-health');

    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
  });
});
