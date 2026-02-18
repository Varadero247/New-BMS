import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-portal');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const announcementCreateSchema = z.object({
  title: z.string().trim().min(1).max(200),
  content: z.string().min(1).max(10000),
  portalType: z.enum(['CUSTOMER', 'SUPPLIER']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  publishedAt: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  expiresAt: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

const announcementUpdateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  content: z.string().min(1).max(10000).optional(),
  portalType: z.enum(['CUSTOMER', 'SUPPLIER']).optional(),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  isActive: z.boolean().optional(),
  publishedAt: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  expiresAt: z.string().trim().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
});

// ---------------------------------------------------------------------------
// GET / — List active announcements
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const portalType = req.query.portalType as string | undefined;

    const where: Record<string, unknown> = {
      isActive: true,
      deletedAt: null,
    };
    if (portalType) where.portalType = portalType;

    const [items, total] = await Promise.all([
      prisma.portalAnnouncement.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.portalAnnouncement.count({ where }),
    ]);

    return res.json({
      success: true,
      data: items,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Error listing announcements', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list announcements' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create announcement
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const auth = req as AuthRequest;
    const parsed = announcementCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const data = parsed.data;

    const announcement = await prisma.portalAnnouncement.create({
      data: {
        title: data.title,
        content: data.content,
        portalType: data.portalType,
        priority: data.priority,
        isActive: true,
        publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        createdBy: auth.user!.id,
      },
    });

    logger.info('Announcement created', { id: announcement.id });
    return res.status(201).json({ success: true, data: announcement });
  } catch (error: unknown) {
    logger.error('Error creating announcement', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create announcement' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update announcement
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = announcementUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.flatten() } });
    }

    const existing = await prisma.portalAnnouncement.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt as string);
    if (updateData.expiresAt) updateData.expiresAt = new Date(updateData.expiresAt as string);

    const updated = await prisma.portalAnnouncement.update({
      where: { id: req.params.id },
      data: updateData,
    });

    logger.info('Announcement updated', { id: updated.id });
    return res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Error updating announcement', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update announcement' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft-delete announcement
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.portalAnnouncement.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Announcement not found' } });
    }

    await prisma.portalAnnouncement.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });

    logger.info('Announcement deleted', { id: req.params.id });
    return res.json({ success: true, data: { id: req.params.id } });
  } catch (error: unknown) {
    logger.error('Error deleting announcement', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete announcement' } });
  }
});

export default router;
