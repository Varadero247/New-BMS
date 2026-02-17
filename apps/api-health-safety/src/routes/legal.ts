import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');

const router: IRouter = Router();

router.use(authenticate);
router.param('id', validateIdParam());

const LEGAL_CATEGORIES = ['PRIMARY_LEGISLATION', 'SUBORDINATE_LEGISLATION', 'ACOP', 'HSE_GUIDANCE', 'INTERNATIONAL_STANDARD', 'INDUSTRY_STANDARD', 'CONTRACTUAL', 'VOLUNTARY'] as const;
const COMPLIANCE_STATUSES = ['COMPLIANT', 'PARTIAL', 'NON_COMPLIANT', 'UNDER_REVIEW', 'NOT_ASSESSED'] as const;
const LEGAL_STATUSES = ['ACTIVE', 'REVIEW_DUE', 'SUPERSEDED', 'ARCHIVED'] as const;

// Generate reference number LR-001, LR-002, etc.
async function generateReferenceNumber(): Promise<string> {
  const last = await prisma.legalRequirement.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { referenceNumber: true },
  });

  let nextNum = 1;
  if (last?.referenceNumber) {
    const match = last.referenceNumber.match(/LR-(\d+)/);
    if (match) nextNum = parseInt(match[1], 10) + 1;
  }

  return `LR-${String(nextNum).padStart(3, '0')}`;
}

// GET /api/legal - List legal requirements
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', complianceStatus, category, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.LegalRequirementWhereInput = { deletedAt: null };
    if (complianceStatus) where.complianceStatus = complianceStatus;
    if (category) where.category = category;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { legislationRef: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [requirements, total] = await Promise.all([
      prisma.legalRequirement.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.legalRequirement.count({ where }),
    ]);

    res.json({
      success: true,
      data: requirements,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List legal requirements error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list legal requirements' } });
  }
});

// GET /api/legal/:id - Get single legal requirement
router.get('/:id', checkOwnership(prisma.legalRequirement), async (req: AuthRequest, res: Response) => {
  try {
    const requirement = await prisma.legalRequirement.findUnique({
      where: { id: req.params.id },
    });

    if (!requirement) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    res.json({ success: true, data: requirement });
  } catch (error) {
    logger.error('Get legal requirement error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get legal requirement' } });
  }
});

// POST /api/legal - Create legal requirement
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      category: z.enum(LEGAL_CATEGORIES),
      jurisdiction: z.string().optional(),
      legislationRef: z.string().optional(),
      section: z.string().optional(),
      applicableAreas: z.string().optional(),
      effectiveDate: z.string().optional(),
      reviewDate: z.string().optional(),
      complianceStatus: z.enum(COMPLIANCE_STATUSES).optional(),
      complianceNotes: z.string().optional(),
      responsiblePerson: z.string().optional(),
      // AI fields
      aiKeyObligations: z.string().optional(),
      aiGapAnalysis: z.string().optional(),
      aiRequiredActions: z.string().optional(),
      aiEvidenceRequired: z.string().optional(),
      aiPenaltyForNonCompliance: z.string().optional(),
      aiAssessmentGenerated: z.boolean().optional(),
      status: z.enum(LEGAL_STATUSES).optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateReferenceNumber();

    const requirement = await prisma.legalRequirement.create({
      data: {
        id: uuidv4(),
        referenceNumber,
        title: data.title,
        description: data.description,
        category: data.category,
        jurisdiction: data.jurisdiction,
        legislationRef: data.legislationRef,
        section: data.section,
        applicableAreas: data.applicableAreas,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        reviewDate: data.reviewDate ? new Date(data.reviewDate) : null,
        complianceStatus: data.complianceStatus || 'NOT_ASSESSED',
        complianceNotes: data.complianceNotes,
        responsiblePerson: data.responsiblePerson,
        aiKeyObligations: data.aiKeyObligations,
        aiGapAnalysis: data.aiGapAnalysis,
        aiRequiredActions: data.aiRequiredActions,
        aiEvidenceRequired: data.aiEvidenceRequired,
        aiPenaltyForNonCompliance: data.aiPenaltyForNonCompliance,
        aiAssessmentGenerated: data.aiAssessmentGenerated ?? false,
        status: data.status || 'ACTIVE',
      },
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create legal requirement error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create legal requirement' } });
  }
});

// PATCH /api/legal/:id - Update legal requirement
router.patch('/:id', checkOwnership(prisma.legalRequirement), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.legalRequirement.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      category: z.enum(LEGAL_CATEGORIES).optional(),
      jurisdiction: z.string().optional(),
      legislationRef: z.string().optional(),
      section: z.string().optional(),
      applicableAreas: z.string().optional(),
      effectiveDate: z.string().optional(),
      reviewDate: z.string().optional(),
      complianceStatus: z.enum(COMPLIANCE_STATUSES).optional(),
      complianceNotes: z.string().optional(),
      responsiblePerson: z.string().optional(),
      aiKeyObligations: z.string().optional(),
      aiGapAnalysis: z.string().optional(),
      aiRequiredActions: z.string().optional(),
      aiEvidenceRequired: z.string().optional(),
      aiPenaltyForNonCompliance: z.string().optional(),
      aiAssessmentGenerated: z.boolean().optional(),
      status: z.enum(LEGAL_STATUSES).optional(),
    });

    const data = schema.parse(req.body);

    const updateData = { ...data };
    if (data.effectiveDate) updateData.effectiveDate = new Date(data.effectiveDate);
    if (data.reviewDate) updateData.reviewDate = new Date(data.reviewDate);
    if (data.complianceStatus && data.complianceStatus !== existing.complianceStatus) {
      updateData.lastReviewedAt = new Date();
    }

    const requirement = await prisma.legalRequirement.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: requirement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update legal requirement error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update legal requirement' } });
  }
});

// DELETE /api/legal/:id - Delete legal requirement
router.delete('/:id', checkOwnership(prisma.legalRequirement), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.legalRequirement.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal requirement not found' } });
    }

    await prisma.legalRequirement.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete legal requirement error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete legal requirement' } });
  }
});

export default router;
