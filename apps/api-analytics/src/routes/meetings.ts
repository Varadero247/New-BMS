import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const createMeetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1, 'type is required'),
  date: z.string().min(1, 'date is required'),
  attendees: z.array(z.string()).optional(),
  summary: z.string().optional(),
  actionItems: z.array(z.any()).optional(),
});

const updateMeetingSchema = createMeetingSchema.partial();

const logger = createLogger('meetings');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List meetings with pagination, filter by type, sort by date desc
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const where: Record<string, unknown> = {};
    if (type) where.type = type as any;

    const [meetings, total] = await Promise.all([
      prisma.meetingNote.findMany({
        where,
        orderBy: { date: 'desc' },
        skip,
        take: limit,
      }),
      prisma.meetingNote.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        meetings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list meetings', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list meetings' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single meeting
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const meeting = await prisma.meetingNote.findUnique({
      where: { id: req.params.id },
    });

    if (!meeting) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    }

    res.json({ success: true, data: meeting });
  } catch (err) {
    logger.error('Failed to get meeting', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get meeting' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create meeting
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { title, type, date, attendees, summary, actionItems } = parsed.data;

    const meeting = await prisma.meetingNote.create({
      data: {
        title,
        type: type as any,
        date: new Date(date),
        attendees: attendees || [],
        summary: summary || '',
        actionItems: actionItems || [],
      },
    });

    logger.info('Meeting created', { id: meeting.id, title, type });
    res.status(201).json({ success: true, data: meeting });
  } catch (err) {
    logger.error('Failed to create meeting', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create meeting' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update meeting
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.meetingNote.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    }

    const parsed = updateMeetingSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }

    const { title, type, date, attendees, summary, actionItems } = parsed.data;
    const meeting = await prisma.meetingNote.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(attendees !== undefined && { attendees }),
        ...(summary !== undefined && { summary }),
        ...(actionItems !== undefined && { actionItems }),
      } as any,
    });

    logger.info('Meeting updated', { id: meeting.id });
    res.json({ success: true, data: meeting });
  } catch (err) {
    logger.error('Failed to update meeting', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update meeting' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Delete meeting
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.meetingNote.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    }

    await prisma.meetingNote.delete({
      where: { id: req.params.id },
    });

    logger.info('Meeting deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Meeting deleted' } });
  } catch (err) {
    logger.error('Failed to delete meeting', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete meeting' } });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id/actions/:actionIndex — Toggle action item completed
// ---------------------------------------------------------------------------
router.patch('/:id/actions/:actionIndex', async (req: Request, res: Response) => {
  try {
    const meeting = await prisma.meetingNote.findUnique({
      where: { id: req.params.id },
    });

    if (!meeting) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Meeting not found' } });
    }

    const actionIndex = parseInt(req.params.actionIndex, 10);
    const actionItems = (meeting.actionItems as any[]) || [];

    if (isNaN(actionIndex) || actionIndex < 0 || actionIndex >= actionItems.length) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid action index' },
      });
    }

    actionItems[actionIndex] = {
      ...actionItems[actionIndex],
      completed: !actionItems[actionIndex].completed,
    };

    const updated = await prisma.meetingNote.update({
      where: { id: req.params.id },
      data: { actionItems },
    });

    logger.info('Action item toggled', { meetingId: req.params.id, actionIndex });
    res.json({ success: true, data: updated });
  } catch (err) {
    logger.error('Failed to toggle action item', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to toggle action item' } });
  }
});

export default router;
