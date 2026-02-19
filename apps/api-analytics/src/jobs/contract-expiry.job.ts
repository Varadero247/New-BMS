import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('contract-expiry-job');

export async function runContractExpiryJob(): Promise<void> {
  logger.info('Running contract expiry job');

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const activeContracts = await prisma.contract.findMany({
      where: { status: 'ACTIVE', deletedAt: null },
    });

    let expiredCount = 0;
    let expiringSoonCount = 0;

    for (const contract of activeContracts) {
      const endDate = new Date(contract.endDate);

      if (endDate < now) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'EXPIRED' },
        });
        logger.warn('Contract expired', {
          id: contract.id,
          name: contract.name,
          vendor: contract.vendor,
          endDate: contract.endDate,
        });
        expiredCount++;
      } else if (endDate <= thirtyDaysFromNow) {
        await prisma.contract.update({
          where: { id: contract.id },
          data: { status: 'EXPIRING_SOON' },
        });
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
        );
        logger.warn('Contract expiring soon', {
          id: contract.id,
          name: contract.name,
          vendor: contract.vendor,
          daysRemaining,
        });
        expiringSoonCount++;
      }
    }

    logger.info('Contract expiry job completed', {
      total: activeContracts.length,
      expired: expiredCount,
      expiringSoon: expiringSoonCount,
    });
  } catch (err) {
    logger.error('Contract expiry job failed', { error: String(err) });
    throw err;
  }
}
