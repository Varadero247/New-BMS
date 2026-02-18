import { randomUUID } from 'crypto';
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function generateAuditRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `ISA-${yy}${mm}-${rand}`;
}

function generateScanRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `VS-${yy}${mm}-${rand}`;
}

function generatePenTestRef(): string {
  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, '0');
  const rand = (parseInt(randomUUID().replace(/-/g, '').slice(0, 4), 16) % 9000) + 1000;
  return `PT-${yy}${mm}-${rand}`;
}

const RESERVED_PATHS = new Set(['vulnerability-scans', 'penetration-tests']);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const auditCreateSchema = z.object({
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  auditDate: z.string(),
  leadAuditor: z.string().min(1).max(200),
  auditTeam: z.array(z.string()).optional(),
  scope: z.string().max(5000).optional(),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SURVEILLANCE', 'CERTIFICATION', 'RECERTIFICATION']).optional(),
});

const findingCreateSchema = z.object({
  clause: z.string().min(1).max(50),
  type: z.enum(['NONCONFORMITY_MAJOR', 'NONCONFORMITY_MINOR', 'OBSERVATION', 'OPPORTUNITY_FOR_IMPROVEMENT']),
  description: z.string().min(1).max(5000),
  evidence: z.string().max(5000).optional(),
  recommendation: z.string().max(5000).optional(),
});

const auditCompleteSchema = z.object({
  summary: z.string().min(1).max(10000),
  overallConclusion: z.string().max(5000).optional(),
});

const vulnScanCreateSchema = z.object({
  scanName: z.string().min(1).max(300),
  scanDate: z.string(),
  scanner: z.string().max(200).optional(),
  targetSystems: z.array(z.string()).optional(),
  criticalCount: z.number().int().min(0).optional().default(0),
  highCount: z.number().int().min(0).optional().default(0),
  mediumCount: z.number().int().min(0).optional().default(0),
  lowCount: z.number().int().min(0).optional().default(0),
  infoCount: z.number().int().min(0).optional().default(0),
  summary: z.string().max(5000).optional(),
  reportUrl: z.string().max(1000).optional(),
});

const penTestCreateSchema = z.object({
  testName: z.string().min(1).max(300),
  testDate: z.string(),
  tester: z.string().max(200).optional(),
  methodology: z.string().max(1000).optional(),
  scope: z.string().max(5000).optional(),
  findingsCount: z.number().int().min(0).optional().default(0),
  criticalFindings: z.number().int().min(0).optional().default(0),
  highFindings: z.number().int().min(0).optional().default(0),
  summary: z.string().max(5000).optional(),
  reportUrl: z.string().max(1000).optional(),
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'REMEDIATION']).optional(),
});

// ===================================================================
// ISMS AUDITS
// ===================================================================

// ---------------------------------------------------------------------------
// POST / — Create ISMS audit
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = auditCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateAuditRef();

    const audit = await prisma.isAudit.create({
      data: {
        refNumber,
        title: parsed.data.title,
        description: parsed.data.description || null,
        auditDate: new Date(parsed.data.auditDate),
        leadAuditor: parsed.data.leadAuditor,
        auditTeam: parsed.data.auditTeam || [],
        scope: parsed.data.scope || null,
        auditType: parsed.data.auditType || 'INTERNAL',
        status: 'PLANNED',
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('ISMS audit created', { auditId: audit.id, refNumber });
    res.status(201).json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to create ISMS audit', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to create ISMS audit' });
  }
});

// ---------------------------------------------------------------------------
// GET / — List audits
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const { status, auditType, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { deletedAt: null };

    if (status && typeof status === 'string') {
      where.status = status;
    }
    if (auditType && typeof auditType === 'string') {
      where.auditType = auditType;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { refNumber: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [audits, total] = await Promise.all([
      prisma.isAudit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { auditDate: 'desc' },
      }),
      prisma.isAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list ISMS audits', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list ISMS audits' });
  }
});

// ---------------------------------------------------------------------------
// GET /vulnerability-scans — List vulnerability scans
// ---------------------------------------------------------------------------
router.get('/vulnerability-scans', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const [scans, total] = await Promise.all([
      prisma.isVulnerabilityScan.findMany({
        skip,
        take: limit,
        orderBy: { scanDate: 'desc' },
      }),
      prisma.isVulnerabilityScan.count(),
    ]);

    res.json({
      success: true,
      data: scans,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list vulnerability scans', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list vulnerability scans' });
  }
});

// ---------------------------------------------------------------------------
// POST /vulnerability-scans — Log scan result
// ---------------------------------------------------------------------------
router.post('/vulnerability-scans', async (req: Request, res: Response) => {
  try {
    const parsed = vulnScanCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generateScanRef();

    const scan = await prisma.isVulnerabilityScan.create({
      data: {
        refNumber,
        scanName: parsed.data.scanName,
        scanDate: new Date(parsed.data.scanDate),
        scanner: parsed.data.scanner || null,
        targetSystems: parsed.data.targetSystems || [],
        criticalCount: parsed.data.criticalCount || 0,
        highCount: parsed.data.highCount || 0,
        mediumCount: parsed.data.mediumCount || 0,
        lowCount: parsed.data.lowCount || 0,
        infoCount: parsed.data.infoCount || 0,
        summary: parsed.data.summary || null,
        reportUrl: parsed.data.reportUrl || null,
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Vulnerability scan logged', { scanId: scan.id, refNumber });
    res.status(201).json({ success: true, data: scan });
  } catch (error: unknown) {
    logger.error('Failed to log vulnerability scan', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to log vulnerability scan' });
  }
});

// ---------------------------------------------------------------------------
// GET /penetration-tests — List pen test results
// ---------------------------------------------------------------------------
router.get('/penetration-tests', async (req: Request, res: Response) => {
  try {
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 25);
    const skip = (page - 1) * limit;

    const [tests, total] = await Promise.all([
      prisma.isPenetrationTest.findMany({
        skip,
        take: limit,
        orderBy: { testDate: 'desc' },
      }),
      prisma.isPenetrationTest.count(),
    ]);

    res.json({
      success: true,
      data: tests,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: unknown) {
    logger.error('Failed to list penetration tests', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to list penetration tests' });
  }
});

// ---------------------------------------------------------------------------
// POST /penetration-tests — Log pen test result
// ---------------------------------------------------------------------------
router.post('/penetration-tests', async (req: Request, res: Response) => {
  try {
    const parsed = penTestCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const authReq = req as AuthRequest;
    const refNumber = generatePenTestRef();

    const test = await prisma.isPenetrationTest.create({
      data: {
        refNumber,
        testName: parsed.data.testName,
        testDate: new Date(parsed.data.testDate),
        tester: parsed.data.tester || null,
        methodology: parsed.data.methodology || null,
        scope: parsed.data.scope || null,
        findingsCount: parsed.data.findingsCount || 0,
        criticalFindings: parsed.data.criticalFindings || 0,
        highFindings: parsed.data.highFindings || 0,
        summary: parsed.data.summary || null,
        reportUrl: parsed.data.reportUrl || null,
        status: (parsed.data.status || 'PLANNED') as any,
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Penetration test logged', { testId: test.id, refNumber });
    res.status(201).json({ success: true, data: test });
  } catch (error: unknown) {
    logger.error('Failed to log penetration test', { error: error instanceof Error ? error.message : 'Unknown error' });
    res.status(500).json({ success: false, error: 'Failed to log penetration test' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — Audit detail with findings
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const audit = await prisma.isAudit.findFirst({
      where: { id, deletedAt: null } as any,
      include: {
        findings: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!audit) {
      return res.status(404).json({ success: false, error: 'ISMS audit not found' });
    }

    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to get ISMS audit', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get ISMS audit' });
  }
});

// ---------------------------------------------------------------------------
// GET /:id/checklist — ISO 27001:2022 clause checklist (mock)
// ---------------------------------------------------------------------------
router.get('/:id/checklist', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const audit = await prisma.isAudit.findFirst({ where: { id, deletedAt: null } as any });
    if (!audit) {
      return res.status(404).json({ success: false, error: 'ISMS audit not found' });
    }

    const checklist = [
      { clause: '4.1', title: 'Understanding the organization and its context', category: 'Context of the Organization' },
      { clause: '4.2', title: 'Understanding the needs and expectations of interested parties', category: 'Context of the Organization' },
      { clause: '4.3', title: 'Determining the scope of the ISMS', category: 'Context of the Organization' },
      { clause: '4.4', title: 'Information security management system', category: 'Context of the Organization' },
      { clause: '5.1', title: 'Leadership and commitment', category: 'Leadership' },
      { clause: '5.2', title: 'Policy', category: 'Leadership' },
      { clause: '5.3', title: 'Organizational roles, responsibilities and authorities', category: 'Leadership' },
      { clause: '6.1', title: 'Actions to address risks and opportunities', category: 'Planning' },
      { clause: '6.2', title: 'Information security objectives and planning to achieve them', category: 'Planning' },
      { clause: '6.3', title: 'Planning of changes', category: 'Planning' },
      { clause: '7.1', title: 'Resources', category: 'Support' },
      { clause: '7.2', title: 'Competence', category: 'Support' },
      { clause: '7.3', title: 'Awareness', category: 'Support' },
      { clause: '7.4', title: 'Communication', category: 'Support' },
      { clause: '7.5', title: 'Documented information', category: 'Support' },
      { clause: '8.1', title: 'Operational planning and control', category: 'Operation' },
      { clause: '8.2', title: 'Information security risk assessment', category: 'Operation' },
      { clause: '8.3', title: 'Information security risk treatment', category: 'Operation' },
      { clause: '9.1', title: 'Monitoring, measurement, analysis and evaluation', category: 'Performance Evaluation' },
      { clause: '9.2', title: 'Internal audit', category: 'Performance Evaluation' },
      { clause: '9.3', title: 'Management review', category: 'Performance Evaluation' },
      { clause: '10.1', title: 'Continual improvement', category: 'Improvement' },
      { clause: '10.2', title: 'Nonconformity and corrective action', category: 'Improvement' },
    ];

    res.json({
      success: true,
      data: {
        auditId: id,
        standard: 'ISO 27001:2022',
        clauses: checklist,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get audit checklist', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to get audit checklist' });
  }
});

// ---------------------------------------------------------------------------
// POST /:id/findings — Add finding to audit
// ---------------------------------------------------------------------------
router.post('/:id/findings', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = findingCreateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const audit = await prisma.isAudit.findFirst({ where: { id, deletedAt: null } as any });
    if (!audit) {
      return res.status(404).json({ success: false, error: 'ISMS audit not found' });
    }

    const authReq = req as AuthRequest;
    const finding = await prisma.isAuditFinding.create({
      data: {
        auditId: id,
        clause: parsed.data.clause,
        type: parsed.data.type,
        description: parsed.data.description,
        evidence: parsed.data.evidence || null,
        recommendation: parsed.data.recommendation || null,
        status: 'OPEN',
        createdBy: authReq.user?.id || 'system',
      } as any,
    });

    logger.info('Audit finding added', { auditId: id, findingId: finding.id, type: parsed.data.type });
    res.status(201).json({ success: true, data: finding });
  } catch (error: unknown) {
    logger.error('Failed to add audit finding', { error: error instanceof Error ? error.message : 'Unknown error', auditId: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to add audit finding' });
  }
});

// ---------------------------------------------------------------------------
// PUT /:id/complete — Complete audit
// ---------------------------------------------------------------------------
router.put('/:id/complete', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;
    const parsed = auditCompleteSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, error: 'Validation failed', details: parsed.error.flatten() });
    }

    const existing = await prisma.isAudit.findFirst({ where: { id, deletedAt: null } as any });
    if (!existing) {
      return res.status(404).json({ success: false, error: 'ISMS audit not found' });
    }

    const authReq = req as AuthRequest;
    const audit = await prisma.isAudit.update({
      where: { id },
      data: {
        summary: parsed.data.summary,
        overallConclusion: parsed.data.overallConclusion || null,
        status: 'COMPLETED',
        completedAt: new Date(),
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      } as any,
      include: {
        findings: true,
      },
    });

    logger.info('ISMS audit completed', { auditId: id });
    res.json({ success: true, data: audit });
  } catch (error: unknown) {
    logger.error('Failed to complete ISMS audit', { error: error instanceof Error ? error.message : 'Unknown error', id: req.params.id });
    res.status(500).json({ success: false, error: 'Failed to complete ISMS audit' });
  }
});

export default router;
