import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('audits-checklists');

const checklistCreateSchema = z.object({
  auditId: z.string().min(1, 'auditId is required'),
  title: z.string().min(1, 'title is required'),
  standard: z.string().optional(),
  items: z.string().optional(),
  completedItems: z.number().optional(),
  totalItems: z.number().optional(),
  notes: z.string().optional(),
});

const checklistUpdateSchema = checklistCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.audChecklist.count({
    where: { orgId, referenceNumber: { startsWith: `ACH-${y}` } } as any,
  });
  return `ACH-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.audChecklist.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }),
      prisma.audChecklist.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20, total, totalPages: Math.ceil(total / (parseInt(limit, 10) || 20)) },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch checklists' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.audChecklist.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'checklist not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch checklist' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = checklistCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.audChecklist.create({
      data: {
        ...parsed.data,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
      } as any,
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = checklistUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.audChecklist.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'checklist not found' } });
    const data = await prisma.audChecklist.update({
      where: { id: req.params.id },
      data: { ...parsed.data },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.audChecklist.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'checklist not found' } });
    await prisma.audChecklist.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'checklist deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
