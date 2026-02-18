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
        } as any,
      });

      logger.info('Initial cohort created', { month });
      return;
    }

    // For each prior cohort month, calculate retention and NDR
    for (let i = 1; i <= monthNumber; i++) {
      const cohortAge = monthNumber - i;
      const cohortMonthDate = new Date(month + '-01');
      cohortMonthDate.setMonth(cohortMonthDate.getMonth() - cohortAge);
      const cohortMonth = cohortMonthDate.toISOString().slice(0, 7);

      // Dummy calculation based on cohort age:
      // Retention decays slightly with age, NDR includes expansion
      const baseRetention = 100;
      const monthlyChurn = 2.5; // 2.5% churn per month
      const retentionPct = Math.max(0, baseRetention - (cohortAge * monthlyChurn));

      // NDR: starts at 100%, expansion offsets some churn
      const expansionRate = 1.5; // 1.5% expansion per month
      const ndrPct = Math.max(0, 100 - (cohortAge * monthlyChurn) + (cohortAge * expansionRate));

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
        } as any,
        create: {
          cohortMonth,
          measureMonth: month,
          cohortAge,
          retentionPct: Math.round(retentionPct * 100) / 100,
          ndrPct: Math.round(ndrPct * 100) / 100,
        } as any,
      });
    }

    logger.info('Cohort analysis completed', { monthNumber, cohortsProcessed: monthNumber });
  } catch (error) {
    logger.error('Cohort analysis failed', { error: String(error) });
    throw error;
  }
}
