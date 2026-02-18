import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('annual-accounts-job');

/**
 * Generates an AnnualAccountsPack by aggregating revenue/expenses from
 * MonthlySnapshot data. Fiscal year runs April to March (UK standard).
 */
export async function runAnnualAccountsJob(fiscalYearOverride?: string): Promise<string> {
  const now = new Date();

  // Determine fiscal year: April-March
  // If we are in Jan-Mar, the current fiscal year started last April
  // If we are in Apr-Dec, the current fiscal year started this April
  let fyStartYear: number;
  let fyEndYear: number;

  if (fiscalYearOverride) {
    const parts = fiscalYearOverride.split('-');
    fyStartYear = parseInt(parts[0]);
    fyEndYear = parseInt(parts[1]);
  } else {
    // Generate for the PREVIOUS fiscal year
    if (now.getMonth() < 3) {
      // Jan-Mar: previous FY was 2 years ago April to last year March
      fyStartYear = now.getFullYear() - 2;
      fyEndYear = now.getFullYear() - 1;
    } else {
      // Apr-Dec: previous FY was last year April to this year March
      fyStartYear = now.getFullYear() - 1;
      fyEndYear = now.getFullYear();
    }
  }

  const fiscalYear = `${fyStartYear}-${fyEndYear}`;
  const fyStartMonth = `${fyStartYear}-04`; // April
  const fyEndMonth = `${fyEndYear}-03`; // March

  logger.info('Starting annual accounts generation', { fiscalYear, fyStartMonth, fyEndMonth });

  // Fetch all monthly snapshots for the fiscal year
  const snapshots = await prisma.monthlySnapshot.findMany({
    where: {
      month: { gte: fyStartMonth, lte: fyEndMonth },
    },
    orderBy: { month: 'asc' },
  });

  if (snapshots.length === 0) {
    logger.warn('No snapshots found for fiscal year', { fiscalYear });
  }

  // Aggregate revenue from MRR
  const totalRevenue = snapshots.reduce((sum, s) => sum + Number(s.mrr || 0), 0);

  // Estimate expenses: approximate from known metrics
  // In production this would pull from actual expense records
  const salaryExpenses = snapshots.reduce((sum, s) => sum + Number(s.founderSalary || 0), 0);
  const loanPayments = snapshots.reduce((sum, s) => sum + Number(s.founderLoanPayment || 0), 0);

  // Estimated operational costs (hosting, tools, marketing) ~ 40% of revenue
  const operationalCosts = totalRevenue * 0.4;
  const totalExpenses = salaryExpenses + loanPayments + operationalCosts;
  const netProfit = totalRevenue - totalExpenses;

  // Build structured sections for accountant
  const sections = {
    summary: {
      fiscalYear,
      period: `${fyStartMonth} to ${fyEndMonth}`,
      monthsCovered: snapshots.length,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
    },
    revenueBreakdown: {
      mrrByMonth: snapshots.map((s) => ({
        month: s.month,
        mrr: Number(s.mrr),
        arr: Number(s.arr),
        customers: s.customers,
      })),
    },
    expenseBreakdown: {
      founderSalary: Math.round(salaryExpenses * 100) / 100,
      loanPayments: Math.round(loanPayments * 100) / 100,
      operationalCosts: Math.round(operationalCosts * 100) / 100,
    },
    keyMetrics: {
      avgMrr: snapshots.length > 0 ? Math.round((totalRevenue / snapshots.length) * 100) / 100 : 0,
      endingMrr: snapshots.length > 0 ? Number(snapshots[snapshots.length - 1].mrr) : 0,
      endingCustomers: snapshots.length > 0 ? snapshots[snapshots.length - 1].customers : 0,
      avgArpu:
        snapshots.length > 0
          ? Math.round(
              (snapshots.reduce((sum, s) => sum + Number(s.arpu || 0), 0) / snapshots.length) * 100
            ) / 100
          : 0,
    },
  };

  const pack = await prisma.annualAccountsPack.create({
    data: {
      fiscalYear,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      netProfit: Math.round(netProfit * 100) / 100,
      sections,
    },
  });

  logger.info('Annual accounts pack generated', {
    id: pack.id,
    fiscalYear,
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalExpenses: Math.round(totalExpenses * 100) / 100,
    netProfit: Math.round(netProfit * 100) / 100,
    monthsCovered: snapshots.length,
  });

  return pack.id;
}
