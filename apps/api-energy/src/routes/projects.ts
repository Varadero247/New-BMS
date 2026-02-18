import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-energy');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Reference number generator
// ---------------------------------------------------------------------------

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ENR-${prefix}-${yy}${mm}-${rand}`;
}

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const projectCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['EFFICIENCY', 'RENEWABLE', 'BEHAVIORAL', 'PROCESS', 'EQUIPMENT']),
  estimatedSavings: z.number().optional().nullable(),
  investmentCost: z.number().optional().nullable(),
  paybackMonths: z.number().int().min(0).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  owner: z.string().max(200).optional().nullable(),
});

const projectUpdateSchema = z.object({
  title: z.string().min(1).max(300).optional(),
  description: z.string().max(2000).optional().nullable(),
  type: z.enum(['EFFICIENCY', 'RENEWABLE', 'BEHAVIORAL', 'PROCESS', 'EQUIPMENT']).optional(),
  status: z.enum(['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  estimatedSavings: z.number().optional().nullable(),
  actualSavings: z.number().optional().nullable(),
  investmentCost: z.number().optional().nullable(),
  paybackMonths: z.number().int().min(0).optional().nullable(),
  startDate: z.string().datetime({ offset: true }).or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable(),
  owner: z.string().max(200).optional().nullable(),
  roi: z.number().optional().nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// GET /roi-summary — ROI summary across projects
// ---------------------------------------------------------------------------

router.get('/roi-summary', async (_req: Request, res: Response) => {
  try {
    const projects = await prisma.energyProject.findMany({
      where: { deletedAt: null, status: { in: ['COMPLETED', 'IN_PROGRESS'] } as any },
      take: 1000});

    const totalInvestment = projects.reduce((sum, p) => sum + Number(p.investmentCost || 0), 0);
    const totalEstimatedSavings = projects.reduce((sum, p) => sum + Number(p.estimatedSavings || 0), 0);
    const totalActualSavings = projects.reduce((sum, p) => sum + Number(p.actualSavings || 0), 0);
    const completedCount = projects.filter(p => p.status === 'COMPLETED').length;
    const inProgressCount = projects.filter(p => p.status === 'IN_PROGRESS').length;
    const averagePayback = projects.filter(p => p.paybackMonths).length > 0
      ? projects.filter(p => p.paybackMonths).reduce((sum, p) => sum + (p.paybackMonths || 0), 0) / projects.filter(p => p.paybackMonths).length
      : 0;

    res.json({
      success: true,
      data: {
        totalInvestment,
        totalEstimatedSavings,
        totalActualSavings,
        netReturn: totalActualSavings - totalInvestment,
        overallROI: totalInvestment > 0 ? ((totalActualSavings - totalInvestment) / totalInvestment) * 100 : 0,
        completedProjects: completedCount,
        inProgressProjects: inProgressCount,
        averagePaybackMonths: Math.round(averagePayback * 10) / 10,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get ROI summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get ROI summary' } });
  }
});

// ---------------------------------------------------------------------------
// GET / — List projects
// ---------------------------------------------------------------------------

router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, status } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (type && typeof type === 'string') {
      where.type = type;
    }
    if (status && typeof status === 'string') {
      where.status = status;
    }

    const [projects, total] = await Promise.all([
      prisma.energyProject.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.energyProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list projects', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' } });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create project
// ---------------------------------------------------------------------------

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = projectCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const data = parsed.data;

    const project = await prisma.energyProject.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        type: data.type,
        status: 'PROPOSED',
        estimatedSavings: data.estimatedSavings != null ? new Prisma.Decimal(data.estimatedSavings) : null,
        investmentCost: data.investmentCost != null ? new Prisma.Decimal(data.investmentCost) : null,
        paybackMonths: data.paybackMonths ?? null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        owner: data.owner ?? null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    logger.info('Project created', { projectId: project.id });
    res.status(201).json({ success: true, data: project });
  } catch (error: unknown) {
    logger.error('Failed to create project', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get project
// ---------------------------------------------------------------------------

const RESERVED_PATHS = new Set(['roi-summary']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const project = await prisma.energyProject.findFirst({
      where: { id, deletedAt: null } as any,
    });

    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    res.json({ success: true, data: project });
  } catch (error: unknown) {
    logger.error('Failed to get project', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get project' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id — Update project
// ---------------------------------------------------------------------------

router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = projectUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }

    const existing = await prisma.energyProject.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    const updateData: Record<string, unknown> = { ...parsed.data };
    if (updateData.estimatedSavings !== undefined && updateData.estimatedSavings !== null) {
      updateData.estimatedSavings = new Prisma.Decimal(updateData.estimatedSavings as any);
    }
    if (updateData.actualSavings !== undefined && updateData.actualSavings !== null) {
      updateData.actualSavings = new Prisma.Decimal(updateData.actualSavings as any);
    }
    if (updateData.investmentCost !== undefined && updateData.investmentCost !== null) {
      updateData.investmentCost = new Prisma.Decimal(updateData.investmentCost as any);
    }
    if (updateData.roi !== undefined && updateData.roi !== null) {
      updateData.roi = new Prisma.Decimal(updateData.roi as any);
    }
    if (updateData.startDate) {
      updateData.startDate = new Date(updateData.startDate as string);
    }

    const project = await prisma.energyProject.update({
      where: { id },
      data: updateData,
    });

    logger.info('Project updated', { projectId: id });
    res.json({ success: true, data: project });
  } catch (error: unknown) {
    logger.error('Failed to update project', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' } });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Soft delete project
// ---------------------------------------------------------------------------

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.energyProject.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    await prisma.energyProject.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    logger.info('Project soft-deleted', { projectId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete project', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete project' } });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/complete — Complete project
// ---------------------------------------------------------------------------

router.put('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { actualSavings } = req.body;

    const existing = await prisma.energyProject.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Project not found' } });
    }

    if (existing.status === 'COMPLETED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Project is already completed' } });
    }
    if (existing.status === 'CANCELLED') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Cannot complete a cancelled project' } });
    }

    const investment = Number(existing.investmentCost || 0);
    const savings = actualSavings != null ? actualSavings : Number(existing.estimatedSavings || 0);
    const roi = investment > 0 ? ((savings - investment) / investment) * 100 : 0;

    const project = await prisma.energyProject.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedDate: new Date(),
        actualSavings: new Prisma.Decimal(savings),
        roi: new Prisma.Decimal(roi),
      },
    });

    logger.info('Project completed', { projectId: id });
    res.json({ success: true, data: project });
  } catch (error: unknown) {
    logger.error('Failed to complete project', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete project' } });
  }
});

export default router;
