import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generators
// ============================================

async function generateCounterfeitReportRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroCounterfeitReport.count({
    where: { refNumber: { startsWith: `AERO-CF-${yyyy}` } },
  });
  return `AERO-CF-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

async function generateSuspectPartRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroSuspectPart.count({
    where: { refNumber: { startsWith: `AERO-SPT-${yyyy}` } },
  });
  return `AERO-SPT-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createCounterfeitReportSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  partNumber: z.string().trim().min(1, 'Part number is required'),
  partDescription: z.string().trim().optional(),
  manufacturer: z.string().trim().optional(),
  supplier: z.string().trim().optional(),
  poNumber: z.string().trim().optional(),
  quantity: z.number().int().positive().optional(),
  dateDiscovered: z
    .string()
    .min(1, 'Date discovered is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  discoveredBy: z.string().trim().optional(),
  discrepancyDescription: z.string().trim().min(1, 'Discrepancy description is required'),
  suspicionIndicators: z.array(z.string().trim()).optional().default([]),
  disposition: z
    .enum(['QUARANTINE', 'RETURN_TO_SUPPLIER', 'DESTROY', 'PENDING_INVESTIGATION'])
    .optional()
    .default('QUARANTINE'),
  reportedToGidep: z.boolean().optional().default(false),
  safetyImpact: z.boolean().optional().default(false),
  notes: z.string().trim().optional(),
});

const updateCounterfeitReportSchema = z.object({
  title: z.string().trim().optional(),
  discrepancyDescription: z.string().trim().optional(),
  suspicionIndicators: z.array(z.string().trim()).optional(),
  disposition: z
    .enum(['QUARANTINE', 'RETURN_TO_SUPPLIER', 'DESTROY', 'PENDING_INVESTIGATION'])
    .optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'CONFIRMED', 'CLEARED', 'CLOSED']).optional(),
  investigationFindings: z.string().trim().optional(),
  correctiveAction: z.string().trim().optional(),
  reportedToGidep: z.boolean().optional(),
  gidepReportRef: z.string().trim().optional(),
  safetyImpact: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

const createSuspectPartSchema = z.object({
  partNumber: z.string().trim().min(1, 'Part number is required'),
  nomenclature: z.string().trim().min(1, 'Nomenclature is required'),
  manufacturer: z.string().trim().optional(),
  nsn: z.string().trim().optional(),
  riskLevel: z.enum(['HIGH', 'MEDIUM', 'LOW']).optional().default('MEDIUM'),
  indicators: z.array(z.string().trim()).optional().default([]),
  sources: z.array(z.string().trim()).optional().default([]),
  notes: z.string().trim().optional(),
});

// ============================================
// COUNTERFEIT REPORTS — CRUD
// ============================================

// GET / - List counterfeit reports
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, disposition, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (disposition) where.disposition = disposition;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { manufacturer: { contains: search as string, mode: 'insensitive' } },
        { supplier: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [reports, total] = await Promise.all([
      prisma.aeroCounterfeitReport.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.aeroCounterfeitReport.count({ where }),
    ]);

    res.json({
      success: true,
      data: reports,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List counterfeit reports error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list counterfeit reports' },
    });
  }
});

// GET /suspect-parts - List suspect parts
router.get('/suspect-parts', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', riskLevel, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (riskLevel) where.riskLevel = riskLevel;
    if (search) {
      where.OR = [
        { partNumber: { contains: search as string, mode: 'insensitive' } },
        { nomenclature: { contains: search as string, mode: 'insensitive' } },
        { manufacturer: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [parts, total] = await Promise.all([
      prisma.aeroSuspectPart.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ riskLevel: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.aeroSuspectPart.count({ where }),
    ]);

    res.json({
      success: true,
      data: parts,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List suspect parts error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list suspect parts' },
    });
  }
});

// GET /:id - Get counterfeit report
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const report = await prisma.aeroCounterfeitReport.findUnique({
      where: { id: req.params.id },
    });

    if (!report || report.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' },
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Get counterfeit report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get counterfeit report' },
    });
  }
});

// POST / - Create counterfeit report
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createCounterfeitReportSchema.parse(req.body);
    const refNumber = await generateCounterfeitReportRefNumber();

    const report = await prisma.aeroCounterfeitReport.create({
      data: {
        refNumber,
        title: data.title,
        partNumber: data.partNumber,
        partDescription: data.partDescription,
        manufacturer: data.manufacturer,
        supplier: data.supplier,
        poNumber: data.poNumber,
        quantity: data.quantity,
        dateDiscovered: new Date(data.dateDiscovered),
        discoveredBy: data.discoveredBy || req.user?.id,
        discrepancyDescription: data.discrepancyDescription,
        suspicionIndicators: data.suspicionIndicators,
        disposition: data.disposition,
        status: 'OPEN',
        reportedToGidep: data.reportedToGidep,
        safetyImpact: data.safetyImpact,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create counterfeit report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create counterfeit report' },
    });
  }
});

// PUT /:id - Update counterfeit report
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroCounterfeitReport.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' },
      });
    }

    const data = updateCounterfeitReportSchema.parse(req.body);

    const report = await prisma.aeroCounterfeitReport.update({
      where: { id: req.params.id },
      data: data as Record<string, unknown>,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update counterfeit report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update counterfeit report' },
    });
  }
});

// DELETE /:id - Soft delete counterfeit report
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroCounterfeitReport.findUnique({
      where: { id: req.params.id },
    });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Counterfeit report not found' },
      });
    }

    await prisma.aeroCounterfeitReport.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete counterfeit report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete counterfeit report' },
    });
  }
});

// ============================================
// SUSPECT PARTS DATABASE
// ============================================

// POST /suspect-parts - Add suspect part to database
router.post('/suspect-parts', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSuspectPartSchema.parse(req.body);
    const refNumber = await generateSuspectPartRefNumber();

    const part = await prisma.aeroSuspectPart.create({
      data: {
        refNumber,
        partNumber: data.partNumber,
        nomenclature: data.nomenclature,
        manufacturer: data.manufacturer,
        nsn: data.nsn,
        riskLevel: data.riskLevel,
        indicators: data.indicators,
        sources: data.sources,
        notes: data.notes,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: part });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create suspect part error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add suspect part' },
    });
  }
});

export default router;
