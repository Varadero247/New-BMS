import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-risks');

const likelihoodEnum = z.enum(['RARE', 'UNLIKELY', 'POSSIBLE', 'LIKELY', 'ALMOST_CERTAIN']);
const consequenceEnum = z.enum(['INSIGNIFICANT', 'MINOR', 'MODERATE', 'MAJOR', 'CATASTROPHIC']);

const createRiskSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  category: z.enum(['STRATEGIC', 'OPERATIONAL', 'FINANCIAL', 'COMPLIANCE', 'REPUTATIONAL', 'ENVIRONMENTAL', 'HEALTH_SAFETY', 'INFORMATION_SECURITY', 'QUALITY', 'SUPPLY_CHAIN']),
  source: z.string().optional(),
  owner: z.string().optional(),
  ownerName: z.string().optional(),
  department: z.string().optional(),
  likelihood: likelihoodEnum.optional(),
  consequence: consequenceEnum.optional(),
  inherentScore: z.number().optional(),
  residualLikelihood: likelihoodEnum.optional(),
  residualConsequence: consequenceEnum.optional(),
  residualScore: z.number().optional(),
  treatment: z.enum(['ACCEPT', 'MITIGATE', 'TRANSFER', 'AVOID', 'ESCALATE']).optional(),
  treatmentPlan: z.string().optional(),
  controls: z.string().optional(),
  status: z.enum(['IDENTIFIED', 'ASSESSED', 'TREATING', 'MONITORING', 'CLOSED']).optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  reviewDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  linkedIncident: z.string().optional(),
  linkedAudit: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

const updateRiskSchema = createRiskSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await (prisma as any).riskRegister.count({ where: { orgId, referenceNumber: { startsWith: `RISK-${year}` } } });
  return `RISK-${year}-${String(count + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      (prisma as any).riskRegister.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).riskRegister.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) { logger.error('Failed to fetch risks', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch risks' } }); }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).riskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) { logger.error('Failed to fetch risk', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch risk' } }); }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createRiskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { title, description, category, source, owner, ownerName, department, likelihood, consequence, inherentScore, residualLikelihood, residualConsequence, residualScore, treatment, treatmentPlan, controls, status, dueDate, reviewDate, linkedIncident, linkedAudit, tags, notes } = parsed.data;
    const data = await (prisma as any).riskRegister.create({ data: { title, description, category, source, owner, ownerName, department, likelihood, consequence, inherentScore, residualLikelihood, residualConsequence, residualScore, treatment, treatmentPlan, controls, status, dueDate, reviewDate, linkedIncident, linkedAudit, tags, notes, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } });
    res.status(201).json({ success: true, data });
  } catch (error: any) { logger.error('Failed to create risk', { error: error.message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateRiskSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).riskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    const { title, description, category, source, owner, ownerName, department, likelihood, consequence, inherentScore, residualLikelihood, residualConsequence, residualScore, treatment, treatmentPlan, controls, status, dueDate, reviewDate, linkedIncident, linkedAudit, tags, notes } = parsed.data;
    const data = await (prisma as any).riskRegister.update({ where: { id: req.params.id }, data: { title, description, category, source, owner, ownerName, department, likelihood, consequence, inherentScore, residualLikelihood, residualConsequence, residualScore, treatment, treatmentPlan, controls, status, dueDate, reviewDate, linkedIncident, linkedAudit, tags, notes, updatedBy: (req as any).user?.id } });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to update risk', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).riskRegister.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'risk not found' } });
    await (prisma as any).riskRegister.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } });
    res.json({ success: true, data: { message: 'risk deleted successfully' } });
  } catch (error: any) { logger.error('Failed to delete risk', { error: error.message }); res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); }
});

export default router;
