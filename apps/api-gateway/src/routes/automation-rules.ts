import { Router, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  listRules,
  enableRule,
  disableRule,
  getRuleById,
  getExecutionLog,
} from '@ims/automation-rules';

const logger = createLogger('api-gateway:automation-rules');
const router = Router();

// All routes require authentication
router.use(authenticate);

// GET /api/admin/automation-rules — List all rules with enabled status
router.get('/', (req: AuthRequest, res: Response) => {
  try {
    const orgId = (req.user as any)?.orgId || 'default';
    const rules = listRules(orgId);

    logger.info('Listed automation rules', { orgId, count: rules.length });

    return res.json({
      success: true,
      data: rules,
    });
  } catch (error) {
    logger.error('Failed to list automation rules', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list automation rules' },
    });
  }
});

// POST /api/admin/automation-rules/:id/enable — Enable a rule
router.post('/:id/enable', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = (req.user as any)?.orgId || 'default';

    const rule = getRuleById(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Automation rule not found' },
      });
    }

    enableRule(orgId, id);
    logger.info('Enabled automation rule', { orgId, ruleId: id, ruleName: rule.name });

    return res.json({
      success: true,
      data: { id, enabled: true, name: rule.name },
    });
  } catch (error) {
    logger.error('Failed to enable automation rule', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to enable rule' },
    });
  }
});

// POST /api/admin/automation-rules/:id/disable — Disable a rule
router.post('/:id/disable', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = (req.user as any)?.orgId || 'default';

    const rule = getRuleById(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Automation rule not found' },
      });
    }

    disableRule(orgId, id);
    logger.info('Disabled automation rule', { orgId, ruleId: id, ruleName: rule.name });

    return res.json({
      success: true,
      data: { id, enabled: false, name: rule.name },
    });
  } catch (error) {
    logger.error('Failed to disable automation rule', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to disable rule' },
    });
  }
});

// GET /api/admin/automation-rules/:id/log — Get execution log
router.get('/:id/log', (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = (req.user as any)?.orgId || 'default';
    const limit = parseInt(req.query.limit as string, 10) || 50;

    const rule = getRuleById(id);
    if (!rule) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Automation rule not found' },
      });
    }

    const log = getExecutionLog(orgId, id, limit);

    return res.json({
      success: true,
      data: log,
    });
  } catch (error) {
    logger.error('Failed to get execution log', { error });
    return res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get execution log' },
    });
  }
});

export default router;
