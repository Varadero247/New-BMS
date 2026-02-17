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

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envLegal.count({
    where: { referenceNumber: { startsWith: `ENV-LEG-${year}` } },
  });
  return `ENV-LEG-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List legal obligations
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', complianceStatus, obligationType, jurisdiction, status, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EnvLegalWhereInput = { deletedAt: null };
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list legal obligations' } });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envLegal), async (req: AuthRequest, res: Response) => {
  try {
    const obligation = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!obligation) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });
    res.json({ success: true, data: obligation });
  } catch (error) {
    logger.error('Get legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get legal obligation' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      obligationType: z.string().min(1),
      title: z.string().min(1),
      jurisdiction: z.string().min(1),
      regulatoryBody: z.string().min(1),
      legislationReference: z.string().min(1),
      description: z.string().min(1),
      applicableActivities: z.string().min(1),
      responsiblePerson: z.string().min(1),
      relevantSection: z.string().optional(),
      effectiveDate: z.string().optional(),
      expiryReviewDate: z.string().optional(),
      status: z.string().optional(),
      applicableSites: z.string().optional(),
      linkedAspects: z.array(z.string()).optional().default([]),
      penalties: z.string().optional(),
      complianceStatus: z.string().optional(),
      complianceEvidence: z.string().optional(),
      evidenceReference: z.string().optional(),
      lastAssessedDate: z.string().optional(),
      assessedBy: z.string().optional(),
      assessmentMethod: z.string().optional(),
      complianceGaps: z.string().optional(),
      requiredActions: z.string().optional(),
      actionPriority: z.string().optional(),
      actionsDueDate: z.string().optional(),
      capaRequired: z.boolean().optional(),
      monitoringRequirements: z.string().optional(),
      reportingRequirements: z.string().optional(),
      reportingFrequency: z.string().optional(),
      nextReportingDue: z.string().optional(),
      permitConditions: z.string().optional(),
      aiKeyObligations: z.string().optional(),
      aiComplianceChecklist: z.string().optional(),
      aiGapAnalysis: z.string().optional(),
      aiRequiredActions: z.string().optional(),
      aiEvidenceRequired: z.string().optional(),
      aiMonitoring: z.string().optional(),
      aiPenalty: z.string().optional(),
      aiRecentChanges: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const obligation = await prisma.envLegal.create({
      data: {
        referenceNumber,
        obligationType: data.obligationType as any,
        title: data.title,
        jurisdiction: data.jurisdiction as any,
        regulatoryBody: data.regulatoryBody,
        legislationReference: data.legislationReference,
        description: data.description,
        applicableActivities: data.applicableActivities,
        responsiblePerson: data.responsiblePerson,
        relevantSection: data.relevantSection,
        effectiveDate: data.effectiveDate ? new Date(data.effectiveDate) : null,
        expiryReviewDate: data.expiryReviewDate ? new Date(data.expiryReviewDate) : null,
        status: (data.status as any) || 'ACTIVE',
        applicableSites: data.applicableSites,
        linkedAspects: data.linkedAspects,
        penalties: data.penalties,
        complianceStatus: (data.complianceStatus as any) || 'NOT_ASSESSED',
        complianceEvidence: data.complianceEvidence,
        evidenceReference: data.evidenceReference,
        lastAssessedDate: data.lastAssessedDate ? new Date(data.lastAssessedDate) : null,
        assessedBy: data.assessedBy,
        assessmentMethod: data.assessmentMethod as any,
        complianceGaps: data.complianceGaps,
        requiredActions: data.requiredActions,
        actionPriority: data.actionPriority as any,
        actionsDueDate: data.actionsDueDate ? new Date(data.actionsDueDate) : null,
        capaRequired: data.capaRequired,
        monitoringRequirements: data.monitoringRequirements,
        reportingRequirements: data.reportingRequirements,
        reportingFrequency: data.reportingFrequency as any,
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
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create legal obligation' } });
  }
});

// PUT /:id
router.put('/:id', checkOwnership(prisma.envLegal), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });

    const data = req.body;

    // Convert date strings to Date objects
    if (data.effectiveDate) data.effectiveDate = new Date(data.effectiveDate);
    if (data.expiryReviewDate) data.expiryReviewDate = new Date(data.expiryReviewDate);
    if (data.lastAssessedDate) data.lastAssessedDate = new Date(data.lastAssessedDate);
    if (data.actionsDueDate) data.actionsDueDate = new Date(data.actionsDueDate);
    if (data.nextReportingDue) data.nextReportingDue = new Date(data.nextReportingDue);

    const obligation = await prisma.envLegal.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: obligation });
  } catch (error) {
    logger.error('Update legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update legal obligation' } });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envLegal), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envLegal.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Legal obligation not found' } });
    await prisma.envLegal.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete legal obligation error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete legal obligation' } });
  }
});

export default router;
