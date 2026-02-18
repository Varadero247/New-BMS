import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('recalibration');

interface RollingAverages {
  avgMrrGrowth: number;
  avgChurnPct: number;
  avgNewCustomers: number;
}

interface Projection {
  projectedMrr: number[];
  projectedCustomers: number[];
}

type Trajectory = 'BEHIND' | 'ON_TRACK' | 'AHEAD';

// ---------------------------------------------------------------------------
// Rolling averages over the last N snapshots
// ---------------------------------------------------------------------------
export function calculateRollingAverages(
  snapshots: {
    mrrGrowthPct: number | null;
    revenueChurnPct: number | null;
    newCustomers: number;
  }[],
  windowSize: number = 3
): RollingAverages {
  if (snapshots.length === 0) {
    return { avgMrrGrowth: 0, avgChurnPct: 0, avgNewCustomers: 0 };
  }

  const window = snapshots.slice(-windowSize);
  const avgMrrGrowth = window.reduce((sum, s) => sum + Number(s.mrrGrowthPct), 0) / window.length;
  const avgChurnPct = window.reduce((sum, s) => sum + Number(s.revenueChurnPct), 0) / window.length;
  const avgNewCustomers = window.reduce((sum, s) => sum + s.newCustomers, 0) / window.length;

  return {
    avgMrrGrowth: Math.round(avgMrrGrowth * 100) / 100,
    avgChurnPct: Math.round(avgChurnPct * 100) / 100,
    avgNewCustomers: Math.round(avgNewCustomers * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Project MRR forward N months at a constant growth rate
// ---------------------------------------------------------------------------
export function projectForward(
  currentMrr: number,
  growthRatePct: number,
  months: number
): number[] {
  const projections: number[] = [];
  let mrr = currentMrr;

  for (let i = 0; i < months; i++) {
    mrr = mrr * (1 + growthRatePct / 100);
    projections.push(Math.round(mrr * 100) / 100);
  }

  return projections;
}

// ---------------------------------------------------------------------------
// Classify trajectory: BEHIND / ON_TRACK / AHEAD (15% threshold)
// ---------------------------------------------------------------------------
export function classifyTrajectory(projected: number[], planned: number[]): Trajectory {
  if (projected.length === 0 || planned.length === 0) return 'ON_TRACK';

  // Use the average ratio across projected months
  let totalRatio = 0;
  const len = Math.min(projected.length, planned.length);

  for (let i = 0; i < len; i++) {
    if (planned[i] > 0) {
      totalRatio += projected[i] / planned[i];
    } else {
      totalRatio += 1; // if planned is 0, treat as on track
    }
  }

  const avgRatio = totalRatio / len;

  if (avgRatio < 0.85) return 'BEHIND';
  if (avgRatio > 1.15) return 'AHEAD';
  return 'ON_TRACK';
}

// ---------------------------------------------------------------------------
// Blend actual trend with plan: 70% actual / 30% plan
// ---------------------------------------------------------------------------
export function blendTargets(actual: number, plan: number, weight: number = 0.7): number {
  return Math.round((actual * weight + plan * (1 - weight)) * 100) / 100;
}

// ---------------------------------------------------------------------------
// Main recalibration orchestrator
// ---------------------------------------------------------------------------
export async function runRecalibration(snapshotId: string): Promise<void> {
  const snapshot = await prisma.monthlySnapshot.findUnique({ where: { id: snapshotId } });
  if (!snapshot) {
    logger.warn('Snapshot not found for recalibration', { snapshotId });
    return;
  }

  // Get historical snapshots for rolling averages
  const history = await prisma.monthlySnapshot.findMany({
    where: { monthNumber: { lte: snapshot.monthNumber } },
    orderBy: { monthNumber: 'asc' },
  });

  if (history.length < 2) {
    logger.info('Insufficient history for recalibration', { months: history.length });
    return;
  }

  const averages = calculateRollingAverages(history as any);
  const currentMrr = Number(snapshot.mrr);

  // Project 3 months forward using rolling average growth
  const projectedMrr = projectForward(currentMrr, averages.avgMrrGrowth, 3);

  // Get plan targets for next 3 months
  const nextTargets = await prisma.planTarget.findMany({
    where: {
      monthNumber: {
        gt: snapshot.monthNumber,
        lte: snapshot.monthNumber + 3,
      },
    },
    orderBy: { monthNumber: 'asc' },
  });

  const plannedMrr = nextTargets.map((t: Record<string, unknown>) => Number(t.plannedMrr));
  const trajectory = classifyTrajectory(projectedMrr, plannedMrr);

  // Generate blended target recommendations
  const recommendations = nextTargets.map((target: Record<string, unknown>, i: number) => ({
    metric: 'MRR',
    current: projectedMrr[i] || currentMrr,
    suggested: blendTargets(projectedMrr[i] || currentMrr, Number(target.plannedMrr)),
    rationale: `Blended 70% actual trend (${averages.avgMrrGrowth}% avg growth) / 30% plan. Trajectory: ${trajectory}`,
  }));

  // Update snapshot with recalibration data
  const existingRecs = (snapshot.aiRecommendations as any[]) || [];
  await prisma.monthlySnapshot.update({
    where: { id: snapshotId },
    data: {
      trajectory,
      aiRecommendations: [...existingRecs, ...recommendations],
    },
  });

  logger.info('Recalibration completed', {
    snapshotId,
    trajectory,
    avgMrrGrowth: averages.avgMrrGrowth,
    projectedMrr,
  });
}
