import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-quality');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

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
  const count = await (prisma as any).safetyIncident.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateRecallRef(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RCL-${yy}${mm}`;
  const count = await (prisma as any).recallAction.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// SAFETY CHARACTERISTICS
// =============================================

// POST /characteristics - Define safety characteristic
router.post('/characteristics', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200),
      partName: z.string().trim().min(1).max(200),
      characteristicType: z.enum(['SC', 'CC', 'KPC']),
      description: z.string().trim().min(1).max(2000),
      controlMethod: z.string().trim().min(1).max(200),
      measurementMethod: z.string().optional(),
      tolerance: z.string().optional(),
      linkedFmeaId: z.string().optional(),
      linkedControlPlanId: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateCharacteristicRef();

    const characteristic = await prisma.safetyCharacteristic.create({
      data: {
        refNumber,
        partNumber: data.partNumber,
        partName: data.partName,
        characteristicType: data.characteristicType,
        description: data.description,
        controlMethod: data.controlMethod,
        measurementMethod: data.measurementMethod,
        tolerance: data.tolerance,
        linkedFmeaId: data.linkedFmeaId,
        linkedControlPlanId: data.linkedControlPlanId,
        notes: data.notes,
        status: 'ACTIVE',
        createdBy: req.user!.id,
      } as any,
    });

    res.status(201).json({ success: true, data: characteristic });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create safety characteristic error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety characteristic' } });
  }
});

// GET /characteristics - List all safety-critical characteristics
router.get('/characteristics', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', characteristicType, partNumber, status } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (characteristicType) where.characteristicType = characteristicType as any;
    if (partNumber) where.partNumber = { contains: partNumber as string, mode: 'insensitive' };
    if (status) where.status = status as any;

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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety characteristics' } });
  }
});

// GET /characteristics/:id - Get detail
router.get('/characteristics/:id', checkOwnership(prisma.safetyCharacteristic), async (req: AuthRequest, res: Response) => {
  try {
    const characteristic = await prisma.safetyCharacteristic.findUnique({
      where: { id: req.params.id },
    });

    if (!characteristic || characteristic.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Safety characteristic not found' } });
    }

    res.json({ success: true, data: characteristic });
  } catch (error) {
    logger.error('Get safety characteristic error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get safety characteristic' } });
  }
});

// PUT /characteristics/:id - Update
router.put('/characteristics/:id', checkOwnership(prisma.safetyCharacteristic), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.safetyCharacteristic.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Safety characteristic not found' } });
    }

    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200).optional(),
      partName: z.string().trim().min(1).max(200).optional(),
      characteristicType: z.enum(['SC', 'CC', 'KPC']).optional(),
      description: z.string().trim().min(1).max(2000).optional(),
      controlMethod: z.string().trim().min(1).max(200).optional(),
      measurementMethod: z.string().optional(),
      tolerance: z.string().optional(),
      linkedFmeaId: z.string().optional(),
      linkedControlPlanId: z.string().optional(),
      notes: z.string().optional(),
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
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update safety characteristic error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update safety characteristic' } });
  }
});

// =============================================
// SAFETY INCIDENTS
// =============================================

// POST /incidents - Log potential safety issue
router.post('/incidents', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().min(1).max(2000),
      product: z.string().trim().min(1).max(200),
      partNumber: z.string().optional(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
      source: z.enum(['CUSTOMER', 'INTERNAL', 'REGULATORY', 'SUPPLIER', 'FIELD']).optional(),
      affectedCharacteristicId: z.string().optional(),
      immediateAction: z.string().optional(),
      reportedBy: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateIncidentRef();

    const incident = await (prisma as any).safetyIncident.create({
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
        reportedBy: data.reportedBy || req.user!.id,
        status: 'OPEN',
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create safety incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create safety incident' } });
  }
});

// GET /incidents - List safety incidents
router.get('/incidents', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, severity, product } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (severity) where.severity = severity as string;
    if (product) where.product = { contains: product as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      (prisma as any).safetyIncident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).safetyIncident.count({ where }),
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list safety incidents' } });
  }
});

// PUT /incidents/:id - Update incident
router.put('/incidents/:id', checkOwnership((prisma as any).safetyIncident), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).safetyIncident.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Safety incident not found' } });
    }

    const schema = z.object({
      title: z.string().trim().min(1).max(200).optional(),
      description: z.string().trim().min(1).max(2000).optional(),
      severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
      status: z.enum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'CORRECTED', 'CLOSED']).optional(),
      rootCause: z.string().optional(),
      correctiveAction: z.string().optional(),
      immediateAction: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const incident = await (prisma as any).safetyIncident.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update safety incident error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update safety incident' } });
  }
});

// =============================================
// RECALL ACTIONS
// =============================================

// POST /recalls - Initiate recall investigation
router.post('/recalls', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      product: z.string().trim().min(1).max(200),
      reason: z.string().trim().min(1).max(2000),
      scope: z.string().trim().min(1).max(2000),
      affectedQuantity: z.number().int().nonnegative(),
      linkedIncidentId: z.string().optional(),
      regulatoryBody: z.string().optional(),
      customerNotified: z.boolean().optional(),
      regulatoryNotified: z.boolean().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRecallRef();

    const recall = await (prisma as any).recallAction.create({
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
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: recall });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create recall action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create recall action' } });
  }
});

// GET /recalls - List recall actions
router.get('/recalls', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, product } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (product) where.product = { contains: product as string, mode: 'insensitive' };

    const [items, total] = await Promise.all([
      (prisma as any).recallAction.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).recallAction.count({ where }),
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list recall actions' } });
  }
});

// PUT /recalls/:id - Update recall
router.put('/recalls/:id', checkOwnership((prisma as any).recallAction), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await (prisma as any).recallAction.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Recall action not found' } });
    }

    const schema = z.object({
      reason: z.string().trim().min(1).max(2000).optional(),
      scope: z.string().optional(),
      affectedQuantity: z.number().int().nonnegative().optional(),
      status: z.enum(['INITIATED', 'INVESTIGATING', 'CONTAINED', 'CORRECTED', 'CLOSED']).optional(),
      customerNotified: z.boolean().optional(),
      regulatoryNotified: z.boolean().optional(),
      regulatoryBody: z.string().optional(),
      containmentAction: z.string().optional(),
      correctiveAction: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const recall = await (prisma as any).recallAction.update({
      where: { id: req.params.id },
      data,
    });

    res.json({ success: true, data: recall });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update recall action error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update recall action' } });
  }
});

// =============================================
// COMPLIANCE (REACH/RoHS/IMDS)
// =============================================

// GET /compliance - REACH/RoHS/IMDS compliance tracker summary
router.get('/compliance', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', regulation, status } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (regulation) where.regulation = regulation as string;
    if (status) where.status = status as any;

    const [items, total] = await Promise.all([
      (prisma as any).complianceRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).complianceRecord.count({ where }),
    ]);

    // Compute summary stats
    const summary = {
      totalRecords: total,
      compliant: items.filter((i: any) => i.status === 'COMPLIANT').length,
      nonCompliant: items.filter((i: any) => i.status === 'NON_COMPLIANT').length,
      pending: items.filter((i: any) => i.status === 'PENDING').length,
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
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list compliance records' } });
  }
});

// POST /compliance - Add compliance record
router.post('/compliance', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      partNumber: z.string().trim().min(1).max(200),
      partName: z.string().trim().min(1).max(200),
      regulation: z.enum(['REACH', 'RoHS', 'IMDS', 'TSCA', 'PROP65', 'OTHER']),
      status: z.enum(['COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'EXEMPT']),
      certificateRef: z.string().optional(),
      expiryDate: z.string().optional(),
      substances: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const record = await (prisma as any).complianceRecord.create({
      data: {
        partNumber: data.partNumber,
        partName: data.partName,
        regulation: data.regulation,
        status: data.status,
        certificateRef: data.certificateRef,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        substances: data.substances,
        notes: data.notes,
        createdBy: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create compliance record error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create compliance record' } });
  }
});

export default router;
