// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('api-crm:contacts');

router.use(authenticate);

const createContactSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().optional(),
  mobile: z.string().trim().optional(),
  jobTitle: z.string().trim().optional(),
  department: z.string().trim().optional(),
  accountId: z.string().trim().uuid().optional(),
  source: z.string().trim().optional(),
  tags: z.array(z.string().trim()).optional(),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateContactSchema = createContactSchema.partial();

const activitySchema = z.object({
  type: z.enum(['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK']),
  subject: z.string().trim().min(1, 'Subject is required'),
  description: z.string().trim().optional(),
  dueDate: z.string().trim().datetime({ offset: true }).optional(),
  duration: z.number().int().positive().optional(),
  outcome: z.string().trim().optional(),
});

// POST / — Create contact
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createContactSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const contact = await prisma.crmContact.create({
      data: {
        id: uuidv4(),
        ...validation.data,
        source: (validation.data.source || 'INBOUND') as Prisma.CrmContactCreateInput['source'],
        createdBy: (req as AuthRequest).user?.id || 'system',
      } as Prisma.CrmContactUncheckedCreateInput,
    });

    logger.info('Contact created', { contactId: contact.id });
    return res.status(201).json({ success: true, data: contact });
  } catch (error: unknown) {
    logger.error('Failed to create contact', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contact' },
    });
  }
});

// GET / — List contacts
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const accountId = req.query.accountId as string;
    const tags = req.query.tags as string;
    const source = req.query.source as string;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    if (source) {
      where.source = source;
    }

    const [contacts, total] = await Promise.all([
      prisma.crmContact.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmContact.count({ where }),
    ]);

    return res.json({
      success: true,
      data: contacts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list contacts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contacts' },
    });
  }
});

// GET /:id — Get contact detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.crmContact.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    return res.json({ success: true, data: contact });
  } catch (error: unknown) {
    logger.error('Failed to get contact', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contact' },
    });
  }
});

// PUT /:id — Update contact
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validation = updateContactSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const existing = await prisma.crmContact.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    const contact = await prisma.crmContact.update({
      where: { id: req.params.id },
      data: {
        ...validation.data,
        ...(validation.data.source ? { source: validation.data.source as Prisma.CrmContactCreateInput['source'] } : {}),
      } as Prisma.CrmContactUncheckedUpdateInput,
    });

    logger.info('Contact updated', { contactId: contact.id });
    return res.json({ success: true, data: contact });
  } catch (error: unknown) {
    logger.error('Failed to update contact', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update contact' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmContact.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    await prisma.crmContact.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Contact soft deleted', { contactId: req.params.id });
    return res.json({ success: true, data: { message: 'Contact deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete contact', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contact' },
    });
  }
});

// POST /:id/activities — Log activity
router.post('/:id/activities', async (req: Request, res: Response) => {
  try {
    const validation = activitySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const contact = await prisma.crmContact.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    const activity = await prisma.crmActivity.create({
      data: {
        id: uuidv4(),
        contactId: req.params.id,
        ...validation.data,
        dueDate: validation.data.dueDate ? new Date(validation.data.dueDate) : undefined,
        createdBy: (req as AuthRequest).user?.id || 'system',
      },
    });

    logger.info('Activity logged', { activityId: activity.id, contactId: req.params.id });
    return res.status(201).json({ success: true, data: activity });
  } catch (error: unknown) {
    logger.error('Failed to log activity', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to log activity' },
    });
  }
});

// GET /:id/activities — List activities for contact
router.get('/:id/activities', async (req: Request, res: Response) => {
  try {
    const contact = await prisma.crmContact.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!contact) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contact not found' } });
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [activities, total] = await Promise.all([
      prisma.crmActivity.findMany({
        where: { contactId: req.params.id },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmActivity.count({ where: { contactId: req.params.id } }),
    ]);

    return res.json({
      success: true,
      data: activities,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list activities', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list activities' },
    });
  }
});

export default router;
