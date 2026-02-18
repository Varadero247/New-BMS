import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const createContractSchema = z.object({
  name: z.string().trim().min(1, 'name is required'),
  vendor: z.string().trim().min(1, 'vendor is required'),
  category: z.string().trim().min(1, 'category is required'),
  startDate: z
    .string()
    .min(1, 'startDate is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  endDate: z
    .string()
    .min(1, 'endDate is required')
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format'),
  annualCost: z.number().nonnegative().optional(),
  status: z.string().trim().optional(),
  notes: z.string().trim().nullable().optional(),
});

const updateContractSchema = createContractSchema.partial();

const logger = createLogger('contracts');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// GET / — List contracts with pagination, filter by status/category, sort by endDate
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (category) where.category = category;

    const [contracts, total] = await Promise.all([
      prisma.contract.findMany({
        where,
        orderBy: { endDate: 'asc' },
        skip,
        take: limit,
      }),
      prisma.contract.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        contracts,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list contracts', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list contracts' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /seed — Seed 8 default contracts (named route BEFORE /:id)
// ---------------------------------------------------------------------------
router.get('/seed', async (_req: Request, res: Response) => {
  try {
    const seeds = [
      {
        name: 'DMCC Licence',
        vendor: 'DMCC',
        category: 'LICENCE',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2026-06-01'),
        annualCost: 15000,
        status: 'ACTIVE',
      },
      {
        name: 'HubSpot CRM',
        vendor: 'HubSpot',
        category: 'SOFTWARE',
        startDate: new Date('2025-03-01'),
        endDate: new Date('2026-03-01'),
        annualCost: 9600,
        status: 'ACTIVE',
      },
      {
        name: 'Stripe Payment Processing',
        vendor: 'Stripe',
        category: 'SOFTWARE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        annualCost: 0,
        status: 'ACTIVE',
      },
      {
        name: 'Intercom Support',
        vendor: 'Intercom',
        category: 'SOFTWARE',
        startDate: new Date('2025-04-01'),
        endDate: new Date('2026-04-01'),
        annualCost: 7200,
        status: 'ACTIVE',
      },
      {
        name: 'AWS Infrastructure',
        vendor: 'Amazon Web Services',
        category: 'INFRASTRUCTURE',
        startDate: new Date('2025-01-01'),
        endDate: new Date('2026-01-01'),
        annualCost: 36000,
        status: 'ACTIVE',
      },
      {
        name: 'Sentry Error Monitoring',
        vendor: 'Sentry',
        category: 'SOFTWARE',
        startDate: new Date('2025-02-01'),
        endDate: new Date('2026-02-01'),
        annualCost: 3600,
        status: 'ACTIVE',
      },
      {
        name: 'SOC 2 Type II Audit',
        vendor: 'Prescient Assurance',
        category: 'COMPLIANCE',
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-09-01'),
        annualCost: 25000,
        status: 'ACTIVE',
      },
      {
        name: 'ISO 27001 Certification',
        vendor: 'BSI Group',
        category: 'COMPLIANCE',
        startDate: new Date('2025-07-01'),
        endDate: new Date('2026-07-01'),
        annualCost: 18000,
        status: 'ACTIVE',
      },
    ];

    const result = await prisma.contract.createMany({
      data: seeds as any,
      skipDuplicates: true,
    });

    logger.info('Contracts seeded', { count: result.count });
    res.json({ success: true, data: { created: result.count, total: seeds.length } });
  } catch (err) {
    logger.error('Failed to seed contracts', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to seed contracts' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Get single contract
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const contract = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!contract) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }
    res.json({ success: true, data: { contract } });
  } catch (err) {
    logger.error('Failed to get contract', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST / — Create contract
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createContractSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { name, vendor, category, startDate, endDate, annualCost, status, notes } = parsed.data;

    const contract = await prisma.contract.create({
      data: {
        name,
        vendor,
        category,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        annualCost: annualCost || 0,
        status: (status || 'ACTIVE') as any,
        notes: notes || null,
      },
    });

    logger.info('Contract created', { id: contract.id, name });
    res.status(201).json({ success: true, data: { contract } });
  } catch (err) {
    logger.error('Failed to create contract', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// PATCH /:id — Update contract
// ---------------------------------------------------------------------------
router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }

    const parsed = updateContractSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { name, vendor, category, startDate, endDate, annualCost, status, notes } = parsed.data;
    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (vendor !== undefined) data.vendor = vendor;
    if (category !== undefined) data.category = category;
    if (startDate !== undefined) data.startDate = new Date(startDate);
    if (endDate !== undefined) data.endDate = new Date(endDate);
    if (annualCost !== undefined) data.annualCost = annualCost;
    if (status !== undefined) data.status = status;
    if (notes !== undefined) data.notes = notes;

    const contract = await prisma.contract.update({
      where: { id: req.params.id },
      data,
    });

    logger.info('Contract updated', { id: contract.id });
    res.json({ success: true, data: { contract } });
  } catch (err) {
    logger.error('Failed to update contract', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update contract' },
    });
  }
});

// ---------------------------------------------------------------------------
// DELETE /:id — Hard delete contract
// ---------------------------------------------------------------------------
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.contract.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Contract not found' } });
    }

    await prisma.contract.delete({
      where: { id: req.params.id },
    });

    logger.info('Contract deleted', { id: req.params.id });
    res.json({ success: true, data: { message: 'Contract deleted' } });
  } catch (err) {
    logger.error('Failed to delete contract', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete contract' },
    });
  }
});

export default router;
