// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('api-crm');

router.use(authenticate);

const createLeadSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  email: z.string().trim().email('Valid email is required'),
  phone: z.string().trim().optional(),
  company: z.string().trim().optional(),
  source: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

const updateLeadSchema = createLeadSchema.partial();

const disqualifySchema = z.object({
  disqualifyReason: z.string().trim().min(1, 'Disqualify reason is required'),
});

function calculateLeadScore(source?: string, company?: string): number {
  let score = 10; // base
  if (source === 'REFERRAL') score += 30;
  else if (source === 'INBOUND') score += 20;
  else if (source === 'EVENT') score += 15;
  else if (source === 'PARTNER') score += 25;
  if (company) score += 10;
  return score;
}

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `LEAD-${yy}${mm}`;
  const count = await prisma.crmLead.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST / — Create lead
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createLeadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const refNumber = await generateRefNumber();
    const score = calculateLeadScore(validation.data.source, validation.data.company);
    const userId = (req as AuthRequest).user?.id || 'system';

    const lead = await prisma.crmLead.create({
      data: {
        ...validation.data,
        refNumber,
        score,
        createdBy: userId,
      },
    });

    logger.info('Lead created', { leadId: lead.id, refNumber });
    return res.status(201).json({ success: true, data: lead });
  } catch (error: unknown) {
    logger.error('Failed to create lead', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create lead' },
    });
  }
});

// GET / — List leads
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const source = req.query.source as string;
    const search = req.query.search as string;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status;
    if (source) where.source = source;
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [leads, total] = await Promise.all([
      prisma.crmLead.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmLead.count({ where }),
    ]);

    return res.json({
      success: true,
      data: leads,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list leads', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list leads' } });
  }
});

// GET /:id — Lead detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.crmLead.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }

    return res.json({ success: true, data: lead });
  } catch (error: unknown) {
    logger.error('Failed to get lead', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get lead' } });
  }
});

// PUT /:id — Update lead
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmLead.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }

    const validation = updateLeadSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    // Recalculate score if source or company changed
    const newSource = validation.data.source ?? existing.source ?? undefined;
    const newCompany = validation.data.company ?? existing.company ?? undefined;
    const score = calculateLeadScore(newSource, newCompany);

    const lead = await prisma.crmLead.update({
      where: { id: req.params.id },
      data: {
        ...validation.data,
        score,
      },
    });

    logger.info('Lead updated', { leadId: lead.id });
    return res.json({ success: true, data: lead });
  } catch (error: unknown) {
    logger.error('Failed to update lead', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update lead' },
    });
  }
});

// PUT /:id/qualify — Convert lead to deal + contact + account
router.put('/:id/qualify', async (req: Request, res: Response) => {
  try {
    const lead = await prisma.crmLead.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!lead) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }

    if (lead.status === 'QUALIFIED') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lead is already qualified' },
      });
    }

    if (lead.status === 'DISQUALIFIED') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Cannot qualify a disqualified lead' },
      });
    }

    const userId = (req as AuthRequest).user?.id || 'system';

    // Create contact from lead data
    const contact = await prisma.crmContact.create({
      data: {
        firstName: lead.firstName,
        lastName: lead.lastName,
        email: lead.email,
        phone: lead.phone,
        source: (lead.source || 'INBOUND') as 'INBOUND' | 'REFERRAL' | 'PARTNER' | 'OUTBOUND' | 'EVENT',
        createdBy: userId,
      },
    });

    // Create account from lead company (if provided)
    let account = null;
    if (lead.company) {
      account = await prisma.crmAccount.create({
        data: {
          name: lead.company,
          type: 'PROSPECT',
          createdBy: userId,
        },
      });

      // Link contact to account
      await prisma.crmContact.update({
        where: { id: contact.id },
        data: { accountId: account.id },
      });
    }

    // Generate deal ref number
    const now = new Date();
    const yy = String(now.getFullYear()).slice(-2);
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dealPrefix = `DEAL-${yy}${mm}`;
    const dealCount = await prisma.crmDeal.count({
      where: { refNumber: { startsWith: dealPrefix } },
    });
    const dealRefNumber = `${dealPrefix}-${String(dealCount + 1).padStart(4, '0')}`;

    // Create deal linked to contact and account
    const deal = await prisma.crmDeal.create({
      data: {
        refNumber: dealRefNumber,
        title: `${lead.firstName} ${lead.lastName} - Qualified Lead`,
        value: 0,
        source: (lead.source || undefined) as ('INBOUND' | 'REFERRAL' | 'PARTNER' | 'OUTBOUND' | 'EVENT') | undefined,
        accountId: account?.id,
        createdBy: userId,
      },
    });

    // Link deal to contact
    await prisma.crmDealContact.create({
      data: {
        dealId: deal.id,
        contactId: contact.id,
        role: 'PRIMARY',
        createdBy: userId,
      },
    });

    // Update lead status
    await prisma.crmLead.update({
      where: { id: req.params.id },
      data: {
        status: 'QUALIFIED',
        qualifiedAt: new Date(),
        convertedDealId: deal.id,
        convertedContactId: contact.id,
        convertedAccountId: account?.id,
      },
    });

    logger.info('Lead qualified', { leadId: lead.id, dealId: deal.id, contactId: contact.id });
    return res.json({
      success: true,
      data: { contact, account, deal },
    });
  } catch (error: unknown) {
    logger.error('Failed to qualify lead', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to qualify lead' },
    });
  }
});

// PUT /:id/disqualify — Set status to DISQUALIFIED
router.put('/:id/disqualify', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmLead.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Lead not found' } });
    }

    if (existing.status === 'DISQUALIFIED') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Lead is already disqualified' },
      });
    }

    const validation = disqualifySchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const lead = await prisma.crmLead.update({
      where: { id: req.params.id },
      data: {
        status: 'DISQUALIFIED',
        disqualifiedAt: new Date(),
        disqualifyReason: validation.data.disqualifyReason,
      },
    });

    logger.info('Lead disqualified', { leadId: lead.id });
    return res.json({ success: true, data: lead });
  } catch (error: unknown) {
    logger.error('Failed to disqualify lead', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to disqualify lead' },
    });
  }
});

export default router;
