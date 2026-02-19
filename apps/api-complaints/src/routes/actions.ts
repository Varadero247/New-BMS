import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('complaints-actions');

const createSchema = z.object({
  complaintId: z.string().trim().min(1, 'Complaint ID is required'),
  action: z.string().trim().min(1, 'Action is required'),
  assignee: z.string().trim().optional(),
  dueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  completedAt: z.string().trim().optional(),
  status: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.compAction.count({
    where: { orgId, referenceNumber: { startsWith: `CMA-${y}` } },
  });
  return `CMA-${y}-${String(c + 1).padStart(4, '0')}`;
}
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.action = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.compAction.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.compAction.count({ where }),
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
    logger.error('Failed to fetch', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch actions' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.compAction.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'action not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch action' },
    });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { complaintId, action, assignee, dueDate, completedAt, status, notes } = parsed.data;
    const data = await prisma.compAction.create({
      data: {
        complaintId,
        action,
        assignee,
        dueDate,
        completedAt,
        status,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.compAction.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'action not found' } });
    const { complaintId, action, assignee, dueDate, completedAt, status, notes } = parsed.data;
    const data = await prisma.compAction.update({
      where: { id: req.params.id },
      data: {
        complaintId,
        action,
        assignee,
        dueDate,
        completedAt,
        status,
        notes,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.compAction.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'action not found' } });
    await prisma.compAction.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'action deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
