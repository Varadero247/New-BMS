// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// CONFIDENTIAL — TRADE SECRET.

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import {
  createLogger,
  metricsMiddleware,
  metricsHandler,
  correlationIdMiddleware,
} from '@ims/monitoring';
import { authenticateToken } from '@ims/auth';
import { MockSearchAdapter } from './adapter';
import {
  SearchAdapter,
  SearchEntityType,
  SearchSortOrder,
  RecentSearch,
} from './types';

// ---------------------------------------------------------------------------
// App setup
// ---------------------------------------------------------------------------

const logger = createLogger('api-search');

const app: Express = express();
const PORT = process.env.PORT || 4050;

// Default adapter — can be overridden for testing
let adapter: SearchAdapter = new MockSearchAdapter();

export function setAdapter(a: SearchAdapter): void {
  adapter = a;
}

// ---------------------------------------------------------------------------
// Middleware
// ---------------------------------------------------------------------------

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: true, credentials: true }));
app.use(correlationIdMiddleware());
app.use(metricsMiddleware('api-search'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// ---------------------------------------------------------------------------
// In-memory recent searches (Map<userId, RecentSearch[]>)
// ---------------------------------------------------------------------------

const recentSearchStore = new Map<string, RecentSearch[]>();

function addRecentSearch(userId: string, query: string, type?: SearchEntityType): void {
  const existing = recentSearchStore.get(userId) ?? [];
  // Remove duplicate entry for same query
  const filtered = existing.filter(r => r.query !== query);
  const updated: RecentSearch[] = [
    { query, timestamp: new Date().toISOString(), type },
    ...filtered,
  ].slice(0, 10);
  recentSearchStore.set(userId, updated);
}

function getRecentSearches(userId: string): RecentSearch[] {
  return recentSearchStore.get(userId) ?? [];
}

function clearRecentSearches(userId: string): void {
  recentSearchStore.delete(userId);
}

// ---------------------------------------------------------------------------
// Health
// ---------------------------------------------------------------------------

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'api-search', timestamp: new Date().toISOString() });
});

// ---------------------------------------------------------------------------
// Metrics
// ---------------------------------------------------------------------------

app.get('/metrics', metricsHandler);

// ---------------------------------------------------------------------------
// Search routes — all require authentication
// ---------------------------------------------------------------------------

// GET /api/search/suggest
app.get('/api/search/suggest', authenticateToken, async (req: Request, res: Response) => {
  try {
    const q = (req.query['q'] as string | undefined) ?? '';
    if (!q) {
      return res.json({ success: true, data: { suggestions: [] } });
    }
    const limitRaw = parseInt(String(req.query['limit'] ?? '5'), 10);
    const limit = isNaN(limitRaw) || limitRaw < 1 ? 5 : Math.min(limitRaw, 20);

    const result = await adapter.suggest({ q, limit });
    return res.json({ success: true, data: result });
  } catch (err) {
    logger.error('suggest error', { error: String(err) });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// GET /api/search/recent
app.get('/api/search/recent', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string;
  const recent = getRecentSearches(userId);
  return res.json({ success: true, data: { searches: recent } });
});

// DELETE /api/search/recent
app.delete('/api/search/recent', authenticateToken, (req: Request, res: Response) => {
  const userId = (req as any).user?.id as string;
  clearRecentSearches(userId);
  return res.json({ success: true, data: { message: 'Recent searches cleared' } });
});

// GET /api/search
app.get('/api/search', authenticateToken, async (req: Request, res: Response) => {
  try {
    const q = (req.query['q'] as string | undefined) ?? '';
    if (!q || q.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Query parameter "q" is required',
        code: 'MISSING_QUERY',
      });
    }

    const VALID_TYPES: SearchEntityType[] = [
      'all', 'ncr', 'capa', 'document', 'incident', 'risk',
      'audit', 'supplier', 'user', 'asset', 'training',
    ];
    const rawType = (req.query['type'] as string | undefined) ?? 'all';
    const type: SearchEntityType = VALID_TYPES.includes(rawType as SearchEntityType)
      ? (rawType as SearchEntityType)
      : 'all';

    const limitRaw = parseInt(String(req.query['limit'] ?? '20'), 10);
    const limit = isNaN(limitRaw) || limitRaw < 1 ? 20 : Math.min(limitRaw, 100);

    const offsetRaw = parseInt(String(req.query['offset'] ?? '0'), 10);
    const offset = isNaN(offsetRaw) || offsetRaw < 0 ? 0 : offsetRaw;

    const VALID_SORTS: SearchSortOrder[] = ['relevance', 'date', 'title'];
    const rawSort = (req.query['sort'] as string | undefined) ?? 'relevance';
    const sort: SearchSortOrder = VALID_SORTS.includes(rawSort as SearchSortOrder)
      ? (rawSort as SearchSortOrder)
      : 'relevance';

    const userId = (req as any).user?.id as string;
    addRecentSearch(userId, q.trim(), type === 'all' ? undefined : type);

    const results = await adapter.search({ q: q.trim(), type, limit, offset, sort });

    return res.json({ success: true, data: results });
  } catch (err) {
    logger.error('search error', { error: String(err) });
    return res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
});

// ---------------------------------------------------------------------------
// 404
// ---------------------------------------------------------------------------

app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'Endpoint not found', code: 'NOT_FOUND' });
});

// ---------------------------------------------------------------------------
// Error handler
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  logger.error('Unhandled error', { error: err.message });
  res.status(500).json({ success: false, error: 'Internal server error', code: 'INTERNAL_ERROR' });
});

// ---------------------------------------------------------------------------
// Server startup (skipped during tests)
// ---------------------------------------------------------------------------

if (require.main === module) {
  const server = app.listen(PORT, () => {
    logger.info(`Search API running on port ${PORT}`);
  });

  const gracefulShutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      process.exit(0);
    });
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  };

  process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
  process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

export default app;
export { recentSearchStore };
