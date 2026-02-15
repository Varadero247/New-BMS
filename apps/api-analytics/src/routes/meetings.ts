import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('meetings');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List meetings with pagination, filter by type, sort by date desc
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const type = req.query.type as string | undefined;

    const where: any = {};
    if (type) where.type = type;

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
    const { title, type, date, attendees, summary, actionItems } = req.body;

    if (!title || !type || !date) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Title, type, and date are required' },
      });
    }

    const meeting = await prisma.meetingNote.create({
      data: {
        title,
        type,
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

    const { title, type, date, attendees, summary, actionItems } = req.body;
    const meeting = await prisma.meetingNote.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(type !== undefined && { type }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(attendees !== undefined && { attendees }),
        ...(summary !== undefined && { summary }),
        ...(actionItems !== undefined && { actionItems }),
      },
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

    const actionIndex = parseInt(req.params.actionIndex);
    const actionItems = (meeting.actionItems as any[]) || [];

    if (actionIndex < 0 || actionIndex >= actionItems.length) {
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
