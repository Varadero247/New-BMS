// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('certification-tracker-job');

export async function runCertificationTrackerJob(): Promise<void> {
  logger.info('Running certification tracker job');

  try {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const deadlines = await prisma.complianceDeadline.findMany({ take: 10000 });

    let overdueCount = 0;
    let dueSoonCount = 0;
    let completedCount = 0;

    for (const deadline of deadlines) {
      const dueDate = new Date(deadline.dueDate);

      // If lastCompletedAt exists and is within the current cycle, mark COMPLETED
      if (deadline.lastCompletedAt) {
        const completedDate = new Date(deadline.lastCompletedAt);
        if (completedDate > new Date(dueDate.getTime() - 365 * 24 * 60 * 60 * 1000)) {
          if (deadline.status !== 'COMPLETED') {
            await prisma.complianceDeadline.update({
              where: { id: deadline.id },
              data: { status: 'COMPLETED' },
            });
            completedCount++;
          }
          continue;
        }
      }

      if (dueDate < now) {
        if (deadline.status !== 'OVERDUE') {
          await prisma.complianceDeadline.update({
            where: { id: deadline.id },
            data: { status: 'OVERDUE' },
          });
          logger.warn('Compliance deadline overdue', {
            id: deadline.id,
            name: deadline.name,
            dueDate: deadline.dueDate,
          });
          overdueCount++;
        }
      } else if (dueDate <= thirtyDaysFromNow) {
        if (deadline.status !== 'DUE_SOON') {
          await prisma.complianceDeadline.update({
            where: { id: deadline.id },
            data: { status: 'DUE_SOON' },
          });
          const daysRemaining = Math.ceil(
            (dueDate.getTime() - now.getTime()) / (24 * 60 * 60 * 1000)
          );
          logger.warn('Compliance deadline due soon', {
            id: deadline.id,
            name: deadline.name,
            daysRemaining,
          });
          dueSoonCount++;
        }
      }
    }

    logger.info('Certification tracker job completed', {
      total: deadlines.length,
      overdue: overdueCount,
      dueSoon: dueSoonCount,
      completed: completedCount,
    });
  } catch (err) {
    logger.error('Certification tracker job failed', { error: String(err) });
    throw err;
  }
}
