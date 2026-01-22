import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();
const STANDARD = 'ISO_9001';

// Quality incident types
const QUALITY_INCIDENT_TYPES = [
  'NON_CONFORMANCE',
  'CUSTOMER_COMPLAINT',
  'SUPPLIER_ISSUE',
  'PROCESS_DEVIATION',
  'PRODUCT_DEFECT',
  'AUDIT_FINDING',
] as const;

router.use(authenticate);

// Generate reference number
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `NC-${year}${month}-${random}`;
}

// GET /api/incidents - List non-conformances
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, type, severity } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { standard: STANDARD };
    if (status) where.status = status;
    if (type) where.type = type;
    if (severity) where.severity = severity;

    const [ncs, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dateOccurred: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    res.json({
      success: true,
      data: ncs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List NCs error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list non-conformances' } });
  }
});

// GET /api/incidents/:id - Get single NC
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const nc = await prisma.incident.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: true,
        fiveWhyAnalysis: true,
        fishboneAnalysis: true,
      },
    });

    if (!nc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    res.json({ success: true, data: nc });
  } catch (error) {
    console.error('Get NC error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get non-conformance' } });
  }
});

// POST /api/incidents - Create NC
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(QUALITY_INCIDENT_TYPES),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).default('MODERATE'),
      category: z.string().optional(),
      location: z.string().optional(),
      dateOccurred: z.string(),
      productAffected: z.string().optional(),
      customerImpact: z.string().optional(),
      costOfNonConformance: z.number().optional(),
      riskId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const nc = await prisma.incident.create({
      data: {
        id: uuidv4(),
        standard: STANDARD,
        referenceNumber: generateReferenceNumber(),
        ...data,
        dateOccurred: new Date(data.dateOccurred),
        dateReported: new Date(),
        reporterId: req.user!.id,
        status: 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: nc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create NC error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create non-conformance' } });
  }
});

// PATCH /api/incidents/:id - Update NC
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(QUALITY_INCIDENT_TYPES).optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      productAffected: z.string().optional(),
      customerImpact: z.string().optional(),
      costOfNonConformance: z.number().optional(),
      immediateCause: z.string().optional(),
      rootCauses: z.string().optional(),
      contributingFactors: z.string().optional(),
      investigatorId: z.string().optional(),
      status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED']).optional(),
    });

    const data = schema.parse(req.body);

    const nc = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        ...data,
        closedAt: data.status === 'CLOSED' ? new Date() : existing.closedAt,
      },
    });

    res.json({ success: true, data: nc });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update NC error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update non-conformance' } });
  }
});

// DELETE /api/incidents/:id - Delete NC
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Non-conformance not found' } });
    }

    await prisma.incident.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Non-conformance deleted successfully' } });
  } catch (error) {
    console.error('Delete NC error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete non-conformance' } });
  }
});

export default router;
