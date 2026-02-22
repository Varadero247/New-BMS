import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination } from '@ims/shared';

const logger = createLogger('api-esg');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GRI 414-1 — New Suppliers Screened Using Social Criteria

const screeningSchema = z.object({
  supplierName: z.string().trim().min(1),
  supplierCountry: z.string().trim().optional(),
  supplierSector: z.string().trim().optional(),
  screeningDate: z.string().refine((s) => !isNaN(Date.parse(s)), 'Invalid date'),
  screenedBy: z.string().trim().min(1),
  criteriaUsed: z.array(z.string()).min(1),
  laborRightsCheck: z.boolean().optional(),
  childLaborCheck: z.boolean().optional(),
  forcedLaborCheck: z.boolean().optional(),
  healthSafetyCheck: z.boolean().optional(),
  diversityCheck: z.boolean().optional(),
  humanRightsCheck: z.boolean().optional(),
  communityImpactCheck: z.boolean().optional(),
  result: z.enum(['PASSED', 'CONDITIONAL_PASS', 'FAILED', 'UNDER_REVIEW', 'PENDING']),
  riskRating: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  findings: z.string().trim().optional(),
  correctiveActionsRequired: z.string().trim().optional(),
  nextReviewDate: z.string().refine((s) => !isNaN(Date.parse(s))).optional(),
  isNewSupplier: z.boolean().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { result, riskRating } = req.query;
    const { skip, limit, page } = parsePagination(req.query);
    const where: Record<string, unknown> = { deletedAt: null };
    if (result) where.result = result;
    if (riskRating) where.riskRating = riskRating;
    const [screenings, total] = await Promise.all([
      prisma.esgSupplierSocialScreen.findMany({ where, skip, take: limit, orderBy: { screeningDate: 'desc' } }),
      prisma.esgSupplierSocialScreen.count({ where }),
    ]);
    res.json({ success: true, data: screenings, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error: unknown) {
    logger.error('Failed to list supplier screenings', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list supplier screenings' } });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = screeningSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    }
    const screening = await prisma.esgSupplierSocialScreen.create({
      data: {
        id: uuidv4(), ...parsed.data,
        screeningDate: new Date(parsed.data.screeningDate),
        nextReviewDate: parsed.data.nextReviewDate ? new Date(parsed.data.nextReviewDate) : undefined,
      },
    });
    logger.info('Supplier social screening recorded', { supplierName: parsed.data.supplierName, result: parsed.data.result });
    res.status(201).json({ success: true, data: screening });
  } catch (error: unknown) {
    logger.error('Failed to record supplier screening', { error: error instanceof Error ? error.message : 'Unknown' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record screening' } });
  }
});

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const yearStart = new Date(new Date().getFullYear(), 0, 1);
    const [total, thisYear, passed, failed, byRisk] = await Promise.all([
      prisma.esgSupplierSocialScreen.count({ where: { deletedAt: null } }),
      prisma.esgSupplierSocialScreen.count({ where: { deletedAt: null, screeningDate: { gte: yearStart } } }),
      prisma.esgSupplierSocialScreen.count({ where: { deletedAt: null, result: 'PASSED' } }),
      prisma.esgSupplierSocialScreen.count({ where: { deletedAt: null, result: 'FAILED' } }),
      prisma.esgSupplierSocialScreen.groupBy({ by: ['riskRating'], where: { deletedAt: null }, _count: { id: true } }),
    ]);
    const pctScreened = total === 0 ? 0 : Math.round(((passed + failed) / total) * 100);
    res.json({
      success: true,
      data: {
        total, thisYear, passed, failed,
        conditionalPass: total - passed - failed,
        screeningRate: pctScreened,
        byRiskRating: Object.fromEntries(byRisk.map((b) => [b.riskRating ?? 'UNKNOWN', b._count.id])),
      },
    });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get stats' } });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const screening = await prisma.esgSupplierSocialScreen.findUnique({ where: { id: req.params.id } });
    if (!screening || screening.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Screening not found' } });
    res.json({ success: true, data: screening });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get screening' } });
  }
});

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgSupplierSocialScreen.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Screening not found' } });
    const updateSchema = screeningSchema.partial();
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed' }, details: parsed.error.flatten() });
    const { screeningDate, nextReviewDate, ...rest } = parsed.data;
    const updated = await prisma.esgSupplierSocialScreen.update({
      where: { id: req.params.id },
      data: {
        ...rest,
        ...(screeningDate ? { screeningDate: new Date(screeningDate) } : {}),
        ...(nextReviewDate ? { nextReviewDate: new Date(nextReviewDate) } : {}),
      },
    });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update screening' } });
  }
});

export default router;
