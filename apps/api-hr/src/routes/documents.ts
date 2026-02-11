import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';

const router: Router = Router();

// GET /api/documents - Get employee documents
router.get('/', async (req: Request, res: Response) => {
  try {
    const { employeeId, documentType, status, expiringWithin, page = '1', limit = '20' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const take = parseInt(limit as string);

    const where: any = {};
    if (employeeId) where.employeeId = employeeId;
    if (documentType) where.documentType = documentType;
    if (status) where.status = status;
    if (expiringWithin) {
      const daysAhead = parseInt(expiringWithin as string);
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
        take,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.employeeDocument.count({ where }),
    ]);

    res.json({
      success: true,
      data: documents,
      meta: { page: parseInt(page as string), limit: take, total, totalPages: Math.ceil(total / take) },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch documents' } });
  }
});

// GET /api/documents/:id - Get single document
router.get('/:id', async (req: Request, res: Response) => {
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
    console.error('Error fetching document:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch document' } });
  }
});

// POST /api/documents - Upload document
router.post('/', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      documentType: z.enum([
        'CONTRACT', 'OFFER_LETTER', 'NDA', 'POLICY_ACKNOWLEDGMENT', 'ID_PROOF', 'ADDRESS_PROOF',
        'EDUCATION_CERTIFICATE', 'EXPERIENCE_LETTER', 'BACKGROUND_CHECK', 'MEDICAL_CERTIFICATE',
        'TAX_FORM', 'BANK_DETAILS', 'PERFORMANCE_LETTER', 'WARNING_LETTER', 'TERMINATION_LETTER', 'OTHER'
      ]),
      title: z.string().min(1),
      description: z.string().optional(),
      fileName: z.string(),
      fileUrl: z.string().url(),
      fileSize: z.number().optional(),
      mimeType: z.string().optional(),
      issueDate: z.string().optional(),
      expiryDate: z.string().optional(),
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
    console.error('Error creating document:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create document' } });
  }
});

// PUT /api/documents/:id - Update document
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      status: z.enum(['ACTIVE', 'EXPIRED', 'PENDING_VERIFICATION', 'VERIFIED', 'REJECTED', 'ARCHIVED']).optional(),
      expiryDate: z.string().optional(),
      verifiedById: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
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
    console.error('Error updating document:', error);
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
    console.error('Error signing document:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to sign document' } });
  }
});

// DELETE /api/documents/:id - Archive document
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.employeeDocument.update({
      where: { id: req.params.id },
      data: { status: 'ARCHIVED' },
    });

    res.json({ success: true, message: 'Document archived' });
  } catch (error) {
    console.error('Error archiving document:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to archive document' } });
  }
});

// Employee qualifications
// GET /api/documents/qualifications/:employeeId
router.get('/qualifications/:employeeId', async (req: Request, res: Response) => {
  try {
    const qualifications = await prisma.employeeQualification.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { endDate: 'desc' },
    });

    res.json({ success: true, data: qualifications });
  } catch (error) {
    console.error('Error fetching qualifications:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch qualifications' } });
  }
});

// POST /api/documents/qualifications - Add qualification
router.post('/qualifications', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      qualificationType: z.enum(['HIGH_SCHOOL', 'ASSOCIATE', 'BACHELOR', 'MASTER', 'DOCTORATE', 'DIPLOMA', 'CERTIFICATE', 'PROFESSIONAL', 'OTHER']),
      institution: z.string(),
      degree: z.string().optional(),
      fieldOfStudy: z.string().optional(),
      grade: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      isOngoing: z.boolean().default(false),
      documentUrl: z.string().optional(),
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
    console.error('Error creating qualification:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create qualification' } });
  }
});

// Employee assets
// GET /api/documents/assets/:employeeId
router.get('/assets/:employeeId', async (req: Request, res: Response) => {
  try {
    const assets = await prisma.employeeAsset.findMany({
      where: { employeeId: req.params.employeeId },
      orderBy: { assignedDate: 'desc' },
    });

    res.json({ success: true, data: assets });
  } catch (error) {
    console.error('Error fetching assets:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch assets' } });
  }
});

// POST /api/documents/assets - Assign asset
router.post('/assets', async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      employeeId: z.string().uuid(),
      assetTag: z.string(),
      assetType: z.enum(['LAPTOP', 'DESKTOP', 'MOBILE', 'TABLET', 'MONITOR', 'KEYBOARD', 'MOUSE', 'HEADSET', 'ID_CARD', 'ACCESS_CARD', 'PARKING_PASS', 'FURNITURE', 'VEHICLE', 'OTHER']),
      name: z.string(),
      description: z.string().optional(),
      serialNumber: z.string().optional(),
      model: z.string().optional(),
      manufacturer: z.string().optional(),
      assignedDate: z.string(),
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
    console.error('Error assigning asset:', error);
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
    console.error('Error returning asset:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to return asset' } });
  }
});

export default router;
