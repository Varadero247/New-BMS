import { Router, Request, Response } from 'express';
import { prisma } from '../../prisma';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('webhook-sentry');
const router: Router = Router();

// ---------------------------------------------------------------------------
// AI Summary (mock) — first 200 chars of the error message
// ---------------------------------------------------------------------------
function generateAiSummary(message: string): string {
  const trimmed = (message || '').trim();
  if (trimmed.length <= 200) return trimmed;
  return trimmed.substring(0, 200) + '...';
}

// ---------------------------------------------------------------------------
// POST / — Sentry webhook handler
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const { event, data } = req.body || {};

    const sentryEvent = data?.event || event || data || {};
    const sentryEventId = sentryEvent.event_id || sentryEvent.id || null;
    const title = sentryEvent.title || sentryEvent.message || 'Unknown error';
    const level = sentryEvent.level || 'error';
    const platform = sentryEvent.platform || 'unknown';
    const environment = sentryEvent.environment || sentryEvent.tags?.environment || 'production';
    const errorMessage = sentryEvent.message || sentryEvent.title || '';

    if (!sentryEventId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Missing event_id' } });
    }

    // Check for duplicate
    const existing = await prisma.bugReport.findUnique({ where: { sentryEventId } });
    if (existing) {
      logger.info('Duplicate Sentry event ignored', { sentryEventId });
      return res.json({ success: true, data: { bugReport: existing, duplicate: true } });
    }

    const aiSummary = generateAiSummary(errorMessage);
    const githubIssueUrl = `https://github.com/nexara/ims/issues/new?title=${encodeURIComponent(title)}`;

    const bugReport = await prisma.bugReport.create({
      data: {
        sentryEventId,
        title,
        level,
        platform,
        environment,
        aiSummary,
        githubIssueUrl,
      },
    });

    logger.info('Bug report created from Sentry', { bugReportId: bugReport.id, sentryEventId });

    res.json({ success: true, data: { bugReport } });
  } catch (err) {
    logger.error('Failed to process Sentry webhook', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook' } });
  }
});

export default router;
