import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('reg-monitor-changes');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  source: z.enum(['GOVERNMENT', 'REGULATOR', 'STANDARDS_BODY', 'INDUSTRY', 'EU_UK', 'OTHER']).optional(),
  sourceUrl: z.string().trim().url('Invalid URL').optional(),
  publishedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  effectiveDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  status: z.enum(['NEW', 'UNDER_REVIEW', 'ASSESSED', 'IMPLEMENTED', 'NOT_APPLICABLE', 'MONITORING']).optional(),
  impact: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
  affectedAreas: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  assessment: z.string().optional(),
  actionRequired: z.string().optional(),
  completedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  aiSummary: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.regChange.count({ where: { orgId, referenceNumber: { startsWith: `RGC-${y}` } } });
  return `RGC-${y}-${String(c + 1).padStart(4, '0')}`;
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
      prisma.regChange.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }),
      prisma.regChange.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch regulatory changes' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const item = await prisma.regChange.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch regulatory change' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { title, description, source, sourceUrl, publishedDate, effectiveDate, status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired, completedDate, aiSummary, notes } = parsed.data;
    const data = await prisma.regChange.create({
      data: {
        title, description, source, sourceUrl,
        publishedDate: publishedDate ? new Date(publishedDate) : undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        aiSummary, notes,
        orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const existing = await prisma.regChange.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const { title, description, source, sourceUrl, publishedDate, effectiveDate, status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired, completedDate, aiSummary, notes } = parsed.data;
    const updateData: Record<string, unknown> = { updatedBy: (req as AuthRequest).user?.id };
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (source !== undefined) updateData.source = source;
    if (sourceUrl !== undefined) updateData.sourceUrl = sourceUrl;
    if (publishedDate !== undefined) updateData.publishedDate = new Date(publishedDate);
    if (effectiveDate !== undefined) updateData.effectiveDate = new Date(effectiveDate);
    if (status !== undefined) updateData.status = status;
    if (impact !== undefined) updateData.impact = impact;
    if (affectedAreas !== undefined) updateData.affectedAreas = affectedAreas;
    if (assignee !== undefined) updateData.assignee = assignee;
    if (assigneeName !== undefined) updateData.assigneeName = assigneeName;
    if (assessment !== undefined) updateData.assessment = assessment;
    if (actionRequired !== undefined) updateData.actionRequired = actionRequired;
    if (completedDate !== undefined) updateData.completedDate = new Date(completedDate);
    if (aiSummary !== undefined) updateData.aiSummary = aiSummary;
    if (notes !== undefined) updateData.notes = notes;
    const data = await prisma.regChange.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const existing = await prisma.regChange.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    await prisma.regChange.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } });
    res.json({ success: true, data: { message: 'regulatory change deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
