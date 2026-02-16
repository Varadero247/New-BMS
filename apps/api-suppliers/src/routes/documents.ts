import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('suppliers-documents');

const createSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  type: z.enum(['CERTIFICATE', 'LICENSE', 'INSURANCE', 'AUDIT_REPORT', 'QUALITY_MANUAL', 'OTHER']).optional(),
  title: z.string().min(1, 'Title is required'),
  fileUrl: z.string().optional(),
  expiryDate: z.string().datetime().optional().or(z.null()),
  isVerified: z.boolean().optional(),
  verifiedBy: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await (prisma as any).suppDocument.count({ where: { orgId, referenceNumber: { startsWith: `SDC-${y}` } } }); return `SDC-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).suppDocument.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).suppDocument.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch documents' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).suppDocument.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch document' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const { supplierId, type, title, fileUrl, expiryDate, isVerified, verifiedBy, notes } = parsed.data; const data = await (prisma as any).suppDocument.create({ data: { supplierId, type, title, fileUrl, expiryDate, isVerified, verifiedBy, notes, orgId, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).suppDocument.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); const { supplierId, type, title, fileUrl, expiryDate, isVerified, verifiedBy, notes } = parsed.data; const data = await (prisma as any).suppDocument.update({ where: { id: req.params.id }, data: { supplierId, type, title, fileUrl, expiryDate, isVerified, verifiedBy, notes, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).suppDocument.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); await (prisma as any).suppDocument.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'document deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
