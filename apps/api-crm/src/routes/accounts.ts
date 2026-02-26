// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createServiceHeaders } from '@ims/service-auth';
import { validateIdParam } from '@ims/shared';

const FINANCE_SERVICE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:4013';

const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('api-crm:accounts');

router.use(authenticate);

const createAccountSchema = z.object({
  name: z.string().trim().min(1, 'Account name is required'),
  type: z.string().trim().min(1, 'Account type is required'),
  industry: z.string().trim().optional(),
  website: z.string().trim().url().optional().or(z.literal('')),
  phone: z.string().trim().optional(),
  email: z.string().trim().email().optional().or(z.literal('')),
  address: z.string().trim().optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  country: z.string().trim().optional(),
  postalCode: z.string().trim().optional(),
  annualRevenue: z.number().nonnegative().optional(),
  employeeCount: z.number().int().optional(),
  tags: z.array(z.string().trim()).optional(),
  notes: z.string().trim().optional(),
  qualitySupplierScore: z.number().min(0).max(100).optional(),
  openNCRCount: z.number().int().min(0).optional(),
  openComplaintCount: z.number().int().min(0).optional(),
});

const updateAccountSchema = createAccountSchema.partial();

// POST / — Create account
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const account = await prisma.crmAccount.create({
      data: {
        id: uuidv4(),
        ...validation.data,
        type: validation.data.type as Prisma.CrmAccountCreateInput['type'],
        createdBy: (req as AuthRequest).user?.id || 'system',
      } as Prisma.CrmAccountUncheckedCreateInput,
    });

    logger.info('Account created', { accountId: account.id });
    return res.status(201).json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to create account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create account' },
    });
  }
});

// GET / — List accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const tags = req.query.tags as string;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
    }

    if (type) {
      where.type = type;
    }

    if (tags) {
      where.tags = { hasSome: tags.split(',') };
    }

    const [accounts, total] = await Promise.all([
      prisma.crmAccount.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmAccount.count({ where }),
    ]);

    return res.json({
      success: true,
      data: accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list accounts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list accounts' },
    });
  }
});

// GET /:id — Get account detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    return res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to get account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get account' },
    });
  }
});

// PUT /:id — Update account
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validation = updateAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: validation.error.errors.map((e) => e.message).join(', '),
        },
      });
    }

    const existing = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const account = await prisma.crmAccount.update({
      where: { id: req.params.id },
      data: {
        ...validation.data,
        ...(validation.data.type ? { type: validation.data.type as Prisma.CrmAccountCreateInput['type'] } : {}),
      } as Prisma.CrmAccountUncheckedUpdateInput,
    });

    logger.info('Account updated', { accountId: account.id });
    return res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to update account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update account' },
    });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    await prisma.crmAccount.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Account soft deleted', { accountId: req.params.id });
    return res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete account' },
    });
  }
});

// GET /:id/contacts — List contacts for account
router.get('/:id/contacts', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const contacts = await prisma.crmContact.findMany({
      where: { accountId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    return res.json({ success: true, data: contacts });
  } catch (error: unknown) {
    logger.error('Failed to list account contacts', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list account contacts' },
    });
  }
});

// GET /:id/deals — List deals for account
router.get('/:id/deals', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    const deals = await prisma.crmDeal.findMany({
      where: { accountId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 1000,
    });

    return res.json({ success: true, data: deals });
  } catch (error: unknown) {
    logger.error('Failed to list account deals', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list account deals' },
    });
  }
});

// GET /:id/compliance — Return compliance risk data
router.get('/:id/compliance', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
      select: {
        id: true,
        name: true,
        qualitySupplierScore: true,
        openNCRCount: true,
        openComplaintCount: true,
      },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    return res.json({
      success: true,
      data: {
        accountId: account.id,
        accountName: account.name,
        qualitySupplierScore: account.qualitySupplierScore || 0,
        openNCRCount: account.openNCRCount || 0,
        openComplaintCount: account.openComplaintCount || 0,
        riskLevel:
          (account.openNCRCount || 0) + (account.openComplaintCount || 0) > 5
            ? 'HIGH'
            : (account.openNCRCount || 0) + (account.openComplaintCount || 0) > 2
              ? 'MEDIUM'
              : 'LOW',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get compliance data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get compliance data' },
    });
  }
});

// GET /:id/invoices — Return Finance invoices for this CRM account
router.get('/:id/invoices', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Account not found' } });
    }

    // Fetch invoices from the Finance service filtered by this account's name
    const headers = { ...createServiceHeaders('api-crm'), 'Content-Type': 'application/json' };
    const params = new URLSearchParams({ search: String(account.name || ''), limit: '50' });
    const financeRes = await fetch(`${FINANCE_SERVICE_URL}/api/invoices?${params}`, {
      headers,
      signal: AbortSignal.timeout(5000),
    });

    if (!financeRes.ok) {
      logger.warn('Finance service unavailable for invoice lookup', {
        status: financeRes.status,
        accountId: req.params.id,
      });
      return res.json({ success: true, data: [], meta: { source: 'finance-unavailable' } });
    }

    const financeBody = (await financeRes.json()) as { success: boolean; data: unknown[] };
    return res.json({
      success: true,
      data: financeBody.data ?? [],
      meta: { source: 'finance-service' },
    });
  } catch (error: unknown) {
    logger.error('Failed to get invoices', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get invoices' },
    });
  }
});

export default router;
