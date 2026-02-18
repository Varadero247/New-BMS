import { Router, Response } from 'express';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  checklists,
  getAvailableStandards,
  getChecklist,
  createAuditPlan,
  calculateAuditScore,
  getClausesByStatus,
  getMandatoryGaps,
  type AuditPlan,
  type AuditClauseStatus,
} from '@ims/iso-checklists';
import { z } from 'zod';

const logger = createLogger('unified-audit');
const router = Router();

// In-memory store for audit plans
const auditPlans = new Map<string, AuditPlan>();

// All routes require authentication
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET /standards - List available standards with clause counts
// ---------------------------------------------------------------------------
router.get('/standards', async (_req: AuthRequest, res: Response) => {
  try {
    const standards = getAvailableStandards();

    const data = standards.map((key) => {
      const checklist = checklists[key];
      return {
        code: key,
        standard: checklist.standard,
        version: checklist.version,
        title: checklist.title,
        clauseCount: checklist.clauses.length,
        mandatoryCount: checklist.clauses.filter((c) => c.mandatory).length,
      };
    });

    res.json({ success: true, data });
  } catch (error) {
    logger.error('Failed to list standards', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list standards' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /standards/:standard/checklist - Get full checklist for a standard
// ---------------------------------------------------------------------------
router.get('/standards/:standard/checklist', async (req: AuthRequest, res: Response) => {
  try {
    const { standard } = req.params;
    const checklist = getChecklist(standard);

    if (!checklist) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Standard '${standard}' not found. Available: ${getAvailableStandards().join(', ')}`,
        },
      });
    }

    res.json({ success: true, data: checklist });
  } catch (error) {
    logger.error('Failed to get checklist', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklist' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /plans - Create a new audit plan
// ---------------------------------------------------------------------------
const createPlanSchema = z.object({
  standard: z.string().min(1, 'Standard code is required'),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION']),
  title: z.string().min(1, 'Title is required').max(200),
  scope: z.string().min(1, 'Scope is required').max(2000),
});

router.post('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const data = createPlanSchema.parse(req.body);

    const plan = createAuditPlan(data.standard, data.auditType, data.title, data.scope);

    if (!plan) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STANDARD',
          message: `Standard '${data.standard}' not found. Available: ${getAvailableStandards().join(', ')}`,
        },
      });
    }

    auditPlans.set(plan.id, plan);

    logger.info('Audit plan created', {
      planId: plan.id,
      standard: plan.standard,
      auditType: plan.auditType,
      userId: req.user?.id,
    });

    res.status(201).json({ success: true, data: plan });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to create audit plan', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit plan' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /plans - List all audit plans (with optional filters)
// ---------------------------------------------------------------------------
router.get('/plans', async (req: AuthRequest, res: Response) => {
  try {
    const { standard, auditType, page = '1', limit = '20' } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);

    let plans = Array.from(auditPlans.values());

    // Apply filters
    if (standard) {
      plans = plans.filter((p) => p.standard === standard);
    }
    if (auditType) {
      plans = plans.filter((p) => p.auditType === auditType);
    }

    // Sort by creation date descending
    plans.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const total = plans.length;
    const start = (pageNum - 1) * limitNum;
    const paginated = plans.slice(start, start + limitNum);

    // Return summary view (without full clause details for list)
    const summaryData = paginated.map((plan) => {
      const score = calculateAuditScore(plan);
      return {
        id: plan.id,
        standard: plan.standard,
        title: plan.title,
        scope: plan.scope,
        auditType: plan.auditType,
        createdAt: plan.createdAt,
        clauseCount: score.total,
        assessed: score.assessed,
        conformanceRate: Math.round(score.conformanceRate * 100) / 100,
        majorNCs: score.majorNCs,
        minorNCs: score.minorNCs,
      };
    });

    res.json({
      success: true,
      data: summaryData,
      meta: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    logger.error('Failed to list audit plans', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list audit plans' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /plans/:id - Get specific audit plan with clause statuses
// ---------------------------------------------------------------------------
router.get('/plans/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plan = auditPlans.get(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Audit plan '${id}' not found` },
      });
    }

    res.json({ success: true, data: plan });
  } catch (error) {
    logger.error('Failed to get audit plan', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit plan' },
    });
  }
});

// ---------------------------------------------------------------------------
// PATCH /plans/:id/clauses/:clause - Update clause status
// ---------------------------------------------------------------------------
const VALID_STATUSES: AuditClauseStatus['status'][] = [
  'NOT_STARTED',
  'IN_PROGRESS',
  'CONFORMING',
  'MINOR_NC',
  'MAJOR_NC',
  'OBSERVATION',
  'NOT_APPLICABLE',
];

const updateClauseSchema = z.object({
  status: z
    .enum([
      'NOT_STARTED',
      'IN_PROGRESS',
      'CONFORMING',
      'MINOR_NC',
      'MAJOR_NC',
      'OBSERVATION',
      'NOT_APPLICABLE',
    ])
    .optional(),
  findings: z.array(z.string()).optional(),
  objectiveEvidence: z.array(z.string()).optional(),
  auditorNotes: z.string().optional(),
});

router.patch('/plans/:id/clauses/:clause', async (req: AuthRequest, res: Response) => {
  try {
    const { id, clause } = req.params;
    const plan = auditPlans.get(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Audit plan '${id}' not found` },
      });
    }

    // Decode the clause parameter (e.g., "4.1" may be URL-encoded)
    const decodedClause = decodeURIComponent(clause);
    const clauseEntry = plan.clauses.find((c) => c.clause === decodedClause);

    if (!clauseEntry) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: `Clause '${decodedClause}' not found in audit plan '${id}'`,
        },
      });
    }

    const data = updateClauseSchema.parse(req.body);

    // Apply updates
    if (data.status !== undefined) {
      clauseEntry.status = data.status;
    }
    if (data.findings !== undefined) {
      clauseEntry.findings = data.findings;
    }
    if (data.objectiveEvidence !== undefined) {
      clauseEntry.objectiveEvidence = data.objectiveEvidence;
    }
    if (data.auditorNotes !== undefined) {
      clauseEntry.auditorNotes = data.auditorNotes;
    }

    logger.info('Audit clause updated', {
      planId: id,
      clause: decodedClause,
      status: clauseEntry.status,
      userId: req.user?.id,
    });

    res.json({ success: true, data: clauseEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => ({ path: e.path.join('.'), message: e.message })),
        },
      });
    }
    logger.error('Failed to update audit clause', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit clause' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /plans/:id/score - Get audit score / conformance rate
// ---------------------------------------------------------------------------
router.get('/plans/:id/score', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plan = auditPlans.get(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Audit plan '${id}' not found` },
      });
    }

    const score = calculateAuditScore(plan);

    res.json({
      success: true,
      data: {
        planId: plan.id,
        standard: plan.standard,
        title: plan.title,
        auditType: plan.auditType,
        ...score,
        conformanceRate: Math.round(score.conformanceRate * 100) / 100,
      },
    });
  } catch (error) {
    logger.error('Failed to get audit score', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit score' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /plans/:id/gaps - Get mandatory gaps
// ---------------------------------------------------------------------------
router.get('/plans/:id/gaps', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plan = auditPlans.get(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Audit plan '${id}' not found` },
      });
    }

    const gaps = getMandatoryGaps(plan);

    res.json({
      success: true,
      data: {
        planId: plan.id,
        standard: plan.standard,
        title: plan.title,
        totalMandatory: plan.clauses.filter((c) => c.mandatory).length,
        gapCount: gaps.length,
        gaps: gaps.map((g) => ({
          clause: g.clause,
          title: g.title,
          status: g.status,
          mandatory: g.mandatory,
          findings: g.findings,
          auditorNotes: g.auditorNotes,
        })),
      },
    });
  } catch (error) {
    logger.error('Failed to get audit gaps', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit gaps' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /plans/:id/report - Generate audit report summary
// ---------------------------------------------------------------------------
router.get('/plans/:id/report', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const plan = auditPlans.get(id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: `Audit plan '${id}' not found` },
      });
    }

    const score = calculateAuditScore(plan);
    const gaps = getMandatoryGaps(plan);
    const majorNCs = getClausesByStatus(plan, 'MAJOR_NC');
    const minorNCs = getClausesByStatus(plan, 'MINOR_NC');
    const observations = getClausesByStatus(plan, 'OBSERVATION');

    // Determine overall recommendation
    let recommendation: string;
    if (score.majorNCs > 0) {
      recommendation =
        'NOT RECOMMENDED - Major non-conformities must be resolved before certification/continued compliance';
    } else if (score.minorNCs > 3) {
      recommendation =
        'CONDITIONAL - Multiple minor non-conformities require corrective action within 90 days';
    } else if (score.minorNCs > 0) {
      recommendation =
        'CONDITIONAL - Minor non-conformities require corrective action within 90 days';
    } else if (gaps.length > 0) {
      recommendation = 'INCOMPLETE - Mandatory clauses have not been fully assessed';
    } else {
      recommendation = 'RECOMMENDED - System conforms to the requirements of the standard';
    }

    const checklist = getChecklist(plan.standard);

    const report = {
      planId: plan.id,
      standard: plan.standard,
      standardTitle: checklist?.title || plan.standard,
      standardVersion: checklist?.version || 'Unknown',
      title: plan.title,
      scope: plan.scope,
      auditType: plan.auditType,
      createdAt: plan.createdAt,
      generatedAt: new Date(),

      // Score summary
      score: {
        ...score,
        conformanceRate: Math.round(score.conformanceRate * 100) / 100,
      },

      // Recommendation
      recommendation,

      // Major Non-Conformities
      majorNonConformities: majorNCs.map((nc) => ({
        clause: nc.clause,
        title: nc.title,
        findings: nc.findings,
        objectiveEvidence: nc.objectiveEvidence,
        auditorNotes: nc.auditorNotes,
      })),

      // Minor Non-Conformities
      minorNonConformities: minorNCs.map((nc) => ({
        clause: nc.clause,
        title: nc.title,
        findings: nc.findings,
        objectiveEvidence: nc.objectiveEvidence,
        auditorNotes: nc.auditorNotes,
      })),

      // Observations
      observations: observations.map((obs) => ({
        clause: obs.clause,
        title: obs.title,
        findings: obs.findings,
        auditorNotes: obs.auditorNotes,
      })),

      // Mandatory Gaps
      mandatoryGaps: gaps.map((g) => ({
        clause: g.clause,
        title: g.title,
        status: g.status,
      })),

      // Clause-by-clause summary
      clauseSummary: plan.clauses.map((c) => ({
        clause: c.clause,
        title: c.title,
        mandatory: c.mandatory,
        status: c.status,
        findingCount: c.findings.length,
        evidenceCount: c.objectiveEvidence.length,
      })),
    };

    logger.info('Audit report generated', {
      planId: plan.id,
      standard: plan.standard,
      recommendation,
      userId: req.user?.id,
    });

    res.json({ success: true, data: report });
  } catch (error) {
    logger.error('Failed to generate audit report', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate audit report' },
    });
  }
});

export default router;
