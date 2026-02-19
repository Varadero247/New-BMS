import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('suppliers-suppliers');

const createSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  tradingName: z.string().trim().optional(),
  registrationNo: z.string().trim().optional(),
  vatNumber: z.string().trim().optional(),
  status: z
    .enum(['PROSPECTIVE', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'BLACKLISTED', 'INACTIVE'])
    .optional(),
  tier: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  category: z.string().trim().optional(),
  primaryContact: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  website: z.string().trim().url('Invalid URL').optional(),
  addressLine1: z.string().trim().optional(),
  city: z.string().trim().optional(),
  postcode: z.string().trim().optional(),
  country: z.string().trim().optional(),
  notes: z.string().trim().optional(),
  approvedDate: z.string().trim().datetime({ offset: true }).optional().or(z.null()),
  reviewDate: z.string().trim().datetime({ offset: true }).optional().or(z.null()),
  annualSpend: z.number().optional(),
  paymentTerms: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> {
  const y = new Date().getFullYear();
  const c = await prisma.suppSupplier.count({
    where: { orgId, referenceNumber: { startsWith: `SUP-${y}` } },
  });
  return `SUP-${y}-${String(c + 1).padStart(4, '0')}`;
}
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>;
    const where: Record<string, unknown> = { orgId, deletedAt: null };
    if (status) where.status = status;
    if (search)
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { referenceNumber: { contains: search, mode: 'insensitive' } },
      ];
    const skip =
      (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20);
    const [data, total] = await Promise.all([
      prisma.suppSupplier.findMany({
        where,
        skip,
        take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.suppSupplier.count({ where }),
    ]);
    res.json({
      success: true,
      data,
      pagination: {
        page: Math.max(1, parseInt(page, 10) || 1),
        limit: Math.max(1, parseInt(limit, 10) || 20),
        total,
        totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to fetch', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch suppliers' },
    });
  }
});
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const item = await prisma.suppSupplier.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!item)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } });
    res.json({ success: true, data: item });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch supplier' },
    });
  }
});
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const referenceNumber = await generateRef(orgId);
    const {
      name,
      tradingName,
      registrationNo,
      vatNumber,
      status,
      tier,
      category,
      primaryContact,
      email,
      phone,
      website,
      addressLine1,
      city,
      postcode,
      country,
      notes,
      approvedDate,
      reviewDate,
      annualSpend,
      paymentTerms,
      tags,
    } = parsed.data;
    const data = await prisma.suppSupplier.create({
      data: {
        name,
        tradingName,
        registrationNo,
        vatNumber,
        status,
        tier,
        category,
        primaryContact,
        email,
        phone,
        website,
        addressLine1,
        city,
        postcode,
        country,
        notes,
        approvedDate,
        reviewDate,
        annualSpend,
        paymentTerms,
        tags,
        orgId,
        referenceNumber,
        createdBy: (req as AuthRequest).user?.id,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to create', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success)
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.suppSupplier.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } });
    const {
      name,
      tradingName,
      registrationNo,
      vatNumber,
      status,
      tier,
      category,
      primaryContact,
      email,
      phone,
      website,
      addressLine1,
      city,
      postcode,
      country,
      notes,
      approvedDate,
      reviewDate,
      annualSpend,
      paymentTerms,
      tags,
    } = parsed.data;
    const data = await prisma.suppSupplier.update({
      where: { id: req.params.id },
      data: {
        name,
        tradingName,
        registrationNo,
        vatNumber,
        status,
        tier,
        category,
        primaryContact,
        email,
        phone,
        website,
        addressLine1,
        city,
        postcode,
        country,
        notes,
        approvedDate,
        reviewDate,
        annualSpend,
        paymentTerms,
        tags,
        updatedBy: (req as AuthRequest).user?.id,
      },
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const existing = await prisma.suppSupplier.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!existing)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } });
    await prisma.suppSupplier.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id },
    });
    res.json({ success: true, data: { message: 'supplier deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Failed to process request', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  }
});
export default router;
