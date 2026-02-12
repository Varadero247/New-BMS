import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('charId', validateIdParam());

// Helper: generate Control Plan reference number CP-YYMM-XXXX
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CP-${yy}${mm}`;

  const count = await prisma.controlPlan.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST / - Create control plan
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      partNumber: z.string().min(1),
      partName: z.string().min(1),
      planType: z.enum(['PROTOTYPE', 'PRE_LAUNCH', 'PRODUCTION']).optional().default('PROTOTYPE'),
      revision: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const plan = await prisma.controlPlan.create({
      data: {
        refNumber,
        title: data.title,
        partNumber: data.partNumber,
        partName: data.partName,
        planType: data.planType,
        revision: data.revision || '1.0',
        status: 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create control plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create control plan' } });
  }
});

// GET / - List control plans
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, planType, partNumber } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.ControlPlanWhereInput = { deletedAt: null };
    if (status) where.status = status as any;
    if (planType) where.planType = planType as any;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };

    const [plans, total] = await Promise.all([
      prisma.controlPlan.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.controlPlan.count({ where }),
    ]);

    res.json({
      success: true,
      data: plans,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List control plans error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list control plans' } });
  }
});

// GET /:id - Get control plan with all characteristics
router.get('/:id', checkOwnership(prisma.controlPlan), async (req: AuthRequest, res: Response) => {
  try {
    const plan = await prisma.controlPlan.findUnique({
      where: { id: req.params.id },
      include: {
        characteristics: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!plan) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control plan not found' } });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    logger.error('Get control plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get control plan' } });
  }
});

// PUT /:id/characteristics/:charId - Update characteristic
router.put('/:id/characteristics/:charId', async (req: AuthRequest, res: Response) => {
  try {
    const { id, charId } = req.params;

    // Verify plan exists
    const plan = await prisma.controlPlan.findUnique({ where: { id } });
    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control plan not found' } });
    }

    // Find characteristic and verify it belongs to this plan
    const characteristic = await prisma.controlPlanChar.findUnique({
      where: { id: charId },
    });

    if (!characteristic || characteristic.planId !== id) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Characteristic not found' } });
    }

    const schema = z.object({
      processNumber: z.string().optional(),
      processName: z.string().optional(),
      machineDevice: z.string().optional(),
      characteristicName: z.string().optional(),
      characteristicType: z.enum(['PRODUCT', 'PROCESS']).optional(),
      specialCharClass: z.string().optional(),
      specification: z.string().optional(),
      tolerance: z.string().optional(),
      evalTechnique: z.string().optional(),
      sampleSize: z.string().optional(),
      sampleFrequency: z.string().optional(),
      controlMethod: z.string().optional(),
      reactionPlan: z.string().optional(),
      pfmeaRef: z.string().optional(),
      spcChartId: z.string().optional(),
      workInstructionRef: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) updateData[key] = value;
    }

    const updated = await prisma.controlPlanChar.update({
      where: { id: charId },
      data: updateData,
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update characteristic error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update characteristic' } });
  }
});

// POST /:id/characteristics - Add characteristic to plan
router.post('/:id/characteristics', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify plan exists
    const plan = await prisma.controlPlan.findUnique({ where: { id } });
    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control plan not found' } });
    }

    const schema = z.object({
      processNumber: z.string().min(1),
      processName: z.string().min(1),
      machineDevice: z.string().optional(),
      characteristicName: z.string().min(1),
      characteristicType: z.enum(['PRODUCT', 'PROCESS']),
      specialCharClass: z.string().optional(),
      specification: z.string().optional(),
      tolerance: z.string().optional(),
      evalTechnique: z.string().min(1),
      sampleSize: z.string().min(1),
      sampleFrequency: z.string().min(1),
      controlMethod: z.string().min(1),
      reactionPlan: z.string().min(1),
      pfmeaRef: z.string().optional(),
      spcChartId: z.string().optional(),
      workInstructionRef: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const characteristic = await prisma.controlPlanChar.create({
      data: {
        planId: id,
        processNumber: data.processNumber,
        processName: data.processName,
        machineDevice: data.machineDevice,
        characteristicName: data.characteristicName,
        characteristicType: data.characteristicType,
        specialCharClass: data.specialCharClass,
        specification: data.specification,
        tolerance: data.tolerance,
        evalTechnique: data.evalTechnique,
        sampleSize: data.sampleSize,
        sampleFrequency: data.sampleFrequency,
        controlMethod: data.controlMethod,
        reactionPlan: data.reactionPlan,
        pfmeaRef: data.pfmeaRef,
        spcChartId: data.spcChartId,
        workInstructionRef: data.workInstructionRef,
      },
    });

    res.status(201).json({ success: true, data: characteristic });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Add characteristic error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add characteristic' } });
  }
});

// POST /:id/approve - Approve control plan
router.post('/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const plan = await prisma.controlPlan.findUnique({ where: { id } });
    if (!plan || plan.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control plan not found' } });
    }

    if (plan.status === 'APPROVED') {
      return res.status(400).json({ success: false, error: { code: 'ALREADY_APPROVED', message: 'Control plan is already approved' } });
    }

    const updated = await prisma.controlPlan.update({
      where: { id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user?.id,
        approvedDate: new Date(),
      },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Approve control plan error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to approve control plan' } });
  }
});

export default router;
