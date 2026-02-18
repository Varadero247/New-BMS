import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('risk-actions');

const actionSchema = z.object({
  actionTitle: z.string().min(1),
  description: z.string().min(1),
  actionType: z.enum(['PREVENTIVE', 'MITIGATIVE', 'TRANSFER', 'ACCEPT']),
  owner: z.string().optional(),
  ownerEmail: z.string().email().optional(),
  targetDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  estimatedCost: z.number().optional(),
  linkedCapaId: z.string().optional(),
});

// GET /api/risks/:id/actions
router.get('/:id/actions', authenticate, async (req: Request, res: Response) => {
  try {
    const actions = await prisma.riskAction.findMany({
      where: { riskId: req.params.id },
      orderBy: { targetDate: 'asc' },
    });
    res.json({ success: true, data: actions });
  } catch (error: unknown) { logger.error('Failed to fetch actions', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch actions' } }); }
});

// POST /api/risks/:id/actions
router.post('/:id/actions', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const risk = await prisma.riskRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!risk) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    const parsed = actionSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const action = await prisma.riskAction.create({
      data: { ...parsed.data, riskId: req.params.id, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data: action });
  } catch (error: unknown) { logger.error('Failed to create action', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Operation failed' } }); }
});

// PUT /api/risks/:riskId/actions/:id
router.put('/:riskId/actions/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = actionSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.riskAction.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    const action = await prisma.riskAction.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data: action });
  } catch (error: unknown) { logger.error('Failed to update action', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Operation failed' } }); }
});

// POST /api/risks/:riskId/actions/:id/complete
router.post('/:riskId/actions/:id/complete', authenticate, async (req: Request, res: Response) => {
  try {
    const completeSchema = z.object({ evidenceOfCompletion: z.string().optional(), effectiveness: z.string().optional() });
    const parsed = completeSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { evidenceOfCompletion, effectiveness } = parsed.data;
    const existing = await prisma.riskAction.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Action not found' } });
    const action = await prisma.riskAction.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', completedDate: new Date(), evidenceOfCompletion, effectiveness },
    });
    res.json({ success: true, data: action });
  } catch (error: unknown) { logger.error('Failed to complete action', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Operation failed' } }); }
});

// GET /api/risks/actions/overdue
router.get('/actions/overdue', authenticate, async (req: Request, res: Response) => {
  try {
    const actions = await prisma.riskAction.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lt: new Date() } },
      include: { risk: { select: { id: true, title: true, referenceNumber: true, residualRiskLevel: true } } },
      orderBy: { targetDate: 'asc' },
    });
    res.json({ success: true, data: actions });
  } catch (error: unknown) { logger.error('Failed to fetch overdue actions', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch overdue actions' } }); }
});

// GET /api/risks/actions/due-soon
router.get('/actions/due-soon', authenticate, async (req: Request, res: Response) => {
  try {
    const twoWeeks = new Date();
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    const actions = await prisma.riskAction.findMany({
      where: { status: { in: ['OPEN', 'IN_PROGRESS'] }, targetDate: { lte: twoWeeks, gte: new Date() } },
      include: { risk: { select: { id: true, title: true, referenceNumber: true } } },
      orderBy: { targetDate: 'asc' },
    });
    res.json({ success: true, data: actions });
  } catch (error: unknown) { logger.error('Failed to fetch due-soon actions', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch due-soon actions' } }); }
});

export default router;
