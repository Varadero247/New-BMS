import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { PartnerRequest } from '../middleware/partner-auth';

const logger = createLogger('api-partners:events');
const router = Router();

// GET /api/events - List partner events
router.get('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const { status } = req.query;
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const events = await prisma.mktPartnerDeal.findMany({ where, orderBy: { createdAt: 'desc' }, take: 100 });
    res.json({ success: true, data: events });
  } catch (error) {
    logger.error('Error fetching events', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch events' } });
  }
});

// POST /api/events - Register for event
router.post('/', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      eventType: z.enum(['WEBINAR', 'CONFERENCE', 'WORKSHOP', 'TRAINING', 'NETWORKING']),
      eventDate: z.string().trim().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
    });

    const data = schema.parse(req.body);

    const event = await prisma.mktPartnerDeal.create({
      data: {
        partnerId,
        title: data.title,
        description: data.description || '',
        stage: 'DISCOVERY',
        dealValue: 0,
        currency: 'USD',
        expectedCloseDate: new Date(data.eventDate),
      } as any,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating event registration', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to register for event' } });
  }
});

// GET /api/events/:id - Get event details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const partnerId = (req as PartnerRequest).partner?.id;
    if (!partnerId) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } });

    const event = await prisma.mktPartnerDeal.findUnique({ where: { id: req.params.id } });
    if (!event) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });

    res.json({ success: true, data: event });
  } catch (error) {
    logger.error('Error fetching event', { error: String(error) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch event' } });
  }
});

export default router;
