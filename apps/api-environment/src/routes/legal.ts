import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma, EnvAssessmentMethod, EnvJurisdiction, EnvObligationType, EnvPriority, EnvReportingFrequency } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envLegal.count({
    where: { referenceNumber: { startsWith: `ENV-LEG-${year}` } },
  });
  return `ENV-LEG-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List legal obligations
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const {
      page = '1',
      limit = '50',
      complianceStatus,
      obligationType,
      jurisdiction,
      status,
      search,
    } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (complianceStatus) where.complianceStatus = complianceStatus;
    if (obligationType) where.obligationType = obligationType;
    if (jurisdiction) where.jurisdiction = jurisdiction;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { legislationReference: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [obligations, total] = await Promise.all([
      prisma.envLegal.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.envLegal.count({ where }),
    ]);

    res.json({
      success: true,
      data: obligations,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List legal obligations error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list legal obligations' },
    });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envLegal), async (req: Request, res: Response) => {
  try {
    const obligation = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!obligation)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal obligation not found' },
      });
    res.json({ success: true, data: obligation });
  } catch (error) {
    logger.error('Get legal obligation error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get legal obligation' },
    });
  }
});

// POST /
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      obligationType: z.string().trim().min(1).max(200),
      title: z.string().trim().min(1).max(200),
      jurisdiction: z.string().trim().min(1).max(200),
      regulatoryBody: z.string().trim().min(1),
      legislationReference: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      applicableActivities: z.string().trim().min(1).max(200),
      responsiblePerson: z.string().trim().min(1).max(200),
      relevantSection: z.string().trim().optional(),
      effectiveDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      expiryReviewDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      status: z.string().trim().optional(),
      applicableSites: z.string().trim().optional(),
      linkedAspects: z.array(z.string().trim()).optional().default([]),
      penalties: z.string().trim().optional(),
      complianceStatus: z.string().trim().optional(),
      complianceEvidence: z.string().trim().optional(),
      evidenceReference: z.string().trim().optional(),
      lastAssessedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      assessedBy: z.string().trim().optional(),
      assessmentMethod: z.string().trim().optional(),
      complianceGaps: z.string().trim().optional(),
      requiredActions: z.string().trim().optional(),
      actionPriority: z.string().trim().optional(),
      actionsDueDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      capaRequired: z.boolean().optional(),
      monitoringRequirements: z.string().trim().optional(),
      reportingRequirements: z.string().trim().optional(),
      reportingFrequency: z.string().trim().optional(),
      nextReportingDue: z.string().trim().optional(),
      permitConditions: z.string().trim().optional(),
      aiKeyObligations: z.string().trim().optional(),
      aiComplianceChecklist: z.string().trim().optional(),
      aiGapAnalysis: z.string().trim().optional(),
      aiRequiredActions: z.string().trim().optional(),
      aiEvidenceRequired: z.string().trim().optional(),
      aiMonitoring: z.string().trim().optional(),
      aiPenalty: z.string().trim().optional(),
      aiRecentChanges: z.string().trim().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const obligation = await prisma.envLegal.create({
      data: {
        referenceNumber,
        obligationType: data.obligationType as EnvObligationType,
        title: data.title,
        jurisdiction: data.jurisdiction as EnvJurisdiction,
        regulatoryBody: data.regulatoryBody,
        legislationReference: data.legislationReference,
        description: data.description,
        applicableActivities: data.applicableActivities,
        responsiblePerson: data.responsiblePerson,
        relevantSection: data.relevantSection,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        expiryReviewDate: data.expiryReviewDate ? new Date(data.expiryReviewDate) : null,
        status: data.status || 'ACTIVE',
        applicableSites: data.applicableSites,
        linkedAspects: data.linkedAspects,
        penalties: data.penalties,
        complianceStatus: data.complianceStatus || 'NOT_ASSESSED',
        complianceEvidence: data.complianceEvidence,
        evidenceReference: data.evidenceReference,
        lastAssessedDate: data.lastAssessedDate ? new Date(data.lastAssessedDate) : null,
        assessedBy: data.assessedBy,
        assessmentMethod: data.assessmentMethod as EnvAssessmentMethod,
        complianceGaps: data.complianceGaps,
        requiredActions: data.requiredActions,
        actionPriority: data.actionPriority as EnvPriority,
        actionsDueDate: data.actionsDueDate ? new Date(data.actionsDueDate) : null,
        capaRequired: data.capaRequired,
        monitoringRequirements: data.monitoringRequirements,
        reportingRequirements: data.reportingRequirements,
        reportingFrequency: data.reportingFrequency as EnvReportingFrequency,
        nextReportingDue: data.nextReportingDue ? new Date(data.nextReportingDue) : null,
        permitConditions: data.permitConditions,
        aiKeyObligations: data.aiKeyObligations,
        aiComplianceChecklist: data.aiComplianceChecklist,
        aiGapAnalysis: data.aiGapAnalysis,
        aiRequiredActions: data.aiRequiredActions,
        aiEvidenceRequired: data.aiEvidenceRequired,
        aiMonitoring: data.aiMonitoring,
        aiPenalty: data.aiPenalty,
        aiRecentChanges: data.aiRecentChanges,
        aiGenerated: data.aiGenerated ?? false,
      },
    });

    res.status(201).json({ success: true, data: obligation });
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
    logger.error('Create legal obligation error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create legal obligation' },
    });
  }
});

// PUT /:id
const legalUpdateSchema = z.object({
  obligationType: z.string().trim().optional(),
  title: z.string().trim().optional(),
  jurisdiction: z.string().trim().optional(),
  regulatoryBody: z.string().trim().optional(),
  legislationReference: z.string().trim().optional(),
  description: z.string().trim().optional(),
  applicableActivities: z.array(z.string().trim()).optional(),
  responsiblePerson: z.string().trim().optional(),
  relevantSection: z.string().trim().optional(),
  effectiveDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  expiryReviewDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  complianceStatus: z.string().trim().optional(),
  lastAssessedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  assessedBy: z.string().trim().optional(),
  assessmentMethod: z.string().trim().optional(),
  complianceGaps: z.string().trim().optional(),
  requiredActions: z.string().trim().optional(),
  actionPriority: z.string().trim().optional(),
  actionsDueDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  capaRequired: z.boolean().optional(),
  monitoringRequirements: z.string().trim().optional(),
  reportingRequirements: z.string().trim().optional(),
  reportingFrequency: z.string().trim().optional(),
  nextReportingDue: z.string().trim().optional(),
  permitConditions: z.string().trim().optional(),
  status: z.string().trim().optional(),
  aiKeyObligations: z.string().trim().optional(),
  aiComplianceChecklist: z.string().trim().optional(),
  aiGapAnalysis: z.string().trim().optional(),
  aiRequiredActions: z.string().trim().optional(),
  aiEvidenceRequired: z.string().trim().optional(),
  aiMonitoring: z.string().trim().optional(),
  aiPenalty: z.string().trim().optional(),
  aiRecentChanges: z.string().trim().optional(),
  aiGenerated: z.boolean().optional(),
});

router.put('/:id', checkOwnership(prisma.envLegal), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal obligation not found' },
      });

    const parsed = legalUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: parsed.error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    const data: Record<string, unknown> = { ...parsed.data };

    // Convert date strings to Date objects
    if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate as string);
    if (data.expiryReviewDate) data.expiryReviewDate = new Date(data.expiryReviewDate as string);
    if (data.lastAssessedDate) data.lastAssessedDate = new Date(data.lastAssessedDate as string);
    if (data.actionsDueDate) data.actionsDueDate = new Date(data.actionsDueDate as string);
    if (data.nextReportingDue) data.nextReportingDue = new Date(data.nextReportingDue as string);

    const obligation = await prisma.envLegal.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: obligation });
  } catch (error) {
    logger.error('Update legal obligation error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update legal obligation' },
    });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envLegal), async (req: Request, res: Response) => {
  try {
    const existing = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!existing)
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal obligation not found' },
      });
    await prisma.envLegal.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: req.user?.id },
    });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete legal obligation error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete legal obligation' },
    });
  }
});

export default router;
