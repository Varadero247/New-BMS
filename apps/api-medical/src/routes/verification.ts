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
// DESIGN VERIFICATION
// (ISO 13485 Clause 7.3.6 / FDA 21 CFR 820.30(f))
// ============================================

const createSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  title: z.string().trim().min(1).max(200),
  protocol: z.string().trim().optional(),
  testMethod: z.string().trim().min(1).max(200),
  acceptanceCriteria: z.string().trim().min(1).max(200),
  results: z.string().trim().optional(),
  pass: z.boolean().optional(),
  completedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  completedBy: z.string().trim().optional(),
  traceToInput: z.string().trim().optional(),
  traceToOutput: z.string().trim().optional(),
});

const updateSchema = createSchema.omit({ projectId: true }).partial();

// GET / - List design verifications
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', projectId, pass, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (projectId) where.projectId = projectId as any;
    if (pass !== undefined) where.pass = pass === 'true';
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { testMethod: { contains: search as string, mode: 'insensitive' } },
        { acceptanceCriteria: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [verifications, total] = await Promise.all([
      prisma.designVerification.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          project: { select: { id: true, title: true, status: true } },
        },
      }),
      prisma.designVerification.count({ where }),
    ]);

    res.json({
      success: true,
      data: verifications,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List design verifications error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list design verifications' },
    });
  }
});

// GET /stats - Verification statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, passed, failed, pending] = await Promise.all([
      prisma.designVerification.count(),
      prisma.designVerification.count({ where: { pass: true } }),
      prisma.designVerification.count({ where: { pass: false } }),
      prisma.designVerification.count({ where: { pass: null } }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        passed,
        failed,
        pending,
        passRate: total > 0 ? Math.round((passed / (passed + failed)) * 100) : 0,
      },
    });
  } catch (error) {
    logger.error('Verification stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get verification stats' },
    });
  }
});

// GET /:id - Get single verification
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const verification = await prisma.designVerification.findUnique({
      where: { id: req.params.id },
      include: { project: { select: { id: true, title: true } } },
    });

    if (!verification) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design verification not found' },
      });
    }

    res.json({ success: true, data: verification });
  } catch (error) {
    logger.error('Get design verification error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get design verification' },
    });
  }
});

// POST / - Create design verification
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);

    const project = await prisma.designProject.findUnique({ where: { id: data.projectId } });
    if (!project) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design project not found' },
      });
    }

    const verification = await prisma.designVerification.create({
      data: {
        projectId: data.projectId,
        title: data.title,
        protocol: data.protocol,
        testMethod: data.testMethod,
        acceptanceCriteria: data.acceptanceCriteria,
        results: data.results,
        pass: data.pass,
        completedDate: data.completedDate ? new Date(data.completedDate) : null,
        completedBy: data.completedBy,
        traceToInput: data.traceToInput,
        traceToOutput: data.traceToOutput,
      },
      include: { project: { select: { id: true, title: true } } },
    });

    res.status(201).json({ success: true, data: verification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create design verification error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create design verification' },
    });
  }
});

// PUT /:id - Update design verification
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.designVerification.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design verification not found' },
      });
    }

    const data = updateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };
    if (data.completedDate) updateData.completedDate = new Date(data.completedDate);

    const verification = await prisma.designVerification.update({
      where: { id: req.params.id },
      data: updateData,
      include: { project: { select: { id: true, title: true } } },
    });

    res.json({ success: true, data: verification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update design verification error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update design verification' },
    });
  }
});

// DELETE /:id - Delete design verification
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.designVerification.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Design verification not found' },
      });
    }

    await prisma.designVerification.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete design verification error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete design verification' },
    });
  }
});

export default router;
