import cron from 'node-cron';
import { createLogger } from '@ims/monitoring';
import { prisma } from './prisma';

const logger = createLogger('api-marketing:scheduler');

export function startScheduler() {
  // Every minute: poll MktEmailJob for due emails
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const dueJobs = await prisma.mktEmailJob.findMany({
        where: {
          status: 'PENDING',
          scheduledFor: { lte: now },
        },
        take: 10,
      });

      for (const job of dueJobs) {
        try {
          // Mark as sent (in production, actually send via @ims/email)
          await prisma.mktEmailJob.update({
            where: { id: job.id },
            data: { status: 'SENT', sentAt: new Date() },
          });

          // Log the send
          await prisma.mktEmailLog.create({
            data: {
              userId: job.userId,
              email: job.email,
              template: job.template,
              subject: job.subject,
              sequenceId: job.sequenceId,
            },
          });

          logger.info('Email job processed', { jobId: job.id, template: job.template });
        } catch (err) {
          await prisma.mktEmailJob.update({
            where: { id: job.id },
            data: { status: 'FAILED', error: String(err) },
          });
          logger.error('Email job failed', { jobId: job.id, error: String(err) });
        }
      }
    } catch (err) {
      logger.error('Email job poller error', { error: String(err) });
    }
  });

  // Daily 06:00: Health score recalculation
  cron.schedule('0 6 * * *', async () => {
    logger.info('Health score recalculation started');
    // In production, would iterate over active users and calculate scores
  });

  // Daily 07:00: Expansion trigger check
  cron.schedule('0 7 * * *', async () => {
    logger.info('Expansion trigger check started');
    // In production, would check user limits, unused modules, growth flags
  });

  // Daily 07:45: Daily digest
  cron.schedule('45 7 * * *', async () => {
    logger.info('Daily digest generation started');
    // In production, would generate and send digest email
  });

  // Daily 08:00: Renewal check
  cron.schedule('0 8 * * *', async () => {
    logger.info('Renewal check started');
    try {
      const now = new Date();

      // Check for orgs approaching renewal at various milestones
      const checkDays = [90, 60, 30, 7];
      for (const days of checkDays) {
        const targetDate = new Date(now);
        targetDate.setDate(targetDate.getDate() + days);
        const nextDay = new Date(targetDate);
        nextDay.setDate(nextDay.getDate() + 1);

        const field = `day${days}Sent` as 'day90Sent' | 'day60Sent' | 'day30Sent' | 'day7Sent';
        const sequences = await prisma.mktRenewalSequence.findMany({
          where: {
            renewalDate: { gte: targetDate, lt: nextDay },
            renewedAt: null,
            [field]: false,
          },
        });

        for (const seq of sequences) {
          logger.info(`Renewal ${days}-day reminder needed`, { orgId: seq.orgId });
          // Would send reminder email and update flag
        }
      }
    } catch (err) {
      logger.error('Renewal check error', { error: String(err) });
    }
  });

  logger.info('Marketing scheduler started (5 cron jobs)');
}
