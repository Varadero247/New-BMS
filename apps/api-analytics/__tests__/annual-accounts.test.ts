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
      { month: '2025-04', mrr: 5000, arr: 60000, founderSalary: 2500, founderLoanPayment: 1000, arpu: 500, customers: 10 },
      { month: '2025-05', mrr: 6000, arr: 72000, founderSalary: 2500, founderLoanPayment: 1000, arpu: 600, customers: 10 },
      { month: '2025-06', mrr: 7000, arr: 84000, founderSalary: 2500, founderLoanPayment: 1000, arpu: 700, customers: 10 },
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
      { month: '2025-04', mrr: 10000, arr: 120000, founderSalary: 3000, founderLoanPayment: 500, arpu: 1000, customers: 10 },
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
      { month: '2025-04', mrr: 5000, arr: 60000, founderSalary: 2500, founderLoanPayment: 1000, arpu: 500, customers: 10 },
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
      { month: '2025-04', mrr: 4000, arr: 48000, founderSalary: 2000, founderLoanPayment: 500, arpu: 400, customers: 10 },
      { month: '2025-05', mrr: 6000, arr: 72000, founderSalary: 2000, founderLoanPayment: 500, arpu: 600, customers: 10 },
    ];
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue(snapshots);
    (prisma.annualAccountsPack.create as jest.Mock).mockResolvedValue({ id: 'aap-8' });

    await runAnnualAccountsJob('2025-2026');

    const createCall = (prisma.annualAccountsPack.create as jest.Mock).mock.calls[0][0];
    // Average MRR: (4000 + 6000) / 2 = 5000
    expect(createCall.data.sections.keyMetrics.avgMrr).toBe(5000);
  });
});
