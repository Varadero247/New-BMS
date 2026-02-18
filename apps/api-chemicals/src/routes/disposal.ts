import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const router = Router();
const logger = createLogger('chem-disposal');

const createDisposalSchema = z.object({
  chemicalId: z.string().min(1),
  quantityDisposed: z.number().min(0),
  unit: z.string().min(1),
  disposalDate: z.string().datetime({ offset: true }).or(z.string().datetime()),
  disposalMethod: z.string().min(1, 'disposalMethod is required'),
  wasteContractorName: z.string().optional(),
  consignmentNoteRef: z.string().optional(),
  ewcCode: z.string().optional(),
  collectionSite: z.string().optional(),
  disposalFacility: z.string().optional(),
  certificateRef: z.string().optional(),
  approvedBy: z.string().optional(),
});

const updateDisposalSchema = createDisposalSchema.partial();

// GET /api/disposal — all disposal records
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const { chemicalId, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { chemical: { orgId, deletedAt: null } };
    if (chemicalId) where.chemicalId = chemicalId as any;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [data, total] = await Promise.all([
      prisma.chemDisposal.findMany({
        where, skip, take: Math.min(parseInt(limit, 10) || 20, 100),
        orderBy: { disposalDate: 'desc' },
        include: { chemical: { select: { id: true, productName: true, casNumber: true, wasteClassification: true } } },
      }),
      prisma.chemDisposal.count({ where }),
    ]);
    res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error: unknown) {
    logger.error('Failed to fetch disposal records', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch disposal records' } });
  }
});

// POST /api/disposal — create disposal record
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createDisposalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const d = parsed.data;
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const chemical = await prisma.chemRegister.findFirst({ where: { id: d.chemicalId, orgId, deletedAt: null } as any });
    if (!chemical) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Chemical not found' } });
    const data = await prisma.chemDisposal.create({
      data: { ...d, disposedBy: (req as AuthRequest).user?.id, createdBy: (req as AuthRequest).user?.id },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create disposal record', { error: (error as Error).message });
    res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Failed to create resource' } });
  }
});

// PUT /api/disposal/:id — update disposal record
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateDisposalSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } });
    const orgId = ((req as AuthRequest).user as any)?.orgId || 'default';
    const existing = await prisma.chemDisposal.findFirst({ where: { id: req.params.id, chemical: { orgId, deletedAt: null } } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Disposal record not found' } });
    const data = await prisma.chemDisposal.update({ where: { id: req.params.id }, data: parsed.data });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to update disposal record', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update resource' } });
  }
});

export default router;
