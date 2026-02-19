import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma';
import { createLogger } from '@ims/monitoring';

const githubPushSchema = z.object({
  ref: z.string().trim().optional(),
  commits: z
    .array(
      z.object({
        id: z.string().trim().optional(),
        sha: z.string().trim().optional(),
        message: z.string().trim().optional(),
        title: z.string().trim().optional(),
      })
    )
    .optional(),
  head_commit: z
    .object({
      message: z.string().trim().optional(),
    })
    .nullable()
    .optional(),
  repository: z
    .object({
      full_name: z.string().trim().optional(),
      name: z.string().trim().optional(),
    })
    .optional(),
});

const logger = createLogger('webhook-github');
const router: Router = Router();

// ---------------------------------------------------------------------------
// AI Summary (mock) — concatenate commit messages
// ---------------------------------------------------------------------------
function generateChangeSummary(commits: unknown[]): string {
  if (!commits || commits.length === 0) return 'No commit messages available.';
  return commits.map((c) => { const commit = c as Record<string, unknown>; return (commit.message || commit.title || '') as string; }).join('; ');
}

// ---------------------------------------------------------------------------
// POST / — GitHub push webhook
// ---------------------------------------------------------------------------
router.post('/', async (req: Request, res: Response) => {
  try {
    const parsed = githubPushSchema.safeParse(req.body || {});
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const { ref, commits, head_commit, repository } = parsed.data;

    // Only process pushes to main
    if (!ref || (!ref.endsWith('/main') && !ref.endsWith('/master'))) {
      logger.info('Ignoring non-main branch push', { ref });
      return res.json({ success: true, data: { skipped: true, reason: 'Not main branch' } });
    }

    const commitList = commits || [];
    if (commitList.length === 0) {
      logger.info('Ignoring push with no commits');
      return res.json({ success: true, data: { skipped: true, reason: 'No commits' } });
    }

    const now = new Date();
    const version = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(now.getDate()).padStart(2, '0')}`;
    const summary = generateChangeSummary(commitList);
    const firstCommitSha = commitList[0]?.id || commitList[0]?.sha || null;

    const changelog = await prisma.changelog.create({
      data: {
        version,
        title: head_commit?.message || `Release ${version}`,
        summary,
        commitSha: firstCommitSha,
        details: {
          commitCount: commitList.length,
          repository: repository?.full_name || repository?.name || 'unknown',
          shas: commitList.map((c: Record<string, unknown>) => c.id || c.sha || '').filter(Boolean),
        },
        publishedAt: now,
      },
    });

    logger.info('Changelog created from GitHub push', {
      changelogId: changelog.id,
      version,
      commitCount: commitList.length,
    });

    res.json({ success: true, data: { changelog } });
  } catch (err) {
    logger.error('Failed to process GitHub webhook', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to process webhook' },
    });
  }
});

export default router;
