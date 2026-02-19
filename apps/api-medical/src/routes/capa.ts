import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// CAPA - Corrective and Preventive Actions
// (ISO 13485 Clause 8.5.2 / 8.5.3)
// ============================================

const CAPA_SOURCES = [
  'COMPLAINT',
  'AUDIT',
  'NCR',
  'RISK_ASSESSMENT',
  'PMS_REPORT',
  'REGULATORY_FINDING',
  'INTERNAL_OBSERVATION',
  'SUPPLIER_ISSUE',
  'OTHER',
] as const;
const CAPA_SEVERITIES = ['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL'] as const;
const CAPA_STATUSES = [
  'OPEN',
  'INVESTIGATION',
  'PLANNED',
  'IMPLEMENTATION',
  'VERIFICATION',
  'EFFECTIVENESS_CHECK',
  'CLOSED',
  'CANCELLED',
] as const;

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CAPA-${yy}${mm}`;
  const count = await prisma.medCapa.count({ where: { refNumber: { startsWith: prefix } } });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

const createSchema = z.object({
  title: z.string().trim().min(1).max(200),
  capaType: z.enum(['CORRECTIVE', 'PREVENTIVE']).optional(),
  source: z.enum(CAPA_SOURCES),
  sourceRef: z.string().trim().optional(),
  description: z.string().trim().min(1).max(2000),
  deviceName: z.string().trim().optional(),
  deviceId: z.string().trim().optional(),
  severity: z.enum(CAPA_SEVERITIES).optional(),
});

const updateSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  capaType: z.enum(['CORRECTIVE', 'PREVENTIVE']).optional(),
  source: z.enum(CAPA_SOURCES).optional(),
  sourceRef: z.string().trim().optional(),
  description: z.string().trim().optional(),
  deviceName: z.string().trim().optional(),
  deviceId: z.string().trim().optional(),
  severity: z.enum(CAPA_SEVERITIES).optional(),
  status: z.enum(CAPA_STATUSES).optional(),
  rootCause: z.string().trim().optional(),
  rootCauseMethod: z.string().trim().optional(),
  containmentAction: z.string().trim().optional(),
  containmentDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  plannedAction: z.string().trim().optional(),
  plannedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  implementedAction: z.string().trim().optional(),
  implementedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  verificationMethod: z.string().trim().optional(),
  verificationDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  verifiedBy: z.string().trim().optional(),
  effectivenessCheck: z.string().trim().optional(),
  effectivenessDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  effectivenessResult: z
    .enum(['EFFECTIVE', 'PARTIALLY_EFFECTIVE', 'NOT_EFFECTIVE', 'PENDING'])
    .optional(),
  closedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  closedBy: z.string().trim().optional(),
});

// GET / - List CAPAs
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, capaType, source, severity, search } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status;
    if (capaType) where.capaType = capaType;
    if (source) where.source = source;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { deviceName: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [capas, total] = await Promise.all([
      prisma.medCapa.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' } }),
      prisma.medCapa.count({ where }),
    ]);

    res.json({
      success: true,
      data: capas,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List CAPAs error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list CAPAs' } });
  }
});

// GET /stats - CAPA statistics
router.get('/stats', async (_req: AuthRequest, res: Response) => {
  try {
    const [total, byStatus, byType, bySeverity, overdue] = await Promise.all([
      prisma.medCapa.count({ where: { deletedAt: null } as any }),
      prisma.medCapa.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.medCapa.groupBy({
        by: ['capaType'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.medCapa.groupBy({
        by: ['severity'],
        _count: { id: true },
        where: { deletedAt: null } as any,
      }),
      prisma.medCapa.count({
        where: {
          deletedAt: null,
          status: { notIn: ['CLOSED', 'CANCELLED'] } as any,
          plannedDate: { lt: new Date() },
        },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        overdue,
        byStatus: byStatus.map((s) => ({ status: s.status, count: (s as { _count: { id: number } })._count.id })),
        byType: byType.map((t) => ({ type: t.capaType, count: (t as { _count: { id: number } })._count.id })),
        bySeverity: bySeverity.map((s) => ({ severity: s.severity, count: (s as { _count: { id: number } })._count.id })),
      },
    });
  } catch (error) {
    logger.error('CAPA stats error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA stats' },
    });
  }
});

// GET /:id - Get single CAPA
router.get('/:id', checkOwnership(prisma.medCapa), async (req: AuthRequest, res: Response) => {
  try {
    const capa = await prisma.medCapa.findUnique({ where: { id: req.params.id } });
    if (!capa || capa.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }
    res.json({ success: true, data: capa });
  } catch (error) {
    logger.error('Get CAPA error', { error: (error as Error).message });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get CAPA' } });
  }
});

// POST / - Create CAPA
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createSchema.parse(req.body);
    const refNumber = await generateRefNumber();

    const capa = await prisma.medCapa.create({
      data: {
        refNumber,
        title: data.title,
        capaType: data.capaType || 'CORRECTIVE',
        source: data.source,
        sourceRef: data.sourceRef,
        description: data.description,
        deviceName: data.deviceName,
        deviceId: data.deviceId,
        severity: data.severity || 'MODERATE',
        status: 'OPEN',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: capa });
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
    logger.error('Create CAPA error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create CAPA' },
    });
  }
});

// PUT /:id - Update CAPA
router.put('/:id', checkOwnership(prisma.medCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.medCapa.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    const data = updateSchema.parse(req.body);
    const updateData: Record<string, unknown> = { ...data };

    const dateFields = [
      'containmentDate',
      'plannedDate',
      'implementedDate',
      'verificationDate',
      'effectivenessDate',
      'closedDate',
    ];
    for (const field of dateFields) {
      if (data[field as keyof typeof data]) {
        updateData[field] = new Date(data[field as keyof typeof data] as string);
      }
    }

    if (data.status === 'CLOSED' && !data.closedDate) updateData.closedDate = new Date();

    const capa = await prisma.medCapa.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: capa });
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
    logger.error('Update CAPA error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update CAPA' },
    });
  }
});

// DELETE /:id - Soft delete CAPA
router.delete('/:id', checkOwnership(prisma.medCapa), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.medCapa.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'CAPA not found' } });
    }

    await prisma.medCapa.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.status(204).send();
  } catch (error) {
    logger.error('Delete CAPA error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete CAPA' },
    });
  }
});

export default router;
