import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { calculateAspectSignificance } from '@ims/calculations';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const STANDARD = 'ISO_14001';

router.use(authenticate);

// GET /api/risks - List environmental aspects
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, aspectType } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (status) where.status = status;
    if (aspectType) where.aspectType = aspectType;

    const [aspects, total] = await Promise.all([
      prisma.risk.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { significanceScore: 'desc' },
      }),
      prisma.risk.count({ where }),
    ]);

    res.json({
      success: true,
      data: aspects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List aspects error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list aspects' } });
  }
});

// GET /api/risks/:id - Get single aspect
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const aspect = await prisma.risk.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: { actions: true },
    });

    if (!aspect) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    }

    res.json({ success: true, data: aspect });
  } catch (error) {
    console.error('Get aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get aspect' } });
  }
});

// POST /api/risks - Create environmental aspect
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      aspectType: z.string(),
      environmentalImpact: z.string(),
      scale: z.number().min(1).max(5).default(3),
      frequency: z.number().min(1).max(5).default(3),
      legalImpact: z.number().min(1).max(5).default(3),
      existingControls: z.string().optional(),
      additionalControls: z.string().optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate significance
    const significance = calculateAspectSignificance({
      scale: data.scale,
      frequency: data.frequency,
      legalImpact: data.legalImpact,
    });

    const aspect = await prisma.risk.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        title: data.title,
        description: data.description,
        aspectType: data.aspectType,
        environmentalImpact: data.environmentalImpact,
        scale: data.scale,
        frequency: data.frequency,
        legalImpact: data.legalImpact,
        significanceScore: significance.score,
        likelihood: data.scale,  // Map for compatibility
        severity: data.legalImpact,
        detectability: 1,
        riskScore: significance.score,
        riskLevel: significance.level === 'CRITICAL' ? 'CRITICAL' :
                   significance.level === 'HIGH' ? 'HIGH' :
                   significance.level === 'MODERATE' ? 'MEDIUM' : 'LOW',
        existingControls: data.existingControls,
        additionalControls: data.additionalControls,
        status: 'ACTIVE',
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
      },
    });

    res.status(201).json({ success: true, data: aspect });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create aspect' } });
  }
});

// PATCH /api/risks/:id - Update aspect
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      aspectType: z.string().optional(),
      environmentalImpact: z.string().optional(),
      scale: z.number().min(1).max(5).optional(),
      frequency: z.number().min(1).max(5).optional(),
      legalImpact: z.number().min(1).max(5).optional(),
      existingControls: z.string().optional(),
      additionalControls: z.string().optional(),
      status: z.enum(['ACTIVE', 'UNDER_REVIEW', 'MITIGATED', 'CLOSED', 'ACCEPTED']).optional(),
      reviewDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Recalculate significance if any factor changed
    const scale = data.scale ?? existing.scale ?? 3;
    const frequency = data.frequency ?? existing.frequency ?? 3;
    const legalImpact = data.legalImpact ?? existing.legalImpact ?? 3;

    const significance = calculateAspectSignificance({ scale, frequency, legalImpact });

    const aspect = await prisma.risk.update({
      where: { id: req.params.id },
      data: {
        ...data,
        scale,
        frequency,
        legalImpact,
        significanceScore: significance.score,
        likelihood: scale,
        severity: legalImpact,
        riskScore: significance.score,
        riskLevel: significance.level === 'CRITICAL' ? 'CRITICAL' :
                   significance.level === 'HIGH' ? 'HIGH' :
                   significance.level === 'MODERATE' ? 'MEDIUM' : 'LOW',
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : existing.reviewDate,
        lastReviewedAt: new Date(),
      },
    });

    res.json({ success: true, data: aspect });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update aspect' } });
  }
});

// DELETE /api/risks/:id - Delete aspect
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.risk.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Aspect not found' } });
    }

    await prisma.risk.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Aspect deleted successfully' } });
  } catch (error) {
    console.error('Delete aspect error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete aspect' } });
  }
});

export default router;
