// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { prisma, Prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const queryCreateSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  sql: z.string().trim().min(1),
  parameters: z.record(z.any()).optional().nullable(),
  isPublic: z.boolean().optional().default(false),
});

const queryUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(1000).optional().nullable(),
  sql: z.string().trim().min(1).optional(),
  parameters: z.record(z.any()).optional().nullable(),
  isPublic: z.boolean().optional(),
});

// ---------------------------------------------------------------------------
// SQL Security Helpers (FINDING-001, 003)
// ---------------------------------------------------------------------------

/**
 * Strip SQL line comments (--) and block comments (/* ... *\/) before validation.
 * Prevents attackers from hiding dangerous keywords inside comments to bypass
 * the firstWord / semicolon / blocked-pattern guards.
 */
function stripSqlComments(sql: string): string {
  // Remove block comments first (including nested /* ... */)
  let s = sql.replace(/\/\*[\s\S]*?\*\//g, ' ');
  // Remove line comments
  s = s.replace(/--[^\n]*/g, ' ');
  return s.trim().replace(/\s+/g, ' ');
}

/**
 * Patterns that indicate access to system catalogues or sensitive columns.
 * Blocked at both storage time and execution time.
 */
const BLOCKED_SQL_PATTERNS: RegExp[] = [
  /\bpg_catalog\b/i,
  /\binformation_schema\b/i,
  /\bpg_user\b/i,
  /\bpg_shadow\b/i,
  /\bpg_authid\b/i,
  /\bpg_stat_activity\b/i,
  /\bpg_roles\b/i,
  /\bpg_hba_file\b/i,
];

function detectBlockedPattern(sql: string): string | null {
  for (const pattern of BLOCKED_SQL_PATTERNS) {
    if (pattern.test(sql)) return pattern.toString();
  }
  return null;
}

/**
 * Validate SQL at storage time (create / update).
 * Returns an error string if invalid, null if OK.
 */
function validateSqlForStorage(sql: string): string | null {
  const stripped = stripSqlComments(sql);
  const firstWord = stripped.split(/\s+/)[0].toUpperCase();
  if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
    return 'Only SELECT queries are permitted';
  }
  if (stripped.includes(';')) {
    return 'Stacked queries (semicolons) are not permitted';
  }
  const blocked = detectBlockedPattern(stripped);
  if (blocked) {
    return 'Query accesses restricted system tables';
  }
  return null;
}

// ---------------------------------------------------------------------------
// Execute rate limiter: 5 executions per user per 15 min (FINDING-011)
// ---------------------------------------------------------------------------

const executeRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const authReq = req as AuthRequest;
    return `analytics-execute:${authReq.user?.id ?? req.ip ?? 'unknown'}`;
  },
  handler: (_req: Request, res: Response) => {
    res.status(429).json({
      success: false,
      error: {
        code: 'RATE_LIMIT_EXCEEDED',
        message: 'Too many query executions. Limit: 5 per 15 minutes.',
      },
    });
  },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ===================================================================
// GET /api/queries — List queries
// ===================================================================

router.get('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { owner, isPublic, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (owner === 'me') {
      where.ownerId = authReq.user!.id;
    } else if (typeof owner === 'string' && owner.length > 0) {
      where.ownerId = owner;
    }

    if (isPublic === 'true') where.isPublic = true;
    if (isPublic === 'false') where.isPublic = false;

    if (typeof search === 'string' && search.length > 0) {
      where.name = { contains: search, mode: 'insensitive' };
    }

    const [queries, total] = await Promise.all([
      prisma.analyticsQuery.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.analyticsQuery.count({ where }),
    ]);

    res.json({
      success: true,
      data: queries,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list queries', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list queries' },
    });
  }
});

// ===================================================================
// POST /api/queries — Create query
// ===================================================================

router.post('/', async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const parsed = queryCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    const data = parsed.data;

    // Validate SQL at storage time to prevent storing malicious queries (FINDING-003)
    const sqlError = validateSqlForStorage(data.sql);
    if (sqlError) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: sqlError },
      });
    }

    const query = await prisma.analyticsQuery.create({
      data: {
        name: data.name,
        description: data.description || null,
        sql: data.sql,
        parameters: (data.parameters ?? null) as Prisma.InputJsonValue,
        isPublic: data.isPublic,
        ownerId: authReq.user!.id,
        createdBy: authReq.user!.id,
      },
    });

    logger.info('Query created', { id: query.id, name: query.name });
    res.status(201).json({ success: true, data: query });
  } catch (error: unknown) {
    logger.error('Failed to create query', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create query' },
    });
  }
});

// ===================================================================
// POST /api/queries/:id/execute — Execute query
// Rate limited: 5 executions per user per 15 min (FINDING-011)
// Auth checked: owner or public (FINDING-010)
// SQL validated: comment-stripped, SELECT/WITH only, no system tables (FINDING-001)
// Transaction: READ ONLY + 10s statement timeout (FINDING-001)
// ===================================================================

router.post('/:id/execute', executeRateLimiter, async (req: Request, res: Response) => {
  try {
    const authReq = req as AuthRequest;
    const { id } = req.params;

    const query = await prisma.analyticsQuery.findFirst({ where: { id, deletedAt: null } });
    if (!query) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    // Authorization: must own the query OR it must be marked public (FINDING-010)
    if (query.ownerId !== authReq.user!.id && !query.isPublic) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'You do not have permission to execute this query' },
      });
    }

    // Strip SQL comments before validation to prevent bypass via /* */ or -- (FINDING-001)
    const strippedSql = stripSqlComments(query.sql as string);

    // Security guard: only SELECT / WITH (CTE) queries are permitted
    const firstWord = strippedSql.split(/\s+/)[0].toUpperCase();
    if (firstWord !== 'SELECT' && firstWord !== 'WITH') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Only SELECT queries are permitted for safety' },
      });
    }

    // Block stacked queries
    if (strippedSql.includes(';')) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Stacked queries are not permitted' },
      });
    }

    // Block access to system catalogues and sensitive tables (FINDING-001)
    const blocked = detectBlockedPattern(strippedSql);
    if (blocked) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_QUERY', message: 'Query accesses restricted system tables' },
      });
    }

    // Wrap in subquery to enforce a hard row cap
    const cappedSql = `SELECT * FROM (${strippedSql}) _q LIMIT 1000`;

    const startTime = Date.now();
    const rows = (await prisma.$transaction(async (tx) => {
      // Statement timeout: prevent runaway queries (FINDING-001)
      await tx.$executeRawUnsafe(`SET LOCAL statement_timeout = '10s'`);
      // Read-only transaction: prevents any DML even if guards are bypassed (FINDING-001)
      await tx.$executeRawUnsafe(`SET TRANSACTION READ ONLY`);
      return tx.$queryRawUnsafe(cappedSql);
    })) as Record<string, unknown>[];
    const executionMs = Date.now() - startTime;

    const columns = rows.length > 0 ? Object.keys(rows[0]) : [];
    const results = { columns, rows, rowCount: rows.length };

    // Update last run and avg execution time
    await prisma.analyticsQuery.update({
      where: { id },
      data: {
        lastRun: new Date(),
        avgExecutionMs: executionMs,
      },
    });

    logger.info('Query executed', { id, executionMs, rowCount: results.rowCount });
    res.json({ success: true, data: { query: query.sql, results, executionMs } });
  } catch (error: unknown) {
    logger.error('Failed to execute query', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to execute query' },
    });
  }
});

// ===================================================================
// GET /api/queries/:id — Get query by ID
// ===================================================================

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const query = await prisma.analyticsQuery.findFirst({
      where: { id: req.params.id, deletedAt: null },
    });

    if (!query) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    res.json({ success: true, data: query });
  } catch (error: unknown) {
    logger.error('Failed to get query', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res
      .status(500)
      .json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get query' } });
  }
});

// ===================================================================
// PUT /api/queries/:id — Update query
// ===================================================================

router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsQuery.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    const parsed = queryUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          details: parsed.error.flatten(),
        },
      });
    }

    // Validate SQL if being updated (FINDING-003)
    if (parsed.data.sql) {
      const sqlError = validateSqlForStorage(parsed.data.sql);
      if (sqlError) {
        return res.status(400).json({
          success: false,
          error: { code: 'INVALID_QUERY', message: sqlError },
        });
      }
    }

    const updated = await prisma.analyticsQuery.update({
      where: { id },
      data: parsed.data as Record<string, unknown>,
    });

    res.json({ success: true, data: updated });
  } catch (error: unknown) {
    logger.error('Failed to update query', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update query' },
    });
  }
});

// ===================================================================
// DELETE /api/queries/:id — Soft delete query
// ===================================================================

router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const existing = await prisma.analyticsQuery.findFirst({
      where: { id, deletedAt: null },
    });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Query not found' } });
    }

    await prisma.analyticsQuery.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    res.json({ success: true, data: { message: 'Query deleted' } });
  } catch (error: unknown) {
    logger.error('Failed to delete query', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete query' },
    });
  }
});

export default router;
