import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// 8D Problem Solving (IATF 16949 / Ford 8D)
// ============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `8D-${yy}${mm}`;
  const count = await prisma.eightDReport.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

const createSchema = z.object({
  title: z.string().min(1),
  problemStatement: z.string().min(1),
  customer: z.string().optional(),
  partNumber: z.string().optional(),
  partName: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  teamLeader: z.string().min(1),
  teamMembers: z.array(z.string()).optional().default([]),
});

const updateSchema = z.object({
  title: z.string().min(1).optional(),
  problemStatement: z.string().optional(),
  customer: z.string().optional(),
  partNumber: z.string().optional(),
  partName: z.string().optional(),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  status: z.enum([
    'D1_TEAM_FORMATION', 'D2_PROBLEM_DESCRIPTION', 'D3_INTERIM_CONTAINMENT',
    'D4_ROOT_CAUSE', 'D5_CORRECTIVE_ACTIONS', 'D6_IMPLEMENTATION',
    'D7_PREVENTION', 'D8_CLOSURE', 'CLOSED',
  ]).optional(),
  teamLeader: z.string().optional(),
  teamMembers: z.array(z.string()).optional(),
  // D2
  problemDescription: z.string().optional(),
  is: z.string().optional(),
  isNot: z.string().optional(),
  whenOccurred: z.string().optional(),
  whereOccurred: z.string().optional(),
  // D3
  containmentAction: z.string().optional(),
  containmentDate: z.string().optional(),
  containmentOwner: z.string().optional(),
  // D4
  rootCause: z.string().optional(),
  rootCauseMethod: z.string().optional(),
  rootCauseAnalysis: z.record(z.unknown()).optional(),
  // D5
  correctiveActions: z.array(z.unknown()).optional(),
  // D6
  implementationPlan: z.string().optional(),
  implementationDate: z.string().optional(),
  // D7
  preventiveActions: z.array(z.unknown()).optional(),
  systemsUpdated: z.string().optional(),
  // D8
  teamRecognition: z.string().optional(),
  lessonsLearned: z.string().optional(),
  closedDate: z.string().optional(),
  closedBy: z.string().optional(),
});

// GET / - List 8D reports
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, customer, severity, search } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (customer) where.customer = { contains: customer as string, mode: 'insensitive' };
    if (severity) where.severity = severity as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { problemStatement: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.eightDReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.eightDReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List 8D reports error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list 8D reports' } });
  }
});

// GET /stats - 8D summary statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, byStatus, bySeverity, openCritical] = await Promise.all([
      prisma.eightDReport.count({ where: { deletedAt: null } as any }),
      prisma.eightDReport.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.eightDReport.groupBy({
        by: ['severity'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.eightDReport.count({
        where: { deletedAt: null, status: { not: 'CLOSED' } as any, severity: 'CRITICAL' },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        openCritical,
        byStatus: byStatus.map(s => ({ status: s.status, count: s._count.id })),
        bySeverity: bySeverity.map(s => ({ severity: s.severity, count: s._count.id })),
      },
    });
  } catch (error) {
    logger.error('8D stats error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get 8D stats' } });
  }
});

// GET /:id - Get single 8D report
router.get('/:id', checkOwnership(prisma.eightDReport), async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.eightDReport.findUnique({ where: { id: req.params.id } });
    if (!report || report.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '8D report not found' } });
    }
    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get 8D report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get 8D report' } });
  }
});

// POST / - Create new 8D report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const report = await prisma.eightDReport.create({
      data: {
        refNumber,
        title: data.title,
        problemStatement: data.problemStatement,
        customer: data.customer,
        partNumber: data.partNumber,
        partName: data.partName,
        severity: data.severity || 'MEDIUM',
        teamLeader: data.teamLeader,
        teamMembers: data.teamMembers,
        status: 'D1_TEAM_FORMATION',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create 8D report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create 8D report' } });
  }
});

// PUT /:id - Update 8D report
router.put('/:id', checkOwnership(prisma.eightDReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.eightDReport.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '8D report not found' } });
    }

    const data = updateSchema.parse(req.body);

    const updateData: Record<string, unknown> = { ...data };
    if (data.whenOccurred) updateData.whenOccurred = new Date(data.whenOccurred);
    if (data.containmentDate) updateData.containmentDate = new Date(data.containmentDate);
    if (data.implementationDate) updateData.implementationDate = new Date(data.implementationDate);
    if (data.closedDate) updateData.closedDate = new Date(data.closedDate);
    if (data.status === 'CLOSED' && !data.closedDate) updateData.closedDate = new Date();

    const report = await prisma.eightDReport.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update 8D report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update 8D report' } });
  }
});

// DELETE /:id - Soft delete 8D report
router.delete('/:id', checkOwnership(prisma.eightDReport), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.eightDReport.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: '8D report not found' } });
    }

    await prisma.eightDReport.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete 8D report error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete 8D report' } });
  }
});

export default router;
