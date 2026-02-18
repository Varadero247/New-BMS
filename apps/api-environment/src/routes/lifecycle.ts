import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

const LCA_STAGE_NAMES = [
  'RAW_MATERIAL_EXTRACTION',
  'MANUFACTURING',
  'DISTRIBUTION',
  'USE',
  'END_OF_LIFE',
] as const;

// ============================================
// Reference Number Generator
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, '0')}`;
  const count = await prisma.lifeCycleAssessment.count({
    where: { refNumber: { startsWith: `LCA-${yymm}` } },
  });
  return `LCA-${yymm}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// LIFE CYCLE ASSESSMENTS (ISO 14001 Clause 8.1)
// ============================================

// POST /assessments — Create LCA (auto-creates 5 empty stages)
router.post('/assessments', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      productProcess: z.string().min(1),
      description: z.string().optional(),
      status: z.enum(['DRAFT', 'IN_PROGRESS', 'COMPLETED', 'ARCHIVED']).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const assessment = await prisma.lifeCycleAssessment.create({
      data: {
        refNumber,
        title: data.title,
        productProcess: data.productProcess,
        description: data.description,
        status: (data.status as any) || 'DRAFT',
        createdBy: req.user?.id,
        stages: {
          create: LCA_STAGE_NAMES.map((stageName) => ({
            stageName: stageName as any,
          })),
        },
      },
      include: { stages: { orderBy: { stageName: 'asc' } } },
    });

    res.status(201).json({ success: true, data: assessment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create LCA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create life cycle assessment' } });
  }
});

// GET /assessments — List with pagination
router.get('/assessments', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { productProcess: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [assessments, total] = await Promise.all([
      prisma.lifeCycleAssessment.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: { stages: { orderBy: { stageName: 'asc' } } },
      }),
      prisma.lifeCycleAssessment.count({ where }),
    ]);

    res.json({
      success: true,
      data: assessments,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List LCAs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list life cycle assessments' } });
  }
});

// GET /assessments/:id — Get with all stages
router.get('/assessments/:id', checkOwnership(prisma.lifeCycleAssessment as any), async (req: AuthRequest, res: Response) => {
  try {
    const assessment = await prisma.lifeCycleAssessment.findUnique({
      where: { id: req.params.id },
      include: { stages: { orderBy: { stageName: 'asc' } } },
    });
    if (!assessment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Life cycle assessment not found' } });

    res.json({ success: true, data: assessment });
  } catch (error) {
    logger.error('Get LCA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get life cycle assessment' } });
  }
});

// PUT /assessments/:id/stages/:stage — Update stage data
// :stage param is the LcaStageName (e.g. "MANUFACTURING")
// Uses upsert on the @@unique([assessmentId, stageName]) constraint
router.put('/assessments/:id/stages/:stage', checkOwnership(prisma.lifeCycleAssessment as any), async (req: AuthRequest, res: Response) => {
  try {
    const { id, stage } = req.params;

    // Validate stage name
    if (!LCA_STAGE_NAMES.includes(stage as any)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Invalid stage name. Must be one of: ${LCA_STAGE_NAMES.join(', ')}`,
        },
      });
    }

    // Verify the assessment exists
    const assessment = await prisma.lifeCycleAssessment.findUnique({ where: { id } });
    if (!assessment) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Life cycle assessment not found' } });

    const schema = z.object({
      aspects: z.string().optional(),
      impacts: z.string().optional(),
      severity: z.number().min(1).max(5).optional(),
      controls: z.string().optional(),
      supplierReqs: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const stageRecord = await prisma.lifeCycleStage.upsert({
      where: {
        assessmentId_stageName: {
          assessmentId: id,
          stageName: stage as any,
        },
      },
      update: {
        aspects: data.aspects,
        impacts: data.impacts,
        severity: data.severity,
        controls: data.controls,
        supplierReqs: data.supplierReqs,
        notes: data.notes,
      },
      create: {
        assessmentId: id,
        stageName: stage as any,
        aspects: data.aspects,
        impacts: data.impacts,
        severity: data.severity,
        controls: data.controls,
        supplierReqs: data.supplierReqs,
        notes: data.notes,
      },
    });

    res.json({ success: true, data: stageRecord });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update LCA stage error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update life cycle stage' } });
  }
});

export default router;
