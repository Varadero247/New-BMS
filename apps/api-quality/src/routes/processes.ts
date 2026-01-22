import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { calculateRiskScore, getRiskLevel } from '@ims/calculations';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();
const STANDARD = 'ISO_9001';

router.use(authenticate);

// GET /api/risks - List process risks
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, riskLevel, category } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (status) where.status = status;
    if (riskLevel) where.riskLevel = riskLevel;
    if (category) where.category = category;

    const [processes, total] = await Promise.all([
      prisma.risk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { riskScore: 'desc' },
      }),
      prisma.risk.count({ where }),
    ]);

    res.json({
      success: true,
      data: processes,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List processes error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list processes' } });
  }
});

// GET /api/risks/:id - Get single process risk
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const process = await prisma.risk.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: { actions: true },
    });

    if (!process) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    res.json({ success: true, data: process });
  } catch (error) {
    console.error('Get process error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get process' } });
  }
});

// POST /api/risks - Create process risk
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.string().optional(),
      processOwner: z.string().optional(),
      processInputs: z.string().optional(),
      processOutputs: z.string().optional(),
      kpis: z.string().optional(),
      likelihood: z.number().min(1).max(5).default(3),
      severity: z.number().min(1).max(5).default(3),
      detectability: z.number().min(1).max(5).default(3),
      existingControls: z.string().optional(),
      additionalControls: z.string().optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const riskScore = calculateRiskScore(data.likelihood, data.severity, data.detectability);
    const riskLevel = getRiskLevel(riskScore);

    const process = await prisma.risk.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        ...data,
        riskScore,
        riskLevel,
        status: 'ACTIVE',
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      },
    });

    res.status(201).json({ success: true, data: process });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create process error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create process' } });
  }
});

// PATCH /api/risks/:id - Update process risk
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.string().optional(),
      processOwner: z.string().optional(),
      processInputs: z.string().optional(),
      processOutputs: z.string().optional(),
      kpis: z.string().optional(),
      likelihood: z.number().min(1).max(5).optional(),
      severity: z.number().min(1).max(5).optional(),
      detectability: z.number().min(1).max(5).optional(),
      existingControls: z.string().optional(),
      additionalControls: z.string().optional(),
      status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED']).optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate risk score if any factor changed
    const likelihood = data.likelihood ?? existing.likelihood;
    const severity = data.severity ?? existing.severity;
    const detectability = data.detectability ?? existing.detectability;
    const riskScore = calculateRiskScore(likelihood, severity, detectability);
    const riskLevel = getRiskLevel(riskScore);

    const process = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        ...data,
        riskScore,
        riskLevel,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : existing.reviewDate,
        lastReviewedAt: new Date(),
      },
    });

    res.json({ success: true, data: process });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update process error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update process' } });
  }
});

// DELETE /api/risks/:id - Delete process
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Process not found' } });
    }

    await prisma.risk.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Process deleted successfully' } });
  } catch (error) {
    console.error('Delete process error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete process' } });
  }
});

export default router;
