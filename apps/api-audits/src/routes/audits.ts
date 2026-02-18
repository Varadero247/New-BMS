import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('audits-audits');

const auditCreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  type: z.enum(['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'CERTIFICATION', 'SURVEILLANCE', 'PROCESS']).optional(),
  status: z.enum(['PLANNED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  standard: z.string().optional(),
  scope: z.string().optional(),
  department: z.string().optional(),
  leadAuditor: z.string().optional(),
  leadAuditorName: z.string().optional(),
  auditTeam: z.array(z.string()).optional(),
  scheduledDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  startDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  endDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  reportUrl: z.string().url('Invalid URL').optional(),
  conclusion: z.string().optional(),
  notes: z.string().optional(),
});

const auditUpdateSchema = auditCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.audAudit.count({
    where: { orgId, referenceNumber: { startsWith: `AUD-${y}` } },
  });
  return `AUD-${y}-${String(c + 1).padStart(4, '0')}`;
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
      prisma.audAudit.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }),
      prisma.audAudit.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audits' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const item = await prisma.audAudit.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = auditCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.audAudit.create({
      data: {
        ...parsed.data,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = auditUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.audAudit.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    const data = await prisma.audAudit.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedBy: (req as AuthRequest).user?.id },
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
    const existing = await prisma.audAudit.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    await prisma.audAudit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'audit deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } });
  }
});

export default router;
