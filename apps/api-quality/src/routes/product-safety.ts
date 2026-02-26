// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam, parsePagination} from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// Typed access for product safety models (correct Prisma names)
type SafetyDelegate = {
  findMany: (args?: Record<string, unknown>) => Promise<Record<string, unknown>[]>;
  findFirst: (args?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  findUnique: (args?: Record<string, unknown>) => Promise<Record<string, unknown> | null>;
  create: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  update: (args: Record<string, unknown>) => Promise<Record<string, unknown>>;
  count: (args?: Record<string, unknown>) => Promise<number>;
};
type PrismaWithSafety = typeof prisma & {
  productSafetyIncident: SafetyDelegate;
  productRecall: SafetyDelegate;
  qualComplianceRecord: SafetyDelegate;
};
const safetyDb = prisma as unknown as PrismaWithSafety;

// =============================================
// Reference number generators
// =============================================

async function generateCharacteristicRef(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PSC-${yy}${mm}`;
  const count = await prisma.safetyCharacteristic.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateIncidentRef(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `PSI-${yy}${mm}`;
  const count = await safetyDb.productSafetyIncident.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateRecallRef(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RCL-${yy}${mm}`;
  const count = await safetyDb.productRecall.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// SAFETY CHARACTERISTICS
// =============================================

// POST /characteristics - Define safety characteristic
router.post('/characteristics', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200),
      partName: z.string().trim().min(1).max(200),
      characteristicType: z.enum(['SC', 'CC', 'KPC']),
      description: z.string().trim().min(1).max(2000),
      controlMethod: z.string().trim().min(1).max(200),
      measurementMethod: z.string().trim().optional(),
      tolerance: z.string().trim().optional(),
      linkedFmeaId: z.string().trim().optional(),
      linkedControlPlanId: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateCharacteristicRef();

    const characteristic = await prisma.safetyCharacteristic.create({
      data: {
        refNumber,
        partNumber: data.partNumber,
        partName: data.partName,
        characteristicName: data.description,
        characteristicType: data.characteristicType,
        controlMethod: data.controlMethod,
        notes: [data.notes, data.tolerance, data.measurementMethod].filter(Boolean).join('; ') || undefined,
        linkedFmeaId: data.linkedFmeaId,
        linkedControlPlanId: data.linkedControlPlanId,
        createdBy: (req as AuthRequest).user!.id,
      },
    });

    res.status(201).json({ success: true, data: characteristic });
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
    logger.error('Create safety characteristic error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety characteristic' },
    });
  }
});

// GET /characteristics - List all safety-critical characteristics
router.get('/characteristics', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', characteristicType, partNumber, status } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (characteristicType) where.characteristicType = characteristicType;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.safetyCharacteristic.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.safetyCharacteristic.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List safety characteristics error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety characteristics' },
    });
  }
});

// GET /characteristics/:id - Get detail
router.get(
  '/characteristics/:id',
  checkOwnership(prisma.safetyCharacteristic),
  async (req: Request, res: Response) => {
    try {
      const characteristic = await prisma.safetyCharacteristic.findUnique({
        where: { id: req.params.id },
      });

      if (!characteristic || characteristic.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safety characteristic not found' },
        });
      }

      res.json({ success: true, data: characteristic });
    } catch (error) {
      logger.error('Get safety characteristic error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get safety characteristic' },
      });
    }
  }
);

// PUT /characteristics/:id - Update
router.put(
  '/characteristics/:id',
  checkOwnership(prisma.safetyCharacteristic),
  async (req: Request, res: Response) => {
    try {
      const existing = await prisma.safetyCharacteristic.findUnique({
        where: { id: req.params.id },
      });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safety characteristic not found' },
        });
      }

      const schema = z.object({
        partNumber: z.string().trim().min(1).max(200).optional(),
        partName: z.string().trim().min(1).max(200).optional(),
        characteristicType: z.enum(['SC', 'CC', 'KPC']).optional(),
        description: z.string().trim().min(1).max(2000).optional(),
        controlMethod: z.string().trim().min(1).max(200).optional(),
        measurementMethod: z.string().trim().optional(),
        tolerance: z.string().trim().optional(),
        linkedFmeaId: z.string().trim().optional(),
        linkedControlPlanId: z.string().trim().optional(),
        notes: z.string().trim().optional(),
        status: z.enum(['ACTIVE', 'INACTIVE', 'UNDER_REVIEW']).optional(),
      });

      const data = schema.parse(req.body);

      const characteristic = await prisma.safetyCharacteristic.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, data: characteristic });
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
      logger.error('Update safety characteristic error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update safety characteristic' },
      });
    }
  }
);

// =============================================
// SAFETY INCIDENTS
// =============================================

// POST /incidents - Log potential safety issue
router.post('/incidents', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      product: z.string().trim().min(1).max(200),
      partNumber: z.string().trim().optional(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      source: z.enum(['CUSTOMER', 'INTERNAL', 'REGULATORY', 'SUPPLIER', 'FIELD']).optional(),
      affectedCharacteristicId: z.string().trim().optional(),
      immediateAction: z.string().trim().optional(),
      reportedBy: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateIncidentRef();

    const incident = await safetyDb.productSafetyIncident.create({
      data: {
        refNumber,
        title: data.title,
        description: data.description,
        product: data.product,
        partNumber: data.partNumber,
        severity: data.severity,
        source: data.source || 'INTERNAL',
        affectedCharacteristicId: data.affectedCharacteristicId,
        immediateAction: data.immediateAction,
        reportedBy: data.reportedBy || (req as AuthRequest).user!.id,
        status: 'OPEN',
        createdBy: (req as AuthRequest).user!.id,
      },
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
    logger.error('Create safety incident error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety incident' },
    });
  }
});

// GET /incidents - List safety incidents
router.get('/incidents', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, severity, product } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (severity) where.severity = severity as string;
    if (product) where.product = { contains: product as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      safetyDb.productSafetyIncident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      safetyDb.productSafetyIncident.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List safety incidents error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety incidents' },
    });
  }
});

// PUT /incidents/:id - Update incident
router.put(
  '/incidents/:id',
  checkOwnership(safetyDb.productSafetyIncident as unknown as Parameters<typeof checkOwnership>[0]),
  async (req: Request, res: Response) => {
    try {
      const existing = await safetyDb.productSafetyIncident.findUnique({
        where: { id: req.params.id },
      });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Safety incident not found' },
        });
      }

      const schema = z.object({
        title: z.string().trim().min(1).max(200).optional(),
        description: z.string().trim().min(1).max(2000).optional(),
        severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
        status: z.enum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'CORRECTED', 'CLOSED']).optional(),
        rootCause: z.string().trim().optional(),
        correctiveAction: z.string().trim().optional(),
        immediateAction: z.string().trim().optional(),
        notes: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const incident = await safetyDb.productSafetyIncident.update({
        where: { id: req.params.id },
        data,
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
      logger.error('Update safety incident error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update safety incident' },
      });
    }
  }
);

// =============================================
// RECALL ACTIONS
// =============================================

// POST /recalls - Initiate recall investigation
router.post('/recalls', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      product: z.string().trim().min(1).max(200),
      reason: z.string().trim().min(1).max(2000),
      scope: z.string().trim().min(1).max(2000),
      affectedQuantity: z.number().int().nonnegative(),
      linkedIncidentId: z.string().trim().optional(),
      regulatoryBody: z.string().trim().optional(),
      customerNotified: z.boolean().optional(),
      regulatoryNotified: z.boolean().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRecallRef();

    const recall = await safetyDb.productRecall.create({
      data: {
        refNumber,
        product: data.product,
        reason: data.reason,
        scope: data.scope,
        affectedQuantity: data.affectedQuantity,
        linkedIncidentId: data.linkedIncidentId,
        regulatoryBody: data.regulatoryBody,
        customerNotified: data.customerNotified || false,
        regulatoryNotified: data.regulatoryNotified || false,
        notes: data.notes,
        status: 'INITIATED',
        createdBy: (req as AuthRequest).user!.id,
      },
    });

    res.status(201).json({ success: true, data: recall });
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
    logger.error('Create recall action error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create recall action' },
    });
  }
});

// GET /recalls - List recall actions
router.get('/recalls', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, product } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (product) where.product = { contains: product as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      safetyDb.productRecall.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      safetyDb.productRecall.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('List recall actions error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list recall actions' },
    });
  }
});

// PUT /recalls/:id - Update recall
router.put(
  '/recalls/:id',
  checkOwnership(safetyDb.productRecall as unknown as Parameters<typeof checkOwnership>[0]),
  async (req: Request, res: Response) => {
    try {
      const existing = await safetyDb.productRecall.findUnique({
        where: { id: req.params.id },
      });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Recall action not found' },
        });
      }

      const schema = z.object({
        reason: z.string().trim().min(1).max(2000).optional(),
        scope: z.string().trim().optional(),
        affectedQuantity: z.number().int().nonnegative().optional(),
        status: z
          .enum(['INITIATED', 'INVESTIGATING', 'CONTAINED', 'CORRECTED', 'CLOSED'])
          .optional(),
        customerNotified: z.boolean().optional(),
        regulatoryNotified: z.boolean().optional(),
        regulatoryBody: z.string().trim().optional(),
        containmentAction: z.string().trim().optional(),
        correctiveAction: z.string().trim().optional(),
        notes: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const recall = await safetyDb.productRecall.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, data: recall });
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
      logger.error('Update recall action error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update recall action' },
      });
    }
  }
);

// =============================================
// COMPLIANCE (REACH/RoHS/IMDS)
// =============================================

// GET /compliance - REACH/RoHS/IMDS compliance tracker summary
router.get('/compliance', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', regulation, status } = req.query;

    const { page: pageNum, limit: limitNum, skip } = parsePagination(req.query);

    const where: Record<string, unknown> = {};
    if (regulation) where.regulation = regulation as string;
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      safetyDb.qualComplianceRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      safetyDb.qualComplianceRecord.count({ where }),
    ]);

    // Compute summary stats
    const summary = {
      totalRecords: total,
      compliant: items.filter((i: { status?: string }) => i.status === 'COMPLIANT').length,
      nonCompliant: items.filter((i: { status?: string }) => i.status === 'NON_COMPLIANT').length,
      pending: items.filter((i: { status?: string }) => i.status === 'PENDING').length,
    };

    res.json({
      success: true,
      data: {
        items,
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        summary,
      },
    });
  } catch (error) {
    logger.error('List compliance records error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list compliance records' },
    });
  }
});

// POST /compliance - Add compliance record
router.post('/compliance', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200),
      partName: z.string().trim().min(1).max(200),
      regulation: z.enum(['REACH', 'RoHS', 'IMDS', 'TSCA', 'PROP65', 'OTHER']),
      status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'EXEMPT']),
      certificateRef: z.string().trim().optional(),
      expiryDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      substances: z.string().trim().optional(),
      notes: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    const record = await safetyDb.qualComplianceRecord.create({
      data: {
        partNumber: data.partNumber,
        partName: data.partName,
        regulation: data.regulation,
        status: data.status,
        certificateRef: data.certificateRef,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        substances: data.substances,
        notes: data.notes,
        createdBy: (req as AuthRequest).user!.id,
      },
    });

    res.status(201).json({ success: true, data: record });
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
    logger.error('Create compliance record error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance record' },
    });
  }
});

export default router;
