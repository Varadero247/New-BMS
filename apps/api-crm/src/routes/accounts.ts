import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';

const router = Router();
const logger = createLogger('api-crm:accounts');

router.use(authenticate);

const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required'),
  type: z.string().min(1, 'Account type is required'),
  industry: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postalCode: z.string().optional(),
  annualRevenue: z.number().optional(),
  employeeCount: z.number().int().optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
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
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const account = await prisma.crmAccount.create({
      data: {
        id: uuidv4(),
        ...validation.data,
        createdBy: (req as any).user?.id || 'system',
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Account created', { accountId: account.id });
    return res.status(201).json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to create account', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to create account' });
  }
});

// GET / — List accounts
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const tags = req.query.tags as string;

    const where: Record<string, unknown> = { deletedAt: null };

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
      ];
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
    logger.error('Failed to list accounts', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to list accounts' });
  }
});

// GET /:id — Get account detail
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    return res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to get account', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to get account' });
  }
});

// PUT /:id — Update account
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const validation = updateAccountSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: validation.error.errors.map((e) => e.message).join(', '),
      });
    }

    const existing = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const account = await prisma.crmAccount.update({
      where: { id: req.params.id },
      data: {
        ...validation.data,
        updatedBy: (req as any).user?.id || 'system',
      },
    });

    logger.info('Account updated', { accountId: account.id });
    return res.json({ success: true, data: account });
  } catch (error: unknown) {
    logger.error('Failed to update account', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to update account' });
  }
});

// DELETE /:id — Soft delete
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    await prisma.crmAccount.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    logger.info('Account soft deleted', { accountId: req.params.id });
    return res.json({ success: true, data: { message: 'Account deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete account', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to delete account' });
  }
});

// GET /:id/contacts — List contacts for account
router.get('/:id/contacts', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const contacts = await prisma.crmContact.findMany({
      where: { accountId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: contacts });
  } catch (error: unknown) {
    logger.error('Failed to list account contacts', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to list account contacts' });
  }
});

// GET /:id/deals — List deals for account
router.get('/:id/deals', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    const deals = await prisma.crmDeal.findMany({
      where: { accountId: req.params.id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: deals });
  } catch (error: unknown) {
    logger.error('Failed to list account deals', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to list account deals' });
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
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    return res.json({
      success: true,
      data: {
        accountId: account.id,
        accountName: account.name,
        qualitySupplierScore: account.qualitySupplierScore || 0,
        openNCRCount: account.openNCRCount || 0,
        openComplaintCount: account.openComplaintCount || 0,
        riskLevel: (account.openNCRCount || 0) + (account.openComplaintCount || 0) > 5 ? 'HIGH' :
          (account.openNCRCount || 0) + (account.openComplaintCount || 0) > 2 ? 'MEDIUM' : 'LOW',
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get compliance data', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to get compliance data' });
  }
});

// GET /:id/invoices — Return invoice data (placeholder for Finance integration)
router.get('/:id/invoices', async (req: Request, res: Response) => {
  try {
    const account = await prisma.crmAccount.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!account) {
      return res.status(404).json({ success: false, error: 'Account not found' });
    }

    // Placeholder: Finance module integration point
    return res.json({
      success: true,
      data: [],
      message: 'Invoice integration pending — connect to Finance module',
    });
  } catch (error: unknown) {
    logger.error('Failed to get invoices', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: 'Failed to get invoices' });
  }
});

export default router;
