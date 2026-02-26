// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '@ims/database';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { z } from 'zod';

const logger = createLogger('sessions-routes');
const router: IRouter = Router();
router.param('id', validateIdParam());

/**
 * GET /api/sessions
 * List all active sessions for the current user
 */
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const currentSessionId = (req as AuthRequest).sessionId;

    const sessions = await prisma.session.findMany({
      where: {
        userId,
        expiresAt: { gte: new Date() },
      },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        lastActivityAt: true,
        expiresAt: true,
      },
      orderBy: { lastActivityAt: 'desc' },
      take: 100,
    });

    const sessionsWithCurrent = sessions.map((session) => ({
      ...session,
      isCurrent: session.id === currentSessionId,
    }));

    res.json({
      success: true,
      data: sessionsWithCurrent,
    });
  } catch (error) {
    logger.error('Failed to list sessions', { error, userId: (req as AuthRequest).user?.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to retrieve sessions' },
    });
  }
});

/**
 * DELETE /api/sessions/:id
 * Revoke a specific session (logout from specific device)
 */
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const sessionId = req.params.id;
    const userId = (req as AuthRequest).user!.id;
    const currentSessionId = (req as AuthRequest).sessionId;

    // Validate session ID format
    const { id } = z.object({ id: z.string().trim().min(1).max(200) }).parse({ id: sessionId });

    // Check if trying to revoke current session
    if (id === currentSessionId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'CANNOT_REVOKE_CURRENT',
          message: 'Cannot revoke current session. Use logout instead.',
        },
      });
    }

    // Find and delete the session (only if it belongs to current user)
    const session = await prisma.session.findFirst({
      where: { id, userId },
    });

    if (!session) {
      return res.status(404).json({
        success: false,
        error: { code: 'SESSION_NOT_FOUND', message: 'Session not found' },
      });
    }

    await prisma.session.delete({ where: { id } });

    logger.info('Session revoked', { sessionId: id, userId, revokedBy: currentSessionId });

    res.status(204).send();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid session ID' },
      });
    }
    logger.error('Failed to revoke session', { error, userId: (req as AuthRequest).user?.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke session' },
    });
  }
});

/**
 * DELETE /api/sessions
 * Revoke all sessions except the current one (logout from all other devices)
 */
router.delete('/', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as AuthRequest).user!.id;
    const currentSessionId = (req as AuthRequest).sessionId;

    const result = await prisma.session.deleteMany({
      where: {
        userId,
        id: { not: currentSessionId },
      },
    });

    logger.info('All other sessions revoked', {
      userId,
      currentSessionId,
      revokedCount: result.count,
    });

    res.status(204).send();
  } catch (error) {
    logger.error('Failed to revoke all sessions', { error, userId: (req as AuthRequest).user?.id });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to revoke sessions' },
    });
  }
});

export default router;
