import { Router, Request, Response } from 'express';
import { z } from 'zod';
import crypto from 'crypto';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const stripeWebhookSchema = z.object({
  type: z.string().min(1, 'Invalid event'),
  data: z.object({
    object: z.object({
      id: z.string().optional(),
      metadata: z.record(z.string()).optional(),
      status: z.string().optional(),
    }).optional(),
  }).optional(),
});

const logger = createLogger('api-marketing:stripe-webhooks');
const router = Router();

const SIGNATURE_TOLERANCE_SECONDS = 300; // 5 minutes

/**
 * Verify Stripe webhook signature using HMAC-SHA256.
 * Follows the same algorithm as stripe.webhooks.constructEvent():
 * 1. Parse the stripe-signature header for timestamp (t) and signature (v1)
 * 2. Build the signed payload: `${timestamp}.${rawBody}`
 * 3. Compute HMAC-SHA256 with the webhook secret
 * 4. Compare computed signature with the provided v1 signature
 * 5. Check that the timestamp is within tolerance (prevents replay attacks)
 */
export function verifyStripeSignature(rawBody: string | Buffer, signature: string, secret: string): void {
  const parts = signature.split(',').reduce<Record<string, string>>((acc, part) => {
    const [key, value] = part.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const timestamp = parts['t'];
  const expectedSig = parts['v1'];

  if (!timestamp || !expectedSig) {
    throw new Error('Invalid stripe-signature header format');
  }

  const payload = `${timestamp}.${rawBody.toString()}`;
  const computedSig = crypto.createHmac('sha256', secret).update(payload).digest('hex');

  if (!crypto.timingSafeEqual(Buffer.from(computedSig), Buffer.from(expectedSig))) {
    throw new Error('Webhook signature verification failed');
  }

  // Replay attack protection
  const timestampAge = Math.floor(Date.now() / 1000) - parseInt(timestamp, 10);
  if (timestampAge > SIGNATURE_TOLERANCE_SECONDS) {
    throw new Error('Webhook timestamp too old');
  }
}

// POST /api/webhooks/stripe
router.post('/stripe', async (req: Request, res: Response) => {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || AutomationConfig.stripe.webhookSecret;

    // Verify Stripe signature if webhook secret is configured
    if (webhookSecret) {
      const signature = req.headers['stripe-signature'] as string;
      if (!signature) {
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header' },
        });
      }

      const rawBody = (req as any).rawBody;
      if (!rawBody) {
        logger.warn('Raw body not available for Stripe signature verification — ensure raw body middleware is configured');
        return res.status(400).json({
          success: false,
          error: { code: 'MISSING_RAW_BODY', message: 'Raw body not available for signature verification' },
        });
      }

      try {
        verifyStripeSignature(rawBody, signature, webhookSecret);
      } catch (err) {
        logger.error('Stripe webhook signature verification failed', { error: String(err) });
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' },
        });
      }
    } else {
      logger.warn('STRIPE_WEBHOOK_SECRET not set — skipping signature verification (not recommended for production)');
    }

    const parsed = stripeWebhookSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const event = parsed.data;

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
          } catch (err: unknown) {
            if ((err as any)?.code !== 'P2002') { // Ignore unique constraint (already exists)
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
