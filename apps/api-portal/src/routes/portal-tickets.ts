import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `PTL-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const ticketCreateSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  category: z.enum(['TECHNICAL', 'BILLING', 'ORDER', 'QUALITY', 'DELIVERY', 'OTHER']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  portalType: z.enum(['CUSTOMER', 'SUPPLIER']),
});

const ticketUpdateSchema = z.object({
  subject: z.string().min(1).max(200).optional(),
  description: z.string().min(1).max(5000).optional(),
  category: z.enum(['TECHNICAL', 'BILLING', 'ORDER', 'QUALITY', 'DELIVERY', 'OTHER']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED']).optional(),
  assignedTo: z.string().uuid().optional().nullable(),
});

const messageCreateSchema = z.object({
  message: z.string().min(1).max(5000),
  authorType: z.enum(['PORTAL_USER', 'INTERNAL_STAFF']).default('PORTAL_USER'),
  attachments: z.any().optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List tickets
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20);
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const portalType = req.query.portalType as string | undefined;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (category) where.category = category;
    if (portalType) where.portalType = portalType;

    const [items, total] = await Promise.all([
      prisma.portalTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { messages: { take: 1, orderBy: { createdAt: 'desc' } } },
      }),
      prisma.portalTicket.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing tickets', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list tickets' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create ticket
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = ticketCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;
    const number = generateReference('TKT');

    const ticket = await prisma.portalTicket.create({
      data: {
        number,
        subject: data.subject,
        description: data.description,
        category: data.category,
        priority: data.priority,
        portalType: data.portalType,
        submittedBy: auth.user!.id,
        status: 'OPEN',
        createdBy: auth.user!.id,
      },
    });

    logger.info('Ticket created', { id: ticket.id, number });
    return res.status(201).json({ success: true, data: ticket });
  } catch (error: unknown) {
    logger.error('Error creating ticket', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create ticket' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Ticket detail
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['messages']);

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.portalTicket.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { messages: { where: { deletedAt: null }, orderBy: { createdAt: 'asc' } } },
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    return res.json({ success: true, data: ticket });
  } catch (error: unknown) {
    logger.error('Error fetching ticket', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch ticket' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update ticket
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    if (req.params.id === 'resolve') return (res as any).next?.('route');

    const parsed = ticketUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalTicket.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    const updated = await prisma.portalTicket.update({
      where: { id: req.params.id },
      data: parsed.data,
    });

    logger.info('Ticket updated', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error updating ticket', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update ticket' } });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/messages — Add message to ticket
// ---------------------------------------------------------------------------

router.post('/:id/messages', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = messageCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const ticket = await prisma.portalTicket.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!ticket) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    const message = await prisma.portalTicketMessage.create({
      data: {
        ticketId: req.params.id,
        authorId: auth.user!.id,
        authorType: parsed.data.authorType,
        message: parsed.data.message,
        attachments: parsed.data.attachments ?? undefined,
        createdBy: auth.user!.id,
      },
    });

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (ticket.status === 'OPEN') {
      await prisma.portalTicket.update({
        where: { id: req.params.id },
        data: { status: 'IN_PROGRESS' },
      });
    }

    logger.info('Ticket message added', { ticketId: req.params.id, messageId: message.id });
    return res.status(201).json({ success: true, data: message });
  } catch (error: unknown) {
    logger.error('Error adding message', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add message' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/messages — List messages for ticket
// ---------------------------------------------------------------------------

router.get('/:id/messages', async (req: Request, res: Response) => {
  try {
    const ticket = await prisma.portalTicket.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!ticket) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    const messages = await prisma.portalTicketMessage.findMany({
      where: { ticketId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'asc' },
    });

    return res.json({ success: true, data: messages });
  } catch (error: unknown) {
    logger.error('Error listing messages', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list messages' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/resolve — Resolve ticket
// ---------------------------------------------------------------------------

router.put('/:id/resolve', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const resolution = req.body.resolution as string | undefined;

    const ticket = await prisma.portalTicket.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });
    if (!ticket) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Ticket not found' } });
    }

    if (ticket.status === 'CLOSED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Ticket is already closed' } });
    }

    const updated = await prisma.portalTicket.update({
      where: { id: req.params.id },
      data: {
        status: 'RESOLVED',
        resolution: resolution || null,
        resolvedAt: new Date(),
      },
    });

    logger.info('Ticket resolved', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error resolving ticket', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve ticket' } });
  }
});

export default router;
