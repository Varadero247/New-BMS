import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
const router = Router();
const logger = createLogger('mgmt-review-reviews');

const createMgmtReviewSchema = z.object({
  title: z.string().min(1, 'title is required'),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  scheduledDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().trim().datetime().optional()),
  conductedDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().trim().datetime().optional()),
  chairperson: z.string().optional(),
  chairpersonName: z.string().optional(),
  attendees: z.array(z.string()).optional(),
  standards: z.array(z.string()).optional(),
  agendaItems: z.string().optional(),
  riskSummary: z.string().optional(),
  auditSummary: z.string().optional(),
  incidentSummary: z.string().optional(),
  capaSummary: z.string().optional(),
  kpiSummary: z.string().optional(),
  customerFeedback: z.string().optional(),
  supplierPerformance: z.string().optional(),
  trainingStatus: z.string().optional(),
  complianceStatus: z.string().optional(),
  decisions: z.string().optional(),
  actions: z.string().optional(),
  nextReviewDate: z.string().trim().datetime({ offset: true }).optional().or(z.string().trim().datetime().optional()),
  minutesUrl: z.string().trim().url('Invalid URL').optional(),
  notes: z.string().optional(),
});

const updateMgmtReviewSchema = createMgmtReviewSchema.partial();

async function generateRef(orgId: string): Promise<string> { const y = new Date().getFullYear(); const c = await prisma.mgmtReview.count({ where: { orgId, referenceNumber: { startsWith: `MGR-${y}` } } }); return `MGR-${y}-${String(c + 1).padStart(4, '0')}`; }
router.get('/', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const { status, search, page = '1', limit = '20' } = req.query as Record<string, string>; const where: Record<string, unknown> = { orgId, deletedAt: null }; if (status) where.status = status; if (search) where.title = { contains: search, mode: 'insensitive' }; const skip = (Math.max(1, parseInt(page, 10) || 1) - 1) * Math.max(1, parseInt(limit, 10) || 20); const [data, total] = await Promise.all([prisma.mgmtReview.findMany({ where, skip, take: Math.min(Math.max(1, parseInt(limit, 10) || 20), 100), orderBy: { createdAt: 'desc' } }), prisma.mgmtReview.count({ where })]); res.json({ success: true, data, pagination: { page: Math.max(1, parseInt(page, 10) || 1), limit: Math.max(1, parseInt(limit, 10) || 20), total, totalPages: Math.ceil(total / Math.max(1, parseInt(limit, 10) || 20)) } }); } catch (error: unknown) { logger.error('Fetch failed', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch management reviews' } }); } });
router.get('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const item = await prisma.mgmtReview.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'management review not found' } }); res.json({ success: true, data: item }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch management review' } }); } });
router.post('/', authenticate, async (req: Request, res: Response) => { try { const parsed = createMgmtReviewSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const referenceNumber = await generateRef(orgId); const { title, description, status, scheduledDate, conductedDate, chairperson, chairpersonName, attendees, standards, agendaItems, riskSummary, auditSummary, incidentSummary, capaSummary, kpiSummary, customerFeedback, supplierPerformance, trainingStatus, complianceStatus, decisions, actions, nextReviewDate, minutesUrl, notes } = parsed.data; const data = await prisma.mgmtReview.create({ data: { title, description, status, scheduledDate, conductedDate, chairperson, chairpersonName, attendees, standards, agendaItems, riskSummary, auditSummary, incidentSummary, capaSummary, kpiSummary, customerFeedback, supplierPerformance, trainingStatus, complianceStatus, decisions, actions, nextReviewDate, minutesUrl, notes, orgId, referenceNumber, createdBy: (req as AuthRequest).user?.id, updatedBy: (req as AuthRequest).user?.id } }); res.status(201).json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to create', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' } }); } });
router.put('/:id', authenticate, async (req: Request, res: Response) => { try { const parsed = updateMgmtReviewSchema.safeParse(req.body); if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message } }); const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.mgmtReview.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'management review not found' } }); const { title, description, status, scheduledDate, conductedDate, chairperson, chairpersonName, attendees, standards, agendaItems, riskSummary, auditSummary, incidentSummary, capaSummary, kpiSummary, customerFeedback, supplierPerformance, trainingStatus, complianceStatus, decisions, actions, nextReviewDate, minutesUrl, notes } = parsed.data; const data = await prisma.mgmtReview.update({ where: { id: req.params.id }, data: { title, description, status, scheduledDate, conductedDate, chairperson, chairpersonName, attendees, standards, agendaItems, riskSummary, auditSummary, incidentSummary, capaSummary, kpiSummary, customerFeedback, supplierPerformance, trainingStatus, complianceStatus, decisions, actions, nextReviewDate, minutesUrl, notes, updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
router.delete('/:id', authenticate, async (req: Request, res: Response) => { try { const orgId = ((req as AuthRequest).user as any)?.orgId || 'default'; const existing = await prisma.mgmtReview.findFirst({ where: { id: req.params.id, orgId, deletedAt: null } as any }); if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'management review not found' } }); await prisma.mgmtReview.update({ where: { id: req.params.id }, data: { deletedAt: new Date(), updatedBy: (req as AuthRequest).user?.id } }); res.json({ success: true, data: { message: 'management review deleted successfully' } }); } catch (error: unknown) { logger.error('Failed to process request', { error: (error as Error).message }); res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Internal server error' } }); } });
export default router;
