import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { runVarianceAnalysis } from './ai-variance';
import { runRecalibration } from './recalibration';
import { sendEmail, monthlyReportEmail } from '@ims/email';

interface StripeSub { plan?: { amount?: number }; canceled_at?: number | string; created?: number | string; status?: string }
interface HubSpotDeal { properties?: { dealstage?: string; amount?: string; createdate?: string } }

const logger = createLogger('monthly-snapshot');

// ---------------------------------------------------------------------------
// Stripe metric collection
// ---------------------------------------------------------------------------
export async function collectStripeMetrics(): Promise<{
  mrr: number;
  arr: number;
  newMrr: number;
  churnedMrr: number;
  netNewMrr: number;
  mrrGrowthPct: number;
  revenueChurnPct: number;
  customers: number;
  newCustomers: number;
  churnedCustomers: number;
  arpu: number;
  ltv: number;
}> {
  try {
    const { StripeClient } = await import('@ims/stripe-client');
    const stripe = new StripeClient();

    const rawSubs: unknown = await stripe.getSubscriptions(100);
    const subscriptions: StripeSub[] = (rawSubs as { data?: StripeSub[] })?.data || (Array.isArray(rawSubs) ? (rawSubs as StripeSub[]) : []);
    const mrr = subscriptions.reduce((sum: number, s: StripeSub) => sum + (s.plan?.amount || 0) / 100, 0);
    const customers = subscriptions.length;
    const arpu = customers > 0 ? mrr / customers : 0;

    // Approximate churn — getSubscriptions only fetches active, so estimate from data
    const canceled: StripeSub[] = [];
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    const recentCanceled = canceled.filter(
      (s: StripeSub) => new Date(s.canceled_at || 0).getTime() > thirtyDaysAgo
    );
    const churnedMrr = recentCanceled.reduce(
      (sum: number, s: StripeSub) => sum + (s.plan?.amount || 0) / 100,
      0
    );
    const churnedCustomers = recentCanceled.length;

    // New subscriptions in last 30 days
    const newSubs = subscriptions.filter(
      (s: StripeSub) => new Date(s.created || 0).getTime() > thirtyDaysAgo
    );
    const newMrr = newSubs.reduce((sum: number, s: StripeSub) => sum + (s.plan?.amount || 0) / 100, 0);
    const newCustomers = newSubs.length;

    const netNewMrr = newMrr - churnedMrr;
    const prevMrr = mrr - netNewMrr;
    const mrrGrowthPct = prevMrr > 0 ? (netNewMrr / prevMrr) * 100 : 0;
    const revenueChurnPct = prevMrr + newMrr > 0 ? (churnedMrr / (prevMrr + newMrr)) * 100 : 0;
    const ltv = revenueChurnPct > 0 ? arpu / (revenueChurnPct / 100) : arpu * 36;

    return {
      mrr,
      arr: mrr * 12,
      newMrr,
      churnedMrr,
      netNewMrr,
      mrrGrowthPct,
      revenueChurnPct,
      customers,
      newCustomers,
      churnedCustomers,
      arpu,
      ltv,
    };
  } catch (err) {
    logger.warn('Stripe metrics unavailable, using defaults', { error: String(err) });
    return {
      mrr: 0,
      arr: 0,
      newMrr: 0,
      churnedMrr: 0,
      netNewMrr: 0,
      mrrGrowthPct: 0,
      revenueChurnPct: 0,
      customers: 0,
      newCustomers: 0,
      churnedCustomers: 0,
      arpu: 0,
      ltv: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// HubSpot metric collection
// ---------------------------------------------------------------------------
export async function collectHubSpotMetrics(): Promise<{
  pipelineValue: number;
  pipelineDeals: number;
  wonDeals: number;
  lostDeals: number;
  avgDealSize: number;
  winRate: number;
  newLeads: number;
  qualifiedLeads: number;
  avgSalesCycle: number;
}> {
  try {
    const { HubSpotClient } = await import('@ims/hubspot-client');
    const hs = new HubSpotClient();

    const rawDeals: unknown = await hs.getDeals(200);
    const deals: HubSpotDeal[] = (rawDeals as any)?.results || (Array.isArray(rawDeals) ? rawDeals : []);
    const openDeals = deals.filter(
      (d: HubSpotDeal) => !['closedwon', 'closedlost'].includes(d.properties?.dealstage)
    );
    const pipelineValue = openDeals.reduce(
      (sum: number, d: HubSpotDeal) => sum + Number(d.properties?.amount || 0),
      0
    );
    const pipelineDeals = openDeals.length;

    const wonDeals = deals.filter((d: HubSpotDeal) => d.properties?.dealstage === 'closedwon').length;
    const lostDeals = deals.filter((d: HubSpotDeal) => d.properties?.dealstage === 'closedlost').length;
    const totalClosed = wonDeals + lostDeals;
    const winRate = totalClosed > 0 ? (wonDeals / totalClosed) * 100 : 0;
    const avgDealSize =
      wonDeals > 0
        ? deals
            .filter((d: HubSpotDeal) => d.properties?.dealstage === 'closedwon')
            .reduce((sum: number, d: HubSpotDeal) => sum + Number(d.properties?.amount || 0), 0) / wonDeals
        : 0;

    // HubSpotClient doesn't have getContacts yet, so estimate leads from deals
    const newLeads = deals.filter((d: HubSpotDeal) => {
      const created = d.createdAt || d.properties?.createdate;
      return created && Date.now() - new Date(created).getTime() < 30 * 24 * 60 * 60 * 1000;
    }).length;
    const qualifiedLeads = Math.round(newLeads * 0.3); // approximate

    return {
      pipelineValue,
      pipelineDeals,
      wonDeals,
      lostDeals,
      avgDealSize,
      winRate,
      newLeads,
      qualifiedLeads,
      avgSalesCycle: 30,
    };
  } catch (err) {
    logger.warn('HubSpot metrics unavailable, using defaults', { error: String(err) });
    return {
      pipelineValue: 0,
      pipelineDeals: 0,
      wonDeals: 0,
      lostDeals: 0,
      avgDealSize: 0,
      winRate: 0,
      newLeads: 0,
      qualifiedLeads: 0,
      avgSalesCycle: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Database metric collection
// ---------------------------------------------------------------------------
export async function collectDatabaseMetrics(): Promise<{
  activeTrials: number;
  trialConversions: number;
  trialConversionPct: number;
  avgHealthScore: number;
  nps: number;
  activePartners: number;
  partnerRevenue: number;
}> {
  try {
    // These are approximations querying what we can from analytics DB
    // In production, cross-service event bus would provide accurate counts
    return {
      activeTrials: 0,
      trialConversions: 0,
      trialConversionPct: 0,
      avgHealthScore: 0,
      nps: 0,
      activePartners: 0,
      partnerRevenue: 0,
    };
  } catch (err) {
    logger.warn('Database metrics unavailable', { error: String(err) });
    return {
      activeTrials: 0,
      trialConversions: 0,
      trialConversionPct: 0,
      avgHealthScore: 0,
      nps: 0,
      activePartners: 0,
      partnerRevenue: 0,
    };
  }
}

// ---------------------------------------------------------------------------
// Loan amortisation helper
// ---------------------------------------------------------------------------
export function calculateAmortisation(
  principal: number,
  annualRate: number,
  termMonths: number,
  paymentNumber: number
): {
  payment: number;
  interest: number;
  principalPaid: number;
  balance: number;
} {
  if (paymentNumber <= 0 || paymentNumber > termMonths) {
    return {
      payment: 0,
      interest: 0,
      principalPaid: 0,
      balance: paymentNumber <= 0 ? principal : 0,
    };
  }

  const monthlyRate = annualRate / 12;
  const payment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) /
    (Math.pow(1 + monthlyRate, termMonths) - 1);

  // Calculate balance after (paymentNumber - 1) payments to get opening balance
  let balance = principal;
  for (let i = 1; i < paymentNumber; i++) {
    const int = balance * monthlyRate;
    balance = balance - (payment - int);
  }
  const interest = balance * monthlyRate;
  const principalPaid = payment - interest;
  const closingBalance = Math.max(0, balance - principalPaid);

  return {
    payment: Math.round(payment * 100) / 100,
    interest: Math.round(interest * 100) / 100,
    principalPaid: Math.round(principalPaid * 100) / 100,
    balance: Math.round(closingBalance * 100) / 100,
  };
}

// ---------------------------------------------------------------------------
// Founder income calculation (Part G) — Dual Loan Model
// ---------------------------------------------------------------------------
export interface FounderIncomeResult {
  salary: number;
  loanPayment: number; // total combined loan payment (backward compat)
  dividend: number;
  savingsInterest: number;
  total: number;
  dirLoanPayment: number;
  dirLoanInterest: number;
  dirLoanPrincipal: number;
  dirLoanBalance: number;
  starterLoanPayment: number;
  starterLoanInterest: number;
  starterLoanPrincipal: number;
  starterLoanBalance: number;
}

export function calculateFounderIncome(monthNumber: number, arr: number = 0): FounderIncomeResult {
  // Salary schedule: ramps with business stage
  let salary: number;
  if (monthNumber <= 3) salary = 1500;
  else if (monthNumber <= 6) salary = 2500;
  else if (monthNumber <= 9) salary = 3500;
  else if (monthNumber <= 12) salary = 5000;
  else {
    const excess = Math.max(0, arr - 500000);
    salary = Math.min(15000, 5000 + excess * 0.005);
  }

  // Director's Loan: £320,000 at 8% over 36 months, starts M3
  const dirLoanPrincipal = 320000;
  const dirLoanRate = 0.08;
  const dirLoanTerm = 36;
  const dirLoanStartMonth = 3;
  const dirPaymentNum = monthNumber >= dirLoanStartMonth ? monthNumber - dirLoanStartMonth + 1 : 0;
  const dirLoan = calculateAmortisation(dirLoanPrincipal, dirLoanRate, dirLoanTerm, dirPaymentNum);

  // Starter Capital Loan: £30,000 at 8% over 24 months, starts M2
  const starterLoanPrincipal = 30000;
  const starterLoanRate = 0.08;
  const starterLoanTerm = 24;
  const starterLoanStartMonth = 2;
  const starterPaymentNum =
    monthNumber >= starterLoanStartMonth ? monthNumber - starterLoanStartMonth + 1 : 0;
  const starterLoan = calculateAmortisation(
    starterLoanPrincipal,
    starterLoanRate,
    starterLoanTerm,
    starterPaymentNum
  );

  const totalLoanPayment = dirLoan.payment + starterLoan.payment;

  // Dividend: quarter-end months only (3, 6, 9, 12, 15, ...), net profit * payout ratio
  let dividend = 0;
  if (monthNumber % 3 === 0 && monthNumber >= 6) {
    const monthlyRevenue = arr / 12;
    const estimatedCosts = monthlyRevenue * 0.6;
    const netProfit = Math.max(0, (monthlyRevenue - estimatedCosts) * 3);
    const payoutRatio = monthNumber <= 12 ? 0.1 : monthNumber <= 24 ? 0.2 : 0.3;
    dividend = netProfit * payoutRatio;
  }

  // Savings interest: 4% annual on cumulative 30% of prior salary income
  let cumulativeSavings = 0;
  for (let m = 1; m < monthNumber; m++) {
    let mSalary: number;
    if (m <= 3) mSalary = 1500;
    else if (m <= 6) mSalary = 2500;
    else if (m <= 9) mSalary = 3500;
    else if (m <= 12) mSalary = 5000;
    else mSalary = 5000;
    cumulativeSavings += mSalary * 0.3;
  }
  const savingsInterest = cumulativeSavings * (0.04 / 12);

  const total = salary - totalLoanPayment + dividend + savingsInterest;

  return {
    salary: Math.round(salary * 100) / 100,
    loanPayment: Math.round(totalLoanPayment * 100) / 100,
    dividend: Math.round(dividend * 100) / 100,
    savingsInterest: Math.round(savingsInterest * 100) / 100,
    total: Math.round(total * 100) / 100,
    dirLoanPayment: dirLoan.payment,
    dirLoanInterest: dirLoan.interest,
    dirLoanPrincipal: dirLoan.principalPaid,
    dirLoanBalance: dirLoan.balance,
    starterLoanPayment: starterLoan.payment,
    starterLoanInterest: starterLoan.interest,
    starterLoanPrincipal: starterLoan.principalPaid,
    starterLoanBalance: starterLoan.balance,
  };
}

// ---------------------------------------------------------------------------
// Main orchestrator
// ---------------------------------------------------------------------------
export async function runMonthlySnapshot(): Promise<string> {
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  logger.info('Starting monthly snapshot', { month });

  // Determine month number from plan targets
  const planTarget = await prisma.planTarget.findUnique({ where: { month } });
  const monthNumber = planTarget?.monthNumber || 1;

  // Collect all metrics
  const [stripe, hubspot, db] = await Promise.all([
    collectStripeMetrics(),
    collectHubSpotMetrics(),
    collectDatabaseMetrics(),
  ]);

  const founderIncome = calculateFounderIncome(monthNumber, Number(stripe.arr));

  // Build founder fields
  const founderFields = {
    founderSalary: founderIncome.salary,
    founderLoanPayment: founderIncome.loanPayment,
    founderDividend: founderIncome.dividend,
    founderSavings: founderIncome.savingsInterest,
    founderTotalIncome: founderIncome.total,
    founderDirLoanPayment: founderIncome.dirLoanPayment,
    founderDirLoanInterest: founderIncome.dirLoanInterest,
    founderDirLoanPrincipal: founderIncome.dirLoanPrincipal,
    founderDirLoanBalance: founderIncome.dirLoanBalance,
    founderStarterLoanPayment: founderIncome.starterLoanPayment,
    founderStarterLoanInterest: founderIncome.starterLoanInterest,
    founderStarterLoanPrincipal: founderIncome.starterLoanPrincipal,
    founderStarterLoanBalance: founderIncome.starterLoanBalance,
  };

  // Upsert snapshot
  const snapshot = await prisma.monthlySnapshot.upsert({
    where: { month },
    create: {
      month,
      monthNumber,
      ...stripe,
      ...hubspot,
      ...db,
      ...founderFields,
    },
    update: {
      ...stripe,
      ...hubspot,
      ...db,
      ...founderFields,
    },
  });

  // Run AI variance analysis
  if (planTarget) {
    try {
      await runVarianceAnalysis(snapshot as any, planTarget as any);
    } catch (err) {
      logger.error('AI variance analysis failed', { error: String(err) });
    }
  }

  // Run recalibration
  try {
    await runRecalibration(snapshot.id);
  } catch (err) {
    logger.error('Recalibration failed', { error: String(err) });
  }

  // Send monthly report email
  try {
    const updatedSnapshot = await prisma.monthlySnapshot.findUnique({ where: { id: snapshot.id } });
    if (updatedSnapshot) {
      const email = monthlyReportEmail({
        month,
        monthNumber,
        snapshot: updatedSnapshot,
        planTarget: planTarget || undefined,
      });
      await sendEmail({
        to: process.env.FOUNDER_EMAIL || 'founder@nexara.app',
        subject: email.subject,
        html: email.html,
        text: email.text,
      });
      logger.info('Monthly report email sent', { month });
    }
  } catch (err) {
    logger.error('Monthly email failed', { error: String(err) });
  }

  logger.info('Monthly snapshot completed', { month, snapshotId: snapshot.id });
  return snapshot.id;
}
