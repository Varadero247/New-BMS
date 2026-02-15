import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('feature-aggregation-job');

export async function runFeatureAggregationJob(): Promise<void> {
  logger.info('Starting feature aggregation job');

  try {
    const allRequests = await prisma.featureRequest.findMany();

    const statusGroups: Record<string, number> = {};
    for (const fr of allRequests) {
      const status = fr.status || 'UNKNOWN';
      statusGroups[status] = (statusGroups[status] || 0) + 1;
    }

    const total = allRequests.length;
    const topByVotes = [...allRequests]
      .sort((a, b) => (b.votes || 0) - (a.votes || 0))
      .slice(0, 10)
      .map((fr) => ({ id: fr.id, title: fr.title, votes: fr.votes }));

    logger.info('Feature aggregation monthly report', {
      total,
      statusGroups,
      topByVotes,
      reportDate: new Date().toISOString(),
    });
  } catch (err) {
    logger.error('Feature aggregation job failed', { error: String(err) });
  }
}
