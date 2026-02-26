// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';

const logger = createLogger('api-marketing:winback');
const router = Router();

const VALID_REASONS = ['price', 'features', 'time', 'competitor', 'business'];

const startWinbackSchema = z.object({
  email: z.string().trim().email().optional(),
});

// POST /api/winback/start/:orgId
router.post('/start/:orgId', async (req: Request, res: Response) => {
  try {
    const parsed = startWinbackSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: parsed.error.errors[0]?.message || 'Invalid input',
        },
      });
    }

    const { orgId } = req.params;

    // Check if already exists
    const existing = await prisma.mktWinBackSequence.findUnique({
      where: { orgId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Win-back sequence already exists for this org' },
      });
    }

    const sequence = await prisma.mktWinBackSequence.create({
      data: {
        orgId,
        cancelledAt: new Date(),
      },
    });

    // Schedule Day 3 email
    await prisma.mktEmailJob.create({
      data: {
        email: parsed.data.email || '',
        template: 'winback_day3_reason',
        subject: "We'd love to understand — what made you cancel?",
        scheduledFor: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        sequenceId: `winback-${orgId}`,
      },
    });

    res.status(201).json({ success: true, data: sequence });
  } catch (error) {
    logger.error('Win-back start failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to start win-back' },
    });
  }
});

// GET /api/winback/reason/:reason (token-auth, public)
router.get('/reason/:reason', async (req: Request, res: Response) => {
  try {
    const { reason } = req.params;
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_TOKEN', message: 'Token is required' },
      });
    }

    if (!VALID_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_REASON', message: 'Invalid cancellation reason' },
      });
    }

    const sequence = await prisma.mktWinBackSequence.findUnique({
      where: { token },
    });

    if (!sequence) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Win-back sequence not found' },
      });
    }

    await prisma.mktWinBackSequence.update({
      where: { token },
      data: {
        cancellationReason: reason,
        day3Sent: true,
      },
    });

    // Schedule reason-specific Day 7 email
    await prisma.mktEmailJob.create({
      data: {
        email: '',
        template: `winback_day7_${reason}`,
        subject: getReasonSubject(reason),
        scheduledFor: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 days from now (Day 7 total)
        sequenceId: `winback-${sequence.orgId}`,
      },
    });

    res.json({
      success: true,
      data: { message: "Thank you for your feedback. We'll be in touch." },
    });
  } catch (error) {
    logger.error('Win-back reason recording failed', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to record reason' },
    });
  }
});

// GET /api/winback/active
router.get('/active', async (req: Request, res: Response) => {
  try {
    const sequences = await prisma.mktWinBackSequence.findMany({
      where: { reactivatedAt: null },
      orderBy: { cancelledAt: 'desc' },
      take: 100,
    });

    res.json({ success: true, data: sequences });
  } catch (error) {
    logger.error('Failed to fetch active win-backs', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch win-backs' },
    });
  }
});

function getReasonSubject(reason: string): string {
  switch (reason) {
    case 'price':
      return "We'd love to keep you — here's a plan that works better";
    case 'features':
      return "We've been building — check out what's new";
    case 'time':
      return "We'll set it all up for you — free implementation session";
    case 'competitor':
      return 'An honest comparison for your evaluation';
    case 'business':
      return 'Pause your account free for up to 3 months';
    default:
      return 'We miss you at Nexara';
  }
}

export default router;
