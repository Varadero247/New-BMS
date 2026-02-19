import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('board-pack');

// ---------------------------------------------------------------------------
// Quarterly Board Pack Generation
// Creates a BoardPack for the current quarter, aggregating recent snapshots
// ---------------------------------------------------------------------------
export async function runBoardPackJob(): Promise<string> {
  logger.info('Starting board pack generation');

  try {
    const now = new Date();
    const quarter = Math.ceil((now.getMonth() + 1) / 3);
    const year = now.getFullYear();
    const title = `Q${quarter} ${year} Board Pack`;

    // Get recent monthly snapshots (last 3 months for the quarter)
    const _quarterStartMonth = (quarter - 1) * 3 + 1;
    const snapshots = await prisma.monthlySnapshot.findMany({
      orderBy: { monthNumber: 'desc' },
      take: 3,
    });

    // Aggregate metrics from snapshots
    const latestSnapshot = snapshots[0] || null;
    const avgMrr =
      snapshots.length > 0
        ? snapshots.reduce(
            (sum: number, s: Record<string, unknown>) => sum + Number(s.mrr || 0),
            0
          ) / snapshots.length
        : 0;
    const avgCustomers =
      snapshots.length > 0
        ? Math.round(
            snapshots.reduce(
              (sum: number, s: Record<string, unknown>) => sum + Number(s.customers || 0),
              0
            ) / snapshots.length
          )
        : 0;

    const sections = {
      executiveSummary: {
        title: 'Executive Summary',
        content: `Q${quarter} ${year} performance overview. ${snapshots.length} months of data analyzed.`,
        highlights: latestSnapshot
          ? [
              `Current MRR: £${Number(latestSnapshot.mrr || 0).toLocaleString()}`,
              `Active customers: ${latestSnapshot.customers || 0}`,
              `Trajectory: ${latestSnapshot.trajectory || 'N/A'}`,
            ]
          : ['No snapshot data available'],
      },
      revenueMetrics: {
        title: 'Revenue Metrics',
        avgMrr: Math.round(avgMrr * 100) / 100,
        latestMrr: latestSnapshot ? Number(latestSnapshot.mrr || 0) : 0,
        mrrGrowth: latestSnapshot ? Number(latestSnapshot.mrrGrowthPct || 0) : 0,
      },
      pipeline: {
        title: 'Pipeline',
        summary: 'Pipeline data aggregated from CRM and analytics sources.',
        newCustomers: latestSnapshot ? Number(latestSnapshot.newCustomers || 0) : 0,
      },
      customerHealth: {
        title: 'Customer Health',
        avgCustomers,
        churnRate: latestSnapshot ? Number(latestSnapshot.revenueChurnPct || 0) : 0,
        ndr: latestSnapshot ? Number((latestSnapshot as { ndr?: number | null }).ndr || 0) : 0,
      },
      founderIncome: {
        title: 'Founder Income',
        summary: 'Founder income and draw details for the quarter.',
        founderDraw: latestSnapshot
          ? Number((latestSnapshot as { founderDraw?: number | null }).founderDraw || 0)
          : 0,
      },
    };

    const boardPack = await prisma.boardPack.create({
      data: {
        title,
        quarter: `Q${quarter}`,
        year,
        status: 'DRAFT',
        sections: sections as Record<string, unknown>,
        generatedAt: now,
      },
    });

    logger.info('Board pack generated', { id: boardPack.id, title, quarter: `Q${quarter}`, year });
    return boardPack.id;
  } catch (error) {
    logger.error('Board pack generation failed', { error: String(error) });
    throw error;
  }
}
