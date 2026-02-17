import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('gdpr-monitor-job');

export async function runGdprMonitorJob(): Promise<void> {
  logger.info('Running GDPR monitor job');

  try {
    const categories = await prisma.gdprDataCategory.findMany();
    const now = new Date();
    let flaggedCount = 0;

    for (const category of categories) {
      if (!category.retentionDays || !category.createdAt) continue;

      const retentionDeadline = new Date(category.createdAt);
      retentionDeadline.setDate(retentionDeadline.getDate() + category.retentionDays);

      if (retentionDeadline < now && category.complianceStatus !== 'AT_RISK') {
        await prisma.gdprDataCategory.update({
          where: { id: category.id },
          data: { complianceStatus: 'AT_RISK' },
        });
        logger.warn('GDPR category flagged as AT_RISK — retention period exceeded', {
          id: category.id,
          category: category.category,
          retentionDays: category.retentionDays,
        });
        flaggedCount++;
      }
    }

    const compliant = categories.filter((c: Record<string, unknown>) => c.complianceStatus === 'COMPLIANT').length;
    const atRisk = categories.filter((c: Record<string, unknown>) => c.complianceStatus === 'AT_RISK').length + flaggedCount;

    logger.info('GDPR monitor job completed', {
      totalCategories: categories.length,
      compliant,
      atRisk,
      newlyFlagged: flaggedCount,
    });
  } catch (err) {
    logger.error('GDPR monitor job failed', { error: String(err) });
    throw err;
  }
}
