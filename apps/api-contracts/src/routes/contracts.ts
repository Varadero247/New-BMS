import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('contracts-contracts');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.enum(['SUPPLIER', 'CUSTOMER', 'SERVICE', 'NDA', 'LEASE', 'EMPLOYMENT', 'PARTNERSHIP', 'OTHER']).optional(),
  status: z.enum(['DRAFT', 'PENDING_APPROVAL', 'ACTIVE', 'EXPIRED', 'TERMINATED', 'RENEWED']).optional(),
  counterparty: z.string().optional(),
  counterpartyContact: z.string().optional(),
  value: z.number().optional(),
  currency: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  renewalDate: z.string().optional(),
  autoRenew: z.boolean().optional(),
  noticePeriodDays: z.number().int().optional(),
  paymentTerms: z.string().optional(),
  fileUrl: z.string().optional(),
  owner: z.string().optional(),
  ownerName: z.string().optional(),
  department: z.string().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await (prisma as any).contContract.count({ where: { orgId, referenceNumber: { startsWith: `CON-${y}` } } }); return `CON-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).contContract.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).contContract.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch contracts' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).contContract.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch contract' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { title, description, type, status, counterparty, counterpartyContact, value, currency, startDate, endDate, renewalDate, autoRenew, noticePeriodDays, paymentTerms, fileUrl, owner, ownerName, department, tags, notes } = parsed.data; const data = await (prisma as any).contContract.create({ data: { title, description, type, status, counterparty, counterpartyContact, value, currency, startDate, endDate, renewalDate, autoRenew, noticePeriodDays, paymentTerms, fileUrl, owner, ownerName, department, tags, notes, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).contContract.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } }); const { title, description, type, status, counterparty, counterpartyContact, value, currency, startDate, endDate, renewalDate, autoRenew, noticePeriodDays, paymentTerms, fileUrl, owner, ownerName, department, tags, notes } = parsed.data; const data = await (prisma as any).contContract.update({ where: { id: req.params.id }, data: { title, description, type, status, counterparty, counterpartyContact, value, currency, startDate, endDate, renewalDate, autoRenew, noticePeriodDays, paymentTerms, fileUrl, owner, ownerName, department, tags, notes, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).contContract.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'contract not found' } }); await (prisma as any).contContract.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'contract deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
