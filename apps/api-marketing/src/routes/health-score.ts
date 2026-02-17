import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { AutomationConfig } from '../config';

const logger = createLogger('api-marketing:health-score');
const router = Router();

export function calculateHealthScore(metrics: {
  loginsLast7Days: number;
  recordsCreated: number;
  modulesVisited: number;
  teamMembersInvited: number;
}): number {
  let score = 0;

  // Logins (0-30 pts)
  if (metrics.loginsLast7Days >= 5) score += 30;
  else if (metrics.loginsLast7Days >= 3) score += 20;
  else if (metrics.loginsLast7Days >= 1) score += 10;

  // Records created (0-20 pts)
  if (metrics.recordsCreated > 20) score += 20;
  else if (metrics.recordsCreated >= 6) score += 15;
  else if (metrics.recordsCreated >= 1) score += 10;

  // Modules visited (0-25 pts)
  if (metrics.modulesVisited >= 7) score += 25;
  else if (metrics.modulesVisited >= 4) score += 20;
  else if (metrics.modulesVisited >= 2) score += 10;
  else if (metrics.modulesVisited >= 1) score += 5;

  // Team members invited (0-25 pts)
  if (metrics.teamMembersInvited >= 2) score += 25;
  else if (metrics.teamMembersInvited >= 1) score += 10;

  return Math.min(100, score);
}

export function determineTrend(currentScore: number, previousScore: number | null): 'IMPROVING' | 'DECLINING' | 'STABLE' {
  if (previousScore === null) return 'STABLE';
  const diff = currentScore - previousScore;
  if (diff >= 10) return 'IMPROVING';
  if (diff <= -10) return 'DECLINING';
  return 'STABLE';
}

// GET /api/health-score/user/:userId
router.get('/user/:userId', authenticate, async (req: Request, res: Response) => {
  try {
    const latest = await prisma.mktHealthScore.findFirst({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' },
    });

    if (!latest) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'No health score found for user' },
      });
    }

    res.json({ success: true, data: latest });
  } catch (error) {
    logger.error('Failed to fetch user health score', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch health score' },
    });
  }
});

// GET /api/health-score/org/:orgId
router.get('/org/:orgId', authenticate, async (req: Request, res: Response) => {
  try {
    const scores = await prisma.mktHealthScore.findMany({
      where: { orgId: req.params.orgId },
      orderBy: { createdAt: 'desc' },
      distinct: ['userId'],
    });

    const total = scores.length;
    const avgScore = total > 0 ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / total) : 0;
    const healthy = scores.filter((s) => s.score >= 70).length;
    const atRisk = scores.filter((s) => s.score >= 40 && s.score < 70).length;
    const critical = scores.filter((s) => s.score < 40).length;

    res.json({
      success: true,
      data: {
        orgId: req.params.orgId,
        totalUsers: total,
        averageScore: avgScore,
        distribution: { healthy, atRisk, critical },
        scores,
      },
    });
  } catch (error) {
    logger.error('Failed to fetch org health scores', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch org health' },
    });
  }
});

// POST /api/health-score/recalculate
router.post('/recalculate', authenticate, async (req: Request, res: Response) => {
  try {
    // In production, this would query actual activity data.
    // For now, return acknowledgement that recalculation was triggered.
    res.json({
      success: true,
      data: { message: 'Health score recalculation triggered' },
    });
  } catch (error) {
    logger.error('Health score recalculation failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to trigger recalculation' },
    });
  }
});

export default router;
