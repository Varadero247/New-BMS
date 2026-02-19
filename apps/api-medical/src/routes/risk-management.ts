import { Router, Response } from 'express';
import type { Router as IRouter } from 'express';
import { prisma} from '../prisma';
import { authenticate, type AuthRequest } from '@ims/auth';
import { z } from 'zod';
import { createLogger } from '@ims/monitoring';
import { validateIdParam } from '@ims/shared';
import { checkOwnership, scopeToUser } from '@ims/service-auth';

const logger = createLogger('api-medical');

const router: IRouter = Router();
router.use(authenticate);
router.param('id', validateIdParam());
router.param('hazardId', validateIdParam('hazardId'));

// ============================================
// HELPERS
// ============================================

async function generateRMFRefNumber(): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const prefix = `RMF-${yy}${mm}`;

  const count = await prisma.riskManagementFile.count({
    where: { refNumber: { startsWith: prefix } },
  });

  return `${prefix}-${String(count + 1).padStart(4, '0')}`;
}

/**
 * Calculate risk level from 5x5 risk matrix (ISO 14971)
 * Risk = severity * probability
 *   <=4:  NEGLIGIBLE
 *   <=8:  LOW
 *   <=12: MEDIUM
 *   <=16: HIGH
 *   >16:  UNACCEPTABLE
 */
function calculateRiskLevel(severity: number, probability: number): string {
  const risk = severity * probability;
  if (risk <= 4) return 'NEGLIGIBLE';
  if (risk <= 8) return 'LOW';
  if (risk <= 12) return 'MEDIUM';
  if (risk <= 16) return 'HIGH';
  return 'UNACCEPTABLE';
}

// ============================================
// 1. POST / - Create Risk Management File
// ============================================
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const schema = z.object({
      title: z.string().trim().min(1).max(200),
      deviceName: z.string().trim().min(1).max(200),
      deviceClass: z.enum(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIA', 'CLASS_IIB']),
      intendedUse: z.string().trim().optional(),
      riskPolicy: z.string().trim().optional(),
    });

    const data = schema.parse(req.body);
    const refNumber = await generateRMFRefNumber();

    const rmf = await prisma.riskManagementFile.create({
      data: {
        refNumber,
        title: data.title,
        deviceName: data.deviceName,
        deviceClass: data.deviceClass,
        intendedUse: data.intendedUse,
        riskPolicy: data.riskPolicy,
        status: 'DRAFT' as any,
        createdBy: req.user?.id,
      },
    });

    res.status(201).json({ success: true, data: rmf });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create RMF error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create risk management file' },
    });
  }
});

// ============================================
// 2. GET / - List Risk Management Files
// ============================================
router.get('/', scopeToUser, async (req: AuthRequest, res: Response) => {
  try {
    const { page = '1', limit = '20', status, deviceName } = req.query;

    const pageNum = Math.min(10000, Math.max(1, parseInt(page as string, 10) || 1));
    const limitNum = Math.min(Math.max(1, parseInt(limit as string, 10) || 20), 100);
    const skip = (pageNum - 1) * limitNum;

    const where: any = { deletedAt: null };
    if (status) where.status = status as any;
    if (deviceName) {
      where.deviceName = { contains: deviceName as string, mode: 'insensitive' };
    }

    const [rmfs, total] = await Promise.all([
      prisma.riskManagementFile.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.riskManagementFile.count({ where }),
    ]);

    res.json({
      success: true,
      data: rmfs,
      meta: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    logger.error('List RMFs error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to list risk management files' },
    });
  }
});

// ============================================
// 3. GET /:id - Get RMF with hazards and controls
// ============================================
router.get(
  '/:id',
  checkOwnership(prisma.riskManagementFile),
  async (req: AuthRequest, res: Response) => {
    try {
      const rmf = await prisma.riskManagementFile.findUnique({
        where: { id: req.params.id },
        include: {
          hazards: {
            orderBy: { createdAt: 'asc' },
            include: {
              controls: { orderBy: { createdAt: 'asc' } },
            },
          },
        },
      });

      if (!rmf || rmf.deletedAt) {
        return res.status(404).json({
          success: false,
          error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
        });
      }

      res.json({ success: true, data: rmf });
    } catch (error) {
      logger.error('Get RMF error', { error: (error as Error).message });
      res.status(500).json({
        success: false,
        error: { code: 'INTERNAL_ERROR', message: 'Failed to get risk management file' },
      });
    }
  }
);

// ============================================
// 4. POST /:id/hazards - Add hazard identification
// ============================================
router.post('/:id/hazards', async (req: AuthRequest, res: Response) => {
  try {
    const rmf = await prisma.riskManagementFile.findUnique({ where: { id: req.params.id } });
    if (!rmf || rmf.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
      });
    }

    const schema = z.object({
      hazardCategory: z.enum([
        'ENERGY',
        'BIOLOGICAL',
        'ENVIRONMENTAL',
        'WRONG_OUTPUT',
        'USE_ERROR',
        'FUNCTIONALITY',
        'CHEMICAL',
        'ELECTROMAGNETIC',
        'RADIATION',
        'MECHANICAL',
        'THERMAL',
        'OTHER',
      ]),
      hazardDescription: z.string().trim().min(1).max(2000),
      hazardousSituation: z.string().trim().min(1).max(200),
      harm: z.string().trim().min(1).max(200),
      severityBefore: z.number().int().min(1).max(5),
      probabilityBefore: z.number().int().min(1).max(5),
    });

    const data = schema.parse(req.body);

    // Auto-generate hazardId: H-001 incrementing
    const existingCount = await prisma.hazard.count({
      where: { fileId: req.params.id } as any,
    });
    const hazardId = `H-${String(existingCount + 1).padStart(3, '0')}`;

    // Calculate initial risk level
    const riskLevelBefore = calculateRiskLevel(data.severityBefore, data.probabilityBefore);

    const hazard = await prisma.hazard.create({
      data: {
        fileId: req.params.id,
        hazardId,
        hazardCategory: data.hazardCategory as any,
        hazardDescription: data.hazardDescription,
        hazardousSituation: data.hazardousSituation,
        harm: data.harm,
        severityBefore: data.severityBefore,
        probabilityBefore: data.probabilityBefore,
        riskLevelBefore: riskLevelBefore as any,
      },
    });

    res.status(201).json({ success: true, data: hazard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Create hazard error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to create hazard' },
    });
  }
});

// ============================================
// 5. PUT /:id/hazards/:hazardId - Update hazard + manage controls
// ============================================
router.put('/:id/hazards/:hazardId', async (req: AuthRequest, res: Response) => {
  try {
    const rmf = await prisma.riskManagementFile.findUnique({ where: { id: req.params.id } });
    if (!rmf || rmf.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
      });
    }

    const hazard = await prisma.hazard.findUnique({ where: { id: req.params.hazardId } });
    if (!hazard || (hazard as any).fileId !== req.params.id) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Hazard not found in this risk management file' },
      });
    }

    const controlSchema = z.object({
      controlType: z.enum(['INHERENT_SAFETY', 'PROTECTIVE_MEASURE', 'INFORMATION_FOR_SAFETY']),
      description: z.string().trim().min(1).max(2000),
      implementationStatus: z
        .enum(['PLANNED', 'IN_PROGRESS', 'IMPLEMENTED', 'VERIFIED'])
        .optional() as any,
      verificationMethod: z.string().trim().optional(),
    });

    const schema = z.object({
      hazardDescription: z.string().trim().min(1).max(2000).optional(),
      hazardousSituation: z.string().trim().optional(),
      harm: z.string().trim().optional(),
      severityAfter: z.number().int().min(1).max(5).optional(),
      probabilityAfter: z.number().int().min(1).max(5).optional(),
      residualRiskAcceptable: z.boolean().optional(),
      notes: z.string().trim().optional(),
      controls: z.array(controlSchema).optional(),
    });

    const data = schema.parse(req.body);

    // Build hazard update data
    const updateData: Record<string, unknown> = {};
    if (data.hazardDescription !== undefined) updateData.hazardDescription = data.hazardDescription;
    if (data.hazardousSituation !== undefined)
      updateData.hazardousSituation = data.hazardousSituation;
    if (data.harm !== undefined) updateData.harm = data.harm;
    if (data.severityAfter !== undefined) updateData.severityAfter = data.severityAfter;
    if (data.probabilityAfter !== undefined) updateData.probabilityAfter = data.probabilityAfter;
    if (data.residualRiskAcceptable !== undefined)
      updateData.residualRiskAcceptable = data.residualRiskAcceptable;
    if (data.notes !== undefined) updateData.notes = data.notes;

    // Recalculate riskLevelAfter if severity/probability changed
    const severityAfter = data.severityAfter ?? hazard.severityAfter;
    const probabilityAfter = data.probabilityAfter ?? hazard.probabilityAfter;
    if (severityAfter !== null && probabilityAfter !== null) {
      updateData.riskLevelAfter = calculateRiskLevel(severityAfter, probabilityAfter);
    }

    // Create new risk controls if provided
    let _createdControls: Record<string, unknown>[] = [];
    if (data.controls && data.controls.length > 0) {
      _createdControls = await Promise.all(
        data.controls.map((control) =>
          prisma.riskControl.create({
            data: {
              hazardId: req.params.hazardId,
              controlType: control.controlType,
              description: control.description,
              implementationStatus: (control.implementationStatus || 'PLANNED') as any,
              verificationMethod: control.verificationMethod,
            },
          })
        )
      );
    }

    // Update the hazard
    const updatedHazard = await prisma.hazard.update({
      where: { id: req.params.hazardId },
      data: updateData,
      include: { controls: { orderBy: { createdAt: 'asc' } } },
    });

    res.json({ success: true, data: updatedHazard });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Update hazard error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to update hazard' },
    });
  }
});

// ============================================
// 6. POST /:id/benefit-risk - Submit benefit-risk analysis
// ============================================
router.post('/:id/benefit-risk', async (req: AuthRequest, res: Response) => {
  try {
    const rmf = await prisma.riskManagementFile.findUnique({ where: { id: req.params.id } });
    if (!rmf || rmf.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
      });
    }

    const schema = z.object({
      overallRiskAcceptable: z.boolean(),
      benefitRiskAcceptable: z.boolean(),
      benefitRiskAnalysis: z.string().trim().min(1).max(2000),
      reportSummary: z.string().trim().min(1).max(2000),
    });

    const data = schema.parse(req.body);

    const updatedRmf = await prisma.riskManagementFile.update({
      where: { id: req.params.id },
      data: {
        overallRiskAcceptable: data.overallRiskAcceptable,
        benefitRiskAcceptable: data.benefitRiskAcceptable,
        benefitRiskAnalysis: data.benefitRiskAnalysis,
        reportSummary: data.reportSummary,
      },
    });

    res.json({ success: true, data: updatedRmf });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input',
          fields: error.errors.map((e) => e.path.join('.')),
        },
      });
    }
    logger.error('Benefit-risk analysis error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to submit benefit-risk analysis' },
    });
  }
});

// ============================================
// 7. GET /:id/report - Full risk management report
// ============================================
router.get('/:id/report', async (req: AuthRequest, res: Response) => {
  try {
    const rmf = await prisma.riskManagementFile.findUnique({
      where: { id: req.params.id },
      include: {
        hazards: {
          orderBy: { createdAt: 'asc' },
          include: {
            controls: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });

    if (!rmf || rmf.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
      });
    }

    // Summary statistics
    const totalHazards = rmf.hazards.length;

    // Hazards by initial risk level
    const byRiskLevelBefore: Record<string, number> = {};
    rmf.hazards.forEach((h) => {
      byRiskLevelBefore[h.riskLevelBefore] = (byRiskLevelBefore[h.riskLevelBefore] || 0) + 1;
    });

    // Hazards by residual risk level
    const byRiskLevelAfter: Record<string, number> = {};
    rmf.hazards.forEach((h) => {
      if (h.riskLevelAfter) {
        byRiskLevelAfter[h.riskLevelAfter] = (byRiskLevelAfter[h.riskLevelAfter] || 0) + 1;
      }
    });

    // Controls statistics
    const allControls = rmf.hazards.flatMap((h) => h.controls);
    const controlsImplemented = allControls.filter(
      (c) => c.implementationStatus === 'IMPLEMENTED' || c.implementationStatus === 'VERIFIED'
    ).length;

    // Residual risk summary
    const acceptable = rmf.hazards.filter((h) => h.residualRiskAcceptable === true).length;
    const unacceptable = rmf.hazards.filter((h) => h.residualRiskAcceptable === false).length;
    const notEvaluated = rmf.hazards.filter((h) => h.residualRiskAcceptable === null).length;

    const summary = {
      totalHazards,
      byRiskLevelBefore,
      byRiskLevelAfter,
      totalControls: allControls.length,
      controlsImplemented,
      residualRisk: {
        acceptable,
        unacceptable,
        notEvaluated,
      },
    };

    res.json({
      success: true,
      data: {
        riskManagementFile: rmf,
        summary,
      },
    });
  } catch (error) {
    logger.error('Risk management report error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to generate risk management report' },
    });
  }
});

// ============================================
// 8. GET /:id/residual - Residual risk summary
// ============================================
router.get('/:id/residual', async (req: AuthRequest, res: Response) => {
  try {
    const rmf = await prisma.riskManagementFile.findUnique({
      where: { id: req.params.id },
      include: {
        hazards: true,
      },
    });

    if (!rmf || rmf.deletedAt) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Risk management file not found' },
      });
    }

    // Aggregate hazards by riskLevelAfter
    const byRiskLevelAfter: Record<string, number> = {};
    rmf.hazards.forEach((h) => {
      const level = h.riskLevelAfter || 'NOT_EVALUATED';
      byRiskLevelAfter[level] = (byRiskLevelAfter[level] || 0) + 1;
    });

    // Count acceptable vs unacceptable
    const acceptable = rmf.hazards.filter((h) => h.residualRiskAcceptable === true).length;
    const unacceptable = rmf.hazards.filter((h) => h.residualRiskAcceptable === false).length;
    const notEvaluated = rmf.hazards.filter((h) => h.residualRiskAcceptable === null).length;

    res.json({
      success: true,
      data: {
        riskManagementFileId: rmf.id,
        refNumber: rmf.refNumber,
        deviceName: rmf.deviceName,
        totalHazards: rmf.hazards.length,
        byRiskLevelAfter,
        residualRiskAcceptance: {
          acceptable,
          unacceptable,
          notEvaluated,
        },
        overallRiskAcceptable: rmf.overallRiskAcceptable,
        benefitRiskAcceptable: rmf.benefitRiskAcceptable,
      },
    });
  } catch (error) {
    logger.error('Residual risk summary error', { error: (error as Error).message });
    res.status(500).json({
      success: false,
      error: { code: 'INTERNAL_ERROR', message: 'Failed to get residual risk summary' },
    });
  }
});

export default router;
