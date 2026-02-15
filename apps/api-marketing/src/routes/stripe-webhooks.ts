import { Router, Request, Response } from 'express';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const logger = createLogger('api-marketing:stripe-webhooks');
const router = Router();

// POST /api/webhooks/stripe
// Note: In production, this needs raw body for signature verification
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const event = req.body;

    if (!event || !event.type) {
      return res.status(400).json({ error: 'Invalid event' });
    }

    logger.info('Stripe webhook received', { type: event.type });

    switch (event.type) {
      case 'customer.subscription.deleted': {
        // Customer cancelled — initiate win-back
        const subscription = event.data?.object;
        const orgId = subscription?.metadata?.orgId;
        if (orgId) {
          try {
            await prisma.mktWinBackSequence.create({
              data: {
                orgId,
                cancelledAt: new Date(),
              },
            });
            logger.info('Win-back sequence created', { orgId });
          } catch (err: any) {
            if (err?.code !== 'P2002') { // Ignore unique constraint (already exists)
              logger.error('Failed to create win-back sequence', { error: String(err) });
            }
          }
        }
        break;
      }

      case 'customer.subscription.updated': {
        // Check if this is a renewal (new period started)
        const subscription = event.data?.object;
        const orgId = subscription?.metadata?.orgId;
        if (orgId && subscription?.status === 'active') {
          await prisma.mktRenewalSequence.update({
            where: { orgId },
            data: { renewedAt: new Date() },
          }).catch(() => {
            // Sequence may not exist — that's fine
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data?.object;
        const orgId = invoice?.metadata?.orgId;
        if (orgId) {
          logger.warn('Payment failed', { orgId });
          // Could schedule a dunning email here
        }
        break;
      }

      case 'invoice.paid': {
        const invoice = event.data?.object;
        logger.info('Invoice paid', { invoiceId: invoice?.id });
        break;
      }

      default:
        logger.info('Unhandled Stripe event', { type: event.type });
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook handling failed', { error: String(error) });
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

export default router;
