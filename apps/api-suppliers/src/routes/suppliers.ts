import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('suppliers-suppliers');

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  tradingName: z.string().optional(),
  registrationNo: z.string().optional(),
  vatNumber: z.string().optional(),
  status: z.enum(['PROSPECTIVE', 'APPROVED', 'CONDITIONAL', 'SUSPENDED', 'BLACKLISTED', 'INACTIVE']).optional(),
  tier: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
  category: z.string().optional(),
  primaryContact: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  website: z.string().optional(),
  addressLine1: z.string().optional(),
  city: z.string().optional(),
  postcode: z.string().optional(),
  country: z.string().optional(),
  notes: z.string().optional(),
  approvedDate: z.string().datetime().optional().or(z.null()),
  reviewDate: z.string().datetime().optional().or(z.null()),
  annualSpend: z.number().optional(),
  paymentTerms: z.string().optional(),
  tags: z.array(z.string()).optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.suppSupplier.count({ where: { orgId, referenceNumber: { startsWith: `SUP-${y}` } } }); return `SUP-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.OR = [{ name: { contains: search, mode: 'insensitive' } }, { referenceNumber: { contains: search, mode: 'insensitive' } }]; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.suppSupplier.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.suppSupplier.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch suppliers' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const item = await prisma.suppSupplier.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch supplier' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { name, tradingName, registrationNo, vatNumber, status, tier, category, primaryContact, email, phone, website, addressLine1, city, postcode, country, notes, approvedDate, reviewDate, annualSpend, paymentTerms, tags } = parsed.data; const data = await prisma.suppSupplier.create({ data: { name, tradingName, registrationNo, vatNumber, status, tier, category, primaryContact, email, phone, website, addressLine1, city, postcode, country, notes, approvedDate, reviewDate, annualSpend, paymentTerms, tags, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: 'Internal server error' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.suppSupplier.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } }); const { name, tradingName, registrationNo, vatNumber, status, tier, category, primaryContact, email, phone, website, addressLine1, city, postcode, country, notes, approvedDate, reviewDate, annualSpend, paymentTerms, tags } = parsed.data; const data = await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { name, tradingName, registrationNo, vatNumber, status, tier, category, primaryContact, email, phone, website, addressLine1, city, postcode, country, notes, approvedDate, reviewDate, annualSpend, paymentTerms, tags, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.suppSupplier.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'supplier not found' } }); await prisma.suppSupplier.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'supplier deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
export default router;
