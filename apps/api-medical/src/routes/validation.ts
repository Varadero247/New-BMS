import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// DESIGN VALIDATION
// (ISO 13485 Clause 7.3.7 / FDA 21 CFR 820.30(g))
// ============================================

const createSchema = z.object({
  projectId: z.string().min(1),
  title: z.string().min(1),
  protocol: z.string().optional(),
  testMethod: z.string().min(1),
  intendedUseConfirmed: z.boolean().optional(),
  results: z.string().optional(),
  pass: z.boolean().optional(),
  completedDate: z.string().optional(),
  completedBy: z.string().optional(),
});

const updateSchema = createSchema.omit({ projectId: true }).partial();

// GET / - List design validations
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', projectId, pass, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (projectId) where.projectId = projectId as any;
    if (pass !== undefined) where.pass = pass === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { testMethod: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [validations, total] = await Promise.all([
      prisma.designValidation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true, status: true } },
        },
      }),
      prisma.designValidation.count({ where }),
    ]);

    res.json({
      success: true,
      data: validations,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List design validations error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list design validations' } });
  }
});

// GET /stats - Validation statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, passed, failed, pending, confirmedIntendedUse] = await Promise.all([
      prisma.designValidation.count(),
      prisma.designValidation.count({ where: { pass: true } }),
      prisma.designValidation.count({ where: { pass: false } }),
      prisma.designValidation.count({ where: { pass: null } }),
      prisma.designValidation.count({ where: { intendedUseConfirmed: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        passed,
        failed,
        pending,
        confirmedIntendedUse,
        passRate: total > 0 ? Math.round((passed / (passed + failed)) * 100) : 0,
      },
    });
  } catch (error) {
    logger.error('Validation stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get validation stats' } });
  }
});

// GET /:id - Get single validation
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const validation = await prisma.designValidation.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { id: true, title: true } } },
    });

    if (!validation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design validation not found' } });
    }

    res.json({ success: true, data: validation });
  } catch (error) {
    logger.error('Get design validation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get design validation' } });
  }
});

// POST / - Create design validation
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);

    const project = await prisma.designProject.findUnique({ where: { id: data.projectId } });
    if (!project) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design project not found' } });
    }

    const validation = await prisma.designValidation.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        protocol: data.protocol,
        testMethod: data.testMethod,
        intendedUseConfirmed: data.intendedUseConfirmed ?? false,
        results: data.results,
        pass: data.pass,
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        completedBy: data.completedBy,
      },
      include: { project: { select: { id: true, title: true } } },
    });

    res.status(201).json({ success: true, data: validation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create design validation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create design validation' } });
  }
});

// PUT /:id - Update design validation
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.designValidation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design validation not found' } });
    }

    const data = updateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);

    const validation = await prisma.designValidation.update({
      where: { id: req.params.id },
      data: updateData,
      include: { project: { select: { id: true, title: true } } },
    });

    res.json({ success: true, data: validation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update design validation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update design validation' } });
  }
});

// DELETE /:id - Delete design validation
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.designValidation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Design validation not found' } });
    }

    await prisma.designValidation.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete design validation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete design validation' } });
  }
});

export default router;
