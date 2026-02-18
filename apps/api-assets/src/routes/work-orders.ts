import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('assets-work-orders');

const createSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  type: z.string().optional(),
  priority: z.enum(['EMERGENCY', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED']).optional(),
  assignee: z.string().optional(),
  assigneeName: z.string().optional(),
  scheduledDate: z.string().optional(),
  completedDate: z.string().optional(),
  estimatedHours: z.number().optional(),
  actualHours: z.number().optional(),
  cost: z.number().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.assetWorkOrder.count({ where: { orgId, referenceNumber: { startsWith: `AWO-${y}` } } }); return `AWO-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = ((parseInt(page, 10) || 1) - 1) * (parseInt(limit, 10) || 20); const [data, total] = await Promise.all([prisma.assetWorkOrder.findMany({ where, skip, take: Math.min(parseInt(limit, 10) || 20, 100), orderBy: { createdAt: 'desc' } }), prisma.assetWorkOrder.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page, 10) || 1, limit: parseInt(limit, 10) || 20, total, pages: Math.ceil(total / (parseInt(limit, 10) || 20)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch work orders' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const item = await prisma.assetWorkOrder.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'work order not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch work order' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { assetId, title, description, type, priority, status, assignee, assigneeName, scheduledDate, completedDate, estimatedHours, actualHours, cost, notes } = parsed.data; const data = await prisma.assetWorkOrder.create({ data: { assetId, title, description, type, priority, status, assignee, assigneeName, scheduledDate, completedDate, estimatedHours, actualHours, cost, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.assetWorkOrder.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'work order not found' } }); const { assetId, title, description, type, priority, status, assignee, assigneeName, scheduledDate, completedDate, estimatedHours, actualHours, cost, notes } = parsed.data; const data = await prisma.assetWorkOrder.update({ where: { id: req.params.id }, data: { assetId, title, description, type, priority, status, assignee, assigneeName, scheduledDate, completedDate, estimatedHours, actualHours, cost, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.assetWorkOrder.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'work order not found' } }); await prisma.assetWorkOrder.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'work order deleted successfully' } }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
export default router;
