// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('cohort-analysis');

// ---------------------------------------------------------------------------
// Cohort Analysis
// Creates CohortData records. For each prior cohort month, calculates
// retention % and NDR % against the current month.
// ---------------------------------------------------------------------------
export async function runCohortAnalysis(monthNumber: number, month: string): Promise<void> {
  logger.info('Starting cohort analysis', { monthNumber, month });

  try {
    if (monthNumber <= 1) {
      // First month — create the initial cohort with 100% retention
      await prisma.cohortData.upsert({
        where: {
          cohortMonth_measureMonth: {
            cohortMonth: month,
            measureMonth: month,
          },
        },
        update: {
          retentionPct: 100,
          ndrPct: 100,
        },
        create: {
          cohortMonth: month,
          measureMonth: month,
          cohortAge: 0,
          retentionPct: 100,
          ndrPct: 100,
        },
      });

      logger.info('Initial cohort created', { month });
      return;
    }

    // Load all available monthly snapshots for data-driven rate calculation
    const snapshots = await prisma.monthlySnapshot.findMany({
      select: { month: true, revenueChurnPct: true, mrrGrowthPct: true },
      orderBy: { month: 'asc' },
    });
    const snapshotMap = new Map(
      snapshots.map((s) => [
        s.month,
        {
          churnPct: Math.max(0, Number(s.revenueChurnPct) || 0),
          growthPct: Math.max(0, Number(s.mrrGrowthPct) || 0),
        },
      ])
    );

    // Env-configurable fallback rates when no snapshot data exists
    const FALLBACK_CHURN_PCT = parseFloat(process.env.COHORT_FALLBACK_CHURN_PCT || '2.5');
    const FALLBACK_EXPANSION_PCT = parseFloat(process.env.COHORT_FALLBACK_EXPANSION_PCT || '1.5');

    // For each prior cohort month, calculate retention and NDR
    for (let i = 1; i <= monthNumber; i++) {
      const cohortAge = monthNumber - i;
      const cohortMonthDate = new Date(month + '-01');
      cohortMonthDate.setMonth(cohortMonthDate.getMonth() - cohortAge);
      const cohortMonth = cohortMonthDate.toISOString().slice(0, 7);

      // Walk month-by-month from cohort start applying real churn/expansion rates
      let retentionFactor = 1.0;
      let ndrFactor = 1.0;
      for (let age = 0; age < cohortAge; age++) {
        const ageMonthDate = new Date(cohortMonth + '-01');
        ageMonthDate.setMonth(ageMonthDate.getMonth() + age);
        const ageMonth = ageMonthDate.toISOString().slice(0, 7);

        const snap = snapshotMap.get(ageMonth);
        const monthlyChurnRate = snap ? snap.churnPct / 100 : FALLBACK_CHURN_PCT / 100;
        // Net expansion = total MRR growth minus churn (capped at 0 to avoid negative expansion)
        const monthlyExpansionRate = snap
          ? Math.max(0, snap.growthPct - snap.churnPct) / 100
          : FALLBACK_EXPANSION_PCT / 100;

        retentionFactor *= 1 - monthlyChurnRate;
        ndrFactor *= (1 - monthlyChurnRate) * (1 + monthlyExpansionRate);
      }

      const retentionPct = Math.max(0, Math.round(retentionFactor * 10000) / 100);
      const ndrPct = Math.max(0, Math.round(ndrFactor * 10000) / 100);

      await prisma.cohortData.upsert({
        where: {
          cohortMonth_measureMonth: {
            cohortMonth,
            measureMonth: month,
          },
        },
        update: {
          cohortAge,
          retentionPct: Math.round(retentionPct * 100) / 100,
          ndrPct: Math.round(ndrPct * 100) / 100,
        },
        create: {
          cohortMonth,
          measureMonth: month,
          cohortAge,
          retentionPct: Math.round(retentionPct * 100) / 100,
          ndrPct: Math.round(ndrPct * 100) / 100,
        },
      });
    }

    logger.info('Cohort analysis completed', { monthNumber, cohortsProcessed: monthNumber });
  } catch (error) {
    logger.error('Cohort analysis failed', { error: String(error) });
    throw error;
  }
}
