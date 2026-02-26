// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  listEntries,
  listAllEntries,
  getUnreadCount,
  markAsRead,
  createEntry,
} from '@ims/changelog';
import { z } from 'zod';

const logger = createLogger('api-gateway:changelog');
const router = Router();

// ============================================
// Validation schemas
// ============================================

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

const createSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200),
  description: z.string().trim().min(1, 'Description is required').max(2000),
  category: z.enum(['new_feature', 'improvement', 'bug_fix', 'security']),
  modules: z.array(z.string().trim().min(1).max(200)).min(1, 'At least one module is required'),
  isPublished: z.boolean().optional().default(true),
});

// ============================================
// GET /api/changelog — list published entries (public, auth optional)
// ============================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const parsed = listSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { limit, offset } = parsed.data;
    const result = listEntries(limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list changelog entries', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list changelog entries' },
    });
  }
});

// ============================================
// GET /api/changelog/all — list all entries (admin)
// ============================================
router.get('/all', authenticate, async (req: Request, res: Response) => {
  try {
    const parsed = listSchema.safeParse(req.query);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid query parameters',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const { limit, offset } = parsed.data;
    const result = listAllEntries(limit, offset);

    res.json({
      success: true,
      data: result,
    });
  } catch (error: unknown) {
    logger.error('Failed to list all changelog entries', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list all changelog entries' },
    });
  }
});

// ============================================
// GET /api/changelog/unread-count — get unread count for current user
// ============================================
router.get('/unread-count', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    const count = getUnreadCount(user!.id);

    res.json({
      success: true,
      data: { unreadCount: count },
    });
  } catch (error: unknown) {
    logger.error('Failed to get unread count', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get unread count' },
    });
  }
});

// ============================================
// POST /api/changelog/mark-read — mark all entries as read
// ============================================
router.post('/mark-read', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;
    markAsRead(user!.id);

    res.json({
      success: true,
      data: { message: 'Changelog marked as read' },
    });
  } catch (error: unknown) {
    logger.error('Failed to mark as read', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to mark changelog as read' },
    });
  }
});

// ============================================
// POST /api/changelog — create a new entry (admin only)
// ============================================
router.post('/', authenticate, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user;

    // Admin check
    if ((user!.role as string) !== 'admin' && (user!.role as string) !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Only administrators can create changelog entries' },
      });
    }

    const parsed = createSchema.safeParse(req.body);

    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request body',
          details: parsed.error.flatten().fieldErrors,
        },
      });
    }

    const entry = createEntry(parsed.data);

    logger.info('Changelog entry created', {
      entryId: entry.id,
      title: entry.title,
      userId: user!.id,
    });

    res.status(201).json({
      success: true,
      data: entry,
    });
  } catch (error: unknown) {
    logger.error('Failed to create changelog entry', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create changelog entry' },
    });
  }
});

export default router;
