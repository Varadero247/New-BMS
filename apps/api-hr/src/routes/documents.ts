import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-hr');

const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/documents - Get employee documents
router.get('/', scopeToUser, async (req: Request, res: Response) => {
  try {
    const { employeeId, documentType, status, expiringWithin, page = '1', limit = '20' } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (employeeId) where.employeeId = employeeId;
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (expiringWithin) {
      const daysAhead = parseInt(expiringWithin as string, 10);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + daysAhead);
      where.expiryDate = { lte: futureDate, gte: new Date() };
    }

    const [documents, total] = await Promise.all([
      prisma.employeeDocument.findMany({
        where,
        include: {
          employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true } },
        },
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employeeDocument.count({ where }),
    ]);

    res.json({
      success: true,
      data: documents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('Error fetching documents', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } });
  }
});

// GET /api/documents/:id - Get single document
router.get('/:id', checkOwnership(prisma.employeeDocument), async (req: Request, res: Response) => {
  try {
    const document = await prisma.employeeDocument.findUnique({
      where: { id: req.params.id },
      include: {
        employee: { select: { id: true, firstName: true, lastName: true, employeeNumber: true, departmentId: true } },
      },
    });

    if (!document) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    res.json({ success: true, data: document });
  } catch (error) {
    logger.error('Error fetching document', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' } });
  }
});

// POST /api/documents - Upload document
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      documentType: z.enum([
        'CONTRACT', 'OFFER_LETTER', 'NDA', 'POLICY_ACKNOWLEDGMENT', 'ID_PROOF', 'ADDRESS_PROOF',
        'EDUCATION_CERTIFICATE', 'EXPERIENCE_LETTER', 'BACKGROUND_CHECK', 'MEDICAL_CERTIFICATE',
        'TAX_FORM', 'BANK_DETAILS', 'PERFORMANCE_LETTER', 'WARNING_LETTER', 'TERMINATION_LETTER', 'OTHER'
      ]),
      title: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      fileName: z.string().trim().min(1).max(500),
      fileUrl: z.string().trim().url(),
      fileSize: z.number().nonnegative().optional(),
      mimeType: z.string().optional(),
      issueDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      expiryDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      issuingAuthority: z.string().optional(),
      documentNumber: z.string().optional(),
      requiresSignature: z.boolean().default(false),
      isConfidential: z.boolean().default(false),
      accessRoles: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const document = await prisma.employeeDocument.create({
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : undefined,
        expiryDate: data.expiryDate ? new Date(data.expiryDate) : undefined,
        status: 'ACTIVE',
        version: 1,
      },
      include: { employee: { select: { firstName: true, lastName: true } } },
    });

    res.status(201).json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating document', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } });
  }
});

// PUT /api/documents/:id - Update document
router.put('/:id', checkOwnership(prisma.employeeDocument), async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['ACTIVE', 'EXPIRED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'ARCHIVED']).optional(),
      expiryDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      verifiedById: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData = { ...data } as Record<string, unknown>;
    if (data.expiryDate) updateData.expiryDate = new Date(data.expiryDate);
    if (data.verifiedById) updateData.verifiedAt = new Date();

    const document = await prisma.employeeDocument.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json({ success: true, data: document });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error updating document', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update document' } });
  }
});

// POST /api/documents/:id/sign - E-sign document
router.post('/:id/sign', async (req: Request, res: Response) => {
  try {
    const { signatureUrl } = req.body;

    const document = await prisma.employeeDocument.update({
      where: { id: req.params.id },
      data: {
        signedAt: new Date(),
        signatureUrl,
      },
    });

    res.json({ success: true, data: document });
  } catch (error) {
    logger.error('Error signing document', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to sign document' } });
  }
});

// DELETE /api/documents/:id - Archive document
router.delete('/:id', checkOwnership(prisma.employeeDocument), async (req: Request, res: Response) => {
  try {
    await prisma.employeeDocument.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Error archiving document', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive document' } });
  }
});

// Employee qualifications
// GET /api/documents/qualifications/:employeeId
router.get('/qualifications/:employeeId', async (req: Request, res: Response) => {
  try {
    const qualifications = await prisma.employeeQualification.findMany({
      where: { employeeId: req.params.employeeId, deletedAt: null } as any,
      orderBy: { endDate: 'desc' },
      take: 1000});

    res.json({ success: true, data: qualifications });
  } catch (error) {
    logger.error('Error fetching qualifications', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch qualifications' } });
  }
});

// POST /api/documents/qualifications - Add qualification
router.post('/qualifications', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      qualificationType: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE', 'PROFESSIONAL', 'OTHER']),
      institution: z.string(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      grade: z.string().optional(),
      startDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      endDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
      isOngoing: z.boolean().default(false),
      documentUrl: z.string().trim().url('Invalid URL').optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const qualification = await prisma.employeeQualification.create({
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
      },
    });

    res.status(201).json({ success: true, data: qualification });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error creating qualification', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create qualification' } });
  }
});

// Employee assets
// GET /api/documents/assets/:employeeId
router.get('/assets/:employeeId', async (req: Request, res: Response) => {
  try {
    const assets = await prisma.employeeAsset.findMany({
      where: { employeeId: req.params.employeeId, deletedAt: null } as any,
      orderBy: { assignedDate: 'desc' },
      take: 1000});

    res.json({ success: true, data: assets });
  } catch (error) {
    logger.error('Error fetching assets', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch assets' } });
  }
});

// POST /api/documents/assets - Assign asset
router.post('/assets', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().trim().uuid(),
      assetTag: z.string(),
      assetType: z.enum(['LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'ID_CARD', 'ACCESS_CARD', 'PARKING_PASS', 'FURNITURE', 'VEHICLE', 'OTHER']),
      name: z.string().trim().min(1).max(200),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      assignedDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format'),
      purchaseValue: z.number().optional(),
      condition: z.enum(['NEW', 'GOOD', 'FAIR', 'POOR', 'DAMAGED', 'LOST']).default('GOOD'),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const asset = await prisma.employeeAsset.create({
      data: {
        ...data,
        assignedDate: new Date(data.assignedDate),
        currentValue: data.purchaseValue,
      },
    });

    res.status(201).json({ success: true, data: asset });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: error.errors } });
    }
    logger.error('Error assigning asset', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to assign asset' } });
  }
});

// PUT /api/documents/assets/:id/return - Return asset
router.put('/assets/:id/return', async (req: Request, res: Response) => {
  try {
    const { returnCondition, notes } = req.body;

    const asset = await prisma.employeeAsset.update({
      where: { id: req.params.id },
      data: {
        returnDate: new Date(),
        returnCondition,
        notes,
      },
    });

    res.json({ success: true, data: asset });
  } catch (error) {
    logger.error('Error returning asset', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to return asset' } });
  }
});

export default router;
