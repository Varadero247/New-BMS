import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
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
// HELPERS
// ============================================

async function generateDMRRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `DMR-${yy}${mm}`;

  const count = await prisma.deviceMasterRecord.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

async function generateDHRRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `DHR-${yy}${mm}`;

  const count = await prisma.deviceHistoryRecord.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// DMR ROUTES — FDA 21 CFR 820.181
// ============================================

// ============================================
// 1. POST /dmr - Create Device Master Record
// ============================================
router.post('/dmr', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      deviceName: z.string().trim().min(1).max(200),
      deviceClass: z.enum(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB']),
      description: z.string().trim().optional(),
      specifications: z.string().trim().optional(),
      productionProcesses: z.string().trim().optional(),
      qualityProcedures: z.string().trim().optional(),
      acceptanceCriteria: z.string().trim().optional(),
      labellingSpecs: z.string().trim().optional(),
      packagingSpecs: z.string().trim().optional(),
      installationProcs: z.string().trim().optional(),
      servicingProcs: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateDMRRefNumber();

    const dmr = await prisma.deviceMasterRecord.create({
      data: {
        refNumber,
        deviceName: data.deviceName,
        deviceClass: data.deviceClass,
        description: data.description,
        specifications: data.specifications,
        productionProcesses: data.productionProcesses,
        qualityProcedures: data.qualityProcedures,
        acceptanceCriteria: data.acceptanceCriteria,
        labellingSpecs: data.labellingSpecs,
        packagingSpecs: data.packagingSpecs,
        installationProcs: data.installationProcs,
        servicingProcs: data.servicingProcs,
        status: 'DRAFT',
        currentVersion: '1.0',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: dmr });
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
    logger.error('Create DMR error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create device master record' },
    });
  }
});

// ============================================
// 2. GET /dmr - List Device Master Records
// ============================================
router.get('/dmr', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, deviceClass, deviceName } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (deviceClass) where.deviceClass = deviceClass as any;
    if (deviceName) {
      where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    }

    const [dmrs, total] = await Promise.all([
      prisma.deviceMasterRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.deviceMasterRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: dmrs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List DMRs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list device master records' },
    });
  }
});

// ============================================
// 3. GET /dmr/:id - Get DMR with DHR records
// ============================================
router.get(
  '/dmr/:id',
  checkOwnership(prisma.deviceMasterRecord),
  async (req: AuthRequest, res: Response) => {
    try {
      const dmr = await prisma.deviceMasterRecord.findUnique({
        where: { id: req.params.id },
        include: {
          dhrs: {
            where: { deletedAt: null } as any,
            orderBy: { createdAt: 'desc' },
          },
          _count: {
            select: { dhrs: true },
          },
        },
      });

      if (!dmr || dmr.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device master record not found' },
        });
      }

      res.json({ success: true, data: dmr });
    } catch (error) {
      logger.error('Get DMR error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get device master record' },
      });
    }
  }
);

// ============================================
// 4. PUT /dmr/:id - Update DMR
// ============================================
router.put(
  '/dmr/:id',
  checkOwnership(prisma.deviceMasterRecord),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.deviceMasterRecord.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device master record not found' },
        });
      }

      const schema = z.object({
        deviceName: z.string().trim().min(1).max(200).optional(),
        deviceClass: z
          .enum(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB'])
          .optional(),
        description: z.string().trim().optional(),
        specifications: z.string().trim().optional(),
        productionProcesses: z.string().trim().optional(),
        qualityProcedures: z.string().trim().optional(),
        acceptanceCriteria: z.string().trim().optional(),
        labellingSpecs: z.string().trim().optional(),
        packagingSpecs: z.string().trim().optional(),
        installationProcs: z.string().trim().optional(),
        servicingProcs: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const dmr = await prisma.deviceMasterRecord.update({
        where: { id: req.params.id },
        data,
      });

      res.json({ success: true, data: dmr });
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
      logger.error('Update DMR error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update device master record' },
      });
    }
  }
);

// ============================================
// 5. POST /dmr/:id/approve - Approve DMR
// ============================================
router.post('/dmr/:id/approve', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.deviceMasterRecord.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device master record not found' },
      });
    }

    // Bump version if already approved (re-approval after revision)
    let newVersion = existing.currentVersion;
    if (existing.status === 'APPROVED') {
      const parts = existing.currentVersion.split('.');
      const major = parseInt(parts[0], 10);
      newVersion = `${major + 1}.0`;
    }

    const dmr = await prisma.deviceMasterRecord.update({
      where: { id: req.params.id },
      data: {
        status: 'APPROVED',
        approvedBy: req.user?.email || req.user?.id,
        approvedDate: new Date(),
        currentVersion: newVersion,
      },
    });

    res.json({ success: true, data: dmr });
  } catch (error) {
    logger.error('Approve DMR error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve device master record' },
    });
  }
});

// ============================================
// DHR ROUTES — FDA 21 CFR 820.184
// ============================================

// ============================================
// 6. POST /dhr - Create Device History Record
// ============================================
router.post('/dhr', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      dmrId: z.string().trim().min(1).max(200),
      batchNumber: z.string().trim().min(1).max(200),
      manufacturingDate: z
        .string()
        .trim()
        .min(1)
        .max(200)
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
      quantityManufactured: z.number().int().positive(),
      labelsUsed: z.string().trim().optional(),
      primaryId: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);

    // Validate DMR exists
    const dmr = await prisma.deviceMasterRecord.findUnique({ where: { id: data.dmrId } });
    if (!dmr || dmr.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Referenced device master record not found' },
      });
    }

    const refNumber = await generateDHRRefNumber();

    const dhr = await prisma.deviceHistoryRecord.create({
      data: {
        refNumber,
        dmrId: data.dmrId,
        batchNumber: data.batchNumber,
        manufacturingDate: new Date(data.manufacturingDate),
        quantityManufactured: data.quantityManufactured,
        labelsUsed: data.labelsUsed,
        primaryId: data.primaryId,
        status: 'IN_PRODUCTION',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: dhr });
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
    logger.error('Create DHR error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create device history record' },
    });
  }
});

// ============================================
// 7. GET /dhr - List Device History Records
// ============================================
router.get('/dhr', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, dmrId, batchNumber } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (dmrId) where.dmrId = dmrId as any;
    if (batchNumber) {
      where.batchNumber = { contains: batchNumber as string, mode: 'insensitive' };
    }

    const [dhrs, total] = await Promise.all([
      prisma.deviceHistoryRecord.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          dmr: { select: { id: true, refNumber: true, deviceName: true, deviceClass: true } },
        },
      }),
      prisma.deviceHistoryRecord.count({ where }),
    ]);

    res.json({
      success: true,
      data: dhrs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List DHRs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list device history records' },
    });
  }
});

// ============================================
// 8. GET /dhr/:id - Get DHR with production records
// ============================================
router.get(
  '/dhr/:id',
  checkOwnership(prisma.deviceHistoryRecord),
  async (req: AuthRequest, res: Response) => {
    try {
      const dhr = await prisma.deviceHistoryRecord.findUnique({
        where: { id: req.params.id },
        include: {
          productionRecords: { orderBy: { createdAt: 'desc' } },
          dmr: {
            select: {
              id: true,
              refNumber: true,
              deviceName: true,
              deviceClass: true,
              currentVersion: true,
            },
          },
        },
      });

      if (!dhr || dhr.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Device history record not found' },
        });
      }

      res.json({ success: true, data: dhr });
    } catch (error) {
      logger.error('Get DHR error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get device history record' },
      });
    }
  }
);

// ============================================
// 9. POST /dhr/:id/records - Add production record
// ============================================
router.post('/dhr/:id/records', async (req: AuthRequest, res: Response) => {
  try {
    const dhr = await prisma.deviceHistoryRecord.findUnique({ where: { id: req.params.id } });
    if (!dhr || dhr.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device history record not found' },
      });
    }

    const schema = z.object({
      recordType: z.enum([
        'INCOMING_INSPECTION',
        'IN_PROCESS_INSPECTION',
        'FINAL_INSPECTION',
        'ENVIRONMENTAL_MONITORING',
        'EQUIPMENT_CALIBRATION',
        'STERILIZATION',
        'PACKAGING',
        'LABELLING',
        'ACCEPTANCE_TEST',
        'OTHER',
      ]),
      title: z.string().trim().min(1).max(200),
      description: z.string().trim().optional(),
      result: z.string().trim().optional(),
      pass: z.boolean().optional(),
      documentRef: z.string().trim().optional(),
      performedBy: z.string().trim().optional(),
      performedDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
    });

    const data = schema.parse(req.body);

    const record = await prisma.dHRRecord.create({
      data: {
        dhrId: req.params.id,
        recordType: data.recordType as any,
        title: data.title,
        description: data.description,
        result: data.result,
        pass: data.pass,
        documentRef: data.documentRef,
        performedBy: data.performedBy,
        performedDate: data.performedDate ? new Date(data.performedDate) : null,
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
    logger.error('Create DHR record error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create production record' },
    });
  }
});

// ============================================
// 10. POST /dhr/:id/release - Release batch
// ============================================
router.post('/dhr/:id/release', async (req: AuthRequest, res: Response) => {
  try {
    const dhr = await prisma.deviceHistoryRecord.findUnique({
      where: { id: req.params.id },
      include: { productionRecords: true },
    });

    if (!dhr || dhr.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Device history record not found' },
      });
    }

    // Validate: at least 1 production record exists
    if (dhr.productionRecords.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Cannot release batch: no production records exist',
        },
      });
    }

    // Validate: no records with pass=false
    const failedRecords = dhr.productionRecords.filter((r) => r.pass === false);
    if (failedRecords.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: `Cannot release batch: ${failedRecords.length} production record(s) have failed inspections`,
        },
      });
    }

    const updatedDhr = await prisma.deviceHistoryRecord.update({
      where: { id: req.params.id },
      data: {
        status: 'RELEASED',
        releasedBy: req.user?.email || req.user?.id,
        releaseDate: new Date(),
      },
    });

    res.json({ success: true, data: updatedDhr });
  } catch (error) {
    logger.error('Release DHR error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to release batch' },
    });
  }
});

export default router;
