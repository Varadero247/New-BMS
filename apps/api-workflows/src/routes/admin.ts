import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-workflows');

const router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

// GET /api/admin/automation-rules — list all automation rules (admin view, no org scope filter)
router.get('/', async (_req: Request, res: Response) => {
  try {
    const rules = await prisma.automationRule.findMany({
      where: { deletedAt: null },
      take: 500,
      orderBy: [{ priority: 'desc' }, { name: 'asc' }],
      include: { _count: { select: { executions: true } } },
    });
    res.json({ success: true, data: rules });
  } catch (error) {
    logger.error('Admin: error fetching automation rules', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch rules' } });
  }
});

// POST /api/admin/automation-rules/:id/enable|disable|execute|test
router.post('/:id/:action', async (req: Request, res: Response) => {
  const { id, action } = req.params;

  try {
    if (action === 'enable' || action === 'disable') {
      const rule = await prisma.automationRule.update({
        where: { id },
        data: { isActive: action === 'enable' },
      });
      return res.json({ success: true, data: rule });
    }

    if (action === 'execute' || action === 'test') {
      const rule = await prisma.automationRule.findUnique({ where: { id } });
      if (!rule) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rule not found' } });

      // Record a test execution
      const execution = await prisma.automationExecution.create({
        data: {
          ruleId: id,
          triggerType: rule.triggerType,
          status: 'COMPLETED',
          startedAt: new Date(),
          completedAt: new Date(),
          result: { message: `Rule ${action}d successfully`, mock: true },
        },
      });
      return res.json({ success: true, data: execution });
    }

    res.status(400).json({ success: false, error: { code: 'INVALID_ACTION', message: `Unknown action: ${action}` } });
  } catch (error) {
    logger.error('Admin: error performing rule action', { error: (error as Error).message, action, id });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to perform action' } });
  }
});

// GET /api/admin/automation-rules/:id/log — get execution log for a rule
router.get('/:id/log', async (req: Request, res: Response) => {
  try {
    const { limit = '10' } = req.query;
    const executions = await prisma.automationExecution.findMany({
      where: { ruleId: req.params.id },
      orderBy: { startedAt: 'desc' },
      take: parseInt(limit as string),
    });
    res.json({ success: true, data: executions });
  } catch (error) {
    logger.error('Admin: error fetching rule log', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch log' } });
  }
});

export default router;
