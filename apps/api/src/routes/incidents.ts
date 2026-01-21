import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '@new-bms/database';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

// Validation schemas
const createIncidentSchema = z.object({
  standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']),
  title: z.string().min(1).max(200),
  description: z.string().min(1),
  type: z.enum([
    'INJURY', 'NEAR_MISS', 'DANGEROUS_OCCURRENCE', 'OCCUPATIONAL_ILLNESS', 'PROPERTY_DAMAGE',
    'SPILL', 'EMISSION', 'WASTE_INCIDENT', 'ENVIRONMENTAL_COMPLAINT', 'REGULATORY_BREACH',
    'NON_CONFORMANCE', 'CUSTOMER_COMPLAINT', 'SUPPLIER_ISSUE', 'PROCESS_DEVIATION', 'PRODUCT_DEFECT', 'AUDIT_FINDING',
  ]),
  severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).default('MINOR'),
  category: z.string().optional(),
  location: z.string().optional(),
  dateOccurred: z.string().datetime(),
  personsInvolved: z.string().optional(),
  injuryType: z.string().optional(),
  bodyPart: z.string().optional(),
  daysLost: z.number().optional(),
  treatmentType: z.string().optional(),
  environmentalMedia: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  regulatoryReport: z.boolean().default(false),
  productAffected: z.string().optional(),
  customerImpact: z.string().optional(),
  costOfNonConformance: z.number().optional(),
  riskId: z.string().optional(),
});

const updateIncidentSchema = createIncidentSchema.partial().extend({
  status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED']).optional(),
  investigatorId: z.string().optional(),
  immediateCause: z.string().optional(),
  rootCauses: z.string().optional(),
  contributingFactors: z.string().optional(),
});

// Generate reference number
function generateReferenceNumber(standard: string): string {
  const prefix = {
    ISO_45001: 'HS',
    ISO_14001: 'ENV',
    ISO_9001: 'QA',
  }[standard] || 'INC';
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}-${year}${month}-${random}`;
}

// GET /api/incidents - List all incidents with filtering
router.get('/', authenticate, async (req, res, next) => {
  try {
    const {
      standard,
      status,
      type,
      severity,
      search,
      startDate,
      endDate,
      page = '1',
      limit = '20',
      sortBy = 'dateOccurred',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};

    if (standard) where.standard = standard;
    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { referenceNumber: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (startDate || endDate) {
      where.dateOccurred = {};
      if (startDate) where.dateOccurred.gte = new Date(startDate as string);
      if (endDate) where.dateOccurred.lte = new Date(endDate as string);
    }

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { [sortBy as string]: sortOrder },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
          investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
          _count: {
            select: { actions: true },
          },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
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

// GET /api/incidents/stats - Get incident statistics
router.get('/stats', authenticate, async (req, res, next) => {
  try {
    const { standard, year, month } = req.query;

    const where: any = {};
    if (standard) where.standard = standard;

    // Filter by date if provided
    if (year) {
      const startDate = new Date(parseInt(year as string), month ? parseInt(month as string) - 1 : 0, 1);
      const endDate = new Date(parseInt(year as string), month ? parseInt(month as string) : 12, 0);
      where.dateOccurred = { gte: startDate, lte: endDate };
    }

    const [total, open, byType, bySeverity, byStandard] = await Promise.all([
      prisma.incident.count({ where }),
      prisma.incident.count({ where: { ...where, status: { not: 'CLOSED' } } }),
      prisma.incident.groupBy({
        by: ['type'],
        where,
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['severity'],
        where,
        _count: { id: true },
      }),
      prisma.incident.groupBy({
        by: ['standard'],
        where,
        _count: { id: true },
      }),
    ]);

    res.json({
      success: true,
      data: {
        total,
        open,
        closed: total - open,
        byType: byType.reduce((acc, item) => ({ ...acc, [item.type]: item._count.id }), {}),
        bySeverity: bySeverity.reduce((acc, item) => ({ ...acc, [item.severity]: item._count.id }), {}),
        byStandard: byStandard.reduce((acc, item) => ({ ...acc, [item.standard]: item._count.id }), {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/incidents/:id - Get single incident
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const incident = await prisma.incident.findUnique({
      where: { id: req.params.id },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
        risk: true,
        actions: {
          include: {
            owner: { select: { id: true, firstName: true, lastName: true, email: true } },
          },
        },
        fiveWhyAnalyses: true,
        fishboneAnalyses: true,
        paretoAnalyses: true,
        aiAnalyses: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!incident) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Incident not found' },
      });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
});

// POST /api/incidents - Create new incident
router.post('/', authenticate, validate(createIncidentSchema), async (req, res, next) => {
  try {
    const referenceNumber = generateReferenceNumber(req.body.standard);

    const incident = await prisma.incident.create({
      data: {
        ...req.body,
        referenceNumber,
        reporterId: req.user!.id,
        dateOccurred: new Date(req.body.dateOccurred),
      },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE',
        entity: 'Incident',
        entityId: incident.id,
        newData: incident as any,
      },
    });

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
});

// PUT /api/incidents/:id - Update incident
router.put('/:id', authenticate, validate(updateIncidentSchema), async (req, res, next) => {
  try {
    const existing = await prisma.incident.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Incident not found' },
      });
    }

    const updateData: any = { ...req.body };
    if (req.body.dateOccurred) {
      updateData.dateOccurred = new Date(req.body.dateOccurred);
    }
    if (req.body.status === 'CLOSED') {
      updateData.closedAt = new Date();
    }

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: updateData,
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
      },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE',
        entity: 'Incident',
        entityId: incident.id,
        oldData: existing as any,
        newData: incident as any,
      },
    });

    res.json({ success: true, data: incident });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', authenticate, requireRole(['ADMIN', 'MANAGER']), async (req, res, next) => {
  try {
    const existing = await prisma.incident.findUnique({
      where: { id: req.params.id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Incident not found' },
      });
    }

    await prisma.incident.delete({
      where: { id: req.params.id },
    });

    // Log audit
    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE',
        entity: 'Incident',
        entityId: req.params.id,
        oldData: existing as any,
      },
    });

    res.json({ success: true, data: { message: 'Incident deleted successfully' } });
  } catch (error) {
    next(error);
  }
});

export default router;
