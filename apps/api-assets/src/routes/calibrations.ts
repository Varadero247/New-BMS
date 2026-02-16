import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('assets-calibrations');

const createSchema = z.object({
  assetId: z.string().min(1, 'Asset ID is required'),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'OVERDUE']).optional(),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  completedDate: z.string().optional(),
  nextDueDate: z.string().optional(),
  technician: z.string().optional(),
  standard: z.string().optional(),
  result: z.string().optional(),
  certificate: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await (prisma as any).assetCalibration.count({ where: { orgId, referenceNumber: { startsWith: `ACL-${y}` } } }); return `ACL-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: any = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([(prisma as any).assetCalibration.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), (prisma as any).assetCalibration.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: any) { logger.error('Failed to fetch', { error: error.message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch calibrations' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await (prisma as any).assetCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'calibration not found' } }); res.json({ success: true, data: item }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch calibration' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { assetId, status, scheduledDate, completedDate, nextDueDate, technician, standard, result, certificate, notes } = parsed.data; const data = await (prisma as any).assetCalibration.create({ data: { assetId, status, scheduledDate, completedDate, nextDueDate, technician, standard, result, certificate, notes, orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: any) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await (prisma as any).assetCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'calibration not found' } }); const { assetId, status, scheduledDate, completedDate, nextDueDate, technician, standard, result, certificate, notes } = parsed.data; const data = await (prisma as any).assetCalibration.update({ where: { id: req.params.id }, data: { assetId, status, scheduledDate, completedDate, nextDueDate, technician, standard, result, certificate, notes, updatedBy: (req as any).user?.id } }); res.json({ success: true, data }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await (prisma as any).assetCalibration.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'calibration not found' } }); await (prisma as any).assetCalibration.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } }); res.json({ success: true, data: { message: 'calibration deleted successfully' } }); } catch (error: any) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } }); } });
export default router;
