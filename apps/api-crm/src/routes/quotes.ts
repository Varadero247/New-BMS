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
  validUntil: z.string().trim().datetime().optional(),
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
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
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

// ---------------------------------------------------------------------------
// PDF builder — generates a PDF-1.4 quote document (pure Node, no deps)
// ---------------------------------------------------------------------------
function pdfEsc(s: string): string {
  return String(s ?? '').replace(/[^\x20-\x7E]/g, '').replace(/[\\()]/g, (c) => `\\${c}`);
}

function buildQuotePdf(quote: Record<string, unknown>): Buffer {
  const lines: Record<string, unknown>[] = Array.isArray(quote.lines) ? (quote.lines as Record<string, unknown>[]) : [];
  const ref = pdfEsc(String(quote.refNumber ?? ''));
  const title = pdfEsc(String(quote.title ?? 'Quote'));
  const status = pdfEsc(String(quote.status ?? ''));
  const currency = pdfEsc(String(quote.currency ?? 'GBP'));
  const fmt = (v: unknown) => Number(v ?? 0).toFixed(2);
  const validUntil = quote.validUntil ? new Date(quote.validUntil as string).toLocaleDateString('en-GB') : 'N/A';
  const generatedAt = new Date().toLocaleDateString('en-GB');

  const pageWidth = 595; const pageHeight = 842;
  const ml = 50; const mr = pageWidth - 50; const contentW = mr - ml;

  const objs: string[] = [];
  const addObj = (content: string) => { objs.push(content); return objs.length; };

  // Build content stream
  const parts: string[] = [];
  const y = { v: pageHeight - 70 };
  const ln = (n = 1) => { y.v -= n * 14; };
  const text = (x: number, txt: string, font: string, size: number) =>
    parts.push(`BT /${font} ${size} Tf ${x} ${y.v} Td (${pdfEsc(txt)}) Tj ET`);
  const hline = (yy: number) => parts.push(`${ml} ${yy} m ${mr} ${yy} l S`);
  const rect = (x: number, yy: number, w: number, h: number) => parts.push(`${x} ${yy} ${w} ${h} re f`);

  // Header band
  rect(0, pageHeight - 60, pageWidth, 60);
  parts.push('0.2 0.4 0.7 rg');
  rect(0, pageHeight - 60, pageWidth, 60);
  parts.push('1 g');
  parts.push(`BT /F2 20 Tf 50 ${pageHeight - 38} Td (QUOTE) Tj ET`);
  parts.push(`BT /F1 10 Tf ${pageWidth - 200} ${pageHeight - 38} Td (${pdfEsc('Nexara IMS')}) Tj ET`);
  parts.push('0 g');

  y.v = pageHeight - 85;

  // Quote details
  text(ml, `Reference: ${ref}`, 'F2', 10); ln();
  text(ml, `Title: ${title}`, 'F1', 9); ln();
  text(ml, `Status: ${status}   |   Valid Until: ${validUntil}   |   Date: ${generatedAt}`, 'F1', 9); ln(1.5);
  hline(y.v + 5); ln(0.5);

  // Line items header
  parts.push('0.9 g');
  rect(ml, y.v - 4, contentW, 16);
  parts.push('0 g');
  text(ml + 2, 'Description', 'F2', 9);
  text(ml + 250, 'Qty', 'F2', 9);
  text(ml + 290, 'Unit Price', 'F2', 9);
  text(ml + 370, 'Tax %', 'F2', 9);
  text(ml + 420, `Total (${currency})`, 'F2', 9);
  ln(1.5);

  for (const line of lines.slice(0, 25)) {
    const desc = String(line.description ?? '').substring(0, 55);
    const qty = Number(line.quantity ?? 0).toFixed(2);
    const up = Number(line.unitPrice ?? 0).toFixed(2);
    const tax = Number(line.taxRate ?? 0).toFixed(1);
    const tot = Number(line.total ?? 0).toFixed(2);
    text(ml + 2, desc, 'F1', 8);
    text(ml + 250, qty, 'F1', 8);
    text(ml + 290, up, 'F1', 8);
    text(ml + 370, `${tax}%`, 'F1', 8);
    text(ml + 420, tot, 'F1', 8);
    ln();
    if (y.v < 100) break;
  }

  ln(0.5); hline(y.v + 5); ln(1.5);

  // Totals
  const totalX = ml + 340;
  text(totalX, `Subtotal: ${currency} ${fmt(quote.subtotal)}`, 'F1', 9); ln();
  text(totalX, `Tax:      ${currency} ${fmt(quote.taxTotal)}`, 'F1', 9); ln();
  parts.push('0.2 0.4 0.7 rg');
  text(totalX, `TOTAL:    ${currency} ${fmt(quote.total)}`, 'F2', 11); ln(1.5);
  parts.push('0 g');

  if (quote.notes) { text(ml, `Notes: ${String(quote.notes).substring(0, 100)}`, 'F1', 8); ln(); }
  if (quote.terms) { text(ml, `Terms: ${String(quote.terms).substring(0, 100)}`, 'F1', 8); }

  const stream = parts.join('\n');

  // Assemble PDF objects
  const contentId = addObj(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
  const pageId = addObj(`<< /Type /Page /Parent 3 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents ${contentId} 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>`);

  const allObjs = [
    '',  // placeholder for obj 1
    '<< /Type /Catalog /Pages 3 0 R >>',
    '',  // placeholder for obj 3 Pages
    `<< /Type /Pages /Kids [${pageId} 0 R] /Count 1 >>`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
    ...objs,
  ];

  // Rebuild with correct indices
  const pdfObjs: string[] = [
    '%PDF-1.4\n',
    `1 0 obj\n<< /Type /Catalog /Pages 3 0 R >>\nendobj\n`,
    `2 0 obj\n<< /Producer (Nexara IMS) /CreationDate (D:${new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)}Z) >>\nendobj\n`,
    `3 0 obj\n<< /Type /Pages /Kids [${allObjs.length} 0 R] /Count 1 >>\nendobj\n`,
    `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`,
    `5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>\nendobj\n`,
    `6 0 obj\n<< /Length ${stream.length} >>\nstream\n${stream}\nendstream\nendobj\n`,
    `7 0 obj\n<< /Type /Page /Parent 3 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 6 0 R /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> >>\nendobj\n`,
  ];

  // Patch Pages Kids to point to page 7
  pdfObjs[3] = `3 0 obj\n<< /Type /Pages /Kids [7 0 R] /Count 1 >>\nendobj\n`;

  const body = pdfObjs.join('');
  const xrefOffset = body.length;
  const offsets: number[] = [];
  let pos = 0;
  for (const o of pdfObjs) { offsets.push(pos); pos += o.length; }

  const xref = [
    'xref\n',
    `0 ${pdfObjs.length}\n`,
    '0000000000 65535 f \n',
    ...offsets.slice(1).map(o => `${String(o).padStart(10, '0')} 00000 n \n`),
  ].join('');

  const trailer = `trailer\n<< /Size ${pdfObjs.length} /Root 1 0 R /Info 2 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;

  return Buffer.from(body + xref + trailer, 'utf8');
}

// GET /:id/pdf — Generate and stream a real PDF document
router.get('/:id/pdf', async (req: Request, res: Response) => {
  try {
    const existing = await prisma.crmQuote.findFirst({
      where: { id: req.params.id, deletedAt: null } as any,
      include: { lines: { orderBy: { sortOrder: 'asc' } } },
    });

    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Quote not found' } });
    }

    const pdfBuffer = buildQuotePdf(existing as unknown as Record<string, unknown>);
    const filename = `quote-${existing.refNumber}-${new Date().toISOString().slice(0, 10)}.pdf`;

    return res.status(200).set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': String(pdfBuffer.length),
    }).end(pdfBuffer);
  } catch (error: unknown) {
    logger.error('Failed to generate quote PDF', { error: error instanceof Error ? error.message : 'Unknown error' });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to generate quote PDF' } });
  }
});

export default router;
