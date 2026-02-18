import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('dunning-job');

// Step progression map: current step -> next step
const STEP_PROGRESSION: Record<string, string> = {
  DAY_0: 'DAY_3',
  DAY_3: 'DAY_7',
  DAY_7: 'DAY_9',
  DAY_9: 'DAY_14',
  DAY_14: 'CANCELLED',
};

// Days until next action from current step
const STEP_DAYS: Record<string, number> = {
  DAY_0: 3, // DAY_0 -> DAY_3: 3 days
  DAY_3: 4, // DAY_3 -> DAY_7: 4 days
  DAY_7: 2, // DAY_7 -> DAY_9: 2 days
  DAY_9: 5, // DAY_9 -> DAY_14: 5 days
};

export async function runDunningJob(): Promise<{ processed: number; cancelled: number }> {
  const now = new Date();
  let processed = 0;
  let cancelled = 0;

  logger.info('Starting dunning job', { timestamp: now.toISOString() });

  // Find all actionable dunning sequences
  const sequences = await prisma.dunningSequence.findMany({
    where: {
      nextActionAt: { lte: now },
      resolvedAt: null,
      cancelledAt: null,
    },
  });

  logger.info(`Found ${sequences.length} dunning sequences to process`);

  for (const seq of sequences) {
    try {
      const currentStep = seq.currentStep as string;
      const nextStep = STEP_PROGRESSION[currentStep];

      if (!nextStep) {
        logger.warn('Unknown dunning step, skipping', { id: seq.id, currentStep });
        continue;
      }

      if (nextStep === 'CANCELLED') {
        // Final step reached — cancel the sequence
        await prisma.dunningSequence.update({
          where: { id: seq.id },
          data: {
            currentStep: 'CANCELLED',
            cancelledAt: now,
          },
        });

        logger.info('Dunning sequence cancelled (DAY_14 reached)', {
          id: seq.id,
          customerEmail: seq.customerEmail,
          amountDue: String(seq.amountDue),
        });

        // Would send final cancellation email
        logger.info('Would send dunning email', {
          step: 'DAY_14',
          customerEmail: seq.customerEmail,
          customerName: seq.customerName,
          amountDue: String(seq.amountDue),
        });

        cancelled++;
      } else {
        // Advance to next step
        const daysUntilNext = STEP_DAYS[currentStep] || 3;
        const nextActionAt = new Date(now.getTime() + daysUntilNext * 24 * 60 * 60 * 1000);

        await prisma.dunningSequence.update({
          where: { id: seq.id },
          data: {
            currentStep: nextStep as any,
            nextActionAt,
          },
        });

        // Would send dunning email for the new step
        logger.info('Would send dunning email', {
          step: nextStep,
          customerEmail: seq.customerEmail,
          customerName: seq.customerName,
          amountDue: String(seq.amountDue),
        });

        logger.info('Dunning sequence advanced', {
          id: seq.id,
          from: currentStep,
          to: nextStep,
          nextActionAt: nextActionAt.toISOString(),
        });
      }

      processed++;
    } catch (err) {
      logger.error('Failed to process dunning sequence', {
        id: seq.id,
        error: String(err),
      });
    }
  }

  logger.info('Dunning job completed', { processed, cancelled });
  return { processed, cancelled };
}
