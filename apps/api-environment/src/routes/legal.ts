import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const STANDARD = 'ISO_14001';

router.use(authenticate);

// GET /api/legal - List environmental legal requirements
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', complianceStatus, type } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (complianceStatus) where.complianceStatus = complianceStatus;
    if (type) where.type = type;

    const [requirements, total] = await Promise.all([
      prisma.legalRequirement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { effectiveDate: 'desc' },
      }),
      prisma.legalRequirement.count({ where }),
    ]);

    res.json({
      success: true,
      data: requirements,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List legal requirements error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list legal requirements' } });
  }
});

// GET /api/legal/:id - Get single legal requirement
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const requirement = await prisma.legalRequirement.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: { actions: true },
    });

    if (!requirement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    res.json({ success: true, data: requirement });
  } catch (error) {
    console.error('Get legal requirement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get legal requirement' } });
  }
});

// POST /api/legal - Create legal requirement
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(['LEGISLATION', 'REGULATION', 'CODE_OF_PRACTICE', 'PERMIT', 'LICENSE', 'STANDARD', 'CUSTOMER_REQUIREMENT', 'INTERNAL_REQUIREMENT', 'OTHER']),
      jurisdiction: z.string().optional(),
      issuingBody: z.string().optional(),
      referenceNumber: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      reviewFrequency: z.string().optional(),
      responsiblePerson: z.string().optional(),
      complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'NOT_APPLICABLE']).default('PENDING'),
    });

    const data = schema.parse(req.body);

    const requirement = await prisma.legalRequirement.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        ...data,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      },
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create legal requirement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create legal requirement' } });
  }
});

// PATCH /api/legal/:id - Update legal requirement
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.legalRequirement.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(['LEGISLATION', 'REGULATION', 'CODE_OF_PRACTICE', 'PERMIT', 'LICENSE', 'STANDARD', 'CUSTOMER_REQUIREMENT', 'INTERNAL_REQUIREMENT', 'OTHER']).optional(),
      jurisdiction: z.string().optional(),
      issuingBody: z.string().optional(),
      referenceNumber: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      reviewFrequency: z.string().optional(),
      responsiblePerson: z.string().optional(),
      complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'NOT_APPLICABLE']).optional(),
      complianceEvidence: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const requirement = await prisma.legalRequirement.update({
      where: { id: req.params.id },
      data: {
        ...data,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : existing.effectiveDate,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : existing.expiryDate,
        lastAssessedAt: data.complianceStatus ? new Date() : existing.lastAssessedAt,
      },
    });

    res.json({ success: true, data: requirement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update legal requirement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update legal requirement' } });
  }
});

// DELETE /api/legal/:id - Delete legal requirement
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.legalRequirement.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    await prisma.legalRequirement.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Legal requirement deleted successfully' } });
  } catch (error) {
    console.error('Delete legal requirement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete legal requirement' } });
  }
});

export default router;
