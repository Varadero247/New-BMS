import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// ============================================
// IMPROVEMENT PROJECTS (DMAIC/DMADV)
// ============================================

// GET /api/improvement-projects - List projects
router.get('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, methodology, projectType } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (methodology) where.methodology = methodology;
    if (projectType) where.projectType = projectType;

    const [projects, total] = await Promise.all([
      prisma.improvementProject.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.improvementProject.count({ where }),
    ]);

    res.json({
      success: true,
      data: projects,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List projects error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list projects' } });
  }
});

// POST /api/improvement-projects - Create project
router.post('/projects', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      projectType: z.enum(['COST_REDUCTION', 'QUALITY_IMPROVEMENT', 'LEAD_TIME_REDUCTION', 'CAPACITY_INCREASE', 'SAFETY_IMPROVEMENT', 'CUSTOMER_SATISFACTION', 'PROCESS_OPTIMIZATION', 'OTHER']),
      methodology: z.enum(['DMAIC', 'DMADV', 'LEAN', 'KAIZEN', 'SIX_SIGMA', 'THEORY_OF_CONSTRAINTS', 'AGILE', 'OTHER']),
      category: z.string().optional(),
      department: z.string().optional(),
      process: z.string().optional(),
      product: z.string().optional(),
      sponsorId: z.string().optional(),
      leaderId: z.string().optional(),
      startDate: z.string().optional(),
      targetEndDate: z.string().optional(),
      problemStatement: z.string().optional(),
      goalStatement: z.string().optional(),
      baselineMetric: z.string().optional(),
      baselineValue: z.number().optional(),
      targetValue: z.number().optional(),
      estimatedSavings: z.number().optional(),
      investmentRequired: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Generate project number
    const count = await prisma.improvementProject.count();
    const projectNumber = `PRJ-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const project = await prisma.improvementProject.create({
      data: {
        ...data,
        projectNumber,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        targetEndDate: data.targetEndDate ? new Date(data.targetEndDate) : undefined,
        currentPhase: 'DEFINE',
        status: 'PROPOSED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create project error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create project' } });
  }
});

// PATCH /api/improvement-projects/:id - Update project
router.patch('/projects/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      currentPhase: z.enum(['DEFINE', 'MEASURE', 'ANALYZE', 'IMPROVE', 'CONTROL', 'CLOSED']).optional(),
      status: z.enum(['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
      actualValue: z.number().optional(),
      actualSavings: z.number().optional(),
      roi: z.number().optional(),
    });

    const data = schema.parse(req.body);

    const project = await prisma.improvementProject.update({
      where: { id: req.params.id },
      data: {
        ...data,
        actualEndDate: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: project });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update project error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update project' } });
  }
});

// ============================================
// KAIZEN EVENTS
// ============================================

// GET /api/kaizen-events - List kaizen events
router.get('/kaizen', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;

    const [events, total] = await Promise.all([
      prisma.kaizenEvent.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { startDate: 'desc' },
      }),
      prisma.kaizenEvent.count({ where }),
    ]);

    res.json({
      success: true,
      data: events,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List kaizen events error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list kaizen events' } });
  }
});

// POST /api/kaizen-events - Create kaizen event
router.post('/kaizen', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      area: z.string().min(1),
      process: z.string().optional(),
      facilitatorId: z.string().optional(),
      teamMembers: z.array(z.string()).default([]),
      startDate: z.string(),
      endDate: z.string(),
      wasteTypes: z.array(z.enum(['DEFECTS', 'OVERPRODUCTION', 'WAITING', 'NON_UTILIZED_TALENT', 'TRANSPORTATION', 'INVENTORY', 'MOTION', 'EXTRA_PROCESSING'])).default([]),
      estimatedSavings: z.number().optional(),
    });

    const data = schema.parse(req.body);

    // Generate event number
    const count = await prisma.kaizenEvent.count();
    const eventNumber = `KZN-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(3, '0')}`;

    const event = await prisma.kaizenEvent.create({
      data: {
        ...data,
        eventNumber,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        status: 'PLANNED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create kaizen event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create kaizen event' } });
  }
});

// PATCH /api/kaizen-events/:id - Update kaizen event
router.patch('/kaizen/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['PLANNED', 'PREPARATION', 'IN_PROGRESS', 'REVIEW', 'COMPLETED', 'FOLLOW_UP']).optional(),
      improvements: z.any().optional(),
      actionsCompleted: z.number().optional(),
      actionsTotal: z.number().optional(),
      beforeMetrics: z.any().optional(),
      afterMetrics: z.any().optional(),
      actualSavings: z.number().optional(),
      sustainabilityStatus: z.enum(['SUSTAINED', 'PARTIALLY_SUSTAINED', 'DECLINED', 'NOT_ASSESSED']).optional(),
    });

    const data = schema.parse(req.body);

    const event = await prisma.kaizenEvent.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update kaizen event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update kaizen event' } });
  }
});

// ============================================
// EMPLOYEE IDEAS
// ============================================

// GET /api/employee-ideas - List ideas
router.get('/ideas', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, category, mine } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (category) where.category = category;
    if (mine === 'true') where.submittedById = req.user!.id;

    const [ideas, total] = await Promise.all([
      prisma.employeeIdea.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { submittedAt: 'desc' },
      }),
      prisma.employeeIdea.count({ where }),
    ]);

    res.json({
      success: true,
      data: ideas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List ideas error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list ideas' } });
  }
});

// POST /api/employee-ideas - Submit idea
router.post('/ideas', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      problemStatement: z.string().optional(),
      proposedSolution: z.string().optional(),
      category: z.enum(['QUALITY', 'SAFETY', 'PRODUCTIVITY', 'COST_REDUCTION', 'ENVIRONMENT', 'EMPLOYEE_SATISFACTION', 'CUSTOMER_SATISFACTION', 'OTHER']),
      area: z.string().optional(),
      expectedBenefits: z.string().optional(),
      estimatedSavings: z.number().optional(),
      isAnonymous: z.boolean().default(false),
    });

    const data = schema.parse(req.body);

    // Generate idea number
    const count = await prisma.employeeIdea.count();
    const ideaNumber = `IDEA-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const idea = await prisma.employeeIdea.create({
      data: {
        ...data,
        ideaNumber,
        submittedById: req.user!.id,
        status: 'SUBMITTED',
      },
    });

    res.status(201).json({ success: true, data: idea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Submit idea error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit idea' } });
  }
});

// PATCH /api/employee-ideas/:id - Update idea (review/implement)
router.patch('/ideas/:id', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      status: z.enum(['SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'IN_PROGRESS', 'IMPLEMENTED', 'CLOSED']).optional(),
      reviewComments: z.string().optional(),
      actualBenefits: z.string().optional(),
      actualSavings: z.number().optional(),
      pointsAwarded: z.number().optional(),
      recognitionNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const idea = await prisma.employeeIdea.update({
      where: { id: req.params.id },
      data: {
        ...data,
        reviewedById: data.status === 'APPROVED' || data.status === 'REJECTED' ? req.user!.id : undefined,
        reviewedAt: data.status === 'APPROVED' || data.status === 'REJECTED' ? new Date() : undefined,
        implementedById: data.status === 'IMPLEMENTED' ? req.user!.id : undefined,
        implementedAt: data.status === 'IMPLEMENTED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: idea });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update idea error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update idea' } });
  }
});

// ============================================
// 5S AUDITS
// ============================================

// GET /api/5s-audits - List 5S audits
router.get('/5s', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', area } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (area) where.area = area;

    const [audits, total] = await Promise.all([
      prisma.fiveSAudit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { auditDate: 'desc' },
      }),
      prisma.fiveSAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List 5S audits error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list 5S audits' } });
  }
});

// POST /api/5s-audits - Create 5S audit
router.post('/5s', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      area: z.string().min(1),
      department: z.string().optional(),
      sortScore: z.number().min(1).max(5),
      setInOrderScore: z.number().min(1).max(5),
      shineScore: z.number().min(1).max(5),
      standardizeScore: z.number().min(1).max(5),
      sustainScore: z.number().min(1).max(5),
      sortFindings: z.any().optional(),
      setInOrderFindings: z.any().optional(),
      shineFindings: z.any().optional(),
      standardizeFindings: z.any().optional(),
      sustainFindings: z.any().optional(),
      actionsRequired: z.any().optional(),
      photos: z.any().optional(),
    });

    const data = schema.parse(req.body);

    // Calculate totals
    const totalScore = data.sortScore + data.setInOrderScore + data.shineScore + data.standardizeScore + data.sustainScore;
    const percentScore = (totalScore / 25) * 100;

    // Generate audit number
    const count = await prisma.fiveSAudit.count();
    const auditNumber = `5S-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const audit = await prisma.fiveSAudit.create({
      data: {
        ...data,
        auditNumber,
        auditorId: req.user!.id,
        totalScore,
        percentScore,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create 5S audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create 5S audit' } });
  }
});

// ============================================
// STANDARD WORK
// ============================================

// GET /api/standard-work - List standard work documents
router.get('/standard-work', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', process, status } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (process) where.process = process;
    if (status) where.status = status;

    const [docs, total] = await Promise.all([
      prisma.standardWork.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.standardWork.count({ where }),
    ]);

    res.json({
      success: true,
      data: docs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List standard work error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list standard work' } });
  }
});

// POST /api/standard-work - Create standard work
router.post('/standard-work', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      process: z.string().min(1),
      operation: z.string().min(1),
      workstation: z.string().optional(),
      taktTime: z.number().optional(),
      cycleTime: z.number().optional(),
      standardWIP: z.number().optional(),
      workSequence: z.any(), // Array of work elements
      safetyPoints: z.array(z.string()).default([]),
      qualityCheckpoints: z.any().optional(),
      trainingRequired: z.boolean().default(true),
    });

    const data = schema.parse(req.body);
    const workSequence = Array.isArray(data.workSequence) ? data.workSequence : [];

    // Generate document number
    const count = await prisma.standardWork.count();
    const documentNumber = `SW-${new Date().getFullYear().toString().slice(-2)}-${(count + 1).toString().padStart(4, '0')}`;

    const doc = await prisma.standardWork.create({
      data: {
        ...data,
        documentNumber,
        totalSteps: workSequence.length,
        status: 'DRAFT',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create standard work error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create standard work' } });
  }
});

export default router;
