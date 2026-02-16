import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { portalPrisma } from '../prisma-portal';

const logger = createLogger('api-partners:support');
const router = Router();

const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().default('MEDIUM'),
});

const addMessageSchema = z.object({
  body: z.string().min(1),
});

const SLA_HOURS: Record<string, number> = {
  LOW: 72,
  MEDIUM: 24,
  HIGH: 8,
  URGENT: 2,
};

// GET /api/support — list partner's tickets
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const { status } = req.query;
    const where: any = { partnerId };
    if (status) where.status = status;

    const tickets = await portalPrisma.mktPartnerSupportTicket.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { messages: { orderBy: { createdAt: 'desc' }, take: 1 } },
    });

    res.json({ success: true, data: tickets });
  } catch (error) {
    logger.error('Failed to list support tickets', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list support tickets' },
    });
  }
});

// POST /api/support — create a new ticket
router.post('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = createTicketSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const slaHours = SLA_HOURS[parsed.data.priority] || 24;
    const slaTarget = new Date(Date.now() + slaHours * 60 * 60 * 1000);

    const ticket = await portalPrisma.mktPartnerSupportTicket.create({
      data: {
        partnerId,
        subject: parsed.data.subject,
        description: parsed.data.description,
        priority: parsed.data.priority,
        slaTarget,
        messages: {
          create: {
            senderId: partnerId,
            senderType: 'PARTNER',
            body: parsed.data.description,
          },
        },
      },
      include: { messages: true },
    });

    res.status(201).json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Failed to create support ticket', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create support ticket' },
    });
  }
});

// GET /api/support/:id — get ticket detail with messages
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const ticket = await portalPrisma.mktPartnerSupportTicket.findUnique({
      where: { id: req.params.id },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    });

    if (!ticket || ticket.partnerId !== partnerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' },
      });
    }

    res.json({ success: true, data: ticket });
  } catch (error) {
    logger.error('Failed to get ticket detail', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get ticket detail' },
    });
  }
});

// POST /api/support/:id/messages — add a message to a ticket
router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const parsed = addMessageSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const ticket = await portalPrisma.mktPartnerSupportTicket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket || ticket.partnerId !== partnerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' },
      });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({
        success: false,
        error: { code: 'TICKET_CLOSED', message: 'Cannot add messages to a closed ticket' },
      });
    }

    const message = await portalPrisma.mktTicketMessage.create({
      data: {
        ticketId: req.params.id,
        senderId: partnerId,
        senderType: 'PARTNER',
        body: parsed.data.body,
      },
    });

    // Update ticket status if waiting on partner
    if (ticket.status === 'WAITING_ON_PARTNER') {
      await portalPrisma.mktPartnerSupportTicket.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    res.status(201).json({ success: true, data: message });
  } catch (error) {
    logger.error('Failed to add message', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add message' },
    });
  }
});

// PATCH /api/support/:id/close — close a ticket
router.patch('/:id/close', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as any).partner?.id;
    if (!partnerId) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const ticket = await portalPrisma.mktPartnerSupportTicket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket || ticket.partnerId !== partnerId) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Ticket not found' },
      });
    }

    const updated = await portalPrisma.mktPartnerSupportTicket.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED', resolvedAt: new Date() },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Failed to close ticket', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to close ticket' },
    });
  }
});

export default router;
