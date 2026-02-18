import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-finance');
const router: Router = Router();
router.use(authenticate);

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function generateReference(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `FIN-JE-${yy}${mm}-${rand}`;
}

const lineSchema = z.object({
  accountId: z.string().uuid(),
  debit: z.number().min(0).default(0),
  credit: z.number().min(0).default(0),
  description: z.string().max(500).optional().nullable(),
});

const createSchema = z.object({
  date: z.string(),
  periodId: z.string().uuid(),
  description: z.string().min(1).max(1000),
  memo: z.string().max(2000).optional().nullable(),
  source: z.string().max(100).optional().nullable(),
  sourceId: z.string().uuid().optional().nullable(),
  lines: z.array(lineSchema).min(2),
});

const updateSchema = z.object({
  date: z.string().optional(),
  description: z.string().min(1).max(1000).optional(),
  memo: z.string().max(2000).optional().nullable(),
  lines: z.array(lineSchema).min(2).optional(),
});

// GET / — List journal entries
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, periodId, dateFrom, dateTo } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25, 100);
    const skip = (page - 1) * limit;

    const where: any = {};
    if (status && typeof status === 'string') where.status = status as any;
    if (periodId && typeof periodId === 'string') where.periodId = periodId;
    if (dateFrom || dateTo) {
      where.date = {};
      if (dateFrom) (where.date as any).gte = new Date(String(dateFrom));
      if (dateTo) (where.date as any).lte = new Date(String(dateTo));
    }

    const [entries, total] = await Promise.all([
      prisma.finJournalEntry.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          lines: {
            include: {
              account: { select: { id: true, code: true, name: true, type: true } },
            },
            orderBy: { lineNumber: 'asc' } as any,
          },
          period: { select: { id: true, name: true, status: true } },
        },
      }),
      prisma.finJournalEntry.count({ where }),
    ]);

    res.json({
      success: true,
      data: entries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list journal entries', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list journal entries' } });
  }
});

// GET /:id — Single journal entry
const RESERVED = new Set(['stats']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const entry = await prisma.finJournalEntry.findUnique({
      where: { id },
      include: {
        lines: {
          include: {
            account: { select: { id: true, code: true, name: true, type: true, normalBalance: true } },
          },
          orderBy: { lineNumber: 'asc' } as any,
        },
        period: true,
      },
    });

    if (!entry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    }

    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to get journal entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get journal entry' } });
  }
});

// POST / — Create journal entry
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = createSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const { date, periodId, description, memo, source, sourceId, lines } = parsed.data;

    // Validate each line has exactly one of debit/credit
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].debit > 0 && lines[i].credit > 0) {
        return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Line ${i + 1}: cannot have both debit and credit` } });
      }
      if (lines[i].debit === 0 && lines[i].credit === 0) {
        return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Line ${i + 1}: must have either debit or credit amount` } });
      }
    }

    const totalDebits = lines.reduce((s, l) => s + l.debit, 0);
    const totalCredits = lines.reduce((s, l) => s + l.credit, 0);
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      return res.status(400).json({
          success: false,
          error: { code: 'INTERNAL_ERROR', message: `Debits (${totalDebits.toFixed(2)}) must equal credits (${totalCredits.toFixed(2)})` },
        });
    }

    const period = await prisma.finPeriod.findUnique({ where: { id: periodId } });
    if (!period) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Accounting period not found' } });
    if (period.status !== 'OPEN') return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Cannot post to a ${period.status} period` } });

    const accountIds = [...new Set(lines.map(l => l.accountId))];
    const accounts = await prisma.finAccount.findMany({ where: { id: { in: accountIds }, deletedAt: null, isActive: true }, select: { id: true } });
    const foundIds = new Set(accounts.map(a => a.id));
    const missing = accountIds.filter(id => !foundIds.has(id));
    if (missing.length > 0) return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Invalid or inactive account(s): ${missing.join(', ')}` } });

    const authReq = req as AuthRequest;
    const reference = generateReference();

    const entry = await prisma.finJournalEntry.create({
      data: {
        reference,
        date: new Date(date),
        periodId,
        description,
        memo: memo ?? null,
        source: source ?? null,
        sourceId: sourceId ?? null,
        status: 'DRAFT',
        totalDebit: new Prisma.Decimal(totalDebits),
        totalCredit: new Prisma.Decimal(totalCredits),
        createdBy: authReq.user?.id || 'system',
        lines: {
          create: lines.map((l, idx) => ({
            lineNumber: idx + 1,
            accountId: l.accountId,
            debit: new Prisma.Decimal(l.debit),
            credit: new Prisma.Decimal(l.credit),
            description: l.description ?? null,
          })),
        },
      } as any,
      include: {
        lines: {
          include: { account: { select: { id: true, code: true, name: true, type: true } } },
          orderBy: { lineNumber: 'asc' } as any,
        },
        period: { select: { id: true, name: true } },
      },
    });

    logger.info('Journal entry created', { entryId: entry.id, reference });
    res.status(201).json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to create journal entry', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create journal entry' } });
  }
});

// PUT /:id — Update draft journal entry
router.put('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = updateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: parsed.error.flatten() } });
    }

    const existing = await prisma.finJournalEntry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    if (existing.status !== 'DRAFT') return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Only DRAFT entries can be updated' } });

    const { date, description, memo, lines } = parsed.data;
    const authReq = req as AuthRequest;

    if (lines) {
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].debit > 0 && lines[i].credit > 0) {
          return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Line ${i + 1}: cannot have both debit and credit` } });
        }
        if (lines[i].debit === 0 && lines[i].credit === 0) {
          return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Line ${i + 1}: must have either debit or credit amount` } });
        }
      }

      const totalDebits = lines.reduce((s, l) => s + l.debit, 0);
      const totalCredits = lines.reduce((s, l) => s + l.credit, 0);
      if (Math.abs(totalDebits - totalCredits) > 0.01) {
        return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Debits (${totalDebits.toFixed(2)}) must equal credits (${totalCredits.toFixed(2)})` } });
      }

      const accountIds = [...new Set(lines.map(l => l.accountId))];
      const accounts = await prisma.finAccount.findMany({ where: { id: { in: accountIds }, deletedAt: null, isActive: true }, select: { id: true } });
      const foundIds = new Set(accounts.map(a => a.id));
      const missing = accountIds.filter(aid => !foundIds.has(aid));
      if (missing.length > 0) return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Invalid or inactive account(s): ${missing.join(', ')}` } });

      const entry = await prisma.$transaction(async (tx) => {
        await tx.finJournalLine.deleteMany({ where: { journalEntryId: id } as any });
        return tx.finJournalEntry.update({
          where: { id },
          data: {
            ...(date && { date: new Date(date) }),
            ...(description && { description }),
            ...(memo !== undefined && { memo }),
            totalDebit: new Prisma.Decimal(totalDebits),
            totalCredit: new Prisma.Decimal(totalCredits),
            updatedBy: authReq.user?.id || 'system',
            updatedAt: new Date(),
            lines: {
              create: lines.map((l, idx) => ({
                lineNumber: idx + 1,
                accountId: l.accountId,
                debit: new Prisma.Decimal(l.debit),
                credit: new Prisma.Decimal(l.credit),
                description: l.description ?? null,
              })),
            },
          } as any,
          include: {
            lines: { include: { account: { select: { id: true, code: true, name: true, type: true } } }, orderBy: { lineNumber: 'asc' } as any },
          },
        });
      });

      logger.info('Journal entry updated with new lines', { entryId: id });
      return res.json({ success: true, data: entry });
    }

    const entry = await prisma.finJournalEntry.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(description && { description }),
        ...(memo !== undefined && { memo }),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        lines: { include: { account: { select: { id: true, code: true, name: true, type: true } } }, orderBy: { lineNumber: 'asc' } as any },
      },
    });

    logger.info('Journal entry updated', { entryId: id });
    res.json({ success: true, data: entry });
  } catch (error: unknown) {
    logger.error('Failed to update journal entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update journal entry' } });
  }
});

// DELETE /:id — Void/delete DRAFT journal entry
router.delete('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const existing = await prisma.finJournalEntry.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    if (existing.status !== 'DRAFT') {
      return res.status(409).json({ success: false, error: { code: 'CONFLICT', message: 'Only DRAFT journal entries can be deleted. Use the reverse endpoint for POSTED entries.' } });
    }

    await prisma.$transaction(async (tx) => {
      await tx.finJournalLine.deleteMany({ where: { journalEntryId: id } as any });
      await tx.finJournalEntry.delete({ where: { id } });
    });

    logger.info('Journal entry deleted', { entryId: id });
    res.json({ success: true, data: { id, deleted: true } });
  } catch (error: unknown) {
    logger.error('Failed to delete journal entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete journal entry' } });
  }
});

// POST /:id/post — Post a draft entry
router.post('/:id/post', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const entry = await prisma.finJournalEntry.findUnique({ where: { id }, include: { period: true } });
    if (!entry) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Journal entry not found' } });
    if (entry.status !== 'DRAFT') return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Entry is already ${entry.status}` } });
    if (entry.period.status !== 'OPEN') return res.status(400).json({ success: false, error: { code: 'INTERNAL_ERROR', message: `Cannot post to a ${entry.period.status} period` } });

    const authReq = req as AuthRequest;
    const updated = await prisma.finJournalEntry.update({
      where: { id },
      data: { status: 'POSTED', postedAt: new Date(), postedBy: authReq.user?.id || 'system' } as any,
      include: {
        lines: { include: { account: { select: { id: true, code: true, name: true, type: true } } }, orderBy: { lineNumber: 'asc' } as any },
        period: { select: { id: true, name: true } },
      },
    });

    logger.info('Journal entry posted', { entryId: id });
    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to post journal entry', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to post journal entry' } });
  }
});

export default router;
