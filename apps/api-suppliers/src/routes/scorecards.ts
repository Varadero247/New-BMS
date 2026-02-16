import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('suppliers-scorecards');

const createSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  period: z.string().optional(),
  quality: z.number().int().min(0).max(100).optional(),
  delivery: z.number().int().min(0).max(100).optional(),
  cost: z.number().int().min(0).max(100).optional(),
  responsiveness: z.number().int().min(0).max(100).optional(),
  compliance: z.number().int().min(0).max(100).optional(),
  overallScore: z.number().optional(),
  status: z.enum(['DRAFT', 'IN_REVIEW', 'COMPLETED']).optional(),
  assessor: z.string().optional(),
  comments: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await (prisma as any).suppScorecard.count({ where: { orgId, referenceNumber: { startsWith: `SSC-${y}` } } }); return `SSC-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).suppScorecard.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).suppScorecard.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch scorecards' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).suppScorecard.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'scorecard not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch scorecard' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { supplierId, period, quality, delivery, cost, responsiveness, compliance, overallScore, status, assessor, comments } = parsed.data; const data = await (prisma as any).suppScorecard.create({ data: { supplierId, period, quality, delivery, cost, responsiveness, compliance, overallScore, status, assessor, comments, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).suppScorecard.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'scorecard not found' } }); const { supplierId, period, quality, delivery, cost, responsiveness, compliance, overallScore, status, assessor, comments } = parsed.data; const data = await (prisma as any).suppScorecard.update({ where: { id: req.params.id }, data: { supplierId, period, quality, delivery, cost, responsiveness, compliance, overallScore, status, assessor, comments, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).suppScorecard.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'scorecard not found' } }); await (prisma as any).suppScorecard.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'scorecard deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
