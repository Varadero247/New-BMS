// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { writeRoleGuard, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  SUPPORTED_STANDARDS,
  calculateGapReport,
  iso9001Assessment,
  iso45001Assessment,
  iso14001Assessment,
  iso27001Assessment,
  iatf16949Assessment,
  type StandardAssessment,
  type GapAssessment,
  type ComplianceStatus,
} from '@ims/iso-checklists';

const router = Router();
const logger = createLogger('api-setup-wizard:assessments');

const STANDARD_MAP: Record<string, StandardAssessment> = {
  'iso-9001-2015': iso9001Assessment,
  'iso-45001-2018': iso45001Assessment,
  'iso-14001-2015': iso14001Assessment,
  'iso-27001-2022': iso27001Assessment,
  'iatf-16949-2016': iatf16949Assessment,
};

// In-memory assessment store (persisted to DB in production via prisma)
const assessmentStore = new Map<string, GapAssessment>();

function getOrgId(req: Request): string {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return user?.organisationId ?? user?.orgId ?? 'default';
}

// GET /api/assessments/standards — list supported standards
router.get('/standards', (_req: Request, res: Response) => {
  res.json({ success: true, data: SUPPORTED_STANDARDS });
});

// GET /api/assessments/standards/:standardId — get full clause list
router.get('/standards/:standardId', (req: Request, res: Response) => {
  const assessment = STANDARD_MAP[req.params.standardId];
  if (!assessment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Standard not found' } });
  }
  res.json({ success: true, data: assessment });
});

// POST /api/assessments — create a new gap assessment session
router.post('/', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const bodySchema = z.object({
    standardId: z.string().min(1),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const assessment = STANDARD_MAP[parsed.data.standardId];
  if (!assessment) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Standard not supported' } });
  }

  const orgId = getOrgId(req);
  const id = `assess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  const gapAssessment: GapAssessment = {
    id,
    orgId,
    standardId: parsed.data.standardId,
    conductedBy: user?.email ?? user?.id ?? 'unknown',
    conductedAt: new Date(),
    responses: [],
  };
  assessmentStore.set(id, gapAssessment);
  logger.info('Gap assessment created', { id, standardId: parsed.data.standardId, orgId });

  res.status(201).json({ success: true, data: { id, standardId: parsed.data.standardId, clauseCount: assessment.clauses.length } });
});

// GET /api/assessments/:id
router.get('/:id', (req: Request, res: Response) => {
  const ga = assessmentStore.get(req.params.id);
  if (!ga) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
  }
  const orgId = getOrgId(req);
  if (ga.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }
  res.json({ success: true, data: ga });
});

const complianceStatusSchema = z.enum(['CONFORMANT', 'MINOR_GAP', 'MAJOR_GAP', 'NOT_APPLICABLE', 'NOT_ASSESSED'] as [ComplianceStatus, ...ComplianceStatus[]]);

// PUT /api/assessments/:id/responses — submit clause responses (bulk)
router.put('/:id/responses', writeRoleGuard('ADMIN', 'MANAGER'), (req: Request, res: Response) => {
  const ga = assessmentStore.get(req.params.id);
  if (!ga) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
  }

  const bodySchema = z.object({
    responses: z.array(z.object({
      clauseId: z.string().min(1),
      status: complianceStatusSchema,
      evidence: z.string().optional(),
      notes: z.string().optional(),
      responsiblePerson: z.string().optional(),
      targetDate: z.string().optional(),
    })).min(1),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  // Merge responses (upsert by clauseId)
  const responseMap = new Map(ga.responses.map(r => [r.clauseId, r]));
  for (const r of parsed.data.responses) {
    responseMap.set(r.clauseId, r);
  }
  ga.responses = Array.from(responseMap.values());
  assessmentStore.set(ga.id, ga);

  res.json({ success: true, data: { responseCount: ga.responses.length } });
});

// GET /api/assessments/:id/report — compute gap report
router.get('/:id/report', (req: Request, res: Response) => {
  const ga = assessmentStore.get(req.params.id);
  if (!ga) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Assessment not found' } });
  }
  const orgId = getOrgId(req);
  if (ga.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const standard = STANDARD_MAP[ga.standardId];
  if (!standard) {
    return res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Standard definition not found' } });
  }

  const report = calculateGapReport(standard, ga);
  logger.info('Gap report generated', { assessmentId: ga.id, score: report.summary.overallScore });
  res.json({ success: true, data: report });
});

export default router;
