import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('training-records');

const createSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeName: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED']).optional(),
  scheduledDate: z.string().datetime().optional().or(z.null()),
  completedDate: z.string().datetime().optional().or(z.null()),
  expiryDate: z.string().datetime().optional().or(z.null()),
  score: z.number().optional(),
  passed: z.boolean().optional(),
  trainer: z.string().optional(),
  trainerName: z.string().optional(),
  location: z.string().optional(),
  certificateUrl: z.string().optional(),
  feedback: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.trainRecord.count({ where: { orgId, referenceNumber: { startsWith: `TRN-${y}` } } }); return `TRN-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.trainRecord.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.trainRecord.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch records' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await prisma.trainRecord.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'record not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch record' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { courseId, employeeId, employeeName, status, scheduledDate, completedDate, expiryDate, score, passed, trainer, trainerName, location, certificateUrl, feedback, notes } = parsed.data; const data = await prisma.trainRecord.create({ data: { courseId, employeeId, employeeName, status, scheduledDate, completedDate, expiryDate, score, passed, trainer, trainerName, location, certificateUrl, feedback, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await prisma.trainRecord.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'record not found' } }); const { courseId, employeeId, employeeName, status, scheduledDate, completedDate, expiryDate, score, passed, trainer, trainerName, location, certificateUrl, feedback, notes } = parsed.data; const data = await prisma.trainRecord.update({ where: { id: req.params.id }, data: { courseId, employeeId, employeeName, status, scheduledDate, completedDate, expiryDate, score, passed, trainer, trainerName, location, certificateUrl, feedback, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await prisma.trainRecord.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'record not found' } }); await prisma.trainRecord.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'record deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: (error as Error).message } }); } });
export default router;
