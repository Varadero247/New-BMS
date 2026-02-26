// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { requirePermission } from '@ims/rbac';

const logger = createLogger('api-analytics');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface UnifiedRisk {
  id: string;
  refNumber: string;
  source: 'quality' | 'health_safety' | 'environment' | 'infosec' | 'ai' | 'energy';
  isoStandard: string;
  title: string;
  likelihood: number;
  severity: number;
  score: number;
  treatment: string;
  owner: string;
  status: string;
  dueDate?: string;
  module: string;
  url: string;
}

// ---------------------------------------------------------------------------
// Query validation
// ---------------------------------------------------------------------------

const querySchema = z.object({
  source: z.enum(['quality', 'health_safety', 'environment', 'infosec', 'ai', 'energy']).optional(),
  minScore: z.coerce.number().int().min(1).max(25).optional(),
  maxScore: z.coerce.number().int().min(1).max(25).optional(),
  status: z.string().trim().optional(),
  owner: z.string().trim().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  page: z.coerce.number().int().min(1).optional(),
  sortBy: z.enum(['score', 'likelihood', 'severity', 'dueDate', 'title']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

// ---------------------------------------------------------------------------
// Seed data — 30 realistic risks across all 6 sources
// ---------------------------------------------------------------------------

const SEED_RISKS: UnifiedRisk[] = [
  // Quality risks (ISO 9001)
  {
    id: 'ur-001',
    refNumber: 'QMS-RSK-2026-001',
    source: 'quality',
    isoStandard: 'ISO 9001:2015',
    title: 'Supplier non-conformance rate exceeding 5% threshold',
    likelihood: 4,
    severity: 4,
    score: 16,
    treatment: 'MITIGATE',
    owner: 'Alice Thompson',
    status: 'OPEN',
    dueDate: '2026-03-15',
    module: 'Quality',
    url: '/risks/ur-001',
  },
  {
    id: 'ur-002',
    refNumber: 'QMS-RSK-2026-002',
    source: 'quality',
    isoStandard: 'ISO 9001:2015',
    title: 'Calibration drift on CMM equipment beyond tolerance',
    likelihood: 3,
    severity: 5,
    score: 15,
    treatment: 'MITIGATE',
    owner: 'Ivan Quality',
    status: 'IN_PROGRESS',
    dueDate: '2026-02-28',
    module: 'Quality',
    url: '/risks/ur-002',
  },
  {
    id: 'ur-003',
    refNumber: 'QMS-RSK-2026-003',
    source: 'quality',
    isoStandard: 'ISO 9001:2015',
    title: 'Incomplete design verification records for new product line',
    likelihood: 3,
    severity: 3,
    score: 9,
    treatment: 'MITIGATE',
    owner: 'Carol Davis',
    status: 'OPEN',
    dueDate: '2026-04-01',
    module: 'Quality',
    url: '/risks/ur-003',
  },
  {
    id: 'ur-004',
    refNumber: 'QMS-RSK-2026-004',
    source: 'quality',
    isoStandard: 'ISO 9001:2015',
    title: 'Customer complaint trend increasing in Q1',
    likelihood: 3,
    severity: 4,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Alice Thompson',
    status: 'OPEN',
    dueDate: '2026-03-30',
    module: 'Quality',
    url: '/risks/ur-004',
  },
  {
    id: 'ur-005',
    refNumber: 'QMS-RSK-2026-005',
    source: 'quality',
    isoStandard: 'ISO 9001:2015',
    title: 'Document control backlog — 23 documents past review date',
    likelihood: 2,
    severity: 3,
    score: 6,
    treatment: 'ACCEPT',
    owner: 'Carol Davis',
    status: 'MONITORING',
    module: 'Quality',
    url: '/risks/ur-005',
  },

  // Health & Safety risks (ISO 45001)
  {
    id: 'ur-006',
    refNumber: 'HS-RSK-2026-001',
    source: 'health_safety',
    isoStandard: 'ISO 45001:2018',
    title: 'Manual handling injuries in warehouse operations',
    likelihood: 4,
    severity: 5,
    score: 20,
    treatment: 'MITIGATE',
    owner: 'Bob Smith',
    status: 'OPEN',
    dueDate: '2026-02-20',
    module: 'Health & Safety',
    url: '/risks/ur-006',
  },
  {
    id: 'ur-007',
    refNumber: 'HS-RSK-2026-002',
    source: 'health_safety',
    isoStandard: 'ISO 45001:2018',
    title: 'Noise exposure levels exceeding 85dB in press shop',
    likelihood: 5,
    severity: 3,
    score: 15,
    treatment: 'MITIGATE',
    owner: 'Bob Smith',
    status: 'IN_PROGRESS',
    dueDate: '2026-03-01',
    module: 'Health & Safety',
    url: '/risks/ur-007',
  },
  {
    id: 'ur-008',
    refNumber: 'HS-RSK-2026-003',
    source: 'health_safety',
    isoStandard: 'ISO 45001:2018',
    title: 'Contractor safety induction compliance gap',
    likelihood: 3,
    severity: 4,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Mike Johnson',
    status: 'OPEN',
    dueDate: '2026-03-15',
    module: 'Health & Safety',
    url: '/risks/ur-008',
  },
  {
    id: 'ur-009',
    refNumber: 'HS-RSK-2026-004',
    source: 'health_safety',
    isoStandard: 'ISO 45001:2018',
    title: 'Fire suppression system maintenance overdue in Building C',
    likelihood: 2,
    severity: 5,
    score: 10,
    treatment: 'MITIGATE',
    owner: 'Mike Johnson',
    status: 'IN_PROGRESS',
    dueDate: '2026-02-25',
    module: 'Health & Safety',
    url: '/risks/ur-009',
  },
  {
    id: 'ur-010',
    refNumber: 'HS-RSK-2026-005',
    source: 'health_safety',
    isoStandard: 'ISO 45001:2018',
    title: 'Lone worker policy not covering night shift operations',
    likelihood: 2,
    severity: 3,
    score: 6,
    treatment: 'MITIGATE',
    owner: 'Bob Smith',
    status: 'OPEN',
    dueDate: '2026-04-10',
    module: 'Health & Safety',
    url: '/risks/ur-010',
  },

  // Environment risks (ISO 14001)
  {
    id: 'ur-011',
    refNumber: 'ENV-RSK-2026-001',
    source: 'environment',
    isoStandard: 'ISO 14001:2015',
    title: 'Chemical storage bund integrity compromised',
    likelihood: 3,
    severity: 5,
    score: 15,
    treatment: 'MITIGATE',
    owner: 'Eve Green',
    status: 'OPEN',
    dueDate: '2026-02-28',
    module: 'Environment',
    url: '/risks/ur-011',
  },
  {
    id: 'ur-012',
    refNumber: 'ENV-RSK-2026-002',
    source: 'environment',
    isoStandard: 'ISO 14001:2015',
    title: 'Waste segregation failures increasing contamination risk',
    likelihood: 4,
    severity: 3,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Eve Green',
    status: 'IN_PROGRESS',
    dueDate: '2026-03-10',
    module: 'Environment',
    url: '/risks/ur-012',
  },
  {
    id: 'ur-013',
    refNumber: 'ENV-RSK-2026-003',
    source: 'environment',
    isoStandard: 'ISO 14001:2015',
    title: 'Stormwater discharge exceeding consent limits',
    likelihood: 2,
    severity: 4,
    score: 8,
    treatment: 'MITIGATE',
    owner: 'Eve Green',
    status: 'MONITORING',
    module: 'Environment',
    url: '/risks/ur-013',
  },
  {
    id: 'ur-014',
    refNumber: 'ENV-RSK-2026-004',
    source: 'environment',
    isoStandard: 'ISO 14001:2015',
    title: 'Refrigerant leak potential from aging HVAC units',
    likelihood: 3,
    severity: 3,
    score: 9,
    treatment: 'MITIGATE',
    owner: 'Karl Maintenance',
    status: 'OPEN',
    dueDate: '2026-05-01',
    module: 'Environment',
    url: '/risks/ur-014',
  },
  {
    id: 'ur-015',
    refNumber: 'ENV-RSK-2026-005',
    source: 'environment',
    isoStandard: 'ISO 14001:2015',
    title: 'Carbon reporting methodology gaps for Scope 3',
    likelihood: 2,
    severity: 2,
    score: 4,
    treatment: 'ACCEPT',
    owner: 'Eve Green',
    status: 'MONITORING',
    module: 'Environment',
    url: '/risks/ur-015',
  },

  // InfoSec risks (ISO 27001)
  {
    id: 'ur-016',
    refNumber: 'SEC-RSK-2026-001',
    source: 'infosec',
    isoStandard: 'ISO 27001:2022',
    title: 'Unpatched critical vulnerability in web application framework',
    likelihood: 4,
    severity: 5,
    score: 20,
    treatment: 'MITIGATE',
    owner: 'Frank Security',
    status: 'OPEN',
    dueDate: '2026-02-18',
    module: 'Information Security',
    url: '/risks/ur-016',
  },
  {
    id: 'ur-017',
    refNumber: 'SEC-RSK-2026-002',
    source: 'infosec',
    isoStandard: 'ISO 27001:2022',
    title: 'Third-party vendor access not reviewed in 6 months',
    likelihood: 3,
    severity: 4,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Frank Security',
    status: 'IN_PROGRESS',
    dueDate: '2026-03-01',
    module: 'Information Security',
    url: '/risks/ur-017',
  },
  {
    id: 'ur-018',
    refNumber: 'SEC-RSK-2026-003',
    source: 'infosec',
    isoStandard: 'ISO 27001:2022',
    title: 'Backup restoration test not performed in current quarter',
    likelihood: 2,
    severity: 4,
    score: 8,
    treatment: 'MITIGATE',
    owner: 'Frank Security',
    status: 'OPEN',
    dueDate: '2026-03-31',
    module: 'Information Security',
    url: '/risks/ur-018',
  },
  {
    id: 'ur-019',
    refNumber: 'SEC-RSK-2026-004',
    source: 'infosec',
    isoStandard: 'ISO 27001:2022',
    title: 'Phishing simulation click rate above 15% threshold',
    likelihood: 4,
    severity: 3,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Jane HR',
    status: 'IN_PROGRESS',
    module: 'Information Security',
    url: '/risks/ur-019',
  },
  {
    id: 'ur-020',
    refNumber: 'SEC-RSK-2026-005',
    source: 'infosec',
    isoStandard: 'ISO 27001:2022',
    title: 'Legacy system running unsupported OS version',
    likelihood: 3,
    severity: 3,
    score: 9,
    treatment: 'TRANSFER',
    owner: 'Frank Security',
    status: 'OPEN',
    dueDate: '2026-06-30',
    module: 'Information Security',
    url: '/risks/ur-020',
  },

  // AI risks (ISO 42001)
  {
    id: 'ur-021',
    refNumber: 'AI-RSK-2026-001',
    source: 'ai',
    isoStandard: 'ISO 42001:2023',
    title: 'Bias detected in recruitment screening model outputs',
    likelihood: 3,
    severity: 5,
    score: 15,
    treatment: 'MITIGATE',
    owner: 'Heidi AI',
    status: 'OPEN',
    dueDate: '2026-03-01',
    module: 'AI Management',
    url: '/risks/ur-021',
  },
  {
    id: 'ur-022',
    refNumber: 'AI-RSK-2026-002',
    source: 'ai',
    isoStandard: 'ISO 42001:2023',
    title: 'Insufficient explainability for credit scoring model',
    likelihood: 3,
    severity: 4,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Heidi AI',
    status: 'IN_PROGRESS',
    dueDate: '2026-04-15',
    module: 'AI Management',
    url: '/risks/ur-022',
  },
  {
    id: 'ur-023',
    refNumber: 'AI-RSK-2026-003',
    source: 'ai',
    isoStandard: 'ISO 42001:2023',
    title: 'Training data quality issues — missing edge cases',
    likelihood: 4,
    severity: 3,
    score: 12,
    treatment: 'MITIGATE',
    owner: 'Heidi AI',
    status: 'OPEN',
    module: 'AI Management',
    url: '/risks/ur-023',
  },
  {
    id: 'ur-024',
    refNumber: 'AI-RSK-2026-004',
    source: 'ai',
    isoStandard: 'ISO 42001:2023',
    title: 'Model drift monitoring not implemented for production models',
    likelihood: 2,
    severity: 3,
    score: 6,
    treatment: 'MITIGATE',
    owner: 'Heidi AI',
    status: 'OPEN',
    dueDate: '2026-05-01',
    module: 'AI Management',
    url: '/risks/ur-024',
  },
  {
    id: 'ur-025',
    refNumber: 'AI-RSK-2026-005',
    source: 'ai',
    isoStandard: 'ISO 42001:2023',
    title: 'Human oversight process gaps for automated decisions',
    likelihood: 2,
    severity: 4,
    score: 8,
    treatment: 'MITIGATE',
    owner: 'Heidi AI',
    status: 'MONITORING',
    module: 'AI Management',
    url: '/risks/ur-025',
  },

  // Energy risks (ISO 50001)
  {
    id: 'ur-026',
    refNumber: 'ENR-RSK-2026-001',
    source: 'energy',
    isoStandard: 'ISO 50001:2018',
    title: 'Compressed air system leakage causing 20% energy waste',
    likelihood: 5,
    severity: 3,
    score: 15,
    treatment: 'MITIGATE',
    owner: 'Karl Maintenance',
    status: 'OPEN',
    dueDate: '2026-03-15',
    module: 'Energy Management',
    url: '/risks/ur-026',
  },
  {
    id: 'ur-027',
    refNumber: 'ENR-RSK-2026-002',
    source: 'energy',
    isoStandard: 'ISO 50001:2018',
    title: 'Energy baseline not updated after production line expansion',
    likelihood: 3,
    severity: 2,
    score: 6,
    treatment: 'MITIGATE',
    owner: 'Heidi Energy',
    status: 'OPEN',
    dueDate: '2026-04-01',
    module: 'Energy Management',
    url: '/risks/ur-027',
  },
  {
    id: 'ur-028',
    refNumber: 'ENR-RSK-2026-003',
    source: 'energy',
    isoStandard: 'ISO 50001:2018',
    title: 'Peak demand charges exceeding budget by 15%',
    likelihood: 4,
    severity: 2,
    score: 8,
    treatment: 'MITIGATE',
    owner: 'Heidi Energy',
    status: 'IN_PROGRESS',
    module: 'Energy Management',
    url: '/risks/ur-028',
  },
  {
    id: 'ur-029',
    refNumber: 'ENR-RSK-2026-004',
    source: 'energy',
    isoStandard: 'ISO 50001:2018',
    title: 'Sub-metering coverage only 60% of significant energy uses',
    likelihood: 2,
    severity: 2,
    score: 4,
    treatment: 'ACCEPT',
    owner: 'Heidi Energy',
    status: 'MONITORING',
    module: 'Energy Management',
    url: '/risks/ur-029',
  },
  {
    id: 'ur-030',
    refNumber: 'ENR-RSK-2026-005',
    source: 'energy',
    isoStandard: 'ISO 50001:2018',
    title: 'HVAC scheduling not optimised for occupancy patterns',
    likelihood: 1,
    severity: 2,
    score: 2,
    treatment: 'ACCEPT',
    owner: 'Karl Maintenance',
    status: 'MONITORING',
    module: 'Energy Management',
    url: '/risks/ur-030',
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

function buildHeatmap(risks: UnifiedRisk[]): number[][] {
  // 5x5 grid: rows = likelihood (1-5), cols = severity (1-5)
  const grid: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));
  for (const r of risks) {
    grid[r.likelihood - 1][r.severity - 1]++;
  }
  return grid;
}

function buildSummary(risks: UnifiedRisk[]) {
  const bySource: Record<string, number> = {};
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const r of risks) {
    bySource[r.source] = (bySource[r.source] || 0) + 1;
    if (r.score >= 20) critical++;
    else if (r.score >= 12) high++;
    else if (r.score >= 6) medium++;
    else low++;
  }

  const redZoneCount = risks.filter((r) => r.score >= 12).length;
  const redZonePercent =
    risks.length > 0 ? Math.round((redZoneCount / risks.length) * 100 * 10) / 10 : 0;

  return {
    total: risks.length,
    bySource,
    byScoreRange: { critical, high, medium, low },
    redZonePercent,
  };
}

// ===================================================================
// GET /api/unified-risks — Unified risk register across all modules
// ===================================================================

router.get('/', requirePermission('analytics', 1), async (req: Request, res: Response) => {
  try {
    const parsed = querySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten(),
        },
      });
    }

    const { source, minScore, maxScore, status, owner, sortBy, sortOrder } = parsed.data;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);

    // Filter seed data
    let filtered = [...SEED_RISKS];

    if (source) {
      filtered = filtered.filter((r) => r.source === source);
    }
    if (minScore !== undefined) {
      filtered = filtered.filter((r) => r.score >= minScore);
    }
    if (maxScore !== undefined) {
      filtered = filtered.filter((r) => r.score <= maxScore);
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (owner) {
      filtered = filtered.filter((r) => r.owner.toLowerCase().includes(owner.toLowerCase()));
    }

    // Sort
    const field = sortBy || 'score';
    const order = sortOrder || 'desc';
    filtered.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[field];
      const bVal = (b as unknown as Record<string, unknown>)[field];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return order === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal || '');
      const bStr = String(bVal || '');
      return order === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });

    // Pagination
    const total = filtered.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const pagedRisks = filtered.slice(offset, offset + limit);

    // Build summary from ALL filtered risks (not just paged)
    const summary = buildSummary(filtered);
    const heatmap = buildHeatmap(filtered);

    logger.info('Unified risk register queried', {
      total: filtered.length,
      source,
      minScore,
      maxScore,
    });

    res.json({
      success: true,
      data: {
        risks: pagedRisks,
        summary,
        heatmap,
      },
      pagination: { page, limit, total, totalPages },
    });
  } catch (error: unknown) {
    logger.error('Failed to query unified risks', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to query unified risks' },
    });
  }
});

// ===================================================================
// GET /api/unified-risks/:id — Get single unified risk
// ===================================================================

router.get('/:id', requirePermission('analytics', 1), async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const risk = SEED_RISKS.find((r) => r.id === id);

    if (!risk) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Risk not found' } });
    }

    res.json({ success: true, data: risk });
  } catch (error: unknown) {
    logger.error('Failed to get unified risk', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get unified risk' },
    });
  }
});

export default router;
