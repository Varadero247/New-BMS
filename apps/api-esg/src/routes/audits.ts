import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const auditCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY']),
  framework: z.string().max(200).optional().nullable(),
  auditor: z.string().max(200).optional().nullable(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  findings: z.any().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
});

const auditUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'REGULATORY']).optional(),
  framework: z.string().max(200).optional().nullable(),
  auditor: z.string().max(200).optional().nullable(),
  startDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  endDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED']).optional(),
  findings: z.any().optional().nullable(),
  score: z.number().min(0).max(100).optional().nullable(),
});

// GET /api/audits
router.get('/', async (req: Request, res: Response) => {
  try {
    const { auditType, status, page = '1', limit = '20' } = req.query;
    const skip =
      (Math.max(1, parseInt(page as string, 10) || 1) - 1) *
      Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (auditType) where.auditType = auditType as string;
    if (status) where.status = status as string;

    const [data, total] = await Promise.all([
      prisma.esgAudit.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page as string, 10) || 1),
        limit: take,
        total,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error: unknown) {
    logger.error('Error listing audits', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' },
    });
  }
});

// POST /api/audits
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = auditCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.issues,
        },
      });
    }

    const data = parsed.data;
    const audit = await prisma.esgAudit.create({
      data: {
        title: data.title,
        auditType: data.auditType,
        framework: data.framework || null,
        auditor: data.auditor || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        status: data.status || 'PLANNED',
        findings: data.findings || null,
        score: data.score != null ? new Prisma.Decimal(data.score) : null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error creating audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' },
    });
  }
});

// GET /api/audits/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const audit = await prisma.esgAudit.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!audit) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error fetching audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch audit' },
    });
  }
});

// PUT /api/audits/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = auditUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.issues,
        },
      });
    }

    const existing = await prisma.esgAudit.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.startDate !== undefined)
      updateData.startDate = updateData.startDate ? new Date(updateData.startDate) : null;
    if (updateData.endDate !== undefined)
      updateData.endDate = updateData.endDate ? new Date(updateData.endDate) : null;
    if (updateData.score !== undefined)
      updateData.score = updateData.score != null ? new Prisma.Decimal(updateData.score) : null;

    const audit = await prisma.esgAudit.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Error updating audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' },
    });
  }
});

// DELETE /api/audits/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgAudit.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    await prisma.esgAudit.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Audit deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting audit', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' },
    });
  }
});

export default router;
