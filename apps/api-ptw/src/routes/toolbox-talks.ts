import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('ptw-toolbox-talks');

const createSchema = z.object({
  topic: z.string().min(1, 'Topic is required'),
  permitId: z.string().optional(),
  content: z.string().optional(),
  presenter: z.string().optional(),
  presenterName: z.string().optional(),
  scheduledDate: z.string().optional(),
  conductedDate: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  attendeeCount: z.number().int().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await (prisma as any).ptwToolboxTalk.count({ where: { orgId, referenceNumber: { startsWith: `PTT-${y}` } } });
  return `PTT-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      (prisma as any).ptwToolboxTalk.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).ptwToolboxTalk.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) {
    logger.error('Fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch toolbox talks' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).ptwToolboxTalk.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'toolbox talk not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch toolbox talk' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { topic, permitId, content, presenter, presenterName, scheduledDate, conductedDate, attendees, attendeeCount, notes } = parsed.data;
    const data = await (prisma as any).ptwToolboxTalk.create({
      data: {
        topic, permitId, content, presenter, presenterName,
        scheduledDate: scheduledDate ? new Date(scheduledDate) : undefined,
        conductedDate: conductedDate ? new Date(conductedDate) : undefined,
        attendees, attendeeCount, notes,
        orgId, referenceNumber, createdBy: (req as any).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).ptwToolboxTalk.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'toolbox talk not found' } });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const { topic, permitId, content, presenter, presenterName, scheduledDate, conductedDate, attendees, attendeeCount, notes } = parsed.data;
    const updateData: any = {};
    if (topic !== undefined) updateData.topic = topic;
    if (permitId !== undefined) updateData.permitId = permitId;
    if (content !== undefined) updateData.content = content;
    if (presenter !== undefined) updateData.presenter = presenter;
    if (presenterName !== undefined) updateData.presenterName = presenterName;
    if (scheduledDate !== undefined) updateData.scheduledDate = new Date(scheduledDate);
    if (conductedDate !== undefined) updateData.conductedDate = new Date(conductedDate);
    if (attendees !== undefined) updateData.attendees = attendees;
    if (attendeeCount !== undefined) updateData.attendeeCount = attendeeCount;
    if (notes !== undefined) updateData.notes = notes;
    const data = await (prisma as any).ptwToolboxTalk.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).ptwToolboxTalk.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'toolbox talk not found' } });
    await (prisma as any).ptwToolboxTalk.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'toolbox talk deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

export default router;
