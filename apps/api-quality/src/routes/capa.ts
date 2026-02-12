import { Router, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');

const router = Router();

router.use(authenticate);
router.param('id', validateIdParam());
router.param('actionId', validateIdParam('actionId'));

// Generate reference number
async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = 'QMS-CAPA';
  const count = await prisma.qualCapa.count({
    where: { referenceNumber: { startsWith: `${prefix}-${year}` } },
  });
  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List CAPAs
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', capaType, status, severity, triggerSource } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.QualCapaWhereInput = { deletedAt: null };
    if (capaType) where.capaType = capaType;
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (triggerSource) where.triggerSource = triggerSource;

    const [items, total] = await Promise.all([
      prisma.qualCapa.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          capaActions: { orderBy: { createdAt: 'asc' } },
        },
      }),
      prisma.qualCapa.count({ where }),
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
    logger.error('List CAPAs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CAPAs' } });
  }
});

// GET /stats - CAPA statistics
router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [byStatus, bySeverity, byCapaType, total] = await Promise.all([
      prisma.qualCapa.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      prisma.qualCapa.groupBy({
        by: ['severity'],
        _count: { id: true },
      }),
      prisma.qualCapa.groupBy({
        by: ['capaType'],
        _count: { id: true },
      }),
      prisma.qualCapa.count(),
    ]);

    res.json({
      success: true,
      data: {
        total,
        byStatus: byStatus.reduce((acc: any, item) => {
          acc[item.status] = item._count.id;
          return acc;
        }, {}),
        bySeverity: bySeverity.reduce((acc: any, item) => {
          acc[item.severity] = item._count.id;
          return acc;
        }, {}),
        byCapaType: byCapaType.reduce((acc: any, item) => {
          acc[item.capaType] = item._count.id;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    logger.error('CAPA stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA statistics' } });
  }
});

// GET /:id - Get single CAPA with nested actions
router.get('/:id', checkOwnership(prisma.qualCapa), async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.qualCapa.findUnique({
      where: { id: req.params.id },
      include: {
        capaActions: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!capa) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    res.json({ success: true, data: capa });
  } catch (error) {
    logger.error('Get CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA' } });
  }
});

// POST / - Create CAPA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      capaType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT']),
      title: z.string().min(1),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).default('MINOR'),
      triggerSource: z.enum(['NC_REPORT', 'CUSTOMER_COMPLAINT', 'INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'SUPPLIER_AUDIT', 'PROCESS_FAILURE', 'FMEA', 'RISK_REGISTER', 'OTHER']),
      sourceReference: z.string().optional(),
      description: z.string().min(1),
      isoClause: z.string().optional(),
      immediateActionRequired: z.boolean().default(false),
      actionsTaken: z.string().optional(),
      containmentVerifiedBy: z.string().optional(),
      containmentDate: z.string().optional(),
      rcaMethod: z.enum(['FIVE_WHY', 'FISHBONE', 'IS_IS_NOT', 'EIGHT_D', 'FAULT_TREE', 'OTHER']).optional(),
      problemStatement: z.string().optional(),
      why1: z.string().optional(),
      why2: z.string().optional(),
      why3: z.string().optional(),
      why4: z.string().optional(),
      why5: z.string().optional(),
      rootCauseStatement: z.string().optional(),
      fishbonePeople: z.string().optional(),
      fishboneMethod: z.string().optional(),
      fishboneMachine: z.string().optional(),
      fishboneMaterial: z.string().optional(),
      fishboneMeasurement: z.string().optional(),
      fishboneEnvironment: z.string().optional(),
      d0EmergencyResponse: z.string().optional(),
      d1Team: z.string().optional(),
      d2ProblemDescription: z.string().optional(),
      d3Containment: z.string().optional(),
      d4RootCause: z.string().optional(),
      d5CorrectiveActions: z.string().optional(),
      d6Implementation: z.string().optional(),
      d7Prevention: z.string().optional(),
      d8CongratulateTeam: z.string().optional(),
      rootCauseCategory: z.enum(['HUMAN_ERROR', 'PROCESS_FAILURE', 'EQUIPMENT', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT', 'MANAGEMENT_SYSTEM', 'SUPPLIER']).optional(),
      effectivenessCriteria: z.string().optional(),
      effectivenessKpi: z.string().optional(),
      effectivenessTarget: z.string().optional(),
      effectivenessMeasureMethod: z.string().optional(),
      targetClosureDate: z.string().optional(),
      linkedNc: z.string().optional(),
      linkedProcess: z.string().optional(),
      linkedFmea: z.string().optional(),
      linkedDocument: z.string().optional(),
      linkedHsCapa: z.string().optional(),
      linkedEnvCapa: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const capa = await prisma.qualCapa.create({
      data: {
        ...data,
        referenceNumber,
        status: 'INITIATED',
        percentComplete: 0,
        containmentDate: data.containmentDate ? new Date(data.containmentDate) : undefined,
        targetClosureDate: data.targetClosureDate ? new Date(data.targetClosureDate) : undefined,
      },
      include: {
        capaActions: true,
      },
    });

    res.status(201).json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA' } });
  }
});

// PUT /:id - Update CAPA
router.put('/:id', checkOwnership(prisma.qualCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualCapa.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const schema = z.object({
      capaType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT']).optional(),
      title: z.string().min(1).optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).optional(),
      triggerSource: z.enum(['NC_REPORT', 'CUSTOMER_COMPLAINT', 'INTERNAL_AUDIT', 'EXTERNAL_AUDIT', 'MANAGEMENT_REVIEW', 'SUPPLIER_AUDIT', 'PROCESS_FAILURE', 'FMEA', 'RISK_REGISTER', 'OTHER']).optional(),
      sourceReference: z.string().nullable().optional(),
      description: z.string().optional(),
      isoClause: z.string().nullable().optional(),
      immediateActionRequired: z.boolean().optional(),
      actionsTaken: z.string().nullable().optional(),
      containmentVerifiedBy: z.string().nullable().optional(),
      containmentDate: z.string().nullable().optional(),
      rcaMethod: z.enum(['FIVE_WHY', 'FISHBONE', 'IS_IS_NOT', 'EIGHT_D', 'FAULT_TREE', 'OTHER']).nullable().optional(),
      problemStatement: z.string().nullable().optional(),
      why1: z.string().nullable().optional(),
      why2: z.string().nullable().optional(),
      why3: z.string().nullable().optional(),
      why4: z.string().nullable().optional(),
      why5: z.string().nullable().optional(),
      rootCauseStatement: z.string().nullable().optional(),
      fishbonePeople: z.string().nullable().optional(),
      fishboneMethod: z.string().nullable().optional(),
      fishboneMachine: z.string().nullable().optional(),
      fishboneMaterial: z.string().nullable().optional(),
      fishboneMeasurement: z.string().nullable().optional(),
      fishboneEnvironment: z.string().nullable().optional(),
      d0EmergencyResponse: z.string().nullable().optional(),
      d1Team: z.string().nullable().optional(),
      d2ProblemDescription: z.string().nullable().optional(),
      d3Containment: z.string().nullable().optional(),
      d4RootCause: z.string().nullable().optional(),
      d5CorrectiveActions: z.string().nullable().optional(),
      d6Implementation: z.string().nullable().optional(),
      d7Prevention: z.string().nullable().optional(),
      d8CongratulateTeam: z.string().nullable().optional(),
      rootCauseCategory: z.enum(['HUMAN_ERROR', 'PROCESS_FAILURE', 'EQUIPMENT', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT', 'MANAGEMENT_SYSTEM', 'SUPPLIER']).nullable().optional(),
      effectivenessCriteria: z.string().nullable().optional(),
      effectivenessKpi: z.string().nullable().optional(),
      effectivenessTarget: z.string().nullable().optional(),
      effectivenessMeasureMethod: z.string().nullable().optional(),
      status: z.enum(['INITIATED', 'ROOT_CAUSE_ANALYSIS', 'ACTIONS_DEFINED', 'IMPLEMENTATION', 'VERIFICATION', 'CLOSED', 'CANCELLED']).optional(),
      progressNotes: z.string().nullable().optional(),
      percentComplete: z.number().min(0).max(100).optional(),
      targetClosureDate: z.string().nullable().optional(),
      actualClosureDate: z.string().nullable().optional(),
      reviewDate: z.string().nullable().optional(),
      verifiedBy: z.string().nullable().optional(),
      effectivenessAssessment: z.string().nullable().optional(),
      recurrenceCheck: z.boolean().nullable().optional(),
      actionsEffective: z.enum(['YES', 'NO', 'PENDING']).nullable().optional(),
      lessonsLearned: z.string().nullable().optional(),
      linkedNc: z.string().nullable().optional(),
      linkedProcess: z.string().nullable().optional(),
      linkedFmea: z.string().nullable().optional(),
      linkedDocument: z.string().nullable().optional(),
      linkedHsCapa: z.string().nullable().optional(),
      linkedEnvCapa: z.string().nullable().optional(),
      // AI fields
      aiAnalysis: z.string().nullable().optional(),
      aiRootCauseValidation: z.string().nullable().optional(),
      aiActionSuggestions: z.string().nullable().optional(),
      aiEffectivenessCriteria: z.string().nullable().optional(),
      aiSystemicImplications: z.string().nullable().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = {
      ...data,
      containmentDate: data.containmentDate ? new Date(data.containmentDate) : data.containmentDate === null ? null : undefined,
      targetClosureDate: data.targetClosureDate ? new Date(data.targetClosureDate) : data.targetClosureDate === null ? null : undefined,
      actualClosureDate: data.actualClosureDate
        ? new Date(data.actualClosureDate)
        : data.status === 'CLOSED' && !existing.actualClosureDate
          ? new Date()
          : data.actualClosureDate === null ? null : undefined,
      reviewDate: data.reviewDate ? new Date(data.reviewDate) : data.reviewDate === null ? null : undefined,
    };

    const capa = await prisma.qualCapa.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        capaActions: { orderBy: { createdAt: 'asc' } },
      },
    });

    res.json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' } });
  }
});

// DELETE /:id - Delete CAPA (cascades to actions)
router.delete('/:id', checkOwnership(prisma.qualCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualCapa.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    await prisma.qualCapa.delete({ where: { id: req.params.id } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' } });
  }
});

// ============================================
// NESTED CAPA ACTIONS
// ============================================

// POST /:id/actions - Create CAPA action
router.post('/:id/actions', async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.qualCapa.findUnique({ where: { id: req.params.id } });
    if (!capa) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const schema = z.object({
      action: z.string().min(1),
      assignedTo: z.string().min(1),
      dueDate: z.string(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED']).default('OPEN'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const capaAction = await prisma.qualCapaAction.create({
      data: {
        ...data,
        capaId: req.params.id,
        dueDate: new Date(data.dueDate),
      },
    });

    res.status(201).json({ success: true, data: capaAction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA action' } });
  }
});

// PUT /:id/actions/:actionId - Update CAPA action
router.put('/:id/actions/:actionId', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualCapaAction.findFirst({
      where: { id: req.params.actionId, capaId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA action not found' } });
    }

    const schema = z.object({
      action: z.string().min(1).optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'COMPLETED', 'VERIFIED', 'OVERDUE', 'CANCELLED']).optional(),
      notes: z.string().nullable().optional(),
      completedDate: z.string().nullable().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      completedDate: data.completedDate
        ? new Date(data.completedDate)
        : data.status === 'COMPLETED' && !existing.completedDate
          ? new Date()
          : data.completedDate === null ? null : undefined,
    };

    const capaAction = await prisma.qualCapaAction.update({
      where: { id: req.params.actionId },
      data: updateData,
    });

    res.json({ success: true, data: capaAction });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA action' } });
  }
});

// DELETE /:id/actions/:actionId - Delete CAPA action
router.delete('/:id/actions/:actionId', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qualCapaAction.findFirst({
      where: { id: req.params.actionId, capaId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA action not found' } });
    }

    await prisma.qualCapaAction.delete({ where: { id: req.params.actionId } });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA action' } });
  }
});

export default router;
