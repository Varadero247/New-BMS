import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-environment');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('fid', validateIdParam('fid'));

async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `ENV-AUD-${yy}${mm}`;
  const count = await prisma.envAudit.count({
    where: { refNumber: { startsWith: prefix } },
  });
  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// GET / - List audits
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '50', type, status, search, dateFrom, dateTo } = req.query;
    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(parseInt(limit as string, 10) || 20, 100);
    const skip = (pageNum - 1) * limitNum;

    const where: Prisma.EnvAuditWhereInput = { deletedAt: null };
    if (type) where.type = type;
    if (status) where.status = status;
    if (dateFrom || dateTo) {
      where.auditDate = {};
      if (dateFrom) where.auditDate.gte = new Date(dateFrom as string);
      if (dateTo) where.auditDate.lte = new Date(dateTo as string);
    }
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { scope: { contains: search as string, mode: 'insensitive' } },
        { refNumber: { contains: search as string, mode: 'insensitive' } },
        { leadAuditor: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const [audits, total] = await Promise.all([
      prisma.envAudit.findMany({ where, skip, take: limitNum, orderBy: { auditDate: 'desc' } }),
      prisma.envAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: { audits, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } },
    });
  } catch (error) {
    logger.error('List audits error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' } });
  }
});

// GET /schedule - Get upcoming audit schedules
router.get('/schedule', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const schedules = await prisma.envAuditSchedule.findMany({
      where: { active: true },
      orderBy: { nextDueDate: 'asc' },
    });

    res.json({ success: true, data: schedules });
  } catch (error) {
    logger.error('List audit schedules error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audit schedules' } });
  }
});

// POST /schedule - Create audit schedule
router.post('/schedule', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      type: z.enum(['SYSTEM', 'COMPLIANCE', 'SITE', 'SUPPLIER', 'MANAGEMENT_REVIEW']),
      frequency: z.string().min(1),
      nextDueDate: z.string().min(1),
      iso14001Clauses: z.array(z.string()).min(1),
      description: z.string().optional(),
      assignedAuditor: z.string().optional(),
      active: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const schedule = await prisma.envAuditSchedule.create({
      data: {
        title: data.title,
        type: data.type as any,
        frequency: data.frequency,
        nextDueDate: new Date(data.nextDueDate),
        iso14001Clauses: data.iso14001Clauses,
        description: data.description,
        assignedAuditor: data.assignedAuditor,
        active: data.active ?? true,
      },
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create audit schedule error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit schedule' } });
  }
});

// GET /:id - Get single audit with findings
router.get('/:id', checkOwnership(prisma.envAudit), async (req: AuthRequest, res: Response) => {
  try {
    const audit = await prisma.envAudit.findUnique({
      where: { id: req.params.id },
      include: { findings: true },
    });
    if (!audit) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    res.json({ success: true, data: audit });
  } catch (error) {
    logger.error('Get audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit' } });
  }
});

// POST / - Create audit
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      type: z.enum(['SYSTEM', 'COMPLIANCE', 'SITE', 'SUPPLIER', 'MANAGEMENT_REVIEW']),
      scope: z.string().min(1),
      auditDate: z.string().min(1),
      leadAuditor: z.string().min(1),
      iso14001Clauses: z.array(z.string()).min(1),
      department: z.string().optional(),
      auditTeam: z.array(z.string()).optional().default([]),
      objective: z.string().optional(),
      criteria: z.string().optional(),
      methodology: z.string().optional(),
      status: z.string().optional(),
      openingMeetingDate: z.string().optional(),
      closingMeetingDate: z.string().optional(),
      reportDueDate: z.string().optional(),
      summary: z.string().optional(),
      conclusions: z.string().optional(),
      recommendations: z.string().optional(),
      aiAuditPlan: z.string().optional(),
      aiClauseAnalysis: z.string().optional(),
      aiRiskAssessment: z.string().optional(),
      aiRecommendations: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRefNumber();

    const audit = await prisma.envAudit.create({
      data: {
        refNumber,
        title: data.title,
        type: data.type as any,
        scope: data.scope,
        auditDate: new Date(data.auditDate),
        leadAuditor: data.leadAuditor,
        iso14001Clauses: data.iso14001Clauses,
        department: data.department,
        auditTeam: data.auditTeam,
        objective: data.objective,
        criteria: data.criteria,
        methodology: data.methodology,
        status: (data.status as any) || 'PLANNED',
        openingMeetingDate: data.openingMeetingDate ? new Date(data.openingMeetingDate) : null,
        closingMeetingDate: data.closingMeetingDate ? new Date(data.closingMeetingDate) : null,
        reportDueDate: data.reportDueDate ? new Date(data.reportDueDate) : null,
        summary: data.summary,
        conclusions: data.conclusions,
        recommendations: data.recommendations,
        aiAuditPlan: data.aiAuditPlan,
        aiClauseAnalysis: data.aiClauseAnalysis,
        aiRiskAssessment: data.aiRiskAssessment,
        aiRecommendations: data.aiRecommendations,
        aiGenerated: data.aiGenerated ?? false,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } });
  }
});

// PUT /:id - Update audit
router.put('/:id', checkOwnership(prisma.envAudit), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAudit.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    const schema = z.object({
      title: z.string().min(1).optional(),
      type: z.enum(['SYSTEM', 'COMPLIANCE', 'SITE', 'SUPPLIER', 'MANAGEMENT_REVIEW']).optional(),
      scope: z.string().min(1).optional(),
      auditDate: z.string().optional(),
      leadAuditor: z.string().optional(),
      iso14001Clauses: z.array(z.string()).optional(),
      department: z.string().optional(),
      auditTeam: z.array(z.string()).optional(),
      objective: z.string().optional(),
      criteria: z.string().optional(),
      methodology: z.string().optional(),
      status: z.string().optional(),
      openingMeetingDate: z.string().optional(),
      closingMeetingDate: z.string().optional(),
      reportDueDate: z.string().optional(),
      summary: z.string().optional(),
      conclusions: z.string().optional(),
      recommendations: z.string().optional(),
      aiAuditPlan: z.string().optional(),
      aiClauseAnalysis: z.string().optional(),
      aiRiskAssessment: z.string().optional(),
      aiRecommendations: z.string().optional(),
      aiGenerated: z.boolean().optional(),
    }).strict();

    const data = schema.parse(req.body);

    // Convert date strings to Date objects
    const updateData: any = { ...data };
    if (data.auditDate) updateData.auditDate = new Date(data.auditDate);
    if (data.openingMeetingDate) updateData.openingMeetingDate = new Date(data.openingMeetingDate);
    if (data.closingMeetingDate) updateData.closingMeetingDate = new Date(data.closingMeetingDate);
    if (data.reportDueDate) updateData.reportDueDate = new Date(data.reportDueDate);

    const audit = await prisma.envAudit.update({
      where: { id: req.params.id },
      data: updateData,
      include: { findings: true },
    });

    res.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' } });
  }
});

// DELETE /:id - Soft delete
router.delete('/:id', checkOwnership(prisma.envAudit), async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAudit.findUnique({ where: { id: req.params.id } });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    await prisma.envAudit.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date() },
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Delete audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' } });
  }
});

// POST /:id/findings - Add finding to audit
router.post('/:id/findings', async (req: AuthRequest, res: Response) => {
  try {
    const audit = await prisma.envAudit.findUnique({ where: { id: req.params.id } });
    if (!audit) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    const schema = z.object({
      clause: z.string().min(1),
      type: z.enum(['CONFORMITY', 'MINOR_NC', 'MAJOR_NC', 'OBSERVATION', 'OFI']),
      description: z.string().min(1),
      evidence: z.string().optional(),
      requirement: z.string().optional(),
      correctiveAction: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      status: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const finding = await prisma.envAuditFinding.create({
      data: {
        auditId: req.params.id,
        clause: data.clause,
        type: data.type as any,
        description: data.description,
        evidence: data.evidence,
        requirement: data.requirement,
        correctiveAction: data.correctiveAction,
        assignedTo: data.assignedTo,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: (data.status as any) || 'OPEN',
      },
    });

    res.status(201).json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create audit finding error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit finding' } });
  }
});

// PUT /:id/findings/:fid - Update finding
router.put('/:id/findings/:fid', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAuditFinding.findFirst({
      where: { id: req.params.fid, auditId: req.params.id },
    });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit finding not found' } });

    const schema = z.object({
      clause: z.string().optional(),
      type: z.enum(['CONFORMITY', 'MINOR_NC', 'MAJOR_NC', 'OBSERVATION', 'OFI']).optional(),
      description: z.string().optional(),
      evidence: z.string().optional(),
      requirement: z.string().optional(),
      correctiveAction: z.string().optional(),
      assignedTo: z.string().optional(),
      dueDate: z.string().optional(),
      status: z.string().optional(),
      closedDate: z.string().optional(),
    }).strict();

    const data = schema.parse(req.body);

    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.closedDate) updateData.closedDate = new Date(data.closedDate);

    // Auto-set closedDate when status changes to CLOSED
    if (data.status === 'CLOSED' && existing.status !== 'CLOSED' && !data.closedDate) {
      updateData.closedDate = new Date();
    }

    const finding = await prisma.envAuditFinding.update({
      where: { id: req.params.fid },
      data: updateData,
    });

    res.json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Update audit finding error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit finding' } });
  }
});

// GET /:id/checklist - Get clause checklist progress
router.get('/:id/checklist', async (req: AuthRequest, res: Response) => {
  try {
    const audit = await prisma.envAudit.findUnique({
      where: { id: req.params.id },
      include: { findings: true },
    });
    if (!audit) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    const checklist = audit.iso14001Clauses.map((clause: string) => {
      const clauseFindings = audit.findings.filter((f: any) => f.clause === clause);
      const hasNonConformity = clauseFindings.some((f: any) => f.type === 'MINOR_NC' || f.type === 'MAJOR_NC');
      const hasConformity = clauseFindings.some((f: any) => f.type === 'CONFORMITY');
      const openFindings = clauseFindings.filter((f: any) => f.status === 'OPEN').length;

      let status: string;
      if (clauseFindings.length === 0) {
        status = 'NOT_ASSESSED';
      } else if (hasNonConformity) {
        status = 'NON_CONFORMANT';
      } else if (hasConformity) {
        status = 'CONFORMANT';
      } else {
        status = 'IN_PROGRESS';
      }

      return {
        clause,
        status,
        findingsCount: clauseFindings.length,
        openFindings,
        findings: clauseFindings,
      };
    });

    res.json({ success: true, data: { auditId: audit.id, checklist } });
  } catch (error) {
    logger.error('Get audit checklist error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit checklist' } });
  }
});

// POST /:id/complete - Mark audit complete
router.post('/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.envAudit.findUnique({
      where: { id: req.params.id },
      include: { findings: true },
    });
    if (!existing) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });

    const schema = z.object({
      summary: z.string().min(1),
      conclusions: z.string().optional(),
      recommendations: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const audit = await prisma.envAudit.update({
      where: { id: req.params.id },
      data: {
        status: 'COMPLETED' as any,
        summary: data.summary,
        conclusions: data.conclusions ?? existing.conclusions,
        recommendations: data.recommendations ?? existing.recommendations,
        completedDate: new Date(),
      },
      include: { findings: true },
    });

    res.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Complete audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete audit' } });
  }
});

export default router;
