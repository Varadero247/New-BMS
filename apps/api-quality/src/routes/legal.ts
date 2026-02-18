import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router: Router = Router();

router.use(authenticate);
router.param('id', validateIdParam());

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-LEG';
  const count = await prisma.qualLegal.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List legal obligations
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', obligationType, complianceStatus, status, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (obligationType) where.obligationType = obligationType as any;
    if (complianceStatus) where.complianceStatus = complianceStatus as any;
    if (status) where.status = status as any;
    if (search) {
      where.title = { contains: search as string, mode: 'insensitive' };
    }

    const [items, total] = await Promise.all([
      prisma.qualLegal.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.qualLegal.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List legal obligations error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list legal obligations' } });
  }
});

// GET /:id - Get single legal obligation
router.get('/:id', checkOwnership(prisma.qualLegal), async (req: AuthRequest, res: Response) => {
  try {
    const legal = await prisma.qualLegal.findUnique({
      where: { id: req.params.id },
    });

    if (!legal) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });
    }

    res.json({ success: true, data: legal });
  } catch (error) {
    logger.error('Get legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get legal obligation' } });
  }
});

// POST / - Create legal obligation
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1),
      obligationType: z.enum(['PRODUCT_STANDARD', 'CUSTOMER_CONTRACT', 'REGULATORY', 'INDUSTRY_CODE', 'CERTIFICATION_REQUIREMENT', 'VOLUNTARY_COMMITMENT']),
      issuingBody: z.string().optional(),
      referenceDoc: z.string().optional(),
      description: z.string().trim().min(1),
      requirements: z.string().optional(),
      applicableScope: z.string().optional(),
      customerName: z.string().optional(),
      contractNumber: z.string().optional(),
      productServiceScope: z.string().optional(),
      certificationBody: z.string().optional(),
      complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_ASSESSED', 'UNDER_REVIEW']).default('NOT_ASSESSED'),
      complianceNotes: z.string().optional(),
      gapAnalysis: z.string().optional(),
      lastAssessmentDate: z.string().optional(),
      nextAssessmentDate: z.string().optional(),
      responsiblePerson: z.string().optional(),
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).default('ANNUALLY'),
      effectiveDate: z.string().optional(),
      expiryDate: z.string().optional(),
      status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'SUPERSEDED', 'WITHDRAWN']).default('ACTIVE'),
      trackedInHs: z.boolean().default(false),
      trackedInEnv: z.boolean().default(false),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const legal = await prisma.qualLegal.create({
      data: {
        ...data,
        referenceNumber,
        lastAssessmentDate: data.lastAssessmentDate ? new Date(data.lastAssessmentDate) : undefined,
        nextAssessmentDate: data.nextAssessmentDate ? new Date(data.nextAssessmentDate) : undefined,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: legal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create legal obligation' } });
  }
});

// PUT /:id - Update legal obligation
router.put('/:id', checkOwnership(prisma.qualLegal), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualLegal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).optional(),
      obligationType: z.enum(['PRODUCT_STANDARD', 'CUSTOMER_CONTRACT', 'REGULATORY', 'INDUSTRY_CODE', 'CERTIFICATION_REQUIREMENT', 'VOLUNTARY_COMMITMENT']).optional(),
      issuingBody: z.string().nullable().optional(),
      referenceDoc: z.string().nullable().optional(),
      description: z.string().optional(),
      requirements: z.string().nullable().optional(),
      applicableScope: z.string().nullable().optional(),
      customerName: z.string().nullable().optional(),
      contractNumber: z.string().nullable().optional(),
      productServiceScope: z.string().nullable().optional(),
      certificationBody: z.string().nullable().optional(),
      complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'NOT_ASSESSED', 'UNDER_REVIEW']).optional(),
      complianceNotes: z.string().nullable().optional(),
      gapAnalysis: z.string().nullable().optional(),
      lastAssessmentDate: z.string().nullable().optional(),
      nextAssessmentDate: z.string().nullable().optional(),
      responsiblePerson: z.string().nullable().optional(),
      reviewFrequency: z.enum(['MONTHLY', 'QUARTERLY', 'ANNUALLY', 'BI_ANNUALLY', 'ON_CHANGE']).optional(),
      effectiveDate: z.string().nullable().optional(),
      expiryDate: z.string().nullable().optional(),
      status: z.enum(['ACTIVE', 'PENDING', 'EXPIRED', 'SUPERSEDED', 'WITHDRAWN']).optional(),
      trackedInHs: z.boolean().optional(),
      trackedInEnv: z.boolean().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiComplianceChecklist: z.string().nullable().optional(),
      aiGapAnalysis: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = {
      ...data,
      lastAssessmentDate: data.lastAssessmentDate ? new Date(data.lastAssessmentDate) : data.lastAssessmentDate === null ? null : undefined,
      nextAssessmentDate: data.nextAssessmentDate ? new Date(data.nextAssessmentDate) : data.nextAssessmentDate === null ? null : undefined,
      effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : data.effectiveDate === null ? null : undefined,
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : data.expiryDate === null ? null : undefined,
    };

    const legal = await prisma.qualLegal.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: legal });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update legal obligation' } });
  }
});

// DELETE /:id - Delete legal obligation
router.delete('/:id', checkOwnership(prisma.qualLegal), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualLegal.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });
    }

    await prisma.qualLegal.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete legal obligation' } });
  }
});

export default router;
