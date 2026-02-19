import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import {
  createComment,
  getComments,
  updateComment,
  deleteComment,
  addReaction,
  removeReaction,
} from '@ims/comments';
import { z } from 'zod';

const logger = createLogger('api-gateway:comments');
const router = Router();
router.param('id', validateIdParam());

// ============================================
// Validation schemas
// ============================================

const createCommentSchema = z.object({
  recordType: z.string().trim().min(1).max(100),
  recordId: z.string().trim().min(1).max(100),
  parentId: z.string().trim().uuid().nullable().optional(),
  body: z.string().trim().min(1).max(5000),
});

const updateCommentSchema = z.object({
  body: z.string().trim().min(1).max(5000),
});

const reactionSchema = z.object({
  emoji: z.string().trim().min(1).max(10),
});

// ============================================
// POST /api/comments — create comment
// ============================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const parsed = createCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
          details: parsed.error.errors,
        },
      });
    }

    const { recordType, recordId, parentId, body } = parsed.data;

    const comment = await createComment({
      orgId: (user as any).organisationId || (user as any).orgId || 'default',
      recordType,
      recordId,
      parentId: parentId || null,
      authorId: user!.id,
      authorName: (user as any).name || user!.email || 'Unknown',
      authorAvatar: user!.avatar ?? undefined,
      body,
    });

    // Log mentions for notification processing
    if (comment.mentions.length > 0) {
      logger.info('Comment created with mentions', {
        commentId: comment.id,
        recordType,
        recordId,
        authorId: user!.id,
        mentions: comment.mentions,
      });
    }

    logger.info('Comment created', {
      commentId: comment.id,
      recordType,
      recordId,
      authorId: user!.id,
    });

    res.status(201).json({
      success: true,
      data: comment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to create comment', { error: message });

    if (message.includes('Parent comment not found') || message.includes('Cannot reply')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create comment' },
    });
  }
});

// ============================================
// GET /api/comments?recordType&recordId — list (threaded, paginated)
// ============================================
router.get('/', authenticate, async (req: Request, res: Response) => {
  try {
    const recordType = req.query.recordType as string;
    const recordId = req.query.recordId as string;

    if (!recordType || !recordId) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'recordType and recordId query parameters are required',
        },
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string, 10) || 20));

    const result = await getComments(recordType, recordId, { page, limit });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list comments', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list comments' },
    });
  }
});

// ============================================
// PUT /api/comments/:id — edit (author only, 15min window)
// ============================================
router.put('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const commentId = req.params.id;
    const parsed = updateCommentSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
          details: parsed.error.errors,
        },
      });
    }

    const comment = await updateComment(commentId, user!.id, parsed.data.body);

    logger.info('Comment updated', { commentId, authorId: user!.id });

    res.json({
      success: true,
      data: comment,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to update comment', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }
    if (
      message.includes('Only the author') ||
      message.includes('Edit window') ||
      message.includes('deleted')
    ) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update comment' },
    });
  }
});

// ============================================
// DELETE /api/comments/:id — soft delete (author or admin)
// ============================================
router.delete('/:id', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const commentId = req.params.id;
    const roles: string[] = (user as any).roles || [(user as any).role] || [];
    const isAdmin =
      roles.includes('SUPER_ADMIN') || roles.includes('ORG_ADMIN') || roles.includes('ADMIN');

    await deleteComment(commentId, user!.id, isAdmin);

    logger.info('Comment deleted', { commentId, userId: user!.id, isAdmin });

    res.json({
      success: true,
      data: { id: commentId, deleted: true },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to delete comment', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }
    if (message.includes('Only the author') || message.includes('already deleted')) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete comment' },
    });
  }
});

// ============================================
// POST /api/comments/:id/reactions — add reaction
// ============================================
router.post('/:id/reactions', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const commentId = req.params.id;
    const parsed = reactionSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0].message,
          details: parsed.error.errors,
        },
      });
    }

    const reaction = await addReaction(commentId, user!.id, parsed.data.emoji);

    res.status(201).json({
      success: true,
      data: reaction,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to add reaction', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to add reaction' },
    });
  }
});

// ============================================
// DELETE /api/comments/:id/reactions/:emoji — remove reaction
// ============================================
router.delete('/:id/reactions/:emoji', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const commentId = req.params.id;
    const emoji = decodeURIComponent(req.params.emoji);

    await removeReaction(commentId, user!.id, emoji);

    res.json({
      success: true,
      data: { commentId, emoji, removed: true },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    logger.error('Failed to remove reaction', { error: message });

    if (message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message },
      });
    }

    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to remove reaction' },
    });
  }
});

export default router;
