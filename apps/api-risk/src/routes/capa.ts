import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('risk-capa');

const createCapaSchema = z.object({
  riskId: z.string().optional(),
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  type: z.enum(['CORRECTIVE', 'PREVENTIVE']),
  source: z.enum(['AUDIT', 'INCIDENT', 'COMPLAINT', 'RISK_ASSESSMENT', 'MANAGEMENT_REVIEW', 'REGULATORY', 'CUSTOMER_FEEDBACK', 'INTERNAL_REVIEW']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'VERIFICATION', 'CLOSED', 'OVERDUE']).optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  rootCause: z.string().optional(),
  actionPlan: z.string().optional(),
  verificationMethod: z.string().optional(),
  verificationResult: z.string().optional(),
  dueDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  completedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  verifiedDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  verifiedBy: z.string().optional(),
  effectivenessCheck: z.boolean().optional(),
  effectivenessDate: z.string().datetime({ offset: true }).optional().or(z.string().datetime().optional()),
  effectivenessResult: z.string().optional(),
  linkedIncident: z.string().optional(),
  linkedAudit: z.string().optional(),
  notes: z.string().optional(),
});

const updateCapaSchema = createCapaSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const year = new Date().getFullYear();
  const count = await (prisma as any).riskCapa.count({ where: { orgId, referenceNumber: { startsWith: `CAPA-${year}` } } });
  return `CAPA-${year}-${String(count + 1).padStart(4, '0')}`;
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
      (prisma as any).riskCapa.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).riskCapa.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) { logger.error('Failed to fetch CAPAs', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch CAPAs' } }); }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).riskCapa.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) { logger.error('Failed to fetch CAPA', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch CAPA' } }); }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createCapaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { riskId, title, description, type, source, priority, status, assignee, assigneeName, rootCause, actionPlan, verificationMethod, verificationResult, dueDate, completedDate, verifiedDate, verifiedBy, effectivenessCheck, effectivenessDate, effectivenessResult, linkedIncident, linkedAudit, notes } = parsed.data;
    const data = await (prisma as any).riskCapa.create({ data: { riskId, title, description, type, source, priority, status, assignee, assigneeName, rootCause, actionPlan, verificationMethod, verificationResult, dueDate, completedDate, verifiedDate, verifiedBy, effectivenessCheck, effectivenessDate, effectivenessResult, linkedIncident, linkedAudit, notes, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } });
    res.status(201).json({ success: true, data });
  } catch (error: any) { logger.error('Failed to create CAPA', { error: error.message }); res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateCapaSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const existing = await (prisma as any).riskCapa.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    const { riskId, title, description, type, source, priority, status, assignee, assigneeName, rootCause, actionPlan, verificationMethod, verificationResult, dueDate, completedDate, verifiedDate, verifiedBy, effectivenessCheck, effectivenessDate, effectivenessResult, linkedIncident, linkedAudit, notes } = parsed.data;
    const data = await (prisma as any).riskCapa.update({ where: { id: req.params.id }, data: { riskId, title, description, type, source, priority, status, assignee, assigneeName, rootCause, actionPlan, verificationMethod, verificationResult, dueDate, completedDate, verifiedDate, verifiedBy, effectivenessCheck, effectivenessDate, effectivenessResult, linkedIncident, linkedAudit, notes, updatedBy: (req as any).user?.id } });
    res.json({ success: true, data });
  } catch (error: any) { logger.error('Failed to update CAPA', { error: error.message }); res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).riskCapa.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    await (prisma as any).riskCapa.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } });
    res.json({ success: true, data: { message: 'CAPA deleted successfully' } });
  } catch (error: any) { logger.error('Failed to delete CAPA', { error: error.message }); res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); }
});

export default router;
