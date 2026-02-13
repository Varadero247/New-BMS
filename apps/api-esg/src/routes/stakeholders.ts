import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-esg');
const router: Router = Router();
router.use(authenticate);

function generateReference(prefix: string): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const stakeholderCreateSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.enum(['INVESTOR', 'CUSTOMER', 'EMPLOYEE', 'REGULATOR', 'COMMUNITY', 'SUPPLIER', 'NGO']),
  contactEmail: z.string().email().max(200).optional().nullable(),
  engagementLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  lastEngagement: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

const stakeholderUpdateSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  type: z.enum(['INVESTOR', 'CUSTOMER', 'EMPLOYEE', 'REGULATOR', 'COMMUNITY', 'SUPPLIER', 'NGO']).optional(),
  contactEmail: z.string().email().max(200).optional().nullable(),
  engagementLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional(),
  lastEngagement: z.string().optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

// GET /api/stakeholders
router.get('/', async (req: Request, res: Response) => {
  try {
    const { type, engagementLevel, page = '1', limit = '20' } = req.query;
    const skip = (parseInt(page as string, 10) - 1) * parseInt(limit as string, 10);
    const take = parseInt(limit as string, 10);

    const where: any = { deletedAt: null };
    if (type) where.type = type as string;
    if (engagementLevel) where.engagementLevel = engagementLevel as string;

    const [data, total] = await Promise.all([
      prisma.esgStakeholder.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgStakeholder.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: parseInt(page as string, 10), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing stakeholders', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list stakeholders' } });
  }
});

// POST /api/stakeholders
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = stakeholderCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const stakeholder = await prisma.esgStakeholder.create({
      data: {
        name: data.name,
        type: data.type,
        contactEmail: data.contactEmail || null,
        engagementLevel: data.engagementLevel || 'MEDIUM',
        lastEngagement: data.lastEngagement ? new Date(data.lastEngagement) : null,
        notes: data.notes || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: stakeholder });
  } catch (error: unknown) {
    logger.error('Error creating stakeholder', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create stakeholder' } });
  }
});

// GET /api/stakeholders/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const stakeholder = await prisma.esgStakeholder.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!stakeholder) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder not found' } });
    }
    res.json({ success: true, data: stakeholder });
  } catch (error: unknown) {
    logger.error('Error fetching stakeholder', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stakeholder' } });
  }
});

// PUT /api/stakeholders/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = stakeholderUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgStakeholder.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder not found' } });
    }

    const updateData: any = { ...parsed.data };
    if (updateData.lastEngagement !== undefined) updateData.lastEngagement = updateData.lastEngagement ? new Date(updateData.lastEngagement) : null;

    const stakeholder = await prisma.esgStakeholder.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: stakeholder });
  } catch (error: unknown) {
    logger.error('Error updating stakeholder', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update stakeholder' } });
  }
});

// DELETE /api/stakeholders/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgStakeholder.findFirst({ where: { id: req.params.id, deletedAt: null } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Stakeholder not found' } });
    }

    await prisma.esgStakeholder.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Stakeholder deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting stakeholder', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete stakeholder' } });
  }
});

export default router;
