import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-crm');

// ============================================
// CAMPAIGN ROUTER (mounted at /api/campaigns)
// ============================================

export const campaignRouter = Router();
campaignRouter.use(authenticate);
campaignRouter.param('id', validateIdParam());

const createCampaignSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  type: z.enum(['EMAIL', 'EVENT', 'SOCIAL', 'CONTENT', 'PAID_ADS', 'REFERRAL']),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED']).optional(),
  startDate: z.string().trim().datetime({ offset: true }).optional(),
  endDate: z.string().trim().datetime({ offset: true }).optional(),
  budget: z.number().min(0).optional(),
  targetAudience: z.string().trim().optional(),
  description: z.string().trim().optional(),
});

const _updateCampaignSchema = createCampaignSchema.partial();

const addContactsSchema = z.object({
  contactIds: z.array(z.string().trim()).min(1, 'At least one contact ID is required'),
});

// POST / — Create campaign
campaignRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createCampaignSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const { startDate, endDate, ...data } = validation.data;
    const userId = (req as AuthRequest).user?.id || 'system';

    const campaign = await prisma.crmCampaign.create({
      data: {
        ...data,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : undefined,
        createdBy: userId,
      },
    });

    logger.info('Campaign created', { campaignId: campaign.id });
    return res.status(201).json({ success: true, data: campaign });
  } catch (error: unknown) {
    logger.error('Failed to create campaign', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create campaign' },
    });
  }
});

// GET / — List campaigns
campaignRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.crmCampaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmCampaign.count({ where }),
    ]);

    return res.json({
      success: true,
      data: campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list campaigns', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list campaigns' },
    });
  }
});

// GET /:id — Campaign detail with member count
campaignRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.crmCampaign.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }

    const memberCount = await prisma.crmCampaignMember.count({
      where: { campaignId: req.params.id, deletedAt: null },
    });

    return res.json({
      success: true,
      data: { ...campaign, memberCount },
    });
  } catch (error: unknown) {
    logger.error('Failed to get campaign', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get campaign' },
    });
  }
});

// GET /:id/performance — Campaign performance stats
campaignRouter.get('/:id/performance', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.crmCampaign.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }

    const members = await prisma.crmCampaignMember.findMany({
      where: { campaignId: req.params.id, deletedAt: null },
      take: 1000,
    });

    const totalMembers = members.length;
    const sent = members.filter((m) =>
      ['SENT', 'OPENED', 'CLICKED', 'CONVERTED'].includes(m.status)
    ).length;
    const opened = members.filter((m) =>
      ['OPENED', 'CLICKED', 'CONVERTED'].includes(m.status)
    ).length;
    const clicked = members.filter((m) => ['CLICKED', 'CONVERTED'].includes(m.status)).length;
    const converted = members.filter((m) => m.status === 'CONVERTED').length;

    return res.json({
      success: true,
      data: {
        campaignId: req.params.id,
        totalMembers,
        sent,
        opened,
        clicked,
        converted,
        openRate: totalMembers > 0 ? Math.round((opened / totalMembers) * 10000) / 100 : 0,
        clickRate: totalMembers > 0 ? Math.round((clicked / totalMembers) * 10000) / 100 : 0,
        conversionRate: totalMembers > 0 ? Math.round((converted / totalMembers) * 10000) / 100 : 0,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get campaign performance', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get campaign performance' },
    });
  }
});

// POST /:id/contacts — Add contacts to campaign
campaignRouter.post('/:id/contacts', async (req: Request, res: Response) => {
  try {
    const campaign = await prisma.crmCampaign.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!campaign) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Campaign not found' } });
    }

    const validation = addContactsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const results = [];

    for (const contactId of validation.data.contactIds) {
      try {
        const member = await prisma.crmCampaignMember.create({
          data: {
            campaignId: req.params.id,
            contactId,
            createdBy: userId,
          },
        });
        results.push(member);
      } catch (err: unknown) {
        // Skip duplicates (unique constraint)
        if (
          err !== null &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code?: string }).code === 'P2002'
        ) {
          logger.warn('Contact already in campaign', { campaignId: req.params.id, contactId });
        } else {
          throw err;
        }
      }
    }

    logger.info('Contacts added to campaign', { campaignId: req.params.id, count: results.length });
    return res.status(201).json({ success: true, data: results });
  } catch (error: unknown) {
    logger.error('Failed to add contacts to campaign', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add contacts to campaign' },
    });
  }
});

// ============================================
// EMAIL SEQUENCE ROUTER (mounted at /api/email-sequences)
// ============================================

export const emailSequenceRouter = Router();
emailSequenceRouter.use(authenticate);

const createSequenceSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  description: z.string().trim().optional(),
  steps: z.any().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'PAUSED']).optional(),
});

const updateSequenceSchema = createSequenceSchema.partial();

const enrollContactsSchema = z.object({
  contactIds: z.array(z.string().trim()).min(1, 'At least one contact ID is required'),
});

// POST / — Create email sequence
emailSequenceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createSequenceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    const sequence = await prisma.crmEmailSequence.create({
      data: {
        ...validation.data,
        steps: validation.data.steps || [],
        createdBy: userId,
      },
    });

    logger.info('Email sequence created', { sequenceId: sequence.id });
    return res.status(201).json({ success: true, data: sequence });
  } catch (error: unknown) {
    logger.error('Failed to create email sequence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create email sequence' },
    });
  }
});

// GET / — List email sequences
emailSequenceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    const [sequences, total] = await Promise.all([
      prisma.crmEmailSequence.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmEmailSequence.count({ where }),
    ]);

    return res.json({
      success: true,
      data: sequences,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list email sequences', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list email sequences' },
    });
  }
});

// PUT /:id — Update email sequence
emailSequenceRouter.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmEmailSequence.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Email sequence not found' },
      });
    }

    const validation = updateSequenceSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const sequence = await prisma.crmEmailSequence.update({
      where: { id: req.params.id },
      data: validation.data,
    });

    logger.info('Email sequence updated', { sequenceId: sequence.id });
    return res.json({ success: true, data: sequence });
  } catch (error: unknown) {
    logger.error('Failed to update email sequence', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update email sequence' },
    });
  }
});

// PUT /:id/enroll — Enroll contacts in sequence
emailSequenceRouter.put('/:id/enroll', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmEmailSequence.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Email sequence not found' },
      });
    }

    const validation = enrollContactsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';
    const results = [];

    for (const contactId of validation.data.contactIds) {
      try {
        const enrollment = await prisma.crmEmailEnrollment.create({
          data: {
            sequenceId: req.params.id,
            contactId,
            createdBy: userId,
          },
        });
        results.push(enrollment);
      } catch (err: unknown) {
        // Skip duplicates (unique constraint)
        if (
          err !== null &&
          typeof err === 'object' &&
          'code' in err &&
          (err as { code?: string }).code === 'P2002'
        ) {
          logger.warn('Contact already enrolled in sequence', {
            sequenceId: req.params.id,
            contactId,
          });
        } else {
          throw err;
        }
      }
    }

    logger.info('Contacts enrolled in sequence', {
      sequenceId: req.params.id,
      count: results.length,
    });
    return res.json({ success: true, data: results });
  } catch (error: unknown) {
    logger.error('Failed to enroll contacts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enroll contacts' },
    });
  }
});

// Default export is campaignRouter (for backward compat with index.ts)
export default campaignRouter;
