import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('webhook-intercom');
const router: Router = Router();

// ---------------------------------------------------------------------------
// AI Classification (mock) — categorise by keywords
// ---------------------------------------------------------------------------
function classifyTicket(text: string): { category: 'BUG' | 'FEATURE_REQUEST' | 'BILLING' | 'ONBOARDING' | 'GENERAL'; priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' } {
  const lower = (text || '').toLowerCase();

  let category: 'BUG' | 'FEATURE_REQUEST' | 'BILLING' | 'ONBOARDING' | 'GENERAL' = 'GENERAL';
  if (lower.includes('bug') || lower.includes('error') || lower.includes('broken') || lower.includes('crash')) {
    category = 'BUG';
  } else if (lower.includes('feature') || lower.includes('request') || lower.includes('wish') || lower.includes('suggestion')) {
    category = 'FEATURE_REQUEST';
  } else if (lower.includes('bill') || lower.includes('invoice') || lower.includes('charge') || lower.includes('payment')) {
    category = 'BILLING';
  } else if (lower.includes('onboard') || lower.includes('setup') || lower.includes('getting started')) {
    category = 'ONBOARDING';
  }

  let priority: 'P1_CRITICAL' | 'P2_HIGH' | 'P3_MEDIUM' = 'P3_MEDIUM';
  if (lower.includes('urgent') || lower.includes('critical') || lower.includes('down') || lower.includes('outage')) {
    priority = 'P1_CRITICAL';
  } else if (lower.includes('asap') || lower.includes('important') || lower.includes('blocker')) {
    priority = 'P2_HIGH';
  }

  return { category, priority };
}

// ---------------------------------------------------------------------------
// POST / — Intercom webhook handler
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { topic, data } = req.body || {};

    if (!data) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing data payload' } });
    }

    const conversationId = data.item?.id || data.id || `ic-${Date.now()}`;
    const subject = data.item?.subject || data.subject || 'No subject';
    const body = data.item?.body || data.body || '';
    const customerEmail = data.item?.customer?.email || data.customer?.email || 'unknown@webhook.io';

    const combinedText = `${subject} ${body}`;
    const { category, priority } = classifyTicket(combinedText);

    const ticket = await prisma.supportTicketLog.create({
      data: {
        externalId: conversationId,
        subject,
        customerEmail,
        category,
        priority,
        aiClassification: { topic: topic || 'conversation.created', body, classifiedAt: new Date().toISOString() },
      },
    });

    logger.info('Intercom ticket created', { ticketId: ticket.id, category, priority });

    res.json({ success: true, data: { ticket } });
  } catch (err) {
    logger.error('Failed to process Intercom webhook', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook' } });
  }
});

export default router;
