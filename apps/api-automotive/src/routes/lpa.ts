import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma, Prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-automotive');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// ============================================
// LPA (Layered Process Audits)
// ============================================

// Helper: generate LPA audit reference number LPA-YYMM-XXXX
async function generateRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `LPA-${yy}${mm}`;

  const count = await prisma.lpaAudit.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// Helper: generate CAPA reference number CAPA-LPA-YYMM-XXXX
async function generateCapaRef(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `CAPA-LPA-${yy}${mm}`;

  // Count existing CAPA refs with this prefix across all responses
  const count = await prisma.lpaResponse.count({
    where: { capaRef: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

// POST /schedules - Create LPA schedule with questions
router.post('/schedules', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      processArea: z.string().min(1),
      layer: z.number().int().min(1).max(4),
      frequency: z.enum(['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY']),
      questions: z.array(z.object({
        questionText: z.string().min(1),
        category: z.string().optional(),
      })).min(1),
    });

    const data = schema.parse(req.body);

    const schedule = await prisma.$transaction(async (tx) => {
      const newSchedule = await tx.lpaSchedule.create({
        data: {
          processArea: data.processArea,
          layer: data.layer,
          frequency: data.frequency,
          createdBy: req.user?.id,
        },
      });

      // Create questions with sort order
      for (let i = 0; i < data.questions.length; i++) {
        await tx.lpaQuestion.create({
          data: {
            scheduleId: newSchedule.id,
            questionText: data.questions[i].questionText,
            category: data.questions[i].category,
            sortOrder: i + 1,
          },
        });
      }

      return tx.lpaSchedule.findUnique({
        where: { id: newSchedule.id },
        include: {
          questions: { orderBy: { sortOrder: 'asc' } },
        },
      });
    });

    res.status(201).json({ success: true, data: schedule });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create LPA schedule error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create LPA schedule' } });
  }
});

// GET /schedules - List LPA schedules
router.get('/schedules', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', layer, frequency, active } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (layer) { const n = parseInt(layer as string, 10); if (!isNaN(n)) where.layer = n; }
    if (frequency) where.frequency = frequency as any;
    if (active !== undefined) where.active = active === 'true';

    const [schedules, total] = await Promise.all([
      prisma.lpaSchedule.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          questions: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
          _count: { select: { audits: true } },
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.lpaSchedule.count({ where }),
    ]);

    res.json({
      success: true,
      data: schedules,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List LPA schedules error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list LPA schedules' } });
  }
});

// POST /audits - Create/start LPA audit from schedule
router.post('/audits', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      scheduleId: z.string().min(1),
      auditor: z.string().min(1),
    });

    const data = schema.parse(req.body);

    // Verify schedule exists and is active
    const schedule = await prisma.lpaSchedule.findUnique({
      where: { id: data.scheduleId },
      include: {
        questions: { where: { active: true }, orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'LPA schedule not found' } });
    }

    if (!schedule.active) {
      return res.status(400).json({ success: false, error: { code: 'SCHEDULE_INACTIVE', message: 'LPA schedule is inactive' } });
    }

    if (schedule.questions.length === 0) {
      return res.status(400).json({ success: false, error: { code: 'NO_QUESTIONS', message: 'LPA schedule has no active questions' } });
    }

    const refNumber = await generateRefNumber();

    const audit = await prisma.lpaAudit.create({
      data: {
        refNumber,
        scheduleId: data.scheduleId,
        auditor: data.auditor,
        layer: schedule.layer,
        processArea: schedule.processArea,
        status: 'IN_PROGRESS',
        totalQuestions: schedule.questions.length,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: audit });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Create LPA audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create LPA audit' } });
  }
});

// GET /audits - List LPA audits with pagination/filters
router.get('/audits', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, layer, processArea, auditor } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status as any;
    if (layer) { const n = parseInt(layer as string, 10); if (!isNaN(n)) where.layer = n; }
    if (processArea) where.processArea = { contains: processArea as string, mode: 'insensitive' };
    if (auditor) where.auditor = { contains: auditor as string, mode: 'insensitive' };

    const [audits, total] = await Promise.all([
      prisma.lpaAudit.findMany({
        where,
        skip,
        take: limitNum,
        include: {
          responses: true,
        },
        orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
      }),
      prisma.lpaAudit.count({ where }),
    ]);

    res.json({
      success: true,
      data: audits,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List LPA audits error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to list LPA audits' } });
  }
});

// POST /audits/:id/respond - Submit question responses
router.post('/audits/:id/respond', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    // Verify audit exists and is in progress
    const audit = await prisma.lpaAudit.findUnique({ where: { id } });
    if (!audit) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'LPA audit not found' } });
    }

    if (audit.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'AUDIT_NOT_IN_PROGRESS', message: 'LPA audit is not in progress' } });
    }

    const schema = z.object({
      responses: z.array(z.object({
        questionId: z.string().min(1),
        result: z.enum(['PASS', 'FAIL', 'NOT_APPLICABLE']),
        notes: z.string().optional(),
      })).min(1),
    });

    const data = schema.parse(req.body);

    // Verify all questions belong to the schedule
    const schedule = await prisma.lpaSchedule.findUnique({
      where: { id: audit.scheduleId },
      include: { questions: true },
    });

    if (!schedule) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Associated schedule not found' } });
    }

    const validQuestionIds = new Set(schedule.questions.map(q => q.id));
    for (const resp of data.responses) {
      if (!validQuestionIds.has(resp.questionId)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_QUESTION', message: `Question ${resp.questionId} does not belong to this schedule` } });
      }
    }

    // Create responses in a transaction, auto-create CAPA ref on FAIL
    const responses = await prisma.$transaction(async (tx) => {
      const created = [];

      for (const resp of data.responses) {
        const question = schedule.questions.find(q => q.id === resp.questionId);

        let capaRef: string | undefined;
        if (resp.result === 'FAIL') {
          capaRef = await generateCapaRef();
        }

        const response = await tx.lpaResponse.create({
          data: {
            auditId: id,
            questionId: resp.questionId,
            questionText: question?.questionText || '',
            result: resp.result,
            notes: resp.notes,
            capaRef,
          },
        });

        created.push(response);
      }

      // Update audit counts
      const allResponses = await tx.lpaResponse.findMany({
        where: { auditId: id },
        take: 1000});

      const passCount = allResponses.filter(r => r.result === 'PASS').length;
      const failCount = allResponses.filter(r => r.result === 'FAIL').length;
      const naCount = allResponses.filter(r => r.result === 'NOT_APPLICABLE').length;

      await tx.lpaAudit.update({
        where: { id },
        data: { passCount, failCount, naCount },
      });

      return created;
    });

    res.status(201).json({ success: true, data: responses });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Submit LPA responses error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to submit LPA responses' } });
  }
});

// POST /audits/:id/complete - Complete LPA, calculate score
router.post('/audits/:id/complete', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const audit = await prisma.lpaAudit.findUnique({
      where: { id },
      include: { responses: true },
    });

    if (!audit) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'LPA audit not found' } });
    }

    if (audit.status !== 'IN_PROGRESS') {
      return res.status(400).json({ success: false, error: { code: 'AUDIT_NOT_IN_PROGRESS', message: 'LPA audit is not in progress' } });
    }

    // Calculate score: passCount / (totalQuestions - naCount) * 100
    const passCount = audit.responses.filter(r => r.result === 'PASS').length;
    const failCount = audit.responses.filter(r => r.result === 'FAIL').length;
    const naCount = audit.responses.filter(r => r.result === 'NOT_APPLICABLE').length;
    const applicableQuestions = audit.totalQuestions - naCount;
    const score = applicableQuestions > 0 ? Math.round((passCount / applicableQuestions) * 10000) / 100 : 0;

    const notesSchema = z.object({
      notes: z.string().optional(),
    });
    const body = notesSchema.parse(req.body || {});

    const updated = await prisma.lpaAudit.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        passCount,
        failCount,
        naCount,
        score,
        notes: body.notes || audit.notes,
        completedAt: new Date(),
      },
      include: { responses: true },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields: error.errors.map(e => e.path.join('.')) } });
    }
    logger.error('Complete LPA audit error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to complete LPA audit' } });
  }
});

// GET /dashboard - LPA performance dashboard
router.get('/dashboard', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    // Total audits and completed count
    const [totalAudits, completedAudits] = await Promise.all([
      prisma.lpaAudit.count(),
      prisma.lpaAudit.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Average score by layer (bounded to prevent memory issues)
    const completedByLayer = await prisma.lpaAudit.findMany({
      where: { status: 'COMPLETED', score: { not: null } },
      select: { layer: true, score: true },
      take: 10000,
      orderBy: { createdAt: 'desc' },
    });

    const layerMap: Record<number, { total: number; count: number }> = {};
    for (const audit of completedByLayer) {
      if (!layerMap[audit.layer]) {
        layerMap[audit.layer] = { total: 0, count: 0 };
      }
      layerMap[audit.layer].total += audit.score || 0;
      layerMap[audit.layer].count += 1;
    }

    const avgScoreByLayer = Object.entries(layerMap)
      .map(([layer, stats]) => ({
        layer: parseInt(layer, 10),
        avgScore: Math.round((stats.total / stats.count) * 100) / 100,
        auditCount: stats.count,
      }))
      .sort((a, b) => a.layer - b.layer);

    // Fail rate by process area (bounded to prevent memory issues)
    const completedByArea = await prisma.lpaAudit.findMany({
      where: { status: 'COMPLETED' },
      select: { processArea: true, passCount: true, failCount: true, naCount: true, totalQuestions: true },
      take: 10000,
      orderBy: { createdAt: 'desc' },
    });

    const areaMap: Record<string, { totalApplicable: number; totalFails: number; auditCount: number }> = {};
    for (const audit of completedByArea) {
      if (!areaMap[audit.processArea]) {
        areaMap[audit.processArea] = { totalApplicable: 0, totalFails: 0, auditCount: 0 };
      }
      const applicable = audit.totalQuestions - audit.naCount;
      areaMap[audit.processArea].totalApplicable += applicable;
      areaMap[audit.processArea].totalFails += audit.failCount;
      areaMap[audit.processArea].auditCount += 1;
    }

    const failRateByProcessArea = Object.entries(areaMap)
      .map(([processArea, stats]) => ({
        processArea,
        failRate: stats.totalApplicable > 0
          ? Math.round((stats.totalFails / stats.totalApplicable) * 10000) / 100
          : 0,
        auditCount: stats.auditCount,
        totalFails: stats.totalFails,
      }))
      .sort((a, b) => b.failRate - a.failRate);

    res.json({
      success: true,
      data: {
        totalAudits,
        completedAudits,
        avgScoreByLayer,
        failRateByProcessArea,
      },
    });
  } catch (error) {
    logger.error('LPA dashboard error', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to load LPA dashboard' } });
  }
});

export default router;
