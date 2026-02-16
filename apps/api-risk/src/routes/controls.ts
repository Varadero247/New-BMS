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
  description: z.string().min(1),
  owner: z.string().optional(),
  effectiveness: z.enum(['STRONG', 'ADEQUATE', 'WEAK', 'NONE_EFFECTIVE']).optional(),
  lastTestedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  testingFrequency: z.string().optional(),
  testingMethod: z.string().optional(),
  nextTestDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  testingNotes: z.string().optional(),
  linkedProcedureRef: z.string().optional(),
  linkedTrainingRef: z.string().optional(),
});

// POST /api/risks/:id/controls
router.post('/:id/controls', authenticate, async (req: Request, res: Response) => {
  try {
    const risk = await (prisma as any).riskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!risk) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    const parsed = controlSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const control = await (prisma as any).riskControl.create({ data: { ...parsed.data, riskId: req.params.id } });
    // Update overall control effectiveness on parent risk
    const allControls = await (prisma as any).riskControl.findMany({ where: { riskId: req.params.id, isActive: true } });
    const overall = getControlEffectivenessOverall(allControls);
    await (prisma as any).riskRegister.update({ where: { id: req.params.id }, data: { controlEffectiveness: overall } });
    res.status(201).json({ success: true, data: control });
  } catch (error: any) { logger.error('Failed to add control', { error: error.message }); res.status(500).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

// GET /api/risks/:id/controls
router.get('/:id/controls', authenticate, async (req: Request, res: Response) => {
  try {
    const controls = await (prisma as any).riskControl.findMany({ where: { riskId: req.params.id, isActive: true }, orderBy: { createdAt: 'desc' } });
    res.json({ success: true, data: controls });
  } catch (error: any) { logger.error('Failed to fetch controls', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch controls' } }); }
});

// PUT /api/risks/:riskId/controls/:id
router.put('/:riskId/controls/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = controlSchema.partial().safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    const control = await (prisma as any).riskControl.update({ where: { id: req.params.id }, data: parsed.data });
    const allControls = await (prisma as any).riskControl.findMany({ where: { riskId: req.params.riskId, isActive: true } });
    const overall = getControlEffectivenessOverall(allControls);
    await (prisma as any).riskRegister.update({ where: { id: req.params.riskId }, data: { controlEffectiveness: overall } });
    res.json({ success: true, data: control });
  } catch (error: any) { logger.error('Failed to update control', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

// DELETE /api/risks/:riskId/controls/:id
router.delete('/:riskId/controls/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    await (prisma as any).riskControl.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true, data: { message: 'Control removed' } });
  } catch (error: any) { logger.error('Failed to delete control', { error: error.message }); res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); }
});

// POST /api/risks/:riskId/controls/:id/test
router.post('/:riskId/controls/:id/test', authenticate, async (req: Request, res: Response) => {
  try {
    const { testingNotes, effectiveness } = req.body;
    const existing = await (prisma as any).riskControl.findFirst({ where: { id: req.params.id, riskId: req.params.riskId } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    const data: any = { lastTestedDate: new Date(), testingNotes };
    if (effectiveness) data.effectiveness = effectiveness;
    const control = await (prisma as any).riskControl.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: control });
  } catch (error: any) { logger.error('Failed to test control', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

export default router;
