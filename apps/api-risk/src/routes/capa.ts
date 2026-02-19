import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('risk-capa');

const createCapaSchema = z.object({
  riskId: z.string().trim().optional(),
  title: z.string().trim().min(1, 'title is required'),
  description: z.string().trim().optional(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  source: z
    .enum([
      'AUDIT',
      'INCIDENT',
      'COMPLAINT',
      'RISK_ASSESSMENT',
      'MANAGEMENT_REVIEW',
      'REGULATORY',
      'CUSTOMER_FEEDBACK',
      'INTERNAL_REVIEW',
    ])
    .optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'OVERDUE']).optional(),
  assignee: z.string().trim().optional(),
  assigneeName: z.string().trim().optional(),
  rootCause: z.string().trim().optional(),
  actionPlan: z.string().trim().optional(),
  verificationMethod: z.string().trim().optional(),
  verificationResult: z.string().trim().optional(),
  dueDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  completedDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  verifiedDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  verifiedBy: z.string().trim().optional(),
  effectivenessCheck: z.boolean().optional(),
  effectivenessDate: z
    .string()
    .trim()
    .datetime({ offset: true })
    .optional()
    .or(z.string().trim().datetime({ offset: true }).optional()),
  effectivenessResult: z.string().trim().optional(),
  linkedIncident: z.string().trim().optional(),
  linkedAudit: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateCapaSchema = createCapaSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.riskCapa.count({
    where: { orgId, referenceNumber: { startsWith: `CAPA-${year}` } },
  });
  return `CAPA-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status as any;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.riskCapa.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.riskCapa.count({ where }),
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
    logger.error('Failed to fetch CAPAs', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CAPAs' },
    });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.riskCapa.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to fetch CAPA', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CAPA' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createCapaSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const {
      riskId,
      title,
      description,
      type,
      source,
      priority,
      status,
      assignee,
      assigneeName,
      rootCause,
      actionPlan,
      verificationMethod,
      verificationResult,
      dueDate,
      completedDate,
      verifiedDate,
      verifiedBy,
      effectivenessCheck,
      effectivenessDate,
      effectivenessResult,
      linkedIncident,
      linkedAudit,
      notes,
    } = parsed.data;
    const data = await prisma.riskCapa.create({
      data: {
        riskId,
        title,
        description,
        type,
        source,
        priority,
        status,
        assignee,
        assigneeName,
        rootCause,
        actionPlan,
        verificationMethod,
        verificationResult,
        dueDate,
        completedDate,
        verifiedDate,
        verifiedBy,
        effectivenessCheck,
        effectivenessDate,
        effectivenessResult,
        linkedIncident,
        linkedAudit,
        notes,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create CAPA', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA' },
    });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateCapaSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskCapa.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    const {
      riskId,
      title,
      description,
      type,
      source,
      priority,
      status,
      assignee,
      assigneeName,
      rootCause,
      actionPlan,
      verificationMethod,
      verificationResult,
      dueDate,
      completedDate,
      verifiedDate,
      verifiedBy,
      effectivenessCheck,
      effectivenessDate,
      effectivenessResult,
      linkedIncident,
      linkedAudit,
      notes,
    } = parsed.data;
    const data = await prisma.riskCapa.update({
      where: { id: req.params.id },
      data: {
        riskId,
        title,
        description,
        type,
        source,
        priority,
        status,
        assignee,
        assigneeName,
        rootCause,
        actionPlan,
        verificationMethod,
        verificationResult,
        dueDate,
        completedDate,
        verifiedDate,
        verifiedBy,
        effectivenessCheck,
        effectivenessDate,
        effectivenessResult,
        linkedIncident,
        linkedAudit,
        notes,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update CAPA', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' },
    });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.riskCapa.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null } as any,
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    await prisma.riskCapa.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'CAPA deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to delete CAPA', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' },
    });
  }
});

export default router;
