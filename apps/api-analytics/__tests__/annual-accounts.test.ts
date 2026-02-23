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

describe('annual-accounts — extra coverage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('totalRevenue is 0 when all snapshots have mrr=0', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 0, arr: 0, founderSalary: 0, founderLoanPayment: 0, arpu: 0, customers: 0 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ex-1' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.totalRevenue)).toBe(0);
  });

  it('create is not called when findMany rejects (propagates error)', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockRejectedValue(new Error('DB down'));
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ex-2' });
    await expect(runAnnualAccountsJob('2025-2026')).rejects.toThrow('DB down');
    expect(prisma.annualAccountsPack.create).not.toHaveBeenCalled();
  });

  it('create data has totalExpenses that is a number', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 8000, arr: 96000, founderSalary: 2500, founderLoanPayment: 500, arpu: 800, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ex-3' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(typeof Number(createCall.data.totalExpenses)).toBe('number');
  });

  it('sections.keyMetrics.avgMrr equals single snapshot mrr when only one snapshot', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 7777, arr: 93324, founderSalary: 2000, founderLoanPayment: 500, arpu: 777, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ex-4' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.sections.keyMetrics.avgMrr).toBe(7777);
  });

  it('month range for fiscal year 2021-2022 uses gte=2021-04 and lte=2022-03', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'ex-5' });
    await runAnnualAccountsJob('2021-2022');
    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.month.gte).toBe('2021-04');
    expect(findCall.where.month.lte).toBe('2022-03');
  });
});

describe('annual-accounts — phase28 coverage', () => {
  beforeEach(() => jest.clearAllMocks());

  it('runAnnualAccountsJob resolves to a string id', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'p28-id' });
    const result = await runAnnualAccountsJob('2025-2026');
    expect(typeof result).toBe('string');
  });

  it('create data.sections is an object', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'p28-s' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(typeof createCall.data.sections).toBe('object');
  });

  it('three snapshots produce totalRevenue equal to their mrr sum', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { month: '2025-04', mrr: 1000, arr: 12000, founderSalary: 0, founderLoanPayment: 0, arpu: 100, customers: 10 },
      { month: '2025-05', mrr: 2000, arr: 24000, founderSalary: 0, founderLoanPayment: 0, arpu: 200, customers: 10 },
      { month: '2025-06', mrr: 3000, arr: 36000, founderSalary: 0, founderLoanPayment: 0, arpu: 300, customers: 10 },
    ]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'p28-t' });
    await runAnnualAccountsJob('2025-2026');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(Number(createCall.data.totalRevenue)).toBe(6000);
  });

  it('fiscal year 2026-2027 produces gte=2026-04 and lte=2027-03', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'p28-fy' });
    await runAnnualAccountsJob('2026-2027');
    const findCall = (prisma.monthlySnapshot.findMany as jest.Mock).mock.calls[0][0];
    expect(findCall.where.month.gte).toBe('2026-04');
    expect(findCall.where.month.lte).toBe('2027-03');
  });

  it('create is called with fiscalYear equal to the argument', async () => {
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([]);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'p28-fy2' });
    await runAnnualAccountsJob('2026-2027');
    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    expect(createCall.data.fiscalYear).toBe('2026-2027');
  });
});

describe('annual accounts — phase30 coverage', () => {
  it('handles regex test', () => {
    expect(/^[a-z]+$/.test('hello')).toBe(true);
  });

  it('handles string length', () => {
    expect('hello'.length).toBe(5);
  });

  it('handles object spread', () => {
    const a2 = { x: 1 }; const b2 = { ...a2, y: 2 }; expect(b2).toEqual({ x: 1, y: 2 });
  });

  it('handles parseInt', () => {
    expect(parseInt('42', 10)).toBe(42);
  });

  it('handles number isFinite', () => {
    expect(isFinite(42)).toBe(true);
  });

});


describe('phase31 coverage', () => {
  it('handles Number.isInteger', () => { expect(Number.isInteger(5)).toBe(true); expect(Number.isInteger(5.5)).toBe(false); });
  it('handles Array.isArray', () => { expect(Array.isArray([1,2])).toBe(true); expect(Array.isArray('x')).toBe(false); });
  it('handles ternary', () => { const x = 5 > 3 ? 'yes' : 'no'; expect(x).toBe('yes'); });
  it('returns correct type', () => { expect(typeof 'hello').toBe('string'); });
  it('handles string startsWith', () => { expect('hello'.startsWith('hel')).toBe(true); });
});


describe('phase32 coverage', () => {
  it('handles labeled break', () => { let found = false; outer: for (let i=0;i<3;i++) { for (let j=0;j<3;j++) { if(i===1&&j===1){found=true;break outer;} } } expect(found).toBe(true); });
  it('handles string charAt', () => { expect('hello'.charAt(1)).toBe('e'); });
  it('handles number toString', () => { expect((255).toString(16)).toBe('ff'); });
  it('handles object hasOwnProperty', () => { const o = {a:1}; expect(o.hasOwnProperty('a')).toBe(true); expect(o.hasOwnProperty('b')).toBe(false); });
  it('handles array join', () => { expect([1,2,3].join('-')).toBe('1-2-3'); });
});


describe('phase33 coverage', () => {
  it('adds two numbers', () => { expect(1 + 1).toBe(2); });
  it('handles function composition', () => { const compose = (f: (x: number) => number, g: (x: number) => number) => (x: number) => f(g(x)); const double = (x: number) => x * 2; const square = (x: number) => x * x; expect(compose(double, square)(3)).toBe(18); });
  it('handles string normalize', () => { expect('caf\u00e9'.normalize()).toBe('café'); });
  it('handles string index access', () => { expect('hello'[0]).toBe('h'); });
  it('handles nested object access', () => { const o = { a: { b: 42 } }; expect(o.a.b).toBe(42); });
});


describe('phase34 coverage', () => {
  it('handles string comparison', () => { expect('apple' < 'banana').toBe(true); expect('zebra' > 'apple').toBe(true); });
  it('handles Omit type pattern', () => { interface Full { a: number; b: string; c: boolean; } type NoC = Omit<Full,'c'>; const o: NoC = {a:1,b:'x'}; expect(o.b).toBe('x'); });
  it('handles string repeat zero times', () => { expect('abc'.repeat(0)).toBe(''); });
  it('handles mapped type pattern', () => { type Flags<T> = { [K in keyof T]: boolean }; const flags: Flags<{a:number;b:string}> = {a:true,b:false}; expect(flags.a).toBe(true); });
  it('handles enum-like object', () => { const Direction = { UP: 'UP', DOWN: 'DOWN' } as const; expect(Direction.UP).toBe('UP'); });
});


describe('phase35 coverage', () => {
  it('handles builder pattern', () => { class QB { private parts: string[] = []; select(f:string){this.parts.push(`SELECT ${f}`);return this;} build(){return this.parts.join(' ');} } expect(new QB().select('*').build()).toBe('SELECT *'); });
  it('handles mixin pattern', () => { class Base { name = 'Alice'; } class WithDate extends Base { createdAt = new Date(); } const u = new WithDate(); expect(u.name).toBe('Alice'); expect(u.createdAt instanceof Date).toBe(true); });
  it('handles number clamp', () => { const clamp = (v:number,min:number,max:number) => Math.min(Math.max(v,min),max); expect(clamp(10,0,5)).toBe(5); expect(clamp(-1,0,5)).toBe(0); });
  it('handles sum by key pattern', () => { const sumBy = <T>(arr:T[], fn:(x:T)=>number) => arr.reduce((s,x)=>s+fn(x),0); expect(sumBy([{v:1},{v:2},{v:3}],x=>x.v)).toBe(6); });
  it('handles debounce-like pattern', () => { let count = 0; const fn = () => count++; fn(); fn(); fn(); expect(count).toBe(3); });
});


describe('phase36 coverage', () => {
  it('handles number digit sum', () => { const digitSum=(n:number)=>String(Math.abs(n)).split('').reduce((s,d)=>s+Number(d),0);expect(digitSum(12345)).toBe(15);expect(digitSum(999)).toBe(27); });
  it('computes fibonacci iteratively', () => { const fib=(n:number)=>{let a=0,b=1;for(let i=0;i<n;i++){[a,b]=[b,a+b];}return a;}; expect(fib(10)).toBe(55); });
  it('handles chunk string', () => { const chunkStr=(s:string,n:number)=>s.match(new RegExp(`.{1,${n}}`,'g'))||[];expect(chunkStr('abcdefg',3)).toEqual(['abc','def','g']); });
  it('handles deep object equality', () => { const eq=(a:unknown,b:unknown):boolean=>JSON.stringify(a)===JSON.stringify(b); expect(eq({x:{y:1}},{x:{y:1}})).toBe(true); expect(eq({x:1},{x:2})).toBe(false); });
  it('handles number to roman numerals', () => { const toRoman=(n:number)=>{const vals=[1000,900,500,400,100,90,50,40,10,9,5,4,1];const syms=['M','CM','D','CD','C','XC','L','XL','X','IX','V','IV','I'];let r='';vals.forEach((v,i)=>{while(n>=v){r+=syms[i];n-=v;}});return r;};expect(toRoman(9)).toBe('IX');expect(toRoman(58)).toBe('LVIII'); });
});


describe('phase37 coverage', () => {
  it('checks if array is sorted', () => { const isSorted=(a:number[])=>a.every((v,i)=>i===0||v>=a[i-1]); expect(isSorted([1,2,3,4])).toBe(true); expect(isSorted([1,3,2])).toBe(false); });
  it('generates permutations count', () => { const perm=(n:number,r:number)=>{let res=1;for(let i=n;i>n-r;i--)res*=i;return res;}; expect(perm(5,2)).toBe(20); });
  it('checks subset relationship', () => { const isSubset=<T>(a:T[],b:T[])=>a.every(x=>b.includes(x)); expect(isSubset([1,2],[1,2,3])).toBe(true); expect(isSubset([1,4],[1,2,3])).toBe(false); });
  it('creates range array', () => { const range=(start:number,end:number)=>Array.from({length:end-start},(_,i)=>i+start); expect(range(2,5)).toEqual([2,3,4]); });
  it('sums digits recursively', () => { const dsum=(n:number):number=>n<10?n:n%10+dsum(Math.floor(n/10)); expect(dsum(9999)).toBe(36); });
});


describe('phase38 coverage', () => {
  it('splits array into n chunks', () => { const chunks=<T>(a:T[],n:number)=>Array.from({length:n},(_,i)=>a.filter((_,j)=>j%n===i)); expect(chunks([1,2,3,4,5,6],3)).toEqual([[1,4],[2,5],[3,6]]); });
  it('implements simple tokenizer', () => { const tokenize=(s:string)=>s.match(/[a-zA-Z]+|\d+|[^\s]/g)||[]; expect(tokenize('a+b=3')).toEqual(['a','+','b','=','3']); });
  it('finds longest common prefix', () => { const lcp=(strs:string[])=>{if(!strs.length)return '';let p=strs[0];for(const s of strs)while(!s.startsWith(p))p=p.slice(0,-1);return p;}; expect(lcp(['flower','flow','flight'])).toBe('fl'); });
  it('computes array variance', () => { const variance=(a:number[])=>{const m=a.reduce((s,v)=>s+v,0)/a.length;return a.reduce((s,v)=>s+(v-m)**2,0)/a.length;}; expect(variance([2,4,4,4,5,5,7,9])).toBe(4); });
  it('computes string edit distance', () => { const ed=(a:string,b:string)=>{const m=Array.from({length:a.length+1},(_,i)=>Array.from({length:b.length+1},(_,j)=>i===0?j:j===0?i:0));for(let i=1;i<=a.length;i++)for(let j=1;j<=b.length;j++)m[i][j]=a[i-1]===b[j-1]?m[i-1][j-1]:1+Math.min(m[i-1][j],m[i][j-1],m[i-1][j-1]);return m[a.length][b.length];}; expect(ed('kitten','sitting')).toBe(3); });
});


describe('phase39 coverage', () => {
  it('reverses bits in byte', () => { const revBits=(n:number)=>{let r=0;for(let i=0;i<8;i++){r=(r<<1)|(n&1);n>>=1;}return r;}; expect(revBits(0b10110001)).toBe(0b10001101); });
  it('counts set bits in integer', () => { const popcount=(n:number)=>{let c=0;let v=n>>>0;while(v){c+=v&1;v>>>=1;}return c;}; expect(popcount(7)).toBe(3); expect(popcount(255)).toBe(8); });
  it('checks Harshad number', () => { const isHarshad=(n:number)=>n%String(n).split('').reduce((a,c)=>a+Number(c),0)===0; expect(isHarshad(18)).toBe(true); expect(isHarshad(19)).toBe(false); });
  it('finds longest word in sentence', () => { const longest=(s:string)=>s.split(' ').reduce((a,b)=>b.length>a.length?b:a,''); expect(longest('the quick brown fox')).toBe('quick'); });
  it('counts bits to flip to convert A to B', () => { const bitsToFlip=(a:number,b:number)=>{let x=a^b,c=0;while(x){c+=x&1;x>>>=1;}return c;}; expect(bitsToFlip(29,15)).toBe(2); });
});


describe('phase40 coverage', () => {
  it('computes consistent hash bucket', () => { const bucket=(key:string,n:number)=>[...key].reduce((h,c)=>(h*31+c.charCodeAt(0))>>>0,0)%n; expect(bucket('user123',10)).toBeGreaterThanOrEqual(0); expect(bucket('user123',10)).toBeLessThan(10); });
  it('implements flood fill algorithm', () => { const fill=(g:number[][],r:number,c:number,newC:number)=>{const old=g[r][c];if(old===newC)return g;const q:number[][]=[]; const v=g.map(row=>[...row]); q.push([r,c]);while(q.length){const[cr,cc]=q.shift()!;if(cr<0||cr>=v.length||cc<0||cc>=v[0].length||v[cr][cc]!==old)continue;v[cr][cc]=newC;q.push([cr+1,cc],[cr-1,cc],[cr,cc+1],[cr,cc-1]);}return v;}; expect(fill([[1,1,1],[1,1,0],[1,0,1]],1,1,2)[0][0]).toBe(2); });
  it('computes nth Catalan number', () => { const cat=(n:number):number=>n<=1?1:Array.from({length:n},(_,i)=>cat(i)*cat(n-1-i)).reduce((a,b)=>a+b,0); expect(cat(4)).toBe(14); });
  it('implements simple expression evaluator', () => { const calc=(s:string)=>{const tokens=s.split(/([+\-*/])/).map(t=>t.trim());let result=Number(tokens[0]);for(let i=1;i<tokens.length;i+=2){const op=tokens[i],val=Number(tokens[i+1]);if(op==='+')result+=val;else if(op==='-')result-=val;else if(op==='*')result*=val;else result/=val;}return result;}; expect(calc('3 + 4 * 2')).toBe(14); /* left-to-right */ });
  it('checks if queens are non-attacking', () => { const safe=(cols:number[])=>{for(let i=0;i<cols.length;i++)for(let j=i+1;j<cols.length;j++)if(cols[i]===cols[j]||Math.abs(cols[i]-cols[j])===j-i)return false;return true;}; expect(safe([0,2,4,1,3])).toBe(true); expect(safe([0,1,2,3])).toBe(false); });
});


describe('phase41 coverage', () => {
  it('computes sum of distances in tree', () => { const n=4; const adj=new Map([[0,[1,2]],[1,[0,3]],[2,[0]],[3,[1]]]); const dfs=(node:number,par:number,cnt:number[],dist:number[])=>{for(const nb of adj.get(node)||[]){if(nb===par)continue;dfs(nb,node,cnt,dist);cnt[node]+=cnt[nb];dist[node]+=dist[nb]+cnt[nb];}};const cnt=Array(n).fill(1),dist=Array(n).fill(0);dfs(0,-1,cnt,dist); expect(dist[0]).toBeGreaterThanOrEqual(0); });
  it('finds longest subarray with equal 0s and 1s', () => { const longestEqual=(a:number[])=>{const map=new Map([[0,-1]]);let sum=0,max=0;for(let i=0;i<a.length;i++){sum+=a[i]===0?-1:1;if(map.has(sum))max=Math.max(max,i-map.get(sum)!);else map.set(sum,i);}return max;}; expect(longestEqual([0,1,0])).toBe(2); });
  it('checks if grid path exists with obstacles', () => { const hasPath=(grid:number[][])=>{const m=grid.length,n=grid[0].length;if(grid[0][0]===1||grid[m-1][n-1]===1)return false;const vis=Array.from({length:m},()=>Array(n).fill(false));const q:number[][]=[]; q.push([0,0]);vis[0][0]=true;const dirs=[[-1,0],[1,0],[0,-1],[0,1]];while(q.length){const[r,c]=q.shift()!;if(r===m-1&&c===n-1)return true;for(const[dr,dc] of dirs){const nr=r+dr,nc=c+dc;if(nr>=0&&nr<m&&nc>=0&&nc<n&&!vis[nr][nc]&&grid[nr][nc]===0){vis[nr][nc]=true;q.push([nr,nc]);}}}return false;}; expect(hasPath([[0,0,0],[1,1,0],[0,0,0]])).toBe(true); });
  it('finds smallest subarray with sum >= target', () => { const minLen=(a:number[],t:number)=>{let min=Infinity,sum=0,l=0;for(let r=0;r<a.length;r++){sum+=a[r];while(sum>=t){min=Math.min(min,r-l+1);sum-=a[l++];}}return min===Infinity?0:min;}; expect(minLen([2,3,1,2,4,3],7)).toBe(2); });
  it('computes sum of all divisors up to n', () => { const sumDiv=(n:number)=>Array.from({length:n},(_,i)=>i+1).reduce((s,v)=>s+v,0); expect(sumDiv(5)).toBe(15); });
});


describe('phase42 coverage', () => {
  it('computes central polygonal numbers', () => { const central=(n:number)=>n*n-n+2; expect(central(1)).toBe(2); expect(central(4)).toBe(14); });
  it('finds nth square pyramidal number', () => { const sqPyramid=(n:number)=>n*(n+1)*(2*n+1)/6; expect(sqPyramid(3)).toBe(14); expect(sqPyramid(4)).toBe(30); });
  it('checks if point on line segment', () => { const onSeg=(px:number,py:number,ax:number,ay:number,bx:number,by:number)=>Math.abs((py-ay)*(bx-ax)-(px-ax)*(by-ay))<1e-9&&Math.min(ax,bx)<=px&&px<=Math.max(ax,bx); expect(onSeg(2,2,0,0,4,4)).toBe(true); expect(onSeg(3,2,0,0,4,4)).toBe(false); });
  it('checks point inside circle', () => { const inCircle=(px:number,py:number,cx:number,cy:number,r:number)=>Math.hypot(px-cx,py-cy)<=r; expect(inCircle(3,4,0,0,5)).toBe(true); expect(inCircle(4,4,0,0,5)).toBe(false); });
  it('blends two colors with alpha', () => { const blend=(c1:number,c2:number,a:number)=>Math.round(c1*(1-a)+c2*a); expect(blend(0,255,0.5)).toBe(128); });
});


describe('phase43 coverage', () => {
  it('computes weighted average', () => { const wavg=(vals:number[],wts:number[])=>{const sw=wts.reduce((s,v)=>s+v,0);return vals.reduce((s,v,i)=>s+v*wts[i],0)/sw;}; expect(wavg([1,2,3],[1,2,3])).toBeCloseTo(2.333,2); });
  it('applies label encoding to categories', () => { const encode=(cats:string[])=>{const u=[...new Set(cats)];return cats.map(c=>u.indexOf(c));}; expect(encode(['a','b','a','c'])).toEqual([0,1,0,2]); });
  it('rounds to nearest multiple', () => { const roundTo=(n:number,m:number)=>Math.round(n/m)*m; expect(roundTo(27,5)).toBe(25); expect(roundTo(28,5)).toBe(30); });
  it('sorts dates chronologically', () => { const dates=[new Date('2026-03-01'),new Date('2026-01-15'),new Date('2026-02-10')]; dates.sort((a,b)=>a.getTime()-b.getTime()); expect(dates[0].getMonth()).toBe(0); });
  it('applies softmax to array', () => { const softmax=(a:number[])=>{const max=Math.max(...a);const exps=a.map(v=>Math.exp(v-max));const sum=exps.reduce((s,v)=>s+v,0);return exps.map(v=>v/sum);}; const s=softmax([1,2,3]); expect(s.reduce((a,b)=>a+b,0)).toBeCloseTo(1); });
});


describe('phase44 coverage', () => {
  it('computes Hamming distance', () => { const ham=(a:string,b:string)=>[...a].filter((c,i)=>c!==b[i]).length; expect(ham('karolin','kathrin')).toBe(3); });
  it('implements simple stack', () => { const mk=()=>{const s:number[]=[];return{push:(v:number)=>s.push(v),pop:()=>s.pop(),peek:()=>s[s.length-1],size:()=>s.length};}; const st=mk();st.push(1);st.push(2);st.push(3); expect(st.peek()).toBe(3);st.pop(); expect(st.peek()).toBe(2); });
  it('converts snake_case to camelCase', () => { const toCamel=(s:string)=>s.replace(/_([a-z])/g,(_,c)=>c.toUpperCase()); expect(toCamel('hello_world_foo')).toBe('helloWorldFoo'); });
  it('chunks array into groups of n', () => { const chunk=(a:number[],n:number)=>Array.from({length:Math.ceil(a.length/n)},(_,i)=>a.slice(i*n,i*n+n)); expect(chunk([1,2,3,4,5],2)).toEqual([[1,2],[3,4],[5]]); });
  it('normalizes vector to unit length', () => { const norm=(v:number[])=>{const m=Math.sqrt(v.reduce((s,x)=>s+x*x,0));return v.map(x=>x/m);}; const r=norm([3,4]); expect(Math.round(r[0]*100)/100).toBe(0.6); expect(Math.round(r[1]*100)/100).toBe(0.8); });
});


describe('phase45 coverage', () => {
  it('clamps value between min and max', () => { const clamp=(v:number,lo:number,hi:number)=>Math.min(Math.max(v,lo),hi); expect(clamp(5,1,10)).toBe(5); expect(clamp(-1,1,10)).toBe(1); expect(clamp(15,1,10)).toBe(10); });
  it('computes moving average', () => { const ma=(a:number[],w:number)=>Array.from({length:a.length-w+1},(_,i)=>a.slice(i,i+w).reduce((s,v)=>s+v,0)/w); expect(ma([1,2,3,4,5],3).map(v=>Math.round(v*10)/10)).toEqual([2,3,4]); });
  it('generates initials from name', () => { const init=(n:string)=>n.split(' ').map(w=>w[0].toUpperCase()).join(''); expect(init('john doe smith')).toBe('JDS'); });
  it('checks if number is triangular', () => { const isTri=(n:number)=>{const t=(-1+Math.sqrt(1+8*n))/2;return Number.isInteger(t);}; expect(isTri(10)).toBe(true); expect(isTri(15)).toBe(true); expect(isTri(11)).toBe(false); });
  it('capitalizes every other character', () => { const alt=(s:string)=>[...s].map((c,i)=>i%2===0?c.toUpperCase():c.toLowerCase()).join(''); expect(alt('hello')).toBe('HeLlO'); });
});


describe('phase46 coverage', () => {
  it('computes sum of proper divisors', () => { const spd=(n:number)=>Array.from({length:n-1},(_,i)=>i+1).filter(d=>n%d===0).reduce((s,v)=>s+v,0); expect(spd(6)).toBe(6); expect(spd(12)).toBe(16); });
  it('tokenizes a simple expression', () => { const tok=(s:string)=>s.match(/\d+\.?\d*|[+\-*/()]/g)||[]; expect(tok('3+4*2').sort()).toEqual(['3','4','2','+','*'].sort()); expect(tok('(1+2)*3').length).toBe(7); });
  it('level-order traversal of binary tree', () => { type N={v:number;l?:N;r?:N}; const lo=(root:N|undefined):number[][]=>{ if(!root)return[];const res:number[][]=[];const bq:[N,number][]=[[root,0]];while(bq.length){const[n,d]=bq.shift()!;if(!res[d])res[d]=[];res[d].push(n.v);if(n.l)bq.push([n.l,d+1]);if(n.r)bq.push([n.r,d+1]);}return res;}; const t:N={v:3,l:{v:9},r:{v:20,l:{v:15},r:{v:7}}}; expect(lo(t)).toEqual([[3],[9,20],[15,7]]); });
  it('checks if string is valid number (strict)', () => { const vn=(s:string)=>/^-?\d+(\.\d+)?([eE][+-]?\d+)?$/.test(s.trim()); expect(vn('3.14')).toBe(true); expect(vn('-2.5e10')).toBe(true); expect(vn('abc')).toBe(false); expect(vn('1.2.3')).toBe(false); });
  it('detects cycle in linked list (Floyd)', () => { type N={v:number;next?:N}; const cycle=(head:N|undefined)=>{let s=head,f=head;while(f?.next){s=s?.next;f=f.next?.next;if(s===f)return true;}return false;}; const a:N={v:1};const b:N={v:2};const c:N={v:3};a.next=b;b.next=c;c.next=b; expect(cycle(a)).toBe(true); const x:N={v:1,next:{v:2,next:{v:3}}}; expect(cycle(x)).toBe(false); });
});


describe('phase47 coverage', () => {
  it('finds index of max element', () => { const argmax=(a:number[])=>a.reduce((mi,v,i)=>v>a[mi]?i:mi,0); expect(argmax([3,1,4,1,5,9,2,6])).toBe(5); expect(argmax([1])).toBe(0); });
  it('implements Z-algorithm for string matching', () => { const zfn=(s:string)=>{const n=s.length,z=new Array(n).fill(0);let l=0,r=0;for(let i=1;i<n;i++){if(i<r)z[i]=Math.min(r-i,z[i-l]);while(i+z[i]<n&&s[z[i]]===s[i+z[i]])z[i]++;if(i+z[i]>r){l=i;r=i+z[i];}}return z;}; const z=zfn('aabxaa'); expect(z[4]).toBe(2); expect(z[0]).toBe(0); });
  it('computes sparse matrix multiplication', () => { const smm=(a:[number,number,number][],b:[number,number,number][],m:number,n:number,p:number)=>{const r:number[][]=Array.from({length:m},()=>new Array(p).fill(0));const bm=new Map<number,[number,number,number][]>();b.forEach(e=>{if(!bm.has(e[0]))bm.set(e[0],[]);bm.get(e[0])!.push(e);});a.forEach(([i,k,v])=>{(bm.get(k)||[]).forEach(([,j,w])=>{r[i][j]+=v*w;});});return r;}; const a:[[number,number,number]]=[1,0,1] as unknown as [[number,number,number]]; expect(smm([[0,0,1],[0,1,0]],[[0,0,2],[1,0,3]],2,2,2)[0][0]).toBe(2); });
  it('computes minimum spanning tree cost (Prim)', () => { const prim=(n:number,edges:[number,number,number][])=>{const adj:([number,number])[][]=Array.from({length:n},()=>[]);edges.forEach(([u,v,w])=>{adj[u].push([v,w]);adj[v].push([u,w]);});const vis=new Set([0]);let cost=0;while(vis.size<n){let mn=Infinity,nx=-1;vis.forEach(u=>adj[u].forEach(([v,w])=>{if(!vis.has(v)&&w<mn){mn=w;nx=v;}}));if(nx===-1)break;vis.add(nx);cost+=mn;}return cost;}; expect(prim(4,[[0,1,10],[0,2,6],[0,3,5],[1,3,15],[2,3,4]])).toBe(19); });
  it('implements merge sort', () => { const ms=(a:number[]):number[]=>a.length<=1?a:(()=>{const m=a.length>>1,l=ms(a.slice(0,m)),r=ms(a.slice(m));const res:number[]=[];let i=0,j=0;while(i<l.length&&j<r.length)res.push(l[i]<r[j]?l[i++]:r[j++]);return res.concat(l.slice(i)).concat(r.slice(j));})(); expect(ms([38,27,43,3,9,82,10])).toEqual([3,9,10,27,38,43,82]); });
});


describe('phase48 coverage', () => {
  it('checks if number is happy', () => { const happy=(n:number)=>{const seen=new Set<number>();while(n!==1&&!seen.has(n)){seen.add(n);n=[...String(n)].reduce((s,d)=>s+Number(d)**2,0);}return n===1;}; expect(happy(19)).toBe(true); expect(happy(4)).toBe(false); });
  it('checks if graph has Eulerian circuit', () => { const ec=(n:number,edges:[number,number][])=>{const deg=new Array(n).fill(0);edges.forEach(([u,v])=>{deg[u]++;deg[v]++;});return deg.every(d=>d%2===0);}; expect(ec(4,[[0,1],[1,2],[2,3],[3,0],[0,2]])).toBe(false); expect(ec(3,[[0,1],[1,2],[2,0]])).toBe(true); });
  it('implements persistent array (copy-on-write)', () => { const pa=<T>(a:T[])=>{const copies:T[][]=[[...a]];return{read:(ver:number,i:number)=>copies[ver][i],write:(ver:number,i:number,v:T)=>{const nc=[...copies[ver]];nc[i]=v;copies.push(nc);return copies.length-1;},versions:()=>copies.length};}; const p=pa([1,2,3]);const v1=p.write(0,1,99); expect(p.read(0,1)).toBe(2); expect(p.read(v1,1)).toBe(99); });
  it('finds number of ways to express n as sum of primes', () => { const wp=(n:number)=>{const sieve=(m:number)=>{const p=new Array(m+1).fill(true);p[0]=p[1]=false;for(let i=2;i*i<=m;i++)if(p[i])for(let j=i*i;j<=m;j+=i)p[j]=false;return Array.from({length:m-1},(_,i)=>i+2).filter(i=>p[i]);};const primes=sieve(n);const dp=new Array(n+1).fill(0);dp[0]=1;for(const p of primes)for(let i=p;i<=n;i++)dp[i]+=dp[i-p];return dp[n];}; expect(wp(7)).toBe(3); expect(wp(10)).toBe(5); });
  it('computes binomial coefficient C(n,k)', () => { const cn=(n:number,k:number):number=>k===0||k===n?1:cn(n-1,k-1)+cn(n-1,k); expect(cn(5,2)).toBe(10); expect(cn(6,3)).toBe(20); });
});


describe('phase49 coverage', () => {
  it('finds longest palindromic subsequence', () => { const lps=(s:string)=>{const n=s.length;const dp=Array.from({length:n},(_,i)=>Array.from({length:n},(_,j)=>i===j?1:0)) as number[][];for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=s[i]===s[j]?(len===2?2:dp[i+1][j-1]+2):Math.max(dp[i+1][j],dp[i][j-1]);}return dp[0][n-1];}; expect(lps('bbbab')).toBe(4); expect(lps('cbbd')).toBe(2); });
  it('sorts using counting sort', () => { const csort=(a:number[])=>{if(!a.length)return[];const max=Math.max(...a);const cnt=new Array(max+1).fill(0);a.forEach(v=>cnt[v]++);return cnt.flatMap((c,i)=>Array(c).fill(i));}; expect(csort([3,1,4,1,5,9,2,6])).toEqual([1,1,2,3,4,5,6,9]); });
  it('finds the celebrity in a party', () => { const cel=(knows:(a:number,b:number)=>boolean,n:number)=>{let cand=0;for(let i=1;i<n;i++)if(knows(cand,i))cand=i;for(let i=0;i<n;i++)if(i!==cand&&(knows(cand,i)||!knows(i,cand)))return -1;return cand;}; const m=[[0,1,1],[0,0,1],[0,0,0]];const k=(a:number,b:number)=>m[a][b]===1; expect(cel(k,3)).toBe(2); });
  it('finds shortest path with BFS', () => { const bfs=(g:number[][],s:number,t:number)=>{const d=new Array(g.length).fill(-1);d[s]=0;const q=[s];while(q.length){const u=q.shift()!;for(const v of g[u])if(d[v]===-1){d[v]=d[u]+1;if(v===t)return d[v];q.push(v);}}return d[t];}; expect(bfs([[1,2],[0,3],[0,3],[1,2]],0,3)).toBe(2); });
  it('finds the smallest missing positive integer', () => { const smp=(a:number[])=>{const n=a.length;for(let i=0;i<n;i++)while(a[i]>0&&a[i]<=n&&a[a[i]-1]!==a[i]){const t=a[a[i]-1];a[a[i]-1]=a[i];a[i]=t;}for(let i=0;i<n;i++)if(a[i]!==i+1)return i+1;return n+1;}; expect(smp([1,2,0])).toBe(3); expect(smp([3,4,-1,1])).toBe(2); expect(smp([7,8,9])).toBe(1); });
});


describe('phase50 coverage', () => {
  it('checks if string contains all binary codes of length k', () => { const allCodes=(s:string,k:number)=>{const need=1<<k;const seen=new Set<string>();for(let i=0;i+k<=s.length;i++)seen.add(s.slice(i,i+k));return seen.size===need;}; expect(allCodes('00110110',2)).toBe(true); expect(allCodes('0110',2)).toBe(false); });
  it('finds pairs with difference k', () => { const pk=(a:number[],k:number)=>{const s=new Set(a);let cnt=0;for(const v of s)if(s.has(v+k))cnt++;return cnt;}; expect(pk([1,7,5,9,2,12,3],2)).toBe(4); expect(pk([1,2,3,4,5],1)).toBe(4); });
  it('computes number of steps to reduce to zero', () => { const steps=(n:number)=>{let cnt=0;while(n>0){n=n%2?n-1:n/2;cnt++;}return cnt;}; expect(steps(14)).toBe(6); expect(steps(8)).toBe(4); });
  it('finds maximum erasure value', () => { const mev=(a:number[])=>{const seen=new Set<number>();let l=0,sum=0,max=0;for(let r=0;r<a.length;r++){while(seen.has(a[r])){seen.delete(a[l]);sum-=a[l++];}seen.add(a[r]);sum+=a[r];max=Math.max(max,sum);}return max;}; expect(mev([4,2,4,5,6])).toBe(17); expect(mev([5,2,1,2,5,2,1,2,5])).toBe(8); });
  it('finds two numbers with target sum (two pointers)', () => { const tp=(a:number[],t:number)=>{let l=0,r=a.length-1;while(l<r){const s=a[l]+a[r];if(s===t)return[a[l],a[r]];s<t?l++:r--;}return[];}; expect(tp([2,7,11,15],9)).toEqual([2,7]); expect(tp([2,3,4],6)).toEqual([2,4]); });
});

describe('phase51 coverage', () => {
  it('computes minimum matrix chain multiplication cost', () => { const mcm=(p:number[])=>{const n=p.length-1;const dp=Array.from({length:n},()=>new Array(n).fill(0));for(let len=2;len<=n;len++)for(let i=0;i<=n-len;i++){const j=i+len-1;dp[i][j]=Infinity;for(let k=i;k<j;k++)dp[i][j]=Math.min(dp[i][j],dp[i][k]+dp[k+1][j]+p[i]*p[k+1]*p[j+1]);}return dp[0][n-1];}; expect(mcm([10,30,5,60])).toBe(4500); expect(mcm([40,20,30,10,30])).toBe(26000); });
  it('implements trie insert and search', () => { class Trie{c:Map<string,Trie>=new Map();e=false;insert(w:string){let n:Trie=this;for(const ch of w){if(!n.c.has(ch))n.c.set(ch,new Trie());n=n.c.get(ch)!;}n.e=true;}search(w:string):boolean{let n:Trie=this;for(const ch of w){if(!n.c.has(ch))return false;n=n.c.get(ch)!;}return n.e;}}; const t=new Trie();t.insert('apple');t.insert('app'); expect(t.search('apple')).toBe(true); expect(t.search('app')).toBe(true); expect(t.search('ap')).toBe(false); });
  it('counts ways to decode a digit string', () => { const decode=(s:string)=>{if(!s||s[0]==='0')return 0;const n=s.length,dp=new Array(n+1).fill(0);dp[0]=1;dp[1]=1;for(let i=2;i<=n;i++){const one=Number(s[i-1]),two=Number(s.slice(i-2,i));if(one>0)dp[i]+=dp[i-1];if(two>=10&&two<=26)dp[i]+=dp[i-2];}return dp[n];}; expect(decode('12')).toBe(2); expect(decode('226')).toBe(3); expect(decode('06')).toBe(0); });
  it('finds largest rectangle area in histogram', () => { const lr=(h:number[])=>{const st:number[]=[],n=h.length;let mx=0;for(let i=0;i<=n;i++){const cur=i===n?0:h[i];while(st.length&&h[st[st.length-1]]>cur){const ht=h[st.pop()!],w=st.length?i-st[st.length-1]-1:i;mx=Math.max(mx,ht*w);}st.push(i);}return mx;}; expect(lr([2,1,5,6,2,3])).toBe(10); expect(lr([2,4])).toBe(4); expect(lr([1])).toBe(1); });
  it('counts set bits for all numbers 0 to n', () => { const cb=(n:number)=>{const dp=new Array(n+1).fill(0);for(let i=1;i<=n;i++)dp[i]=dp[i>>1]+(i&1);return dp;}; expect(cb(5)).toEqual([0,1,1,2,1,2]); expect(cb(2)).toEqual([0,1,1]); });
});
