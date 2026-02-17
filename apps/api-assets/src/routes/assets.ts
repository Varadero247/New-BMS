import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { z } from 'zod';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('assets-assets');

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  assetTag: z.string().optional(),
  serialNumber: z.string().optional(),
  category: z.string().optional(),
  location: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['ACTIVE', 'IN_SERVICE', 'OUT_OF_SERVICE', 'MAINTENANCE', 'DECOMMISSIONED', 'DISPOSED']).optional(),
  condition: z.enum(['EXCELLENT', 'GOOD', 'FAIR', 'POOR', 'CRITICAL']).optional(),
  manufacturer: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchaseCost: z.number().optional(),
  currentValue: z.number().optional(),
  warrantyExpiry: z.string().optional(),
  assignedTo: z.string().optional(),
  parentAssetId: z.string().optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.assetRegister.count({ where: { orgId, referenceNumber: { startsWith: `AST-${y}` } } }); return `AST-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as AuthRequest).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (parseInt(page) - 1) * parseInt(limit); const [data, total] = await Promise.all([prisma.assetRegister.findMany({ where, skip, take: parseInt(limit), orderBy: { createdAt: 'desc' } }), prisma.assetRegister.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch assets' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const item = await prisma.assetRegister.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'asset not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'FETCH_ERROR', message: 'Failed to fetch asset' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as AuthRequest).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { name, description, assetTag, serialNumber, category, location, department, status, condition, manufacturer, model, purchaseDate, purchaseCost, currentValue, warrantyExpiry, assignedTo, parentAssetId, notes } = parsed.data; const data = await prisma.assetRegister.create({ data: { name, description, assetTag, serialNumber, category, location, department, status, condition, manufacturer, model, purchaseDate, purchaseCost, currentValue, warrantyExpiry, assignedTo, parentAssetId, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { res.status(400).json({ success: false, error: { code: 'CREATE_ERROR', message: (error as Error).message } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const existing = await prisma.assetRegister.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'asset not found' } }); const { name, description, assetTag, serialNumber, category, location, department, status, condition, manufacturer, model, purchaseDate, purchaseCost, currentValue, warrantyExpiry, assignedTo, parentAssetId, notes } = parsed.data; const data = await prisma.assetRegister.update({ where: { id: req.params.id }, data: { name, description, assetTag, serialNumber, category, location, department, status, condition, manufacturer, model, purchaseDate, purchaseCost, currentValue, warrantyExpiry, assignedTo, parentAssetId, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'UPDATE_ERROR', message: (error as Error).message } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const existing = await prisma.assetRegister.findFirst({ where: { id: req.params.id, deletedAt: null } }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'asset not found' } }); await prisma.assetRegister.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'asset deleted successfully' } }); } catch (error: unknown) { res.status(500).json({ success: false, error: { code: 'DELETE_ERROR', message: (error as Error).message } }); } });
export default router;
