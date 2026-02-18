import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('complaints-complaints');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  channel: z.enum(['EMAIL', 'PHONE', 'WEB_FORM', 'SOCIAL_MEDIA', 'IN_PERSON', 'LETTER']).optional(),
  category: z.enum(['PRODUCT', 'SERVICE', 'DELIVERY', 'BILLING', 'SAFETY', 'ENVIRONMENTAL', 'REGULATORY', 'OTHER']).optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['NEW', 'ACKNOWLEDGED', 'INVESTIGATING', 'RESOLVED', 'CLOSED', 'ESCALATED']).optional(),
  complainantName: z.string().optional(),
  complainantEmail: z.string().optional(),
  complainantPhone: z.string().optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  department: z.string().optional(),
  productRef: z.string().optional(),
  orderRef: z.string().optional(),
  isRegulatory: z.boolean().optional(),
  regulatoryBody: z.string().optional(),
  slaDeadline: z.string().optional(),
  acknowledgedAt: z.string().optional(),
  resolvedAt: z.string().optional(),
  closedAt: z.string().optional(),
  rootCause: z.string().optional(),
  resolution: z.string().optional(),
  preventiveAction: z.string().optional(),
  customerSatisfied: z.boolean().optional(),
  linkedCapaId: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.compComplaint.count({ where: { orgId, referenceNumber: { startsWith: `CMP-${y}` } } }); return `CMP-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.compComplaint.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.compComplaint.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch complaints' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const item = await prisma.compComplaint.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'complaint not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch complaint' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { title, description, channel, category, priority, status, complainantName, complainantEmail, complainantPhone, assignee, assigneeName, department, productRef, orderRef, isRegulatory, regulatoryBody, slaDeadline, acknowledgedAt, resolvedAt, closedAt, rootCause, resolution, preventiveAction, customerSatisfied, linkedCapaId, notes } = parsed.data; const data = await prisma.compComplaint.create({ data: { title, description, channel, category, priority, status, complainantName, complainantEmail, complainantPhone, assignee, assigneeName, department, productRef, orderRef, isRegulatory, regulatoryBody, slaDeadline, acknowledgedAt, resolvedAt, closedAt, rootCause, resolution, preventiveAction, customerSatisfied, linkedCapaId, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Internal server error' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const existing = await prisma.compComplaint.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'complaint not found' } }); const { title, description, channel, category, priority, status, complainantName, complainantEmail, complainantPhone, assignee, assigneeName, department, productRef, orderRef, isRegulatory, regulatoryBody, slaDeadline, acknowledgedAt, resolvedAt, closedAt, rootCause, resolution, preventiveAction, customerSatisfied, linkedCapaId, notes } = parsed.data; const data = await prisma.compComplaint.update({ where: { id: req.params.id }, data: { title, description, channel, category, priority, status, complainantName, complainantEmail, complainantPhone, assignee, assigneeName, department, productRef, orderRef, isRegulatory, regulatoryBody, slaDeadline, acknowledgedAt, resolvedAt, closedAt, rootCause, resolution, preventiveAction, customerSatisfied, linkedCapaId, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const existing = await prisma.compComplaint.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'complaint not found' } }); await prisma.compComplaint.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'complaint deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: 'Internal server error' } }); } });
export default router;
