import { Router, Request, Response } from 'express';
import { authenticate , type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const router = Router();
const logger = createLogger('api-crm');

router.use(authenticate);

const quoteLineSchema = z.object({
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().positive('Quantity must be positive'),
  unitPrice: z.number().min(0, 'Unit price must be non-negative'),
  discount: z.number().min(0).max(100).default(0),
  taxRate: z.number().min(0).max(100).default(0),
  sortOrder: z.number().int().optional(),
});

const createQuoteSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  dealId: z.string().optional(),
  accountId: z.string().optional(),
  contactId: z.string().optional(),
  validUntil: z.string().datetime().optional(),
  currency: z.string().default('GBP'),
  notes: z.string().optional(),
  terms: z.string().optional(),
  lines: z.array(quoteLineSchema).optional(),
});

const updateQuoteSchema = createQuoteSchema.partial();

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `QUO-${yy}${mm}`;
  const count = await prisma.crmQuote.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

function calculateLine(line: { quantity: number; unitPrice: number; discount: number; taxRate: number }) {
  const subtotal = line.quantity * line.unitPrice * (1 - line.discount / 100);
  const taxAmount = subtotal * line.taxRate / 100;
  const total = subtotal + taxAmount;
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    taxAmount: Math.round(taxAmount * 100) / 100,
    total: Math.round(total * 100) / 100,
  };
}

// POST / — Create quote
router.post('/', async (req: Request, res: Response) => {
  try {
    const validation = createQuoteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors.map((e) => e.message).join(', ') },
      });
    }

    const { lines, validUntil, ...quoteData } = validation.data;
    const refNumber = await generateRefNumber();
    const userId = (req as AuthRequest).user?.id || 'system';

    // Calculate line totals
    const calculatedLines = (lines || []).map((line, index) => {
      const calc = calculateLine(line);
      return {
        description: line.description,
        quantity: line.quantity,
        unitPrice: line.unitPrice,
        discount: line.discount,
        taxRate: line.taxRate,
        subtotal: calc.subtotal,
        taxAmount: calc.taxAmount,
        total: calc.total,
        sortOrder: line.sortOrder ?? index,
        createdBy: userId,
      };
    });

    // Calculate quote totals
    const subtotal = calculatedLines.reduce((sum, l) => sum + l.subtotal, 0);
    const taxTotal = calculatedLines.reduce((sum, l) => sum + l.taxAmount, 0);
    const total = calculatedLines.reduce((sum, l) => sum + l.total, 0);

    const quote = await prisma.crmQuote.create({
      data: {
        ...quoteData,
        refNumber,
        validUntil: validUntil ? new Date(validUntil) : undefined,
        subtotal: Math.round(subtotal * 100) / 100,
        taxTotal: Math.round(taxTotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        createdBy: userId,
        lines: {
          create: calculatedLines,
        },
      },
      include: { lines: true },
    });

    logger.info('Quote created', { quoteId: quote.id, refNumber });
    return res.status(201).json({ success: true, data: quote });
  } catch (error: unknown) {
    logger.error('Failed to create quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create quote' } });
  }
});

// GET / — List quotes
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;
    const status = req.query.status as string;
    const dealId = req.query.dealId as string;
    const accountId = req.query.accountId as string;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as any;
    if (dealId) where.dealId = dealId as any;
    if (accountId) where.accountId = accountId as any;

    const [quotes, total] = await Promise.all([
      prisma.crmQuote.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.crmQuote.count({ where }),
    ]);

    return res.json({
      success: true,
      data: quotes,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list quotes', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list quotes' } });
  }
});

// GET /:id — Quote detail with lines
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const quote = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { lines: { where: { deletedAt: null } as any, orderBy: { sortOrder: 'asc' } } },
    });

    if (!quote) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    return res.json({ success: true, data: quote });
  } catch (error: unknown) {
    logger.error('Failed to get quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get quote' } });
  }
});

// PUT /:id — Update quote (only DRAFT status)
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only DRAFT quotes can be updated' },
      });
    }

    const validation = updateQuoteSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: validation.error.errors.map((e) => e.message).join(', ') },
      });
    }

    const { lines, validUntil, ...quoteData } = validation.data;
    const userId = (req as AuthRequest).user?.id || 'system';

    let updateData: Record<string, unknown> = {
      ...quoteData,
      validUntil: validUntil ? new Date(validUntil) : undefined,
    };

    // If lines provided, recalculate totals
    if (lines) {
      // Delete existing lines
      await prisma.crmQuoteLine.deleteMany({ where: { quoteId: req.params.id } });

      const calculatedLines = lines.map((line, index) => {
        const calc = calculateLine(line);
        return {
          description: line.description,
          quantity: line.quantity,
          unitPrice: line.unitPrice,
          discount: line.discount,
          taxRate: line.taxRate,
          subtotal: calc.subtotal,
          taxAmount: calc.taxAmount,
          total: calc.total,
          sortOrder: line.sortOrder ?? index,
          createdBy: userId,
        };
      });

      const subtotal = calculatedLines.reduce((sum, l) => sum + l.subtotal, 0);
      const taxTotal = calculatedLines.reduce((sum, l) => sum + l.taxAmount, 0);
      const total = calculatedLines.reduce((sum, l) => sum + l.total, 0);

      updateData = {
        ...updateData,
        subtotal: Math.round(subtotal * 100) / 100,
        taxTotal: Math.round(taxTotal * 100) / 100,
        total: Math.round(total * 100) / 100,
        lines: { create: calculatedLines },
      };
    }

    const quote = await prisma.crmQuote.update({
      where: { id: req.params.id },
      data: updateData,
      include: { lines: true },
    });

    logger.info('Quote updated', { quoteId: quote.id });
    return res.json({ success: true, data: quote });
  } catch (error: unknown) {
    logger.error('Failed to update quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update quote' } });
  }
});

// POST /:id/send — Mark as SENT
router.post('/:id/send', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    if (existing.status !== 'DRAFT') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only DRAFT quotes can be sent' },
      });
    }

    const quote = await prisma.crmQuote.update({
      where: { id: req.params.id },
      data: { status: 'SENT', sentAt: new Date() },
    });

    logger.info('Quote sent', { quoteId: quote.id });
    return res.json({ success: true, data: quote });
  } catch (error: unknown) {
    logger.error('Failed to send quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to send quote' } });
  }
});

// POST /:id/accept — Mark as ACCEPTED
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    if (existing.status !== 'SENT') {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Only SENT quotes can be accepted' },
      });
    }

    const quote = await prisma.crmQuote.update({
      where: { id: req.params.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() },
    });

    logger.info('Quote accepted', { quoteId: quote.id });
    return res.json({ success: true, data: quote });
  } catch (error: unknown) {
    logger.error('Failed to accept quote', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to accept quote' } });
  }
});

// GET /:id/pdf — Return mock PDF data
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    return res.json({
      success: true,
      data: {
        url: `/api/quotes/${req.params.id}/pdf`,
        format: 'A4',
        quoteRef: existing.refNumber,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate quote PDF', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate quote PDF' } });
  }
});

export default router;
