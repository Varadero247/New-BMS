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
router.param('actionId', validateIdParam('actionId'));

async function generateRefNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.envCapa.count({
    where: { referenceNumber: { startsWith: `ENV-CAPA-${year}` } },
  });
  return `ENV-CAPA-${year}-${String(count + 1).padStart(3, '0')}`;
}

// GET / - List CAPAs
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', status, capaType, severity, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (capaType) where.capaType = capaType as any;
    if (severity) where.severity = severity as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
        { responsiblePerson: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [capas, total] = await Promise.all([
      prisma.envCapa.findMany({ where, skip, take: limitNum, include: { capaActions: true }, orderBy: { createdAt: 'desc' } }),
      prisma.envCapa.count({ where }),
    ]);

    res.json({
      success: true,
      data: capas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List CAPAs error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CAPAs' } });
  }
});

// GET /:id
router.get('/:id', checkOwnership(prisma.envCapa), async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.envCapa.findUnique({ where: { id: req.params.id }, include: { capaActions: true } });
    if (!capa) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    res.json({ success: true, data: capa });
  } catch (error) {
    logger.error('Get CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA' } });
  }
});

// POST /
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const capaActionSchema = z.object({
      description: z.string().trim().min(1).max(2000),
      assignedTo: z.string().trim().min(1).max(200),
      dueDate: z.string().trim().min(1).max(200).refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      priority: z.string().optional(),
    });

    const schema = z.object({
      capaType: z.string().trim().min(1).max(200),
      title: z.string().trim().min(1).max(200),
      severity: z.string().trim().min(1).max(200),
      triggerSource: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      initiatedBy: z.string().trim().min(1).max(200),
      responsiblePerson: z.string().trim().min(1).max(200),
      targetClosureDate: z.string().trim().min(1).max(200).refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      sourceReference: z.string().optional(),
      iso14001Clause: z.string().optional(),
      immediateActionRequired: z.boolean().optional(),
      immediateActions: z.string().optional(),
      containmentVerifiedBy: z.string().optional(),
      containmentDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      rcaMethod: z.string().optional(),
      problemStatement: z.string().optional(),
      why1: z.string().optional(),
      why2: z.string().optional(),
      why3: z.string().optional(),
      why4: z.string().optional(),
      why5: z.string().optional(),
      fishbonePeople: z.string().optional(),
      fishboneProcess: z.string().optional(),
      fishbonePlant: z.string().optional(),
      fishbonePolicy: z.string().optional(),
      fishboneEnvironment: z.string().optional(),
      fishboneMeasurement: z.string().optional(),
      bowtieHazard: z.string().optional(),
      bowtieThreats: z.string().optional(),
      bowtiePreventive: z.string().optional(),
      bowtieConsequences: z.string().optional(),
      bowtieMitigating: z.string().optional(),
      rootCauseStatement: z.string().optional(),
      rootCauseCategory: z.string().optional(),
      effectivenessCriteria: z.string().optional(),
      effectivenessKPI: z.string().optional(),
      effectivenessTarget: z.string().optional(),
      effectivenessMethod: z.string().optional(),
      status: z.string().optional(),
      progressNotes: z.string().optional(),
      percentComplete: z.number().min(0).max(100).optional(),
      verificationDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      verifiedBy: z.string().optional(),
      effectivenessAssessment: z.string().optional(),
      recurrenceCheck: z.boolean().optional(),
      actionsEffective: z.string().optional(),
      furtherActions: z.string().optional(),
      managementSignoff: z.string().optional(),
      closureDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      lessonsLearned: z.string().optional(),
      sharedLessonsLearned: z.boolean().optional(),
      aiRootCauseValidation: z.string().optional(),
      aiFiveWhyAnalysis: z.string().optional(),
      aiFishboneAnalysis: z.string().optional(),
      aiActionSufficiency: z.string().optional(),
      aiEffectivenessCriteria: z.string().optional(),
      aiRecurrenceRisk: z.string().optional(),
      aiSystemicImplications: z.string().optional(),
      aiLessonsLearned: z.string().optional(),
      aiGenerated: z.boolean().optional(),
      capaActions: z.array(capaActionSchema).optional(),
    });

    const data = schema.parse(req.body);
    const referenceNumber = await generateRefNumber();

    const capa = await prisma.envCapa.create({
      data: {
        referenceNumber,
        capaType: data.capaType as any,
        title: data.title,
        severity: data.severity as any,
        triggerSource: data.triggerSource as any,
        sourceReference: data.sourceReference,
        description: data.description,
        initiatedBy: data.initiatedBy,
        iso14001Clause: data.iso14001Clause,
        immediateActionRequired: data.immediateActionRequired ?? false,
        immediateActions: data.immediateActions,
        containmentVerifiedBy: data.containmentVerifiedBy,
        containmentDate: data.containmentDate ? new Date(data.containmentDate) : null,
        rcaMethod: data.rcaMethod as any,
        problemStatement: data.problemStatement,
        why1: data.why1,
        why2: data.why2,
        why3: data.why3,
        why4: data.why4,
        why5: data.why5,
        fishbonePeople: data.fishbonePeople,
        fishboneProcess: data.fishboneProcess,
        fishbonePlant: data.fishbonePlant,
        fishbonePolicy: data.fishbonePolicy,
        fishboneEnvironment: data.fishboneEnvironment,
        fishboneMeasurement: data.fishboneMeasurement,
        bowtieHazard: data.bowtieHazard,
        bowtieThreats: data.bowtieThreats,
        bowtiePreventive: data.bowtiePreventive,
        bowtieConsequences: data.bowtieConsequences,
        bowtieMitigating: data.bowtieMitigating,
        rootCauseStatement: data.rootCauseStatement,
        rootCauseCategory: data.rootCauseCategory as any,
        effectivenessCriteria: data.effectivenessCriteria,
        effectivenessKPI: data.effectivenessKPI,
        effectivenessTarget: data.effectivenessTarget,
        effectivenessMethod: data.effectivenessMethod,
        status: (data.status as any) || 'INITIATED',
        progressNotes: data.progressNotes,
        percentComplete: data.percentComplete ?? 0,
        responsiblePerson: data.responsiblePerson,
        targetClosureDate: new Date(data.targetClosureDate),
        verificationDate: data.verificationDate ? new Date(data.verificationDate) : null,
        verifiedBy: data.verifiedBy,
        effectivenessAssessment: data.effectivenessAssessment,
        recurrenceCheck: data.recurrenceCheck,
        actionsEffective: data.actionsEffective as any,
        furtherActions: data.furtherActions,
        managementSignoff: data.managementSignoff,
        closureDate: data.closureDate ? new Date(data.closureDate) : null,
        lessonsLearned: data.lessonsLearned,
        sharedLessonsLearned: data.sharedLessonsLearned ?? false,
        aiRootCauseValidation: data.aiRootCauseValidation,
        aiFiveWhyAnalysis: data.aiFiveWhyAnalysis,
        aiFishboneAnalysis: data.aiFishboneAnalysis,
        aiActionSufficiency: data.aiActionSufficiency,
        aiEffectivenessCriteria: data.aiEffectivenessCriteria,
        aiRecurrenceRisk: data.aiRecurrenceRisk,
        aiSystemicImplications: data.aiSystemicImplications,
        aiLessonsLearned: data.aiLessonsLearned,
        aiGenerated: data.aiGenerated ?? false,
        capaActions: data.capaActions ? {
          create: data.capaActions.map((a) => ({
            description: a.description,
            assignedTo: a.assignedTo,
            dueDate: new Date(a.dueDate),
            priority: (a.priority as any) || 'MEDIUM',
          })),
        } : undefined,
      },
      include: { capaActions: true },
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

// PUT /:id
const capaUpdateSchema = z.object({
  type: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  sourceType: z.string().optional(),
  sourceReference: z.string().optional(),
  linkedEventId: z.string().optional(),
  severity: z.string().optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  assignedTo: z.string().optional(),
  department: z.string().optional(),
  rootCauseMethod: z.string().optional(),
  rootCauseAnalysis: z.string().optional(),
  containmentAction: z.string().optional(),
  containmentDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  correctiveAction: z.string().optional(),
  preventiveAction: z.string().optional(),
  targetClosureDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  verificationMethod: z.string().optional(),
  verificationDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  verifiedBy: z.string().optional(),
  effectivenessReview: z.string().optional(),
  closureDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  closedBy: z.string().optional(),
  evidence: z.string().optional(),
  aiRootCauseAnalysis: z.string().optional(),
  aiCorrectiveActions: z.string().optional(),
  aiPreventiveActions: z.string().optional(),
  aiEffectivenessMetrics: z.string().optional(),
  aiGenerated: z.boolean().optional(),
});

router.put('/:id', checkOwnership(prisma.envCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envCapa.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });

    const parsed = capaUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: parsed.error.errors.map(e => e.path.join('.')) } });
    }
    const data: Record<string, unknown> = { ...parsed.data };

    // Convert date strings to Date objects
    if (data.targetClosureDate && typeof data.targetClosureDate === 'string') data.targetClosureDate = new Date(data.targetClosureDate as string);
    if (data.containmentDate && typeof data.containmentDate === 'string') data.containmentDate = new Date(data.containmentDate as string);
    if (data.verificationDate && typeof data.verificationDate === 'string') data.verificationDate = new Date(data.verificationDate as string);
    if (data.closureDate && typeof data.closureDate === 'string') data.closureDate = new Date(data.closureDate as string);

    const capa = await prisma.envCapa.update({
      where: { id: req.params.id },
      data,
      include: { capaActions: true },
    });

    res.json({ success: true, data: capa });
  } catch (error) {
    logger.error('Update CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' } });
  }
});

// DELETE /:id
router.delete('/:id', checkOwnership(prisma.envCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envCapa.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    await prisma.envCapa.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: req.user?.id } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete CAPA error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' } });
  }
});

// POST /:id/actions - Add a CAPA action
router.post('/:id/actions', async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.envCapa.findUnique({ where: { id: req.params.id } });
    if (!capa) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });

    const schema = z.object({
      description: z.string().trim().min(1).max(2000),
      assignedTo: z.string().trim().min(1).max(200),
      dueDate: z.string().trim().min(1).max(200).refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      priority: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const capaAction = await prisma.envCapaAction.create({
      data: {
        capaId: req.params.id,
        description: data.description,
        assignedTo: data.assignedTo,
        dueDate: new Date(data.dueDate),
        priority: (data.priority as any) || 'MEDIUM',
        notes: data.notes,
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

// PUT /:id/actions/:actionId - Update a CAPA action
const capaActionUpdateSchema = z.object({
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  completedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
  priority: z.string().optional(),
  status: z.string().optional(),
  notes: z.string().optional(),
  evidence: z.string().optional(),
});

router.put('/:id/actions/:actionId', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envCapaAction.findFirst({
      where: { id: req.params.actionId, capaId: req.params.id },
    });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA action not found' } });

    const parsed = capaActionUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: parsed.error.errors.map(e => e.path.join('.')) } });
    }
    const data: Record<string, unknown> = { ...parsed.data };

    // Convert date strings to Date objects
    if (data.dueDate && typeof data.dueDate === 'string') data.dueDate = new Date(data.dueDate as string);
    if (data.completedDate && typeof data.completedDate === 'string') data.completedDate = new Date(data.completedDate as string);

    // Auto-set completedDate when status changes to COMPLETED
    if (data.status === 'COMPLETED' && existing.status !== 'COMPLETED' && !data.completedDate) {
      data.completedDate = new Date();
    }

    const capaAction = await prisma.envCapaAction.update({
      where: { id: req.params.actionId },
      data,
    });

    res.json({ success: true, data: capaAction });
  } catch (error) {
    logger.error('Update CAPA action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA action' } });
  }
});

export default router;
