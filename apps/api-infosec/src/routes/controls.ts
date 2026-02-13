import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

const RESERVED_PATHS = new Set(['soa']);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const statusUpdateSchema = z.object({
  applicability: z.enum(['APPLICABLE', 'NOT_APPLICABLE']),
  justification: z.string().min(1).max(2000),
});

const implementationUpdateSchema = z.object({
  implementationStatus: z.enum(['NOT_IMPLEMENTED', 'PARTIALLY_IMPLEMENTED', 'FULLY_IMPLEMENTED', 'NOT_APPLICABLE']),
  implementationNotes: z.string().max(5000).optional(),
  evidence: z.string().max(5000).optional(),
  owner: z.string().max(200).optional(),
  reviewDate: z.string().optional(),
});

// ---------------------------------------------------------------------------
// GET / — List all controls with status
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { domain, implementationStatus, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50);
    const skip = (page - 1) * limit;

    const where: any = {};

    if (domain && typeof domain === 'string') {
      where.domain = domain;
    }
    if (implementationStatus && typeof implementationStatus === 'string') {
      where.implementationStatus = implementationStatus;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { controlId: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [controls, total] = await Promise.all([
      prisma.annexAControl.findMany({
        where,
        skip,
        take: limit,
        orderBy: { controlId: 'asc' },
      }),
      prisma.annexAControl.count({ where }),
    ]);

    res.json({
      success: true,
      data: controls,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    logger.error('Failed to list controls', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to list controls' });
  }
});

// ---------------------------------------------------------------------------
// GET /soa — Statement of Applicability
// ---------------------------------------------------------------------------
router.get('/soa', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.annexAControl.findMany({
      orderBy: { controlId: 'asc' },
      select: {
        id: true,
        controlId: true,
        domain: true,
        title: true,
        description: true,
        applicability: true,
        justification: true,
        implementationStatus: true,
        owner: true,
      },
    });

    const summary = {
      total: controls.length,
      applicable: controls.filter((c) => c.applicability === 'APPLICABLE').length,
      notApplicable: controls.filter((c) => c.applicability === 'NOT_APPLICABLE').length,
      fullyImplemented: controls.filter((c) => c.implementationStatus === 'FULLY_IMPLEMENTED').length,
      partiallyImplemented: controls.filter((c) => c.implementationStatus === 'PARTIALLY_IMPLEMENTED').length,
      notImplemented: controls.filter((c) => c.implementationStatus === 'NOT_IMPLEMENTED').length,
    };

    res.json({ success: true, data: { controls, summary } });
  } catch (error: any) {
    logger.error('Failed to get Statement of Applicability', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to get Statement of Applicability' });
  }
});

// ---------------------------------------------------------------------------
// GET /soa/pdf — Mock PDF export
// ---------------------------------------------------------------------------
router.get('/soa/pdf', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.annexAControl.findMany({
      orderBy: { controlId: 'asc' },
      select: {
        controlId: true,
        domain: true,
        title: true,
        applicability: true,
        justification: true,
        implementationStatus: true,
        owner: true,
      },
    });

    res.json({
      success: true,
      data: {
        format: 'pdf',
        title: 'Statement of Applicability - ISO 27001:2022',
        generatedAt: new Date().toISOString(),
        controlCount: controls.length,
        controls,
        message: 'PDF generation placeholder - integrate with PDF library for actual output',
      },
    });
  } catch (error: any) {
    logger.error('Failed to generate SoA PDF', { error: error.message });
    res.status(500).json({ success: false, error: 'Failed to generate SoA PDF' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Control detail
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const control = await prisma.annexAControl.findUnique({
      where: { id },
    });

    if (!control) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    res.json({ success: true, data: control });
  } catch (error: any) {
    logger.error('Failed to get control', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get control' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/status — Update applicability
// ---------------------------------------------------------------------------
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.annexAControl.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.annexAControl.update({
      where: { id },
      data: {
        applicability: parsed.data.applicability,
        justification: parsed.data.justification,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Control applicability updated', { controlId: id, applicability: parsed.data.applicability });
    res.json({ success: true, data: control });
  } catch (error: any) {
    logger.error('Failed to update control status', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update control status' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/implementation — Update implementation details
// ---------------------------------------------------------------------------
router.put('/:id/implementation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = implementationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.annexAControl.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'Control not found' });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.annexAControl.update({
      where: { id },
      data: {
        implementationStatus: parsed.data.implementationStatus,
        implementationNotes: parsed.data.implementationNotes || null,
        evidence: parsed.data.evidence || null,
        owner: parsed.data.owner || null,
        reviewDate: parsed.data.reviewDate ? new Date(parsed.data.reviewDate) : null,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Control implementation updated', { controlId: id, status: parsed.data.implementationStatus });
    res.json({ success: true, data: control });
  } catch (error: any) {
    logger.error('Failed to update control implementation', { error: error.message, id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to update control implementation' });
  }
});

export default router;
