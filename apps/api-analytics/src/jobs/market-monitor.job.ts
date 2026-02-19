import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('market-monitor');

// ---------------------------------------------------------------------------
// Weekly Market Intelligence Monitor
// Queries CompetitorMonitor records, logs digest, updates lastCheckedAt
// ---------------------------------------------------------------------------
export async function runMarketMonitorJob(): Promise<void> {
  logger.info('Starting market monitor job');

  try {
    const competitors = await prisma.competitorMonitor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    if (competitors.length === 0) {
      logger.info('No competitors to monitor');
      return;
    }

    logger.info(`Processing ${competitors.length} competitors`);

    for (const competitor of competitors) {
      const intel = (competitor.intel as Array<Record<string, unknown>>) || [];
      const recentIntel = intel.filter((entry: Record<string, unknown>) => {
        const entryDate = new Date(entry.date as string);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return entryDate >= weekAgo;
      });

      logger.info('Competitor digest', {
        name: competitor.name,
        category: competitor.category,
        totalIntel: intel.length,
        recentIntel: recentIntel.length,
      });

      await prisma.competitorMonitor.update({
        where: { id: competitor.id },
        data: { lastCheckedAt: new Date() },
      });
    }

    logger.info('Market monitor job completed', {
      competitorsProcessed: competitors.length,
    });
  } catch (error) {
    logger.error('Market monitor job failed', { error: String(error) });
    throw error;
  }
}
