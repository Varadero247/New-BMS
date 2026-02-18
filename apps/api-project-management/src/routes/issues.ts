import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-project-management');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/issues - List issues by projectId
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { projectId, status, severity, page = '1', limit = '50' } = req.query;

    if (!projectId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'projectId query parameter is required' },
      });
    }

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { projectId: projectId as string, deletedAt: null };
    if (status) where.status = status as any;
    if (severity) where.severity = severity as any;

    const [issues, total] = await Promise.all([
      prisma.projectIssue.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ raisedDate: 'desc' }],
      }),
      prisma.projectIssue.count({ where }),
    ]);

    res.json({
      success: true,
      data: issues,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List issues error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list issues' },
    });
  }
});

const createIssueSchema = z.object({
  projectId: z.string().trim().min(1).max(200),
  issueCode: z.string().trim().min(1).max(200),
  issueTitle: z.string().trim().min(1).max(200),
  issueDescription: z.string().trim().min(1).max(2000),
  issueType: z.enum(['DEFECT', 'BLOCKER', 'DEPENDENCY', 'RESOURCE', 'SCOPE_CREEP', 'CHANGE']),
  category: z.string().trim().optional(),
  severity: z.string().trim().optional(),
  priority: z.string().trim().optional(),
  assignedTo: z.string().trim().optional(),
  targetResolutionDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  impactOnSchedule: z.number().optional(),
  impactOnBudget: z.number().nonnegative().optional(),
  impactOnScope: z.string().trim().optional(),
});
const updateIssueSchema = createIssueSchema
  .extend({
    actualResolutionDate: z.string().trim().optional(),
    escalationDate: z.string().trim().optional(),
  })
  .partial();

// POST /api/issues - Create issue
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createIssueSchema.parse(req.body);

    const issue = await prisma.projectIssue.create({
      data: {
        projectId: data.projectId,
        issueCode: data.issueCode,
        issueTitle: data.issueTitle,
        issueDescription: data.issueDescription,
        issueType: data.issueType,
        category: data.category,
        severity: data.severity || 'MEDIUM',
        priority: data.priority || 'MEDIUM',
        reportedBy: req.user?.id,
        assignedTo: data.assignedTo,
        raisedDate: new Date(),
        targetResolutionDate: data.targetResolutionDate
          ? new Date(data.targetResolutionDate)
          : null,
        impactOnSchedule: data.impactOnSchedule,
        impactOnBudget: data.impactOnBudget,
        impactOnScope: data.impactOnScope,
        status: 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: issue });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors },
      });
    }
    logger.error('Create issue error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create issue' },
    });
  }
});

// PUT /api/issues/:id - Update issue
router.put('/:id', checkOwnership(prisma.projectIssue), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.projectIssue.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
    }

    const parsed = updateIssueSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const data = parsed.data;
    const updateData = { ...data } as Record<string, unknown>;

    if (data.targetResolutionDate)
      updateData.targetResolutionDate = new Date(data.targetResolutionDate);
    if (data.actualResolutionDate)
      updateData.actualResolutionDate = new Date(data.actualResolutionDate);
    if (data.escalationDate) updateData.escalationDate = new Date(data.escalationDate);

    const issue = await prisma.projectIssue.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: issue });
  } catch (error) {
    logger.error('Update issue error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update issue' },
    });
  }
});

// PUT /api/issues/:id/resolve - Resolve issue
router.put(
  '/:id/resolve',
  checkOwnership(prisma.projectIssue),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectIssue.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
      }

      const _schema = z.object({
        resolutionDescription: z.string().trim().min(1),
        rootCause: z.string().trim().optional(),
        preventiveAction: z.string().trim().optional(),
      });
      const _parsed = _schema.safeParse(req.body);
      if (!_parsed.success)
        return res.status(400).json({
          success: false,
          error: { code: 'VALIDATION_ERROR', message: _parsed.error.errors[0].message },
        });
      const { resolutionDescription, rootCause, preventiveAction } = _parsed.data;

      const issue = await prisma.projectIssue.update({
        where: { id: req.params.id },
        data: {
          status: 'RESOLVED',
          resolutionDescription,
          rootCause,
          preventiveAction,
          actualResolutionDate: new Date(),
        },
      });

      res.json({ success: true, data: issue });
    } catch (error) {
      logger.error('Resolve issue error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to resolve issue' },
      });
    }
  }
);

// DELETE /api/issues/:id - Delete issue
router.delete(
  '/:id',
  checkOwnership(prisma.projectIssue),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.projectIssue.findUnique({ where: { id: req.params.id } });
      if (!existing) {
        return res
          .status(404)
          .json({ success: false, error: { code: 'NOT_FOUND', message: 'Issue not found' } });
      }

      await prisma.projectIssue.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date() },
      });
      res.status(204).send();
    } catch (error) {
      logger.error('Delete issue error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete issue' },
      });
    }
  }
);

export default router;
