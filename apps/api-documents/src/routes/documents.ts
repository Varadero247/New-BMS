import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('documents-documents');

const createSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  category: z.string().optional(),
  department: z.string().optional(),
  status: z.enum(['DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED', 'OBSOLETE']).optional(),
  currentVersion: z.number().int().optional(),
  fileUrl: z.string().optional(),
  fileSize: z.number().int().optional(),
  mimeType: z.string().optional(),
  owner: z.string().optional(),
  ownerName: z.string().optional(),
  reviewDate: z.string().datetime().optional().or(z.null()),
  retentionDate: z.string().datetime().optional().or(z.null()),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});
const updateSchema = createSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.docDocument.count({ where: { orgId, referenceNumber: { startsWith: `DOC-${y}` } } }); return `DOC-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20); const [data, total] = await Promise.all([prisma.docDocument.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }), prisma.docDocument.count({ where })]); res.json({ success: true, data, pagination: { page: parseInt(page, 10) || 1, limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } }); } catch (error: unknown) { logger.error('Failed to fetch', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const item = await prisma.docDocument.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { title, description, category, department, status, currentVersion, fileUrl, fileSize, mimeType, owner, ownerName, reviewDate, retentionDate, tags, notes } = parsed.data; const data = await prisma.docDocument.create({ data: { title, description, category, department, status, currentVersion, fileUrl, fileSize, mimeType, owner, ownerName, reviewDate, retentionDate, tags, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to create', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = (req as any).user?.orgId || 'default'; const existing = await prisma.docDocument.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); const { title, description, category, department, status, currentVersion, fileUrl, fileSize, mimeType, owner, ownerName, reviewDate, retentionDate, tags, notes } = parsed.data; const data = await prisma.docDocument.update({ where: { id: req.params.id }, data: { title, description, category, department, status, currentVersion, fileUrl, fileSize, mimeType, owner, ownerName, reviewDate, retentionDate, tags, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = (req as any).user?.orgId || 'default'; const existing = await prisma.docDocument.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'document not found' } }); await prisma.docDocument.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'document deleted successfully' } }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
export default router;
