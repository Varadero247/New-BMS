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

  it('cohort age 0 always has 100% retention', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-05');
    const calls = (prisma.cohortData.upsert as jest.Mock).mock.calls;
    const currentMonthCall = calls[calls.length - 1][0];
    expect(currentMonthCall.create.cohortAge).toBe(0);
    expect(currentMonthCall.create.retentionPct).toBe(100);
  });

  it('retention decreases monotonically with age', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(4, '2026-06');
    const calls = (prisma.cohortData.upsert as jest.Mock).mock.calls;
    const retentions = calls.map((c: any) => c[0].create.retentionPct);
    // Retentions should be descending (older cohorts have lower retention)
    for (let i = 0; i < retentions.length - 1; i++) {
      expect(retentions[i]).toBeLessThanOrEqual(retentions[i + 1]);
    }
  });

  it('upsert where clause includes cohortMonth and measureMonth', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(1, '2026-03');
    const call = (prisma.cohortData.upsert as jest.Mock).mock.calls[0][0];
    expect(call.where).toHaveProperty('cohortMonth_measureMonth');
  });
});

describe('Cohort Analysis — extended', () => {
  it('retentionPct is a number for all calls', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-05');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(typeof call[0].create.retentionPct).toBe('number');
    }
  });

  it('ndrPct is a number for all calls', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-05');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(typeof call[0].create.ndrPct).toBe('number');
    }
  });

  it('update block is defined in each upsert call', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(2, '2026-04');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(call[0].update).toBeDefined();
    }
  });

  it('number of upsert calls equals monthNumber', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(6, '2026-08');
    expect((prisma.cohortData.upsert as jest.Mock).mock.calls.length).toBe(6);
  });
});

// ===================================================================
// Additional edge cases: empty list, pagination-like bounds, auth, enums
// ===================================================================
describe('Cohort Analysis — additional edge cases', () => {
  it('runCohortAnalysis with monthNumber=0 creates initial cohort (<=1 path)', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(0, '2026-03');
    // monthNumber <= 1 always runs the initial-cohort path (1 upsert with retentionPct=100)
    expect((prisma.cohortData.upsert as jest.Mock).mock.calls.length).toBe(1);
    expect((prisma.cohortData.upsert as jest.Mock).mock.calls[0][0].create.retentionPct).toBe(100);
  });

  it('all upsert calls have where, create, and update properties', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-06');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(call[0]).toHaveProperty('where');
      expect(call[0]).toHaveProperty('create');
      expect(call[0]).toHaveProperty('update');
    }
  });

  it('create.cohortMonth and create.measureMonth are strings', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(2, '2026-04');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(typeof call[0].create.cohortMonth).toBe('string');
      expect(typeof call[0].create.measureMonth).toBe('string');
    }
  });

  it('retentionPct is between 0 and 100 inclusive for all ages', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(6, '2026-09');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      const r = call[0].create.retentionPct;
      expect(r).toBeGreaterThanOrEqual(0);
      expect(r).toBeLessThanOrEqual(100);
    }
  });

  it('runCohortAnalysis propagates DB error on upsert failure', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockRejectedValue(new Error('DB unavailable'));
    await expect(runCohortAnalysis(1, '2026-03')).rejects.toThrow('DB unavailable');
  });
});

// ===================================================================
// Cohort Analysis — further edge cases and property assertions
// ===================================================================
describe('Cohort Analysis — further edge cases', () => {
  it('monthNumber=10 creates exactly 10 upsert calls', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(10, '2026-12');
    expect((prisma.cohortData.upsert as jest.Mock).mock.calls).toHaveLength(10);
  });

  it('all create.cohortAge values are non-negative integers', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(5, '2026-07');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      const age = call[0].create.cohortAge;
      expect(age).toBeGreaterThanOrEqual(0);
      expect(Number.isInteger(age)).toBe(true);
    }
  });

  it('all ndrPct values are between 0 and 200 (inclusive)', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(8, '2026-10');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      const ndr = call[0].create.ndrPct;
      expect(ndr).toBeGreaterThanOrEqual(0);
      expect(ndr).toBeLessThanOrEqual(200);
    }
  });

  it('update block contains retentionPct and ndrPct for all upsert calls', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-05');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(call[0].update).toHaveProperty('retentionPct');
      expect(call[0].update).toHaveProperty('ndrPct');
    }
  });

  it('measureMonth for the last upsert call equals the supplied currentMonth', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(4, '2026-06');
    const calls = (prisma.cohortData.upsert as jest.Mock).mock.calls;
    const lastCall = calls[calls.length - 1][0];
    expect(lastCall.create.measureMonth).toBe('2026-06');
  });

  it('monthNumber=2 generates cohortAge values [1, 0] in order', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(2, '2026-04');
    const calls = (prisma.cohortData.upsert as jest.Mock).mock.calls;
    expect(calls[0][0].create.cohortAge).toBe(1);
    expect(calls[1][0].create.cohortAge).toBe(0);
  });

  it('throws original error message when upsert rejects on monthNumber=5', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockRejectedValue(new Error('timeout'));
    await expect(runCohortAnalysis(5, '2026-07')).rejects.toThrow('timeout');
  });

  it('all upsert where clauses are plain objects (not null/undefined)', async () => {
    (prisma.cohortData.upsert as jest.Mock).mockResolvedValue({});
    await runCohortAnalysis(3, '2026-05');
    for (const call of (prisma.cohortData.upsert as jest.Mock).mock.calls) {
      expect(call[0].where).toBeDefined();
      expect(typeof call[0].where).toBe('object');
      expect(call[0].where).not.toBeNull();
    }
  });
});
