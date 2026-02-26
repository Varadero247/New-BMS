// Copyright (c) 2026 Nexara DMCC. All rights reserved.
// This file is part of the Nexara IMS Platform. CONFIDENTIAL — TRADE SECRET.
// Unauthorised copying, modification, or distribution is strictly prohibited.
import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { IsScopeStatus } from '@ims/database/infosec';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const scopeUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().trim().max(5000).optional(),
  boundaries: z.string().trim().max(5000).optional(),
  inclusions: z.string().trim().max(5000).optional(),
  exclusions: z.string().trim().max(5000).optional(),
  justification: z.string().trim().max(5000).optional(),
  interestedParties: z.array(z.string().trim()).optional(),
  applicableRequirements: z.array(z.string().trim()).optional(),
  interfaces: z.array(z.string().trim()).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'UNDER_REVIEW', 'ARCHIVED']).optional(),
});

// ---------------------------------------------------------------------------
// GET / — Get current ISMS scope
// ---------------------------------------------------------------------------
router.get('/', async (_req: Request, res: Response) => {
  try {
    const scope = await prisma.isScope.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!scope) {
      return res.json({ success: true, data: null });
    }

    res.json({ success: true, data: scope });
  } catch (error: unknown) {
    logger.error('Failed to get ISMS scope', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get ISMS scope' },
    });
  }
});

// ---------------------------------------------------------------------------
// PUT / — Update scope (upsert)
// ---------------------------------------------------------------------------
router.put('/', async (req: Request, res: Response) => {
  try {
    const parsed = scopeUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed' },
        details: parsed.error.flatten(),
      });
    }

    const authReq = req as AuthRequest;
    const existing = await prisma.isScope.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    let scope;
    if (existing) {
      scope = await prisma.isScope.update({
        where: { id: existing.id },
        data: {
          title: parsed.data.name || existing.title,
          description: parsed.data.description || existing.description,
          boundaries: parsed.data.boundaries || null,
          exclusions: parsed.data.exclusions || null,
          justifications: parsed.data.justification || null,
          status: (parsed.data.status || existing.status) as IsScopeStatus,
          updatedBy: authReq.user?.id,
          updatedAt: new Date(),
        },
      });
    } else {
      scope = await prisma.isScope.create({
        data: {
          title: parsed.data.name || 'ISMS Scope',
          description: parsed.data.description || '',
          boundaries: parsed.data.boundaries || null,
          exclusions: parsed.data.exclusions || null,
          justifications: parsed.data.justification || null,
          status: (parsed.data.status || 'DRAFT') as IsScopeStatus,
          createdBy: authReq.user?.id || 'system',
        },
      });
    }

    logger.info('ISMS scope updated', { scopeId: scope.id });
    res.json({ success: true, data: scope });
  } catch (error: unknown) {
    logger.error('Failed to update ISMS scope', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update ISMS scope' },
    });
  }
});

export default router;
