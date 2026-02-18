import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-health-safety');
const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// =============================================
// Constants
// =============================================

const COMMUNICATION_TYPES = [
  'WORKER_CONSULTATION',
  'MANAGEMENT_NOTIFICATION',
  'REGULATORY',
  'EXTERNAL_STAKEHOLDER',
  'CONTRACTOR_BRIEFING',
  'TOOLBOX_TALK',
  'COMMITTEE_MEETING',
] as const;

const DIRECTIONS = ['INTERNAL', 'EXTERNAL'] as const;

const STATUSES = ['DRAFT', 'SENT', 'ACKNOWLEDGED', 'RESPONDED', 'CLOSED'] as const;

// =============================================
// Reference number generator
// =============================================

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `HS-COMM-${yy}${mm}`;
  const count = await prisma.hSCommunication.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// =============================================
// POST / — Create communication
// =============================================

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      subject: z.string().trim().min(1).max(200),
      type: z.enum(COMMUNICATION_TYPES),
      direction: z.enum(DIRECTIONS),
      content: z.string().trim().min(1),
      recipients: z.string().trim().optional(),
      sender: z.string().trim().optional(),
      relatedIncidentId: z.string().trim().optional(),
      scheduledDate: z
        .string()
        .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
        .optional(),
      attendees: z.string().trim().optional(),
      location: z.string().trim().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const communication = await prisma.hSCommunication.create({
      data: {
        refNumber,
        subject: data.subject,
        type: data.type,
        direction: data.direction,
        content: data.content,
        recipients: data.recipients,
        sender: data.sender || req.user!.email,
        relatedIncidentId: data.relatedIncidentId,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
        attendees: data.attendees,
        location: data.location,
        priority: data.priority || 'MEDIUM',
        status: 'DRAFT' as any,
        createdBy: req.user!.id,
      } as any,
    });

    res.status(201).json({ success: true, data: communication });
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
    logger.error('Create communication error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create communication' },
    });
  }
});

// =============================================
// GET / — List with filters
// =============================================

router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const {
      page = '1',
      limit = '20',
      direction,
      type,
      status,
      dateFrom,
      dateTo,
      search,
    } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (direction) where.direction = direction as any;
    if (type) where.type = type as any;
    if (status) where.status = status as any;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) (where.createdAt as any).gte = new Date(dateFrom as string);
      if (dateTo) (where.createdAt as any).lte = new Date(dateTo as string);
    }
    if (search) {
      where.OR = [
        { subject: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { content: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.hSCommunication.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.hSCommunication.count({ where }),
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
    logger.error('List communications error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list communications' },
    });
  }
});

// =============================================
// GET /participation — Worker participation summary
// =============================================

router.get('/participation', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const where: Record<string, unknown> = { deletedAt: null };

    const [total, communications] = await Promise.all([
      prisma.hSCommunication.count({ where }),
      prisma.hSCommunication.findMany({
        where,
        select: { type: true, direction: true, status: true, createdAt: true } as any,
        take: 1000,
      }),
    ]);

    const byType: Record<string, number> = {};
    const byDirection: Record<string, number> = { INTERNAL: 0, EXTERNAL: 0 };
    const byStatus: Record<string, number> = {};
    let workerConsultations = 0;
    let toolboxTalks = 0;
    let committeeMeetings = 0;

    for (const c of communications as any[]) {
      byType[c.type] = (byType[c.type] || 0) + 1;
      byDirection[c.direction] = (byDirection[c.direction] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
      if (c.type === 'WORKER_CONSULTATION') workerConsultations++;
      if (c.type === 'TOOLBOX_TALK') toolboxTalks++;
      if (c.type === 'COMMITTEE_MEETING') committeeMeetings++;
    }

    res.json({
      success: true,
      data: {
        total,
        byType,
        byDirection,
        byStatus,
        workerConsultations,
        toolboxTalks,
        committeeMeetings,
        participationScore:
          total > 0
            ? Math.round(((workerConsultations + toolboxTalks + committeeMeetings) / total) * 100)
            : 0,
      },
    });
  } catch (error) {
    logger.error('Participation summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get participation summary' },
    });
  }
});

// =============================================
// GET /:id — Get communication detail
// =============================================

router.get(
  '/:id',
  checkOwnership(prisma.hSCommunication),
  async (req: AuthRequest, res: Response) => {
    try {
      const communication = await prisma.hSCommunication.findUnique({
        where: { id: req.params.id },
      });

      if (!communication || communication.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Communication not found' },
        });
      }

      res.json({ success: true, data: communication });
    } catch (error) {
      logger.error('Get communication error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get communication' },
      });
    }
  }
);

// =============================================
// PUT /:id — Update/respond
// =============================================

router.put(
  '/:id',
  checkOwnership(prisma.hSCommunication),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.hSCommunication.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Communication not found' },
        });
      }

      const schema = z.object({
        subject: z.string().trim().min(1).max(200).optional(),
        content: z.string().trim().optional(),
        recipients: z.string().trim().optional(),
        response: z.string().trim().optional(),
        status: z.enum(['DRAFT', 'SENT', 'ACKNOWLEDGED', 'RESPONDED', 'CLOSED']).optional(),
        attendees: z.string().trim().optional(),
        location: z.string().trim().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
        scheduledDate: z
          .string()
          .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
          .optional(),
        outcome: z.string().trim().optional(),
      });

      const data = schema.parse(req.body);

      const updateData: Record<string, unknown> = {};
      if (data.subject !== undefined) updateData.subject = data.subject;
      if (data.content !== undefined) updateData.content = data.content;
      if (data.recipients !== undefined) updateData.recipients = data.recipients;
      if (data.response !== undefined) {
        updateData.response = data.response;
        updateData.respondedBy = req.user!.id;
        updateData.respondedAt = new Date();
      }
      if (data.status !== undefined) updateData.status = data.status;
      if (data.attendees !== undefined) updateData.attendees = data.attendees;
      if (data.location !== undefined) updateData.location = data.location;
      if (data.priority !== undefined) updateData.priority = data.priority;
      if (data.scheduledDate !== undefined) updateData.scheduledDate = new Date(data.scheduledDate);
      if (data.outcome !== undefined) updateData.outcome = data.outcome;

      const communication = await prisma.hSCommunication.update({
        where: { id: req.params.id },
        data: updateData,
      });

      res.json({ success: true, data: communication });
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
      logger.error('Update communication error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to update communication' },
      });
    }
  }
);

// =============================================
// DELETE /:id — Soft delete
// =============================================

router.delete(
  '/:id',
  checkOwnership(prisma.hSCommunication),
  async (req: AuthRequest, res: Response) => {
    try {
      const existing = await prisma.hSCommunication.findUnique({ where: { id: req.params.id } });
      if (!existing || existing.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Communication not found' },
        });
      }

      await prisma.hSCommunication.update({
        where: { id: req.params.id },
        data: { deletedAt: new Date(), deletedBy: req.user!.id } as any,
      });

      res.json({ success: true, data: { message: 'Communication deleted' } });
    } catch (error) {
      logger.error('Delete communication error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to delete communication' },
      });
    }
  }
);

export default router;
