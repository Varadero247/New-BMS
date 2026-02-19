import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { runMonthlySnapshot } from '../jobs/monthly-snapshot.job';
import { PLAN_TARGETS } from '../data/plan-targets';

const logger = createLogger('monthly-review');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — List all snapshots (paginated, newest first)
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [snapshots, total] = await Promise.all([
      prisma.monthlySnapshot.findMany({
        orderBy: { monthNumber: 'desc' },
        skip,
        take: limit,
      }),
      prisma.monthlySnapshot.count(),
    ]);

    res.json({
      success: true,
      data: {
        snapshots,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list snapshots', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list snapshots' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:snapshotId — Get full snapshot with plan target data
// ---------------------------------------------------------------------------
router.get('/:snapshotId', async (req: Request, res: Response) => {
  try {
    const { snapshotId } = req.params;

    const snapshot = await prisma.monthlySnapshot.findUnique({ where: { id: snapshotId } });
    if (!snapshot) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Snapshot not found' } });
    }

    const planTarget = await prisma.planTarget.findUnique({ where: { month: snapshot.month } });

    res.json({ success: true, data: { snapshot, planTarget } });
  } catch (err) {
    logger.error('Failed to get snapshot', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get snapshot' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /:snapshotId/approve — Approve targets
// ---------------------------------------------------------------------------
const approveSchema = z.object({
  action: z.enum(['approve', 'override', 'keep-original']),
  overrides: z
    .object({
      revisedMrr: z.number().optional(),
      revisedCustomers: z.number().int().optional(),
    })
    .optional(),
});

router.post('/:snapshotId/approve', async (req: Request, res: Response) => {
  try {
    const { snapshotId } = req.params;
    const parsed = approveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const snapshot = await prisma.monthlySnapshot.findUnique({ where: { id: snapshotId } });
    if (!snapshot) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Snapshot not found' } });
    }

    // Idempotency: if already approved, return success
    if (snapshot.targetsApproved) {
      return res.json({ success: true, data: { snapshot, message: 'Already approved' } });
    }

    const user = (req as AuthRequest).user;
    const { action, overrides } = parsed.data;

    // Mark snapshot as approved
    const updatedSnapshot = await prisma.monthlySnapshot.update({
      where: { id: snapshotId },
      data: {
        targetsApproved: true,
        approvedAt: new Date(),
        approvedBy: user?.id || 'system',
      },
    });

    if (action === 'approve') {
      // Apply AI-recommended targets to next 3 months
      const recommendations = (snapshot.aiRecommendations as Array<Record<string, unknown>>) || [];
      const mrrRecs = recommendations.filter((r: Record<string, unknown>) => r.metric === 'MRR');

      const nextTargets = await prisma.planTarget.findMany({
        where: { monthNumber: { gt: snapshot.monthNumber, lte: snapshot.monthNumber + 3 } },
        orderBy: { monthNumber: 'asc' },
        take: 1000,
      });

      for (let i = 0; i < nextTargets.length; i++) {
        const rec = mrrRecs[i];
        if (rec) {
          await prisma.planTarget.update({
            where: { id: nextTargets[i].id },
            data: { revisedMrr: rec.suggested, revisedAt: new Date() },
          });
        }
      }
    } else if (action === 'override' && overrides) {
      // Apply custom overrides to next month only
      const nextTarget = await prisma.planTarget.findFirst({
        where: { monthNumber: snapshot.monthNumber + 1 },
      });
      if (nextTarget) {
        await prisma.planTarget.update({
          where: { id: nextTarget.id },
          data: {
            revisedMrr: overrides.revisedMrr ?? undefined,
            revisedCustomers: overrides.revisedCustomers ?? undefined,
            revisedAt: new Date(),
          },
        });
      }
    }
    // 'keep-original' — no target changes, just mark as approved

    res.json({ success: true, data: { snapshot: updatedSnapshot } });
  } catch (err) {
    logger.error('Failed to approve snapshot', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to approve snapshot' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /trigger — Manually trigger monthly snapshot
// ---------------------------------------------------------------------------
router.post('/trigger', async (_req: Request, res: Response) => {
  try {
    const snapshotId = await runMonthlySnapshot();
    res.json({
      success: true,
      data: { snapshotId, message: 'Monthly snapshot triggered successfully' },
    });
  } catch (err) {
    logger.error('Failed to trigger snapshot', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger snapshot' },
    });
  }
});

// ---------------------------------------------------------------------------
// POST /seed-targets — Seed PlanTarget table with 36 months
// ---------------------------------------------------------------------------
router.post('/seed-targets', async (_req: Request, res: Response) => {
  try {
    const existingMonths = new Set(
      (await prisma.planTarget.findMany({ select: { month: true }, take: 1000 })).map(
        (t) => t.month
      )
    );
    const toCreate = PLAN_TARGETS.filter((t) => !existingMonths.has(t.month));
    const skipped = PLAN_TARGETS.length - toCreate.length;

    if (toCreate.length > 0) {
      await prisma.planTarget.createMany({
        data: toCreate.map((target) => ({
          month: target.month,
          monthNumber: target.monthNumber,
          plannedMrr: target.plannedMrr,
          plannedArr: target.plannedMrr * 12,
          plannedCustomers: target.plannedCustomers,
          plannedNewCustomers: target.plannedNewCustomers,
          plannedChurnPct: target.plannedChurnPct,
          plannedArpu: target.plannedArpu,
          founderDirLoan: target.founderDirLoan,
          founderStarterLoan: target.founderStarterLoan,
        })),
        skipDuplicates: true,
      });
    }
    const created = toCreate.length;

    res.json({
      success: true,
      data: { created, skipped, total: PLAN_TARGETS.length },
    });
  } catch (err) {
    logger.error('Failed to seed targets', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to seed targets' },
    });
  }
});

export default router;
