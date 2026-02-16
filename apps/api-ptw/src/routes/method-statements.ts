import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('ptw-method-statements');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  permitId: z.string().optional(),
  steps: z.string().optional(),
  hazards: z.string().optional(),
  controls: z.string().optional(),
  ppe: z.string().optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.string().optional(),
  version: z.number().int().optional(),
});

const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await (prisma as any).ptwMethodStatement.count({ where: { orgId, referenceNumber: { startsWith: `PMS-${y}` } } });
  return `PMS-${y}-${String(c + 1).padStart(4, '0')}`;
}

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: any = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search) where.title = { contains: search, mode: 'insensitive' };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      (prisma as any).ptwMethodStatement.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).ptwMethodStatement.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: any) {
    logger.error('Fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch method statements' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).ptwMethodStatement.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'method statement not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch method statement' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const { title, permitId, steps, hazards, controls, ppe, approvedBy, approvedAt, version } = parsed.data;
    const data = await (prisma as any).ptwMethodStatement.create({
      data: {
        title, permitId, steps, hazards, controls, ppe, approvedBy,
        approvedAt: approvedAt ? new Date(approvedAt) : undefined,
        version,
        orgId, referenceNumber, createdBy: (req as any).user?.id, updatedBy: (req as any).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).ptwMethodStatement.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'method statement not found' } });
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    }
    const { title, permitId, steps, hazards, controls, ppe, approvedBy, approvedAt, version } = parsed.data;
    const updateData: any = { updatedBy: (req as any).user?.id };
    if (title !== undefined) updateData.title = title;
    if (permitId !== undefined) updateData.permitId = permitId;
    if (steps !== undefined) updateData.steps = steps;
    if (hazards !== undefined) updateData.hazards = hazards;
    if (controls !== undefined) updateData.controls = controls;
    if (ppe !== undefined) updateData.ppe = ppe;
    if (approvedBy !== undefined) updateData.approvedBy = approvedBy;
    if (approvedAt !== undefined) updateData.approvedAt = new Date(approvedAt);
    if (version !== undefined) updateData.version = version;
    const data = await (prisma as any).ptwMethodStatement.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).ptwMethodStatement.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'method statement not found' } });
    await (prisma as any).ptwMethodStatement.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as any).user?.id } });
    res.json({ success: true, data: { message: 'method statement deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

export default router;
