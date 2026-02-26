// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('vat-summary-job');

// Regional VAT rates
const VAT_RATES = {
  UK: 0.2, // 20% UK VAT
  EU: 0.0, // 0% reverse charge
  GCC: 0.05, // 5% GCC VAT
  ROW: 0.0, // 0% rest of world
};

// Revenue distribution by region (estimated)
const REGION_DISTRIBUTION = {
  UK: 0.55, // 55% UK revenue
  EU: 0.2, // 20% EU revenue
  GCC: 0.1, // 10% GCC revenue
  ROW: 0.15, // 15% rest of world
};

export async function runVatSummaryJob(): Promise<string> {
  const now = new Date();
  // Calculate previous month
  const prevMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const period = `${prevMonth.getFullYear()}-${String(prevMonth.getMonth() + 1).padStart(2, '0')}`;

  logger.info('Starting VAT summary job', { period });

  // Try to get total revenue from the monthly snapshot
  let totalRevenue = 0;

  try {
    const snapshot = await prisma.monthlySnapshot.findMany({
      where: { month: period },
      take: 1,
    });

    if (snapshot.length > 0 && snapshot[0].mrr) {
      totalRevenue = Number(snapshot[0].mrr);
    }
  } catch (err) {
    logger.warn('Could not fetch snapshot for VAT calculation, using dummy data', {
      error: String(err),
    });
  }

  // Fall back to the most recent available snapshot if no current-month data
  if (totalRevenue === 0) {
    try {
      const latest = await prisma.monthlySnapshot.findFirst({
        where: { mrr: { gt: 0 } },
        orderBy: { month: 'desc' },
      });
      if (latest) {
        totalRevenue = Number(latest.mrr);
        logger.warn('No snapshot for current period, using most recent available', {
          period,
          fallbackMonth: latest.month,
          totalRevenue,
        });
      } else {
        logger.warn('No revenue snapshot available; VAT summary will show zero revenue', {
          period,
        });
      }
    } catch (fallbackErr) {
      logger.warn('Could not fetch fallback snapshot; using zero revenue', {
        error: String(fallbackErr),
      });
    }
  }

  // Calculate regional breakdown
  const ukRevenue = totalRevenue * REGION_DISTRIBUTION.UK;
  const euRevenue = totalRevenue * REGION_DISTRIBUTION.EU;
  const gccRevenue = totalRevenue * REGION_DISTRIBUTION.GCC;
  const rowRevenue = totalRevenue * REGION_DISTRIBUTION.ROW;

  const ukVat = ukRevenue * VAT_RATES.UK;
  const euVat = euRevenue * VAT_RATES.EU;
  const gccVat = gccRevenue * VAT_RATES.GCC;
  const rowVat = rowRevenue * VAT_RATES.ROW;

  const breakdown = [
    {
      region: 'UK',
      revenue: Math.round(ukRevenue * 100) / 100,
      vatRate: VAT_RATES.UK,
      vatDue: Math.round(ukVat * 100) / 100,
    },
    {
      region: 'EU',
      revenue: Math.round(euRevenue * 100) / 100,
      vatRate: VAT_RATES.EU,
      vatDue: Math.round(euVat * 100) / 100,
      note: 'Reverse charge applies',
    },
    {
      region: 'GCC',
      revenue: Math.round(gccRevenue * 100) / 100,
      vatRate: VAT_RATES.GCC,
      vatDue: Math.round(gccVat * 100) / 100,
    },
    {
      region: 'Rest of World',
      revenue: Math.round(rowRevenue * 100) / 100,
      vatRate: VAT_RATES.ROW,
      vatDue: Math.round(rowVat * 100) / 100,
    },
  ];

  const vatSummary = await prisma.vatSummary.upsert({
    where: { period },
    create: {
      period,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      ukVat: Math.round(ukVat * 100) / 100,
      euVat: Math.round(euVat * 100) / 100,
      gccVat: Math.round(gccVat * 100) / 100,
      restOfWorld: Math.round(rowVat * 100) / 100,
      breakdown,
      filingStatus: 'DRAFT',
    },
    update: {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      ukVat: Math.round(ukVat * 100) / 100,
      euVat: Math.round(euVat * 100) / 100,
      gccVat: Math.round(gccVat * 100) / 100,
      restOfWorld: Math.round(rowVat * 100) / 100,
      breakdown,
    },
  });

  logger.info('VAT summary completed', {
    period,
    totalRevenue,
    totalVat: ukVat + euVat + gccVat + rowVat,
    id: vatSummary.id,
  });

  return vatSummary.id;
}
