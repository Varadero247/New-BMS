import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('cashflow-forecast-job');

const WEEKS_TO_FORECAST = 13;

// Default planned weekly expenses
const DEFAULT_WEEKLY_EXPENSES = {
  hosting: 150,
  saasTools: 200,
  salaries: 1500,
  marketing: 100,
  office: 50,
  insurance: 25,
  misc: 75,
};

export async function runCashFlowForecastJob(): Promise<{ weeksCreated: number }> {
  logger.info('Starting cash flow forecast job');

  // Get current cash position
  let openingBalance = 30000; // Default starting balance

  try {
    const cashPosition = await prisma.companyCashPosition.findFirst({
      orderBy: { date: 'desc' },
    });
    if (cashPosition) {
      openingBalance = Number(cashPosition.bankBalance);
    }
  } catch (err) {
    logger.warn('Could not fetch cash position, using default', { error: String(err) });
  }

  // Get expected weekly revenue from latest snapshot
  let weeklyRevenue = 2000; // Default

  try {
    const latestSnapshot = await prisma.monthlySnapshot.findMany({
      orderBy: { monthNumber: 'desc' },
      take: 1,
    });
    if (latestSnapshot.length > 0 && latestSnapshot[0].mrr) {
      weeklyRevenue = Number(latestSnapshot[0].mrr) / 4.33; // Monthly to weekly
    }
  } catch (err) {
    logger.warn('Could not fetch snapshot for revenue estimate', { error: String(err) });
  }

  // Get planned expenses
  let totalWeeklyExpenses = Object.values(DEFAULT_WEEKLY_EXPENSES).reduce(
    (sum, val) => sum + val,
    0
  );

  try {
    const expenses = await prisma.plannedExpense.findMany({
      where: { isActive: true },
    });

    if (expenses.length > 0) {
      totalWeeklyExpenses = expenses.reduce((sum, exp) => {
        const amount = Number(exp.amount);
        switch (exp.frequency) {
          case 'MONTHLY':
            return sum + amount / 4.33;
          case 'QUARTERLY':
            return sum + amount / 13;
          case 'ANNUAL':
            return sum + amount / 52;
          case 'ONE_OFF':
            return sum; // One-offs handled separately
          default:
            return sum + amount / 4.33;
        }
      }, 0);
    }
  } catch (err) {
    logger.warn('Could not fetch planned expenses, using defaults', { error: String(err) });
  }

  // Clear existing forecasts before regenerating
  await prisma.cashFlowForecast.deleteMany({});

  // Generate 13 weekly forecasts
  const now = new Date();
  // Start from the beginning of the current week (Monday)
  const startOfWeek = new Date(now);
  const dayOfWeek = startOfWeek.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startOfWeek.setDate(startOfWeek.getDate() + mondayOffset);
  startOfWeek.setHours(0, 0, 0, 0);

  let currentBalance = openingBalance;
  let weeksCreated = 0;

  for (let week = 0; week < WEEKS_TO_FORECAST; week++) {
    const weekStart = new Date(startOfWeek);
    weekStart.setDate(weekStart.getDate() + week * 7);

    const inflows = Math.round(weeklyRevenue * 100) / 100;
    const outflows = Math.round(totalWeeklyExpenses * 100) / 100;
    const opening = Math.round(currentBalance * 100) / 100;
    const closing = Math.round((currentBalance + inflows - outflows) * 100) / 100;

    await prisma.cashFlowForecast.create({
      data: {
        weekStart,
        weekNumber: week + 1,
        openingBalance: opening,
        inflows,
        outflows,
        closingBalance: closing,
        details: {
          revenueEstimate: inflows,
          expenseBreakdown: week === 0 ? DEFAULT_WEEKLY_EXPENSES : undefined,
          notes: week === 0 ? 'First week uses detailed expense breakdown' : undefined,
        },
      },
    });

    currentBalance = closing;
    weeksCreated++;
  }

  logger.info('Cash flow forecast completed', {
    weeksCreated,
    openingBalance,
    finalBalance: currentBalance,
    weeklyRevenue: Math.round(weeklyRevenue * 100) / 100,
    weeklyExpenses: Math.round(totalWeeklyExpenses * 100) / 100,
  });

  return { weeksCreated };
}
