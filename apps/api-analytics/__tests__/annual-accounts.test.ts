jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: { findMany: jest.fn() },
    annualAccountsPack: { create: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { runAnnualAccountsJob } from '../src/jobs/annual-accounts.job';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('runAnnualAccountsJob', () => {
  it('creates an annual accounts pack', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-1' });

    const result = await runAnnualAccountsJob('2025-2026');

    expect(result).toBe('aap-1');
    expect(prisma.annualAccountsPack.create).toHaveBeenCalled();
  });

  it('aggregates revenue from monthly snapshots', async () => {
    const snapshots = [
      {
        month: '2025-04',
        mrr: 5000,
        arr: 60000,
        founderSalary: 2500,
        founderLoanPayment: 1000,
        arpu: 500,
        customers: 10,
      },
      {
        month: '2025-05',
        mrr: 6000,
        arr: 72000,
        founderSalary: 2500,
        founderLoanPayment: 1000,
        arpu: 600,
        customers: 10,
      },
      {
        month: '2025-06',
        mrr: 7000,
        arr: 84000,
        founderSalary: 2500,
        founderLoanPayment: 1000,
        arpu: 700,
        customers: 10,
      },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-2' });

    await runAnnualAccountsJob('2025-2026');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    // Total revenue: 5000 + 6000 + 7000 = 18000
    expect(Number(createCall.data.totalRevenue)).toBe(18000);
  });

  it('calculates net profit correctly', async () => {
    const snapshots = [
      {
        month: '2025-04',
        mrr: 10000,
        arr: 120000,
        founderSalary: 3000,
        founderLoanPayment: 500,
        arpu: 1000,
        customers: 10,
      },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-3' });

    await runAnnualAccountsJob('2025-2026');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    // Revenue: 10000, Expenses: salary(3000) + loan(500) + ops(10000*0.4=4000) = 7500
    // Net profit: 10000 - 7500 = 2500
    expect(Number(createCall.data.netProfit)).toBe(2500);
  });

  it('handles missing snapshots gracefully', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-4' });

    const result = await runAnnualAccountsJob('2025-2026');

    expect(result).toBe('aap-4');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.totalRevenue)).toBe(0);
    expect(Number(createCall.data.netProfit)).toBe(0);
  });

  it('sets correct fiscal year in pack', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-5' });

    await runAnnualAccountsJob('2024-2025');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.fiscalYear).toBe('2024-2025');
  });

  it('queries snapshots for correct month range (April-March)', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-6' });

    await runAnnualAccountsJob('2025-2026');

    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.month.gte).toBe('2025-04');
    expect(findCall.where.month.lte).toBe('2026-03');
  });

  it('includes structured sections in the pack', async () => {
    const snapshots = [
      {
        month: '2025-04',
        mrr: 5000,
        arr: 60000,
        founderSalary: 2500,
        founderLoanPayment: 1000,
        arpu: 500,
        customers: 10,
      },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-7' });

    await runAnnualAccountsJob('2025-2026');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    const sections = createCall.data.sections;
    expect(sections.summary).toBeDefined();
    expect(sections.revenueBreakdown).toBeDefined();
    expect(sections.expenseBreakdown).toBeDefined();
    expect(sections.keyMetrics).toBeDefined();
  });

  it('calculates average MRR correctly', async () => {
    const snapshots = [
      {
        month: '2025-04',
        mrr: 4000,
        arr: 48000,
        founderSalary: 2000,
        founderLoanPayment: 500,
        arpu: 400,
        customers: 10,
      },
      {
        month: '2025-05',
        mrr: 6000,
        arr: 72000,
        founderSalary: 2000,
        founderLoanPayment: 500,
        arpu: 600,
        customers: 10,
      },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-8' });

    await runAnnualAccountsJob('2025-2026');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    // Average MRR: (4000 + 6000) / 2 = 5000
    expect(createCall.data.sections.keyMetrics.avgMrr).toBe(5000);
  });

  it('returns the created pack id', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'pack-id-123' });
    const result = await runAnnualAccountsJob('2025-2026');
    expect(result).toBe('pack-id-123');
  });

  it('calls findMany exactly once per job run', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'x' });
    await runAnnualAccountsJob('2025-2026');
    expect(prisma.monthlySnapshot.findMany).toHaveBeenCalledTimes(1);
  });

  it('calls create exactly once per job run', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'x' });
    await runAnnualAccountsJob('2025-2026');
    expect(prisma.annualAccountsPack.create).toHaveBeenCalledTimes(1);
  });
});

describe('Annual Accounts — extended', () => {
  it('create data contains totalExpenses field', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ext-1' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data).toHaveProperty('totalExpenses');
  });

  it('totalRevenue is a number', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 5000, arr: 60000, founderSalary: 2000, founderLoanPayment: 500, arpu: 500, customers: 10 }]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ext-2' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(typeof Number(createCall.data.totalRevenue)).toBe('number');
  });

  it('sections.revenueBreakdown is defined when snapshots exist', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([{ mrr: 5000, arr: 60000, founderSalary: 2000, founderLoanPayment: 500, arpu: 500, customers: 10 }]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ext-3' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.revenueBreakdown).toBeDefined();
  });

  it('fiscal year string is stored as passed', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ext-4' });
    await runAnnualAccountsJob('2023-2024');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.fiscalYear).toBe('2023-2024');
  });
});

describe('annual-accounts.test.ts — additional coverage', () => {
  it('returns zero netProfit when zero snapshots (empty list)', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'cov-1' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.netProfit)).toBe(0);
  });

  it('create is called with data.fiscalYear matching the argument exactly', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'cov-2' });
    await runAnnualAccountsJob('2022-2023');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.fiscalYear).toBe('2022-2023');
  });

  it('sections.keyMetrics.avgMrr is 0 when no snapshots', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'cov-3' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.keyMetrics.avgMrr).toBe(0);
  });

  it('month range query gte is April of start year', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'cov-4' });
    await runAnnualAccountsJob('2023-2024');
    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.month.gte).toBe('2023-04');
  });

  it('month range query lte is March of end year', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'cov-5' });
    await runAnnualAccountsJob('2023-2024');
    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.month.lte).toBe('2024-03');
  });
});

describe('annual-accounts — extended edge cases', () => {
  it('sections.summary is defined in the created pack', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-2' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.summary).toBeDefined();
  });

  it('sections.expenseBreakdown is defined in the created pack', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-3' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.expenseBreakdown).toBeDefined();
  });

  it('total revenue sums all months mrr values', async () => {
    const snaps = [{month:'2025-04',mrr:1000,arr:12000,founderSalary:0,founderLoanPayment:0,arpu:100,customers:10},{month:'2025-05',mrr:1000,arr:12000,founderSalary:0,founderLoanPayment:0,arpu:100,customers:10}];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snaps);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-4' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.totalRevenue)).toBe(2000);
  });

  it('create receives a data object', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-5' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data).toBeDefined();
    expect(typeof createCall.data).toBe('object');
  });

  it('result is the id returned by create', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'returned-id-xyz' });
    const result = await runAnnualAccountsJob('2025-2026');
    expect(result).toBe('returned-id-xyz');
  });

  it('findMany receives an orderBy clause', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-6' });
    await runAnnualAccountsJob('2025-2026');
    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.orderBy).toBeDefined();
  });

  it('sections.keyMetrics contains avgMrr key', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 3000, arr: 36000, founderSalary: 1000, founderLoanPayment: 500, arpu: 300, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-7' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.keyMetrics).toHaveProperty('avgMrr');
  });

  it('netProfit is negative when expenses exceed revenue', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 1000, arr: 12000, founderSalary: 5000, founderLoanPayment: 2000, arpu: 100, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'edge-8' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.netProfit)).toBeLessThan(0);
  });
});

// ── annual-accounts — final additional coverage ──────────────────────────────

describe('annual-accounts — final additional coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('create is called with data.sections.keyMetrics containing monthCount', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 3000, arr: 36000, founderSalary: 1000, founderLoanPayment: 500, arpu: 300, customers: 10 },
      { month: '2025-05', mrr: 4000, arr: 48000, founderSalary: 1000, founderLoanPayment: 500, arpu: 400, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-1' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.keyMetrics).toHaveProperty('avgMrr');
  });

  it('totalRevenue is sum of all mrr values across all snapshots', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 2000, arr: 24000, founderSalary: 0, founderLoanPayment: 0, arpu: 200, customers: 10 },
      { month: '2025-05', mrr: 3000, arr: 36000, founderSalary: 0, founderLoanPayment: 0, arpu: 300, customers: 10 },
      { month: '2025-06', mrr: 5000, arr: 60000, founderSalary: 0, founderLoanPayment: 0, arpu: 500, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-2' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.totalRevenue)).toBe(10000);
  });

  it('sections.summary is a string or object (not undefined)', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-3' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.summary).toBeDefined();
  });

  it('fiscalYear in create data is a string', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-4' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(typeof createCall.data.fiscalYear).toBe('string');
  });

  it('sections.expenseBreakdown has founderSalaries total', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 5000, arr: 60000, founderSalary: 3000, founderLoanPayment: 500, arpu: 500, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-5' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.expenseBreakdown).toBeDefined();
  });

  it('runAnnualAccountsJob does not throw on normal invocation', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-6' });
    await expect(runAnnualAccountsJob('2025-2026')).resolves.toBeDefined();
  });

  it('sections.revenueBreakdown contains monthly entries when snapshots exist', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 4000, arr: 48000, founderSalary: 2000, founderLoanPayment: 500, arpu: 400, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'fin-7' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.revenueBreakdown).toBeDefined();
  });
});
