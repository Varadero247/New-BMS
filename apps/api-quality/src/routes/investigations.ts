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
  return `INV-${year}${month}-${random}`;
}

// GET /api/investigations - List investigations
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, investigationType, severity } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (investigationType) where.investigationType = investigationType;
    if (severity) where.severity = severity;

    const [investigations, total] = await Promise.all([
      prisma.investigation.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { causes: true, recommendations: true, teamMembers: true } },
        },
      }),
      prisma.investigation.count({ where }),
    ]);

    res.json({
      success: true,
      data: investigations,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List investigations error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list investigations' } });
  }
});

// GET /api/investigations/:id - Get single investigation
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const investigation = await prisma.investigation.findUnique({
      where: { id: req.params.id },
      include: {
        timeline: { orderBy: { sequenceOrder: 'asc' } },
        causes: { include: { childCauses: true } },
        recommendations: true,
        teamMembers: true,
      },
    });

    if (!investigation) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });
    }

    res.json({ success: true, data: investigation });
  } catch (error) {
    console.error('Get investigation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get investigation' } });
  }
});

// POST /api/investigations - Create investigation
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      investigationType: z.enum(['INCIDENT', 'NEAR_MISS', 'QUALITY_EVENT', 'CUSTOMER_COMPLAINT', 'AUDIT_FINDING', 'REGULATORY_EVENT', 'PRODUCT_FAILURE', 'PROCESS_DEVIATION', 'ENVIRONMENTAL_EVENT', 'SAFETY_EVENT']),
      category: z.string().optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).default('MINOR'),
      sourceType: z.string().optional(),
      sourceId: z.string().optional(),
      eventDate: z.string(),
      eventLocation: z.string().optional(),
      impactDescription: z.string().optional(),
      financialImpact: z.number().optional(),
      leadInvestigatorId: z.string().optional(),
      targetCompletionDate: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const investigation = await prisma.investigation.create({
      data: {
        ...data,
        referenceNumber: generateReferenceNumber(),
        eventDate: new Date(data.eventDate),
        targetCompletionDate: data.targetCompletionDate ? new Date(data.targetCompletionDate) : undefined,
        status: 'INITIATED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: investigation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create investigation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create investigation' } });
  }
});

// PATCH /api/investigations/:id - Update investigation
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.investigation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).optional(),
      status: z.enum(['INITIATED', 'DATA_COLLECTION', 'ANALYSIS_IN_PROGRESS', 'ROOT_CAUSE_IDENTIFIED', 'RECOMMENDATIONS_PENDING', 'ACTIONS_ASSIGNED', 'VERIFICATION_IN_PROGRESS', 'COMPLETED', 'CLOSED', 'REOPENED']).optional(),
      impactDescription: z.string().optional(),
      financialImpact: z.number().optional(),
      productionImpact: z.string().optional(),
      customerImpact: z.string().optional(),
      regulatoryImpact: z.string().optional(),
      leadInvestigatorId: z.string().optional(),
      targetCompletionDate: z.string().optional(),
      rootCauseSummary: z.string().optional(),
      conclusion: z.string().optional(),
      lessonsLearned: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const investigation = await prisma.investigation.update({
      where: { id: req.params.id },
      data: {
        ...data,
        targetCompletionDate: data.targetCompletionDate ? new Date(data.targetCompletionDate) : undefined,
        actualCompletionDate: data.status === 'CLOSED' || data.status === 'COMPLETED' ? new Date() : undefined,
        updatedById: req.user!.id,
      },
    });

    res.json({ success: true, data: investigation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update investigation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update investigation' } });
  }
});

// GET /api/investigations/:id/timeline - Get timeline
router.get('/:id/timeline', async (req: AuthRequest, res: Response) => {
  try {
    const timeline = await prisma.investigationTimeline.findMany({
      where: { investigationId: req.params.id },
      orderBy: { sequenceOrder: 'asc' },
    });

    res.json({ success: true, data: timeline });
  } catch (error) {
    console.error('Get timeline error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get timeline' } });
  }
});

// POST /api/investigations/:id/timeline - Add timeline event
router.post('/:id/timeline', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      eventDateTime: z.string(),
      description: z.string(),
      eventType: z.enum(['INITIAL_EVENT', 'CONTRIBUTING_FACTOR', 'RESPONSE_ACTION', 'ESCALATION', 'COMMUNICATION', 'EVIDENCE_COLLECTED', 'WITNESS_STATEMENT', 'SYSTEM_ALERT', 'OTHER']),
      evidence: z.any().optional(),
      witnesses: z.array(z.string()).default([]),
      source: z.string().optional(),
      sequenceOrder: z.number(),
    });

    const data = schema.parse(req.body);

    const event = await prisma.investigationTimeline.create({
      data: {
        ...data,
        investigationId: req.params.id,
        eventDateTime: new Date(data.eventDateTime),
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add timeline event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add timeline event' } });
  }
});

// GET /api/investigations/:id/causes - Get root causes
router.get('/:id/causes', async (req: AuthRequest, res: Response) => {
  try {
    const causes = await prisma.investigationCause.findMany({
      where: { investigationId: req.params.id },
      include: { childCauses: true },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: causes });
  } catch (error) {
    console.error('Get causes error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get causes' } });
  }
});

// POST /api/investigations/:id/causes - Add cause
router.post('/:id/causes', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      causeType: z.enum(['ROOT_CAUSE', 'CONTRIBUTING_CAUSE', 'IMMEDIATE_CAUSE', 'SYSTEMIC_CAUSE', 'DIRECT_CAUSE']),
      category: z.string().optional(),
      description: z.string(),
      analysisMethod: z.enum(['FIVE_WHYS', 'FISHBONE', 'FAULT_TREE', 'CHANGE_ANALYSIS', 'BARRIER_ANALYSIS', 'EVENT_TREE', 'PARETO', 'FMEA']).optional(),
      whyLevel: z.number().optional(),
      parentCauseId: z.string().optional(),
      fishboneCategory: z.enum(['MANPOWER', 'METHOD', 'MACHINE', 'MATERIAL', 'MEASUREMENT', 'ENVIRONMENT']).optional(),
      evidence: z.any().optional(),
      contributionFactor: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const cause = await prisma.investigationCause.create({
      data: {
        ...data,
        investigationId: req.params.id,
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: cause });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add cause error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add cause' } });
  }
});

// GET /api/investigations/:id/recommendations - Get recommendations
router.get('/:id/recommendations', async (req: AuthRequest, res: Response) => {
  try {
    const recommendations = await prisma.investigationRecommendation.findMany({
      where: { investigationId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: recommendations });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get recommendations' } });
  }
});

// POST /api/investigations/:id/recommendations - Add recommendation
router.post('/:id/recommendations', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      description: z.string(),
      recommendationType: z.enum(['CORRECTIVE', 'PREVENTIVE', 'IMPROVEMENT', 'TRAINING', 'PROCEDURE_UPDATE', 'EQUIPMENT_CHANGE', 'PROCESS_CHANGE', 'MONITORING']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
      assignedToId: z.string().optional(),
      department: z.string().optional(),
      dueDate: z.string().optional(),
      verificationMethod: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const recommendation = await prisma.investigationRecommendation.create({
      data: {
        ...data,
        investigationId: req.params.id,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        status: 'PROPOSED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: recommendation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add recommendation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add recommendation' } });
  }
});

// POST /api/investigations/:id/team - Add team member
router.post('/:id/team', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      role: z.enum(['LEAD_INVESTIGATOR', 'INVESTIGATOR', 'SUBJECT_MATTER_EXPERT', 'WITNESS', 'STAKEHOLDER', 'REVIEWER', 'APPROVER']),
      responsibilities: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const member = await prisma.investigationTeamMember.create({
      data: {
        ...data,
        investigationId: req.params.id,
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

// DELETE /api/investigations/:id - Delete investigation
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.investigation.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Investigation not found' } });
    }

    await prisma.investigation.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Investigation deleted successfully' } });
  } catch (error) {
    console.error('Delete investigation error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete investigation' } });
  }
});

export default router;
