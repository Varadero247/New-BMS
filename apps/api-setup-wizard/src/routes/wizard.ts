import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { type AuthRequest } from '@ims/auth';
import { prisma } from '../prisma';

const logger = createLogger('api-setup-wizard:wizard');
const router = Router();

const WIZARD_STEPS = [
  { stepIndex: 0, title: 'ISO Standard Selection' },
  { stepIndex: 1, title: 'Document Seeding' },
  { stepIndex: 2, title: 'Team Invitation' },
  { stepIndex: 3, title: 'Pre-Audit Summary' },
];

const stepDataSchema = z.object({
  data: z.record(z.unknown()).optional().default({}),
});

// GET /api/wizard/status — check wizard status for current user's org
router.get('/status', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user as { id?: string; userId?: string; email?: string; organisationId?: string; orgId?: string };
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const wizard = await prisma.setupWizard.findUnique({
      where: { organisationId: user.organisationId || user.orgId || 'default' },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    });

    if (!wizard) {
      return res.json({
        success: true,
        data: { exists: false, status: null, currentStep: 0, steps: [] },
      });
    }

    res.json({
      success: true,
      data: {
        exists: true,
        id: wizard.id,
        status: wizard.status,
        currentStep: wizard.currentStep,
        completedAt: wizard.completedAt,
        steps: wizard.steps,
      },
    });
  } catch (error) {
    logger.error('Failed to get wizard status', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get wizard status' },
    });
  }
});

// POST /api/wizard/init — initialize a new wizard
router.post('/init', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user as { id?: string; userId?: string; email?: string; organisationId?: string; orgId?: string };
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const orgId = user.organisationId || user.orgId || 'default';

    // Check if wizard already exists
    const existing = await prisma.setupWizard.findUnique({
      where: { organisationId: orgId },
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        error: { code: 'ALREADY_EXISTS', message: 'Setup wizard already initialized' },
      });
    }

    const wizard = await prisma.setupWizard.create({
      data: {
        organisationId: orgId,
        userId: user.id || user.userId,
        steps: {
          create: WIZARD_STEPS.map((step) => ({
            stepIndex: step.stepIndex,
            title: step.title,
          })),
        },
      },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    });

    res.status(201).json({ success: true, data: wizard });
  } catch (error) {
    logger.error('Failed to initialize wizard', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to initialize wizard' },
    });
  }
});

// PATCH /api/wizard/step/:stepIndex — update a wizard step
router.patch('/step/:stepIndex', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user as { id?: string; userId?: string; email?: string; organisationId?: string; orgId?: string };
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const stepIndex = parseInt(req.params.stepIndex, 10);
    if (isNaN(stepIndex) || stepIndex < 0 || stepIndex > 3) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'Invalid step index (0-3)' },
      });
    }

    const parsed = stepDataSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: parsed.error.errors[0].message },
      });
    }

    const orgId = user.organisationId || user.orgId || 'default';
    const wizard = await prisma.setupWizard.findUnique({
      where: { organisationId: orgId },
    });

    if (!wizard) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wizard not found. Initialize first.' },
      });
    }

    if (wizard.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_COMPLETED', message: 'Wizard already completed' },
      });
    }

    const nextStep = Math.max(wizard.currentStep, stepIndex + 1);

    // Atomic: step completion and wizard progress advance together
    const [step] = await prisma.$transaction([
      prisma.setupWizardStep.update({
        where: {
          wizardId_stepIndex: { wizardId: wizard.id, stepIndex },
        },
        data: {
          status: 'COMPLETED',
          data: (parsed.data.data || {}) as Record<string, unknown>,
          completedAt: new Date(),
        },
      }),
      prisma.setupWizard.update({
        where: { id: wizard.id },
        data: { currentStep: Math.min(nextStep, 4) },
      }),
    ]);

    res.json({ success: true, data: step });
  } catch (error) {
    logger.error('Failed to update wizard step', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update wizard step' },
    });
  }
});

// POST /api/wizard/complete — mark the wizard as completed
router.post('/complete', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user as { id?: string; userId?: string; email?: string; organisationId?: string; orgId?: string };
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const orgId = user.organisationId || user.orgId || 'default';
    const wizard = await prisma.setupWizard.findUnique({
      where: { organisationId: orgId },
      include: { steps: true },
    });

    if (!wizard) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wizard not found' },
      });
    }

    if (wizard.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        error: { code: 'ALREADY_COMPLETED', message: 'Wizard already completed' },
      });
    }

    const updated = await prisma.setupWizard.update({
      where: { id: wizard.id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        currentStep: 4,
      },
      include: { steps: { orderBy: { stepIndex: 'asc' } } },
    });

    res.json({ success: true, data: updated });
  } catch (error) {
    logger.error('Failed to complete wizard', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to complete wizard' },
    });
  }
});

// POST /api/wizard/skip — skip the wizard entirely
router.post('/skip', async (req: Request, res: Response) => {
  try {
    const user = (req as AuthRequest).user as { id?: string; userId?: string; email?: string; organisationId?: string; orgId?: string };
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'UNAUTHORIZED', message: 'Not authenticated' },
      });
    }

    const orgId = user.organisationId || user.orgId || 'default';
    const existing = await prisma.setupWizard.findUnique({
      where: { organisationId: orgId },
    });

    if (existing && existing.status === 'COMPLETED') {
      return res.json({ success: true, data: existing });
    }

    if (existing) {
      const updated = await prisma.setupWizard.update({
        where: { id: existing.id },
        data: { status: 'SKIPPED', completedAt: new Date() },
      });
      return res.json({ success: true, data: updated });
    }

    const wizard = await prisma.setupWizard.create({
      data: {
        organisationId: orgId,
        userId: user.id || user.userId,
        status: 'SKIPPED',
        completedAt: new Date(),
        steps: {
          create: WIZARD_STEPS.map((step) => ({
            stepIndex: step.stepIndex,
            title: step.title,
            status: 'SKIPPED',
          })),
        },
      },
    });

    res.json({ success: true, data: wizard });
  } catch (error) {
    logger.error('Failed to skip wizard', { error: String(error) });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to skip wizard' },
    });
  }
});

export default router;
