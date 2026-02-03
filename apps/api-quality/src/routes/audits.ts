import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';

const router: IRouter = Router();

router.use(authenticate);

// Generate audit number
function generateAuditNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `AUD-${year}${month}-${random}`;
}

// GET /api/audits - List audits
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, auditType, year } = req.query;

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (auditType) where.auditType = auditType;
    if (year) {
      const yearNum = parseInt(year as string, 10);
      where.plannedStartDate = {
        gte: new Date(`${yearNum}-01-01`),
        lt: new Date(`${yearNum + 1}-01-01`),
      };
    }

    const [audits, total] = await Promise.all([
      prisma.qMSAudit.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { plannedStartDate: 'desc' },
        include: {
          _count: { select: { findings: true, teamMembers: true, checklists: true } },
        },
      }),
      prisma.qMSAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    console.error('List audits error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list audits' } });
  }
});

// GET /api/audits/:id - Get single audit
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const audit = await prisma.qMSAudit.findUnique({
      where: { id: req.params.id },
      include: {
        teamMembers: true,
        checklists: true,
        findings: { orderBy: { createdAt: 'asc' } },
      },
    });

    if (!audit) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    res.json({ success: true, data: audit });
  } catch (error) {
    console.error('Get audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get audit' } });
  }
});

// POST /api/audits - Create audit
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      auditType: z.enum(['INTERNAL', 'EXTERNAL', 'SUPPLIER', 'CUSTOMER', 'CERTIFICATION', 'SURVEILLANCE', 'PROCESS', 'PRODUCT', 'SYSTEM']),
      auditScope: z.string().optional(),
      standard: z.enum(['ISO_45001', 'ISO_14001', 'ISO_9001']).optional(),
      clauses: z.array(z.string()).default([]),
      plannedStartDate: z.string(),
      plannedEndDate: z.string(),
      auditeeDepartment: z.string().optional(),
      auditeeLocation: z.string().optional(),
      auditeeContact: z.string().optional(),
      objectives: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const audit = await prisma.qMSAudit.create({
      data: {
        ...data,
        auditNumber: generateAuditNumber(),
        plannedStartDate: new Date(data.plannedStartDate),
        plannedEndDate: new Date(data.plannedEndDate),
        status: 'PLANNED',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create audit' } });
  }
});

// PATCH /api/audits/:id - Update audit
router.patch('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSAudit.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      auditScope: z.string().optional(),
      clauses: z.array(z.string()).optional(),
      plannedStartDate: z.string().optional(),
      plannedEndDate: z.string().optional(),
      actualStartDate: z.string().optional(),
      actualEndDate: z.string().optional(),
      status: z.enum(['PLANNED', 'PREPARATION', 'IN_PROGRESS', 'REPORTING', 'FINDINGS_REVIEW', 'COMPLETED', 'CANCELLED']).optional(),
      conclusion: z.string().optional(),
      overallRating: z.enum(['EXCELLENT', 'SATISFACTORY', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY', 'NOT_RATED']).optional(),
    });

    const data = schema.parse(req.body);

    const audit = await prisma.qMSAudit.update({
      where: { id: req.params.id },
      data: {
        ...data,
        plannedStartDate: data.plannedStartDate ? new Date(data.plannedStartDate) : undefined,
        plannedEndDate: data.plannedEndDate ? new Date(data.plannedEndDate) : undefined,
        actualStartDate: data.actualStartDate ? new Date(data.actualStartDate) : undefined,
        actualEndDate: data.actualEndDate ? new Date(data.actualEndDate) : undefined,
      },
    });

    res.json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update audit' } });
  }
});

// POST /api/audits/:id/team - Add team member
router.post('/:id/team', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      userId: z.string(),
      role: z.enum(['LEAD_AUDITOR', 'AUDITOR', 'AUDITOR_IN_TRAINING', 'TECHNICAL_EXPERT', 'OBSERVER', 'TRANSLATOR']),
      isQualified: z.boolean().default(true),
      qualificationNotes: z.string().optional(),
      assignedClauses: z.array(z.string()).default([]),
      assignedAreas: z.array(z.string()).default([]),
    });

    const data = schema.parse(req.body);

    const member = await prisma.auditTeamMember.create({
      data: {
        ...data,
        auditId: req.params.id,
      },
    });

    res.status(201).json({ success: true, data: member });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Add team member error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to add team member' } });
  }
});

// GET /api/audits/:id/checklists - Get checklists
router.get('/:id/checklists', async (req: AuthRequest, res: Response) => {
  try {
    const checklists = await prisma.auditChecklist.findMany({
      where: { auditId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: checklists });
  } catch (error) {
    console.error('Get checklists error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get checklists' } });
  }
});

// POST /api/audits/:id/checklists - Create checklist
router.post('/:id/checklists', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      clause: z.string().optional(),
      area: z.string().optional(),
      items: z.any(), // Array of checklist items
    });

    const data = schema.parse(req.body);
    const items = Array.isArray(data.items) ? data.items : [];

    const checklist = await prisma.auditChecklist.create({
      data: {
        ...data,
        auditId: req.params.id,
        totalItems: items.length,
        status: 'NOT_STARTED',
      },
    });

    res.status(201).json({ success: true, data: checklist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create checklist error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create checklist' } });
  }
});

// PATCH /api/audits/:id/checklists/:checklistId - Update checklist
router.patch('/:id/checklists/:checklistId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      items: z.any().optional(),
      compliantItems: z.number().optional(),
      nonCompliantItems: z.number().optional(),
      notApplicable: z.number().optional(),
      status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD']).optional(),
    });

    const data = schema.parse(req.body);

    // Calculate compliance percent if we have the numbers
    let compliancePercent: number | undefined;
    if (data.compliantItems !== undefined && data.nonCompliantItems !== undefined && data.notApplicable !== undefined) {
      const total = data.compliantItems + data.nonCompliantItems;
      compliancePercent = total > 0 ? (data.compliantItems / total) * 100 : 0;
    }

    const checklist = await prisma.auditChecklist.update({
      where: { id: req.params.checklistId },
      data: {
        ...data,
        compliancePercent,
        completedById: data.status === 'COMPLETED' ? req.user!.id : undefined,
        completedAt: data.status === 'COMPLETED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: checklist });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update checklist error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update checklist' } });
  }
});

// GET /api/audits/:id/findings - Get findings
router.get('/:id/findings', async (req: AuthRequest, res: Response) => {
  try {
    const findings = await prisma.auditFinding.findMany({
      where: { auditId: req.params.id },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: findings });
  } catch (error) {
    console.error('Get findings error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get findings' } });
  }
});

// POST /api/audits/:id/findings - Create finding
router.post('/:id/findings', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().min(1),
      findingType: z.enum(['MAJOR_NC', 'MINOR_NC', 'OBSERVATION', 'OFI', 'POSITIVE']),
      clause: z.string().optional(),
      area: z.string().optional(),
      process: z.string().optional(),
      objectiveEvidence: z.string().optional(),
      criteria: z.string().optional(),
      riskLevel: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    });

    const data = schema.parse(req.body);

    // Get count for finding number
    const count = await prisma.auditFinding.count({ where: { auditId: req.params.id } });
    const findingNumber = `F${(count + 1).toString().padStart(3, '0')}`;

    const finding = await prisma.auditFinding.create({
      data: {
        ...data,
        auditId: req.params.id,
        findingNumber,
        status: 'OPEN',
        createdById: req.user!.id,
      },
    });

    // Update audit statistics
    await updateAuditStats(req.params.id);

    res.status(201).json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create finding error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create finding' } });
  }
});

// PATCH /api/audits/:id/findings/:findingId - Update finding
router.patch('/:id/findings/:findingId', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      objectiveEvidence: z.string().optional(),
      criteria: z.string().optional(),
      auditeeResponse: z.string().optional(),
      status: z.enum(['OPEN', 'RESPONSE_PENDING', 'RESPONSE_RECEIVED', 'VERIFICATION_PENDING', 'VERIFIED_CLOSED', 'CLOSED']).optional(),
      capaId: z.string().optional(),
      closureNotes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const finding = await prisma.auditFinding.update({
      where: { id: req.params.findingId },
      data: {
        ...data,
        responseDate: data.auditeeResponse ? new Date() : undefined,
        closedById: data.status === 'CLOSED' || data.status === 'VERIFIED_CLOSED' ? req.user!.id : undefined,
        closedAt: data.status === 'CLOSED' || data.status === 'VERIFIED_CLOSED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: finding });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Update finding error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update finding' } });
  }
});

// Helper to update audit stats
async function updateAuditStats(auditId: string): Promise<void> {
  const findings = await prisma.auditFinding.findMany({ where: { auditId } });

  const stats = {
    totalFindings: findings.length,
    majorNCs: findings.filter(f => f.findingType === 'MAJOR_NC').length,
    minorNCs: findings.filter(f => f.findingType === 'MINOR_NC').length,
    observations: findings.filter(f => f.findingType === 'OBSERVATION').length,
    ofis: findings.filter(f => f.findingType === 'OFI').length,
  };

  await prisma.qMSAudit.update({
    where: { id: auditId },
    data: stats,
  });
}

// GET /api/audit-schedules - Get audit schedules
router.get('/schedules', async (req: AuthRequest, res: Response) => {
  try {
    const { year } = req.query;

    const where: any = {};
    if (year) where.year = parseInt(year as string, 10);

    const schedules = await prisma.auditSchedule.findMany({
      where,
      orderBy: { year: 'desc' },
      include: {
        audits: { select: { id: true, auditNumber: true, status: true } },
      },
    });

    res.json({ success: true, data: schedules });
  } catch (error) {
    console.error('Get schedules error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to get schedules' } });
  }
});

// POST /api/audit-schedules - Create audit schedule
router.post('/schedules', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().min(1),
      description: z.string().optional(),
      year: z.number(),
      plannedAudits: z.any(), // Array of planned audits
      riskCriteria: z.any().optional(),
    });

    const data = schema.parse(req.body);
    const plannedAudits = Array.isArray(data.plannedAudits) ? data.plannedAudits : [];

    const schedule = await prisma.auditSchedule.create({
      data: {
        ...data,
        totalPlanned: plannedAudits.length,
        status: 'DRAFT',
        createdById: req.user!.id,
      },
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: error.errors } });
    }
    console.error('Create schedule error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create schedule' } });
  }
});

// DELETE /api/audits/:id - Delete audit
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const existing = await prisma.qMSAudit.findUnique({ where: { id: req.params.id } });
    if (!existing) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Audit not found' } });
    }

    await prisma.qMSAudit.delete({ where: { id: req.params.id } });

    res.json({ success: true, data: { message: 'Audit deleted successfully' } });
  } catch (error) {
    console.error('Delete audit error:', error);
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete audit' } });
  }
});

export default router;
