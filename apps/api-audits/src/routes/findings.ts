import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('audits-findings');

const findingCreateSchema = z.object({
  auditId: z.string().trim().min(1, 'auditId is required'),
  title: z.string().trim().min(1, 'title is required'),
  description: z.string().trim().optional(),
  severity: z.enum(['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OPPORTUNITY', 'POSITIVE']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'CLOSED', 'VERIFIED', 'OVERDUE']).optional(),
  clauseRef: z.string().trim().optional(),
  evidence: z.string().trim().optional(),
  rootCause: z.string().trim().optional(),
  correctiveAction: z.string().trim().optional(),
  assignee: z.string().trim().optional(),
  assigneeName: z.string().trim().optional(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  closedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  verifiedBy: z.string().trim().optional(),
  verifiedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  linkedCapaId: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const findingUpdateSchema = findingCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.audFinding.count({
    where: { orgId, referenceNumber: { startsWith: `AFN-${y}` } },
  });
  return `AFN-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.audFinding.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.audFinding.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Fetch failed', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch findings' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.audFinding.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch finding' },
    });
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
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await prisma.audFinding.create({
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
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
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
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.audFinding.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    const data = await prisma.audFinding.update({
      where: { id: req.params.id },
      data: { ...parsed.data, updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' },
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.audFinding.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'finding not found' } });
    await prisma.audFinding.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'finding deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' },
    });
  }
});

export default router;
