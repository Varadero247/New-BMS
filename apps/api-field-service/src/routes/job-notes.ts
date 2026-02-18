import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-field-service');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const jobNoteCreateSchema = z.object({
  jobId: z.string().uuid(),
  type: z.enum(['NOTE', 'PHOTO', 'SIGNATURE', 'CHECKLIST', 'FORM']).optional(),
  content: z.string().min(1),
  attachments: z.any().optional().nullable(),
  isInternal: z.boolean().optional(),
});

const jobNoteUpdateSchema = z.object({
  type: z.enum(['NOTE', 'PHOTO', 'SIGNATURE', 'CHECKLIST', 'FORM']).optional(),
  content: z.string().min(1).optional(),
  attachments: z.any().optional().nullable(),
  isInternal: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET / — List job notes
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { jobId, type } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };
    if (jobId) where.jobId = String(jobId);
    if (type) where.type = String(type);

    const [data, total] = await Promise.all([
      prisma.fsSvcJobNote.findMany({ where, skip, take: limit, orderBy: { createdAt: 'desc' } }),
      prisma.fsSvcJobNote.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list job notes', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list job notes' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create job note
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = jobNoteCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const authReq = req as AuthRequest;
    const data = await prisma.fsSvcJobNote.create({
      data: {
        ...parsed.data,
        attachments: parsed.data.attachments as any,
        authorId: authReq.user!.id,
        createdBy: authReq.user!.id,
      },
    });

    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create job note', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create job note' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get job note
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const data = await prisma.fsSvcJobNote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!data) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job note not found' } });
    }
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to get job note', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get job note' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update job note
// ---------------------------------------------------------------------------
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJobNote.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job note not found' } });
    }

    const parsed = jobNoteUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', details: parsed.error.issues } });
    }

    const data = await prisma.fsSvcJobNote.update({
      where: { id: req.params.id },
      data: { ...parsed.data, attachments: parsed.data.attachments as any },
    });

    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update job note', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update job note' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete job note
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.fsSvcJobNote.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Job note not found' } });
    }

    await prisma.fsSvcJobNote.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Job note deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete job note', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete job note' } });
  }
});

export default router;
