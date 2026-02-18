import { randomUUID } from 'crypto';
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
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ESG-${prefix}-${yy}${mm}-${rand}`;
}

const reportCreateSchema = z.object({
  title: z.string().trim().min(1).max(300),
  reportType: z.enum(['ANNUAL', 'QUARTERLY', 'SUSTAINABILITY', 'GRI', 'SASB', 'TCFD', 'CDP']),
  year: z.number().int().min(2000).max(2100),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']).optional(),
  content: z.any().optional().nullable(),
  generatedBy: z.string().max(200).optional().nullable(),
});

const reportUpdateSchema = z.object({
  title: z.string().trim().min(1).max(300).optional(),
  reportType: z.enum(['ANNUAL', 'QUARTERLY', 'SUSTAINABILITY', 'GRI', 'SASB', 'TCFD', 'CDP']).optional(),
  year: z.number().int().min(2000).max(2100).optional(),
  quarter: z.number().int().min(1).max(4).optional().nullable(),
  status: z.enum(['DRAFT', 'REVIEW', 'APPROVED', 'PUBLISHED']).optional(),
  publishedAt: z.string().optional().nullable(),
  content: z.any().optional().nullable(),
  generatedBy: z.string().max(200).optional().nullable(),
});

const RESERVED_PATHS = new Set(['dashboard', 'csrd', 'tcfd']);

// GET /api/reports/dashboard
router.get('/dashboard', async (req: Request, res: Response) => {
  try {
    const currentYear = new Date().getFullYear();

    const [emissions, targets, initiatives, reports, socialMetrics, governanceMetrics] = await Promise.all([
      prisma.esgEmission.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${currentYear} as any-01-01`) } },
        take: 1000}),
      prisma.esgTarget.findMany({ where: { deletedAt: null, year: currentYear } as any,
      take: 1000}),
      prisma.esgInitiative.findMany({ where: { deletedAt: null } as any,
      take: 1000}),
      prisma.esgReport.findMany({ where: { deletedAt: null, year: currentYear } as any,
      take: 1000}),
      prisma.esgSocialMetric.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${currentYear} as any-01-01`) } },
        take: 1000}),
      prisma.esgGovernanceMetric.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${currentYear} as any-01-01`) } },
        take: 1000}),
    ]);

    const totalEmissions = emissions.reduce((sum: number, e: Record<string, any>) => sum + Number(e.co2Equivalent), 0);
    const targetsOnTrack = targets.filter((t: Record<string, any>) => t.status === 'ON_TRACK' || t.status === 'ACHIEVED').length;
    const activeInitiatives = initiatives.filter((i: Record<string, any>) => i.status === 'IN_PROGRESS').length;

    res.json({
      success: true,
      data: {
        totalEmissions,
        emissionCount: emissions.length,
        targets: { total: targets.length, onTrack: targetsOnTrack },
        initiatives: { total: initiatives.length, active: activeInitiatives },
        reports: { total: reports.length },
        socialMetrics: socialMetrics.length,
        governanceMetrics: governanceMetrics.length,
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching dashboard', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch dashboard data' } });
  }
});

// GET /api/reports/csrd
router.get('/csrd', async (req: Request, res: Response) => {
  try {
    const year = Math.max(2000, Math.min(2099, req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear()));

    const [emissions, socialMetrics, governanceMetrics, targets] = await Promise.all([
      prisma.esgEmission.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${year} as any-01-01`) }, periodEnd: { lte: new Date(`${year}-12-31`) } },
        take: 1000}),
      prisma.esgSocialMetric.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${year} as any-01-01`) }, periodEnd: { lte: new Date(`${year}-12-31`) } },
        take: 1000}),
      prisma.esgGovernanceMetric.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${year} as any-01-01`) }, periodEnd: { lte: new Date(`${year}-12-31`) } },
        take: 1000}),
      prisma.esgTarget.findMany({ where: { deletedAt: null, year } as any,
      take: 1000}),
    ]);

    res.json({
      success: true,
      data: {
        year,
        environmental: {
          emissions: emissions.length,
          totalCo2: emissions.reduce((s: number, e: Record<string, any>) => s + Number(e.co2Equivalent), 0),
        },
        social: { metrics: socialMetrics.length },
        governance: { metrics: governanceMetrics.length },
        targets: { total: targets.length, achieved: targets.filter((t: Record<string, any>) => t.status === 'ACHIEVED').length },
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching CSRD data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch CSRD data' } });
  }
});

// GET /api/reports/tcfd
router.get('/tcfd', async (req: Request, res: Response) => {
  try {
    const year = Math.max(2000, Math.min(2099, req.query.year ? parseInt(req.query.year as string, 10) : new Date().getFullYear()));

    const [emissions, targets, initiatives] = await Promise.all([
      prisma.esgEmission.findMany({
        where: { deletedAt: null, periodStart: { gte: new Date(`${year} as any-01-01`) }, periodEnd: { lte: new Date(`${year}-12-31`) } },
        take: 1000}),
      prisma.esgTarget.findMany({ where: { deletedAt: null, year } as any,
      take: 1000}),
      prisma.esgInitiative.findMany({ where: { deletedAt: null, category: 'ENVIRONMENTAL' } as any,
      take: 1000}),
    ]);

    const scopeTotals: Record<string, number> = { SCOPE_1: 0, SCOPE_2: 0, SCOPE_3: 0 };
    for (const e of emissions) {
      scopeTotals[e.scope] += Number(e.co2Equivalent);
    }

    res.json({
      success: true,
      data: {
        year,
        governance: { description: 'Board oversight of climate-related risks and opportunities' },
        strategy: { initiatives: initiatives.length },
        riskManagement: { targets: targets.length },
        metricsAndTargets: {
          emissions: scopeTotals,
          totalEmissions: scopeTotals.SCOPE_1 + scopeTotals.SCOPE_2 + scopeTotals.SCOPE_3,
          targets: targets.map((t: Record<string, any>) => ({ id: t.id, year: t.year, target: Number(t.targetValue), actual: t.actualValue ? Number(t.actualValue) : null, status: t.status })),
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Error fetching TCFD data', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch TCFD data' } });
  }
});

// GET /api/reports
router.get('/', async (req: Request, res: Response) => {
  try {
    const { reportType, year, status, page = '1', limit = '20' } = req.query;
    const skip = (Math.max(1, parseInt(page as string, 10) || 1) - 1) * Math.max(1, parseInt(limit as string, 10) || 20);
    const take = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    const where: Record<string, any> = { deletedAt: null };
    if (reportType) where.reportType = reportType as string;
    if (year) { const n = parseInt(year as string, 10); if (!isNaN(n)) where.year = n; }
    if (status) where.status = status as string;

    const [data, total] = await Promise.all([
      prisma.esgReport.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
      prisma.esgReport.count({ where }),
    ]);

    res.json({
      success: true,
      data,
      pagination: { page: Math.max(1, parseInt(page as string, 10) || 1), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error: unknown) {
    logger.error('Error listing reports', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list reports' } });
  }
});

// POST /api/reports
router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = reportCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const data = parsed.data;
    const report = await prisma.esgReport.create({
      data: {
        title: data.title,
        reportType: data.reportType,
        year: data.year,
        quarter: data.quarter || null,
        status: data.status || 'DRAFT',
        content: data.content || null,
        generatedBy: data.generatedBy || null,
        createdBy: authReq.user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Error creating report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create report' } });
  }
});

// GET /api/reports/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    if (RESERVED_PATHS.has(req.params.id)) return (res as any).next('route');
    const report = await prisma.esgReport.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!report) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }
    res.json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Error fetching report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch report' } });
  }
});

// PUT /api/reports/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const parsed = reportUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.issues } });
    }

    const existing = await prisma.esgReport.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    const updateData: Record<string, any> = { ...parsed.data };
    if (updateData.publishedAt) updateData.publishedAt = new Date(updateData.publishedAt);

    const report = await prisma.esgReport.update({ where: { id: req.params.id }, data: updateData });
    res.json({ success: true, data: report });
  } catch (error: unknown) {
    logger.error('Error updating report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update report' } });
  }
});

// DELETE /api/reports/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.esgReport.findFirst({ where: { id: req.params.id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Report not found' } });
    }

    await prisma.esgReport.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { message: 'Report deleted successfully' } });
  } catch (error: unknown) {
    logger.error('Error deleting report', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete report' } });
  }
});

export default router;
