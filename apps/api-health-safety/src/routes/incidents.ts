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

// Generate reference number INC-YYMM-XXXX
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `INC-${year}${month}-${random}`;
}

// Auto-set investigation due date based on severity
function getInvestigationDueDate(severity: string): Date {
  const now = new Date();
  switch (severity) {
    case 'CRITICAL':
    case 'CATASTROPHIC':
      return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
    case 'MAJOR':
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
    case 'MODERATE':
      return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
    default:
      return new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 days
  }
}

const INCIDENT_TYPES = ['INJURY', 'NEAR_MISS', 'DANGEROUS_OCCURRENCE', 'OCCUPATIONAL_ILLNESS', 'PROPERTY_DAMAGE', 'FIRST_AID', 'MEDICAL_TREATMENT', 'LOST_TIME'] as const;
const SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC'] as const;
const STATUSES = ['OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED'] as const;

// GET /api/incidents - List incidents
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, type, severity, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.IncidentWhereInput = { deletedAt: null };
    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({ where, skip, take: limitNum, orderBy: { dateOccurred: 'desc' } }),
      prisma.incident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List incidents error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list incidents' } });
  }
});

// GET /api/incidents/:id - Get single incident
router.get('/:id', checkOwnership(prisma.incident), async (req: AuthRequest, res: Response) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: { actions: true, fiveWhyAnalyses: true, fishboneAnalyses: true },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Get incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get incident' } });
  }
});

// POST /api/incidents - Create incident
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(INCIDENT_TYPES),
      severity: z.enum(SEVERITIES).default('MODERATE'),
      category: z.string().optional(),
      location: z.string().optional(),
      dateOccurred: z.string(),
      personsInvolved: z.string().optional(),
      injuryType: z.string().optional(),
      bodyPart: z.string().optional(),
      daysLost: z.number().optional(),
      treatmentType: z.string().optional(),
      riskId: z.string().optional(),
      // New fields
      injuredPersonName: z.string().optional(),
      injuredPersonRole: z.string().optional(),
      employmentType: z.string().optional(),
      lostTime: z.boolean().optional(),
      witnesses: z.string().optional(),
      riddorReportable: z.boolean().optional(),
      regulatoryReference: z.string().optional(),
      reportedToAuthority: z.boolean().optional(),
      reportedToAuthorityDate: z.string().optional(),
      reportedBy: z.string().optional(),
      investigationRequired: z.boolean().optional(),
      investigationDueDate: z.string().optional(),
      immediateCause: z.string().optional(),
      rootCauses: z.string().optional(),
      contributingFactors: z.string().optional(),
      // AI fields
      aiImmediateCause: z.string().optional(),
      aiUnderlyingCause: z.string().optional(),
      aiRootCause: z.string().optional(),
      aiContributingFactors: z.string().optional(),
      aiRecurrencePrevention: z.string().optional(),
      aiAnalysisGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    // Auto-set RIDDOR and investigation for Critical/Major
    const isSevere = data.severity === 'CRITICAL' || data.severity === 'CATASTROPHIC' || data.severity === 'MAJOR';
    const riddorReportable = data.riddorReportable ?? isSevere;
    const investigationRequired = data.investigationRequired ?? isSevere;
    const investigationDueDate = data.investigationDueDate
      ? new Date(data.investigationDueDate)
      : investigationRequired ? getInvestigationDueDate(data.severity) : null;

    const incident = await prisma.incident.create({
      data: {
        id: uuidv4(),
        referenceNumber: generateReferenceNumber(),
        title: data.title,
        description: data.description,
        type: data.type,
        severity: data.severity,
        category: data.category,
        location: data.location,
        dateOccurred: new Date(data.dateOccurred),
        dateReported: new Date(),
        reporterId: req.user!.id,
        personsInvolved: data.personsInvolved,
        injuryType: data.injuryType,
        bodyPart: data.bodyPart,
        daysLost: data.daysLost,
        treatmentType: data.treatmentType,
        riskId: data.riskId,
        injuredPersonName: data.injuredPersonName,
        injuredPersonRole: data.injuredPersonRole,
        employmentType: data.employmentType,
        lostTime: data.lostTime ?? false,
        witnesses: data.witnesses,
        riddorReportable,
        regulatoryReference: data.regulatoryReference,
        reportedToAuthority: data.reportedToAuthority ?? false,
        reportedToAuthorityDate: data.reportedToAuthorityDate ? new Date(data.reportedToAuthorityDate) : null,
        reportedBy: data.reportedBy,
        investigationRequired,
        investigationDueDate,
        immediateCause: data.immediateCause,
        rootCauses: data.rootCauses,
        contributingFactors: data.contributingFactors,
        aiImmediateCause: data.aiImmediateCause,
        aiUnderlyingCause: data.aiUnderlyingCause,
        aiRootCause: data.aiRootCause,
        aiContributingFactors: data.aiContributingFactors,
        aiRecurrencePrevention: data.aiRecurrencePrevention,
        aiAnalysisGenerated: data.aiAnalysisGenerated ?? false,
        status: 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' } });
  }
});

// PATCH /api/incidents/:id - Update incident
router.patch('/:id', checkOwnership(prisma.incident), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(INCIDENT_TYPES).optional(),
      severity: z.enum(SEVERITIES).optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      personsInvolved: z.string().optional(),
      injuryType: z.string().optional(),
      bodyPart: z.string().optional(),
      daysLost: z.number().optional(),
      treatmentType: z.string().optional(),
      immediateCause: z.string().optional(),
      rootCauses: z.string().optional(),
      contributingFactors: z.string().optional(),
      investigatorId: z.string().optional(),
      status: z.enum(STATUSES).optional(),
      injuredPersonName: z.string().optional(),
      injuredPersonRole: z.string().optional(),
      employmentType: z.string().optional(),
      lostTime: z.boolean().optional(),
      witnesses: z.string().optional(),
      riddorReportable: z.boolean().optional(),
      regulatoryReference: z.string().optional(),
      reportedToAuthority: z.boolean().optional(),
      reportedToAuthorityDate: z.string().optional(),
      reportedBy: z.string().optional(),
      investigationRequired: z.boolean().optional(),
      investigationDueDate: z.string().optional(),
      aiImmediateCause: z.string().optional(),
      aiUnderlyingCause: z.string().optional(),
      aiRootCause: z.string().optional(),
      aiContributingFactors: z.string().optional(),
      aiRecurrencePrevention: z.string().optional(),
      aiAnalysisGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = { ...data };
    if (data.reportedToAuthorityDate) updateData.reportedToAuthorityDate = new Date(data.reportedToAuthorityDate);
    if (data.investigationDueDate) updateData.investigationDueDate = new Date(data.investigationDueDate);
    if (data.status === 'CLOSED') updateData.closedAt = new Date();

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } });
  }
});

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', checkOwnership(prisma.incident), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    await prisma.incident.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete incident' } });
  }
});

export default router;
