import { Router, Request, Response } from 'express';
import { authenticate } from '@ims/auth';
import { prisma } from '../prisma';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
const router = Router();
router.param('id', validateIdParam());
const logger = createLogger('incidents-timeline');
router.get('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const orgId = ((req as AuthRequest).user as { orgId?: string })?.orgId || 'default';
    const incident = await prisma.incIncident.findFirst({
      where: { id: req.params.id, orgId, deletedAt: null },
    });
    if (!incident)
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Incident not found' } });
    const timeline = [
      { date: incident.dateOccurred, event: 'Incident occurred' },
      { date: incident.reportedDate, event: 'Reported' },
    ];
    if (incident.investigationDate)
      timeline.push({ date: incident.investigationDate, event: 'Investigation completed' });
    if (incident.closedDate) timeline.push({ date: incident.closedDate, event: 'Closed' });
    res.json({ success: true, data: timeline });
  } catch (error: unknown) {
    logger.error('Operation failed', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed' } });
  }
});
export default router;
