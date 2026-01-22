import { Router } from 'express';
import type { Router as IRouter } from 'express';
import { z } from 'zod';
import { prisma } from '@ims/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router: IRouter = Router();

// Validation schemas
const createLegalSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum([
    'LEGISLATION', 'REGULATION', 'CODE_OF_PRACTICE', 'PERMIT', 'LICENSE',
    'STANDARD', 'CUSTOMER_REQUIREMENT', 'INTERNAL_REQUIREMENT', 'OTHER',
  ]),
  jurisdiction: z.string().optional(),
  issuingBody: z.string().optional(),
  referenceNumber: z.string().optional(),
  effectiveDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),
  reviewFrequency: z.string().optional(),
  responsiblePerson: z.string().optional(),
});

const updateLegalSchema = createLegalSchema.partial().extend({
  complianceStatus: z.enum(['COMPLIANT', 'PARTIALLY_COMPLIANT', 'NON_COMPLIANT', 'PENDING', 'NOT_APPLICABLE']).optional(),
  complianceEvidence: z.string().optional(),
  nextAssessmentDate: z.string().datetime().optional(),
});

// GET /api/legal-requirements - List all legal requirements
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      standard,
      type,
      complianceStatus,
      search,
      page = '1',
      limit = '20',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (type) where.type = type;
    if (complianceStatus) where.complianceStatus = complianceStatus;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [requirements, total] = await Promise.all([
      prisma.legalRequirement.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          _count: {
            select: { actions: true },
          },
        },
      }),
      prisma.legalRequirement.count({ where }),
    ]);

    res.json({
      success: true,
      data: requirements,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/legal-requirements/compliance - Get compliance summary
router.get('/compliance', authenticate, async (req, res, next) => {
  try {
    const { standard } = req.query;
    const where: any = {};
    if (standard) where.standard = standard;

    const [total, byStatus, byStandard] = await Promise.all([
      prisma.legalRequirement.count({ where }),
      prisma.legalRequirement.groupBy({
        by: ['complianceStatus'],
        where,
        _count: { id: true },
      }),
      prisma.legalRequirement.groupBy({
        by: ['standard', 'complianceStatus'],
        _count: { id: true },
      }),
    ]);

    const statusCounts = byStatus.reduce(
      (acc, item) => ({ ...acc, [item.complianceStatus]: item._count.id }),
      { COMPLIANT: 0, PARTIALLY_COMPLIANT: 0, NON_COMPLIANT: 0, PENDING: 0, NOT_APPLICABLE: 0 }
    );

    const compliantCount = statusCounts.COMPLIANT + statusCounts.NOT_APPLICABLE;
    const applicableCount = total - statusCounts.NOT_APPLICABLE;
    const compliancePercentage = applicableCount > 0 ? Math.round((compliantCount / applicableCount) * 100) : 100;

    res.json({
      success: true,
      data: {
        total,
        compliancePercentage,
        byStatus: statusCounts,
        byStandard: byStandard.reduce((acc, item) => {
          if (!acc[item.standard]) acc[item.standard] = {};
          acc[item.standard][item.complianceStatus] = item._count.id;
          return acc;
        }, {} as Record<string, Record<string, number>>),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/legal-requirements/:id - Get single requirement
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const requirement = await prisma.legalRequirement.findUnique({
      where: { id: req.params.id },
      include: {
        actions: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
      },
    });

    if (!requirement) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal requirement not found' },
      });
    }

    res.json({ success: true, data: requirement });
  } catch (error) {
    next(error);
  }
});

// POST /api/legal-requirements - Create new requirement
router.post('/', authenticate, requireRole(['ADMIN', 'MANAGER']), validate(createLegalSchema), async (req, res, next) => {
  try {
    const requirement = await prisma.legalRequirement.create({
      data: {
        ...req.body,
        effectiveDate: req.body.effectiveDate ? new Date(req.body.effectiveDate) : undefined,
        expiryDate: req.body.expiryDate ? new Date(req.body.expiryDate) : undefined,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'LegalRequirement',
        entityId: requirement.id,
        newData: requirement as any,
      },
    });

    res.status(201).json({ success: true, data: requirement });
  } catch (error) {
    next(error);
  }
});

// PUT /api/legal-requirements/:id - Update requirement
router.put('/:id', authenticate, validate(updateLegalSchema), async (req, res, next) => {
  try {
    const existing = await prisma.legalRequirement.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal requirement not found' },
      });
    }

    const updateData: any = { ...req.body };
    if (req.body.effectiveDate) updateData.effectiveDate = new Date(req.body.effectiveDate);
    if (req.body.expiryDate) updateData.expiryDate = new Date(req.body.expiryDate);
    if (req.body.nextAssessmentDate) updateData.nextAssessmentDate = new Date(req.body.nextAssessmentDate);
    if (req.body.complianceStatus && req.body.complianceStatus !== existing.complianceStatus) {
      updateData.lastAssessedAt = new Date();
    }

    const requirement = await prisma.legalRequirement.update({
      where: { id: req.params.id },
      data: updateData,
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'LegalRequirement',
        entityId: requirement.id,
        oldData: existing as any,
        newData: requirement as any,
      },
    });

    res.json({ success: true, data: requirement });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/legal-requirements/:id - Delete requirement
router.delete('/:id', authenticate, requireRole(['ADMIN']), async (req, res, next) => {
  try {
    const existing = await prisma.legalRequirement.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Legal requirement not found' },
      });
    }

    await prisma.legalRequirement.delete({
      where: { id: req.params.id },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'LegalRequirement',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Legal requirement deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
