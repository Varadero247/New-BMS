import { Router, Response } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const STANDARD = 'ISO_14001';

// Environmental incident types
const ENV_INCIDENT_TYPES = [
  'SPILL',
  'EMISSION',
  'WASTE_INCIDENT',
  'ENVIRONMENTAL_COMPLAINT',
  'REGULATORY_BREACH',
] as const;

router.use(authenticate);

// Generate reference number
function generateReferenceNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `ENV-${year}${month}-${random}`;
}

// GET /api/incidents - List environmental events
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

    const [events, total] = await Promise.all([
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
      data: events,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List events error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list events' } });
  }
});

// GET /api/incidents/:id - Get single event
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const event = await prisma.incident.findFirst({
      where: { id: req.params.id, standard: STANDARD },
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        actions: true,
      },
    });

    if (!event) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get event' } });
  }
});

// POST /api/incidents - Create environmental event
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      type: z.enum(ENV_INCIDENT_TYPES),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).default('MODERATE'),
      category: z.string().optional(),
      location: z.string().optional(),
      dateOccurred: z.string(),
      environmentalMedia: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      regulatoryReport: z.boolean().default(false),
      riskId: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const event = await prisma.incident.create({
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

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create event' } });
  }
});

// PATCH /api/incidents/:id - Update event
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      type: z.enum(ENV_INCIDENT_TYPES).optional(),
      severity: z.enum(['MINOR', 'MODERATE', 'MAJOR', 'CRITICAL', 'CATASTROPHIC']).optional(),
      category: z.string().optional(),
      location: z.string().optional(),
      environmentalMedia: z.string().optional(),
      quantity: z.number().optional(),
      unit: z.string().optional(),
      regulatoryReport: z.boolean().optional(),
      immediateCause: z.string().optional(),
      rootCauses: z.string().optional(),
      status: z.enum(['OPEN', 'UNDER_INVESTIGATION', 'AWAITING_ACTIONS', 'ACTIONS_IN_PROGRESS', 'VERIFICATION', 'CLOSED']).optional(),
    });

    const data = schema.parse(req.body);

    const event = await prisma.incident.update({
      where: { id: req.params.id },
      data: {
        ...data,
        closedAt: data.status === 'CLOSED' ? new Date() : existing.closedAt,
      },
    });

    res.json({ success: true, data: event });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update event' } });
  }
});

// DELETE /api/incidents/:id - Delete event
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.incident.findFirst({ where: { id: req.params.id, standard: STANDARD } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Event not found' } });
    }

    await prisma.incident.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Event deleted successfully' } });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete event' } });
  }
});

export default router;
