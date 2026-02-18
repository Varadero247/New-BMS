import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { getControlEffectivenessOverall } from '../services/riskScoring';

const router = Router();
const logger = createLogger('risk-controls');

const controlSchema = z.object({
  controlType: z.enum(['PREVENTIVE', 'DETECTIVE', 'REACTIVE', 'DIRECTIVE']),
  description: z.string().trim().min(1).max(2000),
  owner: z.string().optional(),
  effectiveness: z.enum(['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE']).optional(),
  lastTestedDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().trim().datetime().optional()),
  testingFrequency: z.string().optional(),
  testingMethod: z.string().optional(),
  nextTestDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().trim().datetime().optional()),
  testingNotes: z.string().optional(),
  linkedProcedureRef: z.string().optional(),
  linkedTrainingRef: z.string().optional(),
});

// POST /api/risks/:id/controls
router.post('/:id/controls', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const risk = await prisma.riskRegister.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any });
    if (!risk) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    const parsed = controlSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const control = await prisma.riskControl.create({ data: { ...parsed.data, riskId: req.params.id } });
    // Update overall control effectiveness on parent risk
    const allControls = await prisma.riskControl.findMany({ where: { riskId: req.params.id, isActive: true },
      take: 1000});
    const overall = getControlEffectivenessOverall(allControls);
    await prisma.riskRegister.update({ where: { id: req.params.id }, data: { controlEffectiveness: overall as any } });
    res.status(201).json({ success: true, data: control });
  } catch (error: unknown) { logger.error('Failed to add control', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// GET /api/risks/:id/controls
router.get('/:id/controls', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const controls = await prisma.riskControl.findMany({ where: { riskId: req.params.id, isActive: true, risk: { orgId } } as any, orderBy: { createdAt: 'desc' },
      take: 1000});
    res.json({ success: true, data: controls });
  } catch (error: unknown) { logger.error('Failed to fetch controls', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch controls' } }); }
});

// PUT /api/risks/:riskId/controls/:id
router.put('/:riskId/controls/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const parsed = controlSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await prisma.riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId, deletedAt: null, risk: { orgId } } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    const control = await prisma.riskControl.update({ where: { id: req.params.id }, data: parsed.data });
    const allControls = await prisma.riskControl.findMany({ where: { riskId: req.params.riskId, isActive: true },
      take: 1000});
    const overall = getControlEffectivenessOverall(allControls);
    await prisma.riskRegister.update({ where: { id: req.params.riskId }, data: { controlEffectiveness: overall as any } });
    res.json({ success: true, data: control });
  } catch (error: unknown) { logger.error('Failed to update control', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// DELETE /api/risks/:riskId/controls/:id
router.delete('/:riskId/controls/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const existing = await prisma.riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId, deletedAt: null, risk: { orgId } } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    await prisma.riskControl.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, data: { message: 'Control removed' } });
  } catch (error: unknown) { logger.error('Failed to delete control', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

// POST /api/risks/:riskId/controls/:id/test
router.post('/:riskId/controls/:id/test', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as any).user as any)?.orgId || 'default';
    const testSchema = z.object({ testingNotes: z.string().optional(), effectiveness: z.enum(['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE']).optional() });
    const parsed = testSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const { testingNotes, effectiveness } = parsed.data;
    const existing = await prisma.riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId, deletedAt: null, risk: { orgId } } as any });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    const data: Record<string, unknown> = { lastTestedDate: new Date(), testingNotes };
    if (effectiveness) data.effectiveness = effectiveness;
    const control = await prisma.riskControl.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: control });
  } catch (error: unknown) { logger.error('Failed to test control', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Operation failed' } }); }
});

export default router;
