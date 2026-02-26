// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import {
  createSession,
  getSession,
  chat,
  getSuggestedQuestions,
  cleanExpiredSessions,
  type OnboardingContext,
} from '@ims/nlq';

const router = Router();
const logger = createLogger('api-ai-analysis:onboarding-assistant');

function getUser(req: Request): { orgId: string; userId: string } {
  const user = (req as AuthRequest).user as Record<string, string> | undefined;
  return {
    orgId: user?.organisationId ?? user?.orgId ?? 'default',
    userId: user?.id ?? user?.userId ?? 'unknown',
  };
}

// All routes require authentication
router.use(authenticate);

// POST /api/ai/onboarding/sessions — start a new conversation session
router.post('/sessions', (req: Request, res: Response) => {
  cleanExpiredSessions();

  const bodySchema = z.object({
    standards: z.array(z.string()).optional(),
    enabledModules: z.array(z.string()).optional(),
    setupStage: z.string().optional(),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const { orgId, userId } = getUser(req);
  const context: OnboardingContext = {
    orgId,
    userId,
    standards: parsed.data.standards,
    enabledModules: parsed.data.enabledModules,
    setupStage: parsed.data.setupStage,
  };

  const session = createSession(context);
  logger.info('Onboarding assistant session created', { sessionId: session.sessionId, orgId });

  res.status(201).json({
    success: true,
    data: {
      sessionId: session.sessionId,
      expiresAt: new Date(session.createdAt.getTime() + 24 * 60 * 60 * 1000),
    },
  });
});

// GET /api/ai/onboarding/sessions/:sessionId — get session details
router.get('/sessions/:sessionId', (req: Request, res: Response) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const { orgId } = getUser(req);
  if (session.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  res.json({
    success: true,
    data: {
      sessionId: session.sessionId,
      messageCount: session.messages.length,
      context: session.context,
      createdAt: session.createdAt,
      lastActivity: session.lastActivity,
    },
  });
});

// POST /api/ai/onboarding/sessions/:sessionId/messages — send a message
router.post('/sessions/:sessionId/messages', async (req: Request, res: Response) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const { orgId } = getUser(req);
  if (session.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  const bodySchema = z.object({
    message: z.string().min(1).max(2000),
  });
  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  try {
    const response = await chat(req.params.sessionId, parsed.data.message);
    logger.info('Onboarding assistant message', { sessionId: req.params.sessionId, intent: response.intent });
    res.json({ success: true, data: response });
  } catch (err) {
    logger.error('Onboarding assistant error', { error: String(err) });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to process message' } });
  }
});

// GET /api/ai/onboarding/sessions/:sessionId/history — get conversation history
router.get('/sessions/:sessionId/history', (req: Request, res: Response) => {
  const session = getSession(req.params.sessionId);
  if (!session) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Session not found or expired' } });
  }

  const { orgId } = getUser(req);
  if (session.orgId !== orgId) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Access denied' } });
  }

  res.json({ success: true, data: { messages: session.messages } });
});

// GET /api/ai/onboarding/suggested-questions — get context-aware suggested questions
router.get('/suggested-questions', async (req: Request, res: Response) => {
  const querySchema = z.object({
    standards: z.string().optional(),
    setupStage: z.string().optional(),
    enabledModules: z.string().optional(),
  });
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: parsed.error.message } });
  }

  const { orgId, userId } = getUser(req);
  const context: OnboardingContext = {
    orgId,
    userId,
    standards: parsed.data.standards ? parsed.data.standards.split(',') : undefined,
    setupStage: parsed.data.setupStage,
    enabledModules: parsed.data.enabledModules ? parsed.data.enabledModules.split(',') : undefined,
  };

  const questions = await getSuggestedQuestions(context);
  res.json({ success: true, data: questions });
});

export default router;
