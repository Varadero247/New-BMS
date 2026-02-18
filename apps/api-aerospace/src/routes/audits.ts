import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-aerospace');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// Reference Number Generator
// ============================================

async function generateAuditRefNumber(): Promise<string> {
  const now = new Date();
  const yyyy = now.getFullYear();
  const count = await prisma.aeroAudit.count({
    where: { refNumber: { startsWith: `AERO-AUD-${yyyy}` } },
  });
  return `AERO-AUD-${yyyy}-${String(count + 1).padStart(3, '0')}`;
}

async function generateFindingRefNumber(auditRef: string): Promise<string> {
  const count = await prisma.aeroAuditFinding.count({
    where: { auditRefNumber: auditRef },
  });
  return `${auditRef}-F${String(count + 1).padStart(2, '0')}`;
}

// ============================================
// Zod Schemas
// ============================================

const createAuditSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'CUSTOMER', 'REGULATORY', 'CERTIFICATION', 'SURVEILLANCE']),
  standard: z.string().optional().default('AS9100D'),
  scope: z.string().min(1, 'Scope is required'),
  scheduledDate: z.string().min(1, 'Scheduled date is required'),
  leadAuditor: z.string().min(1, 'Lead auditor is required'),
  auditTeam: z.array(z.string()).optional().default([]),
  auditee: z.string().optional(),
  location: z.string().optional(),
  clauses: z.array(z.string()).optional().default([]),
  objectives: z.string().optional(),
  notes: z.string().optional(),
});

const updateAuditSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  auditType: z.enum(['INTERNAL', 'EXTERNAL', 'CUSTOMER', 'REGULATORY', 'CERTIFICATION', 'SURVEILLANCE']).optional(),
  standard: z.string().optional(),
  scope: z.string().optional(),
  scheduledDate: z.string().optional(),
  actualDate: z.string().optional(),
  leadAuditor: z.string().optional(),
  auditTeam: z.array(z.string()).optional(),
  auditee: z.string().optional(),
  location: z.string().optional(),
  clauses: z.array(z.string()).optional(),
  objectives: z.string().optional(),
  status: z.enum(['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DEFERRED']).optional(),
  summary: z.string().optional(),
  notes: z.string().optional(),
});

const createFindingSchema = z.object({
  auditId: z.string().min(1, 'Audit ID is required'),
  findingType: z.enum(['NONCONFORMITY', 'OBSERVATION', 'OPPORTUNITY_FOR_IMPROVEMENT', 'POSITIVE_FINDING']),
  severity: z.enum(['MAJOR', 'MINOR']).optional(),
  clause: z.string().optional(),
  description: z.string().min(1, 'Description is required'),
  evidence: z.string().optional(),
  requirement: z.string().optional(),
  responsiblePerson: z.string().optional(),
  targetDate: z.string().optional(),
});

const closeFindingSchema = z.object({
  correctiveAction: z.string().min(1, 'Corrective action is required'),
  closedBy: z.string().optional(),
  verificationEvidence: z.string().optional(),
});

// ============================================
// AUDITS — CRUD
// ============================================

// GET / - List audits
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, auditType, search } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = { deletedAt: null };
    if (status) where.status = status as any;
    if (auditType) where.auditType = auditType as any;
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { scope: { contains: search as string, mode: 'insensitive' } },
        { leadAuditor: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [audits, total] = await Promise.all([
      prisma.aeroAudit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledDate: 'desc' },
        include: {
          findings: {
            select: { id: true, findingType: true, severity: true, status: true },
          },
        },
      }),
      prisma.aeroAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List audits error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' } });
  }
});

// GET /:id - Get audit with findings
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const audit = await prisma.aeroAudit.findUnique({
      where: { id: req.params.id },
      include: { findings: true },
    });

    if (!audit || audit.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    res.json({ success: true, data: audit });
  } catch (error) {
    logger.error('Get audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit' } });
  }
});

// POST / - Create audit
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const data = createAuditSchema.parse(req.body);
    const refNumber = await generateAuditRefNumber();

    const audit = await prisma.aeroAudit.create({
      data: {
        refNumber,
        title: data.title,
        auditType: data.auditType,
        standard: data.standard,
        scope: data.scope,
        scheduledDate: new Date(data.scheduledDate),
        leadAuditor: data.leadAuditor,
        auditTeam: data.auditTeam,
        auditee: data.auditee,
        location: data.location,
        clauses: data.clauses,
        objectives: data.objectives,
        notes: data.notes,
        status: 'SCHEDULED',
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } });
  }
});

// PUT /:id - Update audit
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroAudit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const data = updateAuditSchema.parse(req.body);

    const audit = await prisma.aeroAudit.update({
      where: { id: req.params.id },
      data: {
        ...data,
        scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : existing.scheduledDate,
        actualDate: data.actualDate ? new Date(data.actualDate) : existing.actualDate,
      },
    });

    res.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Update audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' } });
  }
});

// DELETE /:id - Soft delete audit
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroAudit.findUnique({ where: { id: req.params.id } });
    if (!existing || existing.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    await prisma.aeroAudit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' } });
  }
});

// ============================================
// FINDINGS
// ============================================

// POST /findings - Record finding
router.post('/findings', async (req: AuthRequest, res: Response) => {
  try {
    const data = createFindingSchema.parse(req.body);

    const audit = await prisma.aeroAudit.findUnique({ where: { id: data.auditId } });
    if (!audit || audit.deletedAt) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const refNumber = await generateFindingRefNumber(audit.refNumber);

    const finding = await prisma.aeroAuditFinding.create({
      data: {
        refNumber,
        auditId: data.auditId,
        auditRefNumber: audit.refNumber,
        findingType: data.findingType,
        severity: data.severity,
        clause: data.clause,
        description: data.description,
        evidence: data.evidence,
        requirement: data.requirement,
        responsiblePerson: data.responsiblePerson,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: 'OPEN',
        raisedBy: req.user?.id,
      } as any,
    });

    res.status(201).json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Create finding error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create finding' } });
  }
});

// PUT /findings/:id/close - Close a finding
router.put('/findings/:id/close', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.aeroAuditFinding.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Finding not found' } });
    }

    const data = closeFindingSchema.parse(req.body);

    const finding = await prisma.aeroAuditFinding.update({
      where: { id: req.params.id },
      data: {
        correctiveAction: data.correctiveAction,
        closedBy: data.closedBy || req.user?.id,
        verificationEvidence: data.verificationEvidence,
        closedDate: new Date(),
        status: 'CLOSED',
      },
    });

    res.json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) },
      });
    }
    logger.error('Close finding error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to close finding' } });
  }
});

// GET /schedule/upcoming - Upcoming scheduled audits
router.get('/schedule/upcoming', async (req: AuthRequest, res: Response) => {
  try {
    const { days = '90', page = '1', limit = '50' } = req.query;
    const daysNum = parseInt(days as string, 10) || 90;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + daysNum);

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 50), 200);
    const skip = (pageNum - 1) * limitNum;

    const where: Record<string, unknown> = {
      deletedAt: null,
      status: 'SCHEDULED',
      scheduledDate: { lte: cutoff },
    };

    const [audits, total] = await Promise.all([
      prisma.aeroAudit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { scheduledDate: 'asc' },
        include: {
          findings: { select: { id: true, findingType: true, status: true } },
        },
      }),
      prisma.aeroAudit.count({ where }),
    ]);

    res.json({ success: true, data: audits, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } });
  } catch (error) {
    logger.error('Upcoming schedule error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get upcoming audits' } });
  }
});

export default router;
