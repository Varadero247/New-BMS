import { Router, Request, Response } from 'express';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { prisma } from '../prisma';
import { z } from 'zod';

const logger = createLogger('api-infosec');
const router: Router = Router();
router.use(authenticate);

// ---------------------------------------------------------------------------
// Zod Schemas
// ---------------------------------------------------------------------------

const scopeUpdateSchema = z.object({
  name: z.string().trim().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
  boundaries: z.string().max(5000).optional(),
  inclusions: z.string().max(5000).optional(),
  exclusions: z.string().max(5000).optional(),
  justification: z.string().max(5000).optional(),
  interestedParties: z.array(z.string()).optional(),
  applicableRequirements: z.array(z.string()).optional(),
  interfaces: z.array(z.string()).optional(),
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
          ...parsed.data,
          updatedBy: authReq.user?.id || 'system',
          updatedAt: new Date(),
        } as any,
      });
    } else {
      scope = await prisma.isScope.create({
        data: {
          name: parsed.data.name || 'ISMS Scope',
          description: parsed.data.description || null,
          boundaries: parsed.data.boundaries || null,
          inclusions: parsed.data.inclusions || null,
          exclusions: parsed.data.exclusions || null,
          justification: parsed.data.justification || null,
          interestedParties: parsed.data.interestedParties || [],
          applicableRequirements: parsed.data.applicableRequirements || [],
          interfaces: parsed.data.interfaces || [],
          status: (parsed.data.status || 'DRAFT') as any,
          createdBy: authReq.user?.id || 'system',
        } as any,
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
