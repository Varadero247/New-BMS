jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
    },
    planTarget: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
    },
  },
  Prisma: {
    Decimal: jest.fn((v: any) => v),
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

jest.mock('@ims/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ success: true }),
  monthlyReportEmail: jest.fn().mockReturnValue({ subject: 'test', html: '<p>test</p>', text: 'test' }),
}));

jest.mock('../src/jobs/ai-variance', () => ({
  runVarianceAnalysis: jest.fn().mockResolvedValue(null),
}));

jest.mock('../src/jobs/recalibration', () => ({
  runRecalibration: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@ims/stripe-client', () => ({
  StripeClient: jest.fn().mockImplementation(() => ({
    listSubscriptions: jest.fn().mockResolvedValue([]),
  })),
}));

jest.mock('@ims/hubspot-client', () => ({
  HubSpotClient: jest.fn().mockImplementation(() => ({
    getDeals: jest.fn().mockResolvedValue([]),
    getContacts: jest.fn().mockResolvedValue([]),
  })),
}));

import {
  collectStripeMetrics,
  collectHubSpotMetrics,
  collectDatabaseMetrics,
  calculateFounderIncome,
  runMonthlySnapshot,
} from '../src/jobs/monthly-snapshot.job';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('collectStripeMetrics', () => {
  it('returns default values when Stripe is unavailable', async () => {
    const metrics = await collectStripeMetrics();
    expect(metrics).toEqual(expect.objectContaining({
      mrr: expect.any(Number),
      arr: expect.any(Number),
      customers: expect.any(Number),
    }));
  });
});

describe('collectHubSpotMetrics', () => {
  it('returns default values when HubSpot is unavailable', async () => {
    const metrics = await collectHubSpotMetrics();
    expect(metrics).toEqual(expect.objectContaining({
      pipelineValue: expect.any(Number),
      pipelineDeals: expect.any(Number),
      newLeads: expect.any(Number),
    }));
  });
});

describe('collectDatabaseMetrics', () => {
  it('returns defaults', async () => {
    const metrics = await collectDatabaseMetrics();
    expect(metrics.activeTrials).toBe(0);
    expect(metrics.trialConversionPct).toBe(0);
  });
});

describe('calculateFounderIncome', () => {
  it('returns £1500 salary for month 1', () => {
    const result = calculateFounderIncome(1);
    expect(result.salary).toBe(1500);
  });

  it('returns £2500 salary for month 4', () => {
    const result = calculateFounderIncome(4);
    expect(result.salary).toBe(2500);
  });

  it('returns £3500 salary for month 7', () => {
    const result = calculateFounderIncome(7);
    expect(result.salary).toBe(3500);
  });

  it('returns £5000 salary for month 10', () => {
    const result = calculateFounderIncome(10);
    expect(result.salary).toBe(5000);
  });

  it('scales salary with ARR after month 12', () => {
    const result = calculateFounderIncome(13, 600000);
    expect(result.salary).toBe(5500); // 5000 + (600k - 500k) * 0.005
  });

  it('caps salary at £15000', () => {
    const result = calculateFounderIncome(13, 3000000);
    expect(result.salary).toBe(15000);
  });

  it('calculates dual loan payments', () => {
    // Month 3: both Director's (starts M3) and Starter (starts M2) loans active
    const result = calculateFounderIncome(3);
    expect(result.dirLoanPayment).toBeGreaterThan(9000);
    expect(result.dirLoanPayment).toBeLessThan(11000);
    expect(result.starterLoanPayment).toBeGreaterThan(1200);
    expect(result.starterLoanPayment).toBeLessThan(1500);
    expect(result.loanPayment).toBe(result.dirLoanPayment + result.starterLoanPayment);
  });

  it('has no loan payment after both loans mature', () => {
    const result = calculateFounderIncome(40);
    expect(result.loanPayment).toBe(0);
  });

  it('no dividend before month 6', () => {
    const result = calculateFounderIncome(3);
    expect(result.dividend).toBe(0);
  });

  it('pays dividend on quarter-end months after M6', () => {
    const result = calculateFounderIncome(6, 100000);
    expect(result.dividend).toBeGreaterThan(0);
  });

  it('returns all fields with correct types', () => {
    const result = calculateFounderIncome(1);
    expect(typeof result.salary).toBe('number');
    expect(typeof result.loanPayment).toBe('number');
    expect(typeof result.dividend).toBe('number');
    expect(typeof result.savingsInterest).toBe('number');
    expect(typeof result.total).toBe('number');
    expect(typeof result.dirLoanPayment).toBe('number');
    expect(typeof result.starterLoanPayment).toBe('number');
  });

  it('first month has zero savings interest', () => {
    const result = calculateFounderIncome(1);
    expect(result.savingsInterest).toBe(0);
  });

  it('handles negative MRR edge case (0 ARR)', () => {
    const result = calculateFounderIncome(1, 0);
    expect(result.salary).toBe(1500);
  });
});

describe('runMonthlySnapshot', () => {
  it('creates a snapshot and returns its ID', async () => {
    const mockId = '00000000-0000-0000-0000-000000000001';
    (prisma.planTarget.findUnique as jest.Mock).mockResolvedValue({
      monthNumber: 1,
      month: '2026-03',
      plannedMrr: 0,
      plannedCustomers: 0,
      plannedNewCustomers: 0,
      plannedChurnPct: 0,
      plannedArpu: 0,
    });
    (prisma.monthlySnapshot.upsert as jest.Mock).mockResolvedValue({ id: mockId, month: '2026-02' });
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue({ id: mockId, month: '2026-02', mrr: 0, arr: 0 });

    const result = await runMonthlySnapshot();
    expect(result).toBe(mockId);
    expect(prisma.monthlySnapshot.upsert).toHaveBeenCalled();
  });
});
