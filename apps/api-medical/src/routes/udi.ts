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

const DEVICE_CLASSES = ['CLASS_I', 'CLASS_IIA', 'CLASS_IIB', 'CLASS_III'] as const;

const UDI_DEVICE_STATUSES = ['DRAFT', 'ACTIVE', 'DISCONTINUED', 'RECALLED'] as const;

const UDI_DATABASES = ['GUDID', 'EUDAMED', 'UKCA'] as const;

const UDI_SUBMISSION_STATUSES = [
  'PENDING', 'SUBMITTED', 'ACCEPTED', 'REJECTED', 'UPDATE_REQUIRED',
] as const;

/**
 * Generate reference number: UDI-YYMM-XXXX
 */
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `UDI-${yy}${mm}`;

  const count = await prisma.udiDevice.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// ============================================
// 1. POST /devices - Register device with UDI
// ============================================
router.post('/devices', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      deviceName: z.string().trim().min(1).max(200),
      modelNumber: z.string().trim().min(1).max(200),
      manufacturer: z.string().trim().min(1).max(200),
      deviceClass: z.enum(DEVICE_CLASSES),
      riskClass: z.string().optional(),
      gmdn: z.string().optional(),
      emdn: z.string().optional(),
      status: z.enum(UDI_DEVICE_STATUSES).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const device = await prisma.udiDevice.create({
      data: {
        refNumber,
        deviceName: data.deviceName,
        modelNumber: data.modelNumber,
        manufacturer: data.manufacturer,
        deviceClass: data.deviceClass,
        riskClass: data.riskClass,
        gmdn: data.gmdn,
        emdn: data.emdn,
        status: data.status || 'DRAFT',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: device });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create UDI device error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create UDI device' } });
  }
});

// ============================================
// 2. GET /devices - List devices with pagination
// ============================================
router.get('/devices', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1', limit = '20', status, deviceClass,
      deviceName, manufacturer,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };

    if (status) where.status = status as any;
    if (deviceClass) where.deviceClass = deviceClass as any;
    if (deviceName) {
      where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    }
    if (manufacturer) {
      where.manufacturer = { contains: manufacturer as string, mode: 'insensitive' };
    }

    const [devices, total] = await Promise.all([
      prisma.udiDevice.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.udiDevice.count({ where }),
    ]);

    res.json({
      success: true,
      data: devices,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List UDI devices error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list UDI devices' } });
  }
});

// ============================================
// 3. GET /devices/:id - Get device with DI, PI records, submissions
// ============================================
router.get('/devices/:id', checkOwnership(prisma.udiDevice), async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.udiDevice.findUnique({
      where: { id: req.params.id },
      include: {
        diRecords: { orderBy: { createdAt: 'desc' } },
        piRecords: { orderBy: { createdAt: 'desc' } },
        submissions: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!device || device.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI device not found' } });
    }

    res.json({ success: true, data: device });
  } catch (error) {
    logger.error('Get UDI device error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get UDI device' } });
  }
});

// ============================================
// 4. POST /devices/:id/di - Register UDI-DI
// ============================================
router.post('/devices/:id/di', async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.udiDevice.findUnique({ where: { id: req.params.id } });
    if (!device || device.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI device not found' } });
    }

    const schema = z.object({
      issuingAgency: z.string().trim().min(1).max(200),
      diCode: z.string().trim().min(1).max(200),
      version: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const diRecord = await prisma.udiDiRecord.create({
      data: {
        deviceId: req.params.id,
        issuingAgency: data.issuingAgency,
        diCode: data.diCode,
        version: data.version,
      },
    });

    res.status(201).json({ success: true, data: diRecord });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    if ((error as any)?.code === 'P2002') {
      return res.status(409).json({
        success: false,
        error: { code: 'DUPLICATE_DI_CODE', message: 'DI code already exists' },
      });
    }
    logger.error('Create UDI-DI error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create UDI-DI record' } });
  }
});

// ============================================
// 5. POST /devices/:id/pi - Register UDI-PI
// ============================================
router.post('/devices/:id/pi', async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.udiDevice.findUnique({ where: { id: req.params.id } });
    if (!device || device.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI device not found' } });
    }

    const schema = z.object({
      lotNumber: z.string().optional(),
      serialNumber: z.string().optional(),
      manufacturingDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      expirationDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
    });

    const data = schema.parse(req.body);

    const piRecord = await prisma.udiPiRecord.create({
      data: {
        deviceId: req.params.id,
        lotNumber: data.lotNumber,
        serialNumber: data.serialNumber,
        manufacturingDate: data.manufacturingDate ? new Date(data.manufacturingDate) : undefined,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: piRecord });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create UDI-PI error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create UDI-PI record' } });
  }
});

// ============================================
// 6. GET /devices/:id/submissions - List submissions for a device
// ============================================
router.get('/devices/:id/submissions', async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.udiDevice.findUnique({ where: { id: req.params.id } });
    if (!device || device.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI device not found' } });
    }

    const { page = '1', limit = '20', status, database } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deviceId: req.params.id };

    if (status) where.status = status as any;
    if (database) where.database = database as any;

    const [submissions, total] = await Promise.all([
      prisma.udiSubmission.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.udiSubmission.count({ where }),
    ]);

    res.json({
      success: true,
      data: submissions,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List UDI submissions error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list UDI submissions' } });
  }
});

// ============================================
// 7. PUT /devices/:id/submissions/:sid - Update submission status
// ============================================
router.put('/devices/:id/submissions/:sid', async (req: AuthRequest, res: Response) => {
  try {
    const device = await prisma.udiDevice.findUnique({ where: { id: req.params.id } });
    if (!device || device.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI device not found' } });
    }

    const existing = await prisma.udiSubmission.findFirst({
      where: { id: req.params.sid, deviceId: req.params.id },
    });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'UDI submission not found' } });
    }

    const schema = z.object({
      status: z.enum(UDI_SUBMISSION_STATUSES).optional(),
      database: z.enum(UDI_DATABASES).optional(),
      submissionDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      referenceNumber: z.string().optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const submission = await prisma.udiSubmission.update({
      where: { id: req.params.sid },
      data: {
        ...(data.status !== undefined && { status: data.status }),
        ...(data.database !== undefined && { database: data.database }),
        ...(data.submissionDate !== undefined && { submissionDate: new Date(data.submissionDate) }),
        ...(data.referenceNumber !== undefined && { referenceNumber: data.referenceNumber }),
        ...(data.notes !== undefined && { notes: data.notes }),
      },
    });

    res.json({ success: true, data: submission });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update UDI submission error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update UDI submission' } });
  }
});

export default router;
