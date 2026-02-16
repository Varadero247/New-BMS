import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('audits-findings');

const findingCreateSchema = z.object({
  auditId: z.string().min(1, 'auditId is required'),
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  severity: z.enum(['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED', 'OVERDUE']).optional(),
  clauseRef: z.string().optional(),
  evidence: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  dueDate: z.string().optional(),
  closedDate: z.string().optional(),
  verifiedBy: z.string().optional(),
  verifiedDate: z.string().optional(),
  linkedCapaId: z.string().optional(),
  notes: z.string().optional(),
});

const findingUpdateSchema = findingCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await (prisma as any).audFinding.count({
    where: { orgId, referenceNumber: { startsWith: `AFN-${y}` } },
  });
  return `AFN-${y}-${String(c + 1).padStart(4, '0')}`;
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
      (prisma as any).audFinding.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).audFinding.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error: any) {
    logger.error('Fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch findings' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).audFinding.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch finding' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = findingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await (prisma as any).audFinding.create({
      data: {
        ...parsed.data,
        orgId,
        referenceNumber,
        createdBy: (req as any).user?.id,
        updatedBy: (req as any).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = findingUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const existing = await (prisma as any).audFinding.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    const data = await (prisma as any).audFinding.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedBy: (req as any).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).audFinding.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    await (prisma as any).audFinding.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as any).user?.id },
    });
    res.json({ success: true, data: { message: 'finding deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

export default router;
