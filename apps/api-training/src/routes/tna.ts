import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('training-tna');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  department: z.string().optional(),
  role: z.string().optional(),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  identifiedGap: z.string().optional(),
  recommendedTraining: z.string().optional(),
  targetDate: z.string().datetime().optional().or(z.null()),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  budget: z.number().optional(),
  approvedBy: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.trainTNA.count({ where: { orgId, referenceNumber: { startsWith: `TNA-${y}` } } }); return `TNA-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.trainTNA.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.trainTNA.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch TNAs' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const item = await prisma.trainTNA.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TNA not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch TNA' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { title, department, role, priority, identifiedGap, recommendedTraining, targetDate, status, assignee, assigneeName, budget, approvedBy, notes } = parsed.data; const data = await prisma.trainTNA.create({ data: { title, department, role, priority, identifiedGap, recommendedTraining, targetDate, status, assignee, assigneeName, budget, approvedBy, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.trainTNA.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TNA not found' } }); const { title, department, role, priority, identifiedGap, recommendedTraining, targetDate, status, assignee, assigneeName, budget, approvedBy, notes } = parsed.data; const data = await prisma.trainTNA.update({ where: { id: req.params.id }, data: { title, department, role, priority, identifiedGap, recommendedTraining, targetDate, status, assignee, assigneeName, budget, approvedBy, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.trainTNA.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'TNA not found' } }); await prisma.trainTNA.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'TNA deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
export default router;
