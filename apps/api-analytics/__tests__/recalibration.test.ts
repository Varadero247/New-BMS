jest.mock('../src/prisma', () => ({
  prisma: {
    monthlySnapshot: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
    },
    planTarget: {
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

import {
  calculateRollingAverages,
  projectForward,
  classifyTrajectory,
  blendTargets,
  runRecalibration,
} from '../src/jobs/recalibration';
import { prisma } from '../src/prisma';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('calculateRollingAverages', () => {
  it('returns zeros for empty array', () => {
    const result = calculateRollingAverages([]);
    expect(result.avgMrrGrowth).toBe(0);
    expect(result.avgChurnPct).toBe(0);
    expect(result.avgNewCustomers).toBe(0);
  });

  it('calculates 3-month rolling averages', () => {
    const snapshots = [
      { mrrGrowthPct: 10, revenueChurnPct: 2, newCustomers: 5 },
      { mrrGrowthPct: 20, revenueChurnPct: 3, newCustomers: 8 },
      { mrrGrowthPct: 15, revenueChurnPct: 1, newCustomers: 6 },
    ];
    const result = calculateRollingAverages(snapshots);
    expect(result.avgMrrGrowth).toBe(15);
    expect(result.avgChurnPct).toBe(2);
    expect(result.avgNewCustomers).toBeCloseTo(6.33, 1);
  });

  it('uses only the last N snapshots when window is smaller', () => {
    const snapshots = [
      { mrrGrowthPct: 100, revenueChurnPct: 50, newCustomers: 100 },
      { mrrGrowthPct: 10, revenueChurnPct: 2, newCustomers: 5 },
      { mrrGrowthPct: 20, revenueChurnPct: 4, newCustomers: 10 },
    ];
    const result = calculateRollingAverages(snapshots, 2);
    expect(result.avgMrrGrowth).toBe(15);
    expect(result.avgChurnPct).toBe(3);
    expect(result.avgNewCustomers).toBe(7.5);
  });
});

describe('projectForward', () => {
  it('projects MRR with positive growth', () => {
    const result = projectForward(10000, 10, 3);
    expect(result).toHaveLength(3);
    expect(result[0]).toBeCloseTo(11000, 0);
    expect(result[1]).toBeCloseTo(12100, 0);
    expect(result[2]).toBeCloseTo(13310, 0);
  });

  it('returns empty for 0 months', () => {
    const result = projectForward(10000, 10, 0);
    expect(result).toHaveLength(0);
  });

  it('handles negative growth', () => {
    const result = projectForward(10000, -10, 2);
    expect(result[0]).toBeCloseTo(9000, 0);
    expect(result[1]).toBeCloseTo(8100, 0);
  });

  it('handles zero growth', () => {
    const result = projectForward(5000, 0, 3);
    expect(result[0]).toBe(5000);
    expect(result[1]).toBe(5000);
    expect(result[2]).toBe(5000);
  });
});

describe('classifyTrajectory', () => {
  it('returns ON_TRACK for empty inputs', () => {
    expect(classifyTrajectory([], [])).toBe('ON_TRACK');
  });

  it('returns BEHIND when projected < 85% of planned', () => {
    expect(classifyTrajectory([5000], [10000])).toBe('BEHIND');
  });

  it('returns AHEAD when projected > 115% of planned', () => {
    expect(classifyTrajectory([12000], [10000])).toBe('AHEAD');
  });

  it('returns ON_TRACK when within 15% threshold', () => {
    expect(classifyTrajectory([9500], [10000])).toBe('ON_TRACK');
    expect(classifyTrajectory([10500], [10000])).toBe('ON_TRACK');
  });

  it('handles planned value of 0', () => {
    expect(classifyTrajectory([5000], [0])).toBe('ON_TRACK');
  });
});

describe('blendTargets', () => {
  it('blends 70% actual / 30% plan by default', () => {
    const result = blendTargets(10000, 8000);
    expect(result).toBe(9400); // 10000 * 0.7 + 8000 * 0.3
  });

  it('accepts custom weight', () => {
    const result = blendTargets(10000, 8000, 0.5);
    expect(result).toBe(9000); // 10000 * 0.5 + 8000 * 0.5
  });

  it('handles zero values', () => {
    expect(blendTargets(0, 0)).toBe(0);
    expect(blendTargets(0, 10000)).toBe(3000);
  });
});

describe('runRecalibration', () => {
  it('does nothing if snapshot not found', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue(null);
    await runRecalibration('nonexistent');
    expect(prisma.monthlySnapshot.update).not.toHaveBeenCalled();
  });

  it('skips recalibration with insufficient history', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue({
      id: 'snap-1',
      monthNumber: 1,
      mrr: 500,
      aiRecommendations: [],
    });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { monthNumber: 1, mrrGrowthPct: 0, revenueChurnPct: 0, newCustomers: 0 },
    ]);
    await runRecalibration('snap-1');
    expect(prisma.monthlySnapshot.update).not.toHaveBeenCalled();
  });

  it('runs recalibration with sufficient history', async () => {
    (prisma.monthlySnapshot.findUnique as jest.Mock).mockResolvedValue({
      id: 'snap-3',
      monthNumber: 3,
      mrr: 1500,
      aiRecommendations: [],
    });
    (prisma.monthlySnapshot.findMany as jest.Mock).mockResolvedValue([
      { monthNumber: 1, mrrGrowthPct: 10, revenueChurnPct: 2, newCustomers: 3 },
      { monthNumber: 2, mrrGrowthPct: 15, revenueChurnPct: 1, newCustomers: 4 },
      { monthNumber: 3, mrrGrowthPct: 12, revenueChurnPct: 2, newCustomers: 5 },
    ]);
    (prisma.planTarget.findMany as jest.Mock).mockResolvedValue([
      { monthNumber: 4, plannedMrr: 3000 },
      { monthNumber: 5, plannedMrr: 5000 },
      { monthNumber: 6, plannedMrr: 8000 },
    ]);
    (prisma.monthlySnapshot.update as jest.Mock).mockResolvedValue({});

    await runRecalibration('snap-3');
    expect(prisma.monthlySnapshot.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'snap-3' },
        data: expect.objectContaining({
          trajectory: expect.stringMatching(/BEHIND|ON_TRACK|AHEAD/),
        }),
      })
    );
  });
});
