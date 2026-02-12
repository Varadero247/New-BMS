import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma } from '../prisma';
import { authenticate, requireRole, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { createLogger } from '@ims/monitoring';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-ai-analysis');

const router: IRouter = Router();

router.use(authenticate);

// GET /api/settings - Get AI settings
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const settings = await prisma.aISettings.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (!settings) {
      return res.json({
        success: true,
        data: {
          provider: null,
          model: null,
          hasApiKey: false,
          defaultPrompt: null,
          totalTokensUsed: 0,
          lastUsedAt: null,
        },
      });
    }

    // Mask API key
    res.json({
      success: true,
      data: {
        id: settings.id,
        provider: settings.provider,
        model: settings.model,
        hasApiKey: !!settings.apiKey,
        defaultPrompt: settings.defaultPrompt,
        totalTokensUsed: settings.totalTokensUsed,
        lastUsedAt: settings.lastUsedAt,
      },
    });
  } catch (error) {
    logger.error('Get AI settings error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get AI settings' },
    });
  }
});

// POST /api/settings - Create or update AI settings (Admin only)
router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      provider: z.enum(['OPENAI', 'ANTHROPIC', 'GROK']),
      apiKey: z.string().min(1),
      model: z.string().optional(),
      defaultPrompt: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Default models for each provider
    const defaultModels: Record<string, string> = {
      OPENAI: 'gpt-4',
      ANTHROPIC: 'claude-3-sonnet-20240229',
      GROK: 'grok-beta',
    };

    // Check if settings exist
    const existing = await prisma.aISettings.findFirst({
      where: { deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    let settings;

    if (existing) {
      settings = await prisma.aISettings.update({
        where: { id: existing.id },
        data: {
          provider: data.provider,
          apiKey: data.apiKey,
          model: data.model || defaultModels[data.provider],
          defaultPrompt: data.defaultPrompt,
        },
      });
    } else {
      settings = await prisma.aISettings.create({
        data: {
          id: uuidv4(),
          provider: data.provider,
          apiKey: data.apiKey,
          model: data.model || defaultModels[data.provider],
          defaultPrompt: data.defaultPrompt,
          totalTokensUsed: 0,
        },
      });
    }

    res.json({
      success: true,
      data: {
        id: settings.id,
        provider: settings.provider,
        model: settings.model,
        hasApiKey: true,
        defaultPrompt: settings.defaultPrompt,
        totalTokensUsed: settings.totalTokensUsed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fields = error.errors.map(e => e.path.join('.'));
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid input', fields },
      });
    }
    logger.error('Update AI settings error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update AI settings' },
    });
  }
});

// DELETE /api/settings - Delete AI settings (Admin only)
router.delete('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    await prisma.aISettings.deleteMany();

    res.status(204).send();
  } catch (error) {
    logger.error('Delete AI settings error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to delete AI settings' },
    });
  }
});

export default router;
