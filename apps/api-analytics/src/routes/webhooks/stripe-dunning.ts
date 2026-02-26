// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { createLogger } from '@ims/monitoring';

const stripeEventSchema = z.object({
  id: z.string().trim().optional(),
  type: z.string().trim().min(1, 'Missing or invalid Stripe event'),
  data: z
    .object({
      object: z
        .object({
          id: z.string().trim().optional(),
          customer: z.string().trim().optional(),
          customer_email: z.string().trim().optional(),
          customer_name: z.string().trim().optional(),
          amount_due: z.number().nonnegative().optional(),
          currency: z.string().trim().optional(),
          number: z.string().trim().optional(),
        })
        .optional(),
    })
    .optional(),
});

const logger = createLogger('stripe-dunning-webhook');
const router: Router = Router();

// ---------------------------------------------------------------------------
// POST / — Stripe invoice.payment_failed webhook
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = stripeEventSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const event = parsed.data;

    if (event.type !== 'invoice.payment_failed') {
      return res.json({ success: true, data: { message: 'Event type ignored', type: event.type } });
    }

    const invoice = event.data?.object;
    if (!invoice) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_PAYLOAD', message: 'Missing invoice data in event' },
      });
    }

    const stripeCustomerId = invoice.customer || 'unknown';
    const stripeInvoiceId = invoice.id || `inv_${Date.now()}`;
    const customerEmail = invoice.customer_email || '';
    const customerName = invoice.customer_name || '';
    const amountDue = (invoice.amount_due || 0) / 100; // Convert from cents
    const currency = invoice.currency || 'gbp';

    // Check if we already have a dunning sequence for this invoice
    const existing = await prisma.dunningSequence.findFirst({
      where: { stripeInvoiceId },
    });

    if (existing) {
      logger.info('Dunning sequence already exists for invoice', { stripeInvoiceId });
      return res.json({
        success: true,
        data: { dunningSequence: existing, message: 'Already exists' },
      });
    }

    const dunningSequence = await prisma.dunningSequence.create({
      data: {
        stripeCustomerId,
        stripeInvoiceId,
        customerEmail,
        customerName,
        amountDue,
        currency,
        currentStep: 'DAY_0',
        nextActionAt: new Date(),
        metadata: {
          webhookEventId: event.id,
          invoiceNumber: invoice.number,
        },
      },
    });

    logger.info('Dunning sequence created', {
      id: dunningSequence.id,
      stripeInvoiceId,
      customerEmail,
      amountDue,
    });

    res.status(201).json({ success: true, data: { dunningSequence } });
  } catch (err) {
    logger.error('Failed to process stripe dunning webhook', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /active — List active dunning sequences
// ---------------------------------------------------------------------------
router.get('/active', async (_req: Request, res: Response) => {
  try {
    const sequences = await prisma.dunningSequence.findMany({
      where: {
        resolvedAt: null,
        cancelledAt: null,
      },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    res.json({ success: true, data: { sequences, total: sequences.length } });
  } catch (err) {
    logger.error('Failed to list active dunning sequences', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list active dunning sequences' },
    });
  }
});

export default router;
