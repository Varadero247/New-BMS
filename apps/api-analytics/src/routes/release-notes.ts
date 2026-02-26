// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate } from '@ims/auth';
import { createLogger } from '@ims/monitoring';

const logger = createLogger('release-notes');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// GET / — list changelogs with pagination, newest first
// ---------------------------------------------------------------------------
router.get('/', async (req: Request, res: Response) => {
  try {
    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string, 10) || 20));
    const skip = (page - 1) * limit;

    const [changelogs, total] = await Promise.all([
      prisma.changelog.findMany({
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.changelog.count(),
    ]);

    res.json({
      success: true,
      data: {
        changelogs,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (err) {
    logger.error('Failed to list changelogs', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list changelogs' },
    });
  }
});

// ---------------------------------------------------------------------------
// GET /:id — get single changelog
// ---------------------------------------------------------------------------
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const changelog = await prisma.changelog.findUnique({ where: { id } });
    if (!changelog) {
      return res
        .status(404)
        .json({ success: false, error: { code: 'NOT_FOUND', message: 'Changelog not found' } });
    }
    res.json({ success: true, data: { changelog } });
  } catch (err) {
    logger.error('Failed to get changelog', { error: String(err) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get changelog' },
    });
  }
});

export default router;
