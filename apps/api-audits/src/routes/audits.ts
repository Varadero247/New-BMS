import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
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
  scheduledDate: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reportUrl: z.string().optional(),
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
    const orgId = (req as AuthRequest).user?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.audAudit.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      prisma.audAudit.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch audits' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await prisma.audAudit.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch audit' } });
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
    const orgId = (req as AuthRequest).user?.orgId || 'default';
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
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } });
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
    const existing = await prisma.audAudit.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    const data = await prisma.audAudit.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await prisma.audAudit.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'audit not found' } });
    await prisma.audAudit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'audit deleted successfully' } });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: (error as Error).message } });
  }
});

export default router;
