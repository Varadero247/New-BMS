import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('finance-controls');

const createControlSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  controlType: z.string().optional(),
  riskArea: z.string().optional(),
  owner: z.string().optional(),
  ownerName: z.string().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW', 'REMEDIATION']).optional(),
  frequency: z.string().optional(),
  lastTestedDate: z.string().datetime().optional().nullable(),
  nextTestDate: z.string().datetime().optional().nullable(),
  testResult: z.string().optional(),
  evidence: z.string().optional(),
  notes: z.string().optional(),
});

const updateControlSchema = createControlSchema.partial();
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20); const [data, total] = await Promise.all([prisma.finControl.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }), prisma.finControl.count({ where })]); res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } }); } catch (error: unknown) { logger.error('Failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch controls' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await prisma.finControl.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createControlSchema.safeParse(req.body); if (!parsed.success) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); } const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const y = new Date().getFullYear(); const c = await prisma.finControl.count({ where: { orgId } }); const { title, description, controlType, riskArea, owner, ownerName, status, frequency, lastTestedDate, nextTestDate, testResult, evidence, notes } = parsed.data; const data = await prisma.finControl.create({ data: { title, description, controlType, riskArea, owner, ownerName, status, frequency, lastTestedDate, nextTestDate, testResult, evidence, notes, orgId, referenceNumber: `FCR-${y}-${String(c+1).padStart(4,'0')}`, createdBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to create', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateControlSchema.safeParse(req.body); if (!parsed.success) { return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); } const existing = await prisma.finControl.findFirst({ where: { id: req.params.id, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Not found' } }); const data = await prisma.finControl.update({ where: { id: req.params.id }, data: { ...parsed.data, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { await prisma.finControl.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } }); res.json({ success: true, data: { message: 'Deleted' } }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete resource' } }); } });
export default router;
