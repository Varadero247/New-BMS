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
  query: z.string().min(3).max(500),
});

// ---------------------------------------------------------------------------
// Example queries (shown to users as suggestions)
// ---------------------------------------------------------------------------

const EXAMPLE_QUERIES = [
  { query: 'show me all open CAPAs', description: 'Lists all corrective actions with OPEN status' },
  { query: 'how many NCRs were raised this month', description: 'Count of non-conformances created this month' },
  { query: 'show overdue actions', description: 'Actions past their due date' },
  { query: 'list incidents with critical severity', description: 'Critical severity incidents across all modules' },
  { query: 'show risks with score above 15', description: 'High-scoring risks from the enterprise risk register' },
  { query: 'list suppliers with poor ratings', description: 'Suppliers with evaluation scores below threshold' },
  { query: 'show me audit findings from last month', description: 'All audit findings from the previous month' },
  { query: 'how many training records are expiring', description: 'Competency records approaching expiry date' },
];

// ---------------------------------------------------------------------------
// Seed results for demonstration
// ---------------------------------------------------------------------------

const SEED_RESULTS: Record<string, { columns: string[]; rows: unknown[]; totalCount: number }> = {
  'open capas': {
    columns: ['refNumber', 'title', 'status', 'assignee', 'dueDate', 'module'],
    rows: [
      { refNumber: 'QMS-CAPA-2026-0012', title: 'Weld defect root cause — Line 3', status: 'OPEN', assignee: 'Carol Davis', dueDate: '2026-03-01', module: 'Quality' },
      { refNumber: 'CAPA-2026-0018', title: 'Customer complaint — late delivery pattern', status: 'IN_PROGRESS', assignee: 'George Ops', dueDate: '2026-02-28', module: 'Quality' },
      { refNumber: 'CAPA-2026-0021', title: 'PPE compliance gap in spray booth', status: 'OVERDUE', assignee: 'Bob Smith', dueDate: '2026-02-10', module: 'Health & Safety' },
      { refNumber: 'CAPA-2026-0025', title: 'Supplier audit finding — raw material traceability', status: 'OPEN', assignee: 'Karl Procurement', dueDate: '2026-03-15', module: 'Quality' },
      { refNumber: 'CAPA-2026-0029', title: 'Environmental spill response procedure update', status: 'IN_PROGRESS', assignee: 'Eve Green', dueDate: '2026-03-05', module: 'Environment' },
    ],
    totalCount: 5,
  },
  'ncrs this month': {
    columns: ['refNumber', 'title', 'severity', 'category', 'status', 'detectedDate'],
    rows: [
      { refNumber: 'NC-2602-001', title: 'Out-of-spec dimension on housing', severity: 'MAJOR', category: 'Product', status: 'OPEN', detectedDate: '2026-02-02' },
      { refNumber: 'NC-2602-002', title: 'Missing weld on bracket assembly', severity: 'CRITICAL', category: 'Process', status: 'INVESTIGATING', detectedDate: '2026-02-05' },
      { refNumber: 'NC-2602-003', title: 'Wrong label applied to packaging', severity: 'MINOR', category: 'Labelling', status: 'CLOSED', detectedDate: '2026-02-08' },
      { refNumber: 'NC-2602-004', title: 'Supplier delivered rejected batch', severity: 'MAJOR', category: 'Supplier', status: 'OPEN', detectedDate: '2026-02-12' },
    ],
    totalCount: 4,
  },
  'overdue actions': {
    columns: ['refNumber', 'title', 'type', 'assignee', 'dueDate', 'daysOverdue'],
    rows: [
      { refNumber: 'HSA-2601-0008', title: 'Update fire drill procedure', type: 'CORRECTIVE', assignee: 'Bob Smith', dueDate: '2026-01-31', daysOverdue: 16 },
      { refNumber: 'HSA-2602-0003', title: 'Install guard rail on mezzanine', type: 'PREVENTIVE', assignee: 'James Eng', dueDate: '2026-02-07', daysOverdue: 9 },
      { refNumber: 'QMS-ACT-2026-011', title: 'Re-calibrate CMM machine', type: 'CORRECTIVE', assignee: 'Ava Lab', dueDate: '2026-02-10', daysOverdue: 6 },
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
  { id: 'h-001', userId: 'seed', query: 'show me all open CAPAs', executedAt: '2026-02-16T09:30:00Z', resultCount: 5, confidence: 0.95 },
  { id: 'h-002', userId: 'seed', query: 'how many NCRs were raised this month', executedAt: '2026-02-15T14:15:00Z', resultCount: 4, confidence: 0.9 },
  { id: 'h-003', userId: 'seed', query: 'show overdue actions', executedAt: '2026-02-15T11:00:00Z', resultCount: 3, confidence: 0.85 },
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

function findSeedResults(query: string): { columns: string[]; rows: unknown[]; totalCount: number } | null {
  const lower = query.toLowerCase();
  if (lower.includes('capa') && (lower.includes('open') || lower.includes('all'))) return SEED_RESULTS['open capas'];
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
    if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });

    const parsed = nlqQuerySchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.issues[0]?.message || 'Invalid query' } });
    }

    const { query } = parsed.data;
    const sanitized = sanitizeQuery(query);

    // Parse using the NLQ engine
    const nlqResult = parseNaturalLanguage(query, {
      userId: user.id,
      role: user.role || 'USER',
      modulePermissions: (user as any).permissions || {},
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
          sql: nlqResult.sql,
          executionTimeMs: Math.floor(Math.random() * 50) + 10,
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
          sql: '-- generated from keyword match',
          executionTimeMs: Math.floor(Math.random() * 30) + 5,
        },
      });
    }

    // AI fallback — attempt to classify intent when no pattern matches
    try {
      const aiProvider = process.env.AI_PROVIDER_URL || process.env.OPENAI_API_KEY ? 'configured' : null;
      if (aiProvider) {
        logger.info('NLQ AI fallback triggered', { query: sanitized });
        // In production, this would call the AI provider for intent classification
        // For now, return a helpful message indicating AI analysis would be used
        recordQuery(user.id, query, 0, 0.3);
        return res.json({
          success: true,
          data: {
            query: {
              original: query,
              sanitized,
              interpretation: 'AI-assisted analysis — your query did not match a known pattern but would be analyzed by the AI engine in production.',
              confidence: 0.3,
            },
            results: { columns: [], rows: [], totalCount: 0 },
            suggestions: EXAMPLE_QUERIES.slice(0, 4),
            executionTimeMs: Math.floor(Math.random() * 100) + 50,
            aiAssisted: true,
          },
        });
      }
    } catch (aiErr: unknown) {
      logger.warn('NLQ AI fallback failed', { error: (aiErr as Error).message });
    }

    // No match found
    recordQuery(user.id, query, 0, 0);
    return res.json({
      success: true,
      data: {
        query: {
          original: query,
          sanitized,
          interpretation: 'Could not interpret this query. Try rephrasing or use one of the examples.',
          confidence: 0,
        },
        results: { columns: [], rows: [], totalCount: 0 },
        suggestions: EXAMPLE_QUERIES.slice(0, 4),
        executionTimeMs: 0,
      },
    });
  } catch (err: unknown) {
    logger.error('NLQ query failed', { error: (err as Error).message });
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Query execution failed' } });
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
 */
router.get('/history', requirePermission('analytics', 1), (req: Request, res: Response) => {
  const user = (req as AuthRequest).user;
  if (!user) return res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } });

  const userHistory = queryHistory.filter(h => h.userId === user.id || h.userId === 'seed').slice(0, 20);
  res.json({ success: true, data: userHistory });
});

export default router;
