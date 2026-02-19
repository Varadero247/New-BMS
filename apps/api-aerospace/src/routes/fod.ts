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

async function generateFodIncidentRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroFodIncident.count({
    where: { refNumber: { startsWith: `AERO-FOD-${yyyy}` } },
  });
  return `AERO-FOD-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

async function generateFodInspectionRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroFodInspection.count({
    where: { refNumber: { startsWith: `AERO-FODI-${yyyy}` } },
  });
  return `AERO-FODI-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createFodIncidentSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  location: z.string().trim().min(1, 'Location is required'),
  area: z.string().trim().optional(),
  workCenter: z.string().trim().optional(),
  fodType: z
    .enum(['METALLIC', 'NON_METALLIC', 'HARDWARE', 'TOOLING', 'UNKNOWN'])
    .optional()
    .default('UNKNOWN'),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']).optional().default('MINOR'),
  foundBy: z.string().trim().optional(),
  dateFound: z
    .string()
    .min(1, 'Date found is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  affectedEquipment: z.string().trim().optional(),
  partNumberAffected: z.string().trim().optional(),
  immediateAction: z.string().trim().optional(),
  rootCause: z.string().trim().optional(),
  preventiveAction: z.string().trim().optional(),
  safetyImpact: z.boolean().optional().default(false),
  notes: z.string().trim().optional(),
});

const updateFodIncidentSchema = z.object({
  title: z.string().trim().optional(),
  description: z.string().trim().optional(),
  location: z.string().trim().optional(),
  area: z.string().trim().optional(),
  workCenter: z.string().trim().optional(),
  fodType: z.enum(['METALLIC', 'NON_METALLIC', 'HARDWARE', 'TOOLING', 'UNKNOWN']).optional(),
  severity: z.enum(['CRITICAL', 'MAJOR', 'MINOR']).optional(),
  affectedEquipment: z.string().trim().optional(),
  partNumberAffected: z.string().trim().optional(),
  immediateAction: z.string().trim().optional(),
  rootCause: z.string().trim().optional(),
  preventiveAction: z.string().trim().optional(),
  status: z.enum(['OPEN', 'INVESTIGATING', 'CORRECTIVE_ACTION', 'CLOSED', 'CANCELLED']).optional(),
  closedDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional(),
  closedBy: z.string().trim().optional(),
  safetyImpact: z.boolean().optional(),
  notes: z.string().trim().optional(),
});

const createFodInspectionSchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  area: z.string().trim().min(1, 'Area is required'),
  inspectionType: z
    .enum(['SCHEDULED', 'POST_MAINTENANCE', 'SHIFT_CHANGE', 'SPECIAL'])
    .optional()
    .default('SCHEDULED'),
  scheduledDate: z
    .string()
    .min(1, 'Scheduled date is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  inspector: z.string().trim().min(1, 'Inspector is required'),
  checklistItems: z.array(z.string().trim()).optional().default([]),
  notes: z.string().trim().optional(),
});

const completeFodInspectionSchema = z.object({
  result: z.enum(['PASS', 'PASS_WITH_FINDINGS', 'FAIL']),
  findings: z.array(z.string().trim()).optional().default([]),
  fodFound: z.boolean().optional().default(false),
  fodDescription: z.string().trim().optional(),
  completedBy: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

// ============================================
// FOD INCIDENTS — CRUD
// ============================================

// GET / - List FOD incidents
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, severity, fodType, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (severity) where.severity = severity;
    if (fodType) where.fodType = fodType;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { location: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [incidents, total] = await Promise.all([
      prisma.aeroFodIncident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: [{ severity: 'asc' }, { createdAt: 'desc' }],
      }),
      prisma.aeroFodIncident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List FOD incidents error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list FOD incidents' },
    });
  }
});

// GET /inspections - List FOD inspections
router.get('/inspections', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', result, inspectionType, search } = req.query;
    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (result) where.result = result;
    if (inspectionType) where.inspectionType = inspectionType;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { area: { contains: search as string, mode: 'insensitive' } },
        { inspector: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [inspections, total] = await Promise.all([
      prisma.aeroFodInspection.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledDate: 'desc' },
      }),
      prisma.aeroFodInspection.count({ where }),
    ]);

    res.json({
      success: true,
      data: inspections,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List FOD inspections error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list FOD inspections' },
    });
  }
});

// GET /:id - Get FOD incident
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const incident = await prisma.aeroFodIncident.findUnique({
      where: { id: req.params.id },
    });

    if (!incident || incident.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'FOD incident not found' } });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    logger.error('Get FOD incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get FOD incident' },
    });
  }
});

// POST / - Report FOD incident
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createFodIncidentSchema.parse(req.body);
    const refNumber = await generateFodIncidentRefNumber();

    const incident = await prisma.aeroFodIncident.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        location: data.location,
        area: data.area,
        workCenter: data.workCenter,
        fodType: data.fodType,
        severity: data.severity,
        foundBy: data.foundBy || req.user?.id,
        dateFound: new Date(data.dateFound),
        affectedEquipment: data.affectedEquipment,
        partNumberAffected: data.partNumberAffected,
        immediateAction: data.immediateAction,
        rootCause: data.rootCause,
        preventiveAction: data.preventiveAction,
        safetyImpact: data.safetyImpact,
        status: 'OPEN',
        notes: data.notes,
        createdBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: incident });
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
    logger.error('Create FOD incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to report FOD incident' },
    });
  }
});

// PUT /:id - Update FOD incident
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroFodIncident.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'FOD incident not found' } });
    }

    const data = updateFodIncidentSchema.parse(req.body);

    const incident = await prisma.aeroFodIncident.update({
      where: { id: req.params.id },
      data: {
        ...data,
        closedDate: data.closedDate ? new Date(data.closedDate) : existing.closedDate,
      } as any,
    });

    res.json({ success: true, data: incident });
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
    logger.error('Update FOD incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update FOD incident' },
    });
  }
});

// DELETE /:id - Soft delete FOD incident
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroFodIncident.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'FOD incident not found' } });
    }

    await prisma.aeroFodIncident.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete FOD incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete FOD incident' },
    });
  }
});

// ============================================
// FOD INSPECTIONS
// ============================================

// POST /inspections - Schedule FOD inspection
router.post('/inspections', async (req: AuthRequest, res: Response) => {
  try {
    const data = createFodInspectionSchema.parse(req.body);
    const refNumber = await generateFodInspectionRefNumber();

    const inspection = await prisma.aeroFodInspection.create({
      data: {
        refNumber,
        title: data.title,
        area: data.area,
        inspectionType: data.inspectionType,
        scheduledDate: new Date(data.scheduledDate),
        inspector: data.inspector,
        checklistItems: data.checklistItems,
        status: 'SCHEDULED',
        notes: data.notes,
        createdBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: inspection });
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
    logger.error('Create FOD inspection error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to schedule FOD inspection' },
    });
  }
});

// PUT /inspections/:id/complete - Complete FOD inspection
router.put('/inspections/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroFodInspection.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'FOD inspection not found' },
      });
    }

    const data = completeFodInspectionSchema.parse(req.body);

    const inspection = await prisma.aeroFodInspection.update({
      where: { id: req.params.id },
      data: {
        result: data.result,
        findings: data.findings,
        fodFound: data.fodFound,
        fodDescription: data.fodDescription,
        completedBy: data.completedBy || req.user?.id,
        completedDate: new Date(),
        status: 'COMPLETED',
        notes: data.notes
          ? `${existing.notes ? existing.notes + '\n' : ''}${data.notes}`
          : existing.notes,
      } as any,
    });

    res.json({ success: true, data: inspection });
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
    logger.error('Complete FOD inspection error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete FOD inspection' },
    });
  }
});

export default router;
