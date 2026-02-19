import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
const logger = createLogger('api-esg');

const router = Router();

const generateSchema = z.object({
  title: z.string().trim().optional(),
  framework: z.string().trim().min(1, 'Framework is required'),
  period: z.string().trim().min(1, 'Period is required'),
});

router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const data = await prisma.esgReport.findMany({
      where: { orgId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});

router.post('/generate', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const y = new Date().getFullYear();
    const { title, framework, period } = parsed.data;
    // Derive year from period string (e.g. "2024", "2024-Q1", "FY2024") or use current year
    const periodYear = period ? parseInt(period.replace(/\D/g, '').slice(0, 4), 10) || y : y;
    // Map framework string to a valid EsgReportType enum value, defaulting to ANNUAL
    const validReportTypes = ['ANNUAL', 'QUARTERLY', 'SUSTAINABILITY', 'GRI', 'SASB', 'TCFD', 'CDP'];
    const reportType = (framework && validReportTypes.includes(framework.toUpperCase())
      ? framework.toUpperCase()
      : 'ANNUAL') as 'ANNUAL' | 'QUARTERLY' | 'SUSTAINABILITY' | 'GRI' | 'SASB' | 'TCFD' | 'CDP';
    const count = await prisma.esgReport.count({ where: { orgId } });
    const referenceNumber = `ESGR-${periodYear}-${String(count + 1).padStart(4, '0')}`;
    const data = await prisma.esgReport.create({
      data: {
        orgId,
        referenceNumber,
        title: title || `ESG Report ${periodYear}`,
        reportType,
        year: periodYear,
        status: 'DRAFT',
        aiGenerated: true,
        generatedBy: 'AI',
        content: { framework, period, aiGenerated: true },
        createdBy: (req as AuthRequest).user?.id || 'system',
      },
    });
    res.status(201).json({ success: true, data });
  } catch (error: unknown) {
    logger.error('Request failed', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create resource' },
    });
  }
});

export default router;
