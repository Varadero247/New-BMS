import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';
import { parseNaturalLanguage, sanitizeQuery } from '@ims/nlq';

const logger = createLogger('api-analytics:nlq');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Schemas
// ---------------------------------------------------------------------------

const nlqQuerySchema = z.object({
  query: z.string().trim().min(3).max(500),
});

// ---------------------------------------------------------------------------
// Example queries (shown to users as suggestions)
// ---------------------------------------------------------------------------

const EXAMPLE_QUERIES = [
  { query: 'show me all open CAPAs', description: 'Lists all corrective actions with OPEN status' },
  {
    query: 'how many NCRs were raised this month',
    description: 'Count of non-conformances created this month',
  },
  { query: 'show overdue actions', description: 'Actions past their due date' },
  {
    query: 'list incidents with critical severity',
    description: 'Critical severity incidents across all modules',
  },
  {
    query: 'show risks with score above 15',
    description: 'High-scoring risks from the enterprise risk register',
  },
  {
    query: 'list suppliers with poor ratings',
    description: 'Suppliers with evaluation scores below threshold',
  },
  {
    query: 'show me audit findings from last month',
    description: 'All audit findings from the previous month',
  },
  {
    query: 'how many training records are expiring',
    description: 'Competency records approaching expiry date',
  },
];

// ---------------------------------------------------------------------------
// Seed results for demonstration
// ---------------------------------------------------------------------------

const SEED_RESULTS: Record<string, { columns: string[]; rows: unknown[]; totalCount: number }> = {
  'open capas': {
    columns: ['refNumber', 'title', 'status', 'assignee', 'dueDate', 'module'],
    rows: [
      {
        refNumber: 'QMS-CAPA-2026-0012',
        title: 'Weld defect root cause — Line 3',
        status: 'OPEN',
        assignee: 'Carol Davis',
        dueDate: '2026-03-01',
        module: 'Quality',
      },
      {
        refNumber: 'CAPA-2026-0018',
        title: 'Customer complaint — late delivery pattern',
        status: 'IN_PROGRESS',
        assignee: 'George Ops',
        dueDate: '2026-02-28',
        module: 'Quality',
      },
      {
        refNumber: 'CAPA-2026-0021',
        title: 'PPE compliance gap in spray booth',
        status: 'OVERDUE',
        assignee: 'Bob Smith',
        dueDate: '2026-02-10',
        module: 'Health & Safety',
      },
      {
        refNumber: 'CAPA-2026-0025',
        title: 'Supplier audit finding — raw material traceability',
        status: 'OPEN',
        assignee: 'Karl Procurement',
        dueDate: '2026-03-15',
        module: 'Quality',
      },
      {
        refNumber: 'CAPA-2026-0029',
        title: 'Environmental spill response procedure update',
        status: 'IN_PROGRESS',
        assignee: 'Eve Green',
        dueDate: '2026-03-05',
        module: 'Environment',
      },
    ],
    totalCount: 5,
  },
  'ncrs this month': {
    columns: ['refNumber', 'title', 'severity', 'category', 'status', 'detectedDate'],
    rows: [
      {
        refNumber: 'NC-2602-001',
        title: 'Out-of-spec dimension on housing',
        severity: 'MAJOR',
        category: 'Product',
        status: 'OPEN',
        detectedDate: '2026-02-02',
      },
      {
        refNumber: 'NC-2602-002',
        title: 'Missing weld on bracket assembly',
        severity: 'CRITICAL',
        category: 'Process',
        status: 'INVESTIGATING',
        detectedDate: '2026-02-05',
      },
      {
        refNumber: 'NC-2602-003',
        title: 'Wrong label applied to packaging',
        severity: 'MINOR',
        category: 'Labelling',
        status: 'CLOSED',
        detectedDate: '2026-02-08',
      },
      {
        refNumber: 'NC-2602-004',
        title: 'Supplier delivered rejected batch',
        severity: 'MAJOR',
        category: 'Supplier',
        status: 'OPEN',
        detectedDate: '2026-02-12',
      },
    ],
    totalCount: 4,
  },
  'overdue actions': {
    columns: ['refNumber', 'title', 'type', 'assignee', 'dueDate', 'daysOverdue'],
    rows: [
      {
        refNumber: 'HSA-2601-0008',
        title: 'Update fire drill procedure',
        type: 'CORRECTIVE',
        assignee: 'Bob Smith',
        dueDate: '2026-01-31',
        daysOverdue: 16,
      },
      {
        refNumber: 'HSA-2602-0003',
        title: 'Install guard rail on mezzanine',
        type: 'PREVENTIVE',
        assignee: 'James Eng',
        dueDate: '2026-02-07',
        daysOverdue: 9,
      },
      {
        refNumber: 'QMS-ACT-2026-011',
        title: 'Re-calibrate CMM machine',
        type: 'CORRECTIVE',
        assignee: 'Ava Lab',
        dueDate: '2026-02-10',
        daysOverdue: 6,
      },
    ],
    totalCount: 3,
  },
};

// In-memory query history (in production, use Prisma analytics schema)
interface QueryHistoryEntry {
  id: string;
  userId: string;
  query: string;
  executedAt: string;
  resultCount: number;
  confidence: number;
}

const queryHistory: QueryHistoryEntry[] = [
  {
    id: 'h-001',
    userId: 'seed',
    query: 'show me all open CAPAs',
    executedAt: '2026-02-16T09:30:00Z',
    resultCount: 5,
    confidence: 0.95,
  },
  {
    id: 'h-002',
    userId: 'seed',
    query: 'how many NCRs were raised this month',
    executedAt: '2026-02-15T14:15:00Z',
    resultCount: 4,
    confidence: 0.9,
  },
  {
    id: 'h-003',
    userId: 'seed',
    query: 'show overdue actions',
    executedAt: '2026-02-15T11:00:00Z',
    resultCount: 3,
    confidence: 0.85,
  },
];

function recordQuery(userId: string, query: string, resultCount: number, confidence: number): void {
  queryHistory.unshift({
    id: `h-${Date.now().toString(36)}`,
    userId,
    query,
    executedAt: new Date().toISOString(),
    resultCount,
    confidence,
  });
  if (queryHistory.length > 100) queryHistory.pop();
}

function findSeedResults(
  query: string
): { columns: string[]; rows: unknown[]; totalCount: number } | null {
  const lower = query.toLowerCase();
  if (lower.includes('capa') && (lower.includes('open') || lower.includes('all')))
    return SEED_RESULTS['open capas'];
  if (lower.includes('ncr') && lower.includes('month')) return SEED_RESULTS['ncrs this month'];
  if (lower.includes('overdue') && lower.includes('action')) return SEED_RESULTS['overdue actions'];
  return null;
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/**
 * POST /api/nlq/query — Execute a natural language query
 */
router.post('/query', requirePermission('analytics', 1), async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    if (!user)
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });

    const parsed = nlqQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.issues[0]?.message || 'Invalid query',
        },
      });
    }

    const { query } = parsed.data;
    const sanitized = sanitizeQuery(query);
    const queryStart = Date.now();

    // Parse using the NLQ engine
    const nlqResult = parseNaturalLanguage(query, {
      userId: user.id,
      role: user.role || 'USER',
      modulePermissions: (user as { permissions?: Record<string, unknown> }).permissions || {},
    });

    // If the engine found a pattern match with high confidence, return structured data
    if (nlqResult.confidence > 0) {
      const seedData = findSeedResults(sanitized);
      recordQuery(user.id, query, seedData?.totalCount || 0, nlqResult.confidence);
      return res.json({
        success: true,
        data: {
          query: {
            original: nlqResult.original,
            sanitized: nlqResult.sanitized,
            interpretation: `Searching ${nlqResult.modules.join(', ')} module(s)`,
            confidence: nlqResult.confidence,
          },
          results: seedData || { columns: [], rows: [], totalCount: 0 },
          // Do not expose internal SQL to the client — only log server-side for debugging
          executionTimeMs: Date.now() - queryStart,
        },
      });
    }

    // Fallback — try seed data by keyword matching
    const seedData = findSeedResults(sanitized);
    if (seedData) {
      recordQuery(user.id, query, seedData.totalCount, 0.6);
      return res.json({
        success: true,
        data: {
          query: {
            original: query,
            sanitized,
            interpretation: 'Matched by keyword analysis',
            confidence: 0.6,
          },
          results: seedData,
          executionTimeMs: Date.now() - queryStart,
        },
      });
    }

    // AI fallback — call the configured AI provider for intent classification
    const openAiKey = process.env.OPENAI_API_KEY;
    const anthropicKey = process.env.ANTHROPIC_API_KEY;
    const aiProviderUrl = process.env.AI_PROVIDER_URL;
    const hasAiProvider = !!(openAiKey || anthropicKey || aiProviderUrl);

    if (hasAiProvider) {
      // Default interpretation returned even if the AI call fails (provider configured but unavailable)
      let aiInterpretation =
        'AI-assisted interpretation — query could not be fully classified. Try one of the example queries.';
      let aiConfidence = 0.3;

      try {
        logger.info('NLQ AI fallback triggered', { query: sanitized });

        const systemPrompt = `You are a natural-language query assistant for an ISO management system (IMS) with modules for quality, health & safety, environment, HR, finance, CRM, incidents, audits, CAPA, risks, and more. Classify the user's query and return JSON only:
{"interpretation": "...", "modules": ["..."], "confidence": 0.0-1.0, "suggestion": "Try one of the example queries below if this query is unclear"}`;

        const userMessage = `Query: "${sanitized}"\nClassify and interpret this query for an ISO management system.`;

        if (openAiKey) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 10000);
          try {
            const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${openAiKey}` },
              body: JSON.stringify({
                model: 'gpt-4o-mini',
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 200,
              }),
              signal: ctrl.signal,
            });
            if (aiRes.ok) {
              const aiData: unknown = await aiRes.json();
              const content = aiData.choices?.[0]?.message?.content || '';
              const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
              aiInterpretation = parsed.interpretation || content;
              aiConfidence = Math.min(0.9, Math.max(0.3, parsed.confidence || 0.5));
            }
          } finally {
            clearTimeout(t);
          }
        } else if (anthropicKey) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 10000);
          try {
            const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'x-api-key': anthropicKey,
                'anthropic-version': '2023-06-01',
              },
              body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 200,
                system: systemPrompt,
                messages: [{ role: 'user', content: userMessage }],
              }),
              signal: ctrl.signal,
            });
            if (aiRes.ok) {
              const aiData: unknown = await aiRes.json();
              const content = aiData.content?.[0]?.text || '';
              const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
              aiInterpretation = parsed.interpretation || content;
              aiConfidence = Math.min(0.9, Math.max(0.3, parsed.confidence || 0.5));
            }
          } finally {
            clearTimeout(t);
          }
        } else if (aiProviderUrl) {
          const ctrl = new AbortController();
          const t = setTimeout(() => ctrl.abort(), 10000);
          try {
            const aiRes = await fetch(`${aiProviderUrl}/chat/completions`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [
                  { role: 'system', content: systemPrompt },
                  { role: 'user', content: userMessage },
                ],
                temperature: 0.3,
                max_tokens: 200,
              }),
              signal: ctrl.signal,
            });
            if (aiRes.ok) {
              const aiData: unknown = await aiRes.json();
              const content = aiData.choices?.[0]?.message?.content || '';
              const parsed = JSON.parse(content.replace(/```json|```/g, '').trim());
              aiInterpretation = parsed.interpretation || content;
              aiConfidence = Math.min(0.9, Math.max(0.3, parsed.confidence || 0.5));
            }
          } finally {
            clearTimeout(t);
          }
        }
      } catch (aiErr: unknown) {
        logger.warn('NLQ AI fallback failed', { error: (aiErr as Error).message });
        // Keep defaults: aiInterpretation and aiConfidence = 0.3
      }

      recordQuery(user.id, query, 0, aiConfidence);
      return res.json({
        success: true,
        data: {
          query: {
            original: query,
            sanitized,
            interpretation: aiInterpretation,
            confidence: aiConfidence,
          },
          results: { columns: [], rows: [], totalCount: 0 },
          suggestions: EXAMPLE_QUERIES.slice(0, 4),
          executionTimeMs: Date.now() - queryStart,
          aiAssisted: true,
        },
      });
    }

    // No match found
    recordQuery(user.id, query, 0, 0);
    return res.json({
      success: true,
      data: {
        query: {
          original: query,
          sanitized,
          interpretation:
            'Could not interpret this query. Try rephrasing or use one of the examples.',
          confidence: 0,
        },
        results: { columns: [], rows: [], totalCount: 0 },
        suggestions: EXAMPLE_QUERIES.slice(0, 4),
        executionTimeMs: 0,
      },
    });
  } catch (err: unknown) {
    logger.error('NLQ query failed', { error: (err as Error).message });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Query execution failed' },
    });
  }
});

/**
 * GET /api/nlq/examples — Get example queries for the UI
 */
router.get('/examples', requirePermission('analytics', 1), (_req: Request, res: Response) => {
  res.json({ success: true, data: EXAMPLE_QUERIES });
});

/**
 * GET /api/nlq/history — Get recent query history for current user
 * Supports pagination: ?page=1&limit=20
 */
router.get('/history', requirePermission('analytics', 1), (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user)
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
    });

  const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
  // Only show the current user's own query history (no cross-user data leakage)
  const userHistory = queryHistory.filter((h) => h.userId === user.id);
  const total = userHistory.length;
  const offset = (page - 1) * limit;
  const paged = userHistory.slice(offset, offset + limit);

  res.json({
    success: true,
    data: paged,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export default router;
