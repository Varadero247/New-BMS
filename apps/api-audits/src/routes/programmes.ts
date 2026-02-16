import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('audits-programmes');

const programmeCreateSchema = z.object({
  title: z.string().min(1, 'title is required'),
  year: z.number({ required_error: 'year is required' }),
  description: z.string().optional(),
  status: z.string().optional(),
  auditIds: z.array(z.string()).optional(),
});

const programmeUpdateSchema = programmeCreateSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await (prisma as any).audProgramme.count({
    where: { orgId, referenceNumber: { startsWith: `APR-${y}` } },
  });
  return `APR-${y}-${String(c + 1).padStart(4, '0')}`;
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
      (prisma as any).audProgramme.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }),
      (prisma as any).audProgramme.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error: any) {
    logger.error('Fetch failed', { error: error.message });
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch programmes' } });
  }
});

router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const item = await (prisma as any).audProgramme.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'programme not found' } });
    res.json({ success: true, data: item });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch programme' } });
  }
});

router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = programmeCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = (req as any).user?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const data = await (prisma as any).audProgramme.create({
      data: {
        ...parsed.data,
        orgId,
        referenceNumber,
        createdBy: (req as any).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: any) {
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: error.message } });
  }
});

router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = programmeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const existing = await (prisma as any).audProgramme.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'programme not found' } });
    const data = await (prisma as any).audProgramme.update({
      where: { id: req.params.id },
      data: { ...parsed.data },
    });
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: error.message } });
  }
});

router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const existing = await (prisma as any).audProgramme.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'programme not found' } });
    await (prisma as any).audProgramme.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });
    res.json({ success: true, data: { message: 'programme deleted successfully' } });
  } catch (error: any) {
    res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: error.message } });
  }
});

export default router;
