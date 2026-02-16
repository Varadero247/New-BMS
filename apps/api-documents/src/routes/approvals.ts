import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('documents-approvals');

const createSchema = z.object({
  documentId: z.string().min(1, 'Document ID is required'),
  approver: z.string().min(1, 'Approver is required'),
  approverName: z.string().optional(),
  status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  comments: z.string().optional(),
  decidedAt: z.string().datetime().optional().or(z.null()),
});
const updateSchema = createSchema.partial();

router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).docApproval.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).docApproval.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch approvals' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).docApproval.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'approval not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch approval' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const { documentId, approver, approverName, status, comments, decidedAt } = parsed.data; const data = await (prisma as any).docApproval.create({ data: { documentId, approver, approverName, status, comments, decidedAt, orgId, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).docApproval.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'approval not found' } }); const { documentId, approver, approverName, status, comments, decidedAt } = parsed.data; const data = await (prisma as any).docApproval.update({ where: { id: req.params.id }, data: { documentId, approver, approverName, status, comments, decidedAt, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).docApproval.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'approval not found' } }); await (prisma as any).docApproval.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'approval deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
