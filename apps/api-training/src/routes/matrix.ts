import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('training-matrix');

const createSchema = z.object({
  competencyId: z.string().min(1, 'Competency ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().optional(),
  currentLevel: z.enum(['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED']).optional(),
  targetLevel: z.enum(['NOT_STARTED', 'DEVELOPING', 'COMPETENT', 'EXPERT', 'EXPIRED']).optional(),
  assessedDate: z.string().datetime().optional().or(z.null()),
  assessedBy: z.string().optional(),
  nextReviewDate: z.string().datetime().optional().or(z.null()),
  gap: z.boolean().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.trainMatrix.count({ where: { orgId, referenceNumber: { startsWith: `MTX-${y}` } } }); return `MTX-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as AuthRequest).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.trainMatrix.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.trainMatrix.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch matrix entrys' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await prisma.trainMatrix.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch matrix entry' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as AuthRequest).user?.orgId || 'default'; const { competencyId, employeeId, employeeName, currentLevel, targetLevel, assessedDate, assessedBy, nextReviewDate, gap, notes } = parsed.data; const data = await prisma.trainMatrix.create({ data: { competencyId, employeeId, employeeName, currentLevel, targetLevel, assessedDate, assessedBy, nextReviewDate, gap, notes, orgId, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await prisma.trainMatrix.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } }); const { competencyId, employeeId, employeeName, currentLevel, targetLevel, assessedDate, assessedBy, nextReviewDate, gap, notes } = parsed.data; const data = await prisma.trainMatrix.update({ where: { id: req.params.id }, data: { competencyId, employeeId, employeeName, currentLevel, targetLevel, assessedDate, assessedBy, nextReviewDate, gap, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await prisma.trainMatrix.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'matrix entry not found' } }); await prisma.trainMatrix.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'matrix entry deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: (error as Error).message } }); } });
export default router;
