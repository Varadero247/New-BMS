jest.mock('../src/prisma', () => ({
  prisma: {
    cohortData: {
      create: jest.fn(),
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    monthlySnapshot: { findMany: jest.fn() },
  },
}));

jest.mock('@ims/monitoring', () => ({
  createLogger: () => ({ info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() }),
}));

import { runCohortAnalysis } from '../src/jobs/cohort-analysis';
import { prisma } from '../src/prisma';
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

beforeEach(() => {
  jest.clearAllMocks();
  // Default: no historical snapshots → fallback rates used (2.5% churn, 1.5% expansion)
  mockPrisma.monthlySnapshot.findMany.mockResolvedValue([]);
});

describe('runCohortAnalysis', () => {
  it('creates initial cohort with 100% retention for month 1', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({
      cohortMonth: '2026-03',
      measureMonth: '2026-03',
      retentionPct: 100,
    });

    await runCohortAnalysis(1, '2026-03');

    expect(prisma.cohortData.upsert).toHaveBeenCalledTimes(1);
    expect(prisma.cohortData.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        create: expect.objectContaining({ retentionPct: 100, ndrPct: 100, cohortAge: 0 }),
      })
    );
  });

  it('creates cohort data for each prior month', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    await runCohortAnalysis(3, '2026-05');

    // Should create 3 cohort records (for months 1, 2, 3)
    expect(prisma.cohortData.upsert).toHaveBeenCalledTimes(3);
  });

  it('calculates retention decay based on cohort age', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    await runCohortAnalysis(2, '2026-04');

    // First call: cohort age 1 (older cohort)
    const firstCall = (prisma.cohortData.upsert as jest.Mock).mock.calls[0][0];
    expect(firstCall.create.cohortAge).toBe(1);
    expect(firstCall.create.retentionPct).toBeLessThan(100);

    // Second call: cohort age 0 (current month)
    const secondCall = (prisma.cohortData.upsert as jest.Mock).mock.calls[1][0];
    expect(secondCall.create.cohortAge).toBe(0);
    expect(secondCall.create.retentionPct).toBe(100);
  });

  it('calculates NDR including expansion rate', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    await runCohortAnalysis(2, '2026-04');

    const firstCall = (prisma.cohortData.upsert as jest.Mock).mock.calls[0][0];
    // NDR: ndrFactor = (1 - 0.025) * (1 + 0.015) = 0.975 * 1.015 = 0.989625 → 98.96%
    expect(firstCall.create.ndrPct).toBe(98.96);
  });

  it('handles month 0 (no prior cohorts)', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    // monthNumber <= 1 uses the initial cohort path
    await runCohortAnalysis(1, '2026-03');
    expect(prisma.cohortData.upsert).toHaveBeenCalledTimes(1);
  });

  it('uses upsert to avoid duplicate cohort entries', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    await runCohortAnalysis(2, '2026-04');

    // All calls should use upsert
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(call[0]).toHaveProperty('where');
      expect(call[0]).toHaveProperty('create');
      expect(call[0]).toHaveProperty('update');
    }
  });

  it('rounds retention and NDR to 2 decimal places', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});

    await runCohortAnalysis(5, '2026-07');

    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      const { retentionPct, ndrPct } = call[0].create;
      expect(retentionPct).toBe(Math.round(retentionPct * 100) / 100);
      expect(ndrPct).toBe(Math.round(ndrPct * 100) / 100);
    }
  });

  it('throws on prisma error', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockRejectedValue(new Error('DB error'));
    await expect(runCohortAnalysis(2, '2026-04')).rejects.toThrow('DB error');
  });
});
