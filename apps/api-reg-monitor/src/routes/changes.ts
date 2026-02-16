import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('reg-monitor-changes');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  source: z.enum(['GOVERNMENT', 'REGULATOR', 'STANDARDS_BODY', 'INDUSTRY', 'EU_UK', 'OTHER']).optional(),
  sourceUrl: z.string().optional(),
  publishedDate: z.string().optional(),
  effectiveDate: z.string().optional(),
  status: z.enum(['NEW', 'UNDER_REVIEW', 'ASSESSED', 'IMPLEMENTED', 'NOT_APPLICABLE', 'MONITORING']).optional(),
  impact: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'NONE']).optional(),
  affectedAreas: z.array(z.string()).optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  assessment: z.string().optional(),
  actionRequired: z.string().optional(),
  completedDate: z.string().optional(),
  aiSummary: z.string().optional(),
  notes: z.string().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await (prisma as any).regChange.count({ where: { orgId, referenceNumber: { startsWith: `RGC-${y}` } } });
  return `RGC-${y}-${String(c + 1).padStart(4, '0')}`;
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
      (prisma as any).regChange.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).regChange.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) {
    logger.error('Fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch regulatory changes' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).regChange.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch regulatory change' } });
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
    const { title, description, source, sourceUrl, publishedDate, effectiveDate, status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired, completedDate, aiSummary, notes } = parsed.data;
    const data = await (prisma as any).regChange.create({
      data: {
        title, description, source, sourceUrl,
        publishedDate: publishedDate ? new Date(publishedDate) : undefined,
        effectiveDate: effectiveDate ? new Date(effectiveDate) : undefined,
        status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired,
        completedDate: completedDate ? new Date(completedDate) : undefined,
        aiSummary, notes,
        orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).regChange.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const { title, description, source, sourceUrl, publishedDate, effectiveDate, status, impact, affectedAreas, assignee, assigneeName, assessment, actionRequired, completedDate, aiSummary, notes } = parsed.data;
    const updateData: any = { updatedBy: (req as any).user?.id };
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
    const data = await (prisma as any).regChange.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).regChange.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'regulatory change not found' } });
    await (prisma as any).regChange.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } });
    res.json({ success: true, data: { message: 'regulatory change deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

export default router;
