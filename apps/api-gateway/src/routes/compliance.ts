import { Router, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { randomUUID } from 'crypto';

const logger = createLogger('api-gateway:compliance');
const router = Router();

router.use(authenticate);

// ── Regulatory intelligence data ────────────────────────────────────

interface Regulation {
  id: string;
  title: string;
  reference: string;
  jurisdiction: string;
  category: string;
  publishedDate: string;
  effectiveDate: string | null;
  summary: string;
  relevantStandards: string[];
  relevantIndustries: string[];
  impactLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFORMATIONAL';
  source: string;
  sourceUrl: string;
  status: 'NEW' | 'REVIEWED' | 'IMPORTED' | 'DISMISSED';
  importedToLegalRegister: boolean;
  relevanceScore: number;
}

// Seed data — regulatory updates relevant to IMS customers
const regulations: Regulation[] = [
  {
    id: randomUUID(),
    title: 'Building Safety Act 2022 — Secondary Legislation Update',
    reference: 'BSA-2022-SL-2026',
    jurisdiction: 'UK',
    category: 'HEALTH_SAFETY',
    publishedDate: '2026-01-15',
    effectiveDate: '2026-04-01',
    summary: 'New secondary legislation under the Building Safety Act introduces mandatory safety case reports for higher-risk buildings. Organisations managing such buildings must update their safety management systems.',
    relevantStandards: ['ISO_45001', 'ISO_9001'],
    relevantIndustries: ['CONSTRUCTION', 'PROPERTY_MANAGEMENT'],
    impactLevel: 'HIGH',
    source: 'UK HSE',
    sourceUrl: 'https://www.hse.gov.uk',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 85,
  },
  {
    id: randomUUID(),
    title: 'CSRD — Expanded Scope for SMEs (EU)',
    reference: 'EU-CSRD-2026-EXP',
    jurisdiction: 'EU',
    category: 'ESG',
    publishedDate: '2026-01-20',
    effectiveDate: '2026-07-01',
    summary: 'The Corporate Sustainability Reporting Directive expanded scope now includes listed SMEs with more than 10 employees. ESRS standards E1-E5, S1-S4, and G1 disclosures now mandatory for this cohort.',
    relevantStandards: ['ISO_14001', 'ISO_45001', 'ISO_50001'],
    relevantIndustries: ['ALL'],
    impactLevel: 'CRITICAL',
    source: 'EU Official Journal',
    sourceUrl: 'https://eur-lex.europa.eu',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 92,
  },
  {
    id: randomUUID(),
    title: 'NIS2 Directive — National Transposition Deadline',
    reference: 'EU-NIS2-2024-NAT',
    jurisdiction: 'EU',
    category: 'INFORMATION_SECURITY',
    publishedDate: '2025-10-17',
    effectiveDate: '2025-10-17',
    summary: 'EU Member States must transpose NIS2 into national law. Essential and important entities must implement cybersecurity risk management measures and incident reporting within 24 hours.',
    relevantStandards: ['ISO_27001'],
    relevantIndustries: ['TECHNOLOGY', 'ENERGY', 'HEALTHCARE', 'FINANCIAL_SERVICES'],
    impactLevel: 'CRITICAL',
    source: 'EU Official Journal',
    sourceUrl: 'https://eur-lex.europa.eu',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 88,
  },
  {
    id: randomUUID(),
    title: 'UK ESOS Phase 3 — Compliance Deadline Extension',
    reference: 'UK-ESOS-P3-2026',
    jurisdiction: 'UK',
    category: 'ENERGY',
    publishedDate: '2026-01-10',
    effectiveDate: '2026-06-05',
    summary: 'ESOS Phase 3 compliance deadline extended to 5 June 2026. Qualifying organisations must complete energy audits covering at least 90% of total energy consumption.',
    relevantStandards: ['ISO_50001', 'ISO_14001'],
    relevantIndustries: ['ALL'],
    impactLevel: 'MEDIUM',
    source: 'UK Environment Agency',
    sourceUrl: 'https://www.gov.uk/environment-agency',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 78,
  },
  {
    id: randomUUID(),
    title: 'EU AI Act — High-Risk AI System Obligations (Chapter III)',
    reference: 'EU-AIA-2024-CH3',
    jurisdiction: 'EU',
    category: 'AI_GOVERNANCE',
    publishedDate: '2025-08-01',
    effectiveDate: '2026-08-01',
    summary: 'Chapter III of the EU AI Act becomes enforceable. Providers and deployers of high-risk AI systems must implement quality management systems, maintain technical documentation, and conduct conformity assessments.',
    relevantStandards: ['ISO_42001', 'ISO_27001'],
    relevantIndustries: ['TECHNOLOGY', 'HEALTHCARE', 'FINANCIAL_SERVICES', 'ALL'],
    impactLevel: 'HIGH',
    source: 'EU Official Journal',
    sourceUrl: 'https://eur-lex.europa.eu',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 90,
  },
  {
    id: randomUUID(),
    title: 'UAE Federal Decree-Law — Personal Data Protection Amendments',
    reference: 'UAE-PDPL-2026-AMD',
    jurisdiction: 'UAE',
    category: 'PRIVACY',
    publishedDate: '2026-02-01',
    effectiveDate: '2026-06-01',
    summary: 'Amendments to the UAE Personal Data Protection Law introduce mandatory Data Protection Impact Assessments for processing special category data and cross-border data transfers.',
    relevantStandards: ['ISO_27001', 'ISO_27701'],
    relevantIndustries: ['ALL'],
    impactLevel: 'HIGH',
    source: 'UAE Ministry of Justice',
    sourceUrl: 'https://www.moj.gov.ae',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 82,
  },
  {
    id: randomUUID(),
    title: 'HSE COSHH Update — Workplace Exposure Limits 2026',
    reference: 'UK-HSE-COSHH-WEL-2026',
    jurisdiction: 'UK',
    category: 'HEALTH_SAFETY',
    publishedDate: '2026-01-25',
    effectiveDate: '2026-04-01',
    summary: 'Updated Workplace Exposure Limits (WELs) for 15 chemical substances. Organisations using these substances must update their COSHH assessments and monitoring programmes.',
    relevantStandards: ['ISO_45001'],
    relevantIndustries: ['MANUFACTURING', 'CONSTRUCTION', 'CHEMICAL'],
    impactLevel: 'MEDIUM',
    source: 'UK HSE',
    sourceUrl: 'https://www.hse.gov.uk',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 75,
  },
  {
    id: randomUUID(),
    title: 'BRCGS Issue 9.1 — Updated Requirements for Pest Management',
    reference: 'BRCGS-I9.1-PM',
    jurisdiction: 'GLOBAL',
    category: 'FOOD_SAFETY',
    publishedDate: '2026-01-05',
    effectiveDate: '2026-03-01',
    summary: 'BRCGS Issue 9.1 introduces enhanced requirements for integrated pest management, including mandatory digital trend monitoring and third-party pest control auditing.',
    relevantStandards: ['ISO_22000'],
    relevantIndustries: ['FOOD_BEVERAGE'],
    impactLevel: 'MEDIUM',
    source: 'BRCGS',
    sourceUrl: 'https://www.brcgs.com',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 80,
  },
  {
    id: randomUUID(),
    title: 'UK Cyber Essentials Plus — Updated Technical Controls (v4.0)',
    reference: 'UK-CE-V4-2026',
    jurisdiction: 'UK',
    category: 'INFORMATION_SECURITY',
    publishedDate: '2026-01-15',
    effectiveDate: '2026-04-28',
    summary: 'Cyber Essentials v4.0 introduces updated technical controls for cloud services, MFA requirements, and device management. Organisations must recertify under the new scheme.',
    relevantStandards: ['ISO_27001'],
    relevantIndustries: ['ALL'],
    impactLevel: 'MEDIUM',
    source: 'NCSC',
    sourceUrl: 'https://www.ncsc.gov.uk',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 76,
  },
  {
    id: randomUUID(),
    title: 'Dubai Anti-Corruption Strategy 2026-2030',
    reference: 'UAE-DXB-ACS-2026',
    jurisdiction: 'UAE',
    category: 'ANTI_BRIBERY',
    publishedDate: '2026-02-05',
    effectiveDate: '2026-03-01',
    summary: 'Dubai launches new Anti-Corruption Strategy requiring all licensed entities to implement anti-bribery management systems. ISO 37001 certification now accepted as evidence of compliance.',
    relevantStandards: ['ISO_37001'],
    relevantIndustries: ['ALL'],
    impactLevel: 'HIGH',
    source: 'Dubai Municipality',
    sourceUrl: 'https://www.dm.gov.ae',
    status: 'NEW',
    importedToLegalRegister: false,
    relevanceScore: 86,
  },
];

// ── Validation schemas ──────────────────────────────────────────────

const importSchema = z.object({
  targetModule: z.enum([
    'health-safety', 'environment', 'quality', 'infosec',
    'food-safety', 'energy', 'esg', 'iso42001', 'iso37001',
  ]),
  notes: z.string().max(1000).optional(),
  assignedTo: z.string().trim().uuid().optional(),
  reviewDate: z.string().refine(s => !isNaN(Date.parse(s)), 'Invalid date format').optional(),
});

// ── GET /regulations — List regulatory updates ─────────────────────

router.get('/regulations', async (req: AuthRequest, res: Response) => {
  try {
    const {
      jurisdiction,
      category,
      impactLevel,
      standard,
      status,
      search,
      page = '1',
      limit = '20',
      sortBy = 'relevanceScore',
      sortOrder = 'desc',
    } = req.query;

    let filtered = [...regulations];

    if (jurisdiction) {
      filtered = filtered.filter((r) =>
        r.jurisdiction === jurisdiction || r.jurisdiction === 'GLOBAL'
      );
    }
    if (category) {
      filtered = filtered.filter((r) => r.category === category);
    }
    if (impactLevel) {
      filtered = filtered.filter((r) => r.impactLevel === impactLevel);
    }
    if (standard) {
      filtered = filtered.filter((r) =>
        r.relevantStandards.includes(standard as string)
      );
    }
    if (status) {
      filtered = filtered.filter((r) => r.status === status);
    }
    if (search) {
      const s = (search as string).toLowerCase();
      filtered = filtered.filter((r) =>
        r.title.toLowerCase().includes(s) ||
        r.summary.toLowerCase().includes(s) ||
        r.reference.toLowerCase().includes(s)
      );
    }

    // Sort
    const sortField = sortBy as keyof Regulation;
    filtered.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'desc' ? bVal - aVal : aVal - bVal;
      }
      return sortOrder === 'desc'
        ? String(bVal).localeCompare(String(aVal))
        : String(aVal).localeCompare(String(bVal));
    });

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const start = (pageNum - 1) * limitNum;

    res.json({
      success: true,
      data: {
        items: filtered.slice(start, start + limitNum),
        total: filtered.length,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(filtered.length / limitNum),
        summary: {
          critical: filtered.filter((r) => r.impactLevel === 'CRITICAL').length,
          high: filtered.filter((r) => r.impactLevel === 'HIGH').length,
          medium: filtered.filter((r) => r.impactLevel === 'MEDIUM').length,
          low: filtered.filter((r) => r.impactLevel === 'LOW').length,
          new: filtered.filter((r) => r.status === 'NEW').length,
          imported: filtered.filter((r) => r.status === 'IMPORTED').length,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list regulations', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list regulations' },
    });
  }
});

// ── GET /regulations/:id — Get regulation detail ───────────────────

router.get('/regulations/:id', async (req: AuthRequest, res: Response) => {
  try {
    const regulation = regulations.find((r) => r.id === req.params.id);
    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulation not found' },
      });
    }

    res.json({ success: true, data: regulation });
  } catch (error: unknown) {
    logger.error('Failed to get regulation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get regulation' },
    });
  }
});

// ── POST /regulations/:id/import — Import to legal register ───────

router.post('/regulations/:id/import', async (req: AuthRequest, res: Response) => {
  try {
    const regulation = regulations.find((r) => r.id === req.params.id);
    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulation not found' },
      });
    }

    const parsed = importSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() },
      });
    }

    const { targetModule, notes, assignedTo, reviewDate } = parsed.data;

    // Mark as imported
    regulation.status = 'IMPORTED';
    regulation.importedToLegalRegister = true;

    const importRecord = {
      regulationId: regulation.id,
      regulationTitle: regulation.title,
      regulationReference: regulation.reference,
      targetModule,
      importedBy: req.user!.id,
      importedAt: new Date().toISOString(),
      notes: notes || null,
      assignedTo: assignedTo || null,
      reviewDate: reviewDate || null,
      legalRegisterEntry: {
        title: regulation.title,
        reference: regulation.reference,
        jurisdiction: regulation.jurisdiction,
        effectiveDate: regulation.effectiveDate,
        summary: regulation.summary,
        complianceStatus: 'UNDER_REVIEW',
        module: targetModule,
      },
    };

    logger.info('Regulation imported to legal register', {
      regulationId: regulation.id,
      targetModule,
      importedBy: req.user!.id,
    });

    res.status(201).json({ success: true, data: importRecord });
  } catch (error: unknown) {
    logger.error('Failed to import regulation', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to import regulation' },
    });
  }
});

// ── PUT /regulations/:id/status — Update regulation review status ──

router.put('/regulations/:id/status', async (req: AuthRequest, res: Response) => {
  try {
    const regulation = regulations.find((r) => r.id === req.params.id);
    if (!regulation) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Regulation not found' },
      });
    }

    const statusSchema = z.object({
      status: z.enum(['REVIEWED', 'DISMISSED']),
      notes: z.string().max(1000).optional(),
    });

    const parsed = statusSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() },
      });
    }

    regulation.status = parsed.data.status;

    logger.info('Regulation status updated', {
      regulationId: regulation.id,
      status: parsed.data.status,
      updatedBy: req.user!.id,
    });

    res.json({ success: true, data: regulation });
  } catch (error: unknown) {
    logger.error('Failed to update regulation status', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update regulation status' },
    });
  }
});

// ── GET /regulations/summary — Summary stats ──────────────────────

router.get('/summary', async (_req: AuthRequest, res: Response) => {
  try {
    const summary = {
      totalRegulations: regulations.length,
      byJurisdiction: {
        UK: regulations.filter((r) => r.jurisdiction === 'UK').length,
        EU: regulations.filter((r) => r.jurisdiction === 'EU').length,
        UAE: regulations.filter((r) => r.jurisdiction === 'UAE').length,
        GLOBAL: regulations.filter((r) => r.jurisdiction === 'GLOBAL').length,
      },
      byImpact: {
        CRITICAL: regulations.filter((r) => r.impactLevel === 'CRITICAL').length,
        HIGH: regulations.filter((r) => r.impactLevel === 'HIGH').length,
        MEDIUM: regulations.filter((r) => r.impactLevel === 'MEDIUM').length,
        LOW: regulations.filter((r) => r.impactLevel === 'LOW').length,
      },
      byStatus: {
        NEW: regulations.filter((r) => r.status === 'NEW').length,
        REVIEWED: regulations.filter((r) => r.status === 'REVIEWED').length,
        IMPORTED: regulations.filter((r) => r.status === 'IMPORTED').length,
        DISMISSED: regulations.filter((r) => r.status === 'DISMISSED').length,
      },
      byCategory: {
        HEALTH_SAFETY: regulations.filter((r) => r.category === 'HEALTH_SAFETY').length,
        ESG: regulations.filter((r) => r.category === 'ESG').length,
        INFORMATION_SECURITY: regulations.filter((r) => r.category === 'INFORMATION_SECURITY').length,
        ENERGY: regulations.filter((r) => r.category === 'ENERGY').length,
        AI_GOVERNANCE: regulations.filter((r) => r.category === 'AI_GOVERNANCE').length,
        PRIVACY: regulations.filter((r) => r.category === 'PRIVACY').length,
        ANTI_BRIBERY: regulations.filter((r) => r.category === 'ANTI_BRIBERY').length,
        FOOD_SAFETY: regulations.filter((r) => r.category === 'FOOD_SAFETY').length,
      },
      lastUpdated: new Date().toISOString(),
    };

    res.json({ success: true, data: summary });
  } catch (error: unknown) {
    logger.error('Failed to get regulation summary', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get regulation summary' },
    });
  }
});

export default router;
