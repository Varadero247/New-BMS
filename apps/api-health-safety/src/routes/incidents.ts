import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router: IRouter = Router();
const STANDARD = 'ISO_45001';

// H&S incident types
const HS_INCIDENT_TYPES = [
  'INJURY',
  'NEAR_MISS',
  'DANGEROUS_OCCURRENCE',
  'OCCUPATIONAL_ILLNESS',
  'PROPERTY_DAMAGE',
] as const;

router.use(authenticate);

// Generate reference number
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `HS-${year}${month}-${random}`;
}

// GET /api/incidents - List H&S incidents
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

    const [incidents, total] = await Promise.all([
      prisma.incident.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { dateOccurred: 'desc' },
        include: {
          reporter: { select: { id: true, firstName: true, lastName: true } },
          investigator: { select: { id: true, firstName: true, lastName: true } },
        },
      }),
      prisma.incident.count({ where }),
    ]);

    res.json({
      success: true,
      data: incidents,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List incidents error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list incidents' } });
  }
});

// GET /api/incidents/:id - Get single incident
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const incident = await prisma.incident.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        investigator: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: true,
        fiveWhyAnalysis: true,
        fishboneAnalysis: true,
      },
    });

    if (!incident) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    res.json({ success: true, data: incident });
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get incident' } });
  }
});

// POST /api/incidents - Create incident
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(HS_INCIDENT_TYPES),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).default('MODERATE'),
      category: z.string().optional(),
      location: z.string().optional(),
      dateOccurred: z.string(),
      personsInvolved: z.string().optional(),
      injuryType: z.string().optional(),
      bodyPart: z.string().optional(),
      daysLost: z.number().optional(),
      treatmentType: z.string().optional(),
      riskId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const incident = await prisma.incident.create({
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

    res.status(201).json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create incident error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create incident' } });
  }
});

// PATCH /api/incidents/:id - Update incident
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(HS_INCIDENT_TYPES).optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      personsInvolved: z.string().optional(),
      injuryType: z.string().optional(),
      bodyPart: z.string().optional(),
      daysLost: z.number().optional(),
      treatmentType: z.string().optional(),
      immediateCause: z.string().optional(),
      rootCauses: z.string().optional(),
      contributingFactors: z.string().optional(),
      investigatorId: z.string().optional(),
      status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED']).optional(),
    });

    const data = schema.parse(req.body);

    const incident = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        ...data,
        closedAt: data.status === 'CLOSED' ? new Date() : existing.closedAt,
      },
    });

    res.json({ success: true, data: incident });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update incident error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update incident' } });
  }
});

// DELETE /api/incidents/:id - Delete incident
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    }

    await prisma.incident.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Incident deleted successfully' } });
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete incident' } });
  }
});

export default router;
