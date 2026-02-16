import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('contracts-clauses');

const createSchema = z.object({
  contractId: z.string().min(1, 'Contract ID is required'),
  title: z.string().min(1, 'Title is required'),
  content: z.string().optional(),
  clauseNumber: z.string().optional(),
  category: z.string().optional(),
  isKey: z.boolean().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await (prisma as any).contClause.count({ where: { orgId, referenceNumber: { startsWith: `CCL-${y}` } } }); return `CCL-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).contClause.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).contClause.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch clauses' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).contClause.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'clause not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch clause' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { contractId, title, content, clauseNumber, category, isKey } = parsed.data; const data = await (prisma as any).contClause.create({ data: { contractId, title, content, clauseNumber, category, isKey, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).contClause.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'clause not found' } }); const { contractId, title, content, clauseNumber, category, isKey } = parsed.data; const data = await (prisma as any).contClause.update({ where: { id: req.params.id }, data: { contractId, title, content, clauseNumber, category, isKey, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).contClause.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'clause not found' } }); await (prisma as any).contClause.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'clause deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
