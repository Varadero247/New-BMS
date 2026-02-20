import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';

const logger = createLogger('api-food-safety');

const router = Router();
router.use(authenticate);
router.param('id', validateIdParam());

function mapCcpToStep(ccp: Record<string, unknown>, idx: number) {
  return {
    id: ccp.id,
    step: idx + 1,
    stepNumber: idx + 1,
    processStep: ccp.processStep,
    isCCP: true,
    hazards: (ccp.hazard as Record<string, unknown> | null)?.description || (ccp.hazardId ? `Hazard ${ccp.hazardId}` : null),
    controlMeasures: ccp.monitoringMethod,
    criticalLimit: ccp.criticalLimit,
    monitoringProcedure: ccp.monitoringMethod,
    correctiveAction: ccp.correctiveAction,
    verificationProcedure: ccp.verificationMethod,
    recordKeeping: ccp.recordKeeping,
    notes: null,
    status: (ccp.isActive as boolean) ? 'ACTIVE' : 'INACTIVE',
    createdAt: ccp.createdAt,
    updatedAt: ccp.updatedAt,
  };
}

async function generateCcpNumber(): Promise<string> {
  const count = await prisma.fsCcp.count();
  return `CCP-${String(count + 1).padStart(3, '0')}`;
}

// GET /api/haccp-flow
router.get('/', async (_req: Request, res: Response) => {
  try {
    const ccps = await prisma.fsCcp.findMany({
      where: { deletedAt: null },
      take: 200,
      include: { hazard: true },
      orderBy: { number: 'asc' },
    });

    const data = ccps.map((ccp, idx) => mapCcpToStep(ccp as unknown as Record<string, unknown>, idx));
    res.json({ success: true, data });
  } catch (error) {
    logger.error('Error fetching HACCP flow', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch HACCP flow' } });
  }
});

// GET /api/haccp-flow/:id
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const ccp = await prisma.fsCcp.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { hazard: true },
    });
    if (!ccp) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Step not found' } });
    res.json({ success: true, data: mapCcpToStep(ccp as unknown as Record<string, unknown>, 0) });
  } catch (error) {
    logger.error('Error fetching HACCP step', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch step' } });
  }
});

// POST /api/haccp-flow
router.post('/', async (req: Request, res: Response) => {
  try {
    const { processStep, isCCP, controlMeasures, criticalLimit, monitoringProcedure, correctiveAction, verificationProcedure, recordKeeping } = req.body;
    const user = (req as AuthRequest).user;

    const ccp = await prisma.fsCcp.create({
      data: {
        name: processStep || 'CCP Step',
        number: await generateCcpNumber(),
        processStep: processStep || 'Process Step',
        criticalLimit: criticalLimit || 'To be defined',
        monitoringMethod: controlMeasures || monitoringProcedure || 'To be defined',
        monitoringFrequency: 'PER_BATCH',
        correctiveAction: correctiveAction || null,
        verificationMethod: verificationProcedure || null,
        recordKeeping: recordKeeping || null,
        isActive: isCCP !== 'false' && isCCP !== false,
        createdBy: user?.email || user?.id || 'system',
      },
    });

    res.status(201).json({ success: true, data: mapCcpToStep(ccp as unknown as Record<string, unknown>, 0) });
  } catch (error) {
    logger.error('Error creating HACCP step', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create step' } });
  }
});

// PUT /api/haccp-flow/:id
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { processStep, isCCP, controlMeasures, criticalLimit, monitoringProcedure, correctiveAction, verificationProcedure, recordKeeping, status } = req.body;

    const updated = await prisma.fsCcp.update({
      where: { id: req.params.id },
      data: {
        ...(processStep && { processStep }),
        ...(criticalLimit && { criticalLimit }),
        ...(controlMeasures !== undefined && { monitoringMethod: controlMeasures }),
        ...(monitoringProcedure !== undefined && { monitoringMethod: monitoringProcedure }),
        ...(correctiveAction !== undefined && { correctiveAction }),
        ...(verificationProcedure !== undefined && { verificationMethod: verificationProcedure }),
        ...(recordKeeping !== undefined && { recordKeeping }),
        ...(isCCP !== undefined && { isActive: isCCP !== 'false' && isCCP !== false }),
        ...(status !== undefined && { isActive: status === 'ACTIVE' }),
      },
    });

    res.json({ success: true, data: mapCcpToStep(updated as unknown as Record<string, unknown>, 0) });
  } catch (error) {
    logger.error('Error updating HACCP step', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update step' } });
  }
});

// DELETE /api/haccp-flow/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    await prisma.fsCcp.update({ where: { id: req.params.id }, data: { deletedAt: new Date() } });
    res.json({ success: true, data: { id: req.params.id } });
  } catch (error) {
    logger.error('Error deleting HACCP step', { error: (error as Error).message });
    res.status(500).json({ success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to delete step' } });
  }
});

export default router;
