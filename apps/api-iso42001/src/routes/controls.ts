// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('api-iso42001');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const statusUpdateSchema = z.object({
  implementationStatus: z.enum([
    'NOT_APPLICABLE',
    'NOT_IMPLEMENTED',
    'PARTIALLY_IMPLEMENTED',
    'FULLY_IMPLEMENTED',
    'PLANNED',
  ]),
  justification: z.string().trim().max(4000).optional().nullable(),
});

const implementationUpdateSchema = z.object({
  implementationNotes: z.string().trim().max(10000).optional().nullable(),
  evidence: z.string().trim().max(10000).optional().nullable(),
  responsiblePerson: z.string().trim().max(200).optional().nullable(),
  targetDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
  completionDate: z
    .string()
    .refine((s) => !isNaN(Date.parse(s)), 'Invalid date format')
    .optional()
    .nullable(),
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function parseIntParam(val: unknown, fallback: number, max = Infinity): number {
  const n = parseInt(String(val), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, max) : fallback;
}

// ---------------------------------------------------------------------------
// ISO 42001 Annex A Controls — Static seed data
// ---------------------------------------------------------------------------

const ANNEX_A_CONTROLS = [
  // A.2 — AI Policy
  {
    controlId: 'A.2.1',
    domain: 'AI_POLICY',
    title: 'AI policy',
    description:
      'The organization shall establish an AI policy that is appropriate to its purpose and provides a framework for setting AI objectives.',
  },
  {
    controlId: 'A.2.2',
    domain: 'AI_POLICY',
    title: 'AI policy communication',
    description:
      'The AI policy shall be communicated within the organization and to interested parties as appropriate.',
  },
  // A.3 — Internal organization
  {
    controlId: 'A.3.1',
    domain: 'INTERNAL_ORGANIZATION',
    title: 'Roles and responsibilities',
    description: 'All AI-related responsibilities shall be defined and allocated.',
  },
  {
    controlId: 'A.3.2',
    domain: 'INTERNAL_ORGANIZATION',
    title: 'Segregation of duties',
    description:
      'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of AI systems.',
  },
  // A.4 — Resources for AI systems
  {
    controlId: 'A.4.1',
    domain: 'RESOURCES',
    title: 'Resources for AI systems',
    description:
      'The organization shall determine and provide the resources needed for the AI management system.',
  },
  {
    controlId: 'A.4.2',
    domain: 'RESOURCES',
    title: 'Competence',
    description:
      'The organization shall ensure that persons doing work under its control that affects AI system performance are competent.',
  },
  {
    controlId: 'A.4.3',
    domain: 'RESOURCES',
    title: 'Awareness',
    description:
      'Persons doing work shall be aware of the AI policy, their contribution to the AI management system, and implications of not conforming.',
  },
  // A.5 — AI system impact assessment
  {
    controlId: 'A.5.1',
    domain: 'IMPACT_ASSESSMENT',
    title: 'AI system impact assessment process',
    description:
      'The organization shall establish and implement an AI system impact assessment process.',
  },
  {
    controlId: 'A.5.2',
    domain: 'IMPACT_ASSESSMENT',
    title: 'Documentation of impact assessments',
    description: 'Results of AI system impact assessments shall be documented.',
  },
  {
    controlId: 'A.5.3',
    domain: 'IMPACT_ASSESSMENT',
    title: 'Impact assessment review',
    description:
      'AI system impact assessments shall be reviewed at planned intervals or when significant changes occur.',
  },
  // A.6 — AI system lifecycle
  {
    controlId: 'A.6.1',
    domain: 'LIFECYCLE',
    title: 'AI system lifecycle management',
    description: 'The organization shall manage AI systems throughout their lifecycle.',
  },
  {
    controlId: 'A.6.2',
    domain: 'LIFECYCLE',
    title: 'AI system design and development',
    description:
      'AI systems shall be designed and developed in accordance with the AI policy and objectives.',
  },
  {
    controlId: 'A.6.3',
    domain: 'LIFECYCLE',
    title: 'AI system testing and validation',
    description: 'AI systems shall be tested and validated before deployment.',
  },
  {
    controlId: 'A.6.4',
    domain: 'LIFECYCLE',
    title: 'AI system deployment',
    description: 'AI system deployment shall be controlled and authorized.',
  },
  {
    controlId: 'A.6.5',
    domain: 'LIFECYCLE',
    title: 'AI system operation and monitoring',
    description: 'AI systems shall be operated and monitored to ensure continued conformity.',
  },
  {
    controlId: 'A.6.6',
    domain: 'LIFECYCLE',
    title: 'AI system retirement',
    description: 'AI systems shall be retired in a controlled manner.',
  },
  // A.7 — Data for AI systems
  {
    controlId: 'A.7.1',
    domain: 'DATA',
    title: 'Data management',
    description: 'Data used for AI systems shall be managed throughout the data lifecycle.',
  },
  {
    controlId: 'A.7.2',
    domain: 'DATA',
    title: 'Data quality',
    description: 'The organization shall ensure the quality of data used for AI systems.',
  },
  {
    controlId: 'A.7.3',
    domain: 'DATA',
    title: 'Data provenance',
    description: 'The provenance of data used in AI systems shall be documented.',
  },
  {
    controlId: 'A.7.4',
    domain: 'DATA',
    title: 'Data protection',
    description:
      'Data used for AI systems shall be protected in accordance with applicable requirements.',
  },
  // A.8 — AI system transparency and explainability
  {
    controlId: 'A.8.1',
    domain: 'TRANSPARENCY',
    title: 'Transparency of AI systems',
    description:
      'The organization shall provide transparency about its AI systems to affected stakeholders.',
  },
  {
    controlId: 'A.8.2',
    domain: 'TRANSPARENCY',
    title: 'Explainability',
    description:
      'The organization shall provide explanations of AI system outputs and decisions where applicable.',
  },
  {
    controlId: 'A.8.3',
    domain: 'TRANSPARENCY',
    title: 'AI system documentation',
    description: 'AI systems shall be documented to support transparency and accountability.',
  },
  // A.9 — AI system accountability
  {
    controlId: 'A.9.1',
    domain: 'ACCOUNTABILITY',
    title: 'Accountability framework',
    description: 'The organization shall establish an accountability framework for AI systems.',
  },
  {
    controlId: 'A.9.2',
    domain: 'ACCOUNTABILITY',
    title: 'Human oversight',
    description: 'AI systems shall be subject to human oversight appropriate to their risk level.',
  },
  {
    controlId: 'A.9.3',
    domain: 'ACCOUNTABILITY',
    title: 'AI system audit',
    description: 'AI systems shall be subject to audits at planned intervals.',
  },
  // A.10 — Third-party and supplier management
  {
    controlId: 'A.10.1',
    domain: 'THIRD_PARTY',
    title: 'Third-party AI components',
    description: 'The use of third-party AI components shall be controlled.',
  },
  {
    controlId: 'A.10.2',
    domain: 'THIRD_PARTY',
    title: 'Supplier management',
    description: 'AI-related suppliers shall be evaluated and monitored.',
  },
  {
    controlId: 'A.10.3',
    domain: 'THIRD_PARTY',
    title: 'Outsourced AI processes',
    description: 'Outsourced AI processes shall be controlled.',
  },
];

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /soa — Statement of Applicability
router.get('/soa', async (_req: Request, res: Response) => {
  try {
    const controls = await prisma.aiControl.findMany({
      orderBy: { code: 'asc' },
      take: 200,
    });

    // Build SOA with status summary
    const controlMap = new Map(controls.map((c) => [(c as Record<string, unknown>).controlId || c.code, c]));

    const soa = ANNEX_A_CONTROLS.map((annexControl) => {
      const dbControl = controlMap.get(annexControl.controlId);
      return {
        ...annexControl,
        id: dbControl?.id || null,
        implementationStatus:
          (dbControl as Record<string, unknown>)?.implementationStatus || dbControl?.status || 'NOT_IMPLEMENTED',
        justification: (dbControl as Record<string, unknown>)?.justification || null,
        implementationNotes: dbControl?.implementationNotes || null,
        evidence: (dbControl as Record<string, unknown>)?.evidence || dbControl?.evidenceLinks || null,
        responsiblePerson: (dbControl as Record<string, unknown>)?.responsiblePerson || dbControl?.owner || null,
        targetDate: (dbControl as Record<string, unknown>)?.targetDate || null,
        completionDate: (dbControl as Record<string, unknown>)?.completionDate || null,
      };
    });

    // Summary statistics
    const statusCounts: Record<string, number> = {
      NOT_APPLICABLE: 0,
      NOT_IMPLEMENTED: 0,
      PARTIALLY_IMPLEMENTED: 0,
      FULLY_IMPLEMENTED: 0,
      PLANNED: 0,
    };

    for (const item of soa) {
      const statusKey = String(item.implementationStatus);
      statusCounts[statusKey] = (statusCounts[statusKey] || 0) + 1;
    }

    const totalControls = soa.length;
    const applicableControls = totalControls - statusCounts.NOT_APPLICABLE;
    const implementedControls = statusCounts.FULLY_IMPLEMENTED;
    const compliancePercentage =
      applicableControls > 0 ? Math.round((implementedControls / applicableControls) * 100) : 0;

    res.json({
      success: true,
      data: {
        controls: soa,
        summary: {
          totalControls,
          applicableControls,
          implementedControls,
          compliancePercentage,
          statusCounts,
        },
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to generate SOA', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate Statement of Applicability' },
    });
  }
});

// GET / — List controls
router.get('/', async (req: Request, res: Response) => {
  try {
    const { domain, status, search } = req.query;
    const page = parseIntParam(req.query.page, 1);
    const limit = parseIntParam(req.query.limit, 50, 100);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (domain && typeof domain === 'string') {
      where.domain = domain;
    }
    if (status && typeof status === 'string') {
      where.implementationStatus = status;
    }
    if (search && typeof search === 'string') {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { controlId: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [controls, total] = await Promise.all([
      prisma.aiControl.findMany({
        where,
        skip,
        take: limit,
        orderBy: { code: 'asc' },
      }),
      prisma.aiControl.count({ where }),
    ]);

    res.json({
      success: true,
      data: controls,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to list controls', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list controls' },
    });
  }
});

// PUT /:id/status — Update implementation status
router.put('/:id/status', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = statusUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiControl.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.aiControl.update({
      where: { id },
      data: {
        implementationStatus: parsed.data.implementationStatus,
        justification: parsed.data.justification ?? null,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Control status updated', {
      controlId: id,
      status: parsed.data.implementationStatus,
    });
    res.json({ success: true, data: control });
  } catch (error: unknown) {
    logger.error('Failed to update control status', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update control status' },
    });
  }
});

// PUT /:id/implementation — Update implementation notes and evidence
router.put('/:id/implementation', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const parsed = implementationUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: parsed.error.flatten(),
        },
      });
    }

    const existing = await prisma.aiControl.findUnique({ where: { id } });
    if (!existing) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    const authReq = req as AuthRequest;
    const control = await prisma.aiControl.update({
      where: { id },
      data: {
        implementationNotes: parsed.data.implementationNotes ?? null,
        evidence: parsed.data.evidence ?? null,
        responsiblePerson: parsed.data.responsiblePerson ?? null,
        targetDate:
          parsed.data.targetDate !== undefined
            ? parsed.data.targetDate
              ? new Date(parsed.data.targetDate)
              : null
            : undefined,
        completionDate:
          parsed.data.completionDate !== undefined
            ? parsed.data.completionDate
              ? new Date(parsed.data.completionDate)
              : null
            : undefined,
        updatedBy: authReq.user?.id || 'system',
        updatedAt: new Date(),
      },
    });

    logger.info('Control implementation updated', { controlId: id });
    res.json({ success: true, data: control });
  } catch (error: unknown) {
    logger.error('Failed to update control implementation', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update control implementation' },
    });
  }
});

// GET /:id — Get control by ID
const RESERVED_PATHS = new Set(['soa', 'status', 'implementation']);
router.get('/:id', async (req: Request, res: Response, next) => {
  if (RESERVED_PATHS.has(req.params.id)) return next('route');
  try {
    const { id } = req.params;

    const control = await prisma.aiControl.findUnique({
      where: { id },
    });

    if (!control) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Control not found' } });
    }

    // Enrich with Annex A metadata
    const annexData = ANNEX_A_CONTROLS.find(
      (c) => c.controlId === ((control as Record<string, unknown>).controlId || control.code)
    );

    res.json({
      success: true,
      data: {
        ...control,
        annexDescription: annexData?.description || null,
        annexDomain: annexData?.domain || null,
      },
    });
  } catch (error: unknown) {
    logger.error('Failed to get control', {
      error: error instanceof Error ? error.message : 'Unknown error',
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get control' },
    });
  }
});

export default router;
