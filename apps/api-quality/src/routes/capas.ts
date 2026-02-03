import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate reference number
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `CAPA-${year}${month}-${random}`;
}

// GET /api/capas - List CAPAs
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, capaType, currentPhase, severity } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (capaType) where.capaType = capaType;
    if (currentPhase) where.currentPhase = currentPhase;
    if (severity) where.severity = severity;

    const [capas, total] = await Promise.all([
      prisma.cAPA.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              teamMembers: true,
              containmentActions: true,
              rootCauses: true,
              correctiveActions: true,
              effectivenessChecks: true,
            },
          },
        },
      }),
      prisma.cAPA.count({ where }),
    ]);

    res.json({
      success: true,
      data: capas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List CAPAs error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CAPAs' } });
  }
});

// GET /api/capas/:id - Get single CAPA with all 8D details
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.cAPA.findUnique({
      where: { id: req.params.id },
      include: {
        teamMembers: true,
        problemStatement: true,
        containmentActions: { orderBy: { createdAt: 'asc' } },
        rootCauses: { orderBy: { createdAt: 'asc' } },
        correctiveActions: { orderBy: { createdAt: 'asc' } },
        implementations: { orderBy: { createdAt: 'asc' } },
        preventionActions: { orderBy: { createdAt: 'asc' } },
        effectivenessChecks: { orderBy: { checkNumber: 'asc' } },
        horizontalDeployments: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!capa) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    res.json({ success: true, data: capa });
  } catch (error) {
    console.error('Get CAPA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA' } });
  }
});

// POST /api/capas - Create CAPA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      capaType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT']).default('CORRECTIVE'),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).default('MINOR'),
      category: z.string().optional(),
      sourceType: z.string().optional(),
      sourceId: z.string().optional(),
      targetClosureDate: z.string().optional(),
      estimatedCost: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const capa = await prisma.cAPA.create({
      data: {
        ...data,
        referenceNumber: generateReferenceNumber(),
        currentPhase: 'D1_TEAM',
        status: 'OPEN',
        targetClosureDate: data.targetClosureDate ? new Date(data.targetClosureDate) : undefined,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create CAPA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA' } });
  }
});

// PATCH /api/capas/:id - Update CAPA
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.cAPA.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL']).optional(),
      currentPhase: z.enum(['D1_TEAM', 'D2_PROBLEM', 'D3_CONTAINMENT', 'D4_ROOT_CAUSE', 'D5_CORRECTIVE_ACTION', 'D6_IMPLEMENTATION', 'D7_PREVENTION', 'D8_CLOSURE']).optional(),
      status: z.enum(['OPEN', 'IN_PROGRESS', 'PENDING_VERIFICATION', 'VERIFIED', 'CLOSED', 'CANCELLED']).optional(),
      targetClosureDate: z.string().optional(),
      estimatedCost: z.number().optional(),
      actualCost: z.number().optional(),
      costAvoidance: z.number().optional(),
      effectivenessVerified: z.boolean().optional(),
      effectivenessScore: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Track phase history
    let phaseHistory = existing.phaseHistory as any[] || [];
    if (data.currentPhase && data.currentPhase !== existing.currentPhase) {
      phaseHistory.push({
        phase: data.currentPhase,
        date: new Date().toISOString(),
        userId: req.user!.id,
      });
    }

    const capa = await prisma.cAPA.update({
      where: { id: req.params.id },
      data: {
        ...data,
        phaseHistory,
        targetClosureDate: data.targetClosureDate ? new Date(data.targetClosureDate) : undefined,
        actualClosureDate: data.status === 'CLOSED' ? new Date() : undefined,
        closedById: data.status === 'CLOSED' ? req.user!.id : undefined,
        updatedById: req.user!.id,
      },
    });

    res.json({ success: true, data: capa });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update CAPA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' } });
  }
});

// D1: Team Management
// POST /api/capas/:id/team
router.post('/:id/team', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      role: z.enum(['CHAMPION', 'TEAM_LEADER', 'TEAM_MEMBER', 'PROCESS_OWNER', 'QUALITY_REP', 'SUBJECT_MATTER_EXPERT', 'MANAGEMENT_REP', 'CUSTOMER_REP']),
      department: z.string().optional(),
      responsibilities: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const member = await prisma.cAPATeamMember.create({
      data: {
        ...data,
        capaId: req.params.id,
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add team member error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add team member' } });
  }
});

// D2: Problem Statement (5W2H)
// POST /api/capas/:id/problem-statement
router.post('/:id/problem-statement', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      what: z.string().min(1),
      when: z.string().optional(),
      whereLocation: z.string().optional(),
      who: z.string().optional(),
      why: z.string().optional(),
      howDiscovered: z.string().optional(),
      howMany: z.string().optional(),
      defectsCount: z.number().optional(),
      unitsAffected: z.number().optional(),
      customerAffected: z.string().optional(),
      financialImpact: z.number().optional(),
      problemSummary: z.string().optional(),
      isIsNotAnalysis: z.any().optional(),
    });

    const data = schema.parse(req.body);

    // Check if problem statement already exists
    const existing = await prisma.cAPAProblemStatement.findUnique({ where: { capaId: req.params.id } });

    let problemStatement;
    if (existing) {
      problemStatement = await prisma.cAPAProblemStatement.update({
        where: { capaId: req.params.id },
        data: { ...data },
      });
    } else {
      problemStatement = await prisma.cAPAProblemStatement.create({
        data: {
          ...data,
          capaId: req.params.id,
          createdById: req.user!.id,
        },
      });
    }

    res.status(201).json({ success: true, data: problemStatement });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Save problem statement error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to save problem statement' } });
  }
});

// D3: Containment Actions
// POST /api/capas/:id/containment
router.post('/:id/containment', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      actionType: z.enum(['QUARANTINE', 'SORTING', 'REWORK', 'REPLACEMENT', 'CUSTOMER_NOTIFICATION', 'PRODUCTION_STOP', 'PROCESS_ADJUSTMENT', 'OTHER']),
      assignedToId: z.string().optional(),
      plannedDate: z.string().optional(),
      verificationMethod: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const action = await prisma.cAPAContainmentAction.create({
      data: {
        ...data,
        capaId: req.params.id,
        plannedDate: data.plannedDate ? new Date(data.plannedDate) : undefined,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add containment action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add containment action' } });
  }
});

// D4: Root Causes (5 Whys, Fishbone)
// POST /api/capas/:id/root-causes
router.post('/:id/root-causes', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      causeDescription: z.string().min(1),
      causeType: z.enum(['TECHNICAL', 'HUMAN', 'ORGANIZATIONAL', 'EXTERNAL', 'DESIGN', 'PROCESS', 'MATERIAL', 'EQUIPMENT', 'TRAINING', 'COMMUNICATION']),
      causeCategory: z.string().optional(),
      analysisMethod: z.enum(['FIVE_WHYS', 'FISHBONE', 'FAULT_TREE', 'CHANGE_ANALYSIS', 'BARRIER_ANALYSIS', 'EVENT_TREE', 'PARETO', 'FMEA']),
      fiveWhysData: z.any().optional(),
      fishboneData: z.any().optional(),
      evidence: z.any().optional(),
      contributionPercent: z.number().optional(),
      isPrimary: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    const rootCause = await prisma.cAPARootCause.create({
      data: {
        ...data,
        capaId: req.params.id,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: rootCause });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add root cause error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add root cause' } });
  }
});

// D5: Corrective Actions
// POST /api/capas/:id/corrective-actions
router.post('/:id/corrective-actions', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      actionCategory: z.enum(['DESIGN_CHANGE', 'PROCESS_CHANGE', 'PROCEDURE_UPDATE', 'EQUIPMENT_MODIFICATION', 'TRAINING', 'SUPPLIER_CHANGE', 'INSPECTION_UPDATE', 'PREVENTIVE_MAINTENANCE', 'WORK_INSTRUCTION_UPDATE', 'OTHER']),
      rootCauseId: z.string().optional(),
      assignedToId: z.string().optional(),
      department: z.string().optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      estimatedCost: z.number().optional(),
      resourcesRequired: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const action = await prisma.cAPACorrectiveAction.create({
      data: {
        ...data,
        capaId: req.params.id,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: action });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add corrective action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add corrective action' } });
  }
});

// D6: Implementation
// POST /api/capas/:id/implementation
router.post('/:id/implementation', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      implementationType: z.enum(['PROCESS_CHANGE', 'EQUIPMENT_INSTALLATION', 'TRAINING_DELIVERY', 'DOCUMENT_UPDATE', 'SYSTEM_CONFIGURATION', 'SUPPLIER_QUALIFICATION', 'OTHER']),
      correctiveActionId: z.string().optional(),
      validationMethod: z.string().optional(),
      validationCriteria: z.string().optional(),
      beforeData: z.any().optional(),
    });

    const data = schema.parse(req.body);

    const implementation = await prisma.cAPAImplementation.create({
      data: {
        ...data,
        capaId: req.params.id,
        status: 'PLANNED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: implementation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add implementation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add implementation' } });
  }
});

// D7: Prevention Actions
// POST /api/capas/:id/prevention
router.post('/:id/prevention', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string().min(1),
      preventionType: z.enum(['FMEA_UPDATE', 'CONTROL_PLAN_UPDATE', 'PROCEDURE_REVISION', 'TRAINING_UPDATE', 'POKA_YOKE', 'SYSTEM_ENHANCEMENT', 'AUDIT_CHECKLIST_UPDATE', 'OTHER']),
      affectedDocuments: z.array(z.string()).default([]),
      affectedProcesses: z.array(z.string()).default([]),
      trainingRequired: z.boolean().default(false),
      assignedToId: z.string().optional(),
      dueDate: z.string().optional(),
      verificationMethod: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const prevention = await prisma.cAPAPreventionAction.create({
      data: {
        ...data,
        capaId: req.params.id,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: prevention });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add prevention action error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add prevention action' } });
  }
});

// D8: Effectiveness Checks
// POST /api/capas/:id/effectiveness
router.post('/:id/effectiveness', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      checkNumber: z.number(),
      checkType: z.enum(['INITIAL_VERIFICATION', 'THIRTY_DAY_CHECK', 'SIXTY_DAY_CHECK', 'NINETY_DAY_CHECK', 'SIX_MONTH_CHECK', 'ANNUAL_CHECK', 'CUSTOM']),
      plannedDate: z.string(),
      beforeMetric: z.string().optional(),
      beforeValue: z.number().optional(),
      targetValue: z.number().optional(),
      verificationMethod: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const check = await prisma.cAPAEffectivenessCheck.create({
      data: {
        ...data,
        capaId: req.params.id,
        plannedDate: new Date(data.plannedDate),
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: check });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add effectiveness check error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add effectiveness check' } });
  }
});

// PATCH /api/capas/:id/effectiveness/:checkId - Complete effectiveness check
router.patch('/:id/effectiveness/:checkId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      actualDate: z.string().optional(),
      afterMetric: z.string().optional(),
      afterValue: z.number().optional(),
      isEffective: z.boolean().optional(),
      effectivenessScore: z.number().optional(),
      findings: z.string().optional(),
      evidence: z.any().optional(),
      followUpRequired: z.boolean().optional(),
      followUpNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const check = await prisma.cAPAEffectivenessCheck.update({
      where: { id: req.params.checkId },
      data: {
        ...data,
        actualDate: data.actualDate ? new Date(data.actualDate) : new Date(),
        verifiedById: req.user!.id,
      },
    });

    res.json({ success: true, data: check });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update effectiveness check error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update effectiveness check' } });
  }
});

// Horizontal Deployment
// POST /api/capas/:id/horizontal-deployment
router.post('/:id/horizontal-deployment', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      targetArea: z.string().min(1),
      targetType: z.enum(['SIMILAR_PROCESS', 'SIMILAR_PRODUCT', 'SIMILAR_EQUIPMENT', 'SAME_SUPPLIER', 'SAME_DEPARTMENT', 'SISTER_PLANT', 'CUSTOMER_NOTIFICATION']),
      description: z.string().min(1),
      rationale: z.string().optional(),
      assignedToId: z.string().optional(),
      plannedDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const deployment = await prisma.cAPAHorizontalDeployment.create({
      data: {
        ...data,
        capaId: req.params.id,
        plannedDate: data.plannedDate ? new Date(data.plannedDate) : undefined,
        status: 'IDENTIFIED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: deployment });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add horizontal deployment error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add horizontal deployment' } });
  }
});

// DELETE /api/capas/:id - Delete CAPA
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.cAPA.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    await prisma.cAPA.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'CAPA deleted successfully' } });
  } catch (error) {
    console.error('Delete CAPA error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' } });
  }
});

export default router;
